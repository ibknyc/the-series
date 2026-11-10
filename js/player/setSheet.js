/* After a lifted set: how many reps were left, what you used, and what's next. */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { st, save } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { BLOCKS } from "../data/catalog.js";
import { restStep } from "../engine/steps.js";
import { remainingUnitsInSet, moveUnitNext, withoutLifting, dropLater } from "../engine/plan-edit.js";
import { curW, defW, logW } from "../progress/weights.js";
import { adviceFor, feelFor } from "../progress/advice.js";
import { touch } from "../log/entries.js";
import { setRow } from "../log/rows.js";
import { P } from "./state.js";
import { CUE, say } from "./audio.js";
import { retotal } from "./session.js";
import { sheetShow, nextBtn, confirmBtn, continueTo } from "./sheet.js";

function stopLifting(){ P.steps=withoutLifting(P.steps, P.i); retotal(); continueTo(P.i+1); }

function renderNext(cur){
  $("shNext").innerHTML="";
  const units=remainingUnitsInSet(P.steps, P.i);
  $("shRestWrap").hidden = units.length===0;
  if (units.length){
    $("shNextH").textContent="What's next? Take whatever's free.";
    units.forEach((u,idx)=>{
      const first=P.steps.find((s,k)=>k>P.i && s.unit===u);
      nextBtn(first.name, idx===0?"Planned":"", idx===0, ()=>{
        P.steps=moveUnitNext(P.steps, P.i, u);
        if ($("shRest").checked) P.steps.splice(P.i+1,0,restStep(60));
        continueTo(P.i+1);
      });
    });
    confirmBtn("I'm done lifting for today","Skip to what's after", stopLifting);
  } else {
    const nx=P.steps[P.i+1];
    $("shNextH").textContent = nx && nx.isRest ? `Round done. ${cur.sets-cur.set} to go.` : "Lifting done.";
    if (nx && nx.isRest){
      nextBtn(/^Active rest: /.test(nx.name) ? `${nx.name.replace("Active rest: ","").replace(/^./,c=>c.toUpperCase())} ${fmtSecs(nx.dur)}, then next round` : `Rest ${fmtSecs(nx.dur)}, then next round`,"", true, ()=>continueTo(P.i+1));
      nextBtn("Skip the rest, go now","", false, ()=>{ P.steps.splice(P.i+1,1); continueTo(P.i+1); });
      confirmBtn("That's enough lifting today", "Skip remaining rounds", stopLifting);
    } else {
      nextBtn(nx ? `On to ${BLOCKS[nx.block].name.toLowerCase()}` : "Finish", nx?nx.name:"", true, ()=>continueTo(P.i+1));
    }
  }
  const later=P.steps.some((s,k)=>k>P.i && s.slot===cur.slot);
  const dropBtn=$("shDrop"); dropBtn.hidden=!later;
  dropBtn.textContent=`Drop ${cur.name.toLowerCase()} for the rest of today`;
  dropBtn.onclick=()=>{ P.steps=dropLater(P.steps, P.i, cur.slot); retotal(); renderNext(cur); };
}

function openSetSheet(){
  const cur=P.steps[P.i]; $("shCardio").hidden=true;
  $("shRate").hidden=false;
  $("shKick").textContent = cur.sl ? `${cur.sl} done` : "Set done";
  $("shTitle").textContent = cur.name;
  P.feel=null; $("shAdvice").innerHTML="";
  $("shTrack").hidden=!cur.track; $("shTrackU").textContent = cur.db==="AB" ? "lb each" : "lb";
  if (cur.track){
    /* whatever was in the field during the set counts as what you used */
    const used = parseFloat($("pTrackIn").value) || st.lifts[cur.track] || curW(cur);
    if (used>0){ st.lifts[cur.track]=used; save(); }
    $("shTrackIn").value = st.lifts[cur.track] || ""; }
  /* one row per step in this set (both sides of a single-arm move) */
  const unitSteps=P.steps.filter(x=>x.unit===cur.unit);
  st.sets = st.sets.filter(r=>!(r.session_id===P.sid && r._u===cur.unit));
  const isReps = !!cur.reps;
  const held = !isReps && cur.tapEnd ? Math.round(Math.min(P.t, cur.dur)) : null;
  const rows = unitSteps.map(x=>{ const r=setRow(P, x, {amount: isReps ? x.reps : (held ?? x.secs), measure: isReps?"reps":"seconds",
    load: cur.track ? (st.lifts[cur.track]||"") : (defW(x)||"")}); r._u=cur.unit; return r; });
  if (P.sid){ st.sets.push(...rows); touch(P.sid); save(); }
  $("shRepsLab").textContent = isReps ? (unitSteps.length>1 ? "Reps per side" : "Reps done") : "Seconds held";
  $("shRepsIn").value = isReps ? cur.reps : (held ?? cur.secs ?? "");
  $("shRepsIn").oninput = e=>{ const v=parseInt(e.target.value); rows.forEach(r=>r.reps_or_seconds = v>=0 ? v : ""); save(); };
  if (cur.track) $("shTrackIn").oninput=$("shTrackIn").onchange=e=>{ logW(cur.track, e.target.value); const v=parseFloat(e.target.value); rows.forEach(r=>r.load = v>0 ? v : ""); save(); if (P.feel) $("shAdvice").innerHTML=adviceFor(cur,P.feel); };
  const fe=$("shFeel"); fe.innerHTML="";
  [0,1,2,3,4].forEach(n=>{
    const b=document.createElement("button"); b.type="button"; b.textContent = n===4 ? "4+" : String(n); b.setAttribute("aria-pressed","false");
    b.setAttribute("aria-label", `${n===4?"4 or more":n} reps in reserve`);
    b.onclick=()=>{ fe.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
      /* a rating 3+ away from last set's at the same weight is probably a mis-tap: ask once */
      const prev=st.sets.filter(r=>r.session_id===P.sid && r.exercise===cur.name && r.set_no===(cur.set||1)-1 && r.RIR!=="").pop();
      const load=rows[0]&&rows[0].load;
      if (prev && Math.abs(prev.RIR-n)>=3 && String(prev.load)===String(load) && P.confirmRir!==n){
        P.confirmRir=n; $("shAdvice").innerHTML=`Last set was RIR ${prev.RIR===4?"4+":prev.RIR} at the same weight. <b>Tap ${n===4?"4+":n} again</b> if that's right.`;
        b.setAttribute("aria-pressed","false"); return; }
      P.confirmRir=null;
      rows.forEach(r=>r.RIR=n); save();
      const feel = feelFor(n, parseInt($("shRepsIn").value)||cur.reps||0, cur.reps); P.feel=feel; $("shAdvice").innerHTML=adviceFor(cur,feel); };
    fe.appendChild(b);
  });
  $("shRest").checked=false;
  renderNext(cur);
  sheetShow(true); CUE.setEnd(); say("Set done. How many reps were left?");
}

export function initSetSheet(){
  on("player:set-done", openSetSheet);
}
