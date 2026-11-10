/* The rows that end up in the export: one per set, one per cardio block. ses = {sid, type}. */
import { hhmmss } from "../util/time.js";
import { stageOf } from "../progress/stages.js";

const blockOf = (s, type) => s.block==="cardio" ? "cardio" : s.block==="close" ? "cooldown"
  : ["strength","core","invert"].includes(s.block) ? "main"
  : (type==="yoga" && ["flow","standing"].includes(s.block)) ? "main"
  : (type==="mix" && s.block==="capoeira") ? "main" : "warmup";
const loadType = s => /Pull-ups|Free hang/.test(s.name) ? "bodyweight" : s.db==="AB" ? "per_hand" : s.db==="B" ? "single_db"
  : s.plate ? "barbell" : s.track ? "machine_stack" : "bodyweight";
const sideOf = s => { const c=s.chips.find(c=>/side/.test(c)); return c ? (c.startsWith("Right")?"R":"L") : ""; };

export function setRow(ses, s, o){
  return { session_id:ses.sid, start_time: s.startedAt ? hhmmss(new Date(s.startedAt)) : "", block:blockOf(s, ses.type), exercise:s.name, set_no:s.set||1, side:sideOf(s),
    reps_or_seconds:o.amount, measure:o.measure, load:o.load??"", load_type:loadType(s), RIR:o.rir??"",
    planned_load: s.plannedW||"", planned_reps: s.reps||s.secs||"", swapped_from: s.swappedFrom||"", stage: stageOf(s.name) };
}
export function cardioRow(ses, s, actual){
  return { session_id:ses.sid, start_time:s.startedAt?hhmmss(new Date(s.startedAt)):"", modality:s.mach||s.mod, segment:s.name, seconds:Math.round(actual), duration_min:+(actual/60).toFixed(1), intervals:s.ivl||"",
    target_zone:s.zone||"", target_seconds:s.lap?s.target:(s.mach?Math.round(s.dur):""), metric:"", metric_unit:"", level:"", effort:"", swapped_from:s.machFrom||"" };
}
