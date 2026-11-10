/* The building blocks of a session. A session is a flat list of steps; a step is a named
   sequence of timed poses. Nothing here knows about the screen or about saved data. */
import { fmtSecs } from "../util/format.js";

export const T = (pose, t, label, flip=false, b=false) => ({pose, t, label, flip, b});
export const clean = a => a.filter(Boolean);
export function step(name, block, cue, seq, o={}) {
  return { name, block, cue, seq, dur: seq.reduce((a,s)=>a+s.t,0), db:o.db||"", plate:o.plate||"", chips:clean(o.chips||[]), weight:o.weight||"", track:o.track||"" };
}
export function hold(name, pose, secs, block, cue, o={}) {
  /* strength holds get the same lead-in as a lifted set: time to get into
     position, counted down, so the hold starts on the GO */
  const lead = block==="strength" ? [T(pose, o.setup||3, "Get set", o.flip)] : [];
  const r = step(name, block, cue, [...lead, T(pose, secs, o.label||"Hold", o.flip)], {...o, chips:[...(o.chips||[]), fmtSecs(secs)]}); r.secs=secs; return r;
}
export function reps(name, a, b, n, tempo, block, cue, o={}) {
  const f = !!o.flip, seq = [T(a, o.setup||3, "Get set", f)];
  for (let i=1;i<=n;i++){ seq.push(T(b, tempo/2, `Rep ${i} of ${n}`, f), T(a, tempo/2, `Rep ${i} of ${n}`, f)); }
  const r = step(name, block, cue, seq, {...o, chips:[`${n} reps`, ...(o.chips||[])]}); r.reps=n; return r;
}
export function sided(make){ return [make(false,"Right side"), make(true,"Left side")]; }
export function repeat(n, fn){ const o=[]; for(let i=0;i<n;i++) o.push(...fn(i)); return o; }

export function restStep(secs){ const r=step("Rest","strength","Shake it out. Sip water. Next set is coming.",[T("mountain",secs,"Rest")],{chips:[fmtSecs(secs)]}); r.isRest=true; return r; }
/* a slot = one movement pattern with interchangeable variants (first = default) */
export function SL(slot, ...fs){
  const v=[], names=[];
  fs.filter(Boolean).forEach(f=>{ const n=[].concat(f(""))[0].name; if (!names.includes(n)){ names.push(n); v.push(f); } });
  return {slot, v, names};
}
export function tagUnit(r, o, vi, set, sets, sl){
  const arr=[].concat(r), unit=`${o.slot}#${set}`;
  arr.forEach(x=>Object.assign(x,{slot:o.slot, variants:o.v, vnames:o.names, vi, set, sets, sl, unit}));
  return arr;
}
export function circuit(sets, restSecs, slots, restFn){
  const out=[];
  slots = slots.map((x,i)=> typeof x==="function" ? {slot:"x"+i, v:[x], names:[[].concat(x(""))[0].name]} : x).filter(o=>o && o.v && o.v.length);
  for(let s=1;s<=sets;s++){
    const sl = sets>1 ? `Set ${s} of ${sets}` : "";
    slots.forEach(o=>{ const vi=Math.min(o.di||0, o.v.length-1); out.push(...tagUnit(o.v[vi](sl), o, vi, s, sets, sl)); });
    if (s<sets) out.push(restFn ? restFn(s, restSecs) : restStep(restSecs));
  }
  return out;
}

/* collects steps for a template: add() takes steps, arrays of steps, and ignores blanks */
export function collector(){
  const out=[];
  const add = (...a)=>a.forEach(x=>Array.isArray(x)?out.push(...x.filter(Boolean)):x&&out.push(x));
  return {out, add};
}
export const total = steps => steps.reduce((a,s)=>a+s.dur,0);
