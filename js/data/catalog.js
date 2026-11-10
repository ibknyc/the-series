/* The fixed vocabulary of the app: blocks, phases and their gates, recovery colors, session types, equipment. */
export const BLOCKS = {
  arrive:{name:"Arrive", color:"#7A8C84"},
  capoeira:{name:"Capoeira", color:"#C98A1B"},
  cardio:{name:"Cardio", color:"#9C3D6B"},
  flow:{name:"Flow", color:"#3447B0"},
  standing:{name:"Standing", color:"#2E8C9A"},
  strength:{name:"Strength", color:"#B5452F"},
  core:{name:"Core", color:"#8A5BB0"},
  invert:{name:"Inversions", color:"#1F9D6B"},
  close:{name:"Closing", color:"#5F6A64"}
};

export const PHASES = [{n:1, name:"Foundation"}, {n:2, name:"Load"}, {n:3, name:"Flow and flight"}, {n:4, name:"Your series"}];
export const GATES = {
  1:["Practiced 5+ days a week for 2 straight weeks","5 rounds of Sun A with 8 clean push-ups and 10 squats","45-second forearm plank"],
  2:["Goblet squat 2×10 at your heavy pair, 2–3 reps in reserve","10 full push-ups per Sun A round","Crow held 5 seconds","Dolphin 30s and side plank 30s per side"],
  3:["Crow held 15 seconds","Tucked forearm headstand at the wall, 20s, controlled","L-handstand 30 seconds","Low, controlled aú in both directions"],
  4:["Freestanding headstand 30 seconds","Wall handstand 60 seconds","Full aú both sides","Queda de rins 10s per side"]
};
export const RECS = [
  {id:"green", name:"Green", range:"67% and up", desc:"Pushed. Extra rounds and two more reps a set."},
  {id:"yellow", name:"Yellow", range:"34–66%", desc:"As written."},
  {id:"red", name:"Red", range:"Under 34%", desc:"No loading, no inversions. Strength days become easy cardio and mobility."}
];
export const TYPES = [
  {id:"full", name:"Full series", note:"Everything in one go."},
  {id:"yoga", name:"Yoga", note:"Flow, standing, core and inversions. No loading. Good first thing in the morning."},
  {id:"strength", name:"Strength", note:"Short warm-up, the lifting, and a quick cool-down. Good for the afternoon."},
  {id:"cardio", name:"Cardio", note:"Warm up on one machine, work on the next, flush on a third. Always ends with one pulling movement."},
  {id:"mix", name:"Flow + capoeira", note:"Between yoga and the full series. A short flow, a capoeira block that rotates esquivas, kicks and floor work, then 4 wall squats for blood pressure. No dumbbells."}
];
export const EQ_GYM = [{id:"trx",name:"TRX"},{id:"machines",name:"Cables and machines"},{id:"aircable",name:"Air cable (Keiser)"},{id:"bench",name:"Bench + dumbbells"},{id:"smith",name:"Smith machine"},{id:"barbell",name:"Free barbell"},{id:"bar",name:"Pull-up bar"},
  {id:"rower",name:"Rower"},{id:"arc",name:"Arc Trainer"},{id:"elliptical",name:"Elliptical"},{id:"gymbike",name:"Gym bike"},{id:"gympel",name:"Peloton"},{id:"climber",name:"Ladder climber"},{id:"tread",name:"Treadmill"}];
export const EQ_HOME = [{id:"bar",name:"Pull-up bar"},{id:"run",name:"Running"},{id:"stairs",name:"Park stairs"},{id:"peloton",name:"Peloton"},{id:"outbike",name:"Bike ride"},{id:"rope",name:"Jump rope"}];

export const TYPE_NAME = {full:"full series", yoga:"yoga", strength:"strength", cardio:"cardio", mix:"flow + capoeira"};
export const TEMPLATE = {full:"Full", yoga:"Yoga", strength:"Strength", cardio:"Cardio", mix:"Flow + capoeira"};
export const LOCATIONS = [{id:"home",name:"Home"},{id:"gym",name:"Work gym"}];
