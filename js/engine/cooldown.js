/* The cool-down: built from the session it follows. It adds up which parts of the body took the
   most work, opens with a couple of easy moving stretches, then holds for the areas that worked
   hardest. Every step is optional: the player offers the cool-down and lets you finish without it. */
import { T, step, hold, sided, repeat } from "./steps.js";
import { AREA, MACH_AREAS, SLOT_AREAS, BLOCK_AREAS, MOVERS, HOLDS } from "../data/stretches.js";

const FALLBACK = ["hipflexors","hamstrings","spine"];   /* a session with nothing to read still gets something */

/* seconds of work per area, weighted by how much each kind of work loads it */
export function workLoad(steps){
  const load={};
  for (const s of steps){
    if (s.isRest || s.block==="close") continue;
    const areas = (s.mach && MACH_AREAS[s.mach]) || (s.mod && MACH_AREAS[s.mod]) || (s.slot && SLOT_AREAS[s.slot]) || BLOCK_AREAS[s.block];
    if (areas) areas.forEach((a,i)=>{ load[a]=(load[a]||0) + s.dur*(3-Math.min(i,2)); });
  }
  return load;
}
/* the areas to stretch, hardest-worked first */
export function topAreas(steps){
  const load=workLoad(steps), work=steps.reduce((a,s)=>a+(s.isRest?0:s.dur),0);
  const ranked=Object.keys(load).sort((a,b)=>load[b]-load[a]);
  return (ranked.length ? ranked : FALLBACK).slice(0, work>=40*60 ? 4 : 3);
}
const mover = m => {
  const build = (f,s) => step(m.name,"close",m.cue,repeat(m.n,()=>[T(m.a,m.t,m.la,f),T(m.b,m.t,m.lb,f)]),{flip:f,chips:[s,"Moving"],optional:true});
  return m.sided ? sided(build) : [build(false,null)];
};
const holder = (h, secs) => {
  const build = (f,s) => hold(h.name,h.pose,secs,"close",h.cue,{flip:f,chips:[s],optional:true});
  return h.sided ? sided(build) : [build(false,null)];
};
/* n rotates the choices, so two sessions that worked the same things don't get the same cool-down */
export function cooldown(steps, {R, o}){
  const areas=topAreas(steps), n=(o && o.coolN)||0, out=[], used=new Set();
  /* movers: the one that best covers the lead area, then one for whatever it left out */
  const covers = (m, as) => as.filter(a=>m.areas.includes(a)).length;
  const pickMover = as => { const c=MOVERS.filter(m=>!used.has(m.name) && m.areas.includes(as[0])).sort((a,b)=>covers(b,as)-covers(a,as)); return c.length ? c[n % Math.min(2,c.length)] : null; };
  const first=pickMover(areas); if (first){ used.add(first.name); out.push(...mover(first)); }
  const left=areas.filter(a=>!first || !first.areas.includes(a));
  const second = !R && left.length ? pickMover(left) : null; if (second){ used.add(second.name); out.push(...mover(second)); }
  /* holds: one for each area, longer on a red day */
  const secs = R ? 45 : 30;
  for (const a of areas){
    const c=HOLDS.filter(h=>h.areas[0]===a && !used.has(h.name)), h = c.length ? c[n % c.length] : HOLDS.find(x=>x.areas.includes(a) && !used.has(x.name));
    if (h){ used.add(h.name); out.push(...holder(h, secs)); }
  }
  out.push(hold("Savasana","savasana",R?90:45,"close","Flat on your back. Let the breath slow down on its own before you get up.",{optional:true}));
  out[0].coolFor = areas.map(a=>AREA[a]);
  return out;
}
