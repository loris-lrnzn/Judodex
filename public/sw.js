// Judodex — Service Worker
const CACHE = 'judodex-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isApi = url.pathname.includes('/wp-json/') || url.hostname !== self.location.hostname

  if (isApi) {
    // API : réseau en priorité, cache en fallback (offline)
    e.respondWith(
      fetch(request)
        .then(res => {
          if (res.status < 400) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
  } else {
    // Assets statiques : cache en priorité, réseau en fallback
    e.respondWith(
      caches.match(request).then(cached => {
        const fetched = fetch(request).then(res => {
          if (res.status < 400) {
            caches.open(CACHE).then(c => c.put(request, res.clone()))
          }
          return res
        })
        return cached || fetched
      })
    )
  }
})
