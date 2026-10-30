// Service Worker for Kru Sauce PWA (TS010) - v15
const CACHE_NAME = "sauce-hub-v15";

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
  if (e.request.method !== "GET") return;

  let url;
  try {
    url = new URL(e.request.url);
  } catch (_) {
    return;
  }

  // Strictly DO NOT intercept Firestore, Firebase, Google APIs, Chrome extensions, or external third-party hosts
  if (
    url.origin !== self.location.origin ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("gstatic.com") ||
    url.protocol.startsWith("chrome")
  ) {
    return;
  }

  // Network first strategy for same-origin app assets
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        if (e.request.mode === "navigate") {
          return (await caches.match("./index.html")) || (await caches.match("/index.html"));
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});
