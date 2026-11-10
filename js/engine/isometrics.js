/* Isometrics: holds you end by tapping. The seconds held are logged, so the number is the measure. */
import { hold, restStep } from "./steps.js";
import { fmtSecs } from "../util/format.js";

export const wallSquat = (i, n, secs) => { const s=hold("Wall squat","wallsit",secs,"strength","Back flat on the wall, feet out in front, slide down to your stage's knee angle. Hands off the thighs. Breathe; don't hold your breath. Tap I'm done if you have to stand up early.",{chips:[`Hold ${i} of ${n}`,fmtSecs(secs)]}); s.tapEnd=true; s.iso="wall"; return s; };
/* wall squats: the blood-pressure protocol is 4 x 2 min. Lifting days at home get 2 holds to keep it going. */
export const wallBlock = (n, rest=60) => { const o=[]; for (let i=1;i<=n;i++){ o.push(wallSquat(i,n,120)); if (i<n) o.push(restStep(rest)); } return o; };
/* dead hang: hold as long as you can. The target comes from your best so far. */
export const deadHang = target => sl => { const h=hold("Dead hang","hang",target||30,"strength","Grip the bar shoulder-width, arms straight, let your shoulders stretch. Hold until your grip goes, then tap Done and log the seconds.",{chips:[sl,`Target ${fmtSecs(target||30)}`],setup:6}); h.tapEnd=true; h.iso="hang"; return h; };
