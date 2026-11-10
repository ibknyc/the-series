/* Saved state: one object in localStorage, mutated in place and saved after each change.
   Its shape is the user's history. Don't change it without a migration here. */
import { emit } from "./util/bus.js";
import { FALLBACK, KEPT } from "./data/looks.js";

export const KEY = "the-series-v1";
const LIVE = KEY+"-live";
const LIVE_MAX_AGE = 3*3600*1000;

export const st = { phase:1, rec:"yellow", type:"full", loc:"home", eq:{machines:true,bench:true,smith:true,barbell:false,bar:true,rower:true,elliptical:true,gymbike:true,climber:true,tread:true,run:true,stairs:true,peloton:true,outbike:true,rope:true},
  dbOn:false, skin:"plain", layout:"split", face:"standard", breath:true, heavy:30, light:20, gymHeavy:40, gymLight:30, gates:{1:[],2:[],3:[],4:[]}, log:[], sound:0, lifts:{}, aim:{}, abOv:null, secOv:null, sets:[], cardio:[], gateLog:[], daily:{} };

export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e){} };
export const changed = () => emit("state:changed");
export const commit = () => { save(); changed(); };
/* sessions that count: everything but logged skips */
export const realLog = () => st.log.filter(l=>l.done!=="skipped");

export function load(){
  try { const s = JSON.parse(localStorage.getItem(KEY)||"null"); if (s) Object.assign(st, {...s, gates:{...st.gates, ...(s.gates||{})}, eq:{...st.eq, ...(s.eq||{})}, lifts:{...(s.lifts||{})}, aim:{...(s.aim||{})}}); } catch(e){}
  migrate();
}
/* replace everything with a backup file */
export function restore(d){
  const next = {...st, ...d, gates:{...(d.gates||{})}, eq:{...st.eq, ...(d.eq||{})}, lifts:{...(d.lifts||{})}, aim:{...(d.aim||{})}, log:d.log||[]};
  Object.keys(st).forEach(k=>delete st[k]); Object.assign(st, next);
  migrate(); save();
}
/* bring older saved data up to the current shape. Never drops history. */
function migrate(){
  ["sets","cardio","gateLog"].forEach(k=>{ if (!Array.isArray(st[k])) st[k]=[]; });
  if (!st.daily || typeof st.daily!=="object") st.daily={};
  st.log.forEach((l,i)=>{
    if (!l.id) l.id=`s_${l.d.replace(/-/g,"")}_legacy${i+1}`;
    if (!l.done) l.done = l.partial ? "partial" : "full";
    /* a session the phone killed mid-way: keep it, as partial */
    if (l.live){
      let r=null; try{ r=JSON.parse(localStorage.getItem(LIVE)||"null"); }catch(e){}
      if (r && r.sid===l.id && Date.now()-r.at < LIVE_MAX_AGE) return;
      l.live=false; l.done="partial"; if (!l.end && l.lastAt) l.end=l.lastAt; }
  });
  Object.keys(KEPT).forEach(k=>{ if (!KEPT[k].includes(st[k])) st[k]=FALLBACK[k]; });
}

/* the session in progress, kept separately so it survives iOS killing the app */
export const live = {
  write(o){ try{ localStorage.setItem(LIVE, JSON.stringify(o)); }catch(e){} },
  clear(){ try{ localStorage.removeItem(LIVE); }catch(e){} },
  read(){ try{ const r=JSON.parse(localStorage.getItem(LIVE)||"null"); return r && Date.now()-r.at < LIVE_MAX_AGE && st.log.some(l=>l.id===r.sid) ? r : null; }catch(e){ return null; } }
};
