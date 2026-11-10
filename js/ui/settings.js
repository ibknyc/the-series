/* The bottom of the home screen: sound, export and backup, version and update. */
import { $ } from "../util/dom.js";
import { st, save, restore, changed } from "../store.js";
import { APP_VER } from "../version.js";
import { CUE, unlockAudio } from "../player/audio.js";
import { exportZip, exportBackup } from "../export/index.js";

function testSound(){
  unlockAudio();
  CUE.tick(); setTimeout(()=>CUE.tick(),420); setTimeout(()=>CUE.tick(),840); setTimeout(()=>CUE.go(),1260);
  setTimeout(()=>{
    $("sndState").textContent = "3 ticks, then GO";
    $("sndNote").textContent = "Beeps now play like media, so the silent switch shouldn't block them. Still nothing? Turn the media volume up (buttons on the side while this page is open), then tap Test sound again.";
  }, 1500);
}
function restoreFrom(e){
  const f=e.target.files[0]; if (!f) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if (!d || typeof d!=="object" || !("phase" in d)) throw new Error("not a Series export");
      if (!confirm("Replace everything on this device with the imported file?")) return;
      restore(d); changed(); $("ioNote").textContent="Imported.";
    }catch(err){ $("ioNote").textContent="That file didn't look like a Series export. Nothing changed."; }
    e.target.value="";
  };
  r.readAsText(f);
}
/* Ask for the new version first: it installs as a whole, then the page reloads onto it.
   If there isn't one, or that doesn't take, throw away the cached copy and load fresh. */
async function forceUpdate(){
  $("fuBtn").textContent="Updating…";
  try{
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg){ await reg.update(); if (reg.installing || reg.waiting) await new Promise(r=>setTimeout(r, 10000)); }
  }catch(e){}
  try{ if (window.caches) for (const k of await caches.keys()) await caches.delete(k); }catch(e){}
  try{ if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); }catch(e){}
  location.reload();
}
export function initSettings(){
  $("brOn").checked = st.breath!==false;
  $("brOn").onchange=e=>{ st.breath=e.target.checked; save(); };
  $("testSnd").onclick=testSound;
  $("csvBtn").onclick=()=>{ const T=exportZip();
    $("ioNote").textContent=`Exported ${T.sessions.length} sessions, ${T.sets.length} sets, ${T.cardio.length} cardio blocks, ${T.gates.length} gate tests.`; };
  $("lastBtn").onclick=()=>{ const l=[...st.log].reverse().find(x=>x.done!=="skipped"); if (l){ exportZip(l.id); $("ioNote").textContent=`Exported ${l.d}${l.start?" "+l.start:""}.`; } };
  $("expBtn").onclick=()=>{ exportBackup(); $("ioNote").textContent="Exported. Keep the file somewhere that isn't this phone."; };
  $("impBtn").onclick=()=>$("impFile").click();
  $("impFile").onchange=restoreFrom;
  $("fuBtn").onclick=forceUpdate;
  $("verNote").textContent = `The Series ${APP_VER} · sound ${["voice + beeps","beeps only","silent"][st.sound||0]}`;
}
