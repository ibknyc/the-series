/* A session the phone killed mid-way: offer to pick it up, or log what was done. */
import { $ } from "../util/dom.js";
import { live, changed } from "../store.js";
import { closeInterrupted } from "../log/entries.js";
import { unlockAudio } from "../player/audio.js";
import { resume } from "../player/session.js";

export function renderResume(){
  const r=live.read(), box=$("resumeBox");
  box.hidden=!r; if (!r) return;
  const mins=Math.round((Date.now()-r.startedAt)/60000);
  $("resumeText").textContent=`Your session is still going: ${r.name}, ${mins} min since you started.`;
}
export function initResume(){
  $("resumeBtn").onclick=()=>{ const r=live.read(); if (r){ unlockAudio(); resume(r); } else renderResume(); };
  $("resumeEnd").onclick=()=>{ const r=live.read(); live.clear(); if (r) closeInterrupted(r); changed(); };
}
