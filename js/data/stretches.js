/* The cool-down library, and which parts of the body each kind of work loads.
   engine/cooldown.js reads a finished session, works out what took the most load,
   and picks from here. */

/* plain names, as they're shown and spoken */
export const AREA = {quads:"quads", hipflexors:"hip flexors", hamstrings:"hamstrings", calves:"calves", glutes:"glutes",
  innerthighs:"inner thighs", lats:"lats", chest:"chest and shoulders", spine:"back"};

/* what each kind of work loads, most-loaded first */
export const MACH_AREAS = {
  peloton:["quads","hipflexors","glutes","calves"], gymbike:["quads","hipflexors","glutes","calves"], outbike:["quads","hipflexors","glutes","calves"],
  stairs:["calves","quads","glutes","hipflexors"], climber:["calves","quads","lats","glutes"],
  run:["calves","hamstrings","hipflexors","quads"], tread:["calves","hamstrings","hipflexors","quads"], rope:["calves","quads"],
  arc:["quads","glutes","calves"], elliptical:["quads","glutes","calves"], rower:["hamstrings","lats","spine"]
};
export const SLOT_AREAS = {
  squat:["quads","glutes","innerthighs"], squat2:["quads","glutes","innerthighs"], lunge:["quads","hipflexors","glutes"], lateral:["innerthighs","glutes"],
  hinge:["hamstrings","glutes"], bridge:["glutes","hipflexors"], push:["chest"], overhead:["chest","lats"],
  pull:["lats"], pull2:["lats"], hang:["lats","chest"], finish:["lats"], core:["spine","hipflexors"], plank:["spine"], birddog:["spine"]
};
export const BLOCK_AREAS = { capoeira:["innerthighs","hipflexors","hamstrings"], invert:["chest","spine"] };

/* Movers come first, while you're still warm: easy motion through the range.
   a/b = the two poses it moves between, t = seconds in each, n = times through. */
export const MOVERS = [
  {name:"Lunge and reach", areas:["hipflexors","spine","quads"], a:"lowlunge", b:"lungetwist", la:"Sink the hips", lb:"Reach and twist", t:3, n:4, sided:true,
   cue:"Back knee down. Sink the hips forward, then twist toward the front leg and reach up. Easy and flowing, a little further each time."},
  {name:"Leg swings", areas:["hamstrings","hipflexors","glutes"], a:"kneeUp", b:"mountain", la:"Swing up", lb:"Down", t:1.4, n:6, sided:true,
   cue:"Hand on a wall. Swing the leg front to back, loose from the hip, growing each swing. No forcing the top."},
  {name:"Down dog, pedal the heels", areas:["calves","hamstrings","lats"], a:"downdog", b:"downdog", la:"Left heel down", lb:"Right heel down", t:3, n:5,
   cue:"Bend one knee and press the other heel down, then switch. Slow. Let the calves give up a little each time."},
  {name:"Squat to fold", areas:["innerthighs","glutes","hamstrings","calves"], a:"cocorinha", b:"forwardfold", la:"Deep squat, knees out", lb:"Straighten into a fold", t:3, n:5,
   cue:"Drop into a deep squat, elbows pressing the knees apart. Then lift the hips and fold, legs as straight as they'll go. Back down."},
  {name:"Reach and fold", areas:["chest","lats","hamstrings"], a:"upsalute", b:"forwardfold", la:"Inhale, reach up and back", lb:"Exhale, fold", t:4, n:4,
   cue:"Reach tall and open the chest on the inhale, fold down on the exhale. Let the arms hang heavy at the bottom."},
  {name:"Cat and cow", areas:["spine","lats"], a:"cow", b:"cat", la:"Inhale, chest forward", lb:"Exhale, round", t:4, n:4,
   cue:"Hands and knees. Move the whole spine, slowly, with the breath."}
];
/* Holds come after: one per area that took the most work. The first area listed is the one it's for. */
export const HOLDS = [
  {name:"Low lunge", areas:["hipflexors","quads"], pose:"lowlunge", sided:true, cue:"Back knee down, hips sinking forward and down. Squeeze the glute of the back leg: that's what opens the front of the hip."},
  {name:"Standing quad stretch", areas:["quads","hipflexors"], pose:"quadstand", sided:true, cue:"Heel to your glute, knees together, hips tucked under. A hand on the wall if you need it."},
  {name:"Half split", areas:["hamstrings","calves"], pose:"halfsplit", sided:true, cue:"From the lunge, sit the hips back and straighten the front leg. Long back, chest toward the shin. Toes up for more calf."},
  {name:"Seated forward fold", areas:["hamstrings","spine"], pose:"seatedfold", cue:"Lead with the chest, not the forehead. Knees can bend."},
  {name:"Calf stretch at the wall", areas:["calves"], pose:"calfwall", sided:true, cue:"Hands on the wall, back leg straight, heel heavy. Lean in until the calf pulls, then bend that knee a little to reach the lower calf."},
  {name:"Pigeon", areas:["glutes","hipflexors"], pose:"pigeon", sided:true, cue:"Square the hips. Breathe into the tight spot instead of forcing it."},
  {name:"Deep squat hold", areas:["innerthighs","calves","glutes"], pose:"cocorinha", cue:"Heels down, elbows pressing the knees apart, chest tall. Hold on to something if your heels lift."},
  {name:"Child's pose, hands to one side", areas:["lats","spine"], pose:"childs", sided:true, cue:"Knees wide, sit back, then walk both hands to one side until the opposite ribs stretch."},
  {name:"Supine twist", areas:["spine","chest","glutes"], pose:"supinetwist", sided:true, cue:"Knee across, opposite shoulder heavy. Let the chest open toward the ceiling."}
];
