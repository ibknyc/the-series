/* After a set: what to do on the next one, from how many reps you had left.
   Sets the aim for the next set (weight) or moves the stage (bodyweight). */
import { st, save } from "../store.js";
import { GUIDE } from "../data/guide.js";
import { homeInv, INC } from "./weights.js";
import { stageOf } from "./stages.js";

/* reps in reserve -> how the set felt. Beating the plan by 2 reps counts as easy even at RIR 2. */
export const feelFor = (rir, done, planned) => rir===0 ? "hard" : (rir>=3 || (rir>=2 && planned && done>=planned+2)) ? "easy" : "solid";

export function adviceFor(cur, feel){
  const key=cur.track, w = key ? st.lifts[key] : null;
  if (!feel) return "";
  if (key && w && / \(home\)$/.test(key)){
    const inv=homeInv(), up=inv.find(x=>x>w), down=[...inv].reverse().find(x=>x<w);
    const each = cur.db==="AB" ? " each" : "";
    if (feel==="easy"){
      if (up){ st.aim[key]=up; save(); return `Go up to <b>${up} lb${each}</b> next set.`; }
      st.aim[key]=w; save(); const g3=GUIDE[cur.name]; return `${w} lb is your heaviest. Make it harder instead: ${g3&&g3.s&&stageOf(cur.name)<3 ? `<b>stage 3</b>, ${g3.s[2].toLowerCase()}` : "<b>add 2 reps</b> or take <b>3 seconds on the way down</b>"}.`;
    }
    if (feel==="solid"){ st.aim[key]=w; save(); return `Right where you want it. <b>Stay at ${w} lb${each}.</b>`; }
    if (down){ st.aim[key]=down; save(); return `Drop to <b>${down} lb${each}</b>, or stay at ${w} and stop 2 reps short.`; }
    st.aim[key]=w; save(); return "Stop 2 reps short next set. Form over numbers.";
  }
  if (key && w){
    const inc=INC(key);
    if (feel==="easy"){ st.aim[key]=w+inc; save(); return `Go up to <b>${w+inc} lb</b> next set.`; }
    if (feel==="solid"){ st.aim[key]=w; save(); return `Right where you want it. <b>Stay at ${w} lb</b> until every set hits the reps with 2 in reserve.`; }
    st.aim[key]=Math.max(0,w-inc); save(); return `Drop to <b>${Math.max(0,w-inc)} lb</b>, or stay at ${w} and stop 2 reps short.`;
  }
  if (key) return feel==="easy" ? "Log the weight above and I'll tell you where to go next." : feel==="solid" ? "Log the weight above so next time has a target." : "Log the weight above, then go lighter next set.";
  const G_=GUIDE[cur.name], sg=stageOf(cur.name);
  if (G_ && G_.s && !key){
    if (feel==="easy" && sg<3){ st.stage=st.stage||{}; st.stage[cur.name]=sg+1; save(); return `Move up to <b>stage ${sg+1}</b> next set: ${G_.s[sg]}.`; }
    if (feel==="hard" && sg>1){ st.stage=st.stage||{}; st.stage[cur.name]=sg-1; save(); return `Drop to <b>stage ${sg-1}</b> next set: ${G_.s[sg-2]}.`; }
    if (feel==="easy") return "Top stage already. <b>Add 2 reps</b> or slow the lowering down.";
  }
  if (cur.weight && !key) return feel==="easy" ? "Your dumbbells are fixed, so make it harder: <b>add 2 reps</b> or take 3 seconds on the way down." : feel==="solid" ? "Same again next set." : "Stop 2 reps short next set. Form over numbers.";
  return feel==="easy" ? "<b>Add 2 reps</b> next set, or slow the lowering down." : feel==="solid" ? "Same again next set." : "Take 2 reps off next set.";
}
