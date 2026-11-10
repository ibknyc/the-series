/* Sound: beeps and the spoken cues. st.sound: 0 voice + beeps, 1 beeps only, 2 silent. */
import { st } from "../store.js";

let AC=null;
function ctx(){
  try{
    if (!AC){
      AC = new (window.AudioContext||window.webkitAudioContext)();
    }
    if (AC.state!=="running") AC.resume();
    return AC;
  }catch(e){ return null; }
}
/* any tap is a chance to revive a context iOS put to sleep */
["pointerdown","touchend","click"].forEach(ev=>document.addEventListener(ev, ()=>{ if (AC && AC.state!=="running") AC.resume(); }, {passive:true, capture:true}));
document.addEventListener("visibilitychange", ()=>{ if (!document.hidden && AC && AC.state!=="running") AC.resume(); });
/* one voice. when = seconds from now. shape: 'blip' hard attack, 'bell' soft */
function tone(freq, dur, vol, when=0, shape="bell", glideTo=0){
  if (st.sound===2) return;
  const a=ctx(); if (!a) return;
  const t0=a.currentTime+when;
  const o=a.createOscillator(), g=a.createGain(), f=a.createBiquadFilter();
  o.type = shape==="blip" ? "square" : "sine";
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0+dur);
  f.type="lowpass"; f.frequency.setValueAtTime(shape==="blip"?2600:1800, t0); f.Q.value=.7;
  g.gain.setValueAtTime(.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + (shape==="blip"?.004:.02));
  g.gain.exponentialRampToValueAtTime(.0001, t0+dur);
  o.connect(f); f.connect(g); g.connect(a.destination);
  o.start(t0); o.stop(t0+dur+.03);
}
const WCUE = {
  tick:  ()=>{ tone(760,.085,.20,0,"blip"); },            /* 3 .. 2 .. 1 */
  go:    ()=>{ tone(1180,.50,.26,0,"blip"); tone(1770,.50,.09,.004,"bell"); },  /* beeeeep */
  setEnd:()=>{ tone(784,.16,.13,0,"bell"); tone(523,.34,.11,.11,"bell"); },     /* soft two-note down */
  step:  ()=>{ tone(880,.10,.10,0,"bell"); },             /* quiet move-on */
  hold:  ()=>{ tone(560,.07,.09,0,"bell"); },             /* subtle hold countdown */
  hard:  ()=>{ tone(990,.14,.18,0,"blip"); },
  /* flow cues: a rise on the inhale, a fall on the exhale, a neutral tap
     for every other pose change. Quiet on purpose. */
  inhale:()=>{ tone(494,.20,.075,0,"bell",659); },
  exhale:()=>{ tone(587,.26,.075,0,"bell",392); },
  move:  ()=>{ tone(700,.06,.05,0,"bell"); },
  easy:  ()=>{ tone(600,.14,.14,0,"bell"); },
  finish:()=>{ tone(659,.18,.16,0,"bell"); tone(988,.45,.16,.17,"bell"); }
};
/* ---- Media-element cues. iOS mutes Web Audio with the ring/silent switch
   and suspends it whenever speech plays; <audio> elements don't have either
   problem. Each cue is rendered once to a WAV and played from a small pool. ---- */
const CUE_SPEC = {
  tick:  [[760,.085,.20,0,"blip"]],
  go:    [[1180,.50,.26,0,"blip"],[1770,.50,.09,.004,"bell"]],
  setEnd:[[784,.16,.13,0,"bell"],[523,.34,.11,.11,"bell"]],
  step:  [[880,.10,.10,0,"bell"]],
  hold:  [[560,.07,.09,0,"bell"]],
  hard:  [[990,.14,.18,0,"blip"]],
  inhale:[[494,.20,.075,0,"bell",659]],
  exhale:[[587,.26,.075,0,"bell",392]],
  move:  [[700,.06,.05,0,"bell"]],
  easy:  [[600,.14,.14,0,"bell"]],
  finish:[[659,.18,.16,0,"bell"],[988,.45,.16,.17,"bell"]]
};
function renderWav(parts){
  const SR=22050, end=Math.max(...parts.map(p=>p[3]+p[1]))+.04, n=Math.ceil(SR*end), buf=new Float32Array(n);
  parts.forEach(([f,d,v,when,shape,glide])=>{
    const s0=Math.floor(when*SR), len=Math.floor(d*SR), att=shape==="blip"?.004:.02; let ph=0;
    for(let i=0;i<len && s0+i<n;i++){
      const t=i/SR, fr = glide ? f*Math.pow(glide/f, t/d) : f;
      ph += 2*Math.PI*fr/SR;
      const x = shape==="blip" ? Math.sin(ph)+0.3*Math.sin(3*ph)+0.12*Math.sin(5*ph) : Math.sin(ph);
      const env = t<att ? t/att : Math.exp(-4.6*(t-att)/Math.max(.01,d-att));
      buf[s0+i] += x*env*v*3.4;
    }
  });
  const ab=new ArrayBuffer(44+n*2), dv=new DataView(ab), w=(o,str)=>{ for(let i=0;i<str.length;i++) dv.setUint8(o+i,str.charCodeAt(i)); };
  w(0,"RIFF"); dv.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,SR,true); dv.setUint32(28,SR*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true); w(36,"data"); dv.setUint32(40,n*2,true);
  for(let i=0;i<n;i++){ const v=Math.max(-1,Math.min(1,buf[i])); dv.setInt16(44+i*2, v*32767, true); }
  return URL.createObjectURL(new Blob([ab],{type:"audio/wav"}));
}
const POOL={}, POOL_N=3; let poolIx={}, unlocked=false;
try{ for (const k in CUE_SPEC){ const url=renderWav(CUE_SPEC[k]); POOL[k]=[]; poolIx[k]=0;
  for(let i=0;i<POOL_N;i++){ const a=new Audio(url); a.preload="auto"; a.setAttribute("playsinline",""); POOL[k].push(a); } } }catch(e){}
/* must run inside a tap: plays every element once, muted, so iOS lets it play later on its own */
/* "transient" = short sounds over other audio: your music dips for a beep and comes back.
   Only called from Start, Resume and Test sound, never from an ordinary tap, so just
   opening the app leaves your music alone. */
export function unlockAudio(){
  try{ if (navigator.audioSession) navigator.audioSession.type="transient"; }catch(e){}
  if (unlocked) return; unlocked=true;
  for (const k in POOL) POOL[k].forEach(a=>{ a.muted=true; const p=a.play(); if (p&&p.then) p.then(()=>{ a.pause(); a.currentTime=0; a.muted=false; }).catch(()=>{ a.muted=false; unlocked=false; }); else { a.pause(); a.muted=false; } });
}
function playCue(k){
  if (st.sound===2) return;
  const list=POOL[k]; if (!list || !list.length){ WCUE[k] && WCUE[k](); return; }
  const a=list[poolIx[k]++ % list.length];
  try{ a.muted=false; a.currentTime=0; const p=a.play(); if (p&&p.catch) p.catch(()=>{ WCUE[k] && WCUE[k](); }); }catch(e){ WCUE[k] && WCUE[k](); }
}
export const CUE = {}; Object.keys(CUE_SPEC).forEach(k=>CUE[k]=()=>playCue(k));

export function say(text){
  if (st.sound!==0 || !("speechSynthesis" in window)) return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    /* iOS hands the audio session to speech and leaves Web Audio suspended */
    u.onend = u.onerror = ()=>{ if (AC && AC.state!=="running") AC.resume(); };
    speechSynthesis.speak(u);
  }catch(e){}
}
/* stop talking */
export const hush = () => { if ("speechSynthesis" in window) speechSynthesis.cancel(); };
