import { useState } from 'react'
import { AnimatePresence, m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { useBrowseFilters } from '../hooks/useBrowseFilters'
import { FAMILY_META, GROUP_META, kanjiSize } from '../lib/families'
import { BELTS } from '../lib/belts'
import { BeltMark } from '../components/BeltMark'
import { TechniqueCard } from '../components/TechniqueCard'
import { SectionHead } from '../components/SectionHead'
import type { Mastery } from '../types/judodex'

const MASTERY: { value: Mastery; label: string }[] = [
  { value: 'unknown', label: 'À découvrir' },
  { value: 'learning', label: 'En cours' },
  { value: 'mastered', label: 'Acquises' },
]

const toggle = (active: boolean) =>
  `tap annot inline-flex h-7 items-center border px-2.5 transition ${active ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'}`

export function BrowseScreen({ dex }: { dex: Judodex }) {
  const f = useBrowseFilters(dex)
  const [openFilters, setOpenFilters] = useState(false)

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-7">
      {/* Titre de recueil */}
      <header className="flex flex-wrap items-end justify-between gap-5 pb-8 pt-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="annot border border-ink px-1.5 py-1 leading-none">Catalogue complet</span>
          </div>
          <h1 className="display mt-5">Techniques</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="dimension w-20" />
            <span className="annot text-faint">
              {f.count === dex.techniques.length ? `${dex.techniques.length} fiches` : `${f.count} fiches sur ${dex.techniques.length}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-stretch">
          {([
            ['family', 'Par famille'],
            ['belt', 'Par ceinture'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => f.setGroupBy(mode)}
              aria-pressed={f.groupBy === mode}
              className={`tap annot -ml-px inline-flex items-center border px-3 py-2 transition first:ml-0 ${
                f.groupBy === mode ? 'z-10 border-ink bg-ink text-field' : 'border-ink hover:bg-ink hover:text-field'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpenFilters((o) => !o)}
          className={`tap annot flex h-8 shrink-0 items-center gap-2 border px-3 transition ${
            openFilters || f.active ? 'border-ink bg-ink text-field' : 'border-ink hover:bg-ink hover:text-field'
          }`}
          aria-expanded={openFilters}
        >
          Filtrer
          {f.active > 0 && <span className="grid size-4 place-items-center bg-signal text-field">{f.active}</span>}
        </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {openFilters && (
          <fm.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-ink py-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="annot mr-1 text-faint">Ceinture</span>
                {BELTS.map((b) => (
                  <button key={b.id} onClick={() => f.setBelt(b.id)} className={`${toggle(f.filters.belt === b.id)} inline-flex items-center gap-1.5`}>
                    <BeltMark belt={b.id} width={16} height={6} />
                    {b.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="annot mr-1 text-faint">État</span>
                {MASTERY.map((m) => (
                  <button key={m.value} onClick={() => f.setMastery(m.value)} className={toggle(f.filters.mastery === m.value)}>
                    {m.label}
                  </button>
                ))}
                <button onClick={f.toggleTokui} title="Vos techniques de prédilection" className={toggle(f.filters.tokuiOnly)}>
                  Tokui-waza
                </button>
              </div>
              {f.active > 0 && (
                <button onClick={f.clear} className="tap annot ml-auto inline-flex items-center text-signal hover:underline">
                  Réinitialiser
                </button>
              )}
            </div>
          </fm.div>
        )}
      </AnimatePresence>

      {f.count === 0 ? (
        <div className="plate my-10 grid-paper py-28 text-center">
          <p className="font-jp text-6xl text-rule">無</p>
          <p className="mt-5 text-sm text-soft">Aucune technique ne correspond à ces filtres.</p>
          <button onClick={f.clear} className="annot mt-5 border border-ink px-3 py-2 hover:bg-ink hover:text-field">
            Réinitialiser
          </button>
        </div>
      ) : f.groupBy === 'belt' ? (
        <>
          {f.beltSections.map((section) => (
            <section key={section.belt.id} className="py-10">
              <div className="mb-6 flex items-start gap-5 border-b border-ink pb-5">
                <span className="mt-1 shrink-0">
                  <BeltMark belt={section.belt.id} width={64} height={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="annot shrink-0 border border-ink px-1.5 py-1 leading-none">{section.belt.kyu}</span>
                    <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{section.belt.plate}</h2>
                  </div>
                  <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-soft">{section.belt.focus}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-mono text-2xl font-semibold leading-none">{section.mastered}</div>
                  <div className="annot mt-1 text-faint">/ {section.techniques.length}</div>
                </div>
              </div>
              <Grid dex={dex} list={section.techniques} />
            </section>
          ))}

          {f.offSection.length > 0 && (
            <section className="py-10">
              <div className="mb-6 flex items-start gap-5 border-b border-ink pb-5">
                <span className="mt-1 h-4 w-16 shrink-0 border-t border-dashed border-rule" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Répertoire complémentaire</h2>
                  <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-soft">
                    Techniques du catalogue qui ne figurent sur aucune planche de passage de grade.
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-mono text-2xl font-semibold leading-none">{f.offSection.length}</div>
                  <div className="annot mt-1 text-faint">fiches</div>
                </div>
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
            <section key={section.group} className="py-10" style={{ '--fam': meta.color, '--fam-hi': meta.colorHi } as React.CSSProperties}>
              {/* Cartouche de famille */}
              <div className="mb-6 flex items-start gap-5 border-b border-ink pb-5">
                <span className="font-jp shrink-0 whitespace-nowrap leading-none text-(--fam)" style={{ fontSize: kanjiSize(meta.kanji, 'family') }}>
                  {meta.kanji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{meta.name}</h2>
                    <span className="font-jp text-[14px] text-faint">{meta.jp}</span>
                  </div>
                  <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-soft">{meta.principle}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-mono text-2xl font-semibold leading-none">{done}</div>
                  <div className="annot mt-1 text-faint">/ {section.techniques.length}</div>
                </div>
              </div>

              {section.subs.length > 0 ? (
                section.subs
                  .map((sub) => ({ ...sub, techniques: sub.techniques.filter((t) => section.techniques.includes(t)) }))
                  .filter((sub) => sub.techniques.length > 0)
                  .map((sub) => (
                    <div key={sub.family} className="mb-8 last:mb-0">
                      <SectionHead
                        title={FAMILY_META[sub.family].label}
                        jp={FAMILY_META[sub.family].kanji}
                        aside={`${sub.techniques.length}`}
                      />
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
 * reste rectangulaire, comme sur une planche imprimée.
 */
function Grid({ dex, list }: { dex: Judodex; list: Judodex['techniques'] }) {
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
      {Array.from({ length: (5 - (list.length % 5)) % 5 }, (_, i) => (
        <div
          key={`vide-${i}`}
          aria-hidden
          className={`grid-fine hidden border-b border-r border-rule opacity-40 lg:block ${i >= (3 - (list.length % 3)) % 3 ? '' : ''}`}
        />
      ))}
    </div>
  )
}
