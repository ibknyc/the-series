/* Last 7 days, and logging a session done without the timer. */
import { $ } from "../util/dom.js";
import { dkey, hhmm } from "../util/time.js";
import { st, realLog, changed } from "../store.js";
import { TYPE_NAME } from "../data/catalog.js";
import { newEntry } from "../log/entries.js";

export function renderWeek(){
  const wk=$("week"); wk.innerHTML="";
  const letters=["Su","Mo","Tu","We","Th","Fr","Sa"]; let days=0, sessions=0;
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i); const key=dkey(d);
    const es=realLog().filter(l=>l.d===key), last=es[es.length-1];
    if (es.length){ days++; sessions+=es.length; }
    const el=document.createElement("div"); el.className="day";
    if (i===0) el.classList.add("istoday");
    el.innerHTML=`<span class="pip ${last?"on":""}" style="${last?`background:var(--${last.r})`:""}">${es.length>1?`<b>${es.length}</b>`:""}</span><span>${letters[d.getDay()]}<br><span class="dnum">${d.getDate()}</span></span>`;
    el.title = es.length ? es.map(e=>`${TYPE_NAME[e.t]||"session"}, ${e.m} min`).join("; ") : key;
    wk.appendChild(el);
  }
  fillManDay();
  $("manNote").textContent = `Logs as ${TYPE_NAME[st.type]}, Phase ${st.phase}, ${st.loc==="gym"?"work gym":"home"}. Change those above first if that's not what you did.`;
  $("weekNote").textContent = `Rolling week, oldest on the left. Today is ${new Date().toLocaleDateString(undefined,{weekday:"long"})}, on the right.`;
  const inPhase=realLog().filter(l=>l.p===st.phase).length;
  $("logNote").textContent = days===0 ? "Nothing logged this week. Today's a good day to start." :
    `${days} of 7 days, ${sessions} ${sessions===1?"session":"sessions"}. ${inPhase} logged in Phase ${st.phase}.`;
}
function fillManDay(){
  const sel=$("manDay"), keep=sel.value; sel.innerHTML="";
  for (let i=0;i<7;i++){
    const d=new Date(); d.setDate(d.getDate()-i);
    const o=document.createElement("option"); o.value=dkey(d);
    o.textContent = i===0 ? "Today" : i===1 ? "Yesterday" : d.toLocaleDateString(undefined,{weekday:"long"});
    sel.appendChild(o);
  }
  if (keep && [...sel.options].some(o=>o.value===keep)) sel.value=keep;
}
export function initWeek(){
  $("manBtn").onclick=()=>{
    const v=parseInt($("manMins").value)||0, day=$("manDay").value, tm=$("manTime").value;
    if (v<1){ $("manMins").focus(); return; }
    const m=Math.min(240,v);
    let end=""; if (tm){ const [h,mi]=tm.split(":").map(Number), e=new Date(2000,0,1,h,mi+m); end=hhmm(e); }
    newEntry({d:day, start:tm||"", end, m, done:"full", manual:true});
    $("manMins").value=""; $("manTime").value=""; changed();
  };
  $("skipBtn").onclick=()=>{ newEntry({d:$("manDay").value, start:"", end:"", m:0, done:"skipped"}); $("manNote").textContent="Skipped day logged. It shows in the export but doesn't count toward the week."; };
}
