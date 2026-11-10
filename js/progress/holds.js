/* Timed holds you end by tapping: the best so far sets the next target. */
import { st } from "../store.js";

export const holdBest = name => Math.max(0, ...st.sets.filter(r=>r.exercise===name && r.measure==="seconds").map(r=>+r.reps_or_seconds||0));
/* dead hang target: best + 5s, between 20 and 90 */
export const hangTarget = () => Math.min(90, Math.max(20, holdBest("Dead hang") ? holdBest("Dead hang")+5 : 30));
