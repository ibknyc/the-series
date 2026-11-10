/* the WHOOP activity to log a session as: one activity, the whole session */
import { WHOOP_NAME } from "../data/cardio.js";

export function whoopFor(type, loc, steps){
  if (type==="yoga") return "Yoga";
  if (type==="mix") return "Martial Arts";
  if (type==="cardio"){
    if (steps && steps.some(x=>x.climb || x.mod==="stairs")) return "Stadium Steps";
    const t={}; (steps||[]).forEach(x=>{ if (x.mach) t[x.mach]=(t[x.mach]||0)+x.dur; });
    const top=Object.keys(t).sort((a,b)=>t[b]-t[a])[0];
    return top ? WHOOP_NAME[top]||"Activity" : "HIIT";
  }
  /* a red-day Full has no lifting in it: it's yoga, whatever the template says */
  if (steps && !steps.some(x=>x.unit && x.block==="strength")) return "Yoga";
  return loc==="gym" ? "Weightlifting" : "Functional Fitness";
}
