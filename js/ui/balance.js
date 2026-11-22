/* The weekly balance note: a movement pattern missing for 7 days, and the fixes. Add a short block to
   today's session, or, at home, make today a Full session if that covers it. */
import { $ } from "../util/dom.js";
import { st, commit } from "../store.js";
import { total } from "../engine/steps.js";
import { covered } from "../engine/balance.js";
import { sessionFor } from "../progress/today.js";
import { missingPatterns, patternNames, balanceOn, setBalance } from "../progress/balance.js";

const or = a => a.length<2 ? a.join("") : a.slice(0,-1).join(", ")+" or "+a.at(-1);
const and = a => a.length<2 ? a.join("") : a.slice(0,-1).join(", ")+" and "+a.at(-1);

export function renderBalance(){
  const box=$("balNote"), gaps=missingPatterns();
  if (!gaps.length || st.type==="yoga" || st.rec==="red"){ box.hidden=true; return; }
  const plain=sessionFor(st.rec, {balance:null}), open=gaps.filter(p=>!covered(plain).has(p));
  if (!open.length){ box.hidden=true; return; }   /* today's session covers it already */
  box.hidden=false;
  if (balanceOn()){
    box.innerHTML = `<b>Added:</b> a short ${and(patternNames(open))} block before the cool-down. <button type="button" class="ghost" id="balOff" style="margin-top:8px">Take it out</button>`;
    $("balOff").onclick=()=>{ setBalance(false); commit(); };
    return;
  }
  const mins=Math.max(1, Math.round((total(sessionFor(st.rec, {balance:gaps}))-total(plain))/60));
  const fullHelps = st.loc==="home" && st.type!=="full" && open.some(p=>covered(sessionFor(st.rec, {type:"full", balance:null})).has(p));
  box.innerHTML = `<b>No ${or(patternNames(open))} work in 7 days.</b> It's the base for capoeira, and it slips when the gym carries the week. `
    + `<button type="button" class="ghost" id="balOn" style="margin-top:8px">Add a ${mins}-minute block</button>`
    + (fullHelps ? ` <button type="button" class="ghost" id="balFull" style="margin-top:8px">Make today a Full session</button>` : "");
  $("balOn").onclick=()=>{ setBalance(true); commit(); };
  if (fullHelps) $("balFull").onclick=()=>{ st.type="full"; commit(); };
}
export function initBalance(){}
