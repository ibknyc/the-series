/* When a session ends: what it earned. Moves stages and FTP forward, and says so. */
import { st, save } from "../store.js";
import { today } from "../util/time.js";
import { fmtSecs } from "../util/format.js";
import { stageOf } from "./stages.js";

export function reviewSession(id){
  /* wall squats: every hold at the full 2 minutes moves you a stage deeper next time */
  const ws = st.sets.filter(r=>r.session_id===id && r.exercise==="Wall squat");
  let isoNote = "";
  if (ws.length){
    const full = ws.every(r=>+r.reps_or_seconds>=115), sg=stageOf("Wall squat"), tot=ws.reduce((a,r)=>a+(+r.reps_or_seconds||0),0);
    if (full && sg<3){ st.stage=st.stage||{}; st.stage["Wall squat"]=sg+1; save(); isoNote=` Wall squats: ${fmtSecs(tot)} held, every hold full. Next time is stage ${sg+1}.`; }
    else isoNote = ` Wall squats: ${fmtSecs(tot)} held at stage ${sg}.`;
  }
  /* FTP test: 95% of the 20-minute average becomes your FTP */
  const ft=(st.cardio||[]).find(r=>r.session_id===id && /^FTP test/.test(r.segment||"") && r.metric_unit==="avg W" && +r.metric>50);
  if (ft){ const old=st.ftp, nf=Math.round(+ft.metric*.95); st.ftp=nf; st.ftpDate=today(); save(); isoNote += ` New FTP: ${nf} W${old?` (was ${old}, ${nf>=old?"+":""}${nf-old})`:""}. Your Power Zone targets update from here.`; }
  const dh = st.sets.filter(r=>r.session_id===id && r.exercise==="Dead hang");
  if (dh.length){ const b=Math.max(...dh.map(r=>+r.reps_or_seconds||0)); isoNote += ` Dead hang best today: ${fmtSecs(b)}.`; }
  return isoNote;
}
