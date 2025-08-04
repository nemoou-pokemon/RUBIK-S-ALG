// IMPORTANT: Change this version number every time you deploy updates!
const cacheName = 'rubik-pwa-v4'; // INCREMENT THIS NUMBER when you update!
const filesToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/blueRubiksV2.png',
  './assets/clock.png',
  './cfop.html' // Add your other pages
];

// Install: cache essential files and force update
self.addEventListener('install', event => {
  console.log('🔧 SW: Installing version', cacheName);
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
      .then(() => {
        // Force the new service worker to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 SW: Activating version', cacheName);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => {
            if (name !== cacheName) {
              console.log('🗑️ SW: Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch: Network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Network-first strategy for HTML files (ensures updates are fetched)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network succeeds, update cache and return response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(cacheName)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first for other resources (images, etc.)
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          return cached || fetch(event.request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(cacheName)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
  }
});