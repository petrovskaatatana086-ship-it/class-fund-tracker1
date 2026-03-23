const CACHE_NAME = 'school-fund-v1';
const urlsToCache = [
  '/class-fund-tracker1/school/',
  '/class-fund-tracker1/school/index.html',
  '/class-fund-tracker1/school/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap'
];

self.addEventListener('install', event => {
  console.log('[School PWA] Установка');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[School PWA] Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[School PWA] Ошибка кэширования:', err))
  );
});

self.addEventListener('activate', event => {
  console.log('[School PWA] Активация');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[School PWA] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});
