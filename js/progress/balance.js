/* The weekly balance check: movement patterns that haven't shown up in your logged work for 7 days.
   You can add a short block for them to today's session; the choice lasts the day. */
import { st, realLog } from "../store.js";
import { today, daysAgo } from "../util/time.js";
import { PATTERNS, patternsOf } from "../data/patterns.js";

const WINDOW = 7;
/* patterns missing from the last 7 days. Quiet until there's a week of history to judge. */
export function missingPatterns(){
  const log=realLog(); if (!log.length || log[0].d > daysAgo(WINDOW)) return [];
  const ids=new Set(log.filter(l=>l.d>=daysAgo(WINDOW-1)).map(l=>l.id)), seen=new Set();
  st.sets.filter(r=>ids.has(r.session_id) && r.block==="main").forEach(r=>patternsOf(r.exercise).forEach(p=>seen.add(p)));
  return Object.keys(PATTERNS).filter(p=>!seen.has(p));
}
export const patternNames = ps => ps.map(p=>PATTERNS[p].name);
export const balanceOn = () => st.balanceDay===today();
export function setBalance(on){ if (on) st.balanceDay=today(); else delete st.balanceDay; }
