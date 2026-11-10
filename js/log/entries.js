/* The session log: one entry per session, started when the timer starts and closed when it ends. */
import { st, save } from "../store.js";
import { today, hhmm, TZ } from "../util/time.js";

const byStart = (a,b)=>{ const x=a.d+(a.start||""), y=b.d+(b.start||""); return x<y?-1:x>y?1:0; };
export const sortLog = () => st.log.sort(byStart);
export const entryById = id => st.log.find(l=>l.id===id);

export function newEntry(o){
  const d=o.d||today(), base=`s_${d.replace(/-/g,"")}_${(o.start||"").replace(":","")||o.done}`;
  let id=base, n=2; while (st.log.some(l=>l.id===id)) id=`${base}_${n++}`;
  const e={id, d, start:o.start||"", end:o.end||"", tz:TZ, p:st.phase, r:st.rec, m:o.m||0, t:st.type, l:st.loc,
    rpe:"", notes:"", done:o.done, partial:o.done==="partial", live:!!o.live, manual:!!o.manual};
  st.log.push(e); sortLog();
  if (!o.live){ if (d===today()) st.secOv=null; st.abOv=null; }
  save(); return e;
}
/* the session ends where its last step would have, so a phone left on the bench doesn't add an hour */
export function closeEntry(sid, steps, startedAt, partial){
  const e=entryById(sid); if (!e) return null;
  const ls=[...steps].reverse().find(x=>x.startedAt), endAt = ls ? Math.min(Date.now(), ls.startedAt + ls.dur*1000 + 60000) : Date.now();
  e.end=hhmm(new Date(endAt)); e.m=Math.max(1, Math.round((endAt-startedAt)/60000));
  e.done=partial?"partial":"full"; e.partial=!!partial; e.live=false;
  if (e.d===today()) st.secOv=null; st.abOv=null;
  save(); return e;
}
export function touch(sid){ const e=entryById(sid); if (e) e.lastAt=hhmm(new Date()); }
/* a session the phone killed, closed from the home screen: r is its saved live state */
export function closeInterrupted(r){
  const e=entryById(r.sid);
  if (e){ e.live=false; e.done="partial"; e.partial=true; e.end=e.lastAt||hhmm(new Date(r.at)); e.m=Math.max(1,Math.round((r.at-r.startedAt)/60000)); save(); }
}
/* leave without logging: the session and everything recorded in it goes */
export function discard(sid){
  st.log=st.log.filter(l=>l.id!==sid); st.sets=st.sets.filter(r=>r.session_id!==sid); st.cardio=st.cardio.filter(r=>r.session_id!==sid); save();
}
