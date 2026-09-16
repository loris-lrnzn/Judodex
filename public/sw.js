/* Judodex — service worker : l'appli reste consultable sans réseau.
 *
 * VERSION et PRECACHE sont réécrits au build par scripts/gen-sw.mjs : la
 * version suit l'empreinte des fichiers produits, et la liste porte les
 * fragments de code des écrans secondaires. Sans cette liste, seuls les
 * écrans effectivement ouverts pendant que le réseau était là restaient
 * disponibles ensuite — ce qui, dans un dojo sans réseau, revient à ne rien
 * promettre du tout. */
const VERSION = 'judodex-dev'
const PRECACHE = ['/', '/techniques', '/dojo', '/mon-judo', '/reglages', '/icon.svg', '/manifest.webmanifest']

/* Le serveur répond « Vary: Origin » sur les ressources versionnées. Les
   fichiers pré-chargés le sont par le service worker, qui n'envoie pas
   d'en-tête Origin, alors que la page les redemande avec l'attribut
   crossorigin, donc avec un Origin. Sans ignoreVary, l'appariement échoue et
   le cache ne sert jamais : l'application était hors ligne en apparence
   seulement. */
const APPARIER = { ignoreVary: true }

const SHELL = `${VERSION}-shell`
const MEDIA = `${VERSION}-media`
const MEDIA_MAX = 300

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      // Un `addAll` échoue en bloc dès qu'une seule requête rate ; ici, une
      // ressource manquante ne doit pas empêcher toutes les autres d'entrer.
      .then((c) =>
        Promise.all(
          PRECACHE.map((u) =>
            fetch(new Request(u, { cache: 'reload' }))
              .then((res) => (res.ok ? propre(res).then((r) => c.put(u, r)) : null))
              .catch(() => {}),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/* Vercel redirige /index.html vers / (cleanUrls). Une réponse issue d'une
   redirection est refusée par le navigateur pour une navigation : on la
   recopie en réponse neuve avant de la mettre en cache. */
async function propre(res) {
  if (!res.redirected) return res
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers })
}

/** Borne la taille du cache média (FIFO). */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Navigation : réseau d'abord. Chaque page visitée est mise de côté, car
  // elles ne se valent plus — depuis le pré-rendu, le fichier d'une route
  // porte le contenu de cette route. Hors réseau, on sert donc la page exacte
  // si on l'a, et la coquille d'accueil sinon : l'application s'y recale
  // d'elle-même sur l'adresse demandée.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            propre(copy).then((r) => caches.open(SHELL).then((c) => c.put(request.url, r)))
          }
          return res
        })
        .catch(() =>
          caches
            .match(request.url, APPARIER)
            .then((hit) => hit || caches.match('/', APPARIER))
            .then((r) => r || Response.error()),
        ),
    )
    return
  }

  // Images et polices distantes : cache d'abord (elles ne changent jamais).
  const isMedia =
    /\.(png|jpe?g|webp|svg|woff2?)$/i.test(url.pathname) || url.hostname.endsWith('ytimg.com') || url.hostname.endsWith('gstatic.com')
  if (isMedia) {
    event.respondWith(
      caches.match(request, APPARIER).then(
        (hit) =>
          hit ||
          fetch(request)
            .then((res) => {
              if (res.ok || res.type === 'opaque') {
                const copy = res.clone()
                caches.open(MEDIA).then((c) => c.put(request, copy).then(() => trim(MEDIA, MEDIA_MAX)))
              }
              return res
            })
            .catch(() => hit || Response.error()),
      ),
    )
    return
  }

  // Ressources de l'appli : cache d'abord, revalidation en arrière-plan.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request, APPARIER).then((hit) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(SHELL).then((c) => c.put(request, copy))
            }
            return res
          })
          .catch(() => hit || Response.error())
        return hit || network
      }),
    )
  }
})
