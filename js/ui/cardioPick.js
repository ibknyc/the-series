/* Today's cardio, at home: let the rotation choose, or pick it. Peloton gets a class picker. */
import { $ } from "../util/dom.js";
import { today, daysSince } from "../util/time.js";
import { st, save, commit } from "../store.js";
import { CARDIO, PCLASS, PICK_ORDER } from "../data/cardio.js";
import { pelSuggest, pickClass } from "../progress/peloton.js";

const chip = (row, label, pressed, onPick) => { const b=document.createElement("button"); b.type="button"; b.textContent=label;
  b.setAttribute("aria-pressed",String(pressed)); b.onclick=onPick; row.appendChild(b); return b; };

export function renderCardioPick(){
  const box=$("cardBox"), show = st.type==="cardio" && st.loc==="home";
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
