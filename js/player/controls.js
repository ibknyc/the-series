/* The player's buttons and keys. */
import { $ } from "../util/dom.js";
import { showing } from "../util/screens.js";
import { st, save } from "../store.js";
import { addRound } from "../engine/cardio.js";
import { logW } from "../progress/weights.js";
import { P } from "./state.js";
import { hush } from "./audio.js";
import { showStep, renderSound } from "./view.js";
import { setRun, wake, advance, back, retotal } from "./session.js";
import { openSwap } from "./swapSheet.js";
import { openExit } from "./exitSheet.js";

/* one more round on the interval block you're in */
function plusRound(){
  const s=P.steps[P.i]; if (!s.ivl || !s.work) return;
  if (P.t>=s.dur) P.t=s.dur; /* in overtime: the extra round starts now */
  const r=addRound(s);
  retotal(); const t=P.t; showStep(); P.t=t; $("pPlus").textContent=`+1 round (${r})`;
}
export function initControls(){
  $("pPlay").onclick=()=>{ setRun(!P.run); if (P.run) wake(true); };
  $("pSkip").onclick=()=>advance();
  $("pPrev").onclick=()=>back();
  $("pPlus").onclick=plusRound;
  $("pSwap").onclick=()=>openSwap();
  $("pExit").onclick=()=>openExit();
  $("pSound").onclick=()=>{ st.sound=(st.sound+1)%3; save(); renderSound(); if (st.sound===2) hush(); };
  /* the weight field under the exercise name: whatever's in it is what you used */
  $("pTrackIn").oninput=$("pTrackIn").onchange=e=>{ const s=P.steps[P.i]; if (s && s.track) logW(s.track, e.target.value); };
  document.addEventListener("keydown",e=>{
    if (!showing("player") || P.sheet || e.target.tagName==="INPUT") return;
    if (e.code==="Space"){ e.preventDefault(); $("pPlay").click(); }
    else if (e.key==="ArrowRight") $("pSkip").click();
    else if (e.key==="ArrowLeft") $("pPrev").click();
    else if (e.key==="Escape") $("pExit").click();
  });
}
