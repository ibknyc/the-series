/* The Series - offline shell.
   The app is many files that must match each other, so each version is cached whole:
   install downloads every file fresh, and only then does the new version take over.
   Everything is served from that cache. Bump CACHE (and APP_VER in js/version.js) with every release;
   ASSETS must list every file the app loads. tools/check.mjs verifies both. */
const CACHE = "series-v41";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./local-fonts.css",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./atkinson-hyperlegible-latin-400-normal.woff2",
  "./atkinson-hyperlegible-latin-700-normal.woff2",
  "./bodoni-moda-latin-700-normal.woff2",
  "./bodoni-moda-latin-900-normal.woff2",
  "./bricolage-grotesque-latin-500-normal.woff2",
  "./bricolage-grotesque-latin-700-normal.woff2",
  "./bricolage-grotesque-latin-800-normal.woff2",
  "./familjen-grotesk-latin-400-normal.woff2",
  "./familjen-grotesk-latin-700-normal.woff2",
  "./unbounded-latin-600-normal.woff2",
  "./unbounded-latin-800-normal.woff2",
  "./css/tokens.css",
  "./css/controls.css",
  "./css/home.css",
  "./css/player.css",
  "./css/sheet.css",
  "./css/done.css",
  "./css/layout-bleed.css",
  "./css/layout-plate.css",
  "./css/layout-quiet.css",
  "./css/layout-split.css",
  "./css/skin-cyano.css",
  "./css/skin-mysore.css",
  "./css/skin-sodium.css",
  "./css/type-editorial.css",
  "./css/type-volume.css",
  "./js/data/cardio.js",
  "./js/data/catalog.js",
  "./js/data/guide.js",
  "./js/data/looks.js",
  "./js/data/poses.js",
  "./js/engine/build.js",
  "./js/engine/capoeira.js",
  "./js/engine/cardio.js",
  "./js/engine/context.js",
  "./js/engine/exercises.js",
  "./js/engine/isometrics.js",
  "./js/engine/plan-edit.js",
  "./js/engine/sessions.js",
  "./js/engine/stairs.js",
  "./js/engine/steps.js",
  "./js/engine/strength.js",
  "./js/engine/whoop.js",
  "./js/engine/yoga.js",
  "./js/export/csv.js",
  "./js/export/index.js",
  "./js/export/tables.js",
  "./js/export/zip.js",
  "./js/log/entries.js",
  "./js/log/rows.js",
  "./js/main.js",
  "./js/player/audio.js",
  "./js/player/cardioSheet.js",
  "./js/player/controls.js",
  "./js/player/exitSheet.js",
  "./js/player/figure.js",
  "./js/player/session.js",
  "./js/player/setSheet.js",
  "./js/player/sheet.js",
  "./js/player/state.js",
  "./js/player/swapSheet.js",
  "./js/player/view.js",
  "./js/progress/advice.js",
  "./js/progress/holds.js",
  "./js/progress/laps.js",
  "./js/progress/peloton.js",
  "./js/progress/recovery.js",
  "./js/progress/review.js",
  "./js/progress/stages.js",
  "./js/progress/today.js",
  "./js/progress/weights.js",
  "./js/store.js",
  "./js/ui/cardioPick.js",
  "./js/ui/done.js",
  "./js/ui/gates.js",
  "./js/ui/home.js",
  "./js/ui/look.js",
  "./js/ui/park.js",
  "./js/ui/plan.js",
  "./js/ui/resume.js",
  "./js/ui/settings.js",
  "./js/ui/stairsBox.js",
  "./js/ui/today.js",
  "./js/ui/week.js",
  "./js/ui/weightsBox.js",
  "./js/util/bus.js",
  "./js/util/dom.js",
  "./js/util/format.js",
  "./js/util/screens.js",
  "./js/util/time.js",
  "./js/version.js"
];

/* Safari refuses to show a redirected response from a service worker: keep a clean copy */
const clean = res => res.redirected ? res.blob().then(b => new Response(b, {status: res.status, headers: res.headers})) : Promise.resolve(res);

self.addEventListener("install", e => {
  /* all or nothing: if one file fails, the old version stays in charge */
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a =>
    fetch(a, {cache: "reload"}).then(res => { if (!res.ok) throw new Error(a + " " + res.status); return clean(res); }).then(res => c.put(a, res))
  ))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const page = req.mode === "navigate";
  e.respondWith(caches.open(CACHE)
    .then(c => c.match(req, {ignoreSearch: true}).then(hit => hit || (page ? c.match("./index.html") : null)))
    /* not part of the app (or the cache was cleared): go to the network */
    .then(hit => hit || fetch(req.url, {credentials: "same-origin"}).then(clean))
    .catch(() => new Response("Offline. Open the app again when you have a connection.", {status: 503, headers: {"Content-Type": "text/plain"}})));
});
