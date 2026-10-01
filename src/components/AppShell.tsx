import { useEffect, useRef } from 'react'
import type { Route } from '../hooks/useRoute'
import { Link } from './Link'
import { Signature } from './Marque'
import { PROGRESSION_SOURCE } from '../lib/belts'

interface Props {
  route: Route
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
 *  d'une plateforme à l'autre ; le tracé, lui, est le même partout. Il porte
 *  des dents franches : huit rayons autour d'un cercle se lisaient comme un
 *  soleil, c'est-à-dire comme un sélecteur de thème. */
function Engrenage() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden>
      <path d="M5.95 3.01L6.43 0.97L9.57 0.97L10.05 3.01L11.86 1.92L14.08 4.14L12.98 5.92L15.03 6.43L15.03 9.57L12.99 10.05L14.08 11.86L11.86 14.08L10.08 12.98L9.57 15.03L6.43 15.03L5.95 12.99L4.14 14.08L1.92 11.86L3.02 10.08L0.97 9.57L0.97 6.43L3.01 5.95L1.92 4.14L4.14 1.92Z" />
      <circle cx="8" cy="8" r="2.2" />
    </svg>
  )
}

/**
 * Pied de page. Un carnet de référence dit d'où il tient ce qu'il avance, et
 * le judo a sa devise : les deux principes que Jigoro Kano a donnés à sa
 * méthode.
 */
function PiedDePage() {
  const liens: { to: Route; label: string }[] = [
    { to: { name: 'home' }, label: 'Carnet' },
    { to: { name: 'browse' }, label: 'Les 104 techniques' },
    { to: { name: 'train' }, label: 'Dojo' },
    { to: { name: 'ceintures' }, label: 'Les ceintures' },
    { to: { name: 'dan', dan: 1 }, label: 'Ceinture noire' },
    { to: { name: 'lexique' }, label: 'Lexique du judo' },
    { to: { name: 'profil' }, label: 'Mon judo' },
    { to: { name: 'aPropos' }, label: 'À propos' },
    { to: { name: 'reglages' }, label: 'Réglages et sauvegarde' },
  ]
  return (
    <footer className="pied-de-page non-imprime mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-14 sm:px-7 md:grid-cols-2 lg:grid-cols-[1.1fr_1.3fr_0.8fr]">
        <div className="min-w-0">
          <Signature className="text-[1.9rem]" />
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-soft">
            Le carnet du judoka : les techniques du judo, leur décomposition, et la mémoire de ce que tu travailles.
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-faint">
            Ta progression reste sur ton appareil. Rien n'est envoyé nulle part.
          </p>
        </div>

        <div className="grid min-w-0 content-start gap-8 sm:grid-cols-2">
          {[
            { jp: '精力善用', romaji: "Seiryoku zen'yō", sens: "Le meilleur emploi de l'énergie" },
            { jp: '自他共栄', romaji: 'Jita kyōei', sens: 'Entraide et prospérité mutuelle' },
          ].map((m) => (
            <figure key={m.jp} className="min-w-0">
              <p lang="ja" className="font-jp text-[1.9rem] font-bold leading-none tracking-[0.04em] text-ink">
                {m.jp}
              </p>
              <figcaption className="mt-3">
                <span className="block text-[14px] font-medium italic text-soft">{m.romaji}</span>
                <span className="block text-[13px] text-faint">{m.sens}</span>
              </figcaption>
            </figure>
          ))}
          <p className="text-[13px] leading-relaxed text-faint sm:col-span-2">
            Les deux principes du judo selon Jigoro Kano, qui fonda le Kodokan en 1882.
          </p>
        </div>

        <nav aria-label="Plan du carnet" className="min-w-0 md:col-span-2 lg:col-span-1">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
            {liens.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="tap inline-flex items-center py-1.5 text-[14px] text-soft underline-offset-4 hover:text-ink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-rule">
        <p className="mx-auto flex max-w-[1200px] flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-5 text-[13px] text-faint sm:px-7">
          <span>
            <span lang="ja" className="font-jp text-ink">柔道</span> · la voie de la souplesse
          </span>
          <span className="sm:ml-auto">
            Programme :{' '}
            <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className="inline-block py-1.5 underline decoration-rule underline-offset-2 hover:text-ink hover:decoration-ink">
              progression française, France Judo
            </a>{' '}
            · Démonstrations : Kodokan et France Judo
          </span>
        </p>
      </div>
    </footer>
  )
}

function Loupe() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" strokeLinecap="round" />
    </svg>
  )
}

export function AppShell({ route, annonce, onSearch, children }: Props) {
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
    (r.name === 'train' && route.name === 'dan') ||
    (r.name === 'profil' && route.name === 'carteJudo')

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-blue focus:px-3 focus:py-2 focus:text-field">
        Aller au contenu
      </a>

      {/* Bandeau d'en-tête */}
      {/* Le flou est porté par un calque et non par le bandeau lui-même : un
          `backdrop-filter` fait de son élément le bloc conteneur de tout ce
          qu'il contient, et la barre d'onglets, pourtant fixée au bas de la
          fenêtre, se serait accrochée au bas de l'en-tête. */}
      <header className="entete-site non-imprime safe-t sticky top-0 z-30 border-b border-rule">
        <span aria-hidden className="absolute inset-0 -z-10 bg-field/95 backdrop-blur" />
        <div className="mx-auto flex h-14 max-w-[1200px] items-stretch pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-[max(1.75rem,env(safe-area-inset-left))] sm:pr-[max(1.75rem,env(safe-area-inset-right))]">
          <Link to={{ name: 'home' }} className="tap group flex shrink-0 items-center gap-2.5 pr-2 sm:pr-4" aria-label="Accueil Judodex">
            <Signature
              className="text-[1.45rem]"
              texteClassName="sm:hidden lg:inline"
              marqueClassName="transition-transform duration-300 group-hover:-rotate-6"
            />
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
            className="rail-nav safe-b fixed inset-x-0 bottom-0 z-30 flex min-w-0 border-t border-rule bg-field/95 backdrop-blur sm:static sm:z-auto sm:items-stretch sm:overflow-x-auto sm:border-0 sm:bg-transparent sm:pb-0 sm:backdrop-blur-none"
            aria-label="Navigation principale"
          >
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.route}
                aria-current={isActive(n.route) ? 'page' : undefined}
                className={`tap group relative flex flex-1 items-center justify-center py-3 transition sm:flex-none sm:shrink-0 sm:px-4 sm:py-0 ${isActive(n.route) ? 'text-ink' : 'text-faint hover:text-ink'}`}
              >
                <span className="text-[13px] font-medium sm:text-[14px]">{n.label}</span>
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

            <button onClick={onSearch} className="tap flex h-8 min-w-8 items-center justify-center gap-2 border border-edge px-2 text-[13px] text-soft transition hover:border-ink hover:text-ink md:w-44 md:justify-start" aria-label="Rechercher">
              <Loupe />
              <span className="hidden md:inline">Chercher</span>
              <kbd className="ml-auto hidden border border-rule px-1.5 font-mono text-[11px] leading-[18px] text-faint md:inline">/</kbd>
            </button>

            {/* Le menu ⋯ n'abritait que « Mon judo », qui est un onglet à
                lui seul, et « Réglages ». Il repliait donc un doublon sur un
                unique lien : autant ouvrir celui-ci directement. */}
            <Link
              to={{ name: 'reglages' }}
              aria-current={route.name === 'reglages' ? 'page' : undefined}
              aria-label="Réglages"
              title="Réglages"
              className={`tap grid size-8 place-items-center border transition ${route.name === 'reglages' ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'}`}
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
      <main id="main" className="relative isolate pb-[56px] sm:pb-0">
        {/* Le sol du dojo, sous le haut de chaque page. */}
        <div aria-hidden className="tatami pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] sm:h-[620px]" />
        <div className="safe-x safe-b">{children}</div>
        <PiedDePage />
      </main>

    </div>
  )
}
