/* The screen after a session: what was logged, check your sets, rate it, export it. */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { show } from "../util/screens.js";
import { st, save, changed } from "../store.js";
import { TYPE_NAME } from "../data/catalog.js";
import { entryById } from "../log/entries.js";
import { reviewSession } from "../progress/review.js";
import { setEffort, lastComparable, effortLine } from "../progress/effort.js";
import { exportZip } from "../export/index.js";

let doneId = null;

/* every lifted set from this session, with its RIR editable after the fact */
function renderDoneSets(id){
  const box=$("doneSets"), list=$("doneSetList"); list.innerHTML="";
  const rows=st.sets.filter(r=>r.session_id===id && r.block==="main" && r.measure==="reps" && r.load_type!=="bodyweight");
  const groups=[]; rows.forEach(r=>{ const k=r.exercise+"|"+r.set_no; let g=groups.find(x=>x.k===k); if (!g){ g={k, rows:[]}; groups.push(g); } g.rows.push(r); });
  box.hidden=!groups.length;
  groups.forEach(g=>{
    const r=g.rows[0], d=document.createElement("div");
    const paint=()=>{ const blank = g.rows[0].RIR===""||g.rows[0].RIR===undefined; d.classList.toggle("blank", blank);
      d.querySelector("small").textContent = `Set ${r.set_no} · ${r.reps_or_seconds} reps${r.load?` @ ${r.load} lb`:""}${blank?" · no RIR":""}`; };
    d.className="dsrow"; d.innerHTML=`<span><b>${r.exercise}</b><small></small></span><div class="feel rir"></div>`;
    const fe=d.querySelector(".feel");
    [0,1,2,3,4].forEach(n=>{ const b=document.createElement("button"); b.type="button"; b.textContent=n===4?"4+":String(n);
      b.setAttribute("aria-pressed", String(r.RIR!=="" && r.RIR!==undefined && +r.RIR===n));
      b.onclick=()=>{ fe.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); g.rows.forEach(x=>x.RIR=n); save(); paint(); };
      fe.appendChild(b); });
    paint(); list.appendChild(d);
  });
}
function renderRpe(){
  const rg=$("rpeGrid"); rg.innerHTML="";
  for (let n=1;n<=10;n++){ const b=document.createElement("button"); b.type="button"; b.textContent=n; b.setAttribute("aria-pressed","false");
    b.onclick=()=>{ rg.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); const e=entryById(doneId); if (e){ e.rpe=n; save(); } };
    rg.appendChild(b); }
}
const EFFORT_FIELDS = {doneStrain:"strain", doneHrAvg:"hrAvg", doneHrMax:"hrMax"};
/* how the last session of this kind compared, so today's numbers mean something */
function renderEffort(entry){
  Object.keys(EFFORT_FIELDS).forEach(id=>{ $(id).value=""; });
  const prev = entry && lastComparable(entry), box=$("doneCompare");
  box.hidden=!prev;
  if (prev) box.textContent = `Last ${TYPE_NAME[prev.t]} ${prev.l==="gym"?"at the gym":"at home"} (${prev.d.slice(5)}): ${effortLine(prev)}.`;
}
function summary({partial, mins, type}){
  return partial
    ? `${mins} minutes logged as a partial ${TYPE_NAME[type]} session. Cut short beats not counted.`
    : st.rec==="red"
    ? `${mins} minutes, soft version. Showing up on a red day is the habit that makes the green days count.`
    : type==="yoga" ? `${mins} minutes of Phase ${st.phase} yoga. Logged. If you lift later, the app will know it's your second session.`
    : type==="mix" ? `${mins} minutes of flow and capoeira. Logged.`
    : type==="strength" ? `${mins} minutes of strength. Logged, along with any weights you entered. Beat one of them next time.`
    : `${mins} minutes of Phase ${st.phase}. Logged. If a gate felt close today, test it next time you're green.`;
}
function renderDone(ses){
  const {entry, partial, whoop} = ses;
  doneId = entry && entry.id;
  renderRpe();
  $("doneNotes").value="";
  renderEffort(entry);
  renderDoneSets(doneId);
  const earned = reviewSession(doneId);
  if (entry) $("doneWhoop").innerHTML = `In WHOOP: one <b>${whoop}</b> activity, <b>${entry.start}–${entry.end}</b>. If WHOOP split it or picked it up on its own, merge or edit it to match.`;
  show("done");
  document.querySelector("#done h1").textContent = partial ? "Logged." : "Practice done.";
  $("doneNote").textContent = summary(ses) + earned;
}
export function initDone(){
  on("session:finished", renderDone);
  $("doneNotes").oninput=e=>{ const en=entryById(doneId); if (en){ en.notes=e.target.value; save(); } };
  Object.entries(EFFORT_FIELDS).forEach(([id,key])=>{ $(id).oninput=e=>{ const en=entryById(doneId); if (en){ setEffort(en, key, e.target.value); save(); } }; });
  $("doneExp").onclick=()=>{ if (doneId) exportZip(doneId); };
  $("doneBtn").onclick=()=>{ show("home"); changed(); window.scrollTo(0,0); };
}
