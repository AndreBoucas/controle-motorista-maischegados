// Service worker: deixa o app abrir sem internet.
// Ao publicar uma versão nova, troque o número em VERSAO.
var VERSAO = "motorista-v72";
var ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png?v=24", "./icon-512.png?v=24", "./icon-maskable-512.png?v=24", "./apple-touch-icon.png?v=24"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Abre na hora com a cópia guardada e atualiza em segundo plano.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, e.request.mode === "navigate" ? { ignoreSearch: true } : {}).then(function (hit) {
      var rede = fetch(e.request).then(function (r) {
        if (r && r.ok) { var cp = r.clone(); caches.open(VERSAO).then(function (c) { c.put(e.request, cp); }); }
        return r;
      }).catch(function () { return hit || caches.match("./index.html"); });
      return hit || rede;
    })
  );
});
