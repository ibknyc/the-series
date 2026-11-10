/* The sheet that slides up over the player when it needs you: after a set, after a machine block,
   to swap, to end early. This file is the frame; each use fills it in. */
import { $ } from "../util/dom.js";
import { on } from "../util/bus.js";
import { P } from "./state.js";
import { hush } from "./audio.js";
import { lights } from "./view.js";
import { setRun, retotal, go } from "./session.js";

/* opening pauses the clock; closing starts it again */
export function sheetShow(isOpen){ P.sheet=isOpen; $("sheet").hidden=!isOpen; if (isOpen){ P.run=false; P.lastCue=null; lights(null); hush(); } else { setRun(true); } }
/* close without restarting the clock (the session is ending) */
export function sheetDismiss(){ $("sheet").hidden=true; P.sheet=false; }
/* which parts of the sheet show */
export function sheetParts({rate=false, rest=false, drop=false, cardio}={}){
  $("shRate").hidden=!rate; $("shRestWrap").hidden=!rest; $("shDrop").hidden=!drop;
  if (cardio!==undefined) $("shCardio").hidden=!cardio;
}
export function sheetHead(kick, title, nextH){ $("shKick").textContent=kick; $("shTitle").textContent=title; if (nextH!==undefined) $("shNextH").textContent=nextH; }
export const clearNext = () => { $("shNext").innerHTML=""; };
export function nextBtn(label, sub, primary, fn){
  const b=document.createElement("button"); if (primary) b.className="primary";
  b.innerHTML=`<span>${label}</span>${sub?`<small>${sub}</small>`:""}`; b.onclick=fn; $("shNext").appendChild(b);
}
/* buttons that throw away the rest of the lifting need a second tap: a fat finger shouldn't end the session */
export function confirmBtn(label, sub, fn){
  nextBtn(label, sub, false, function(){ const b=this; if (b.dataset.armed){ fn(); return; }
    b.dataset.armed="1"; b.innerHTML=`<span>Tap again to end the lifting</span><small>Or pick something else</small>`;
    setTimeout(()=>{ if (b.isConnected){ delete b.dataset.armed; b.innerHTML=`<span>${label}</span>${sub?`<small>${sub}</small>`:""}`; } }, 4000); });
}
export function continueTo(i){ sheetShow(false); retotal(); go(i); }

export function initSheet(){
  on("player:stopped", ()=>{ $("sheet").hidden=true; });
}
