/* Look: layout, type and skin. Each is an attribute on <html> that a stylesheet in css/ keys off. */
import { $, seg } from "../util/dom.js";
import { st, commit } from "../store.js";
import { SKINS, LAYOUTS, TYPESETS } from "../data/looks.js";

export function applyLook(){
  const root=document.documentElement;
  root.setAttribute("data-skin", st.skin); root.setAttribute("data-layout", st.layout); root.setAttribute("data-type", st.face);
  /* the browser chrome takes the skin's background */
  const m=document.querySelector('meta[name="theme-color"]'); if (m) m.remove();
  const c=getComputedStyle(root).getPropertyValue("--bg").trim();
  const t=document.createElement("meta"); t.name="theme-color"; t.content=c||"#EDF0EB"; document.head.appendChild(t);
}
const pick = (key, id) => { st[key]=id; applyLook(); commit(); };
const noteOf = (list, id) => (list.find(x=>x.id===id)||list[0]).note;

export function renderLook(){
  seg($("laySeg"), LAYOUTS, st.layout, id=>pick("layout", id));
  $("layNote").textContent = noteOf(LAYOUTS, st.layout);
  const ty=$("typeSet"); ty.innerHTML="";
  TYPESETS.forEach(t=>{ const b=document.createElement("button"); b.className="typebtn"; b.type="button";
    b.setAttribute("aria-pressed", String(st.face===t.id));
    b.innerHTML=`<span class="sample" style="font-family:${t.face};font-weight:${t.w}">42</span><b>${t.name}</b>`;
    b.onclick=()=>pick("face", t.id);
    ty.appendChild(b); });
  $("typNote").textContent = noteOf(TYPESETS, st.face);
  const sk=$("skins"); sk.innerHTML="";
  SKINS.forEach(k=>{ const b=document.createElement("button"); b.className="skinbtn"; b.type="button";
    b.setAttribute("aria-pressed", String(st.skin===k.id));
    b.innerHTML=`<span class="sw">${k.sw.map(c=>`<span style="background:${c}"></span>`).join("")}</span><b>${k.name}</b>`;
    b.onclick=()=>pick("skin", k.id);
    sk.appendChild(b); });
  $("skNote").textContent = noteOf(SKINS, st.skin);
}
