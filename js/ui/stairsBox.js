/* The stair route's options. Shows only when today's session goes to the park. */
import { $ } from "../util/dom.js";
import { st, commit } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { sessionFor } from "../progress/today.js";
import { liftedRecently } from "../progress/recovery.js";
import { renderPark } from "./park.js";

export function renderStairs(){
  const stairsToday = sessionFor(st.rec).some(x=>x.climb);
  try{ renderPark(); }catch(e){}
  $("stairBox").hidden = !stairsToday;
  if (!stairsToday) return;
  $("bikeTo").checked=!!st.bikeTo; $("bikeHome").checked=!!st.bikeHome; $("stOn").checked=st.stations!==false; $("ldOn").checked=!!st.longDay;
  $("rpRow").hidden = st.phase<3; $("rpOn").checked=!!st.repeats;
  const legs = liftedRecently(); const legDay = legs && /legs|hamstrings/.test(legs.what);
  $("rpNote").hidden = !(st.phase>=3 && st.repeats);
  $("rpNote").textContent = legDay ? `Off today: you loaded your legs ${legs.when}, and walking down stairs on tired quads is how knees get hurt. Normal loop instead.` : "Back stairs three times: climb, walk down the stairs (never jog), climb again. Then the normal loop.";
  const best=st.stairs&&st.stairs["Back stairs"];
  $("stairNote").textContent = (st.bikeTo ? "Ride there, five minutes of easy jogging, then the stairs. " : "Jog there, about 11 minutes. ")
    + "Up the stairs, down the paths: each big stair, then down to the small stairs, then over to the next. Tap at every top and every arrival; your times become next session's targets. Moves at the top add 2 reps every stair day this phase, up to +6." + (best ? ` Back stairs best: ${fmtSecs(best.best)}.` : "");
}
export function initStairs(){
  const sw = (id, key) => { $(id).onchange=e=>{ st[key]=e.target.checked; commit(); }; };
  sw("bikeTo","bikeTo"); sw("bikeHome","bikeHome"); sw("rpOn","repeats"); sw("ldOn","longDay"); sw("stOn","stations");
}
