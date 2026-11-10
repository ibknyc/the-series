/* The pickers at the top of the home screen: phase, session type, second session, where you are
   and what's there, recovery, and which session of the A/B pair is next. */
import { $, seg } from "../util/dom.js";
import { today } from "../util/time.js";
import { st, commit } from "../store.js";
import { PHASES, GATES, RECS, TYPES, TYPE_NAME, LOCATIONS, EQ_GYM, EQ_HOME } from "../data/catalog.js";
import { CARDIO } from "../data/cardio.js";
import { total } from "../engine/steps.js";
import { sessionFor, loggedToday, isSecond, abNext, cardioAvailable } from "../progress/today.js";

function renderPhases(){
  const ph=$("phases"); ph.innerHTML="";
  PHASES.forEach(p=>{
    const b=document.createElement("button"); b.className="phase"; b.type="button";
    if ((st.gates[p.n]||[]).filter(Boolean).length===GATES[p.n].length) b.classList.add("cleared");
    b.setAttribute("aria-pressed", String(st.phase===p.n));
    b.innerHTML=`<span class="num">${p.n}</span><span class="phlab">${p.name}</span>`;
    b.onclick=()=>{ st.phase=p.n; commit(); };
    ph.appendChild(b);
  });
}
function renderType(){
  seg($("typeSeg"), TYPES, st.type, id=>{ st.type=id; commit(); });
  $("typeNote").textContent = TYPES.find(t=>t.id===st.type).note;
}
function renderSecond(){
  const sec = isSecond(), lt = loggedToday();
  $("secOn").checked = sec;
  $("secNote").textContent = sec
    ? (lt.length ? `You already did ${TYPE_NAME[lt[lt.length-1].t]||"a session"} today, so the warm-up is shorter.` : "Shorter warm-up, and yoga leans restorative.")
    : "First thing today. Full warm-up.";
}
function renderWhere(){
  seg($("locSeg"), LOCATIONS, st.loc, id=>{ st.loc=id; commit(); });
  const pills=$("eqPills"); pills.innerHTML="";
  (st.loc==="gym" ? EQ_GYM : EQ_HOME).forEach(e=>{
    const l=document.createElement("label");
    l.innerHTML=`<input type="checkbox" ${st.eq[e.id]?"checked":""}><span class="tick"></span>${e.name}`;
    l.querySelector("input").onchange=ev=>{ st.eq[e.id]=ev.target.checked; commit(); };
    pills.appendChild(l);
  });
  const av=cardioAvailable();
  $("eqNote").textContent = st.type==="cardio"
    ? (av.length>1 ? `Cardio rotates through these, a different one each session. Right now: ${av.map(k=>CARDIO[k].name.toLowerCase()).join(", ")}.`
       : av.length ? `Only ${CARDIO[av[0]].name.toLowerCase()} is ticked, so every block runs on it. Tick more to mix.`
       : "Nothing ticked, so cardio falls back to capoeira and bodyweight conditioning.")
    : st.loc==="gym" ? "Tick what you can actually get to. Anything busy, hit Swap mid-session and it reshuffles."
    : "Mat, your dumbbells, a wall, and whatever you've ticked above.";
}
/* which of the pair is next: Session A or B for lifting, the machine order for cardio */
function renderRotation(){
  const ab=abNext(), abr=$("abRow"), av=cardioAvailable();
  abr.hidden = !((st.loc==="gym" || st.type==="cardio") && st.type!=="yoga");
  if (st.type==="cardio"){
    abr.hidden = av.length<2;
    if (!abr.hidden){ const sp=av.slice((ab*2)%av.length).concat(av.slice(0,(ab*2)%av.length));
      $("abText").innerHTML = `Next: <b>${sp.slice(0,3).map(k=>CARDIO[k].name).join(" → ")}</b>`; }
  } else if (!abr.hidden) $("abText").innerHTML = ab ? "Next: <b>Session B</b> — hinge and pull lead" : "Next: <b>Session A</b> — squat and press lead";
}
function renderRecovery(){
  const rc=$("rec"); rc.innerHTML="";
  RECS.forEach(r=>{
    const mins=Math.round(total(sessionFor(r.id))/60);
    const b=document.createElement("button"); b.className="recbtn"; b.type="button";
    b.setAttribute("aria-pressed", String(st.rec===r.id));
    b.innerHTML=`<span class="dot" style="background:var(--${r.id})"></span><span class="rt">${r.name} <span style="font-weight:500;font-size:14px;color:var(--ink-2);font-family:var(--body)">${r.range}</span></span><span class="rs">${r.desc}</span><span class="rm">${mins}<small>min</small></span>`;
    b.onclick=()=>{ st.rec=r.id; commit(); };
    rc.appendChild(b);
  });
}
export function renderToday(){ renderPhases(); renderType(); renderSecond(); renderWhere(); renderRotation(); renderRecovery(); }

export function initToday(){
  $("secOn").onchange=e=>{ st.secOv={d:today(), v:e.target.checked}; commit(); };
  $("abBtn").onclick=()=>{ st.abOv = abNext() ? 0 : 1; commit(); };
}
