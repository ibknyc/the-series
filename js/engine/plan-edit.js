/* Changing a session while it runs: reorder, swap, drop. Each takes the step list and where
   you are in it (i), and returns the new list. Nothing here touches the timer or the screen. */
import { tagUnit } from "./steps.js";

/* is step i the last step of its set? */
export const unitEnds = (steps, i) => { const s=steps[i]; return !!(s && s.unit && (!steps[i+1] || steps[i+1].unit!==s.unit)); };

/* the other exercises still to do in this round */
export function remainingUnitsInSet(steps, i){
  const cur=steps[i], units=[];
  for (let k=i+1;k<steps.length;k++){
    const s=steps[k];
    if (s.isRest || s.block!=="strength" || !s.unit) break;
    if (s.set===cur.set && !units.includes(s.unit)) units.push(s.unit);
  }
  return units;
}
export function moveUnitNext(steps, i, unit){
  const moving=steps.filter((s,k)=>k>i && s.unit===unit);
  const out=steps.filter((s,k)=>!(k>i && s.unit===unit));
  out.splice(i+1,0,...moving);
  return out;
}
/* stop lifting: drop every strength step from here to the next block */
export function withoutLifting(steps, i){
  const out=steps.slice(); let k=i+1;
  while (k<out.length && out[k].block==="strength") out.splice(k,1);
  return out;
}
/* drop an exercise's later sets, and any rests left back to back */
export function dropLater(steps, i, slot){
  return steps.filter((s,k)=>!(k>i && s.slot===slot))
    .filter((s,k,a)=>!(s.isRest && (a[k+1]?.isRest || a[k-1]?.isRest && k>i)));
}
/* skip an exercise entirely, including the set you're on. start = where to carry on from */
export function dropSlot(steps, cur){
  const start=steps.findIndex(s=>s.unit===cur.unit);
  const out=steps.filter((s,k)=>!(k>=start && s.slot===cur.slot))
    .filter((s,k,a)=>!(s.isRest && k>=start && (!a[k+1] || a[k+1].isRest || a[k+1].block!=="strength" || (a[k-1] && a[k-1].isRest))));
  return {steps:out, start};
}
/* do another exercise first, then come back to this one */
export function unitFirst(steps, cur, unit){
  const start=steps.findIndex(s=>s.unit===cur.unit);
  const mine=steps.filter(s=>s.unit===cur.unit), theirs=steps.filter(s=>s.unit===unit);
  const rest=steps.filter(s=>s.unit!==cur.unit && s.unit!==unit);
  rest.splice(start,0,...theirs,...mine);
  return {steps:rest, start};
}
/* swap a slot to another of its variants, for this set and every one after */
export function swapVariant(steps, i, slot, vi){
  const start=steps.findIndex(s=>s.unit===steps[i].unit), out=steps.slice(0,start), seen=new Set();
  for (let k=start;k<steps.length;k++){
    const s=steps[k];
    if (s.slot===slot){ if (!seen.has(s.unit)){ seen.add(s.unit); const from=s.swappedFrom||s.name;
      const nu=tagUnit(s.variants[vi](s.sl), {slot, v:s.variants, names:s.vnames}, vi, s.set, s.sets, s.sl);
      nu.forEach(x=>{ if (x.name!==from) x.swappedFrom=from; }); out.push(...nu); } }
    else out.push(s);
  }
  return {steps:out, start};
}
/* move every remaining block on one machine to another. A and B are the machines' entries in CARDIO. */
export function swapMachine(steps, i, from, to, A, B){
  for (let k=i;k<steps.length;k++){ const s=steps[k]; if (s.mach!==from) continue;
    s.seq=s.seq.map(q=>({...q, pose: q.pose===A.a?B.a : q.pose===A.b?B.b : q.pose}));
    s.chips=s.chips.map(c=>c===A.name?B.name:c);
    s.cue=s.cue.split(A.name).join(B.name).split(A.name.toLowerCase()).join(B.name.toLowerCase());
    if (!s.machFrom) s.machFrom=from; if (s.machFrom===to) delete s.machFrom; s.mach=to; }
}
