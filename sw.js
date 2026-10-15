/* The Series - offline shell.
   Pages: network first, so a new version shows on the first launch.
   Fonts and icons: cache first, they never change. */
const CACHE = "series-v26";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./local-fonts.css", "./icon-192.png", "./icon-512.png", "./icon-180.png", "./anton-latin-400-normal.woff2", "./atkinson-hyperlegible-latin-400-normal.woff2", "./atkinson-hyperlegible-latin-700-normal.woff2", "./bodoni-moda-latin-700-normal.woff2", "./bodoni-moda-latin-900-normal.woff2", "./bricolage-grotesque-latin-500-normal.woff2", "./bricolage-grotesque-latin-700-normal.woff2", "./bricolage-grotesque-latin-800-normal.woff2", "./chivo-latin-400-normal.woff2", "./chivo-latin-700-normal.woff2", "./familjen-grotesk-latin-400-normal.woff2", "./familjen-grotesk-latin-700-normal.woff2", "./instrument-serif-latin-400-normal.woff2", "./martian-mono-latin-400-normal.woff2", "./martian-mono-latin-700-normal.woff2", "./unbounded-latin-600-normal.woff2", "./unbounded-latin-800-normal.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html") || url.pathname.endsWith("sw.js");
  if (url.origin === location.origin && isPage) {
    e.respondWith(fetch(req, {cache: "no-store"}).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});
