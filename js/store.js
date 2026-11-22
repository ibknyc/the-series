/* Saved state: one object in localStorage, mutated in place and saved after each change.
   Its shape is the user's history. Don't change it without a migration here. */
import { emit } from "./util/bus.js";
import { FALLBACK, KEPT } from "./data/looks.js";
import { hhmm } from "./util/time.js";

export const KEY = "the-series-v1";
const LIVE = KEY+"-live";
const LIVE_MAX_AGE = 3*3600*1000;

export const st = { phase:1, rec:"yellow", type:"full", loc:"home", eq:{machines:true,aircable:true,bench:true,smith:true,barbell:false,bar:true,rower:true,elliptical:true,gymbike:true,climber:true,tread:true,run:true,stairs:true,peloton:true,outbike:true,rope:true},
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
/* "14:05" or "14:05:30" -> seconds since midnight */
const secsOf = t => { const [h,m,s]=String(t).split(":").map(Number); return h*3600+m*60+(s||0); };
const clockOf = secs => { const x=Math.round(secs/60)%1440; return String(Math.floor(x/60)).padStart(2,"0")+":"+String(x%60).padStart(2,"0"); };
/* how long a session ran, judged from what it logged: its start to the end of the last block it recorded.
   Returns seconds since its start's midnight, or null. */
function loggedEnd(l){
  if (!l.start) return null;
  const s0=secsOf(l.start), ends=[
    ...st.sets.filter(r=>r.session_id===l.id && r.start_time).map(r=>secsOf(r.start_time)+60),
    ...st.cardio.filter(r=>r.session_id===l.id && r.start_time).map(r=>secsOf(r.start_time)+(+r.seconds||0))
  ].map(x=>x<s0 ? x+86400 : x);
  if (l.end){ const e=secsOf(l.end); ends.push(e<s0 ? e+86400 : e); }
  return ends.length ? Math.max(...ends) : null;
}
/* bring older saved data up to the current shape. Never drops history. */
function migrate(){
  ["sets","cardio","gateLog"].forEach(k=>{ if (!Array.isArray(st[k])) st[k]=[]; });
  if (!st.daily || typeof st.daily!=="object") st.daily={};
  st.log.forEach((l,i)=>{
    if (!l.id) l.id=`s_${l.d.replace(/-/g,"")}_legacy${i+1}`;
    if (!l.done) l.done = l.partial ? "partial" : "full";
    /* a session the phone killed mid-way: keep it, as partial, ending where the step in progress would have */
    if (l.live){
      let r=null; try{ r=JSON.parse(localStorage.getItem(LIVE)||"null"); }catch(e){}
      if (r && r.sid===l.id && Date.now()-r.at < LIVE_MAX_AGE) return;
      l.live=false; l.done="partial"; l.partial=true;
      if (r && r.sid===l.id && r.ends){ const endAt=Math.max(r.at, r.ends); l.end=hhmm(new Date(endAt)); l.m=Math.max(1, Math.round((endAt-r.startedAt)/60000)); }
      else if (!l.end && l.lastAt) l.end=l.lastAt; }
    /* before v47 an unfinished session kept 0 minutes: work its length out from what it logged */
    if (!l.m && l.done!=="skipped" && !l.manual){
      const e=loggedEnd(l); if (e){ l.m=Math.max(1, Math.round((e-secsOf(l.start))/60)); if (!l.end) l.end=clockOf(e); }
    }
  });
  /* v47: the home front-rack squat and the gym goblet squat became one lift, "Front-rack DB squat" */
  ["lifts","aim"].forEach(k=>{ const a="Front-rack squat (home)", b="Front-rack DB squat (home)"; if (st[k] && st[k][a]!==undefined && st[k][b]===undefined) st[k][b]=st[k][a]; });
  if (st.stage && st.stage["Front-rack squat"]!==undefined && st.stage["Front-rack DB squat"]===undefined) st.stage["Front-rack DB squat"]=st.stage["Front-rack squat"];
  /* v44 kept an easy gym day as a bare date; it's now one of several choices for the day */
  if (st.gymEasy){ st.gymCardio={d:st.gymEasy, mode:"easy"}; delete st.gymEasy; }
  Object.keys(KEPT).forEach(k=>{ if (!KEPT[k].includes(st[k])) st[k]=FALLBACK[k]; });
}

/* the session in progress, kept separately so it survives iOS killing the app */
export const live = {
  write(o){ try{ localStorage.setItem(LIVE, JSON.stringify(o)); }catch(e){} },
  clear(){ try{ localStorage.removeItem(LIVE); }catch(e){} },
  read(){ try{ const r=JSON.parse(localStorage.getItem(LIVE)||"null"); return r && Date.now()-r.at < LIVE_MAX_AGE && st.log.some(l=>l.id===r.sid) ? r : null; }catch(e){ return null; } }
};
