/* Cardio machines and modes, the interval shape for each, Peloton classes, and the park stair route. */
export const CARDIO = {
  rower:     {name:"Rower",          a:"rowcatch",b:"rowfinish",tempo:2.4, gym:1},
  elliptical:{name:"Elliptical",     a:"ellipA",  b:"ellipB",   tempo:2.0, gym:1},
  arc:       {name:"Arc Trainer",    a:"ellipA",  b:"ellipB",   tempo:1.7, gym:1},
  gymbike:   {name:"Gym bike",       a:"bikeA",   b:"bikeB",    tempo:1.8, gym:1},
  climber:   {name:"Ladder climber", a:"climbA",  b:"climbB",   tempo:2.4, gym:1},
  tread:     {name:"Treadmill",      a:"runA",    b:"runB",     tempo:1.6, gym:1},
  run:       {name:"Running",        a:"runA",    b:"runB",     tempo:1.6, gym:0},
  stairs:    {name:"Park stairs",    a:"stairA",  b:"stairB",   tempo:1.5, gym:0},
  peloton:   {name:"Peloton",        a:"bikeA",   b:"bikeB",    tempo:1.8, gym:0},
  outbike:   {name:"Bike ride",      a:"bikeA",   b:"bikeB",    tempo:1.8, gym:0},
  rope:      {name:"Jump rope",      a:"ropeA",   b:"ropeB",    tempo:0.9, gym:0},
  citibike:  {name:"Citi Bike",      a:"bikeA",   b:"bikeB",    tempo:1.8, gym:0},
  walk:      {name:"Walking",        a:"runA",    b:"runB",     tempo:2.6, gym:0}
};
export const MNAME = k => (CARDIO[k]||{}).name || k;

/* the order cardio rotates in, per location */
export const ROTATION = {
  gym:  ["rower","arc","elliptical","gymbike","climber","tread"],
  home: ["run","stairs","peloton","outbike","rope"]
};
/* the order the "Today's cardio" chips show in at home */
export const PICK_ORDER = ["stairs","peloton","run","outbike","rope"];
/* what Swap offers mid-session. The stair route can't be swapped into from the living room. */
export const SWAP_POOL = {
  gym:  ["rower","arc","elliptical","gymbike","climber","tread"],
  home: ["run","peloton","outbike","rope"]
};

/* Peloton classes you actually ride. zones = Power Zones targeted. */
export const PCLASS = {
  pz:    {name:"Power Zone",           zones:[3,4,5], zoneLab:"PZ 3–5", tempo:.6,  label:"Ride the zones", cue:"Hold each zone the instructor calls. Zone 4 should feel hard but steady; don't overshoot the first efforts."},
  pzend: {name:"Power Zone Endurance", zones:[2,3],   zoneLab:"PZ 2–3", tempo:.85, label:"Steady",         cue:"Most of it in Zone 2, a little Zone 3. It should feel too easy. That's the point: this is the aerobic base."},
  pzmax: {name:"Power Zone Max",       zones:[5,6,7], zoneLab:"PZ 5–7", tempo:.5,  label:"Max efforts",    cue:"Short, all-out efforts with real recovery. Only on green days, never the day after legs."},
  ivl:   {name:"Intervals",            zones:[4,5,6], zoneLab:"Hard/easy", tempo:.55, label:"Intervals",   cue:"Hard means hard. Recover fully between efforts so the next one is just as strong."},
  free:  {name:"Free ride",            zones:[2],     zoneLab:"PZ 2",   tempo:.9,  label:"Steady",         cue:"Your own pace, Zone 2: you could hold a conversation."},
  low:   {name:"Low impact",           zones:[1,2],   zoneLab:"PZ 1–2", tempo:1,   label:"Easy",           cue:"Recovery ride. Light resistance, easy legs. It should leave you fresher than you started."},
  ftp:   {name:"FTP test",             zones:[],      zoneLab:"Test",   tempo:.5,  label:"All-out 20",     cue:"Take the FTP warm-up first. Start the 20 minutes a little under what you think you can hold, build, empty it in the last 3 minutes. Your FTP is 95% of your average output."}
};
export const PZ_PCT = {1:[0,55],2:[56,75],3:[76,90],4:[91,105],5:[106,120],6:[121,150],7:[151,999]};

/* Interval shape per machine. 30-second bursts never got the heart rate past zone 3 (Oct 14, Oct 20),
   so the work bouts are long enough for it to catch up. Rounds grow by phase; green adds one. */
export const IVL = {
  arc:       {work:120, easy:60, r:[3,4,5,6], cue:"Crank the incline or resistance, not just the speed."},
  elliptical:{work:120, easy:60, r:[3,4,5,6], cue:"Resistance up a few levels for the hard part."},
  climber:   {work:90,  easy:90, r:[3,4,5,6], cue:"Steady rungs, full reach. Ninety seconds is plenty on this one."},
  gymbike:   {work:60,  easy:60, r:[5,6,7,8], cue:"Resistance up, cadence high. Sit tall."},
  tread:     {work:120, easy:60, r:[3,4,5,6], cue:"Hard = fast run or a steep incline walk. Easy = walk."},
  rower:     {work:60,  easy:60, r:[4,5,6,7], cue:"Legs first, then lean, then pull."},
  peloton:   {work:60,  easy:60, r:[5,6,7,8], cue:"Resistance up, cadence high."},
  outbike:   {work:60,  easy:60, r:[5,6,7,8], cue:"Pick a hill or a long straight."},
  run:       {work:120, easy:60, r:[3,4,5,6], cue:"Hard is a tempo push, easy is a jog, not a stop."},
  rope:      {work:30,  easy:30, r:[6,7,8,9], cue:""}
};

/* Prospect Park, around Lookout Hill. Four sets of stairs: front (by Center Dr),
   back (the long one), hidden (by the Maryland Monument), small (north side).
   Up the stairs, down the paths, never down the stairs. The small stairs are the hub:
   every top has a path down to them, and from their top you can jog to any other stair.
   So the loop is big stair, path down, small stairs, path over, next big stair.
   o.stairN = stair sessions already done in this phase: each adds 2 reps, up to +6. */
/* starting guesses = your Oct 17 times. down = top of that stair to the small stairs, over = small stairs to that stair. */
export const STAIRS = {
  front: {name:"Front stairs",  t:55,  cue:"Find a rhythm, don't sprint it.", down:150, over:145},
  back:  {name:"Back stairs",   t:85,  cue:"The long one. Steady rhythm, short steps, eyes a few steps ahead. Drive through the whole foot.", down:160, over:190},
  hidden:{name:"Hidden stairs", t:45,  cue:"Quick feet all the way up.", down:45, over:340}
};

/* what the machine's screen reports, and what its level control is called */
export const UNITS = ["m","km","mi","kJ","avg W","kcal","floors"];
export const DEF_UNIT = {rower:"m", gymbike:"mi", peloton:"kJ", outbike:"mi", elliptical:"mi", arc:"kcal", climber:"floors", tread:"mi", run:"mi", rope:"kcal"};
export const LEVEL_LAB = {rower:"Damper", tread:"Incline %", run:"", rope:"", outbike:"", arc:"Level · incline", peloton:"Resistance"};

/* the WHOOP activity each machine maps to */
export const WHOOP_NAME = {rower:"Rowing", elliptical:"Elliptical", arc:"Elliptical", gymbike:"Spin", peloton:"Spin", outbike:"Cycling", tread:"Running", run:"Running", rope:"Jumping Rope", climber:"Stairmaster"};
