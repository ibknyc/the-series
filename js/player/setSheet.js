/* After a lifted set: how many reps were left, what you used, and what's next. */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { st, save } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { BLOCKS } from "../data/catalog.js";
import { restStep } from "../engine/steps.js";
import { remainingUnitsInSet, moveUnitNext, withoutLifting, dropLater, roundsLeft } from "../engine/plan-edit.js";
import { curW, defW, logW } from "../progress/weights.js";
import { adviceFor, feelFor } from "../progress/advice.js";
import { touch } from "../log/entries.js";
import { setRow } from "../log/rows.js";
import { P } from "./state.js";
import { CUE, say } from "./audio.js";
import { retotal } from "./session.js";
import { sheetShow, sheetParts, nextBtn, confirmBtn, continueTo } from "./sheet.js";

/* the set on the sheet: {cur, rows, isReps, skipped, asked} */
let S = null;
const PLANNED_RIR = 2;   /* the plan is 2 to 3 reps in the tank */

/* Leaving the sheet: a lifted set needs its reps in reserve, since next time's weight comes from it.
   Ask once; tapping on again logs the plan. */
const ready = fn => function(){
  if (S && S.isReps && !S.skipped && S.rows.length && S.rows[0].RIR===""){
    if (!S.asked){ S.asked=true; $("shFeel").classList.add("ask");
      $("shAdvice").innerHTML=`How many reps were left? Tap a number, or tap your choice again to log <b>${PLANNED_RIR}</b>, the plan.`; return; }
    S.rows.forEach(r=>r.RIR=PLANNED_RIR); save();
  }
  fn.call(this);
};
/* "I didn't do this set": take its rows out of the log, or put them back */
function setSkipped(v){
  S.skipped=v;
  st.sets = st.sets.filter(r=>!(r.session_id===P.sid && r._u===S.cur.unit));
  if (!v && P.sid) st.sets.push(...S.rows);
  save();
  $("shRate").hidden=v; $("shNotNote").hidden=!v;
  $("shNotDone").textContent = v ? "Undo: I did this set" : "I didn't do this set";
}
const stopLifting = () => { P.steps=withoutLifting(P.steps, P.i); retotal(); continueTo(P.i+1); };

function renderNext(cur){
  $("shNext").innerHTML="";
  const units=remainingUnitsInSet(P.steps, P.i);
  $("shRestWrap").hidden = units.length===0;
  if (units.length){
    $("shNextH").textContent="What's next? Take whatever's free.";
    units.forEach((u,idx)=>{
      const first=P.steps.find((s,k)=>k>P.i && s.unit===u);
      nextBtn(first.name, idx===0?"Planned":"", idx===0, ready(()=>{
        P.steps=moveUnitNext(P.steps, P.i, u);
        if ($("shRest").checked) P.steps.splice(P.i+1,0,restStep(60));
        continueTo(P.i+1);
      }));
    });
    confirmBtn("I'm done lifting for today","Skip to what's after", ready(stopLifting));
  } else {
    const nx=P.steps[P.i+1];
    $("shNextH").textContent = nx && nx.isRest ? `Round done. ${roundsLeft(P.steps, P.i)} to go.` : "Lifting done.";
    if (nx && nx.isRest){
      nextBtn(/^Active rest: /.test(nx.name) ? `${nx.name.replace("Active rest: ","").replace(/^./,c=>c.toUpperCase())} ${fmtSecs(nx.dur)}, then next round` : `Rest ${fmtSecs(nx.dur)}, then next round`,"", true, ready(()=>continueTo(P.i+1)));
      nextBtn("Skip the rest, go now","", false, ready(()=>{ P.steps.splice(P.i+1,1); continueTo(P.i+1); }));
      confirmBtn("That's enough lifting today", "Skip remaining rounds", ready(stopLifting));
    } else {
      nextBtn(nx ? `On to ${BLOCKS[nx.block].name.toLowerCase()}` : "Finish", nx?nx.name:"", true, ready(()=>continueTo(P.i+1)));
    }
  }
  const later=P.steps.some((s,k)=>k>P.i && s.slot===cur.slot);
  const dropBtn=$("shDrop"); dropBtn.hidden=!later;
  dropBtn.textContent=`Drop ${cur.name.toLowerCase()} for the rest of today`;
  dropBtn.onclick=()=>{ P.steps=dropLater(P.steps, P.i, cur.slot); retotal(); renderNext(cur); };
}

function openSetSheet(){
  if (P.ending) return;   /* closing an interrupted session: sets nobody confirmed aren't logged */
  const cur=P.steps[P.i];
  sheetParts({rate:true}); $("shFeel").classList.remove("ask");
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
  /* a hold you end by tapping: the time from GO, not from "Get set" */
  const lead = cur.seq[0].label==="Get set" ? cur.seq[0].t : 0;
  const held = !isReps && cur.tapEnd ? Math.round(Math.max(0, Math.min(P.t, cur.dur) - lead)) : null;
  const rows = unitSteps.map(x=>{ const r=setRow(P, x, {amount: isReps ? x.reps : (held ?? x.secs), measure: isReps?"reps":"seconds",
    load: cur.track ? (st.lifts[cur.track]||"") : (defW(x)||"")}); r._u=cur.unit; return r; });
  if (P.sid){ st.sets.push(...rows); touch(P.sid); save(); }
  S = {cur, rows, isReps, skipped:false, asked:false};
  $("shRepsLab").textContent = isReps ? (unitSteps.length>1 ? "Reps per side" : "Reps done") : "Seconds held";
  /* nudge the count: a rep at a time, or 5 seconds for a hold */
  const nudge = isReps ? 1 : 5;
  $("shRepsDn").dataset.step=-nudge; $("shRepsDn").textContent=`−${nudge}`; $("shRepsDn").setAttribute("aria-label", isReps ? "One rep less" : "5 seconds less");
  $("shRepsUp").dataset.step=nudge;  $("shRepsUp").textContent=`+${nudge}`;  $("shRepsUp").setAttribute("aria-label", isReps ? "One rep more" : "5 seconds more");
  $("shNotDone").hidden=false; $("shNotDone").textContent="I didn't do this set"; $("shNotDone").onclick=()=>setSkipped(!S.skipped);
  /* Done tapped before rep 1 (lead, above): probably a skip, so say where the skip is */
  $("shRepsIn").value = isReps ? cur.reps : (held ?? cur.secs ?? "");
  $("shRepsIn").oninput = e=>{ const v=parseInt(e.target.value); rows.forEach(r=>r.reps_or_seconds = v>=0 ? v : ""); save(); };
  if (cur.track) $("shTrackIn").oninput=$("shTrackIn").onchange=e=>{ logW(cur.track, e.target.value); const v=parseFloat(e.target.value); rows.forEach(r=>r.load = v>0 ? v : ""); save(); if (P.feel) $("shAdvice").innerHTML=adviceFor(cur,P.feel); };
  const fe=$("shFeel"); fe.innerHTML="";
  [0,1,2,3,4].forEach(n=>{
    const b=document.createElement("button"); b.type="button"; b.textContent = n===4 ? "4+" : String(n); b.setAttribute("aria-pressed","false");
    b.setAttribute("aria-label", `${n===4?"4 or more":n} reps in reserve`);
    b.onclick=()=>{ fe.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); fe.classList.remove("ask");
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
  if (P.t < lead) $("shAdvice").innerHTML="Tapped before the set started. If you skipped it, tap <b>I didn't do this set</b>.";
  renderNext(cur);
  sheetShow(true); CUE.setEnd(); say("Set done. How many reps were left?");
}

export function initSetSheet(){
  on("player:set-done", openSetSheet);
}
