export const $ = id => document.getElementById(id);
export const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Buttons that nudge a number field: <button class="stp" data-for="fieldId" data-step="5">.
   The field fires its own input event, so whatever already listens to typing hears the tap too. */
export function initSteppers(root=document){
  root.querySelectorAll("button.stp").forEach(b=>{ b.onclick=()=>{
    const f=$(b.dataset.for), v=Math.max(0, (parseFloat(f.value)||0) + (+b.dataset.step));
    f.value=v||""; f.dispatchEvent(new Event("input", {bubbles:true}));
  }; });
}

/* a row of buttons where one is picked */
export function seg(el, items, current, onPick){
  el.innerHTML="";
  items.forEach(it=>{ const b=document.createElement("button"); b.type="button"; b.textContent=it.name; b.setAttribute("aria-pressed",String(it.id===current)); b.onclick=()=>onPick(it.id); el.appendChild(b); });
}
