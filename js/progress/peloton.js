/* Which Peloton class today: recovery, what you did the last two days, and how long since an FTP test. */
import { st, realLog } from "../store.js";
import { dkey, today } from "../util/time.js";
import { liftedRecently } from "./recovery.js";

export function pelSuggest(){
  const days = n => dkey(new Date(Date.now()-n*864e5));
  const recent = realLog().filter(l=>[days(1),days(2),today()].includes(l.d));
  const hardCardio = recent.some(l=>l.t==="cardio" && (st.cardio||[]).some(r=>r.session_id===l.id && (/Interval|Max|Power Zone(?! Endurance)|stairs/.test(r.segment||"") || r.modality==="stairs")));
  const legs = (()=>{ const L=liftedRecently(); return L && /legs|hamstrings/.test(L.what); })();
  const ftpAge = st.ftpDate ? Math.round((Date.now()-new Date(st.ftpDate))/864e5) : null;
  const lastEnd = (st.cardio||[]).filter(r=>/Endurance|Free ride/.test(r.segment||"")).map(r=>r.session_id).sort().pop();
  const endAge = lastEnd ? Math.round((Date.now()-new Date(lastEnd.slice(2,6)+"-"+lastEnd.slice(6,8)+"-"+lastEnd.slice(8,10)))/864e5) : 99;
  if (st.rec==="red") return {kind:"low", mins:20, why:"Red day: an easy 20 to move the legs, nothing more."};
  if (st.rec==="green" && !legs && !hardCardio && (ftpAge===null || ftpAge>=56)) return {kind:"ftp", mins:20, why: ftpAge===null ? "No FTP test on record. Fresh legs and a green day: test now so every Power Zone class is set right." : `Your last FTP test was ${ftpAge} days ago. After 8 weeks of training, it's likely out of date.`};
  if (legs || hardCardio) return {kind:"pzend", mins:45, why: legs ? "You loaded your legs recently: endurance keeps it aerobic without digging the hole deeper." : "You went hard in the last two days: today is base work."};
  if (endAge>=7) return {kind:"pzend", mins:45, why:"No endurance ride in a week. Most of your riding should be easy; this keeps that balance."};
  if (st.rec==="green") return {kind: st.phase>=3 ? "pzmax":"pz", mins: st.phase>=3 ? 30 : 45, why:"Green, fresh legs, base work done this week: a hard class is earned."};
  return {kind:"pz", mins:45, why:"Yellow day: a standard Power Zone class. Back off to endurance if Zone 4 feels like Zone 5."};
}
/* a pick holds for the day; tomorrow starts from a fresh suggestion */
export const todaysClass = () => (st.pel && st.pelDay===today()) ? st.pel : (st.type==="cardio" && st.cMode==="peloton" ? pelSuggest() : null);
export function pickClass(pel){ st.pel=pel; st.pelDay=today(); }
