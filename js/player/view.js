/* What the player shows for the step you're on. Reads the session; never moves it. */
import { $ } from "../util/dom.js";
import { st } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { BLOCKS } from "../data/catalog.js";
import { GUIDE } from "../data/guide.js";
import { curW, isEst } from "../progress/weights.js";
import { stageOf, setStage, factFor } from "../progress/stages.js";
import { P } from "./state.js";
import { say } from "./audio.js";

const SOUND_LABELS=["Voice on","Beeps only","Silent"];
export function renderSound(){ $("pSound").textContent=SOUND_LABELS[st.sound]; }

/* the start lights */
export function lights(n){ /* n = 0..5 lit, -1 = GO (all out), null = hide */
  const el=$("lights"); if (!el) return;
  el.hidden = (n===null || n===undefined);
  el.classList.toggle("go", n===-1);
  [...el.children].forEach((d,i)=>d.classList.toggle("on", n>0 && i<n));
}
export function announce(){
  const s=P.steps[P.i], extra=s.chips.filter(c=>/side|reps|Round|rounds/.test(c)).join(", ");
  const w=curW(s);
  say(`${s.name}${extra?". "+extra:""}${w?`. ${w} pounds`:""}`);
}
export function showStep(){
  const s=P.steps[P.i], b=BLOCKS[s.block];
  $("pBlock").innerHTML=`<i style="background:${b.color}"></i>${b.name}`;
  $("pName").textContent=s.name; $("pCue").textContent=s.cue; renderGuide(s);
  const ch=$("pChips"); ch.innerHTML="";
  s.chips.forEach(c=>{ const e=document.createElement("span"); e.className="chip"; e.textContent=c; ch.appendChild(e); });
  const w=curW(s);
  if (s.plannedW===undefined){ const sib=P.steps.filter(x=>x.unit && x.unit===s.unit); (sib.length?sib:[s]).forEach(x=>{ if (x.plannedW===undefined) x.plannedW = w||""; }); }
  $("pTrackU").textContent = s.db==="AB" ? "lb each" : "lb";
  if (w){ const e=document.createElement("span"); e.className="chip w"; e.textContent = (s.track && st.aim[s.track] ? "Aim " : isEst(s) ? "Start ~" : "") + w + (s.db==="AB" ? " lb each" : " lb"); ch.appendChild(e); }
  $("pSwap").hidden = !(s.unit || s.mach);
  $("pSkip").textContent = s.lap ? s.doneLabel : s.tapEnd ? "I'm done" : s.unit ? "Done" : s.mach ? "Next" : "Skip";
  $("pPlus").hidden = !s.ivl || !s.work;
  if (s.climb){ const r=(st.stairs||{})[s.name]; if (r){ const e=document.createElement("span"); e.className="chip w"; e.textContent=`Last ${fmtSecs(r.last)} · Best ${fmtSecs(r.best)}`; ch.appendChild(e); } }
  const tr=$("pTrack"); tr.hidden=!s.track;
  if (s.track){ $("pTrackIn").value = curW(s) || ""; $("pTrackIn").placeholder="—"; }
  const n=P.steps[P.i+1];
  $("pNextWrap").style.visibility = n?"visible":"hidden";
  if (n){ const sd=n.chips.find(c=>/side/.test(c)); $("pNext").textContent = n.name + (sd?`, ${sd.toLowerCase()}`:""); }
  P.sub=-1; P.lastSec=-1;
}
/* stages: pick 1-3 on the player. facts: one per session for moves that don't scale. */
function renderGuide(s){
  const g=GUIDE[s.name]; if (!g) return;
  const box=document.createElement("div"); box.className="pguide";
  if (g.s){
    const cur=stageOf(s.name), row=document.createElement("div"); row.className="stg";
    row.innerHTML="<b>Stage</b>";
    [1,2,3].forEach(n=>{ const b=document.createElement("button"); b.type="button"; b.textContent=n;
      b.setAttribute("aria-pressed",String(n===cur)); b.setAttribute("aria-label",`Stage ${n}: ${g.s[n-1]}`);
      b.onclick=()=>{ setStage(s.name, n); $("pCue").textContent=s.cue; renderGuide(s); };
      row.appendChild(b); });
    const tx=document.createElement("div"); tx.className="stx";
    tx.textContent = g.s[cur-1] + (cur===1 ? " (easier)" : cur===3 ? " (harder)" : "");
    box.append(row, tx);
  } else if (g.f){
    const tx=document.createElement("div"); tx.className="fact"; tx.textContent=factFor(s.name); box.append(tx);
  }
  $("pCue").appendChild(box);
}
