/* Today's cardio. At home: let the rotation choose, or pick it; Peloton gets a class picker.
   At the gym: the hard intervals the rotation chose, an easy day on a machine you pick, or a class
   on the gym's Peloton. */
import { $ } from "../util/dom.js";
import { today, daysSince } from "../util/time.js";
import { st, save, commit } from "../store.js";
import { CARDIO, PCLASS, PICK_ORDER, MNAME } from "../data/cardio.js";
import { sessionFor, cardioAvailable } from "../progress/today.js";
import { hardShort, hardMinutes, HARD_GOAL } from "../progress/effort.js";
import { pelSuggest, pickClass } from "../progress/peloton.js";
import { gymMode, setGymMode, gymCardioDay } from "../progress/cardioChoice.js";

const chip = (row, label, pressed, onPick) => { const b=document.createElement("button"); b.type="button"; b.textContent=label;
  b.setAttribute("aria-pressed",String(pressed)); b.onclick=onPick; row.appendChild(b); return b; };

const note = text => { $("cNote").hidden=!text; $("cNote").textContent=text||""; };

/* which class: the suggestion, then kind and length. A pick holds for the day; tomorrow starts fresh. */
function renderClassPicker(){
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
const zoneNote = lead => hardShort() ? ` ${lead}${hardMinutes()} of ${HARD_GOAL} minutes in zone 4–5 this week.` : "";

/* gym days that end in cardio: hard on the machine whose turn it is, easy on one you pick, or a Peloton class */
function renderGymPick(){
  const box=$("cardBox"), mode=gymMode(), av=cardioAvailable(), pelo=!!st.eq.gympel;
  const hard = gymCardioDay() && !mode ? sessionFor(st.rec).find(s=>s.ivl && s.mach) : null;
  box.hidden = !(gymCardioDay() && (pelo || (av.length && (mode || hard)))); if (box.hidden) return;
  const pick = m => () => { setGymMode(m); commit(); };
  const row=$("cModeRow"); row.innerHTML="";
  if (av.length){
    chip(row, hard ? `Hard: ${MNAME(hard.mach)}` : "Hard intervals", !mode, pick(null));
    chip(row, "Take it easy", mode==="easy", pick("easy"));
  }
  if (pelo) chip(row, "Peloton class", mode==="peloton", pick("peloton"));
  const er=$("cEasyRow"); er.hidden = mode!=="easy"; er.innerHTML="";
  $("pelBox").hidden = mode!=="peloton";
  if (mode==="peloton"){ renderClassPicker(); note(st.type==="cardio" ? "" : "The class takes the place of the intervals, after your lifting."); }
  else if (mode==="easy"){
    const mine = av.includes(st.easyM) ? st.easyM : (av.find(k=>k!=="rower") || av[0]);
    av.forEach(k=>chip(er, MNAME(k), k===mine, ()=>{ st.easyM=k; commit(); }));
    note("Steady and conversational on the machine you pick, no intervals. Just for today." + zoneNote("Make another day the hard one: you're at "));
  }
  else note(hard ? `Intervals on the ${MNAME(hard.mach).toLowerCase()}: the gym machines that get you to zone 4.` + zoneNote("So far: ") : "No intervals in this session." );
}
export function renderCardioPick(){
  if (st.loc==="gym"){ renderGymPick(); return; }
  const box=$("cardBox"), show = st.type==="cardio";
  $("cEasyRow").hidden=true; note("");
  box.hidden=!show; if (!show) return;
  const av=PICK_ORDER.filter(k=>st.eq[k]);
  const row=$("cModeRow"); row.innerHTML="";
  [["","Rotate"],...av.map(k=>[k,CARDIO[k].name])].forEach(([k,n])=>
    chip(row, k==="peloton"?"Peloton class":n, (st.cMode||"")===k, ()=>{ st.cMode=k||null; commit(); }));
  $("pelBox").hidden = st.cMode!=="peloton";
  if (st.cMode==="peloton") renderClassPicker();
}
export function initCardioPick(){
  $("ftpIn").onchange=e=>{ const v=parseInt(e.target.value); if (v>50){ st.ftp=v; st.ftpDate=today(); } else { delete st.ftp; } commit(); };
}
