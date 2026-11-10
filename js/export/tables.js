/* The export model: sessions, sets, cardio, gates. Column names are stable; analysis depends on them. */
import { st } from "../store.js";
import { TZ } from "../util/time.js";
import { fmtSecs } from "../util/format.js";
import { TEMPLATE } from "../data/catalog.js";

export const COLS = {
  sessions:["session_id","date","start_time","end_time","tz","location","phase","template","whoop_activity","session_rpe","completed","notes","duration_min","recovery_color","entry"],
  sets:["session_id","start_time","block","exercise","set_no","side","reps_or_seconds","measure","load","load_type","RIR","planned_load","planned_reps","swapped_from","stage"],
  cardio:["session_id","start_time","modality","segment","seconds","duration_min","metric","metric_unit","level","effort","intervals","target_zone","target_seconds","swapped_from"],
  gates:["date","gate","result","pass"]
};
export function tables(){
  const sessions = [...st.log].sort((a,b)=>{ const x=a.d+(a.start||""), y=b.d+(b.start||""); return x<y?-1:x>y?1:0; }).map(l=>({
    session_id:l.id, date:l.d, start_time:l.start||"", end_time:l.end||"", tz:l.tz||(l.start?TZ:""), location:l.l, phase:l.p, template:TEMPLATE[l.t]||l.t,
    session_rpe:l.rpe||"", completed:l.done, notes:l.notes||"", duration_min:l.m, recovery_color:l.r,
    whoop_activity: l.whoop||"",
    entry: l.manual ? "manual" : l.id.includes("legacy") ? "legacy" : l.done==="skipped" ? "skipped" : "timer" }));
  const sets = st.sets.map(({_u,...r})=>r);
  return {sessions, sets, cardio:st.cardio, gates:st.gateLog};
}
/* one session's rows only */
export const only = (T, sid) => ({sessions:T.sessions.filter(x=>x.session_id===sid), sets:T.sets.filter(x=>x.session_id===sid), cardio:T.cardio.filter(x=>x.session_id===sid), gates:T.gates.filter(g=>T.sessions.some(x=>x.session_id===sid && x.date===g.date))});
export const README = `The Series export. One CSV per table, full history every time. Column names are stable.

sessions.csv  one row per session. whoop_activity = the one WHOOP activity to log it as (Weightlifting, Elliptical, Stadium Steps...).
               start_time/end_time are local 24h HH:MM in tz. completed = full | partial | skipped.
              entry = timer | manual | legacy | skipped. Legacy rows predate timestamps, so their times are blank.
              session_rpe 1-10. recovery_color is the green/yellow/red picked in the app. duration_min is time on the timer.
sets.csv      one row per set, per side for single-arm or single-leg moves (side = R | L | blank).
              reps_or_seconds is read with measure = reps | seconds. load is in lb.
              load_type: per_hand = the weight of ONE dumbbell, two in use | single_db = one dumbbell | machine_stack | barbell | bodyweight |
              assistance = the help an assisted pull-up or dip machine gave you (less is harder).
              RIR = reps in reserve, 4 means 4 or more, blank = not rated. planned_* is what the app prescribed.
              stage is the version you did, 1 easier, 2 as planned, 3 harder (blank for moves without stages).
              swapped_from is the exercise it replaced. Warm-up, flow and cooldown moves are logged with seconds done.
cardio.csv    one row per cardio block or leg, with start_time (HH:MM:SS) so it can be cut out of the WHOOP heart rate.
              metric + metric_unit = what the machine's screen said (meters, miles, kJ...); level = resistance/incline/damper; effort 1-10.
              Machine blocks run past their planned time until you tap Next, so seconds is real; target_seconds is the plan.
              segment names it ("Back stairs", "Jog to the park").
              seconds is the actual time. On tapped legs (the stair route) it's exactly when you tapped;
              target_seconds is the usual time. target_zone Z1 easy, Z2 steady, Z4 climbs, Z4-5 intervals.
gates.csv     one row per gate test. pass = y | n.
`;
export function sessionSummary(T){
  const L=[];
  T.sessions.forEach(x=>{
    L.push(`${x.date} ${x.start_time||"?"}–${x.end_time||"?"} ${x.tz}  ${x.template}, ${x.location}, phase ${x.phase}, ${x.duration_min} min, ${x.completed}${x.session_rpe?`, RPE ${x.session_rpe}`:""}`);
    if (x.notes) L.push(`Notes: ${x.notes}`);
    const cr=T.cardio.filter(c=>c.session_id===x.session_id);
    if (cr.length){ L.push("","Cardio"); cr.forEach(c=>L.push(`  ${c.segment||c.modality}  ${fmtSecs(c.seconds||c.duration_min*60)}${c.target_seconds?` (usual ${fmtSecs(c.target_seconds)})`:""}  ${c.target_zone}`)); }
    const sr=T.sets.filter(r=>r.session_id===x.session_id && r.block!=="warmup" && r.block!=="cooldown");
    if (sr.length){ L.push("","Sets"); sr.forEach(r=>L.push(`  ${r.exercise}${r.side?" "+r.side:""}  set ${r.set_no}  ${r.reps_or_seconds} ${r.measure}${r.load?` @ ${r.load} lb ${r.load_type}`:""}${r.RIR!==""?`  RIR ${r.RIR}`:""}${r.swapped_from?`  (swapped from ${r.swapped_from})`:""}`)); }
    L.push("");
  });
  return L.join("\n");
}
