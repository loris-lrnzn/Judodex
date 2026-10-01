import { CATEGORIES, TERMES, termeParId, type Terme } from '../lib/lexique'
import { GROUP_META } from '../lib/families'
import { beltOf } from '../lib/belts'
import type { Judodex } from '../hooks/useJudodex'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { Fil } from '../components/PageSeo'

const lienClasse = 'inline-block py-1 text-ink underline decoration-edge underline-offset-4 hover:decoration-ink'

function Voir({ t, dex }: { t: Terme; dex: Judodex }) {
  const termes = (t.voir ?? []).map(termeParId).filter((x): x is Terme => !!x)
  const fiches = (t.techniques ?? []).map((s) => dex.bySlug.get(s)).filter((x) => !!x)
  if (termes.length === 0 && fiches.length === 0 && !t.famille && !t.ceinture) return null
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13.5px] leading-relaxed text-faint">
      <span>Voir :</span>
      {t.famille && (
        <Link to={{ name: 'famille', group: t.famille }} className={lienClasse}>
          famille {GROUP_META[t.famille].name.toLowerCase()}
        </Link>
      )}
      {t.ceinture && (
        <Link to={{ name: 'ceinture', belt: t.ceinture }} className={lienClasse}>
          ceinture {beltOf(t.ceinture).name.toLowerCase()}
        </Link>
      )}
      {fiches.map((f) => (
        <Link key={f!.slug} to={{ name: 'technique', slug: f!.slug }} className={lienClasse}>
          {f!.name}
        </Link>
      ))}
      {termes.map((x) => (
        <Link key={x.id} to={{ name: 'lexique' }} hash={x.id} className={lienClasse}>
          {x.nom}
        </Link>
      ))}
    </p>
  )
}

/** Le vocabulaire du judo : une entrée par mot, chacune avec son adresse. */
export function LexiqueScreen({ dex }: { dex: Judodex }) {
  return (
    <article className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-7">
      <Fil elements={[{ label: 'Lexique du judo' }]} />

      <header className="pb-10 pt-6 sm:pt-12">
        <Surtitre className="monte">{TERMES.length} termes</Surtitre>
        <h1 className="display monte mt-5 max-w-4xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Lexique du judo : le vocabulaire japonais expliqué
        </h1>
        <p className="monte mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
          Kuzushi, uke, ippon, dan : le judo se dit en japonais, et le vocabulaire arrête souvent le débutant. Voici les mots qu'on entend au dojo,
          avec leur écriture, leur sens et ce qu'ils désignent, renvoyés vers les fiches où on les voit à l'œuvre.
        </p>
        <nav aria-label="Catégories du lexique" className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="tap inline-flex items-center bg-plate/60 px-3.5 py-2 text-[14px] font-medium text-soft transition-colors hover:bg-plate hover:text-ink"
            >
              {c.titre}
            </a>
          ))}
        </nav>
      </header>

      {CATEGORIES.map((c) => {
        const termes = TERMES.filter((t) => t.categorie === c.id)
        return (
          <section key={c.id} id={c.id} className="scroll-mt-24 border-t border-rule py-12">
            <h2 className="font-jp text-[1.9rem] font-bold leading-tight">{c.titre}</h2>
            <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-faint">{c.intro}</p>
            <dl className="mt-8 grid gap-x-14 gap-y-9 md:grid-cols-2">
              {termes.map((t) => (
                <div key={t.id} id={t.id} className="scroll-mt-24 min-w-0">
                  <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-jp text-[1.3rem] font-bold leading-tight">{t.nom}</span>
                    <span lang="ja" className="font-jp text-[1.1rem] text-soft">{t.jp}</span>
                  </dt>
                  <dd className="mt-1">
                    <span className="block text-[13.5px] italic text-faint">{t.sens}</span>
                    <span className="mt-2 block text-[15px] leading-[1.7] text-soft">{t.definition}</span>
                    <Voir t={t} dex={dex} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })}
    </article>
  )
}
