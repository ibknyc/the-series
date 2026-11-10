/* build(options) -> the session, as a flat list of steps. Pure: same options, same session. */
import { makeContext } from "./context.js";
import { exerciseKit } from "./exercises.js";
import { strengthBlocks } from "./strength.js";
import { mixSession, yogaSession, strengthSession, cardioSession, fullSession } from "./sessions.js";

const SESSIONS = {mix: mixSession, yoga: yogaSession, strength: strengthSession, cardio: cardioSession, full: fullSession};

export function build(o){
  const c = makeContext(o), kit = exerciseKit(c);
  return (SESSIONS[o.type] || fullSession)({...c, ...kit, ...strengthBlocks(c, kit)});
}
