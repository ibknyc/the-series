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
import { gymMode, riding } from "./cardioChoice.js";
import { missingPatterns, balanceOn } from "./balance.js";

export const loggedToday = () => realLog().filter(l=>l.d===today());
export const isSecond = () => (st.secOv && st.secOv.d===today()) ? st.secOv.v : loggedToday().length>0;
/* A/B alternates per gym lifting day; for cardio it turns the machine rotation */
const gymCount = () => st.type==="cardio" ? realLog().filter(l=>l.t==="cardio").length : realLog().filter(l=>l.l==="gym" && l.t!=="yoga" && l.t!=="mix").length;
export const abNext = () => (st.abOv!==null && st.abOv!==undefined) ? st.abOv : (gymCount() % 2);
/* the cardio you've ticked for where you are, in rotation order */
export const cardioAvailable = () => ROTATION[st.loc==="gym" ? "gym" : "home"].filter(k=>st.eq[k]);
/* legs off: a gym lifting day without leg work, chosen for today only */
export const legsOffDay = () => st.loc==="gym" && ["strength","full"].includes(st.type) && st.rec!=="red";
export const legsOff = () => legsOffDay() && st.legsOff===today();
export function setLegsOff(on){ if (on) st.legsOff=today(); else delete st.legsOff; }

export function optionsFor(rec){
  const inv=homeInv();
  return {
    phase:st.phase, rec, type:st.type, loc:st.loc, eq:st.eq, dbOn:st.dbOn, second:isSecond(),
    W:{heavy:inv.at(-1), light:inv.length>1?inv.at(-2):inv[0], gymHeavy:st.gymHeavy||0, gymLight:st.gymLight||0},
    /* rotation counters */
    coolN: realLog().length,
    ab:abNext(),
    gymN: realLog().filter(l=>l.l==="gym").length,
    homeAb: realLog().filter(l=>l.l==="home" && (l.t==="strength"||l.t==="full")).length,
    mixN: realLog().filter(l=>l.t==="mix").length,
    hangT: hangTarget(),
    legsOff: legsOff(),
    /* a short block for patterns the week has missed, if you added it today */
    balance: balanceOn() ? missingPatterns() : null,
    /* an easy day at the gym: steady on the machine you last picked for it */
    easy: gymMode()==="easy" ? (st.easyM||"elliptical") : null,
    /* cardio */
    cMode: riding() ? "peloton" : (st.type==="cardio" && st.loc==="home" ? st.cMode : null),
    pel: todaysClass(), ftp: st.ftp,
    /* the stair route */
    bikeTo:!!st.bikeTo, bikeHome:!!st.bikeHome, lapT:st.lapLast||{}, stations:st.stations!==false, longDay:!!st.longDay,
    repeats: !!st.repeats && st.phase>=3 && !legsLoaded(),
    stairN: realLog().filter(l=>l.p===st.phase && (st.cardio||[]).some(c=>c.session_id===l.id && c.modality==="stairs")).length
  };
}
/* over: options to change, to see what another choice would build */
export const sessionFor = (rec, over) => build({...optionsFor(rec), ...(over||{})});
