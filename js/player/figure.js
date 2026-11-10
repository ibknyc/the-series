/* The stick figure: eases from pose to pose, carries dumbbells or a plate, mirrors for the left side. */
import { $, reduced } from "../util/dom.js";
import { POSE, WALL, PROP_OF, PROPS } from "../data/poses.js";

const svg=$("fig");
const dbG = `<rect x="-9" y="-2" width="18" height="4" rx="1"/><rect x="-12" y="-6" width="5" height="12" rx="1.5"/><rect x="7" y="-6" width="5" height="12" rx="1.5"/>`;
svg.innerHTML = `<g id="fw"><line class="ground" x1="10" y1="180" x2="190" y2="180"/><line class="wall" id="wall" x1="0" y1="0" x2="0" y2="180"/>
  <g class="prop" id="prop"></g><g class="plate" id="plate"><circle r="15"/><circle class="hub" r="3.5"/></g>
  <polyline class="far" id="fArm"/><polyline class="far" id="fLeg"/><g class="db" id="dbA" opacity=".75">${dbG}</g>
  <line class="near" id="torso"/><polyline class="near" id="nLeg"/><polyline class="near" id="nArm"/>
  <circle class="head" id="head" r="10.5"/><g class="db" id="dbB">${dbG}</g></g>`;
const F={}; ["fw","wall","prop","plate","fArm","fLeg","dbA","torso","nLeg","nArm","head","dbB"].forEach(k=>F[k]=svg.querySelector("#"+k));
let cur=POSE.mountain.map(p=>p.slice()), from=cur, to=cur, tw0=0, curKey="mountain", curProp="";
export function setPose(key){
  if (key===curKey) return;
  curKey=key; from=cur.map(p=>p.slice()); to=POSE[key]||POSE.mountain; tw0=performance.now();
  const pr=PROP_OF[key]||""; if (pr!==curProp){ curProp=pr; F.prop.innerHTML = pr?PROPS[pr]:""; }
}
export function snapPose(key){ curKey=key; cur=(POSE[key]||POSE.mountain).map(p=>p.slice()); from=cur; to=cur; const pr=PROP_OF[key]||""; curProp=pr; F.prop.innerHTML=pr?PROPS[pr]:""; }
/* slow = the calmer blocks, where the figure takes twice as long to move */
export function drawFigure(now, flip, db, plate, slow){
  const d=reduced?0:(slow?900:450), k=d?Math.min(1,(now-tw0)/d):1, e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  cur=from.map((p,i)=>[p[0]+(to[i][0]-p[0])*e, p[1]+(to[i][1]-p[1])*e]);
  const pl=(...ix)=>ix.map(i=>cur[i][0].toFixed(1)+","+cur[i][1].toFixed(1)).join(" ");
  F.fArm.setAttribute("points",pl(1,3,4)); F.fLeg.setAttribute("points",pl(2,7,8));
  F.nArm.setAttribute("points",pl(1,5,6)); F.nLeg.setAttribute("points",pl(2,9,10));
  F.torso.setAttribute("x1",cur[1][0]); F.torso.setAttribute("y1",cur[1][1]); F.torso.setAttribute("x2",cur[2][0]); F.torso.setAttribute("y2",cur[2][1]);
  F.head.setAttribute("cx",cur[0][0]); F.head.setAttribute("cy",cur[0][1]);
  F.dbA.setAttribute("transform",`translate(${cur[4][0]},${cur[4][1]})`); F.dbA.style.display=db.includes("A")?"":"none";
  F.dbB.setAttribute("transform",`translate(${cur[6][0]},${cur[6][1]})`); F.dbB.style.display=db.includes("B")?"":"none";
  if (plate){ const j=plate==="neck"?1:6; F.plate.style.display=""; F.plate.setAttribute("transform",`translate(${cur[j][0]},${cur[j][1]})`); } else F.plate.style.display="none";
  F.fw.setAttribute("transform", flip?"translate(200,0) scale(-1,1)":"");
  const wx=WALL[curKey];
  if (wx!=null && k>.6){ F.wall.style.display=""; F.wall.setAttribute("x1",wx); F.wall.setAttribute("x2",wx); } else F.wall.style.display="none";
}
