/* The running session: the steps, where you are in them, and the clock. One object, shared by
   the player's modules. Nothing outside js/player/ writes to it. */
export const P = { sheet:false, feel:null, lastCue:null, steps:[], i:0, t:0, run:false, last:0, sub:-1, lastSec:-1, total:0, raf:0, lock:null, type:"full", loc:"home" };
