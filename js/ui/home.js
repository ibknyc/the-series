/* The home screen: each section draws itself from saved state. Any change redraws all of it. */
import { on } from "../util/bus.js";
import { show } from "../util/screens.js";
import { renderResume } from "./resume.js";
import { renderToday } from "./today.js";
import { renderCardioPick } from "./cardioPick.js";
import { renderStairs } from "./stairsBox.js";
import { renderWeights } from "./weightsBox.js";
import { renderPlan } from "./plan.js";
import { renderGates } from "./gates.js";
import { renderWeek } from "./week.js";
import { renderLook } from "./look.js";

export function renderHome(){
  renderResume();
  renderToday();
  try{ renderCardioPick(); }catch(e){ console.error(e); }
  renderStairs();
  renderWeights();
  renderPlan();
  renderGates();
  renderWeek();
  renderLook();
}
export function initHome(){
  on("state:changed", renderHome);
  on("session:left", ()=>{ show("home"); renderHome(); });
}
