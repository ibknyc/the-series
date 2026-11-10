/* The gate to the next phase: tests you tick off, or log a result against. */
import { $, reduced } from "../util/dom.js";
import { today } from "../util/time.js";
import { st, commit } from "../store.js";
import { GATES } from "../data/catalog.js";

function pass(i){ st.gates[st.phase]=st.gates[st.phase]||[]; st.gates[st.phase][i]=true; }

export function renderGates(){
  const g=GATES[st.phase], gs=st.gates[st.phase]||[];
  $("gateTitle").textContent = st.phase<4 ? `Gate to Phase ${st.phase+1}` : "Phase 4 roadmarks";
  const gl=$("gateList"); gl.innerHTML="";
  g.forEach((t,i)=>{
    const li=document.createElement("li"), id=`g${st.phase}_${i}`;
    const tests=st.gateLog.filter(x=>x.gate===t), last=tests[tests.length-1];
    li.innerHTML=`<label for="${id}"><input type="checkbox" id="${id}" ${gs[i]?"checked":""}><span>${t}${last?`<span class="glast">Last test ${last.date}: ${last.result||"—"} (${last.pass==="y"?"passed":"not yet"})</span>`:""}</span></label>
      <button class="glink" type="button">Log a test</button>
      <div class="gtest" hidden><input type="text" placeholder="Result, e.g. crow 4s" aria-label="Result"><button type="button" data-p="y">Passed</button><button type="button" data-p="n">Not yet</button></div>`;
    li.querySelector("input[type=checkbox]").onchange=e=>{ st.gates[st.phase]=st.gates[st.phase]||[]; st.gates[st.phase][i]=e.target.checked;
      if (e.target.checked) st.gateLog.push({date:today(), gate:t, result:"", pass:"y"}); commit(); };
    const form=li.querySelector(".gtest");
    li.querySelector(".glink").onclick=()=>{ form.hidden=!form.hidden; if (!form.hidden) form.querySelector("input").focus(); };
    form.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const result=b.dataset.p; st.gateLog.push({date:today(), gate:t, result:form.querySelector("input").value.trim(), pass:result});
      if (result==="y") pass(i);
      commit(); });
    gl.appendChild(li);
  });
  const done=g.every((_,i)=>gs[i]), gb=$("gateBtn");
  if (done && st.phase<4){ $("gateNote").textContent=`Gate cleared. Phase ${st.phase+1} is yours.`; gb.hidden=false; gb.textContent=`Move to Phase ${st.phase+1}`; gb.onclick=()=>{ st.phase++; commit(); window.scrollTo({top:0,behavior:reduced?"auto":"smooth"}); }; }
  else if (done){ $("gateNote").textContent="All four done. The series is yours now. Add to it."; gb.hidden=true; }
  else { $("gateNote").textContent = st.phase<4 ? "Tick these off when they're true on a normal day, not your best day." : "Open-ended from here. Tick them off as they come."; gb.hidden=true; }
}
