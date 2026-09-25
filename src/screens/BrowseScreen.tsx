import { useState } from 'react'
import { AnimatePresence, m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { useBrowseFilters } from '../hooks/useBrowseFilters'
import { FAMILY_META, GROUP_META } from '../lib/families'
import { BELTS } from '../lib/belts'
import { BeltMark } from '../components/BeltMark'
import { TechniqueCard } from '../components/TechniqueCard'
import type { Mastery } from '../types/judodex'
import { Surtitre } from '../components/Surtitre'

const MASTERY: { value: Mastery; label: string }[] = [
  { value: 'unknown', label: 'À découvrir' },
  { value: 'learning', label: 'En cours' },
  { value: 'mastered', label: 'Acquises' },
]

const toggle = (active: boolean) =>
  `tap inline-flex h-8 items-center border px-2.5 text-[13px] font-medium transition ${active ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'}`

export function BrowseScreen({ dex }: { dex: Judodex }) {
  const f = useBrowseFilters(dex)
  const [openFilters, setOpenFilters] = useState(false)

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-7">
      {/* Titre de recueil */}
      <header className="flex flex-wrap items-end justify-between gap-5 pb-8 pt-10 sm:pt-20">
        <div>
          <Surtitre className="monte">Le catalogue</Surtitre>
          <h1 className="display monte mt-5" style={{ '--d': '80ms' } as React.CSSProperties}>Techniques</h1>
          <p className="monte mt-3 text-[15px] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
            {f.count === dex.techniques.length ? `${dex.techniques.length} fiches` : `${f.count} fiches sur ${dex.techniques.length}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-stretch border border-edge">
          {([
            ['family', 'Par famille'],
            ['belt', 'Par ceinture'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => f.setGroupBy(mode)}
              aria-pressed={f.groupBy === mode}
              className={`tap inline-flex items-center px-3 py-1.5 text-[14px] font-medium transition ${
                f.groupBy === mode ? 'bg-ink text-field' : 'text-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpenFilters((o) => !o)}
          className={`tap flex h-[34px] shrink-0 items-center gap-2 border px-3 text-[14px] font-medium transition ${
            openFilters || f.active ? 'border-ink text-ink' : 'border-edge text-soft hover:border-ink hover:text-ink'
          }`}
          aria-expanded={openFilters}
        >
          Filtrer
          {f.active > 0 && <span className="grid size-5 place-items-center bg-signal text-[12px] font-semibold text-field">{f.active}</span>}
        </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {openFilters && (
          <fm.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-rule py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[13px] text-faint">Ceinture</span>
                {BELTS.map((b) => (
                  <button key={b.id} onClick={() => f.setBelt(b.id)} className={`${toggle(f.filters.belt === b.id)} inline-flex items-center gap-1.5`}>
                    <BeltMark belt={b.id} width={16} height={6} />
                    {b.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[13px] text-faint">État</span>
                {MASTERY.map((m) => (
                  <button key={m.value} onClick={() => f.setMastery(m.value)} className={toggle(f.filters.mastery === m.value)}>
                    {m.label}
                  </button>
                ))}
                <button onClick={f.toggleTokui} title="Tes techniques de prédilection" className={toggle(f.filters.tokuiOnly)}>
                  Tokui-waza
                </button>
              </div>
              {f.active > 0 && (
                <button onClick={f.clear} className="tap ml-auto inline-flex items-center text-[13px] font-medium text-signal hover:underline">
                  Réinitialiser
                </button>
              )}
            </div>
          </fm.div>
        )}
      </AnimatePresence>

      {f.count === 0 ? (
        <div className="my-10 bg-plate py-24 text-center">
          <p lang="ja" aria-hidden className="font-jp text-6xl text-edge">無</p>
          <p className="mt-5 text-[15px] text-soft">Aucune technique ne correspond à ces filtres.</p>
          <button onClick={f.clear} className="tap mt-5 border border-edge px-4 py-2 text-[14px] font-medium hover:border-ink">
            Réinitialiser
          </button>
        </div>
      ) : f.groupBy === 'belt' ? (
        <>
          {f.beltSections.map((section) => (
            <section key={section.belt.id} id={`ceinture-${section.belt.id}`} className="py-10">
              <div className="mb-6 flex items-start gap-5 border-b border-rule pb-5">
                <span className="mt-1 shrink-0">
                  <BeltMark belt={section.belt.id} width={64} height={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-jp text-[1.6rem] font-bold leading-tight">{section.belt.plate}</h2>
                    <span className="text-[13px] text-faint">{section.belt.kyu}</span>
                  </div>
                  <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-soft">{section.belt.focus}</p>
                </div>
                <p className="hidden shrink-0 pt-2 text-[13px] tabular-nums text-faint sm:block">
                  {section.mastered} acquise{section.mastered > 1 ? 's' : ''} sur {section.techniques.length}
                </p>
              </div>
              <Grid dex={dex} list={section.techniques} />
            </section>
          ))}

          {f.offSection.length > 0 && (
            <section className="py-10">
              <div className="mb-6 flex items-start gap-5 border-b border-rule pb-5">
                <span className="mt-1 h-4 w-16 shrink-0 border-t border-dashed border-rule" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-jp text-[1.6rem] font-bold leading-tight">Répertoire complémentaire</h2>
                  <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-soft">
                    Techniques du catalogue qui ne figurent sur aucune planche de passage de grade.
                  </p>
                </div>
                <p className="hidden shrink-0 pt-2 text-[13px] tabular-nums text-faint sm:block">{f.offSection.length} fiches</p>
              </div>
              <Grid dex={dex} list={f.offSection} />
            </section>
          )}
        </>
      ) : (
        f.familySections.map((section) => {
          const meta = GROUP_META[section.group]
          const done = section.techniques.filter((t) => dex.getProgress(t.slug).mastery === 'mastered').length
          return (
            <section key={section.group} id={section.group} className="py-10" style={{ '--fam': meta.color, '--fam-hi': meta.colorHi } as React.CSSProperties}>
              {/* Cartouche de famille */}
              <div className="mb-6 flex items-start gap-5 border-b border-rule pb-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h2 className="font-jp text-[1.6rem] font-bold leading-tight">{meta.name}</h2>
                    <span lang="ja" className="font-jp text-[1.1rem] text-(--fam)">{meta.jp}</span>
                  </div>
                  <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-soft">{meta.principle}</p>
                </div>
                <p className="hidden shrink-0 pt-2 text-[13px] tabular-nums text-faint sm:block">
                  {done} acquise{done > 1 ? 's' : ''} sur {section.techniques.length}
                </p>
              </div>

              {section.subs.length > 0 ? (
                section.subs
                  .map((sub) => ({ ...sub, techniques: sub.techniques.filter((t) => section.techniques.includes(t)) }))
                  .filter((sub) => sub.techniques.length > 0)
                  .map((sub) => (
                    <div key={sub.family} className="mb-8 last:mb-0">
                      <h3 className="mb-3 flex items-baseline gap-2 text-[15px] font-semibold">
                        {FAMILY_META[sub.family].label}
                        <span className="text-[13px] font-normal text-faint">{FAMILY_META[sub.family].short} · {sub.techniques.length}</span>
                      </h3>
                      <Grid dex={dex} list={sub.techniques} />
                    </div>
                  ))
              ) : (
                <Grid dex={dex} list={section.techniques} />
              )}
            </section>
          )
        })
      )}
    </div>
  )
}

/**
 * Les cellules sont jointives : la grille dessine son propre quadrillage.
 * La dernière rangée est complétée par des cases vides pour que le tableau
 * reste rectangulaire, et cela à chaque largeur : le nombre de colonnes
 * change, le nombre de cases à combler aussi.
 */
const COLONNES = [2, 3, 4, 5] as const
/** Visibilité d'une case vide, pour chacun des quatre paliers de la grille. */
const VISIBLE = [
  ['block', 'hidden'],
  ['sm:block', 'sm:hidden'],
  ['md:block', 'md:hidden'],
  ['lg:block', 'lg:hidden'],
] as const

function Grid({ dex, list }: { dex: Judodex; list: Judodex['techniques'] }) {
  const manque = COLONNES.map((n) => (n - (list.length % n)) % n)
  return (
    <div className="grid grid-cols-2 border-l border-t border-rule sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {list.map((t) => (
        <div key={t.slug} className="border-b border-r border-rule">
          <TechniqueCard
            technique={t}
            number={dex.numberOf.get(t.slug) ?? 0}
            progress={dex.getProgress(t.slug)}
            belt={dex.beltOfTechnique(t.slug)}
          />
        </div>
      ))}
      {Array.from({ length: Math.max(...manque) }, (_, i) => (
        <div
          key={`vide-${i}`}
          aria-hidden
          className={`border-b border-r border-rule ${VISIBLE.map(([oui, non], palier) => (i < manque[palier] ? oui : non)).join(' ')}`}
        />
      ))}
    </div>
  )
}
