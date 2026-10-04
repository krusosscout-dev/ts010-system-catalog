// Minimal Service Worker for Kru Sauce PWA installation
const CACHE_NAME = "sauce-hub-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./logo-512.png",
  "./favicon.png",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.url.startsWith("chrome-extension")) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
