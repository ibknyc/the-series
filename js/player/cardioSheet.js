/* After a machine block: what the screen said, so next time has a number to beat. */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { st, save } from "../store.js";
import { fmtSecs } from "../util/format.js";
import { BLOCKS } from "../data/catalog.js";
import { MNAME, UNITS, DEF_UNIT, LEVEL_LAB } from "../data/cardio.js";
import { P } from "./state.js";
import { CUE, say } from "./audio.js";
import { logLeaving } from "./session.js";
import { sheetShow, nextBtn, continueTo } from "./sheet.js";

function openCardioSheet(){
  const cur=P.steps[P.i], m=cur.mach;
  logLeaving(P.i+1); const row=P.lastCardio && P.lastCardio.segment===cur.name ? P.lastCardio : null;
  st.cardioUnit=st.cardioUnit||{};
  const prev=[...st.cardio].reverse().find(r=>r!==row && r.modality===m && r.metric!=="" && r.metric!==undefined);
  $("shRate").hidden=true; $("shRestWrap").hidden=true; $("shDrop").hidden=true; $("shCardio").hidden=false;
  $("shKick").textContent = `${MNAME(m)} · ${fmtSecs(Math.round(P.t))}${P.t>cur.dur+5?` (planned ${fmtSecs(cur.dur)})`:""}`;
  $("shTitle").textContent = cur.name + " done";
  $("cLast").innerHTML = prev ? `Last time on the ${MNAME(m).toLowerCase()}: <b>${prev.metric} ${prev.metric_unit}</b> in ${fmtSecs(prev.seconds)}${prev.level!==""?`, ${(LEVEL_LAB[m]||"level").toLowerCase()} ${prev.level}`:""}.` : "Type what the machine's screen shows, so next time has a number to beat. Skip it if you'd rather not.";
  const u=$("cUnit"); u.innerHTML=UNITS.map(x=>`<option>${x}</option>`).join(""); u.value = cur.pclass==="ftp" ? "avg W" : (st.cardioUnit[m] || DEF_UNIT[m] || "m");
  $("cMetric").value=""; $("cLevel").value=""; const ll=LEVEL_LAB[m]===undefined?"Level":LEVEL_LAB[m];
  $("cLevelLab").textContent=ll; $("cLevel").parentElement.hidden=!ll;
  if (cur.pclass==="ftp") $("cLast").innerHTML = `Type your <b>average output for the 20 minutes</b> (avg W). Your new FTP is 95% of it${st.ftp?`; the old one was ${st.ftp} W`:""}.`;
  const upd=()=>{ if (!row) return; const v=parseFloat($("cMetric").value); row.metric = v>0 ? v : ""; row.metric_unit = v>0 ? u.value : ""; const lv=parseFloat($("cLevel").value); row.level = lv>=0 && $("cLevel").value!=="" ? lv : ""; st.cardioUnit[m]=u.value; save(); };
  $("cMetric").oninput=upd; u.onchange=upd; $("cLevel").oninput=upd;
  const ce=$("cEff"); ce.innerHTML="";
  for (let n=1;n<=10;n++){ const b=document.createElement("button"); b.type="button"; b.textContent=n; b.setAttribute("aria-pressed","false");
    b.onclick=()=>{ ce.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); if (row){ row.effort=n; save(); } }; ce.appendChild(b); }
  $("shNext").innerHTML=""; const nx=P.steps[P.i+1];
  $("shNextH").textContent="What's next?";
  nextBtn(nx ? `On to ${nx.name.toLowerCase()}` : "Finish", nx && nx.mach ? MNAME(nx.mach) : (nx?BLOCKS[nx.block].name:""), true, ()=>{ $("shCardio").hidden=true; continueTo(P.i+1); });
  sheetShow(true); CUE.setEnd(); say(`${cur.name} done.`);
}

export function initCardioSheet(){
  on("player:machine-done", openCardioSheet);
}
