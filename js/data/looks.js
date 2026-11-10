/* The looks you kept (Nov 9). Each has a stylesheet in css/ with the same id. */
export const SKINS = [
  {id:"plain",   name:"Plain",     note:"Sage and ink. Follows your phone's light or dark setting.", sw:["#EDF0EB","#1B2420","#3447B0"]},
  {id:"sodium",  name:"Sodium",    note:"Streetlight orange on warm asphalt black. The clock glows. Easiest of the dark skins on tired eyes.", sw:["#16130F","#F3E7D5","#FF8A1E"]},
  {id:"mysore",  name:"Mysore",    note:"Turmeric ground, vermilion ink, heavy serif. Built for the morning flow.", sw:["#E8CE92","#2B1D12","#BC3A1C"]},
  {id:"cyano",   name:"Cyanotype", note:"Prussian blue ground, paper-white marks, square line ends. The figure reads like a blueprint.", sw:["#17496E","#EEF6FB","#A3C4DA"]},
];
export const LAYOUTS = [
  {id:"plate",   name:"Plate",   note:"Technical drawing. The figure sits in a framed panel with corner ticks, the clock burns into the top corner, and the metadata becomes a ruled spec strip. No cards anywhere."},
  {id:"bleed",   name:"Bleed",   note:"The figure is blown up past the edges of the screen and faded back, with the type sitting straight on top of it. Poster, not app."},
  {id:"split",   name:"Split",   note:"A hard horizontal cut. The figure sits in an inverted block up top with the clock reversed out of it; everything else lives on the ground below."},
  {id:"quiet",   name:"Quiet",   note:"Almost nothing. Centred name, a light-weight clock, and a faint figure at the bottom. No frames, no boxes, a lot of air."}
];
export const TYPESETS = [
  {id:"standard",  name:"Standard",  face:'"Bricolage Grotesque",sans-serif', w:800,
   note:"Bricolage Grotesque with Atkinson Hyperlegible. The neutral one you started with."},
  {id:"editorial", name:"Editorial", face:'"Bodoni Moda",serif', w:900,
   note:"Bodoni Moda — hairline-to-slab contrast. The numerals do the work and the labels sit back in wide tracking."},
  {id:"volume",    name:"Volume",    face:'"Unbounded",sans-serif', w:800,
   note:"Unbounded — wide geometric with odd terminals. Loud without shouting."}
];
/* a saved look that no longer exists falls back to these */
export const FALLBACK = {skin:"plain", layout:"plate", face:"standard"};
export const KEPT = {skin:SKINS.map(x=>x.id), layout:LAYOUTS.map(x=>x.id), face:TYPESETS.map(x=>x.id)};
