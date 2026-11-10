/* Everything the templates need to know about today, worked out once from the options.
   o = {phase, rec, type, loc, eq, dbOn, W, second, ab, homeAb, gymN, ...} */
import { ROTATION, HARD_GYM } from "../data/cardio.js";

export function makeContext(o){
  const {phase, rec, type, loc, second} = o, eq = o.eq||{}, W = o.W||{heavy:30,light:20,gymHeavy:40,gymLight:30};
  const G = rec==="green", R = rec==="red", X = G?2:0;
  const gym = loc==="gym", useDb = gym || o.dbOn;
  const wt = w => w>0 ? `${w} lb` : "";
  const dbo = (db, w, track) => ({db, weight: wt(w), track: gym ? track : track+" (home)", setup: gym ? 10 : 3});
  const avail = ROTATION[gym ? "gym" : "home"].filter(k=>eq[k]);
  const spin = avail.length ? avail.slice((o.ab||0)*2 % avail.length).concat(avail.slice(0,(o.ab||0)*2 % avail.length)) : [];
  const pick = i => spin.length ? spin[i % spin.length] : null;
  const mach = pick(0), mach2 = spin.length>1 ? pick(1) : mach;
  /* at the gym the rower warms up and flushes; the intervals rotate through the machines that reach zone 4-5,
     one per gym day. If none of those is ticked, any machine but the rower will do. */
  const hard = avail.filter(k=>HARD_GYM.includes(k));
  const ivPool = !gym ? avail : hard.length ? hard : avail.filter(k=>k!=="rower");
  const ivM = ivPool.length ? ivPool[(o.gymN||0) % ivPool.length] : mach2;
  /* an easy day at the gym: steady on the machine you picked, no intervals. o.easy = that machine. */
  const easyM = gym && o.easy ? (avail.includes(o.easy) ? o.easy : avail.find(k=>k!=="rower") || avail[0] || null) : null;
  /* today's cardio is a Peloton class: {kind, mins} */
  const ride = o.cMode==="peloton" && o.pel ? o.pel : null;
  const warmM = gym && eq.rower ? "rower" : mach;
  /* phase sets the lifting volume and density: rounds 3/3/3/4, rest 75/75/60/45 */
  const GR = phase>=4 ? 4 : 3, GREST = phase>=4 ? 45 : phase===3 ? 60 : 75;
  const H = gym ? (W.gymHeavy||0) : W.heavy, L = gym ? (W.gymLight||0) : W.light;
  /* gym rep scheme: heavier and lower as the phases go */
  const main=phase>=4?5:phase===3?6:8, r10=phase>=4?7:phase===3?8:10, r8=phase>=4?6:8;
  const HB = (o.homeAb||0) % 2; /* home alternates A and B, like the gym */
  /* TRX joins in Phase 3, when the moves get harder. Difficulty is foot position, not weight. */
  const trx = phase>=3 && gym && !!eq.trx, T4 = phase>=4 ? 2 : 0;  /* TRX lives at the gym */
  return {o, phase, rec, type, loc, second, eq, W, G, R, X, gym, useDb, wt, dbo, avail, spin, pick, mach, mach2,
    ivPool, ivM, easyM, ride, warmM, GR, GREST, H, L, main, r10, r8, HB, trx, T4};
}
