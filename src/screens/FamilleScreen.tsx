import type { Judodex } from '../hooks/useJudodex'
import { FAMILLES } from '../hooks/useRoute'
import { FAMILY_META, GROUP_META, familyVars, subFamilies } from '../lib/families'
import { FAMILLE_TEXTE } from '../lib/contenuSeo'
import { questionsFamille } from '../lib/faq'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { Faq, Fil, LigneTechnique } from '../components/PageSeo'
import { beltOf } from '../lib/belts'
import type { FamilyGroup } from '../types/judodex'

/** Une famille de techniques : ce qu'elle est, puis la liste complète, rangée par sous-famille. */
export function FamilleScreen({ group, dex }: { group: FamilyGroup; dex: Judodex }) {
  const meta = GROUP_META[group]
  const texte = FAMILLE_TEXTE[group]
  const subs = subFamilies(group)
  const toutes = dex.techniques.filter((t) => FAMILY_META[t.family].group === group)
  const autres = FAMILLES.filter((g) => g !== group)

  return (
    <article className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-7" style={{ '--fam': meta.color, '--fam-hi': meta.colorHi } as React.CSSProperties}>
      <Fil elements={[{ label: 'Techniques', to: { name: 'browse' } }, { label: meta.name }]} />

      <header className="grid gap-x-10 gap-y-6 pb-12 pt-6 sm:pt-12 lg:grid-cols-[auto_minmax(0,1fr)]">
        <span lang="ja" aria-hidden className="font-jp kanji-creux hidden select-none self-start text-[9rem] font-extrabold leading-[0.95] lg:block">
          {meta.kanji}
        </span>
        <div className="min-w-0">
          <Surtitre className="monte">
            Famille de techniques · {toutes.length} fiches
          </Surtitre>
          <h1 className="display monte mt-5 max-w-4xl" style={{ '--d': '80ms' } as React.CSSProperties}>
            {texte.h1}
          </h1>
          <div className="monte mt-6 grid max-w-[62ch] gap-4 text-[16px] leading-[1.7] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
            {texte.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </header>

      {subs.map((f) => {
        const liste = toutes.filter((t) => t.family === f)
        if (liste.length === 0) return null
        return (
          <section key={f} className="border-t border-rule py-10" aria-labelledby={`sf-${f}`}>
            <h2 id={`sf-${f}`} className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-jp text-[1.6rem] font-bold leading-tight">{FAMILY_META[f].label}</span>
              <span lang="ja" className="font-jp text-[1.1rem] text-(--fam)">{FAMILY_META[f].kanji}</span>
              <span className="text-[14px] text-faint">
                {FAMILY_META[f].short} · {liste.length}
              </span>
            </h2>
            <div className="grid gap-x-12 border-b border-rule sm:grid-cols-2">
              {liste.map((t) => {
                const b = dex.beltOfTechnique(t.slug)
                return (
                  <div key={t.slug} style={familyVars(t.family)}>
                    <LigneTechnique t={t} note={b ? beltOf(b).name : undefined} />
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <Faq questions={questionsFamille(group, toutes)} />

      <section className="border-t border-rule py-12">
        <h2 className="font-jp mb-5 text-[1.3rem] font-bold leading-tight">Les autres familles</h2>
        <ul className="flex flex-wrap gap-2">
          {autres.map((g) => (
            <li key={g}>
              <Link
                to={{ name: 'famille', group: g }}
                style={{ '--fam': GROUP_META[g].color } as React.CSSProperties}
                className="tap flex items-center gap-2.5 bg-plate/60 px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-plate"
              >
                <span lang="ja" className="font-jp text-lg leading-none text-(--fam)">{GROUP_META[g].kanji}</span>
                {GROUP_META[g].name}
              </Link>
            </li>
          ))}
          <li>
            <Link to={{ name: 'lexique' }} className="tap flex items-center bg-plate/60 px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-plate">
              Lexique du judo
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
