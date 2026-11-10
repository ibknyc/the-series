/* Today's sequence: the note above it when something's worth saying, the list, and the Start button. */
import { $ } from "../util/dom.js";
import { st, commit } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { BLOCKS, TYPE_NAME } from "../data/catalog.js";
import { GUIDE } from "../data/guide.js";
import { total } from "../engine/steps.js";
import { whoopFor } from "../engine/whoop.js";
import { sessionFor, abNext } from "../progress/today.js";
import { liftedRecently } from "../progress/recovery.js";
import { estW, homeInv } from "../progress/weights.js";
import { holdBest } from "../progress/holds.js";
import { stageOf } from "../progress/stages.js";
import { unlockAudio } from "../player/audio.js";
import { start } from "../player/session.js";

function renderNote(){
  const pn=$("planNote"), lifting = (st.type==="strength" || (st.type==="full" && st.phase>=2)) && st.rec!=="red";
  if (st.rec==="red" && st.type==="strength"){ pn.hidden=false; pn.textContent = st.loc==="gym" && (st.eq.rower||st.eq.climber) ? "Red day. Lifting is off. Easy cardio and mobility instead." : "Red day. Lifting is off. This is a mobility session."; }
  else if (liftedRecently() && lifting){
    const L=liftedRecently();
    pn.hidden=false; pn.style.borderLeftColor="var(--yellow)";
    pn.innerHTML = `You lifted ${L.when} (${L.what}). The same muscles want about 48 hours. <b>Cardio or yoga is the better call today.</b> If you lift anyway, the gym gives you the other session (${abNext()?"B":"A"}), and expect to stay at last time's weights. <button type="button" class="ghost" id="toCardio" style="margin-top:8px">Make today cardio</button>`;
    $("toCardio").onclick=()=>{ st.type="cardio"; commit(); };
  }
  else if (st.loc==="home" && !st.dbOn && lifting){
    pn.hidden=false; pn.style.borderLeftColor="var(--yellow)";
    pn.innerHTML = `<b>Dumbbells are off</b>, so every move is the bodyweight version. <button type="button" class="ghost" id="dbFix" style="margin-top:8px">Use my dumbbells (${homeInv().join(", ")} lb)</button>`;
    $("dbFix").onclick=()=>{ st.dbOn=true; commit(); };
  }
  else pn.hidden=true;
  if (pn.hidden || st.rec==="red") pn.style.borderLeftColor="";
}
function renderList(steps){
  const ol=$("planList"); ol.innerHTML="";
  let lastB=null;
  steps.forEach(s=>{
    if (s.block!==lastB){ lastB=s.block; const h=document.createElement("li"); h.className="bh"; h.innerHTML=`<i style="background:${BLOCKS[s.block].color}"></i>${BLOCKS[s.block].name}`; ol.appendChild(h); }
    const li=document.createElement("li"); li.className="it";
    const extra=[...s.chips.filter(c=>!/^\d+(s| min|:\d+)$/.test(c)), s.track && (st.lifts[s.track] || estW(s.track)) ? "" : s.weight].filter(Boolean).join(", ");
    const ew = !st.lifts[s.track] && estW(s.track);
    const hb = s.iso ? holdBest(s.name) : 0;
    const last = hb ? `<small class="last">Best so far: ${fmtSecs(hb)}${GUIDE[s.name]?` · stage ${stageOf(s.name)}`:""}</small>` : s.track && st.lifts[s.track] ? `<small class="last">Last time: ${st.lifts[s.track]} lb</small>` : ew ? `<small class="last">First time: start around ${ew} lb, from your other lifts</small>` : "";
    li.innerHTML=`<span>${s.name}${extra?`<small>${extra}</small>`:""}${last}</span><span class="d">${fmtSecs(s.dur)}</span>`;
    ol.appendChild(li);
  });
}
export function renderPlan(){
  renderNote();
  const steps=sessionFor(st.rec);
  renderList(steps);
  $("startBtn").textContent=`Start ${Math.round(total(steps)/60)}-minute ${TYPE_NAME[st.type]}`;
  $("whoopHint").innerHTML = `Start WHOOP as <b>${whoopFor(st.type, st.loc, steps)}</b> when you tap Start. One activity for the whole session.`;
}
export function initPlan(){
  $("startBtn").onclick=()=>{ unlockAudio(); start(); };
}
