import { useEffect } from 'react'
import { m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import type { Route } from '../hooks/useRoute'
import { FAMILY_META, GROUP_META, familyVars, kanjiSize } from '../lib/families'
import { DemoPlayer } from '../components/DemoPlayer'
import { Seal } from '../components/Seal'
import { Link } from '../components/Link'
import { BeltMark } from '../components/BeltMark'
import { beltOf } from '../lib/belts'
import { CEINTURES } from '../hooks/useRoute'
import { Faq } from '../components/PageSeo'
import { questionsTechnique } from '../lib/faq'
import { termeParId } from '../lib/lexique'
import type { Mastery, Technique } from '../types/judodex'

/**
 * Corps du nom japonais posé en colonne, comme sur un rouleau : plus le nom
 * compte d'idéogrammes, plus le corps baisse pour que la colonne ne dépasse
 * pas l'en-tête.
 */
function columnSize(kanji: string): string {
  const n = [...kanji].length
  return ['4.2rem', '4.2rem', '3.6rem', '3rem', '2.6rem'][Math.min(Math.max(n, 1), 5) - 1]
}

const COLONNES: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' }

interface Props {
  slug: string
  dex: Judodex
  onNavigate: (r: Route) => void
}

const MASTERY: { value: Mastery; label: string }[] = [
  { value: 'unknown', label: 'À découvrir' },
  { value: 'learning', label: 'En cours' },
  { value: 'mastered', label: 'Acquise' },
]

export function TechniqueScreen({ slug, dex, onNavigate }: Props) {
  const t = dex.bySlug.get(slug)
  const { prev, next } = dex.neighbours(slug)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft' && prev) onNavigate({ name: 'technique', slug: prev.slug })
      if (e.key === 'ArrowRight' && next) onNavigate({ name: 'technique', slug: next.slug })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onNavigate])

  if (!t) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-28 text-center sm:px-7">
        <p lang="ja" className="font-jp text-6xl text-edge" aria-hidden>無</p>
        <h1 className="font-jp mt-5 text-[1.6rem] font-bold">Cette technique ne figure pas au catalogue.</h1>
        <p className="mt-2 text-[15px] text-soft">Le nom a peut-être changé, ou l'adresse a été mal recopiée.</p>
        <Link to={{ name: 'browse' }} className="tap mt-6 inline-flex items-center border border-edge px-4 py-2 text-[14px] font-medium hover:border-ink">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  const p = dex.getProgress(t.slug)
  const meta = FAMILY_META[t.family]
  const group = GROUP_META[meta.group]
  const enchainements = dex.linksOf(t).filter((l) => l.type === 'enchainement')
  const contres = dex.linksOf(t).filter((l) => l.type === 'contre')
  const voisines = dex.sameFamilyAs(t)
  const keyPoints = t.keyPoints ?? []
  const beltId = dex.beltOfTechnique(t.slug)
  const belt = beltId ? beltOf(beltId) : null
  // Deux sections au sol, trois debout : la grille suit le nombre de colonnes
  // pleines, au lieu de laisser un tiers vide à droite.
  const sections = [keyPoints.length, enchainements.length, contres.length].filter((n) => n > 0).length

  return (
    <article className="mx-auto max-w-[1200px] px-4 sm:px-7" style={familyVars(t.family)}>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-2 pt-3 text-[13px] text-faint">
        <Link to={{ name: 'browse' }} className="tap inline-flex items-center py-2 hover:text-ink">
          Techniques
        </Link>
        <span aria-hidden>›</span>
        <Link to={{ name: 'famille', group: meta.group }} className="tap inline-flex items-center py-2 hover:text-ink">
          {group.name}
        </Link>
        <span aria-hidden>›</span>
        <span>{meta.label}</span>
      </nav>

      {/* ── En-tête ──
          Le nom japonais se lit en colonne, comme sur un rouleau, et le cachet
          se pose à son pied. La démonstration monte dans l'en-tête : c'est
          elle, plus que tout dessin, qui montre la technique.

          Sur téléphone, l'ordre du document fait l'ordre de lecture : le nom,
          la vidéo, puis le texte et les réglages. Sur grand écran, la vidéo
          prend la troisième colonne sur toute la hauteur. */}
      <header className="grid min-w-0 gap-x-10 gap-y-6 pb-14 pt-6 sm:pt-10 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr]">
        <div className="flex items-center gap-4 lg:row-span-2 lg:flex-col lg:items-center lg:pt-1">
          <span
            lang="ja"
            className="font-jp trace whitespace-nowrap text-[2.2rem] font-bold leading-none text-(--fam) lg:text-[length:var(--col)] lg:[writing-mode:vertical-rl]"
            style={{ '--col': columnSize(t.kanji) } as React.CSSProperties}
          >
            {t.kanji}
          </span>
          {p.mastery === 'mastered' && <Seal size={30} animate />}
        </div>

        <div className="monte min-w-0 lg:col-start-2 lg:row-start-1" style={{ '--d': '80ms' } as React.CSSProperties}>
          <h1 className="font-jp text-[clamp(2.4rem,9vw,3.3rem)] font-extrabold leading-[1.05] tracking-[-0.01em] [overflow-wrap:break-word]">
            {t.name}
          </h1>
          <p className="mt-2 text-[18px] text-soft">{t.translation}</p>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[14px] text-faint">
            <span className="flex items-center gap-2">
              <BeltMark belt={beltId} width={26} height={8} />
              {belt && beltId && CEINTURES.includes(beltId) ? (
                <Link to={{ name: 'ceinture', belt: beltId }} className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
                  Ceinture {belt.name.toLowerCase()}, {belt.kyu}
                </Link>
              ) : belt ? (
                `Ceinture ${belt.name.toLowerCase()}, ${belt.kyu}`
              ) : (
                'Hors progression française'
              )}
            </span>
            {/* Le point séparateur ne doit jamais ouvrir une ligne : sur
                téléphone, la famille et le niveau passent ensemble dessous. */}
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="whitespace-nowrap">
              {meta.short} · {t.level}
            </span>
          </p>
        </div>

        <div className="monte min-w-0 lg:col-start-3 lg:row-span-2 lg:row-start-1" style={{ '--d': '180ms' } as React.CSSProperties}>
          <DemoPlayer
            technique={t}
            fallback={
              <span lang="ja" className="font-jp whitespace-nowrap text-(--fam)" style={{ fontSize: kanjiSize(t.kanji, 'hero') }}>
                {t.kanji}
              </span>
            }
          />
        </div>

        <div className="monte min-w-0 lg:col-start-2 lg:row-start-2" style={{ '--d': '260ms' } as React.CSSProperties}>
          <p className="max-w-[60ch] text-[16px] leading-[1.7] text-soft">{t.intro}</p>

          {/* Où l'on note ce que l'on sait */}
          <div className="mt-7">
            <p id="ou-jen-suis" className="mb-2 text-[13px] text-faint">Où j'en suis</p>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-labelledby="ou-jen-suis" className="flex border border-edge">
                {MASTERY.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => dex.setMastery(t.slug, m.value)}
                    aria-pressed={p.mastery === m.value}
                    className={`tap px-3.5 py-2 text-[14px] font-medium transition ${
                      p.mastery === m.value ? 'bg-ink text-field' : 'text-soft hover:text-ink'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => dex.toggleTokui(t.slug)}
                aria-pressed={p.tokui}
                title="Tokui-waza : la technique dont tu fais ton arme"
                className={`tap border px-3.5 py-2 text-[14px] font-medium transition ${
                  p.tokui ? 'border-signal bg-signal text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
                }`}
              >
                Tokui-waza
              </button>
            </div>
            {p.due && p.mastery !== 'unknown' && (
              <p className="mt-3 text-[13px] text-faint">
                Prochaine révision le {new Date(p.due).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ── Décomposition ──
          Le sol ne se découpe pas en kuzushi, tsukuri et kake : la section
          disparaît, et les points clés disent sur quoi porte l'étude. */}
      {t.phases.length > 0 && (
        <section className="border-t border-rule py-12">
          <Titre>Décomposition</Titre>
          <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
            {t.phases.map((ph, i) => (
              <fm.li
                key={ph.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * i }}
                className="min-w-0"
              >
                {/* Les trois temps s'enchaînent : un fil les relie. */}
                <div aria-hidden className="mb-5 flex items-center gap-3">
                  <span className="size-2 shrink-0 bg-(--fam)" />
                  <span className="text-[13px] tabular-nums text-faint">Temps {i + 1}</span>
                  <span className="h-px flex-1 bg-rule" />
                </div>
                <span lang="ja" aria-hidden className="font-jp block text-[2.6rem] font-bold leading-none text-(--fam)">
                  {ph.kanji}
                </span>
                <h3 className="font-jp mt-4 text-[1.3rem] font-bold leading-tight">
                  {termeParId(ph.label.toLowerCase()) ? (
                    <Link to={{ name: 'lexique' }} hash={ph.label.toLowerCase()} title={`Que veut dire « ${ph.label} » ?`} className="underline decoration-rule decoration-dotted underline-offset-[6px] transition-colors hover:decoration-ink">
                      {ph.label}
                    </Link>
                  ) : (
                    ph.label
                  )}
                </h3>
                <p className="mt-0.5 text-[13px] text-faint">{ph.meaning}</p>
                <p className="mt-3 text-[15px] leading-[1.7] text-soft">{ph.description}</p>
              </fm.li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Ce qu'il faut retenir, et où la technique mène ── */}
      {(keyPoints.length > 0 || enchainements.length > 0 || contres.length > 0) && (
        <div className={`grid gap-x-12 gap-y-12 border-t border-rule py-12 ${COLONNES[sections]}`}>
          {keyPoints.length > 0 && (
            <section className="min-w-0">
              <Titre aside={t.phases.length > 0 ? undefined : 'Au sol, le travail porte sur le contrôle et le poids'}>Points clés</Titre>
              <ol className="space-y-3.5">
                {keyPoints.map((k, i) => (
                  <li key={k} className="flex gap-3 text-[15px] leading-relaxed text-soft">
                    <span className="w-4 shrink-0 text-right tabular-nums text-(--fam)">{i + 1}</span>
                    {k}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {enchainements.length > 0 && (
            <section className="min-w-0">
              <Titre aside="Si uke réagit…">Enchaînements</Titre>
              {enchainements.map((l) => (
                <LinkRow key={l.technique.slug} t={l.technique} context={l.context} />
              ))}
            </section>
          )}

          {contres.length > 0 && (
            <section className="min-w-0">
              <Titre aside="Ce qu'uke peut opposer">Contres</Titre>
              {contres.map((l) => (
                <LinkRow key={l.technique.slug} t={l.technique} context={l.context} />
              ))}
            </section>
          )}
        </div>
      )}

      {voisines.length > 0 && (
        <section className="border-t border-rule py-12">
          <Titre aside={group.principle}>Dans la même famille</Titre>
          <div className="flex flex-wrap gap-2">
            {voisines.map((v) => (
              <Link
                key={v.slug}
                to={{ name: 'technique', slug: v.slug }}
                style={familyVars(v.family)}
                className="tap flex items-center gap-2 bg-plate/60 px-3.5 py-2 text-[14px] font-medium transition-colors hover:bg-plate"
              >
                <span lang="ja" className="font-jp whitespace-nowrap leading-none text-(--fam)">{v.kanji}</span>
                {v.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Faq titre={`Questions sur ${t.name}`} questions={questionsTechnique(t, (slug) => dex.bySlug.get(slug)?.name ?? slug)} />

      <nav aria-label="Techniques voisines" className="grid border-t border-rule sm:grid-cols-2">
        {prev && <NavCard t={prev} dir="prev" />}
        {next && <NavCard t={next} dir="next" />}
      </nav>
    </article>
  )
}

/** Titre de section : le nom, et au besoin une ligne qui dit à quoi il sert. */
function Titre({ children, aside }: { children: React.ReactNode; aside?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-jp text-[1.6rem] font-bold leading-tight">{children}</h2>
      {aside && <p className="mt-1 text-[13px] text-faint">{aside}</p>}
    </div>
  )
}

/** Ligne d'un lien : la technique visée, et la situation qui l'ouvre. */
function LinkRow({ t, context }: { t: Technique; context: string }) {
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="group flex min-w-0 items-start gap-4 border-t border-rule py-3.5 last:border-b"
    >
      <span
        lang="ja"
        className="font-jp mt-0.5 w-[4.2rem] shrink-0 whitespace-nowrap leading-none text-(--fam)"
        style={{ fontSize: kanjiSize(t.kanji, 'row') }}
      >
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-snug underline-offset-4 group-hover:underline">{t.name}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-faint">{context}</span>
      </span>
      <span aria-hidden className="vector-push mt-0.5 text-faint group-hover:text-ink">→</span>
    </Link>
  )
}

function NavCard({ t, dir }: { t: Technique; dir: 'prev' | 'next' }) {
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      className={`group py-7 ${dir === 'next' ? 'border-t border-rule first:border-t-0 sm:col-start-2 sm:border-l sm:border-t-0 sm:pl-8 sm:text-right' : 'sm:pr-8'}`}
    >
      <span className="block text-[13px] text-faint">{dir === 'prev' ? '← Technique précédente' : 'Technique suivante →'}</span>
      <span className="font-jp mt-2 block text-[1.4rem] font-bold leading-tight underline-offset-4 group-hover:underline">{t.name}</span>
      <span className="mt-1 block text-[13px] text-faint">{t.translation}</span>
    </Link>
  )
}
