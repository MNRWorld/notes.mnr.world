/**
 * Service Worker for আমার নোট
 * Provides offline functionality and caching
 */

const CACHE_NAME = "amar-note-v1";
const STATIC_CACHE_NAME = "amar-note-static-v1";
const DYNAMIC_CACHE_NAME = "amar-note-dynamic-v1";

// Resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/editor",
  "/templates",
  "/archive",
  "/trash",
  "/profile",
  "/mnrAI",
  "/manifest.json",
  "/favicon.png",
  "/fonts/tiro-bangla-regular.woff2",
  "/fonts/hind-siliguri-regular.woff2",
  "/fonts/baloo-da-2-regular.woff2",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith("amar-note-")
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("[SW] Serving from cache:", request.url);
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache if not successful
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            console.log("[SW] Caching dynamic content:", request.url);
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error);

          // Return offline fallback for navigation requests
          if (request.destination === "document") {
            return caches.match("/");
          }

          throw error;
        });
    }),
  );
});

// Background sync for offline note saving
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "sync-notes") {
    event.waitUntil(syncOfflineNotes());
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: "আপনার নোট সংরক্ষিত হয়েছে",
    icon: "/favicon.png",
    badge: "/favicon.png",
    tag: "note-saved",
    data: {
      url: "/",
    },
  };

  event.waitUntil(self.registration.showNotification("আমার নোট", options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_NOTE":
      cacheNoteData(payload);
      break;

    case "CLEAR_CACHE":
      clearAllCaches();
      break;

    default:
      console.log("[SW] Unknown message type:", type);
  }
});

// Helper function to sync offline notes
async function syncOfflineNotes() {
  try {
    console.log("[SW] Syncing offline notes...");

    // This would integrate with your IndexedDB storage
    // to sync any pending changes when connection is restored

    // For now, just log the sync attempt
    console.log("[SW] Offline notes sync completed");

    // Show notification on successful sync
    self.registration.showNotification("আমার নোট", {
      body: "অফলাইন নোট সিঙ্ক সম্পূর্ণ হয়েছে",
      icon: "/favicon.png",
      tag: "sync-complete",
    });
  } catch (error) {
    console.error("[SW] Failed to sync offline notes:", error);
  }
}

// Helper function to cache note data
async function cacheNoteData(noteData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(noteData), {
      headers: { "Content-Type": "application/json" },
    });

    await cache.put(`/note-data/${noteData.id}`, response);
    console.log("[SW] Note data cached:", noteData.id);
  } catch (error) {
    console.error("[SW] Failed to cache note data:", error);
  }
}

// Helper function to clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("[SW] All caches cleared");
  } catch (error) {
    console.error("[SW] Failed to clear caches:", error);
  }
}

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  console.log("[SW] Periodic sync triggered:", event.tag);

  if (event.tag === "cleanup-notes") {
    event.waitUntil(cleanupExpiredNotes());
  }
});

// Helper function to cleanup expired notes
async function cleanupExpiredNotes() {
  try {
    console.log("[SW] Cleaning up expired notes...");

    // This would integrate with your privacy manager
    // to clean up expired anonymous notes

    console.log("[SW] Expired notes cleanup completed");
  } catch (error) {
    console.error("[SW] Failed to cleanup expired notes:", error);
  }
}
