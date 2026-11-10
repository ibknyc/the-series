/* What the last day or two did to you, read from the log. */
import { st, realLog } from "../store.js";
import { dkey, today } from "../util/time.js";
import { RATIO } from "./weights.js";

/* did a session yesterday (or earlier today) load the same muscles? */
export function liftedRecently(){
  const y=dkey(new Date(Date.now()-864e5)), PAT={squat:"legs",hinge:"hamstrings and glutes",push:"chest and shoulders",pull:"back"};
  const ses=realLog().filter(l=>(l.d===y || l.d===today()) && l.t!=="yoga" && l.t!=="cardio");
  for (let i=ses.length-1;i>=0;i--){
    const l=ses[i], ex=[...new Set(st.sets.filter(r=>r.session_id===l.id && r.block==="main" && r.load_type!=="bodyweight").map(r=>r.exercise))];
    if (!ex.length) continue;
    const pats=[...new Set(ex.map(e=>{ const k=Object.keys(RATIO).find(g=>RATIO[g][e]); return k?PAT[k]:null; }).filter(Boolean))];
    return {when: l.d===y ? "yesterday" : "earlier today", what: pats.length ? pats.join(", ") : ex.slice(0,3).join(", ")};
  }
  return null;
}
export const legsLoaded = () => { const L=liftedRecently(); return L && /legs|hamstrings/.test(L.what); };
