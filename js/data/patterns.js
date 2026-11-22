/* Movement patterns the week should include, and how to recognise them in an exercise's name.
   Used to spot a pattern that's gone missing (progress/balance.js) and to cover it (engine/balance.js). */
export const PATTERNS = {
  singleleg: {name:"single-leg",   re:/split squat|reverse lunge|walking lunge|single-leg|b-stance|skater squat|pistol|step-up/i},
  lateral:   {name:"side-to-side", re:/lateral lunge|cossack|skater hop/i},
  core:      {name:"core",         re:/plank|bird dog|dead bug|boat|hollow|knee tuck|pallof|l-sit/i},
  rotation:  {name:"rotation",     re:/woodchop|pallof|rotation/i}
};
export const patternsOf = name => Object.keys(PATTERNS).filter(k => PATTERNS[k].re.test(name||""));
/* the blocks a step can count from: lifting and core work, not stretches or flows */
export const COUNTS = ["strength","core"];
