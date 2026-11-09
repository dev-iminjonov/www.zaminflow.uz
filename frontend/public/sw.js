// ZaminFlow AgriTech Service Worker (Rural Pasture Offline & Fast-Cache)
const CACHE_NAME = "zaminflow-v2.1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.png",
  "/favicon.ico",
  "/images/zaminflow-logo-dark.png",
  "/dashboard/driver",
  "/dashboard/farmer",
  "/dashboard/driver/route",
  "/dashboard/farmer/qr-pickup",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Resilient install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip API or websocket calls
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/ws/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for document navigation
        if (event.request.mode === "navigate") {
          return (await caches.match("/")) || new Response("Oflayn rejim faol", { headers: { "Content-Type": "text/html" } });
        }
        return new Response("Oflayn rejimda mavjud emas", { status: 503, statusText: "Offline" });
      })
  );
});
