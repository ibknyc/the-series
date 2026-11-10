/* Today's session: turns saved state (phase, history, equipment, what you picked) into the
   options the engine builds from. */
import { st, realLog } from "../store.js";
import { today } from "../util/time.js";
import { build } from "../engine/build.js";
import { ROTATION } from "../data/cardio.js";
import { hangTarget } from "./holds.js";
import { homeInv } from "./weights.js";
import { legsLoaded } from "./recovery.js";
import { todaysClass } from "./peloton.js";

export const loggedToday = () => realLog().filter(l=>l.d===today());
export const isSecond = () => (st.secOv && st.secOv.d===today()) ? st.secOv.v : loggedToday().length>0;
/* A/B alternates per gym lifting day; for cardio it turns the machine rotation */
const gymCount = () => st.type==="cardio" ? realLog().filter(l=>l.t==="cardio").length : realLog().filter(l=>l.l==="gym" && l.t!=="yoga" && l.t!=="mix").length;
export const abNext = () => (st.abOv!==null && st.abOv!==undefined) ? st.abOv : (gymCount() % 2);
/* the cardio you've ticked for where you are, in rotation order */
export const cardioAvailable = () => ROTATION[st.loc==="gym" ? "gym" : "home"].filter(k=>st.eq[k]);

export function optionsFor(rec){
  const inv=homeInv();
  return {
    phase:st.phase, rec, type:st.type, loc:st.loc, eq:st.eq, dbOn:st.dbOn, second:isSecond(),
    W:{heavy:inv.at(-1), light:inv.length>1?inv.at(-2):inv[0], gymHeavy:st.gymHeavy||0, gymLight:st.gymLight||0},
    /* rotation counters */
    ab:abNext(),
    gymN: realLog().filter(l=>l.l==="gym").length,
    homeAb: realLog().filter(l=>l.l==="home" && (l.t==="strength"||l.t==="full")).length,
    mixN: realLog().filter(l=>l.t==="mix").length,
    hangT: hangTarget(),
    /* cardio */
    cMode: st.type==="cardio" && st.loc==="home" ? st.cMode : null,
    pel: todaysClass(), ftp: st.ftp,
    /* the stair route */
    bikeTo:!!st.bikeTo, bikeHome:!!st.bikeHome, lapT:st.lapLast||{}, stations:st.stations!==false, longDay:!!st.longDay,
    repeats: !!st.repeats && st.phase>=3 && !legsLoaded(),
    stairN: realLog().filter(l=>l.p===st.phase && (st.cardio||[]).some(c=>c.session_id===l.id && c.modality==="stairs")).length
  };
}
export const sessionFor = rec => build(optionsFor(rec));
