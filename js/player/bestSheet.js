/* Steps that ask for a number instead of logging the time spent on them.
   Crow: the step is time to keep trying; what's logged is your best hold, in seconds, as "Crow". */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { st, save } from "../store.js";
import { GATES } from "../data/catalog.js";
import { holdBest } from "../progress/holds.js";
import { touch } from "../log/entries.js";
import { setRow } from "../log/rows.js";
import { P } from "./state.js";
import { CUE, say } from "./audio.js";
import { sheetShow, sheetParts, sheetHead, clearNext, nextBtn, continueTo } from "./sheet.js";

/* this phase's test for the hold, in seconds, if it has one ("Crow held 5 seconds") */
function testFor(name){
  const m=(GATES[st.phase]||[]).map(t=>t.match(new RegExp(`^${name} held (\\d+) seconds`))).find(Boolean);
  return m ? +m[1] : 0;
}
function openBest(){
  const s=P.steps[P.i], name=s.logAs||s.name, best=holdBest(name), test=testFor(name);
  sheetParts({best:true}); clearNext();
  sheetHead(`${s.name} done`, "Your best hold", "");
  $("shBestIn").value="";
  $("shBestNote").textContent = [best ? `Best so far: ${best} s.` : "", test ? `Phase ${st.phase} test: ${test} s.` : ""].filter(Boolean).join(" ");
  const done = () => { s.logged=true; continueTo(P.i+1); };
  const log = secs => { if (P.sid){ st.sets.push(setRow(P, {...s, name}, {amount:secs, measure:"seconds"})); touch(P.sid); save(); } done(); };
  nextBtn("Log it", "", true, ()=>{
    const v=parseFloat($("shBestIn").value);
    if (!(v>=0)){ $("shBestNote").textContent="Type your best hold in seconds, or pick one of the options below."; $("shBestIn").focus(); return; }
    log(Math.round(v*10)/10); });
  nextBtn("Feet never left the floor", "Logs 0 seconds", false, ()=>log(0));
  nextBtn("Didn't try today", "Nothing logged", false, done);
  sheetShow(true); CUE.setEnd(); say("What was your best hold?");
}
export function initBestSheet(){
  on("player:ask-best", openBest);
}
