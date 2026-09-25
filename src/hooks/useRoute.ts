import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'browse' }
  | { name: 'technique'; slug: string }
  | { name: 'profil' }
  | { name: 'train' }
  | { name: 'reglages' }
  | { name: 'dan'; dan: 1 | 2 | 3 }
  /** Adresse qui ne correspond à rien : on le dit, plutôt que de servir l'accueil. */
  | { name: 'notFound'; path: string }

export function parseRoute(pathname: string): Route {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/')
  if (parts[0] === 'techniques') return { name: 'browse' }
  if (parts[0] === 'mon-judo') return { name: 'profil' }
  if (parts[0] === 'reglages') return { name: 'reglages' }
  if (parts[0] === 'technique' && parts[1]) return { name: 'technique', slug: decodeURIComponent(parts[1]) }
  if (parts[0] === 'dojo' && parts[1] === 'ceinture-noire') {
    const dan = parts[2] === '2e-dan' ? 2 : parts[2] === '3e-dan' ? 3 : 1
    return { name: 'dan', dan }
  }
  if (parts[0] === 'dojo') return { name: 'train' }
  if (pathname.replace(/^\/+|\/+$/g, '') === '') return { name: 'home' }
  return { name: 'notFound', path: pathname }
}

export const routePath = (r: Route): string =>
  r.name === 'browse' ? '/techniques' : r.name === 'technique' ? `/technique/${r.slug}` : r.name === 'profil' ? '/mon-judo' : r.name === 'reglages' ? '/reglages' : r.name === 'train' ? '/dojo' : r.name === 'dan' ? `/dojo/ceinture-noire${r.dan === 1 ? '' : `/${r.dan}e-dan`}` : r.name === 'notFound' ? r.path : '/'

/**
 * Défile jusqu'à l'élément d'ancre. L'écran visé peut être chargé à part et
 * n'exister qu'après quelques images : on le guette un court instant au lieu
 * de supposer qu'il est déjà là.
 */
export function scrollToAnchor(id: string, essais = 40) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ block: 'start' })
    return
  }
  if (essais > 0) window.setTimeout(() => scrollToAnchor(id, essais - 1), 50)
}

/** Routeur minimal sur l'History API : pas de dépendance, URLs propres. */
export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname))

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname))
    window.addEventListener('popstate', onPop)
    // Accès direct à une ancre : le navigateur n'y défile pas, la page
    // n'étant pas encore rendue quand il la cherche.
    const initial = decodeURIComponent(window.location.hash.slice(1))
    if (initial) scrollToAnchor(initial)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((r: Route, opts?: { replace?: boolean; keepQuery?: boolean; hash?: string }) => {
    const url = routePath(r) + (opts?.keepQuery ? window.location.search : '') + (opts?.hash ? `#${opts.hash}` : '')
    if (url === window.location.pathname + (opts?.keepQuery ? window.location.search : '') + window.location.hash) {
      if (opts?.hash) scrollToAnchor(opts.hash)
      return
    }
    history[opts?.replace ? 'replaceState' : 'pushState'](null, '', url)
    setRoute(r)
    if (opts?.hash) scrollToAnchor(opts.hash)
    else window.scrollTo({ top: 0 })
  }, [])

  return { route, navigate }
}
