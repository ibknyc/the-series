/* Cardio steps: easy and steady blocks, intervals, tapped laps, Peloton classes. */
import { T, step } from "./steps.js";
import { fmtSecs } from "../util/format.js";
import { CARDIO, MNAME, IVL, PCLASS, PZ_PCT } from "../data/cardio.js";

export function cardioSeq(m, secs, tempoMul, label, beepFirst){
  const C=CARDIO[m]||CARDIO.rower, tempo=C.tempo*tempoMul;
  const s=[]; let t=0, i=0;
  while (t < secs-0.01){ const d=Math.min(tempo/2, secs-t); s.push(T(i%2?C.b:C.a, d, label, false, beepFirst && i===0)); t+=d; i++; }
  return s;
}
export function machineEasy(m, secs, name, cue){ const s=step(name,"cardio",cue,cardioSeq(m,secs,1,"Easy pace"),{chips:[MNAME(m), fmtSecs(secs)]}); s.mach=m; s.zone="Z1"; return s; }
export function steady(m, secs, name, cue){ const s=step(name,"cardio",cue,cardioSeq(m,secs,.85,"Steady"),{chips:[MNAME(m), fmtSecs(secs)]}); s.mach=m; s.zone="Z2"; return s; }
export function intervals(m, rounds, work=30, easy=30){
  const seq=[];
  for(let i=1;i<=rounds;i++) seq.push(...cardioSeq(m,work,.5,`Round ${i} of ${rounds}: hard`,true), ...cardioSeq(m,easy,1,`Round ${i} of ${rounds}: easy`,true));
  const long = work>=60;
  const cue = long
    ? `${fmtSecs(work)} hard, ${fmtSecs(easy)} easy. Hard means a few words at a time. The first 30 seconds feel fine; the heart rate catches up in the second half, so hold the pace.`
    : `${work} seconds hard, ${easy} easy. Hard means you can't talk, not that your form falls apart.`;
  const s=step("Intervals","cardio",cue,seq,{chips:[MNAME(m), `${rounds} rounds`]}); s.mach=m; s.zone=long?"Z4":"Z4-5"; s.ivl=`${rounds}x${work}s/${easy}s`; Object.assign(s,{work, easy, rounds}); return s;
}
/* one more round on an interval block that's already running */
export function addRound(s){
  s.rounds++; const r=s.rounds;
  s.seq.push(...cardioSeq(s.mach,s.work,.5,`Round ${r}: hard`,true), ...cardioSeq(s.mach,s.easy,1,`Round ${r}: easy`,true));
  s.dur += s.work+s.easy; s.chimed=false; s.ivl=`${r}x${s.work}s/${s.easy}s`;
  s.chips = s.chips.map(c=>/rounds$/.test(c) ? `${r} rounds` : c);
  return r;
}
export function zoneWatts(ftp, zones){
  if (!ftp || !zones.length) return "";
  return "Your zones: " + zones.map(z=>{ const [a,b]=PZ_PCT[z]; return b>900 ? `Z${z} ${Math.round(ftp*a/100)}+ W` : `Z${z} ${Math.round(ftp*a/100)}–${Math.round(ftp*b/100)} W`; }).join(", ") + ".";
}
/* intervals shaped for the machine; rounds grow by phase, green adds one */
export function ivFor(m, phase, G, extra=0){
  const f=IVL[m]||IVL.gymbike, s=intervals(m, f.r[Math.min(3,Math.max(0,phase-1))]+(G?1:0)+extra, f.work, f.easy);
  if (f.cue) s.cue += " "+f.cue; return s;
}
/* a leg you finish by tapping. target = your last time on that leg, else a starting guess. */
export function lapStep(name, m, target, cue, done, o={}){
  /* a remembered time under 40% of the starting guess was a tap-through, not a lap */
  const lt = o.lapT && o.lapT[name], t = lt && lt >= target*0.4 ? lt : target;
  const s=step(name,"cardio",cue,cardioSeq(m,t,o.tempo||1,o.label||name),{chips:[...(o.chips||[]), `About ${fmtSecs(t)}`]});
  Object.assign(s,{lap:true, target:t, base:target, doneLabel:done, mod:m, zone:o.zone||"", noGap:!o.climb, climb:!!o.climb});
  return s;
}
/* Peloton: you ride a class; the app times it and logs it */
export function pelotonClass(pel, ftp){
  const k=PCLASS[pel.kind]||PCLASS.pz, mins=pel.mins||45;
  const s=step(`${k.name} ${mins}`,"cardio",k.cue+(ftp?` ${zoneWatts(ftp,k.zones)}`:""),cardioSeq("peloton",mins*60,k.tempo,k.label),{chips:["Peloton",`${mins} min`,k.zoneLab]});
  s.mach="peloton"; s.zone=k.zoneLab; s.pclass=pel.kind;
  return s;
}
