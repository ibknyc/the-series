/* Stages: each exercise has an easier, a planned and a harder version (1-3), remembered per exercise
   and logged with every set. Moves that don't scale get a rotating fact instead. */
import { st, save, realLog } from "../store.js";
import { GUIDE } from "../data/guide.js";

export const stageOf = name => { const g=GUIDE[name]; return g && g.s ? ((st.stage||{})[name] || 2) : ""; };
export function setStage(name, n){ st.stage=st.stage||{}; st.stage[name]=n; save(); }
/* one fact per session, rotating so they don't repeat */
export function factFor(name){
  const g=GUIDE[name]; if (!g || !g.f) return "";
  let h=0; for (const c of name) h=(h*31+c.charCodeAt(0))%997;
  return g.f[(realLog().length+h)%g.f.length];
}
