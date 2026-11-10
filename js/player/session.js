/* The session as it runs: start, the clock, moving from step to step, logging what was done,
   surviving the phone freezing the app, and finishing. */
import { $ } from "../util/dom.js";
import { emit } from "../util/bus.js";
import { show, showing } from "../util/screens.js";
import { today, hhmm } from "../util/time.js";
import { st, save, live } from "../store.js";
import { total } from "../engine/steps.js";
import { unitEnds } from "../engine/plan-edit.js";
import { whoopFor } from "../engine/whoop.js";
import { sessionFor } from "../progress/today.js";
import { learnLap } from "../progress/laps.js";
import { newEntry, closeEntry, entryById, sortLog, touch, discard } from "../log/entries.js";
import { setRow, cardioRow } from "../log/rows.js";
import { P } from "./state.js";
import { CUE, say, hush } from "./audio.js";
import { setPose, snapPose, drawFigure } from "./figure.js";
import { lights, showStep, announce, renderSound } from "./view.js";

function subAt(step,t){ let c=0; for(let j=0;j<step.seq.length;j++){ c+=step.seq[j].t; if (t<c) return j; } return step.seq.length-1; }
export const retotal = () => { P.total = total(P.steps); P.lastSec=-1; };

/* ---------- logging ---------- */
/* steps that aren't lifted sets get logged when you move past them */
export function logLeaving(target){
  const s=P.steps[P.i];
  if (!P.sid || !s || s.logged || s.isRest || s.unit || target<=P.i) return;
  const actual = (s.lap || s.mach) ? P.t : Math.min(P.t, s.dur); if (actual<3) return;
  s.logged=true;
  if (s.mach || s.mod){
    P.lastCardio = cardioRow(P, s, actual);
    st.cardio.push(P.lastCardio);
    learnLap(s, actual);
  } else {
    const full = actual >= s.dur*0.8;
    st.sets.push(setRow(P, s, s.reps ? {amount: full ? s.reps : Math.round(s.reps*actual/s.dur), measure:"reps"} : {amount: Math.round(actual), measure:"seconds"}));
  }
  touch(P.sid); save();
}

/* ---------- moving through the steps ---------- */
/* a 3-2-1 before each exercise. Lifts already have it built into "Get set";
   rests don't need one, and back-to-back rounds of the same flow keep moving. */
const GAP = 3;
function needsGap(i){
  const s=P.steps[i], prev=P.steps[i-1];
  if (!s || s.isRest || s.noGap || s.seq[0].label==="Get set") return false;
  if (prev && prev.name===s.name && s.block==="flow") return false;
  return true;
}
export function go(i){ logLeaving(i); if (i>=P.steps.length){ finish(); return; } P.i=Math.max(0,i); P.t=0; P.lastCue=null; lights(null); showStep();
  P.gap = needsGap(P.i) ? GAP : 0;
  if (!P.steps[P.i].startedAt) P.steps[P.i].startedAt = Date.now();
  if (P.catching) return;
  $("pAway").hidden=true;
  if (!P.gap && !(P.steps[P.i].block==="strength"&&!P.steps[P.i].isRest)) CUE.step(); announce(); }
/* the step's time is up, or you tapped Done / Next. A finished set or machine block needs you first. */
export function advance(){ if (unitEnds(P.steps, P.i)) emit("player:set-done"); else if (P.steps[P.i].mach && !P.catching) emit("player:machine-done"); else go(P.i+1); }
export function back(){ if (P.t>3) go(P.i); else go(P.i-1); }

/* ---------- time away ---------- */
/* Time passed while the phone had the app frozen (another app, or the lock screen).
   Move the session forward by exactly that much, as if it had kept running.
   Tapped legs just keep counting. A finished set stops at its sheet, since that needs you. */
function catchUp(sec){
  const from=P.steps[P.i].name, away=sec; let moved=0;
  P.catching=true;
  while (sec>0.01){
    const cs=P.steps[P.i];
    if (P.gap>0){ const u=Math.min(P.gap,sec); P.gap-=u; sec-=u; continue; }
    if (cs.lap || (cs.mach && P.t+sec>=cs.dur)){ P.t+=sec; sec=0; break; }
    const left=cs.dur-P.t;
    if (sec<left){ P.t+=sec; sec=0; break; }
    sec-=left; P.t=cs.dur;
    if (unitEnds(P.steps, P.i)){ P.catching=false; emit("player:set-done"); break; }
    if (P.i+1>=P.steps.length){ P.catching=false; finish(); return; }
    go(P.i+1); moved++;
  }
  P.catching=false; P.sub=-1; P.lastSec=-1;
  const m=Math.floor(away/60), sx=Math.round(away%60), to=P.steps[P.i].name;
  $("pAway").textContent = `Away ${m}:${String(sx).padStart(2,"0")}. ` + (moved ? `Moved on from ${from} to ${to}.` : `Clock kept running.`);
  $("pAway").hidden=false;
  persist();
}
/* survive iOS killing the app: keep where we are, so it can pick back up */
function persist(){
  if (!P.sid || !showing("player")) return;
  P.savedAt=Date.now();
  live.write({sid:P.sid, i:P.i, t:P.t, gap:P.gap||0, name:P.steps[P.i].name, run:P.run && !P.sheet,
    at:Date.now(), type:P.type, loc:P.loc, rec:P.rec||st.rec, startedAt:P.startedAt});
}

/* ---------- the clock ---------- */
function frame(now){
  const wall=Date.now(), dt=P.lastWall ? (wall-P.lastWall)/1000 : 0; P.last=now; P.lastWall=wall;
  if (dt>1.5 && P.run && !P.sheet){ catchUp(dt); if (!showing("player")) return; }
  else if (wall-(P.savedAt||0)>3000) persist();
  if (P.run && !P.sheet){
    if (dt>1.5){ /* handled by catchUp */ }
    else if (P.gap>0){ P.gap-=dt; if (P.gap<=0){ P.gap=0; P.lastCue=null; CUE.go(); lights(-1); setTimeout(()=>lights(null), 650); } }
    else { const c0=P.steps[P.i]; P.t+=dt;
      if (c0.mach && !c0.lap){ if (P.t>=c0.dur && !c0.chimed){ c0.chimed=true; CUE.finish(); say("Time. Keep going, or tap Next."); $("pSkip").textContent="Next"; } }
      else if (!c0.lap && P.t>=c0.dur){ advance(); if (!showing("player")) return; } }
  }
  const cs=P.steps[P.i], over=cs.mach && P.t>=cs.dur, j=subAt(cs, (cs.lap||over) ? P.t % cs.dur : P.t);
  const slow = cs.block==="flow" || cs.block==="standing" || cs.block==="close" || cs.block==="arrive";
  if (j!==P.sub){
    const prev=P.sub; P.sub=j; const q=cs.seq[j]; setPose(q.pose);
    $("pSub").textContent = cs.seq.length>1 || q.label!=="Hold" ? q.label : "";
    if (q.b && prev!==-1 && P.run){ q.label.includes("hard") ? CUE.hard() : CUE.easy(); }
    /* every pose change in the flow gets a cue you can follow with your eyes shut */
    if (P.run && prev!==-1 && st.breath!==false && cs.seq.length>1 &&
        ["flow","standing","close","arrive","capoeira"].includes(cs.block)){
      const L=(q.label||"").toLowerCase();
      if (/inhale/.test(L)) CUE.inhale();
      else if (/exhale|lower down/.test(L)) CUE.exhale();
      else CUE.move();
    }
    /* lights out, GO — the moment the lead-in ends and rep 1 starts */
    if (P.run && prev===0 && j===1 && cs.block==="strength" && cs.seq[0].label==="Get set"){
      CUE.go(); lights(-1); P.lastCue=null; setTimeout(()=>lights(null), 650);
    }
  }
  const q=cs.seq[P.sub];
  drawFigure(now, q.flip, cs.db, cs.plate, slow);
  /* --- race start: count down the last 3s of the lead-in, GO on the first rep --- */
  const racing = P.gap>0 || (cs.block==="strength" && !cs.isRest && P.sub===0 && cs.seq[0].label==="Get set");
  const cdRem = P.gap>0 ? P.gap : racing ? cs.seq[0].t - P.t : 0;
  const rem = racing ? Math.max(1,Math.ceil(cdRem)) : cs.lap ? Math.floor(P.t) : over ? Math.floor(P.t-cs.dur) : Math.max(0,Math.ceil(cs.dur-P.t));
  if (racing && P.run){
    const n = Math.ceil(cdRem);
    if (n!==P.lastCue && n<=3 && n>=1){ P.lastCue=n; CUE.tick(); lights(n===3?2:n===2?4:5); }
    if (cdRem>3.05) lights(null);
  }

  if (rem!==P.lastSec || racing!==P.lastRacing){
    P.lastSec=rem; P.lastRacing=racing;
    $("pTime").classList.toggle("cd", racing);
    $("pTime").textContent = rem>=60 ? Math.floor(rem/60)+":"+String(rem%60).padStart(2,"0") : String(rem);
    if (P.run && rem<=3 && rem>0 && !racing && !cs.lap && !cs.isRest && cs.block!=="strength") CUE.hold();
    if (cs.lap && !racing) $("pTime").classList.toggle("over", P.t>cs.target);
    $("pTime").classList.toggle("ot", !!over);
    if (over) $("pTime").textContent = "+" + (rem>=60 ? Math.floor(rem/60)+":"+String(rem%60).padStart(2,"0") : String(rem));
    let el=0; for(let k=0;k<P.i;k++) el+=P.steps[k].dur; el+=P.t;
    $("pBar").style.width=(100*el/P.total).toFixed(2)+"%";
    $("pLeft").textContent=Math.max(0,Math.round((P.total-el)/60))+" min";
  }
  P.raf=requestAnimationFrame(frame);
}

/* ---------- start, stop, finish ---------- */
export function setRun(r){ P.run=r; $("pPlay").textContent=r?"Pause":"Resume"; if (!r){ lights(null); hush(); } }
export async function wake(on){ try{ if (on && "wakeLock" in navigator) P.lock=await navigator.wakeLock.request("screen"); else if (!on && P.lock){ await P.lock.release(); P.lock=null; } }catch(e){} }
function run(){ cancelAnimationFrame(P.raf); P.raf=requestAnimationFrame(frame); }

export function start(){
  P.steps=sessionFor(st.rec); P.whoop=whoopFor(st.type, st.loc, P.steps); P.total=total(P.steps); P.last=0; P.lastWall=0; P.type=st.type; P.loc=st.loc; P.rec=st.rec; P.startedAt=Date.now(); $("pAway").hidden=true;
  P.sid = newEntry({d:today(), start:hhmm(new Date()), end:"", m:0, done:"partial", live:true}).id;
  show("player");
  renderSound(); snapPose(P.steps[0].seq[0].pose);
  setRun(true); go(0); wake(true);
  run();
}
/* pick a session back up after the phone killed the app. r = its saved live state. */
export function resume(r){
  /* rebuild the same session: it has to be built as it was at the start, before this entry existed */
  const e=entryById(r.sid); st.log=st.log.filter(l=>l!==e);
  const keep={type:st.type, loc:st.loc}; st.type=r.type; st.loc=r.loc;
  P.steps=sessionFor(r.rec);
  st.type=keep.type; st.loc=keep.loc; st.log.push(e); sortLog();
  P.whoop=whoopFor(r.type, r.loc, P.steps);
  let i = P.steps[r.i] && P.steps[r.i].name===r.name ? r.i : P.steps.findIndex((x,k)=>k>=Math.max(0,r.i-6) && x.name===r.name);
  if (i<0) i=Math.min(r.i, P.steps.length-1);
  /* steps already done were logged when you left them; don't log them twice */
  P.steps.slice(0,i).forEach(x=>x.logged=true);
  P.total=total(P.steps); P.type=r.type; P.loc=r.loc; P.rec=r.rec; P.startedAt=r.startedAt; P.sid=r.sid; P.last=0; P.lastWall=0;
  show("player");
  renderSound(); snapPose(P.steps[i].seq[0].pose);
  P.catching=true; go(i); P.catching=false; P.t=r.t; P.gap=r.gap;
  setRun(true); wake(true);
  const away=(Date.now()-r.at)/1000;
  if (r.run && away>1.5) catchUp(away); else { $("pAway").textContent="Picked up where you left off."; $("pAway").hidden=false; }
  if (!r.run) setRun(false);
  run();
}
function stop(){ live.clear(); cancelAnimationFrame(P.raf); P.run=false; P.sheet=false; P.lastCue=null; lights(null); wake(false); hush(); emit("player:stopped"); }
export function finish(partial){
  logLeaving(Infinity); stop();
  const e=entryById(P.sid); if (e && P.whoop) e.whoop=P.whoop;
  const entry=closeEntry(P.sid, P.steps, P.startedAt, partial), mins=entry ? entry.m : Math.max(1, Math.round((Date.now()-P.startedAt)/60000));
  P.sid=null;
  emit("session:finished", {entry, partial, mins, type:P.type, whoop:P.whoop});
  CUE.finish(); say("Practice done.");
}
export function leaveWithoutLogging(){
  stop();
  if (P.sid){ discard(P.sid); P.sid=null; }
  emit("session:left");
}
export const minutesIn = () => Math.max(0, Math.round((Date.now()-P.startedAt)/60000));

export function initSession(){
  document.addEventListener("visibilitychange",()=>{ if (document.hidden) persist(); });
  window.addEventListener("pagehide", persist);
  document.addEventListener("visibilitychange",()=>{ if (!document.hidden && showing("player") && P.run) wake(true); });
}
