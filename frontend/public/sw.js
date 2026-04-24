/**
 * Service Worker básico — FFV Academy
 *
 * Estratégia:
 * - HTML: network-first, fallback cache (sempre versão mais nova quando online)
 * - JS/CSS/imagens: cache-first com background update (rápido + atual)
 * - Offline: serve home + última sessão
 *
 * Não inclui push notifications (precisa backend).
 * Versão simples — pode evoluir com Workbox no futuro.
 */

const CACHE_VERSION = 'ffv-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/progresso',
  '/revisar',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('ffv-') && !key.startsWith(CACHE_VERSION))
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // Apenas GET
  if (request.method !== 'GET') return;
  // Skip cross-origin (Plausible, Buttondown, etc.)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML: network-first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  // JS/CSS/images: cache-first com background revalidation (stale-while-revalidate)
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Hook pra receber mensagens do client (futuras sync de notificações, etc.)
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
