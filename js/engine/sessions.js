/* One function per session type. Each takes the day (context + exercise kit + lifting blocks)
   and returns the list of steps, in order. This is where a session's shape is read. */
import { T, step, hold, reps, repeat, SL, circuit, collector } from "./steps.js";
import { arrive, wrists, catcow, downdog, child, sunA, sunB, standing, core, closing, shortClose, inversions } from "./yoga.js";
import { ginga, cocorinha, esquiva, esquivaBaixa, negativa, role, auPrep, au, queda, legSwings, meiaLua, queixada, armada } from "./capoeira.js";
import { wallBlock } from "./isometrics.js";
import { machineEasy, steady, ivFor, pelotonClass } from "./cardio.js";
import { stairPark } from "./stairs.js";
import { MNAME } from "../data/cardio.js";
import { fmtSecs } from "../util/format.js";

/* the cardio block on a gym lifting day: intervals on the machine whose turn it is, steady on the one
   you picked, or a Peloton class */
const gymWork = (d, easySecs, extra=0) =>
  d.ride ? pelotonClass(d.ride, d.o.ftp)
  : d.easyM ? steady(d.easyM, easySecs, "Easy cardio", `${MNAME(d.easyM)}, steady. Easy enough to talk in full sentences the whole way.`)
  : d.ivM ? ivFor(d.ivM, d.phase, d.G, extra) : null;

/* Flow + capoeira: between yoga and the full series. No dumbbells. */
export function mixSession(d){
  const {o, phase, R, G} = d, {out, add} = collector();
  const day=(o.mixN||0)%3;
  add(arrive(30), wrists(), catcow(), downdog(), sunA(2,null), phase>=2 && !R ? sunB(1) : null);
  add(ginga((R?60:phase>=3?180:120)+(G?60:0)));
  if (!R){
    if (day===0) add(cocorinha(), esquivaBaixa(), phase>=3 ? esquiva() : null);
    else if (day===1) add(legSwings(), meiaLua(), queixada(), phase>=3 ? armada() : null);
    else add(negativa(), role(), phase>=3 ? auPrep() : null);
    add(wallBlock(4, 60));
  }
  add(core(phase>=2?30:20, 15));
  add(R ? child() : inversions(Math.max(2,phase)).slice(0,2));
  add(shortClose());
  return out;
}

export function yogaSession(d){
  const {phase, R, second} = d, {out, add} = collector();
  add(arrive(second?30:60));
  if (!second && phase>=2) add(ginga(phase>=3?40:32));
  if (!second && phase>=3 && !R) add(cocorinha());
  add(wrists(), catcow(), downdog());
  add(sunA(second?2:(phase===1?4:phase===2?3:2), null), sunB(phase===1?0:(second?1:(phase>=3?2:1))));
  add(standing(phase>=2));
  if (!second) add(core(phase>=3?30:20, phase>=3?20:15));
  if (!R && !second) add(inversions(phase));
  if (R) add(child());
  add(closing(second || phase>=3, R, !second));
  return out;
}

export function strengthSession(d){
  const {phase, R, G, gym, second, mach, warmM, GR, GREST, homeStrength, gymStrength, homeFinisher, warmMachine, flush} = d, {out, add} = collector();
  if (R){
    if (mach) add(machineEasy(mach, 600, "Easy cardio", "Red day, no lifting. Zone 2: easy enough to talk in full sentences. This is the cholesterol work."));
    add(catcow(), downdog(), sunA(2,null), standing(false), child());
    add(closing(!gym, true, true));
    return out;
  }
  if (gym){
    add(warmM ? warmMachine(second?180:300) : [catcow(), downdog(), ...sunA(2,null)]);
    add(gymStrength(GR, GREST));
    const work=gymWork(d, 600); if (work) add(work, d.ride ? null : flush());   /* a class has its own cool-down */
  } else {
    add(second ? [downdog(), ...sunA(1,null), ginga(24)] : [catcow(), downdog(), ...sunA(2,null), phase>=2?ginga(32):null]);
    add(homeStrength(3, phase===1?30:40, true));
    if (phase>=2) add(homeFinisher(), wallBlock(2));
    if (phase>=2) add(core(G?30:20, 15));
  }
  add(shortClose());
  return out;
}

export function cardioSession(d){
  const {o, phase, R, G, gym, eq, avail, spin, pick, ivPool, ivM, EX, BW} = d, {out, add} = collector();
  /* Peloton: you ride a class; the app picks the kind, times it, and logs it */
  if (d.ride){ add(pelotonClass(d.ride, o.ftp), shortClose()); return out; }
  let m1=pick(0), m2=pick(1), m3=pick(2);
  /* you picked today's cardio: it leads */
  if (!gym && o.cMode && o.cMode!=="peloton" && avail.includes(o.cMode)){ m1=o.cMode; const rest=spin.filter(k=>k!==m1); m2=rest[0]||m1; m3=rest[1]||m2; }
  /* gym: rower bookends, the work happens on the machine whose turn it is */
  if (gym && eq.rower && ivPool.length){ m1="rower"; m2=ivM; m3="rower"; }
  if (d.easyM) m2=d.easyM;
  const hasBar = !!eq.bar;
  const FIN = SL("finish",
    hasBar && (sl=>reps("Pull-ups","hang","pullup",R?3:G?7:5,3.5,"strength","Dead hang, shoulders down, chin over the bar. Band or jump-and-lower if you run out.",{track:"Pull-ups",setup:8,chips:[sl]})),
    hasBar && (sl=>hold("Free hang","hang",G?45:35,"strength","Full dead hang. Let the shoulders stretch, grip relaxed but honest.",{track:"Free hang",chips:[sl]})),
    gym && eq.machines && (sl=>reps("Lat pulldown","latup","latdown",10,3,"strength","Chest up, pull to your collarbone. Pick a weight that leaves 2 to 3 reps in the tank.",{track:"Lat pulldown",setup:10,chips:[sl]})),
    (gym || o.dbOn) && EX.row(8),
    BW.pushups(12)
  );
  const finisher = () => (FIN.v.length ? circuit(R?1:2, 45, [FIN]) : []);

  if (!m1){ /* nothing ticked: conditioning on the floor */
    add(arrive(30), wrists(), catcow(), ...sunA(2,null), ginga(60));
    if (!R) for (let i=0;i<(G?4:3);i++) add(ginga(32), cocorinha(),
      reps("Air squats","mountain","squat",15,2,"cardio","Quick but controlled. Heels down.",{chips:[`Round ${i+1}`]}),
      step("Mountain climbers","cardio","Plank position, drive the knees in fast. Hips stay level.",repeat(16,()=>[T("plank",.7,"Drive"),T("chaturanga",.7,"Drive")]),{chips:[`Round ${i+1}`,"30s"]}),
      step("Breathe","cardio","Stand, hands on your head, nose breathing.",[T("mountain",G?30:45,"Recover")],{chips:[fmtSecs(G?30:45)]}));
    add(standing(false), finisher(), shortClose());
    return out;
  }

  /* the stair loop is its own shape */
  if (m1==="stairs" || (m2==="stairs" && !R)){
    if (R){
      add(machineEasy("run", 360, "Easy jog", "Out to the park. Conversational the whole way."));
      add(steady("run", 8*60, "Easy miles", "Red day. Flat ground only, skip the stairs, keep it easy."));
      add(machineEasy("run", 300, "Jog home", "Easy. Let the heart rate fall before you stop."));
    } else add(stairPark({phase, G, bikeTo:o.bikeTo, bikeHome:o.bikeHome, lapT:o.lapT, stairN:o.stairN, stations:o.stations, longDay:o.longDay, repeats:o.repeats}));
    add(finisher(), shortClose());
    return out;
  }

  /* mixed: warm up on one, work on the next, flush on a third */
  add(machineEasy(m1, R?300:480, "Warm-up", `${MNAME(m1)} first. Easy pace, nose breathing — you should be able to hold a conversation.`));
  if (R) add(steady(m2, 12*60, "Zone 2", `Move to the ${MNAME(m2).toLowerCase()}. Twelve minutes steady. If you can't speak a full sentence, back off.`));
  else if (d.easyM) add(steady(m2, (G?25:20)*60, "Easy cardio", `Move to the ${MNAME(m2).toLowerCase()}. Steady the whole way, easy enough to talk in full sentences.`));
  else {
    add(steady(m2, G?300:360, "Zone 2", `Switch to the ${MNAME(m2).toLowerCase()}. Steady, building.`));
    add(ivFor(m2, phase, G));
  }
  if (m3 && m3!==m1 && m3!==m2) add(machineEasy(m3, R?240:360, "Flush", `Last switch, onto the ${MNAME(m3).toLowerCase()}. Easy — let the heart rate come down.`));
  else add(machineEasy(m1, R?180:240, "Flush", "Back where you started. Easy, let the heart rate come down."));
  add(finisher(), shortClose());
  return out;
}

export function fullSession(d){
  return d.gym ? fullAtGym(d) : fullAtHome(d);
}
function fullAtGym(d){
  const {phase, R, G, second, mach, gymStrength, warmMachine} = d, {out, add} = collector();
  add(warmMachine(second?180:300), catcow(), downdog(), sunA(G?3:2,null), standing(false));
  if (!R){ add(gymStrength(phase>=4?3:2, phase>=3?45:60)); if (phase>=2) add(gymWork(d, 480, -1)); }
  else add(mach ? machineEasy(mach, 480, "Easy cardio", "Zone 2: easy enough to talk in full sentences.") : child());
  add(core(G?30:20, 15));
  add(closing(false, R, true));
  return out;
}
function fullAtHome(d){
  const {phase, R, G, second, homeStrength, homeFinisher} = d, {out, add} = collector();
  const cap = !second;
  if (phase===1){
    add(arrive(second?30:60), wrists(), catcow(), downdog(), sunA(G?4:3, R?null:{pushups:5,squats:5}), standing(false));
    if (!R) add(homeStrength(G?2:1, 30, false)); else add(child());
    add(closing(false, R, second));
  }
  if (phase===2){
    add(arrive(second?30:45), cap?ginga(60):null, wrists(), catcow(), downdog(), sunA(2, R?null:{pushups:8,squats:10}), sunB(1), standing(true));
    if (!R) add(homeStrength(3, 30, false), homeFinisher(), wallBlock(2));
    add(core(G?30:20, 15));
    add(R ? child() : inversions(2));
    add(closing(false, R, true));
  }
  if (phase===3){
    add(arrive(30));
    if (cap) add(ginga(48), cocorinha(), ...(R?[]:[esquiva(), ...negativa(), auPrep()]));
    add(wrists(), downdog(), sunA(G?3:2,null), sunB(2), standing(true));
    if (!R) add(homeStrength(3, 40, false), homeFinisher(), wallBlock(2));
    add(core(G?40:30, 20));
    add(R ? child() : inversions(3));
    add(closing(true, R, true));
  }
  if (phase===4){
    add(arrive(30));
    if (cap) add(ginga(48), ...(R?[cocorinha()]:[esquiva(), ...negativa(), au(), ...queda()]));
    add(wrists(), downdog(), sunA(G?3:2,null), sunB(2), standing(true));
    if (!R) add(homeStrength(3, 40, false), homeFinisher(), wallBlock(2));
    add(core(G?45:40, 30));
    add(R ? child() : inversions(4));
    add(closing(true, R, true));
  }
  return out;
}
