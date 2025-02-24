const CACHE_NAME = 'to-do-pwa-cache-v1';
const FILES_TO_CACHE = [
 '/https://github.com/Samar-deep/Booklogs.git/',
 '/https://github.com/Samar-deep/Booklogs.git /index.html',
 '/https://github.com/Samar-deep/Booklogs.git /style.css',
 '/https://github.com/Samar-deep/Booklogs.git /app.js',
 '/https://github.com/Samar-deep/Booklogs.git /manifest.json',
 '/https://github.com/Samar-deep/Booklogs.git /icons/icon-128.png',
 '/https://github.com/Samar-deep/Booklogs.git /icons/icon-512.png'
];
self.addEventListener('install', (event) => {
 event.waitUntil(
 caches.open(CACHE_NAME)
 .then((cache) => cache.addAll(FILES_TO_CACHE))
 );
});
self.addEventListener('fetch', (event) => {
 event.respondWith(
 caches.match(event.request)
 .then((response) => response || fetch(event.request))
 );
});
