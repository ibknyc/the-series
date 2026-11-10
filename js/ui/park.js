/* Park progress: stairs and park runs over time. The numbers that show you're getting fitter. */
import { $ } from "../util/dom.js";
import { st } from "../store.js";
import { fmtSecs } from "../util/format.js";

export function renderPark(){
  const box=$("parkBody"); if (!box) return;
  const C=st.cardio||[], sess=[...new Set(C.filter(r=>r.modality==="stairs").map(r=>r.session_id))].sort();
  if (!sess.length){ box.innerHTML='<p class="wnote">Do one stair session and your climb times show up here.</p>'; return; }
  const dOf=id=>{ const l=st.log.find(x=>x.id===id); return l ? l.d.slice(5) : id.slice(6,8)+"-"+id.slice(8,10); };
  const climbs=["Front stairs","Back stairs","Hidden stairs","Small stairs"];
  const row=(name,fmt)=>{ const v=sess.map(id=>{ const xs=C.filter(r=>r.session_id===id && r.segment===name && +r.seconds>=10).map(r=>+r.seconds); return xs.length?Math.min(...xs):null; }).filter(x=>x!==null);
    if (!v.length) return ""; const first=v[0], last=v[v.length-1], best=Math.min(...v), d=last-first;
    return `<tr><td>${name}</td><td>${fmtSecs(first)}</td><td>${fmtSecs(last)}</td><td>${fmtSecs(best)}</td><td class="${d<0?"up":d>0?"down":""}">${v.length>1?(d<0?"−":"+")+fmtSecs(Math.abs(d)):"—"}</td></tr>`; };
  let h=`<table><tr><th>Fastest climb</th><th>First</th><th>Latest</th><th>Best</th><th>Change</th></tr>${climbs.map(n=>row(n)).join("")}${row("Jog to the park")}</table>`;
  /* per session: total time climbing, and share of the session spent on the stairs */
  h+=`<table><tr><th>Session</th><th>Climbing</th><th>Climbs</th><th>Total</th></tr>`+sess.slice(-6).map(id=>{ const r=C.filter(x=>x.session_id===id), cl=r.filter(x=>x.modality==="stairs" && +x.seconds>=10), tot=r.reduce((a,x)=>a+(+x.seconds||0),0), c=cl.reduce((a,x)=>a+(+x.seconds||0),0);
    return `<tr><td>${dOf(id)}</td><td>${fmtSecs(c)}</td><td>${cl.length}</td><td>${fmtSecs(tot)}</td></tr>`; }).join("")+`</table>`;
  /* park runs with a distance logged: pace */
  const runs=C.filter(r=>r.modality==="run" && r.metric && /mi|km/.test(r.metric_unit||"") && +r.seconds>120);
  if (runs.length) h+=`<table><tr><th>Run</th><th>Distance</th><th>Time</th><th>Pace</th></tr>`+runs.slice(-6).map(r=>{ const p=(+r.seconds)/(+r.metric); return `<tr><td>${dOf(r.session_id)}</td><td>${r.metric} ${r.metric_unit}</td><td>${fmtSecs(+r.seconds)}</td><td>${fmtSecs(p)}/${r.metric_unit}</td></tr>`; }).join("")+`</table>`;
  else h+=`<p class="wnote">Log the distance at the end of a run and your pace shows up here too.</p>`;
  box.innerHTML=h;
}
