/* What a session cost you, from WHOOP: strain and heart rate, typed in on the done screen.
   Kept on the session's log entry as strain, hrAvg, hrMax. */
import { st } from "../store.js";
import { daysAgo } from "../util/time.js";

export const EFFORT = [{key:"strain", label:"strain", max:21}, {key:"hrAvg", label:"avg HR", max:230}, {key:"hrMax", label:"max HR", max:230},
  {key:"z45", label:"zone 4–5 min", max:180, zero:true}];   /* zero is a real answer here: an easy day */
const has = e => EFFORT.some(f => e[f.key]);
const said = (e, key) => e[key]!==undefined && e[key]!=="";

export function setEffort(entry, key, raw){
  const f=EFFORT.find(x=>x.key===key), v=parseFloat(raw);
  if ((v>0 || (f.zero && v===0)) && v<=f.max) entry[key]=v; else delete entry[key];
}
/* the last full session of the same kind in the same place that has numbers */
export function lastComparable(entry){
  return [...st.log].reverse().find(l => l!==entry && l.t===entry.t && l.l===entry.l && l.done==="full" && has(l) && (l.d+(l.start||"")) < (entry.d+(entry.start||""))) || null;
}
/* "strain 13.3, avg HR 128, max HR 171" */
export const effortLine = e => EFFORT.filter(f=>said(e, f.key)).map(f=>`${f.label} ${e[f.key]}`).join(", ");

/* Hard minutes: time in zone 4-5 over the rolling week, against a weekly goal.
   Only sessions where you typed the number count, so it reads low until you do. */
export const HARD_GOAL = 10;
export const tracksZones = () => st.log.some(l => said(l, "z45"));
export function hardMinutes(){
  const from = daysAgo(6);
  return Math.round(st.log.filter(l => l.d>=from && said(l, "z45")).reduce((a,l)=>a+l.z45, 0)*10)/10;
}
export const hardShort = () => tracksZones() && hardMinutes() < HARD_GOAL;
