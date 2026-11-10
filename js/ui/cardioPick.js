/* Today's cardio. At home: let the rotation choose, or pick it; Peloton gets a class picker.
   At the gym: the hard intervals the rotation chose, or an easy day on a machine you pick. */
import { $ } from "../util/dom.js";
import { today, daysSince } from "../util/time.js";
import { st, save, commit } from "../store.js";
import { CARDIO, PCLASS, PICK_ORDER, MNAME } from "../data/cardio.js";
import { sessionFor, cardioAvailable } from "../progress/today.js";
import { hardShort, hardMinutes, HARD_GOAL } from "../progress/effort.js";
import { pelSuggest, pickClass } from "../progress/peloton.js";

const chip = (row, label, pressed, onPick) => { const b=document.createElement("button"); b.type="button"; b.textContent=label;
  b.setAttribute("aria-pressed",String(pressed)); b.onclick=onPick; row.appendChild(b); return b; };

const note = text => { $("cNote").hidden=!text; $("cNote").textContent=text||""; };

/* gym days with a cardio block: go hard on the machine whose turn it is, or take it easy */
function renderGymPick(){
  const box=$("cardBox"), easy = st.gymEasy===today(), av=cardioAvailable();
  const lifting = ["strength","full","cardio"].includes(st.type) && st.rec!=="red";
  const hard = lifting && !easy ? sessionFor(st.rec).find(s=>s.ivl && s.mach) : null;
  box.hidden = !(lifting && av.length && (easy || hard)); if (box.hidden) return;
  $("pelBox").hidden=true;
  const row=$("cModeRow"); row.innerHTML="";
  chip(row, hard ? `Hard: ${MNAME(hard.mach)}` : "Hard intervals", !easy, ()=>{ delete st.gymEasy; commit(); });
  chip(row, "Take it easy", easy, ()=>{ st.gymEasy=today(); commit(); });
  const er=$("cEasyRow"); er.hidden=!easy; er.innerHTML="";
  if (easy){
    const mine = av.includes(st.easyM) ? st.easyM : (av.find(k=>k!=="rower") || av[0]);
    av.forEach(k=>chip(er, MNAME(k), k===mine, ()=>{ st.easyM=k; commit(); }));
    note("Steady and conversational on the machine you pick, no intervals. Just for today." + (hardShort() ? ` You're at ${hardMinutes()} of ${HARD_GOAL} minutes in zone 4–5 this week, so make another day the hard one.` : ""));
  } else note(`Intervals on the ${MNAME(hard.mach).toLowerCase()}: the gym machines that get you to zone 4.` + (hardShort() ? ` ${hardMinutes()} of ${HARD_GOAL} minutes there so far this week.` : ""));
}
export function renderCardioPick(){
  const box=$("cardBox"), show = st.type==="cardio" && st.loc==="home";
  if (st.loc==="gym"){ renderGymPick(); return; }
  $("cEasyRow").hidden=true; note("");
  box.hidden=!show; if (!show) return;
  const av=PICK_ORDER.filter(k=>st.eq[k]);
  const row=$("cModeRow"); row.innerHTML="";
  [["","Rotate"],...av.map(k=>[k,CARDIO[k].name])].forEach(([k,n])=>
    chip(row, k==="peloton"?"Peloton class":n, (st.cMode||"")===k, ()=>{ st.cMode=k||null; commit(); }));
  const pb=$("pelBox"); pb.hidden = st.cMode!=="peloton"; if (pb.hidden) return;
  /* a pick holds for the day; tomorrow starts from a fresh suggestion */
  const sg=pelSuggest(); if (!st.pel || st.pelDay!==today()){ pickClass({kind:sg.kind, mins:sg.mins}); save(); }
  $("pelSug").innerHTML=`<b>Suggested: ${PCLASS[sg.kind].name} ${sg.mins}.</b> ${sg.why}`;
  const kr=$("pelKind"); kr.innerHTML="";
  Object.entries(PCLASS).forEach(([k,c])=>{
    const b=chip(kr, c.name, st.pel.kind===k, ()=>{ pickClass({kind:k, mins: k==="ftp"?20:st.pel.mins}); commit(); });
    if (k===sg.kind) b.classList.add("sug"); });
  const mr=$("pelMins"); mr.innerHTML="";
  (st.pel.kind==="ftp"?[20]:[20,30,45,60]).forEach(m=>
    chip(mr, `${m} min`, st.pel.mins===m, ()=>{ st.pel.mins=m; st.pelDay=today(); commit(); }));
  $("ftpIn").value=st.ftp||""; $("ftpDate").textContent = st.ftpDate ? `${st.ftpDate} (${daysSince(st.ftpDate)} days ago)` : "Never";
}
export function initCardioPick(){
  $("ftpIn").onchange=e=>{ const v=parseInt(e.target.value); if (v>50){ st.ftp=v; st.ftpDate=today(); } else { delete st.ftp; } commit(); };
}
