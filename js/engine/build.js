/* build(options) -> the session, as a flat list of steps. Pure: same options, same session. */
import { makeContext } from "./context.js";
import { exerciseKit } from "./exercises.js";
import { strengthBlocks } from "./strength.js";
import { mixSession, yogaSession, strengthSession, cardioSession, fullSession } from "./sessions.js";
import { addBalance } from "./balance.js";

const SESSIONS = {mix: mixSession, yoga: yogaSession, strength: strengthSession, cardio: cardioSession, full: fullSession};

/* o.balance: movement patterns to add a short block for, if today's session doesn't cover them */
export function build(o){
  const c = makeContext(o), kit = exerciseKit(c), d = {...c, ...kit, ...strengthBlocks(c, kit)};
  const steps = (SESSIONS[o.type] || fullSession)(d);
  return o.balance && o.balance.length && !c.R ? addBalance(steps, d, o.balance) : steps;
}
