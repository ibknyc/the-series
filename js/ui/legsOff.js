/* Legs off: a gym lifting day with no leg press, RDL or single-leg work, and an extra push and pull
   instead. For the day after legs, when the rest of you is fine. Lasts the day. */
import { $ } from "../util/dom.js";
import { commit } from "../store.js";
import { legsOffDay, legsOff, setLegsOff } from "../progress/today.js";

export function renderLegsOff(){
  const show=legsOffDay(); $("legsBox").hidden=!show; if (!show) return;
  $("legsOn").checked=legsOff();
  $("legsNote").textContent = legsOff()
    ? "No leg press, RDL or single-leg work today: an extra push and pull instead. Back to normal tomorrow."
    : "Tired legs? Drop the leg work for today and get an extra push and pull instead.";
}
export function initLegsOff(){
  $("legsOn").onchange=e=>{ setLegsOff(e.target.checked); commit(); };
}
