/* Dumbbells: what you own at home (tap chips), or the pairs you grab at the gym. */
import { $ } from "../util/dom.js";
import { st, commit } from "../store.js";
import { homeInv } from "../progress/weights.js";

export function renderWeights(){
  const atGym = st.loc==="gym";
  $("dbLabel").textContent = atGym ? "Dumbbells at the gym" : "Dumbbells at home";
  $("dbOn").parentElement.style.display = atGym ? "none" : "";
  $("lbHeavy").textContent = atGym ? "Heavy pair (rows, RDLs, goblet)" : "Heavy pair";
  $("lbLight").textContent = atGym ? "Light pair (presses, split squats)" : "Light pair, for pressing";
  $("dbOn").checked=st.dbOn;
  $("wHeavy").value = atGym ? st.gymHeavy : st.heavy;
  $("wLight").value = atGym ? st.gymLight : st.light;
  $("weights").classList.toggle("off", !atGym && !st.dbOn);
  $("invWrap").hidden = atGym; renderInv();
  document.querySelector("#weights .wgrid").hidden = !atGym;
  $("wNote").textContent = atGym
    ? "What you can actually grab at work. These show as a suggestion — log what you really used during the set."
    : st.phase===1 && st.type!=="strength"
    ? (st.dbOn ? "Phase 1 full and yoga sessions only load the glute bridge. On purpose." : "Off swaps in bodyweight versions of every loaded move.")
    : (st.dbOn ? "Heavy pair for squats, rows, deadlifts and holds. Light pair for presses." : "Off swaps in bodyweight versions of every loaded move.");
}
/* tap chips instead of typing: the iPhone number pad has no comma, so a typed list was stuck on one pair */
function renderInv(){
  const box=$("wInv"), own=homeInv(); box.innerHTML="";
  [...new Set([5,8,10,12,15,20,25,30,35,40,45,50,...own])].sort((a,b)=>a-b).forEach(w=>{
    const b=document.createElement("button"); b.type="button"; b.textContent=w; b.setAttribute("aria-pressed", String(own.includes(w)));
    b.onclick=()=>{ let v=homeInv(); v = v.includes(w) ? v.filter(x=>x!==w) : [...v,w];
      if (!v.length) return; v.sort((a,b)=>a-b);
      st.homeInv=v; st.heavy=v[v.length-1]; st.light=v.length>1?v[v.length-2]:v[0]; st.dbOn=true; commit(); };
    box.appendChild(b); });
}
export function initWeights(){
  $("dbOn").onchange=e=>{ st.dbOn=e.target.checked; commit(); };
  $("wHeavy").onchange=e=>{ const v=Math.max(0,parseInt(e.target.value)||0); if (st.loc==="gym") st.gymHeavy=v; else st.heavy=v; commit(); };
  $("wLight").onchange=e=>{ const v=Math.max(0,parseInt(e.target.value)||0); if (st.loc==="gym") st.gymLight=v; else st.light=v; commit(); };
}
