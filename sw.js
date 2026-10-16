var CACHE = 'lube-cat-v3';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png', './logo-lube.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (url.hostname.indexOf('script.google') !== -1 || url.hostname.indexOf('googleusercontent') !== -1) return;
  var isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (isPage) {
    e.respondWith(
      fetch(req).then(function (resp) {
        if (resp && resp.status === 200) { var c = resp.clone(); caches.open(CACHE).then(function (ca) { ca.put('./index.html', c); }); }
        return resp;
      }).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (resp) {
        if (req.method === 'GET' && resp && resp.status === 200) { var c = resp.clone(); caches.open(CACHE).then(function (ca) { ca.put(req, c); }); }
        return resp;
      });
    })
  );
});
