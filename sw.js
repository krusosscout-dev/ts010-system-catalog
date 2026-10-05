// Service Worker for Kru Sauce PWA (TS010) - v4
const CACHE_NAME = "sauce-hub-v4";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.startsWith("chrome-extension")) return;
  // Network first strategy with fallback to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Only cache valid GET responses
        if (res && res.status === 200 && res.type === "basic") {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
