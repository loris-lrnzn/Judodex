import { useEffect, useRef } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import type { Route } from '../hooks/useRoute'
import { Link } from './Link'

interface Props {
  route: Route
  dex: Judodex
  /** Titre de la page atteinte, à énoncer après une navigation. */
  annonce: string
  onSearch: () => void
  children: React.ReactNode
}

const NAV: { route: Route; label: string }[] = [
  { route: { name: 'home' }, label: 'Carnet' },
  { route: { name: 'browse' }, label: 'Techniques' },
  { route: { name: 'train' }, label: 'Dojo' },
  { route: { name: 'profil' }, label: 'Mon judo' },
]

/** L'engrenage des réglages. Un glyphe de police se rendrait de travers
 *  d'une plateforme à l'autre ; le tracé, lui, est le même partout. */
function Engrenage() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M12.9 3.1l-1.4 1.4M4.5 11.5l-1.4 1.4" strokeLinecap="round" />
    </svg>
  )
}

export function AppShell({ route, dex, annonce, onSearch, children }: Props) {
  const rail = useRef<HTMLElement>(null)

  /* Sur les écrans les plus étroits, les quatre onglets ne tiennent pas de
     front : le bandeau défile, et l'onglet courant vient se montrer plutôt
     que de rester coupé au bord. */
  useEffect(() => {
    const el = rail.current?.querySelector('[aria-current="page"]')
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [route])

  const isActive = (r: Route) =>
    r.name === route.name ||
    (r.name === 'browse' && route.name === 'technique') ||
    (r.name === 'train' && route.name === 'dan')

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-blue focus:px-3 focus:py-2 focus:text-field">
        Aller au contenu
      </a>

      {/* Réglette de marge : le dos de l'ouvrage. Graduée comme le bord d'un
          plan, elle porte le titre en écriture verticale et l'avancement. */}
      <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-[46px] flex-col items-center border-r border-rule bg-plate pr-[7px] lg:flex">
        {/* Graduation, cantonnée au bord et arrêtée avant le logo comme avant
            le relevé, pour ne croiser ni l'un ni l'autre. */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-14 right-0 top-6 w-[7px]"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, var(--c-rule) 0 1px, transparent 1px 12px)' }}
        />

        <div className="flex flex-1 items-center py-10">
          <span className="annot whitespace-nowrap text-faint" style={{ writingMode: 'vertical-rl' }}>
            JUDODEX — LE CARNET DU JUDOKA
          </span>
        </div>

        <span
          className="annot mb-4 shrink-0 text-signal"
          style={{ writingMode: 'vertical-rl' }}
          title={`${dex.stats.completion} % des techniques marquées acquises`}
        >
          {dex.stats.completion}% ACQUIS
        </span>
      </aside>

      {/* Bandeau d'en-tête */}
      {/* Le flou est porté par un calque et non par le bandeau lui-même : un
          `backdrop-filter` fait de son élément le bloc conteneur de tout ce
          qu'il contient, et la barre d'onglets, pourtant fixée au bas de la
          fenêtre, se serait accrochée au bas de l'en-tête. */}
      <header className="safe-t sticky top-0 z-30 border-b border-ink lg:pl-[46px]">
        <span aria-hidden className="absolute inset-0 -z-10 bg-field/95 backdrop-blur" />
        <div className="mx-auto flex h-14 max-w-[1200px] items-stretch pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-[max(1.75rem,env(safe-area-inset-left))] sm:pr-[max(1.75rem,env(safe-area-inset-right))]">
          <Link to={{ name: 'home' }} className="tap flex items-center justify-center pr-1 sm:pr-2" aria-label="Accueil Judodex">
            <span className="font-jp grid size-7 place-items-center bg-ink text-base leading-none text-field">柔</span>
          </Link>

          {/*
            Une seule navigation, à deux places. Sous 640 px elle se détache en
            bas de l'écran — les quatre onglets s'y coupaient en plein mot, et
            le pouce ne monte pas jusqu'au bandeau ; au-delà elle reprend son
            rang dans l'en-tête. La dédoubler aurait donné deux repères de même
            nom et tous les liens en double à qui navigue à l'oreille.
          */}
          <nav
            ref={rail}
            className="rail-nav safe-b fixed inset-x-0 bottom-0 z-30 flex min-w-0 border-t border-ink bg-field/95 backdrop-blur sm:static sm:z-auto sm:items-stretch sm:overflow-x-auto sm:border-0 sm:bg-transparent sm:pb-0 sm:backdrop-blur-none"
            aria-label="Navigation principale"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.route}
                aria-current={isActive(n.route) ? 'page' : undefined}
                className={`tap group relative flex flex-1 items-center justify-center py-3 transition sm:flex-none sm:shrink-0 sm:px-4 sm:py-0 ${isActive(n.route) ? 'text-ink' : 'text-faint hover:text-ink'}`}
              >
                <span className="text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]">{n.label}</span>
                {/* Le trait se pose du côté du contenu : au-dessus de la barre
                    basse, sous les libellés du bandeau. */}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-[3px] bg-signal transition-transform duration-200 sm:inset-x-4 sm:bottom-0 sm:top-auto ${isActive(n.route) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  style={{ transformOrigin: 'left' }}
                />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {dex.stats.due > 0 && (
              /* Le seul état vivant du carnet : il s'effaçait précisément sur
                 le téléphone, celui qu'on a au bord du tatami. */
              <Link
                to={{ name: 'train' }}
                className="tap annot flex h-8 items-center gap-1.5 border border-signal px-2 text-signal transition hover:bg-signal hover:text-field"
                aria-label={`${dex.stats.due} techniques à revoir`}
              >
                <span className="size-1.5 shrink-0 bg-signal" />
                {dex.stats.due}
                <span className="hidden sm:inline">à revoir</span>
              </Link>
            )}

            <button onClick={onSearch} className="tap annot flex h-8 min-w-8 items-center justify-center gap-2 border border-ink px-2 transition hover:bg-ink hover:text-field" aria-label="Rechercher">
              <span className="text-[12px] leading-none">⌕</span>
              <span className="hidden md:inline">Chercher</span>
              <span className="hidden opacity-50 md:inline">/</span>
            </button>

            {/* Le menu ⋯ n'abritait que « Mon judo », qui est un onglet à
                lui seul, et « Réglages ». Il repliait donc un doublon sur un
                unique lien : autant ouvrir celui-ci directement. */}
            <Link
              to={{ name: 'reglages' }}
              aria-current={route.name === 'reglages' ? 'page' : undefined}
              aria-label="Réglages"
              title="Réglages"
              className={`tap grid size-8 place-items-center border border-ink transition hover:bg-ink hover:text-field ${route.name === 'reglages' ? 'bg-ink text-field' : ''}`}
            >
              <Engrenage />
            </Link>
          </div>
        </div>
      </header>

      {/* La navigation ne recharge rien : sans ce relais, un lecteur d'écran
          ne dirait pas qu'on a changé de page. */}
      <p aria-live="polite" role="status" className="sr-only">
        {annonce}
      </p>

      {/* La barre d'onglets tient sous le contenu : on lui réserve sa hauteur,
          sans quoi la dernière ligne de chaque page passerait dessous. */}
      <main id="main" className="pb-[56px] sm:pb-0 lg:pl-[46px]">
        <div className="safe-x safe-b">{children}</div>
      </main>

    </div>
  )
}
