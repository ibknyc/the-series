/* A short block for movement patterns the week has been missing (see progress/balance.js).
   It goes after the session's work and before its cool-down, and only covers what today's
   session doesn't already include. */
import { SL, circuit } from "./steps.js";
import { cooldown } from "./cooldown.js";
import { patternsOf, COUNTS } from "../data/patterns.js";

/* the patterns a list of steps already covers */
export function covered(steps){
  const have=new Set();
  steps.filter(s=>COUNTS.includes(s.block)).forEach(s=>patternsOf(s.name).forEach(p=>have.add(p)));
  return have;
}
function balanceBlock(d, need){
  const {GYM, HOME, EX, BW, plank, gym, eq, X} = d, cable = gym && (eq.machines || eq.aircable);
  const SLOTS = {
    singleleg: ()=>SL("bal-singleleg", gym && eq.bench && GYM.dbsplit, HOME.revlunge(8+X)),
    lateral:   ()=>SL("bal-lateral", HOME.latlunge(8+X), HOME.cossack(6)),
    core:      ()=>SL("bal-core", BW.sideplank(30), plank),
    rotation:  ()=>SL("bal-rotation", cable && GYM.woodchop, cable && GYM.pallof, EX.chop(10))
  };
  return circuit(2, 30, need.map(p=>SLOTS[p]()));
}
/* steps with the block added, and the cool-down rebuilt to include it. Sessions without a cool-down
   (yoga, which ends in its own closing) are left alone. */
export function addBalance(steps, d, wanted){
  if (!steps.some(s=>s.optional)) return steps;
  const work=steps.filter(s=>!s.optional), have=covered(work), need=wanted.filter(p=>!have.has(p));
  if (!need.length) return steps;
  const all=[...work, ...balanceBlock(d, need)];
  return [...all, ...cooldown(all, d)];
}
