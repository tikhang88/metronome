/* Service Worker：首次載入後把全部資源存入本機快取，之後完全離線可用 */
var CACHE = 'metronome-v1.1.1';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('metronome-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); }
      return res;
    }).catch(function () {
      if (req.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    });
  }));
});
