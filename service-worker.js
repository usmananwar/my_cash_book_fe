self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cash-book-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/register.html',
        '/edit-transaction.html',
        '/dashboard.html',
        '/credit.html',
        '/debit.html',
        '/style.css',
        '/dashboard.js',
        '/credit.js',
        '/debit.js',
        '/edit-transaction.js',
        '/register.js',
        '/login.js',
        '/common.js',
        '/favicon.ico',
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
