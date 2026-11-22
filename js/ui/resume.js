/* A session the phone killed mid-way: offer to pick it up, or log what was done. */
import { $ } from "../util/dom.js";
import { live } from "../store.js";
import { unlockAudio } from "../player/audio.js";
import { resume, endInterrupted } from "../player/session.js";

export function renderResume(){
  const r=live.read(), box=$("resumeBox");
  box.hidden=!r; if (!r) return;
  const mins=Math.round((Date.now()-r.startedAt)/60000);
  $("resumeText").textContent=`Your session is still going: ${r.name}, ${mins} min since you started.`;
}
export function initResume(){
  $("resumeBtn").onclick=()=>{ const r=live.read(); if (r){ unlockAudio(); resume(r); } else renderResume(); };
  /* rebuild it, move it on by the time away, and finish: the done screen shows what was logged */
  $("resumeEnd").onclick=()=>{ const r=live.read(); if (r) endInterrupted(r); else renderResume(); };
}
