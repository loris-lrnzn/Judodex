import { useEffect } from 'react'
import { m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import type { Route } from '../hooks/useRoute'
import { FAMILY_META, GROUP_META, familyVars, kanjiSize } from '../lib/families'
import { DemoPlayer } from '../components/DemoPlayer'
import { Seal } from '../components/Seal'
import { Link } from '../components/Link'
import { SectionHead } from '../components/SectionHead'
import { BeltMark } from '../components/BeltMark'
import { beltOf } from '../lib/belts'
import type { Mastery, Technique } from '../types/judodex'

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
        <p className="font-jp text-6xl text-edge" aria-hidden>無</p>
        <h1 className="mt-5 text-[19px] font-semibold">Cette technique ne figure pas au catalogue.</h1>
        <p className="mt-2 text-sm text-soft">Le nom a peut-être changé, ou l'adresse a été mal recopiée.</p>
        <Link to={{ name: 'browse' }} className="tap annot mt-5 inline-flex items-center border border-ink px-3 py-2 hover:bg-ink hover:text-field">
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
  const hasKeyPoints = keyPoints.length > 0
  const beltId = dex.beltOfTechnique(t.slug)
  const belt = beltId ? beltOf(beltId) : null
  const number = dex.numberOf.get(t.slug) ?? 0

  return (
    <article className="mx-auto max-w-[1200px] px-4 sm:px-7" style={familyVars(t.family)}>
      <nav className="annot flex items-center gap-2.5 py-2 text-faint">
        <Link to={{ name: 'browse' }} className="tap -my-1 inline-flex items-center py-3 hover:text-ink">
          Techniques
        </Link>
        <span>/</span>
        <span className="text-(--fam)">{group.name}</span>
        <span>/</span>
        <span>{meta.label}</span>
      </nav>

      {/* ── Planche de la technique ── */}
      <header className="plate grid-paper grid min-w-0 gap-8 p-5 sm:p-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="annot border border-ink px-1.5 py-1 leading-none">Fiche n° {String(number).padStart(3, '0')}</span>
            <span className="annot text-faint">{meta.label}</span>
            <span className="annot flex items-center gap-2 text-faint">
              <BeltMark belt={beltId} width={30} height={9} />
              {belt ? `Passage ceinture ${belt.name.toLowerCase()} · ${belt.kyu}` : 'Hors progression française'}
            </span>
          </div>

          <h1 className="display mt-5">{t.name}</h1>
          <p className="mt-2 text-lg text-soft">{t.translation}</p>

          <div className="mt-5 flex items-center gap-3">
            <span className="dimension w-24" />
            <span className="annot text-faint">
              {group.principle} · Difficulté {t.level.toLowerCase()}
            </span>
          </div>

          <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-soft">{t.intro}</p>

          {/* Où l'on note ce que l'on sait */}
          <div className="mt-7 flex flex-wrap items-stretch gap-2">
            <div className="flex items-stretch">
              {MASTERY.map((m) => (
                <button
                  key={m.value}
                  onClick={() => dex.setMastery(t.slug, m.value)}
                  aria-pressed={p.mastery === m.value}
                  className={`tap annot -ml-px inline-flex items-center border px-3 py-2.5 transition first:ml-0 ${
                    p.mastery === m.value ? 'z-10 border-ink bg-ink text-field' : 'border-ink hover:bg-ink hover:text-field'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => dex.toggleTokui(t.slug)}
              aria-pressed={p.tokui}
              title="Tokui-waza : la technique dont vous faites votre arme"
              className={`tap annot inline-flex items-center border px-3 py-2.5 transition ${p.tokui ? 'border-signal bg-signal text-field' : 'border-ink hover:bg-ink hover:text-field'}`}
            >
              Tokui-waza
            </button>
            {p.due && p.mastery !== 'unknown' && (
              <span className="annot flex items-center text-faint">
                Revue le {new Date(p.due).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Spécimen et notation */}
        <fm.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="relative flex flex-col items-center gap-3">
          <span
            className="font-jp block whitespace-nowrap leading-[0.9] text-(--fam)"
            style={{ fontSize: `clamp(2.6rem, 16vw, ${kanjiSize(t.kanji, 'hero')})` }}
          >
            {t.kanji}
          </span>
          {/* Le cachet se pose sous le spécimen : sur le glyphe, il le rendait illisible. */}
          <span className="flex items-center gap-3">
            {p.mastery === 'mastered' && <Seal size={34} animate />}
            <span className="annot text-faint">{meta.kanji} · {t.family}</span>
          </span>
        </fm.div>
      </header>

      {/* ── Corps ── */}
      {/* Sans décomposition, la colonne de droite serait presque vide :
          les points clés y passent au lieu de rester sous la démonstration. */}
      <div className={`grid gap-11 py-12 ${t.phases.length > 0 ? 'lg:grid-cols-[1.05fr_1fr]' : 'lg:grid-cols-2'}`}>
        <div className="min-w-0">
          <SectionHead title="Démonstration" jp="実演" />
          <DemoPlayer
            technique={t}
            fallback={
              <div className="grid-fine font-jp grid size-full place-items-center whitespace-nowrap text-(--fam)" style={{ fontSize: kanjiSize(t.kanji, 'hero') }}>
                {t.kanji}
              </div>
            }
          />
          {t.phases.length > 0 && hasKeyPoints && (
            <section className="mt-11">
              <SectionHead title="Points clés" jp="要点" />
              <ul className="border-t border-rule">
                {keyPoints.map((k, i) => (
                  <li key={k} className="flex gap-4 border-b border-rule py-3 text-[14px] leading-relaxed text-soft">
                    <span className="annot w-6 shrink-0 text-right text-(--fam)">{String(i + 1).padStart(2, '0')}</span>
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="min-w-0">
          {t.phases.length > 0 ? (
            <section>
              <SectionHead title="Décomposition" jp="分解" />
              <ol>
                {t.phases.map((ph, i) => (
                  <fm.li
                    key={ph.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.07 * i }}
                    className="relative border-b border-rule py-5 pl-16 last:border-0"
                  >
                    {/* Repère de phase */}
                    <span className="absolute left-0 top-5 flex flex-col items-center">
                      <span className="font-jp tilt text-3xl font-bold leading-none text-(--fam)">{ph.kanji}</span>
                      <span className="annot mt-2 text-faint">{String(i + 1).padStart(2, '0')}</span>
                    </span>
                    <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{ph.label}</h3>
                    <p className="annot mt-0.5 text-faint">{ph.meaning}</p>
                    <p className="mt-2.5 text-[14px] leading-[1.7] text-soft">{ph.description}</p>
                  </fm.li>
                ))}
              </ol>
            </section>
          ) : (
            <section>
              <SectionHead title="Étude" jp="研究" />
              <p className="text-[14px] leading-[1.7] text-soft">
                Les techniques de {group.name.toLowerCase()} ne se décomposent pas en kuzushi, tsukuri et kake. Leur étude porte sur le
                contrôle, la répartition du poids et la progression vers la soumission. Reportez-vous aux points de contrôle et à la
                démonstration.
              </p>
            </section>
          )}
          {t.phases.length === 0 && hasKeyPoints && (
            <section className="mt-11">
              <SectionHead title="Points clés" jp="要点" />
              <ul className="border-t border-rule">
                {keyPoints.map((k, i) => (
                  <li key={k} className="flex gap-4 border-b border-rule py-3 text-[14px] leading-relaxed text-soft">
                    <span className="annot w-6 shrink-0 text-right text-(--fam)">{String(i + 1).padStart(2, '0')}</span>
                    {k}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Les liens occupent toute la largeur : trois colonnes plutôt qu'une
          pile qui laisse la colonne voisine vide. */}
      <div className="grid gap-x-12 gap-y-10 border-t border-rule pt-11 lg:grid-cols-3">
        {enchainements.length > 0 && (
          <section className="min-w-0">
            <SectionHead title="Enchaînements" jp="連絡技" aside={`${enchainements.length}`} />
            <div className="border-t border-rule">
            {enchainements.map((l) => (
              <LinkRow key={l.technique.slug} t={l.technique} n={dex.numberOf.get(l.technique.slug) ?? 0} context={l.context} />
            ))}
            </div>
          </section>
          )}

        {contres.length > 0 && (
          <section className="min-w-0">
            <SectionHead title="Contres" jp="返技" aside={`${contres.length}`} />
            <div className="border-t border-rule">
            {contres.map((l) => (
              <LinkRow key={l.technique.slug} t={l.technique} n={dex.numberOf.get(l.technique.slug) ?? 0} context={l.context} />
            ))}
            </div>
          </section>
          )}

        {voisines.length > 0 && (
          <section className="min-w-0">
            <SectionHead title="Dans la même famille" jp="同系" aside={`${voisines.length}`} />
            <div className="flex flex-wrap gap-1.5">
            {voisines.map((v) => (
              <Link
              key={v.slug}
              to={{ name: 'technique', slug: v.slug }}
              style={familyVars(v.family)}
              className="tap group flex items-center gap-2 border border-edge px-2.5 py-1.5 transition-colors hover:border-ink hover:bg-ink hover:text-field"
              >
              <span className="font-jp whitespace-nowrap text-[15px] leading-none text-(--fam) transition-colors group-hover:text-(--fam-hi)">
              {v.kanji}
              </span>
              <span className="text-[12px] font-medium">{v.name}</span>
              </Link>
            ))}
            </div>
          </section>
          )}
      </div>

      <nav className="mt-14 grid border-t border-ink sm:grid-cols-2">
        {prev && <NavCard t={prev} n={dex.numberOf.get(prev.slug) ?? 0} dir="prev" />}
        {next && <NavCard t={next} n={dex.numberOf.get(next.slug) ?? 0} dir="next" />}
      </nav>
    </article>
  )
}

/** Ligne d'un lien : la technique visée, et la situation qui l'ouvre. */
function LinkRow({ t, n, context }: { t: Technique; n: number; context: string }) {
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="group -mx-3 flex min-w-0 items-start gap-3 border-b border-rule px-3 py-3 transition-colors hover:bg-ink hover:text-field sm:gap-4"
    >
      <span className="annot mt-1 w-7 shrink-0 text-faint transition-colors group-hover:text-field/55">{String(n).padStart(3, '0')}</span>
      <span
        className="font-jp mt-0.5 w-[4.6rem] shrink-0 whitespace-nowrap text-center leading-none text-(--fam) transition-colors group-hover:text-(--fam-hi)"
        style={{ fontSize: kanjiSize(t.kanji, 'row') }}
      >
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold leading-snug">{t.name}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-faint transition-colors group-hover:text-field/55">{context}</span>
      </span>
      <span className="vector-push mt-1 text-faint transition-colors group-hover:text-field">→</span>
    </Link>
  )
}

function NavCard({ t, n, dir }: { t: Technique; n: number; dir: 'prev' | 'next' }) {
  return (
    <Link to={{ name: 'technique', slug: t.slug }} className={`group px-5 py-6 transition-colors hover:bg-ink hover:text-field ${dir === 'next' ? 'sm:border-l sm:border-rule sm:text-right' : ''}`}>
      <span className="annot block text-faint transition-colors group-hover:text-field/55">{dir === 'prev' ? '← Précédente' : 'Suivante →'}</span>
      <span className="mt-2 block text-[18px] font-semibold tracking-[-0.01em]">{t.name}</span>
      <span className="annot mt-0.5 block text-faint transition-colors group-hover:text-field/55">
        {String(n).padStart(3, '0')} · {t.translation}
      </span>
    </Link>
  )
}
