self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cash-book-cache').then(cache => {
      return cache.addAll([
        '/',
        '/html/index.html',
        '/html/register.html',
        '/html/edit-transaction.html',
        '/html/dashboard.html',
        '/html/credit.html',
        '/html/debit.html',
        '/style.css',
        '/js/dashboard.js',
        '/js/credit.js',
        '/js/debit.js',
        '/js/edit-transaction.js',
        '/js/register.js',
        '/js/login.js',
        '/js/common.js',
        '/js/app.js',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, { redirect: 'follow' }).catch(() => {
      return caches.match(event.request);
    })
  );
});
