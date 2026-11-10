/* Start-up: load saved state, wire each part, draw the home screen. */
import { showing } from "./util/screens.js";
import { load } from "./store.js";
import { initSession } from "./player/session.js";
import { initControls } from "./player/controls.js";
import { initSheet } from "./player/sheet.js";
import { initSetSheet } from "./player/setSheet.js";
import { initCardioSheet } from "./player/cardioSheet.js";
import { applyLook } from "./ui/look.js";
import { initHome, renderHome } from "./ui/home.js";
import { initToday } from "./ui/today.js";
import { initCardioPick } from "./ui/cardioPick.js";
import { initStairs } from "./ui/stairsBox.js";
import { initWeights } from "./ui/weightsBox.js";
import { initPlan } from "./ui/plan.js";
import { initWeek } from "./ui/week.js";
import { initResume } from "./ui/resume.js";
import { initDone } from "./ui/done.js";
import { initSettings } from "./ui/settings.js";

load();
applyLook();
[initSession, initControls, initSheet, initSetSheet, initCardioSheet,
 initHome, initToday, initCardioPick, initStairs, initWeights, initPlan, initWeek, initResume, initDone, initSettings].forEach(init=>init());
renderHome();
window.__booted = true;   /* tells the boot guard in index.html that the app started */

/* The service worker holds one complete copy of the app per version. When a new one takes over,
   reload onto it, unless a session is running: then it waits for the next open. */
if ("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).catch(()=>{}));
  let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if (reloaded || showing("player")) return; reloaded=true; location.reload(); });
}
