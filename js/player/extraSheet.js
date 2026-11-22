/* Log an exercise the session didn't plan: extra hangs, woodchops, anything.
   Each set becomes a row like any other, marked added = y. Holds count toward their targets
   (an extra dead hang moves the hang target), and patterns toward the weekly balance. */
import { $ } from "../util/dom.js";
import { st, save } from "../store.js";
import { GUIDE } from "../data/guide.js";
import { touch } from "../log/entries.js";
import { setRow } from "../log/rows.js";
import { sheetShow, sheetDismiss, sheetParts, sheetHead, clearNext, nextBtn } from "./sheet.js";

const MEASURES = [["reps","Reps"],["seconds","Seconds"]];
const LOADS = [["bw","Bodyweight"],["AB","Dumbbells, each"],["B","One weight"],["stack","Machine or cable"]];
let X = null;   /* the form: {measure, load, rir} */

/* names to pick from: everything you've logged, and everything the app knows */
const knownNames = () => [...new Set([...st.sets.filter(r=>r.block==="main").map(r=>r.exercise), ...Object.keys(GUIDE)])].sort();
function chips(id, list, cur, pick){
  const row=$(id); row.innerHTML="";
  list.forEach(([k,label])=>{ const b=document.createElement("button"); b.type="button"; b.textContent=label;
    b.setAttribute("aria-pressed", String(k===cur)); b.onclick=()=>pick(k); row.appendChild(b); });
}
function paint(){
  chips("xMeasure", MEASURES, X.measure, k=>{ X.measure=k; paint(); });
  chips("xLoadType", LOADS, X.load, k=>{ X.load=k; paint(); });
  const reps = X.measure==="reps", nudge = reps ? 1 : 5;
  $("xAmtLab").textContent = reps ? "Reps" : "Seconds";
  $("xAmtDn").dataset.step=-nudge; $("xAmtDn").textContent=`−${nudge}`;
  $("xAmtUp").dataset.step=nudge;  $("xAmtUp").textContent=`+${nudge}`;
  $("xLoadWrap").hidden = X.load==="bw";
  $("xLoadU").textContent = X.load==="AB" ? "lb each" : "lb";
  $("xRirWrap").hidden = !reps;
  chips("xRir", [0,1,2,3,4].map(n=>[n, n===4?"4+":String(n)]), X.rir, k=>{ X.rir = X.rir===k ? "" : k; paint(); });
}
function logIt(sid){
  const name=$("xName").value.trim(), sets=Math.max(1, Math.min(10, parseInt($("xSets").value)||1));
  const amt=parseFloat($("xAmt").value), load=parseFloat($("xLoad").value);
  if (!name){ $("xNote").textContent="Name the exercise first."; $("xName").focus(); return false; }
  if (!(amt>0)){ $("xNote").textContent = X.measure==="reps" ? "How many reps?" : "How many seconds?"; $("xAmt").focus(); return false; }
  /* shaped like a step, so the row comes out the same as a planned set's */
  const like = {name, block:"strength", chips:[], db: X.load==="AB"||X.load==="B" ? X.load : "", track: X.load==="stack" ? name : "", startedAt:Date.now()};
  for (let i=1;i<=sets;i++){
    const r=setRow({sid, type:""}, {...like, set:i}, {amount:amt, measure:X.measure, load: X.load!=="bw" && load>0 ? load : "", rir: X.measure==="reps" ? X.rir : ""});
    Object.assign(r, {planned_load:"", planned_reps:"", stage:"", added:"y"}); st.sets.push(r);
  }
  touch(sid); save(); return true;
}
/* sid: the session to add to. inSession: the timer is underneath, so closing starts it again. */
export function openExtra(sid, inSession, after){
  if (!sid) return;
  X = {measure:"reps", load:"bw", rir:""};
  sheetParts({extra:true}); clearNext();
  sheetHead("Not in the plan", "Log an exercise", "");
  $("xNames").innerHTML = knownNames().map(n=>`<option value="${n.replace(/"/g,"&quot;")}"></option>`).join("");
  ["xName","xAmt","xLoad"].forEach(id=>{ $(id).value=""; }); $("xSets").value=1; $("xNote").textContent="";
  paint();
  const close = () => inSession ? sheetShow(false) : sheetDismiss();
  nextBtn("Log it", "", true, ()=>{ if (logIt(sid)){ close(); if (after) after(); } });
  nextBtn("Never mind", "", false, close);
  sheetShow(true);
}
