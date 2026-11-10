/* What you chose for today's cardio. At the gym the choice lasts the day: the default is hard
   intervals; "easy" is steady work on a machine you pick; "peloton" is a class on the gym's bike. */
import { st } from "../store.js";
import { today } from "../util/time.js";

const GYM_DAYS = ["strength","full","cardio"];   /* the session types that end in cardio at the gym */
export const gymCardioDay = () => st.loc==="gym" && GYM_DAYS.includes(st.type) && st.rec!=="red";
export function gymMode(){
  const c=st.gymCardio;
  if (!c || c.d!==today() || !gymCardioDay()) return null;
  return c.mode==="peloton" && !st.eq.gympel ? null : c.mode;
}
export function setGymMode(mode){ if (mode) st.gymCardio={d:today(), mode}; else delete st.gymCardio; }
/* is today's cardio a Peloton class? */
export const riding = () => st.loc==="gym" ? gymMode()==="peloton" : (st.type==="cardio" && st.cMode==="peloton");
/* a class tacked onto a lifting session, as opposed to a ride that is the session */
export const ridingAfterLifting = () => riding() && st.type!=="cardio";
