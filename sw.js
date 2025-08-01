const cacheName = 'rubik-pwa-v2';

const filesToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/blueRubiksV2.png'
];

// Install: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// Fetch: respond with cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
