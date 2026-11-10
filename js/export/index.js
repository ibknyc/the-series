/* Getting data out: a zip of CSVs for analysis, or one JSON file as a backup. */
import { st } from "../store.js";
import { today } from "../util/time.js";
import { csv } from "./csv.js";
import { zip } from "./zip.js";
import { COLS, tables, only, README, sessionSummary } from "./tables.js";

function download(blob, name, linger=1500){
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },linger);
}
/* everything, or one session when sid is given. Returns the tables it wrote. */
export function exportZip(sid){
  const T = sid ? only(tables(), sid) : tables();
  const files=Object.keys(COLS).map(k=>({name:`${k}.csv`, text:csv(T[k], COLS[k])}));
  files.push({name:"summary.txt", text:sessionSummary(T)}, {name:"tables.json", text:JSON.stringify(T,null,1)}, {name:"README.txt", text:README});
  download(zip(files), sid ? `the-series-${sid}.zip` : `the-series-export-${today()}.zip`);
  return T;
}
export function exportBackup(){
  download(new Blob([JSON.stringify(st,null,2)],{type:"application/json"}), `the-series-${today()}.json`, 1000);
}
