/* Swap: the station's taken, or you're not feeling it. Another variant, another machine,
   another order, or skip it. */
import { st } from "../store.js";
import { CARDIO, MNAME, SWAP_POOL } from "../data/cardio.js";
import { remainingUnitsInSet, dropSlot, unitFirst, swapVariant, swapMachine } from "../engine/plan-edit.js";
import { P } from "./state.js";
import { showStep } from "./view.js";
import { retotal, finish } from "./session.js";
import { sheetShow, sheetParts, sheetHead, clearNext, nextBtn, continueTo } from "./sheet.js";

/* carry on from a rewritten step list */
function replan({steps, start}){ P.steps=steps; P.i=start; continueTo(start); }

function toMachine(from, to){
  swapMachine(P.steps, P.i, from, to, CARDIO[from], CARDIO[to]);
  const t=P.t; showStep(); P.t=t; sheetShow(false);
}
function skipExercise(cur){
  const r=dropSlot(P.steps, cur); P.steps=r.steps;
  retotal(); if (r.start>=P.steps.length){ sheetShow(false); finish(); return; } continueTo(r.start);
}
export function openSwap(){
  const cur=P.steps[P.i];
  sheetParts({cardio:false}); clearNext();
  if (cur.mach){
    const pool=SWAP_POOL[P.loc==="gym" ? "gym" : "home"].filter(k=>k!==cur.mach);
    const ticked=pool.filter(k=>st.eq[k]), list=ticked.length?ticked:pool;
    sheetHead("Not feeling it, or it's taken?", `Instead of the ${MNAME(cur.mach).toLowerCase()}`, "Switch to");
    list.forEach(k=>nextBtn(MNAME(k), `Every ${MNAME(cur.mach).toLowerCase()} block left today`, false, ()=>toMachine(cur.mach,k)));
    nextBtn("Never mind", "", true, ()=>sheetShow(false));
    sheetShow(true); return;
  }
  sheetHead("Station taken, or not feeling it?", `Instead of ${cur.name.toLowerCase()}`, cur.vnames && cur.vnames.length>1 ? "Swap to" : "Options");
  (cur.vnames||[]).forEach((n,vi)=>{ if (vi===cur.vi) return; nextBtn(n, "Also swaps the remaining sets", false, ()=>replan(swapVariant(P.steps, P.i, cur.slot, vi))); });
  nextBtn(`Skip ${cur.name.toLowerCase()} today`, "Drops every set of it", false, ()=>skipExercise(cur));
  remainingUnitsInSet(P.steps, P.i).filter(u=>u!==cur.unit).forEach(u=>{
    const first=P.steps.find((s,k)=>k>P.i && s.unit===u);
    nextBtn(`Do ${first.name.toLowerCase()} first`, "Come back to this one", false, ()=>replan(unitFirst(P.steps, cur, u)));
  });
  nextBtn("Never mind", "", true, ()=>sheetShow(false));
  sheetShow(true);
}
