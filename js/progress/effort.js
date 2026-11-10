/* What a session cost you, from WHOOP: strain and heart rate, typed in on the done screen.
   Kept on the session's log entry as strain, hrAvg, hrMax. */
import { st } from "../store.js";

export const EFFORT = [{key:"strain", label:"strain", max:21}, {key:"hrAvg", label:"avg HR", max:230}, {key:"hrMax", label:"max HR", max:230}];
const has = e => EFFORT.some(f => e[f.key]);

export function setEffort(entry, key, raw){
  const f=EFFORT.find(x=>x.key===key), v=parseFloat(raw);
  if (v>0 && v<=f.max) entry[key]=v; else delete entry[key];
}
/* the last full session of the same kind in the same place that has numbers */
export function lastComparable(entry){
  return [...st.log].reverse().find(l => l!==entry && l.t===entry.t && l.l===entry.l && l.done==="full" && has(l) && (l.d+(l.start||"")) < (entry.d+(entry.start||""))) || null;
}
/* "strain 13.3, avg HR 128, max HR 171" */
export const effortLine = e => EFFORT.filter(f=>e[f.key]).map(f=>`${f.label} ${e[f.key]}`).join(", ");
