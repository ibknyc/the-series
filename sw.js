/* The Series - offline shell. Bump CACHE when you change index.html. */
const CACHE = "series-v12";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./local-fonts.css", "./icon-192.png", "./icon-512.png", "./icon-180.png", "./anton-latin-400-normal.woff2", "./atkinson-hyperlegible-latin-400-normal.woff2", "./atkinson-hyperlegible-latin-700-normal.woff2", "./bodoni-moda-latin-700-normal.woff2", "./bodoni-moda-latin-900-normal.woff2", "./bricolage-grotesque-latin-500-normal.woff2", "./bricolage-grotesque-latin-700-normal.woff2", "./bricolage-grotesque-latin-800-normal.woff2", "./chivo-latin-400-normal.woff2", "./chivo-latin-700-normal.woff2", "./familjen-grotesk-latin-400-normal.woff2", "./familjen-grotesk-latin-700-normal.woff2", "./instrument-serif-latin-400-normal.woff2", "./martian-mono-latin-400-normal.woff2", "./martian-mono-latin-700-normal.woff2", "./unbounded-latin-600-normal.woff2", "./unbounded-latin-800-normal.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    /* app shell: cache first, refresh in the background */
    e.respondWith(caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  } else {
    /* fonts: network, fall back to cache */
    e.respondWith(fetch(e.request).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request)));
  }
});