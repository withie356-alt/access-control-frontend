const CACHE_NAME = 'access-control-system-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  // Note: For production, you'd cache the built JavaScript files (e.g., from /dist)
  // For development, you might need to adjust this or use a build tool to generate this list.
  // For now, we'll include the main entry point as a placeholder.
  '/index.tsx', 
  '/with-incheon-energy-icon.png',
  '/with-incheon-energy-logo.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});