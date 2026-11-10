/* The Prospect Park stair route. The route itself (which stairs, how far apart) is in data/cardio.js. */
import { reps, sided } from "./steps.js";
import { lapStep } from "./cardio.js";
import { ginga, cocorinha, esquiva, negativa } from "./capoeira.js";
import { STAIRS } from "../data/cardio.js";

export function stairPark(o){
  const ph=o.phase, T=o.lapT||{}, out=[], b=Math.min(3,o.stairN||0)*2, X=o.G?2:0, mv=o.stations!==false;
  const L=(n,m,t,c,d,x={})=>lapStep(n,m,t,c,d,{...x,lapT:T});
  /* climbs are 25-85 seconds: the heart rate peaks at the top, so Z3-4 is the honest target */
  const climb=(n,t,chip,cue)=>L(n,"stairs",t,cue,"At the top",{climb:true, zone:"Z3-4", tempo:.5, label:"Climb", chips:[chip]});
  /* which big stairs, in order; the small stairs go between each pair.
     One loop = back, back again, hidden. The back stairs are the only climb long enough to
     reach zone 4, so they go twice. Front opens the run and sits between loops.
     Phase 1: front, back, front. Then 1, 2 and 3 loops; a long day adds one. */
  const loops = ph===1 ? 1 : ph-1 + (o.longDay ? 1 : 0);
  const order = ph===1 && !o.longDay ? ["front","back","front"]
    : ["front", ...Array.from({length:loops}, (_,i)=>[...(i?["front"]:[]),"back","back","hidden"]).flat()];
  /* on 3+ loops the moves happen on the first loop only, so the rest stays a run */
  const lastMoveClimb = loops>=3 ? 3 : order.length-1;
  const moveAt = {
    front: c => ph<=2
      ? [reps("Incline push-ups","plank","chaturanga",8+2*(ph-1)+b+X,2.6,"strength","Hands on the stone wall at the top, body in one line, chest to the wall.",{chips:[c],setup:3})]
      : [reps("Push-ups","plank","chaturanga",10+2*(ph-3)+b+X,2.8,"strength","Full push-ups on the landing. Knees down once the form breaks.",{chips:[c],setup:3})],
    back: c => ph<=2
      ? [reps("Air squats","mountain","squat",12+2*(ph-1)+b+X,2.4,"strength","Legs are hot, so stay smooth. Heels down, chest up.",{chips:[c],setup:3})]
      : ph===3 ? sided((f,sd)=>reps("Split squats","splittop","splitsquat",8+b/2+X/2,2.8,"strength","Long stance on the flat. Back knee straight down.",{flip:f,chips:[c,sd],setup:3}))
      : [reps("Squat jumps","mountain","squat",8+b/2+X,2,"strength","Land soft and quiet, sink straight into the next one.",{chips:[c],setup:3})],
    hidden: c => [reps("Walking lunges","splittop","splitsquat",[12,16,20,20][ph-1]+b+X,2.4,"strength","On the flat at the top. Long steps, back knee kisses the ground, keep walking.",{chips:[c],setup:3,unitWord:"steps"})],
    small: c => ph===1 ? [ginga(30)] : ph===2 ? [ginga(24), cocorinha()] : ph===3 ? [ginga(24), esquiva()] : [ginga(24), esquiva(), ...negativa()]
  };
  if (o.bikeTo){
    out.push(L("Citi Bike to the park","citibike",420,"Easy spin. Dock as close to the front stairs as you can.","Docked",{zone:"Z1"}));
    out.push(L("Easy jog to the front stairs","run",300,"Five easy minutes so the legs are warm before the first climb.","At the front stairs",{zone:"Z2"}));
  } else out.push(L("Jog to the park","run",690,"Easy enough to talk, under about 140. Last time your heart rate hit 150 on the way in, so save it for the stairs.","At the front stairs",{zone:"Z2"}));
  const nSmall = order.length-1, capoAt = Math.floor((nSmall-1)/2);
  order.forEach((k,i)=>{
    const S=STAIRS[k], lp=Math.max(1,Math.ceil(i/4)), c = loops>1 ? `Loop ${lp} of ${loops} · climb ${i+1} of ${order.length}` : `Climb ${i+1} of ${order.length}`;
    const again = i>0 && order[i-1]===k;
    out.push(climb(S.name, S.t, c, again ? "Second time up. Match your first split." : S.cue));
    /* repeats (Phase 3+, opt-in): straight back down the back stairs on foot, and up again, twice */
    if (o.repeats && k==="back" && !again && order[i+1]==="back" && !out.repeated){ out.repeated=true;
      for (let r=2;r<=3;r++){
        out.push(L("Walk down the back stairs","walk",70,"Walk, never jog. Hand near the rail, eyes on your feet. This is your recovery: breathe.","At the bottom",{zone:"Z2"}));
        out.push(climb("Back stairs", S.t, `Repeat ${r} of 3`, r===3 ? "Last one. Match your first split." : "Straight back up. Hold the pace you climbed with the first time."));
      } }
    if (mv && !again && i<=lastMoveClimb && (k!=="front" || i===0 || i===lastMoveClimb || i===order.length-1)) out.push(...moveAt[k](S.name.replace(" stairs","")));
    if (i===order.length-1) return;
    /* down the path to the hub, up the small stairs, over to the next one */
    const nx=STAIRS[order[i+1]], j=i;
    out.push(L(`Down from the ${k} stairs to the small stairs`,"run",S.down,"Down the path, not the stairs. Let the legs float.","At the small stairs",{zone:"Z2"}));
    out.push(climb("Small stairs",30,`Small ${j+1} of ${nSmall}`,"Short and sharp. Run them."));
    if (mv && j===Math.min(capoAt,1)) out.push(...moveAt.small("Small"));
    out.push(L(`Over to the ${order[i+1]} stairs`,"run",nx.over,`Jog over to the bottom of the ${order[i+1]} stairs. Easy, keep it moving.`,"At the bottom",{zone:"Z2"}));
  });
  if (o.G){
    const lk=order[order.length-1];
    out.push(L(`Down from the ${lk} stairs to the small stairs`,"run",STAIRS[lk].down,"Green day bonus. Down the path to the hub.","At the small stairs",{zone:"Z2"}));
    out.push(climb("Small stairs",30,"Bonus","One more, all out."));
  }
  out.push(o.bikeHome
    ? L("Citi Bike home","citibike",840,"Easy spin. Legs are cooked, so this is the cool-down.","Home",{zone:"Z1"})
    : L("Jog home","run",900,"Easy. Walking the last stretch is fine.","Home",{zone:"Z1"}));
  return out;
}
