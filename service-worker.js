self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cash-book-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/dashboard.html',
        '/dashboard.js',
        '/credit.html',
        '/credit.js',
        '/debit.html',
        '/debit.js',
        '/common.js'
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
