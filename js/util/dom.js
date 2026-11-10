export const $ = id => document.getElementById(id);
export const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* a row of buttons where one is picked */
export function seg(el, items, current, onPick){
  el.innerHTML="";
  items.forEach(it=>{ const b=document.createElement("button"); b.type="button"; b.textContent=it.name; b.setAttribute("aria-pressed",String(it.id===current)); b.onclick=()=>onPick(it.id); el.appendChild(b); });
}
