const CACHE_NAME = "karaoke-paty-v4";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./songs.json",
  "./manifest.json",
  "./whatsapp.svg",
  "./icon-192.png",
  "./icon-512.png"
];

// Instala e faz pré-cache dos arquivos essenciais
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Remove caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estratégia NETWORK-FIRST com fallback para cache
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Sempre tentar a rede primeiro
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Atualiza o cache com a versão mais recente
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      })
      .catch(() => {
        // Se offline, tenta buscar no cache
        return caches.match(request);
      })
  );
});