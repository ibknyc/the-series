/* Release check. Run from the repo root before every push:  node tools/check.mjs
   1. sw.js lists every file the app loads, and nothing that isn't there.
   2. APP_VER (js/version.js) matches CACHE (sw.js).
   3. Every import points at a file that exists.
   4. No file imports from a layer above it.
   5. The session engine still builds the same sessions (tools/engine.hash).
      If you changed sessions on purpose, re-run with --accept to record the new hash. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const walk = d => fs.readdirSync(path.join(root, d), {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(d+"/"+e.name) : [d+"/"+e.name]);
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

/* 1. the service worker's file list */
const sw = read("sw.js");
const assets = JSON.parse("[" + sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1] + "]").map(a => a.replace(/^\.\//, ""));
const shipped = [...walk("js"), ...walk("css"), ...fs.readdirSync(root).filter(f => /\.(woff2|png|webmanifest)$/.test(f) || f==="index.html" || f==="local-fonts.css")];
shipped.forEach(f => check(assets.includes(f), `sw.js ASSETS is missing ${f}`));
assets.filter(a => a!=="").forEach(a => check(fs.existsSync(path.join(root, a)), `sw.js ASSETS lists ${a}, which doesn't exist`));
const html = read("index.html");
[...html.matchAll(/(?:href|src)="([^"#:]+)"/g)].map(m => m[1]).forEach(f => check(assets.includes(f), `index.html loads ${f}, which sw.js doesn't cache`));

/* 2. versions */
const ver = read("js/version.js").match(/APP_VER = "(v\d+)"/)[1], cache = sw.match(/const CACHE = "series-(v\d+)"/)[1];
check(ver===cache, `APP_VER is ${ver} but the service worker cache is ${cache}`);

/* 3. imports */
for (const f of walk("js")) for (const m of read(f).matchAll(/from "(\.[^"]+)"/g))
  check(fs.existsSync(path.join(root, path.dirname(f), m[1])), `${f} imports ${m[1]}, which doesn't exist`);

/* 3b. layers: a file may import from its own folder or from a layer below it, never above */
const LAYER = {util:0, data:1, engine:2, "store.js":2, "version.js":0, progress:3, log:4, export:4, player:5, ui:6, "main.js":7};
const layerOf = f => LAYER[f.split("/")[1]];
for (const f of walk("js")) for (const m of read(f).matchAll(/from "(\.[^"]+)"/g)){
  const to = path.posix.join(path.posix.dirname(f), m[1]);
  const same = f.split("/")[1]===to.split("/")[1];
  check(same || layerOf(to) < layerOf(f), `${f} imports ${to}: that's a layer above it (see CLAUDE.md)`);
  check(!(f.startsWith("js/engine/") && to==="js/store.js"), `${f} imports saved state: the engine must stay pure`);
}

/* 4. the engine: every combination of options the app can ask for */
function* matrix(){
  const eqG=[{machines:1,bench:1,smith:1,barbell:1,bar:1,trx:1,rower:1,arc:1,elliptical:1,gymbike:1,climber:1,tread:1},{machines:1,bench:1,rower:1,arc:1,bar:1},{bench:1},{}];
  const eqH=[{bar:1,run:1,stairs:1,peloton:1,outbike:1,rope:1},{rope:1},{stairs:1,run:1},{peloton:1},{}];
  for (const phase of [1,2,3,4]) for (const rec of ["green","yellow","red"]) for (const type of ["full","yoga","strength","cardio","mix"])
  for (const loc of ["home","gym"]) for (const eq of (loc==="gym"?eqG:eqH)) for (const ab of [0,1]) for (const second of [false,true]) for (const dbOn of [false,true]){
    const base={phase,rec,type,loc,eq,ab,homeAb:ab,gymN:ab+1,second,dbOn,mixN:ab+1,hangT:35,W:{heavy:30,light:25,gymHeavy:40,gymLight:30}};
    yield base;
    if (loc==="gym" && type!=="yoga" && type!=="mix"){ yield {...base, easy:"elliptical"}; yield {...base, cMode:"peloton", pel:{kind:"pz",mins:20}, ftp:200}; }
    if (type==="cardio" && loc==="home"){
      for (const cMode of ["stairs","run","rope"]) yield {...base, cMode, repeats:true, longDay:!!ab, bikeTo:!!ab, lapT:{"Back stairs":75}};
      for (const kind of ["pz","pzend","pzmax","ftp","low"]) yield {...base, cMode:"peloton", pel:{kind,mins:30}, ftp:200};
    }
  }
}
const { build } = await import(pathToFileURL(path.join(root, "js/engine/build.js")));
const h = crypto.createHash("sha256"); let n = 0;
for (const o of matrix()){ h.update(JSON.stringify(build(o))); n++; }
const got = h.digest("hex"), hashFile = path.join(root, "tools/engine.hash");
if (process.argv.includes("--accept")){ fs.writeFileSync(hashFile, got+"\n"); console.log(`Recorded the engine hash over ${n} sessions.`); }
else check(fs.existsSync(hashFile) && fs.readFileSync(hashFile, "utf8").trim()===got, `The engine builds different sessions than it did (${n} checked). If that's intended: node tools/check.mjs --accept`);

if (fails.length){ console.error(fails.map(f => "FAIL  "+f).join("\n")); process.exit(1); }
console.log(`OK  ${assets.length} files cached, ${ver}, ${n} sessions unchanged.`);
