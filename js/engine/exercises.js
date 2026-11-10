/* The exercise library: every loaded or bodyweight move, as a function of today's context.
   Each entry takes its reps (or seconds) and returns a slot variant: sl => step(s). */
import { reps, hold, sided } from "./steps.js";

export function exerciseKit(c){
  const {G, X, gym, useDb, H, L, wt, dbo, main, r10, r8, T4} = c;

  const EX = {
    goblet: n => sl => useDb
      ? reps("Front-rack squat","gobletup","goblet",n,3,"strength","A dumbbell on each shoulder, elbows up. Sit between your heels, chest tall, knees out. Leave 2 to 3 reps in the tank.",{...dbo("AB",H,"Front-rack squat"),chips:[sl]})
      : reps("Slow air squat","mountain","squat",n+2,4,"strength","Three seconds down, one up. Heels stay heavy.",{chips:[sl]}),
    row: n => sl => sided((f,s)=> useDb
      ? reps("Single-arm row","rowdown","row",n,3,"strength","Hinge with a flat back, hand on your knee or a bench. Pull the elbow toward your hip.",{...dbo("B",H,"Single-arm row"),flip:f,chips:[sl,s]})
      : reps("Backpack row","rowdown","row",n+2,3,"strength","Load a backpack with books. Flat back, elbow to hip.",{flip:f,chips:[sl,s]})),
    press: n => sl => useDb
      ? reps(gym?"Dumbbell press":"Floor press","floorpressdown","floorpress",n,3,"strength",gym?"On a bench or the floor. Elbows at about 45°, press straight up.":"On your back, knees bent. Elbows touch the floor, press straight up.",{...dbo("AB",L,"Dumbbell press"),chips:[sl]})
      : reps("Push-ups","plank","chaturanga",n+2,3,"strength","Body in one line. Knees down once form breaks.",{chips:[sl]}),
    rdl: n => sl => useDb
      ? reps("Romanian deadlift","mountain","rdl",n,3.5,"strength","Soft knees, push the hips back, weights slide down the thighs. Flat back.",{...dbo("AB",H,"Dumbbell RDL"),chips:[sl]})
      : reps("Hip hinge","mountain","rdl",n+4,3.5,"strength","Hands on hips, push them back until the hamstrings load. Flat back.",{chips:[sl]}),
    suitcase: s => sl => sided((f,side)=> useDb
      ? hold("Suitcase hold","mountain",s,"strength","One dumbbell at your side. Stand tall, don't lean toward it.",{...dbo("B",H,"Suitcase hold"),flip:f,chips:[sl,side]})
      : hold("Side plank","sideplank",s,"strength","Stack the hips and hold them high.",{flip:f,chips:[sl,side]})),
    split: n => sl => sided((f,s)=> reps("Split squat","splittop","splitsquat",useDb?n:n+4,3,"strength","Long stance. Drop the back knee straight down, front heel stays planted.",{...(useDb?dbo("AB",H,"Split squat"):{}),flip:f,chips:[sl,s]})),
    oh: n => sl => sided((f,s)=> useDb
      ? reps("Single-arm press","ohdown","ohpress",n,3,"strength","Squeeze glutes and ribs down so the press comes from the shoulder, not the lower back.",{...dbo("B",L,"Single-arm press"),flip:f,chips:[sl,s]})
      : reps("Pike push-up","downdog","dolphin",n,3,"strength","Hips high, lower the head toward the floor between your hands.",{flip:f,chips:[sl,s]})),
    renegade: n => sl => sided((f,s)=> useDb
      ? reps("Renegade row","plank","renegade",n,3,"strength","Feet wide, hips square to the floor. Row without rocking.",{...dbo("AB",H,"Renegade row"),flip:f,chips:[sl,s]})
      : reps("Shoulder taps","plank","renegade",n+4,2,"strength","Feet wide, tap the opposite shoulder, hips don't sway.",{flip:f,chips:[sl,s]}))
  };
  /* Home lower body: your dumbbells top out at 30 a hand, so one leg at a time does the loading.
     Dynamic first: the moves travel, step or change direction, which also lifts the heart rate. */
  const HOME = {
    bstance: n => sl => sided((f,s)=> reps("B-stance RDL","mountain","rdl",n,3.4,"strength","Back foot is just a kickstand, toes down by the front heel. Most of the weight on the front leg. Hips back, bells close.",{...(useDb?dbo("AB",H,"B-stance RDL"):{}),flip:f,chips:[sl,s]})),
    revlunge: n => sl => sided((f,s)=> reps("Reverse lunge, knee drive","kneeUp","splitsquat",n,3,"strength","Step back into the lunge, back knee kisses the floor, then drive that knee up to hip height as you stand. Bells at your sides.",{...(useDb?dbo("AB",H,"Reverse lunge"):{}),flip:f,chips:[sl,s]})),
    walklunge: n => sl => reps("Walking lunges","splittop","splitsquat",n,2.6,"strength","Long steps down the hall, back knee kisses the floor, keep walking. Bells at your sides. Count every step.",{...(useDb?dbo("AB",H,"Walking lunge"):{}),chips:[sl],unitWord:"steps"}),
    bss: n => sl => sided((f,s)=> reps("Bulgarian split squat","splittop","splitsquat",n,3,"strength","Back foot on the couch or a chair. Drop straight down, front heel planted, slight forward lean for more glute.",{...(useDb?dbo("AB",H,"Bulgarian split squat"):{}),flip:f,chips:[sl,s]})),
    slrdl: n => sl => sided((f,s)=> reps("Single-leg RDL","slrdlTop","slrdlBottom",n,3.4,"strength","Stand on one leg, one bell in the opposite hand. Push the free leg back as you hinge, hips square to the floor, bell close to the standing leg.",{...(useDb?dbo("B",H,"Single-leg RDL"):{}),flip:f,chips:[sl,s]})),
    latlunge: n => sl => sided((f,s)=> reps("Lateral lunge","mountain","latB",n,3,"strength","Big step to the side, sit back over that foot, other leg straight. Push back to standing. One bell at your chest.",{...(useDb?dbo("B",H,"Lateral lunge"):{}),flip:f,chips:[sl,s]})),
    cossack: n => sl => sided((f,s)=> reps("Cossack squat","latB","latB",n,3.4,"strength","Wide stance, sink all the way down over one foot, the other leg long with toes up. Shift across low, like a negativa. Bell at your chest as a counterweight.",{...(useDb?dbo("B",L,"Cossack squat"):{}),flip:f,chips:[sl,s]})),
    skater: n => sl => sided((f,s)=> reps("Skater squat","splittop","splitsquat",n,3.4,"strength","Stand on one leg, back knee bends and lowers toward the floor behind you. Light bell held out front to balance.",{...(useDb?dbo("B",L,"Skater squat"):{}),flip:f,chips:[sl,s]}))
  };
  const bridge = sl => useDb
    ? reps("Glute bridge","bridgedbdown","bridgedbup",10+X,3,"strength","Dumbbell across the hips. Drive through the heels, squeeze at the top, ribs down.",{...dbo("B",H,"Glute bridge"),chips:[sl]})
    : reps("Glute bridge","bridgedown","bridge",10+X,3,"strength","Drive through the heels, squeeze at the top, ribs down.",{chips:[sl]});
  const birddog = sl => sided((f,s)=>reps("Bird dog","table","birddog",6,4,"strength","Opposite arm and leg long. Slow enough that nothing wobbles.",{flip:f,chips:[sl,s]}));
  const plank = sl => hold("Forearm plank","forearmplank",G?40:30,"strength","Elbows under shoulders. Squeeze the glutes and push the floor away.",{chips:[sl]});

  const TRX = {
    row: sl => reps("TRX row","trxRowA","trxRowB",10+X+T4,3,"strength","Walk your feet in until it's hard. Body in one plank, pull your chest to the handles, elbows close.",{chips:[sl],setup:3}),
    push: sl => reps("TRX push-up","trxPlank","trxPushDown",8+X+T4,3,"strength","Feet in the cradles, hands on the floor. Hips level, don't let them sag.",{chips:[sl],setup:3}),
    ham: sl => reps("TRX hamstring curl","trxHamOut","trxHamIn",10+X+T4,3,"strength","Heels in the cradles, hips up and stay up. Pull your heels to your glutes.",{chips:[sl],setup:3}),
    y: sl => reps("TRX Y-fly","trxRowA","trxY",10+X+T4,3,"strength","Lean back, arms straight, lift into a Y. Shoulders down, thumbs up.",{chips:[sl],setup:3}),
    pistol: sl => sided((f,sd)=>reps("TRX pistol squat","trxSquatUp","trxSquatDown",6+X/2+T4/2,3.2,"strength","Hold the handles, one leg out front, sit back and down. Use the straps only as much as you need.",{flip:f,chips:[sl,sd],setup:3})),
    tuck: sl => reps("TRX knee tuck","trxPlank","trxTuck",10+X+T4,2.4,"strength","Feet in the cradles, shoulders over wrists. Pull the knees to your chest without the hips piking.",{chips:[sl],setup:3})
  };
  const BW = {
    squat: n => sl => reps("Slow air squat","mountain","squat",n+2,4,"strength","Three seconds down, one up. Heels stay heavy.",{chips:[sl]}),
    pushups: n => sl => reps("Push-ups","plank","chaturanga",n,3,"strength","Body in one line. Knees down once form breaks.",{chips:[sl]}),
    pike: n => sl => sided((f,s)=>reps("Pike push-up","downdog","dolphin",n,3,"strength","Hips high, lower the head toward the floor between your hands.",{flip:f,chips:[sl,s]})),
    taps: n => sl => sided((f,s)=>reps("Shoulder taps","plank","renegade",n,2,"strength","Feet wide, tap the opposite shoulder, hips don't sway.",{flip:f,chips:[sl,s]})),
    sideplank: t => sl => sided((f,side)=>hold("Side plank","sideplank",t,"strength","Stack the hips and hold them high.",{flip:f,chips:[sl,side]}))
  };

  const pick = "Pick a weight that leaves 2 to 3 reps in the tank.";
  const GYM = {
    backsquat: sl=>reps("Back squat","bbtop","bbsquat",main+X,3.5,"strength","Bar on your upper back, brace before every rep, hips and chest rise together. Use the safeties.",{plate:"neck",track:"Back squat",setup:15,chips:[sl]}),
    smithsquat:sl=>reps("Smith squat","bbtop","bbsquat",main+X+2,3.5,"strength","Feet slightly forward of the bar. The rail holds the path, so drive straight up and don't lean into it. Set the safety pins.",{plate:"neck",track:"Smith squat",setup:15,chips:[sl]}),
    legpress:  sl=>reps("Leg press","lpdown","lpup",r10+X,3,"strength","Feet shoulder-width. Lower until your hips want to curl, don't lock the knees. "+pick,{track:"Leg press",setup:12,chips:[sl]}),
    pulldown:  sl=>reps("Lat pulldown","latup","latdown",r10+X,3,"strength","Chest up, pull the bar to your collarbone, elbows drive down. "+pick,{track:"Lat pulldown",setup:10,chips:[sl]}),
    cablerow:  sl=>reps("Seated cable row","crowout","crowin",r10+X,3,"strength","Sit tall, pull to your belly button, pause, let the shoulders reach forward on the return.",{track:"Seated cable row",setup:10,chips:[sl]}),
    smithrow:  sl=>reps("Smith row","bbrowdown","bbrowup",r8+X,3,"strength","Set the bar low. Hinge to about 45°, flat back, pull to your lower ribs.",{plate:"hands",track:"Smith row",setup:15,chips:[sl]}),
    bbrow:     sl=>reps("Barbell row","bbrowdown","bbrowup",r8+X,3,"strength","Hinge to about 45°, flat back, pull to your lower ribs.",{plate:"hands",track:"Barbell row",setup:15,chips:[sl]}),
    bench:     sl=>reps("Bench press","benchdown","benchup",main+X,3,"strength","Shoulder blades pinned, bar touches mid-chest, press up and slightly back. Safeties set.",{plate:"hands",track:"Bench press",setup:15,chips:[sl]}),
    smithbench:sl=>reps("Smith bench press","benchdown","benchup",main+X+2,3,"strength","Bench set so the bar lands mid-chest. Shoulder blades pinned. Safety catches on.",{plate:"hands",track:"Smith bench press",setup:15,chips:[sl]}),
    dbbench:   sl=>reps("Dumbbell bench press","benchdown","benchup",r8+X,3,"strength","Full range — this is the one you liked. Elbows about 45°, press up and slightly together. Don't clash the bells.",{db:"AB",weight:wt(H),track:"Dumbbell bench press",setup:12,chips:[sl]}),
    dbincline: sl=>reps("Incline dumbbell press","benchdown","benchup",r8+X,3,"strength","Bench at about 30°. Same press, more upper chest and shoulder.",{db:"AB",weight:wt(L),track:"Incline dumbbell press",setup:12,chips:[sl]}),
    deadlift:  sl=>reps("Deadlift","dltop","dlbottom",main+X,4,"strength","Bar over midfoot, lats tight, push the floor away. Reset every rep.",{plate:"hands",track:"Deadlift",setup:15,chips:[sl]}),
    bbrdl:     sl=>reps("Barbell RDL","dltop","rdl",r8+X,3.5,"strength","Soft knees, hips back, bar stays against your legs.",{plate:"hands",track:"Barbell RDL",setup:15,chips:[sl]}),
    smithrdl:  sl=>reps("Smith RDL","dltop","rdl",r8+X,3.5,"strength","Soft knees, hips back, bar tracks down your thighs on the rail.",{plate:"hands",track:"Smith RDL",setup:15,chips:[sl]}),
    ohp:       sl=>reps("Overhead press","bbohdown","bbohup",main+X,3,"strength","Glutes tight, ribs down, head through once the bar passes your face.",{plate:"hands",track:"Overhead press",setup:15,chips:[sl]}),
    smithohp:  sl=>reps("Smith overhead press","bbohdown","bbohup",main+X+2,3,"strength","Seated or standing under the rail. Glutes tight, ribs down, press straight up.",{plate:"hands",track:"Smith overhead press",setup:15,chips:[sl]}),
    dbrow:     sl => sided((f,sd)=>reps("Dumbbell row","rowdown","row",r8+X,3,"strength","One knee and hand on the bench, flat back. Pull the elbow past your hip.",{db:"B",weight:wt(H),track:"Dumbbell row",setup:10,flip:f,chips:[sl,sd]})),
    dbrdl:     sl => reps("Dumbbell RDL","mountain","rdl",r10+X,3.5,"strength","Soft knees, push the hips back, bells slide down the thighs. Flat back.",{db:"AB",weight:wt(H),track:"Dumbbell RDL",setup:10,chips:[sl]}),
    dbsplit:   sl => sided((f,sd)=>reps("Split squat","splittop","splitsquat",r8+X,3,"strength","Long stance, bells at your sides. Back knee straight down, front heel planted.",{db:"AB",weight:wt(L),track:"Split squat",setup:10,flip:f,chips:[sl,sd]})),
    dbgoblet:  sl => reps("Goblet squat","gobletup","goblet",r10+X,3,"strength","One bell at your chest. Sit between your heels, chest tall, knees out.",{db:"B",weight:wt(H),track:"Goblet squat",setup:10,chips:[sl]}),
    dbslrdl:   sl => sided((f,sd)=>reps("Single-leg RDL","slrdlTop","slrdlBottom",r8+X,3.4,"strength","Stand on one leg, one bell in the opposite hand. Push the free leg back as you hinge, hips square, bell close to the standing leg.",{db:"B",weight:wt(L),track:"Single-leg RDL",setup:8,flip:f,chips:[sl,sd]})),
    hipthrust: sl => reps("Dumbbell hip thrust","bridgedbdown","bridgedbup",r10+X,3,"strength","Shoulders on the bench edge, one heavy bell across the hips. Drive through the heels, chin tucked, squeeze at the top.",{db:"B",weight:wt(H),track:"Dumbbell hip thrust",setup:12,chips:[sl]}),
    dbwalk:    sl => reps("Walking lunges","splittop","splitsquat",2*(r8+X),2.6,"strength","Bells at your sides, long steps, back knee kisses the floor. Count every step.",{db:"AB",weight:wt(L),track:"Walking lunge",setup:8,chips:[sl],unitWord:"steps"}),
    dbohp:     sl => sided((f,sd)=>reps("Single-arm press","ohdown","ohpress",r8+X,3,"strength","Glutes and ribs tight so the press comes from the shoulder, not the lower back.",{db:"B",weight:wt(L),track:"Single-arm press",setup:10,flip:f,chips:[sl,sd]}))
  };
  return {EX, HOME, BW, TRX, GYM, bridge, birddog, plank};
}
