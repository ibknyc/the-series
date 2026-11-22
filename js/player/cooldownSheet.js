/* When the work is done: offer the cool-down, or finish without it. The session is logged as complete
   before this shows (player/session.js), so closing the app here loses nothing. */
import { on } from "../util/bus.js";
import { total } from "../engine/steps.js";
import { P } from "./state.js";
import { say } from "./audio.js";
import { finish } from "./session.js";
import { sheetShow, sheetDismiss, sheetParts, sheetHead, clearNext, nextBtn, continueTo } from "./sheet.js";

function offerCooldown(){
  const rest=P.steps.slice(P.i).filter(s=>s.optional), mins=Math.max(1, Math.round(total(rest)/60)), areas=P.steps[P.i].coolFor||[];
  const names=[...new Set(rest.map(s=>s.name))].filter(n=>n!=="Savasana");
  sheetParts(); clearNext();
  sheetHead("The work is done", `${mins}-minute cool-down`, areas.length ? `For your ${areas.join(", ")}` : "Optional");
  nextBtn("Stretch it out", `${names.length} stretches, skip any with Next`, true, ()=>continueTo(P.i));
  nextBtn("Finish here", "Your session is already logged as complete", false, ()=>{ sheetDismiss(); finish(); });
  sheetShow(true);
  say("The work is done. The cool-down is optional.");
}
export function initCooldownSheet(){
  on("player:cooldown-offered", offerCooldown);
}
