/* eslint-disable no-restricted-globals */

const CACHE_NAME = "storyin-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.bundle.js",
  "./app.css",
  "./favicon.ico",
  "./manifest.json",
  "./images/logo-storyin.png",
  "./images/screenshot-1.png",
  "./images/screenshot-2.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching App Shell");
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`Service Worker: Failed to cache ${url}`, err);
          });
        }),
      );
    }),
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    self.clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache");
              return caches.delete(cache);
            }
          }),
        );
      });
    }),
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // API Requests: Stale-While-Revalidate
  if (url.origin === "https://story-api.dicoding.dev") {
    event.respondWith(
      caches.open("storyin-api-cache").then((cache) => {
        return fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => {
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              return Response.error();
            });
          });
      }),
    );
    return;
  }

  // Other Requests: Cache-First
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch((err) => {
          console.warn(`Service Worker: Fetch failed for ${request.url}`, err);
          return Response.error();
        })
      );
    }),
  );
});

// Handle push event
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push Received");

  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "StoryIn - Cerita Baru!";
    const options = {
      body:
        data.options?.body || "Ada cerita baru yang dibagikan. Cek sekarang!",
      icon: "./favicon.ico",
      badge: "./favicon.ico",
      data: {
        url: self.registration.scope,
        storyId: data.storyId || null,
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Service Worker: Error displaying notification", error);

    // Fallback for non-JSON push data if any
    const options = {
      body: event.data ? event.data.text() : "Ada pembaruan dari StoryIn!",
      icon: "./favicon.ico",
    };
    event.waitUntil(
      self.registration.showNotification("StoryIn Update", options),
    );
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification Clicked");
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const storyId = event.notification.data?.storyId;
        const targetUrl = storyId
          ? `${self.registration.scope}#/detail/${storyId}`
          : self.registration.scope;

        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (
            client.url === self.registration.scope ||
            client.url.startsWith(self.registration.scope + "#")
          ) {
            if ("focus" in client) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
