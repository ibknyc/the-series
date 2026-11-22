/* End: under three minutes in, just leave. Otherwise ask whether it counts. */
import { P } from "./state.js";
import { finish, leaveWithoutLogging, minutesIn } from "./session.js";
import { sheetShow, sheetDismiss, sheetParts, sheetHead, clearNext, nextBtn } from "./sheet.js";

export function openExit(){
  if (P.workDone){ finish(); return; }   /* only the optional cool-down was left: the session is already logged */
  const mins=minutesIn();
  if (mins<3){ leaveWithoutLogging(); return; }
  P.run=false;
  sheetParts(); sheetHead("Ending early", `${mins} minutes so far`, "Log it?"); clearNext();
  nextBtn("Log it and finish", `${mins} min, counts toward the week`, true, ()=>{ sheetDismiss(); finish(true); });
  nextBtn("Keep going","", false, ()=>sheetShow(false));
  nextBtn("Leave without logging","", false, ()=>{ sheetDismiss(); leaveWithoutLogging(); });
  sheetShow(true);
}
