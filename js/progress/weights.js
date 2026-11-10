/* What weight to put on the bar: what you logged last time, what the last set told us to aim for,
   or, first time on a lift, an estimate from your other lifts. */
import { st, save } from "../store.js";

export const defW = s => parseFloat(s.weight)||0;
/* First time on a lift: estimate it from lifts you've already logged in the same pattern,
   so the starting number isn't arbitrary. Factors are relative to one anchor lift per pattern,
   set from your Oct 20 numbers (leg press 240, pulldown 110, DB bench 40s, DB RDL 40s).
   RIR then fine-tunes it from the first set. */
export const RATIO = {
  squat:{"Leg press":1,"Back squat":.5,"Smith squat":.45,"Goblet squat":.21,"Front-rack squat":.125,"Split squat":.1,"Bulgarian split squat":.085,"Reverse lunge":.1,"Walking lunge":.1,"Skater squat":.06,"Lateral lunge":.1,"Cossack squat":.06},
  push:{"Dumbbell bench press":1,"Dumbbell press":.9,"Incline dumbbell press":.8,"Single-arm press":.6,"Bench press":2,"Smith bench press":1.8,"Overhead press":1.3,"Smith overhead press":1.2},
  pull:{"Lat pulldown":1,"Seated cable row":1,"Dumbbell row":.35,"Single-arm row":.3,"Renegade row":.15,"Barbell row":.75,"Smith row":.7},
  hinge:{"Dumbbell RDL":1,"Barbell RDL":2,"Smith RDL":1.8,"Deadlift":2.5,"Single-leg RDL":.75,"B-stance RDL":.75,"Glute bridge":1.5,"Dumbbell hip thrust":1.5,"Leg curl":1.5,"Suitcase hold":1}
};
const STACK = /Leg press|Lat pulldown|cable row|Leg curl/;
export const homeInv = () => (st.homeInv && st.homeInv.length ? st.homeInv : [15,25,30]).slice().sort((a,b)=>a-b);
export function estW(track){
  if (!track) return 0;
  const home = / \(home\)$/.test(track), base = track.replace(/ \(home\)$/,"");
  const grp = Object.values(RATIO).find(g=>g[base]); if (!grp) return 0;
  const ests=[];
  Object.keys(grp).forEach(k=>{ if (k===base) return; const v = st.lifts[k] || st.lifts[k+" (home)"]; if (v>0) ests.push(v/grp[k]*grp[base]); });
  if (!ests.length) return 0;
  const raw = ests.reduce((a,b)=>a+b,0)/ests.length, step = STACK.test(base) ? 10 : 5;
  let w = Math.max(step, Math.round(raw/step)*step);
  if (home){ const inv=homeInv(); w = [...inv].reverse().find(x=>x<=w) || inv[0]; }
  return w;
}
export const curW = s => (s.track && (st.aim[s.track] || st.lifts[s.track] || estW(s.track))) || defW(s);
export const isEst = s => !!(s.track && !st.aim[s.track] && !st.lifts[s.track] && estW(s.track));
/* the smallest jump each kind of lift can make */
export const INC = k => /Back squat|Deadlift|Bench|Barbell|Overhead press|Leg press|Lat pulldown|cable row|Leg curl|Assisted/.test(k) ? 10 : 5;
export function logW(track, raw){ const v=parseFloat(raw); if (v>0){ st.lifts[track]=v; if (st.aim[track] && st.aim[track]!==v) delete st.aim[track]; } save(); }
