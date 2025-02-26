const CACHE_NAME = 'book-log-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
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
    if (event.request.url.includes('google.firestore.googleapis.com')) {
      // Let the network handle Firestore requests
      return;
    }
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  });
  
