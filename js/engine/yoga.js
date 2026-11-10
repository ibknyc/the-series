/* Yoga: arriving, sun salutations, standing poses, core, inversions, closing. */
import { T, clean, step, hold, sided, repeat } from "./steps.js";

const BR = 5; /* one breath, in seconds */
const ddBreaths = n => { const o=[]; for(let i=1;i<=n;i++) o.push(T("downdog",BR,`Down dog, breath ${i} of ${n}`)); return o; };
function sunASeq(add){
  const s=[T("mountain",BR,"Mountain, exhale"),T("upsalute",BR,"Inhale, reach up"),T("forwardfold",BR,"Exhale, fold"),T("halflift",BR,"Inhale, half lift"),T("plank",BR,"Exhale, step back to plank")];
  if (add) for(let i=1;i<=add.pushups;i++) s.push(T("chaturanga",1.5,`Push-up ${i} of ${add.pushups}`),T("plank",1.5,`Push-up ${i} of ${add.pushups}`));
  s.push(T("chaturanga",BR,"Lower down slowly"),T("updog",BR,"Inhale, upward dog"),...ddBreaths(5),T("halflift",BR,"Step forward, inhale, half lift"),T("forwardfold",BR,"Exhale, fold"),T("upsalute",BR,"Inhale, rise up"),T("mountain",BR,"Exhale, hands to heart"));
  if (add) for(let i=1;i<=add.squats;i++) s.push(T("squat",1.5,`Squat ${i} of ${add.squats}`),T("mountain",1.5,`Squat ${i} of ${add.squats}`));
  return s;
}
function sunBSeq(){
  const v=()=>[T("plank",BR,"Plank"),T("chaturanga",BR,"Lower down slowly"),T("updog",BR,"Inhale, upward dog"),T("downdog",BR,"Exhale, down dog")];
  return [T("mountain",BR,"Mountain"),T("chair",BR*2,"Chair, 2 breaths"),T("forwardfold",BR,"Exhale, fold"),T("halflift",BR,"Inhale, half lift"),
    ...v(),T("warrior1",BR*3,"Warrior I right, 3 breaths"),...v(),T("warrior1",BR*3,"Warrior I left, 3 breaths",true),
    T("plank",BR,"Plank"),T("chaturanga",BR,"Lower down slowly"),T("updog",BR,"Inhale, upward dog"),...ddBreaths(5),
    T("halflift",BR,"Step forward, half lift"),T("forwardfold",BR,"Exhale, fold"),T("chair",BR*2,"Chair, 2 breaths"),T("mountain",BR,"Mountain")];
}
export function sunA(n, add){
  const out=[];
  for(let i=1;i<=n;i++){
    const plus = add && i>1;
    out.push(step("Sun salutation A","flow", plus ? "Push-ups at plank (knees are fine), squats back at the top. One breath per movement." : "One breath per movement. Let it be easy.",
      sunASeq(plus?add:null), {chips:[`Round ${i} of ${n}`, plus?`+${add.pushups} push-ups`:"", plus?`+${add.squats} squats`:""]}));
  }
  return out;
}
export function sunB(n){
  const out=[];
  for(let i=1;i<=n;i++) out.push(step("Sun salutation B","flow","Chair and Warrior I join the flow. Sink the back heel in Warrior I.",sunBSeq(),{chips:[`Round ${i} of ${n}`]}));
  return out;
}
export function standing(tri){
  return [
    ...sided((f,s)=>step("Warrior sequence","standing","Front knee over ankle. Back leg straight and strong. Soft face.",
      [T("warrior1",10,"Warrior I",f),T("warrior2",10,"Warrior II",f),T("reversewarrior",8,"Reverse warrior",f),...(tri?[T("triangle",10,"Triangle",f)]:[])],{chips:[s]})),
    ...sided((f,s)=>step("Low lunge and twist","standing","Back knee down, hips sink forward. Then twist from the ribs, not the neck.",
      [T("lowlunge",8,"Low lunge",f),T("lungetwist",8,"Twist",f)],{chips:[s]}))
  ];
}
export function core(sp, boat){
  return [...sided((f,s)=>hold("Side plank","sideplank",sp,"core","Stack the hips, lift them an inch higher than feels natural. Can't hold the full time with feet stacked? Stagger them, top foot in front. Still shaking? Drop the bottom knee for the last seconds rather than letting the hips sag.",{flip:f,chips:[s]})),
    hold("Boat","boat",boat,"core","Chest proud, legs up. Bend the knees before you round the back.")];
}
export function closing(legsUp, red, short){
  return clean([
    hold("Seated forward fold","seatedfold",30,"close","Lead with the chest, not the forehead. Knees can bend."),
    ...sided((f,s)=>hold("Supine twist","supinetwist",short?20:30,"close","Knee across, opposite shoulder heavy.",{flip:f,chips:[s]})),
    ...sided((f,s)=>hold("Pigeon","pigeon",(short?45:60)+(red?15:0),"close","Square the hips. Breathe into the tight spot instead of forcing it.",{flip:f,chips:[s]})),
    legsUp ? hold("Legs up the wall","legsupwall",60,"close","Hips close to the wall, arms wide. Let the legs drain.") : null,
    hold("Savasana","savasana",(short?90:120)+(red?30:0),"close","Do nothing on purpose. This counts.")
  ]);
}
export function shortClose(){
  return [hold("Seated forward fold","seatedfold",30,"close","Lead with the chest. Let the heart rate come down."),
    ...sided((f,s)=>hold("Pigeon","pigeon",30,"close","Hips were working. Give them this.",{flip:f,chips:[s]})),
    hold("Savasana","savasana",60,"close","One minute of nothing before you go back to your day.")];
}
export const arrive = s => hold("Box breathing","seat",s,"arrive","In for 4, hold 4, out for 4, hold 4. Arrive before you move.");
export const wrists = () => hold("Wrist prep","table",20,"arrive","Circle both ways, then rock gently over the hands. Your wrists carry this whole practice.");
export const catcow = () => step("Cat and cow","flow","Move with the breath. Five slow rounds.",repeat(5,()=>[T("cow",BR,"Cow, inhale and lift"),T("cat",BR,"Cat, exhale and round")]),{chips:["5 rounds"]});
export const downdog = () => step("Down dog","flow","Pedal the heels for the first few breaths, then settle. Bend the knees if the hamstrings round your back.",ddBreaths(6),{chips:["6 breaths"]});
export const child = () => hold("Child's pose","childs",60,"close","Knees wide, forehead down. A red day practice is still practice.");

export function inversions(phase){
  if (phase===2) return [hold("Dolphin","dolphin",20,"invert","Forearms down, hips high, walk the feet in. This is headstand strength."),
    hold("Crow attempts","crow",30,"invert","Knees on the backs of your arms, lean until the toes get light. Toes can stay down. Pillow in front of your face.")];
  if (phase===3) return [hold("Crow","crow",20,"invert","Toes off the floor. Look forward, not down."),
    hold("Tucked headstand at the wall","headtuck",30,"invert","Forearms down, fingers laced, crown light. Walk in, lift knees to chest. Never kick up."),
    hold("L-handstand","lhandstand",30,"invert","Hands a leg-length from the wall, walk the feet up to hip height. Push the floor away.")];
  if (phase===4) return [hold("Headstand","headstand",45,"invert","Freestanding. Shoulders pushing up away from the floor the whole time."),
    hold("Wall handstand","handstand",45,"invert","Chest to the wall if you can. Stack wrists, shoulders, hips."),
    hold("Crow","crow",20,"invert","Hold, then try to float the feet back an inch.")];
  return [];
}
