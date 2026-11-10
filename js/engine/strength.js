/* The lifting blocks: the home circuit, the gym circuit, and what goes around them.
   Which exercise fills which slot, and in what order, is decided here. */
import { T, step, reps, repeat, SL, circuit } from "./steps.js";
import { cardioSeq, machineEasy } from "./cardio.js";
import { deadHang } from "./isometrics.js";
import { fmtSecs } from "../util/format.js";

export function strengthBlocks(c, kit){
  const {o, phase, eq, G, R, X, gym, HB, r8, r10, trx, warmM} = c;
  const {EX, HOME, BW, TRX, GYM, bridge, birddog, plank} = kit;

  /* rest between rounds at home is active: it keeps the heart rate up instead of letting it fall back to 90 */
  function activeRest(i, secs){
    const t=Math.max(40, secs), opts=[
      ()=>step("Active rest: ginga","strength","Keep moving between rounds. Low, loose, guard up. Breathe through the nose.",repeat(Math.round(t/4),()=>[T("ginga",2,"Ginga"),T("ginga",2,"Ginga",true)]),{chips:[fmtSecs(t)]}),
      eq.rope && (()=>step("Active rest: jump rope","strength","Easy bounce, not a sprint. You should still be able to talk.",cardioSeq("rope",t,1.1,"Easy skip"),{chips:[fmtSecs(t)]})),
      ()=>step("Active rest: high knees","strength","Easy high knees in place, arms swinging. Light on the feet.",cardioSeq("run",t,1.3,"Easy"),{chips:[fmtSecs(t)]})
    ].filter(Boolean);
    const r=opts[(i+HB)%opts.length](); r.isRest=true; return r;
  }
  /* 30-second bursts to finish: this is where the heart rate climbs */
  function homeFinisher(){
    if (R) return [];
    const rounds=(phase<=2?2:3)+(G?1:0), out=[];
    const moves=[
      ()=>step("Finisher: skater hops","cardio","Side to side, land on one foot, stick it for a beat. Small hops count.",repeat(10,i=>[T("esquiva",1.5,"Hop",i%2===1)]),{chips:["30s"]}),
      ()=>step("Finisher: mountain climbers","cardio","Plank, drive the knees in fast. Hips level.",repeat(21,()=>[T("plank",.7,"Drive"),T("chaturanga",.7,"Drive")]),{chips:["30s"]}),
      ()=>phase>=3 ? reps("Finisher: squat jumps","mountain","squat",12,2.5,"cardio","Sit back, jump, land soft and quiet straight into the next one.",{chips:["30s"]})
                    : reps("Finisher: fast air squats","mountain","squat",15,2,"cardio","Quick but full depth. Heels down.",{chips:["30s"]}),
      ()=>step("Finisher: burpees","cardio","Chest to the floor, jump at the top. Step back instead of jumping if you need to.",repeat(6,()=>[T("plank",1.6,"Down"),T("chaturanga",1.6,"Down"),T("squat",1.6,"Up"),T("upsalute",.2,"Jump")]),{chips:["30s"]})
    ];
    for (let r=0;r<rounds;r++){
      const a=moves[(r*2+HB)%moves.length](), b=moves[(r*2+1+HB)%moves.length]();
      out.push(a, step("Breathe","cardio","Walk it off. Fifteen seconds.",[T("mountain",15,"Breathe")],{chips:["15s"]}), b,
        step("Breathe","cardio","Walk it off.",[T("mountain",r<rounds-1?30:15,"Breathe")],{chips:[fmtSecs(r<rounds-1?30:15)]}));
    }
    return out;
  }
  function homeStrength(sets, rest, extended){
    let list;
    const squat = n => SL("squat", EX.goblet(n), EX.split(Math.max(6,n-2)), BW.squat(n));
    /* single-leg ladder: reverse lunge (P2), Bulgarian split squat (P3), skater squat (P4) */
    const leg = n => SL("squat", phase>=4 ? HOME.skater(n-2) : phase===3 ? HOME.bss(n) : HOME.revlunge(n), phase>=3 ? HOME.walklunge(2*n) : HOME.bss(n), EX.goblet(n+2), BW.squat(n));
    const hingeSL = n => HB ? SL("hinge", HOME.bstance(n+2), HOME.slrdl(n), EX.rdl(n+2), bridge) : SL("hinge", HOME.slrdl(n), HOME.bstance(n+2), EX.rdl(n+2), bridge);
    const lateral = n => SL("lateral", phase>=3 ? HOME.cossack(n) : HOME.latlunge(n), phase>=3 ? HOME.latlunge(n) : HOME.cossack(Math.max(5,n-2)));
    const push  = n => SL("push", EX.press(n), BW.pushups(n));
    const pull  = n => SL("pull", EX.row(n), EX.renegade(Math.max(6,n-2)));
    if (phase===1) list = extended ? [squat(8+X), push(6+X), SL("bridge",bridge), SL("birddog",birddog), SL("plank",plank)] : [SL("bridge",bridge), SL("birddog",birddog), SL("plank",plank)];
    else if (phase===2) list = [leg(8+X), pull(10+X), push(10+X), hingeSL(8+X), lateral(8+X)];
    else if (phase===3) list = [leg(8+X), SL("overhead",EX.oh(8+X),BW.pike(Math.max(6,6+X))), SL("pull",EX.renegade(6+X),EX.row(10+X),BW.taps(10+X)), hingeSL(10+X), lateral(6+X)];
    else list = [leg(10+X), SL("overhead",EX.oh(10+X),BW.pike(8+X)), SL("pull",EX.renegade(8+X),EX.row(12+X),BW.taps(12+X)), hingeSL(12+X), lateral(8+X), ...(extended?[SL("squat2",EX.goblet(12+X),BW.squat(10+X))]:[])];
    /* B sessions start each slot one variant along (hinge handles its own order) */
    if (phase>=2) list.forEach(sl=>{ if (sl && sl.v && sl.v.length>1 && sl.slot!=="hinge" && sl.slot!=="squat2") sl.di = HB % sl.v.length; });
    return circuit(sets, rest, list, phase>=2 ? activeRest : null);
  }
  function gymStrength(sets, rest){
    const bb=eq.barbell, sm=eq.smith, mc=eq.machines, bn=eq.bench;
    const B = o.ab ? 1 : 0; /* which session of the pair */
    /* each slot lists its variants; B sessions start one variant along */
    /* Dumbbell moves need the bench area ticked, so a machines-only circuit never sends you off for a dumbbell.
       New variants go after the first two of a slot: those two are what Session A and B open with. */
    const ac=eq.aircable, firstOr = (slot, fallback, ...fs) => { const sl=SL(slot, ...fs); return sl.v.length ? sl : SL(slot, fallback); };
    const squat = firstOr("squat", BW.squat(r10+X), mc&&GYM.legpress, bn&&GYM.dbgoblet, bn&&GYM.dbsplit, trx&&TRX.pistol, sm&&GYM.smithsquat, bb&&GYM.backsquat);
    const pull  = SL("pull", trx&&TRX.row, mc&&GYM.pulldown, mc&&GYM.cablerow, mc&&GYM.assistpull, bn&&GYM.dbrow, sm&&GYM.smithrow, bb&&GYM.bbrow, EX.row(r8+X));
    const push  = SL("push", bn&&GYM.dbbench, trx&&TRX.push, bn&&GYM.dbincline, sm&&GYM.smithbench, bb&&GYM.bench, mc&&GYM.assistdip, BW.pushups(10+X));
    /* the glute bridge is the last resort: only when nothing else is ticked */
    const hinge = firstOr("hinge", bridge, bn&&GYM.dbrdl, bn&&GYM.dbslrdl, trx&&TRX.ham, sm&&GYM.smithrdl, bb&&(phase>=4?GYM.deadlift:GYM.bbrdl), mc&&GYM.legcurl, ac&&GYM.pullthrough, bn&&GYM.hipthrust);
    const over  = SL("overhead", trx&&TRX.y, sm&&GYM.smithohp, bb&&GYM.ohp, bn&&GYM.dbohp, BW.pike(r8+X));
    /* the fifth move: a lunge on B days when the dumbbells are there, otherwise a second pull */
    const accessory = phase>=3 ? over : (B && bn) ? SL("lunge", GYM.dbwalk, GYM.dbsplit, HOME.revlunge(r8+X)) : SL("pull2", mc&&GYM.cablerow, mc&&GYM.assistpull, bn&&GYM.dbrow, EX.renegade(6+X));
    /* dead hang closes each round when there's a bar: hold as long as you can, the seconds are the measure.
       Target = your best + 5s, capped at 90. */
    const hang = SL("hang", deadHang(o.hangT));
    const list = (B ? [hinge, pull, squat, push, accessory] : [squat, push, pull, hinge, accessory]).concat(trx ? [SL("core", TRX.tuck)] : []).concat(eq.bar ? [hang] : []);
    list.forEach(sl=>{ if (sl.v.length>1 && sl.slot!=="lunge") sl.di = B % sl.v.length; });
    /* don't run the same movement twice in one session */
    const taken=new Set();
    list.forEach(sl=>{
      let i=Math.min(sl.di||0, sl.v.length-1);
      for (let k=0;k<sl.v.length;k++){ const j=(i+k)%sl.v.length; if (!taken.has(sl.names[j])){ i=j; break; } }
      sl.di=i; taken.add(sl.names[i]);
    });
    return circuit(sets, rest, list);
  }
  const warmMachine = secs => warmM ? machineEasy(warmM, secs, "Warm-up", "Easy pace, nose breathing. You should be able to hold a conversation.") : null;
  const flush = () => gym && eq.rower ? machineEasy("rower", 180, "Flush", "Easy rowing. Let the heart rate come down before you stretch.") : null;
  return {homeStrength, gymStrength, homeFinisher, warmMachine, flush};
}
