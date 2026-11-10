/* Tapped legs (the stair route): your time on each becomes next session's target. */
import { st } from "../store.js";

export function learnLap(s, actual){
  /* only learn from real laps: a tap-through would set next time's target to 3 seconds */
  if (actual < (s.base||s.target)*0.4) return;
  if (s.lap){ st.lapLast=st.lapLast||{}; st.lapLast[s.name]=Math.round(actual); }
  if (s.climb){ st.stairs=st.stairs||{}; const r=st.stairs[s.name]||{}; const v=Math.round(actual);
    st.stairs[s.name]={last:v, best: r.best ? Math.min(r.best,v) : v}; }
}
