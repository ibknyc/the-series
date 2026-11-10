/* Capoeira: ginga, esquivas, kicks, floor work. */
import { T, step, hold, sided, repeat } from "./steps.js";
import { fmtSecs } from "../util/format.js";

export const ginga = s => step("Ginga","capoeira","Rock side to side, back foot sweeping behind, guard arm across your face. Low and loose.",repeat(Math.round(s/4),()=>[T("ginga",2,"Ginga"),T("ginga",2,"Ginga",true)]),{chips:[fmtSecs(s)]});
export const cocorinha = () => step("Cocorinha","capoeira","From ginga, drop into a deep squat, heels down, arm guarding your head. Pop back up.",repeat(5,()=>[T("ginga",3,"Ginga"),T("cocorinha",3,"Cocorinha")]),{chips:["5 reps"]});
export const esquiva = () => step("Esquiva lateral","capoeira","Sink over the bent knee, hand to the floor, other arm guarding. Alternate sides.",repeat(5,i=>[T("esquiva",3,"Esquiva",i%2===1),T("ginga",3,"Back to ginga",i%2===1)]),{chips:["5 reps"]});
/* kicks: out of ginga, back into ginga. Half speed, full shape. */
export const legSwings = () => sided((f,s)=>step("Leg swings","capoeira","Hand on a wall. Swing the leg front to back, then across the body and out. Loose, growing each swing.",repeat(5,()=>[T("kneeUp",1.4,"Swing up",f),T("mountain",1.4,"Down",f)]),{flip:f,chips:[s,"10 swings"]}));
const kick = (name, cue, n=5) => sided((f,s)=>step(name,"capoeira",cue,repeat(n,()=>[T("ginga",2,"Ginga",f),T("kickLow",.9,"Kick",f),T("kickHigh",1.1,"Kick",f)]),{flip:f,chips:[s,`${n} kicks`]}));
export const meiaLua = () => kick("Meia lua de frente","From ginga, the back leg sweeps a crescent across your front, outside to inside. Straight leg, hips stay square, guard up.");
export const queixada = () => kick("Queixada","Step across, open the hips, and swing the leg inside to outside. The kick comes from the hip turning, not the knee.");
export const armada = () => kick("Armada","Step through, turn your back, look over the shoulder, then spin the straight leg around. Slow and controlled; the spin is the skill.",4);
export const esquivaBaixa = () => step("Esquiva baixa","capoeira","From ginga, drop low over the front foot, chest to thigh, arm guarding your head. Back to ginga.",repeat(6,i=>[T("ginga",2.5,"Ginga",i%2===1),T("cocorinha",2.5,"Esquiva",i%2===1)]),{chips:["6 reps"]});
export const role = () => sided((f,s)=>step("Negativa to rolê","capoeira","Sink into negativa, then roll over the planted hand onto both hands and feet, low, and rise back into ginga. Keep it on the floor.",repeat(4,()=>[T("negativa",3,"Negativa",f),T("esquiva",2,"Rolê",!f),T("ginga",2,"Ginga",f)]),{flip:f,chips:[s,"4 reps"]}));
export const negativa = () => sided((f,s)=>hold("Negativa","negativa",15,"capoeira","Sink low, one leg long, hand planted behind you, guard arm up.",{flip:f,chips:[s]}));
export const auPrep = () => hold("Aú prep","au",30,"capoeira","Hands down, hips low, small hops from foot to foot over your hands. Height comes later.");
export const au = () => step("Aú","capoeira","Cartwheel with control. Eyes on the floor between your hands. Both directions.",repeat(5,i=>[T("au",3,"Aú",i%2===1),T("ginga",3,"Ginga",i%2===1)]),{chips:["5 reps"]});
export const queda = () => sided((f,s)=>hold("Queda de rins","queda",20,"capoeira","Elbow into the hip, head light on the floor, tip forward until the feet float.",{flip:f,chips:[s]}));
