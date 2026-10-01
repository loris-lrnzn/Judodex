import type { Judodex } from '../hooks/useJudodex'
import { beltOf, nextBeltAfter, situationsFor, PROGRESSION_SOURCE, type BeltId } from '../lib/belts'
import { questionsCeinture } from '../lib/faq'
import { CEINTURES } from '../hooks/useRoute'
import { BeltMark } from '../components/BeltMark'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { StudyList } from '../components/StudyList'
import { Faq, Fil, LigneTechnique } from '../components/PageSeo'
import type { Technique } from '../types/judodex'

export function CeintureScreen({ belt, dex }: { belt: BeltId; dex: Judodex }) {
  const b = beltOf(belt)
  const couleur = b.name.toLowerCase()
  const nom = (slug: string) => dex.bySlug.get(slug)?.name ?? slug
  const nage = b.nage.map((s) => dex.bySlug.get(s)).filter((t): t is Technique => !!t)
  const katame = b.katame.map((s) => dex.bySlug.get(s)).filter((t): t is Technique => !!t)
  const situations = situationsFor(belt)
  const i = CEINTURES.indexOf(belt)
  const precedente = i > 0 ? beltOf(CEINTURES[i - 1]) : null
  const suivante = nextBeltAfter(belt)
  const depart = precedente ? precedente.name.toLowerCase() : 'blanche'

  return (
    <article className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-7">
      <Fil elements={[{ label: 'Ceintures', to: { name: 'ceintures' } }, { label: `Ceinture ${couleur}` }]} />

      <header className="pb-12 pt-6 sm:pt-12">
        <Surtitre className="monte">Passage de grade · {b.kyu}</Surtitre>
        <h1 className="display monte mt-5 max-w-4xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Ceinture {couleur} de judo : le programme
        </h1>
        <div className="monte mt-6 flex items-center gap-4" style={{ '--d': '140ms' } as React.CSSProperties}>
          <BeltMark belt={belt} width={96} height={24} />
          <p className="text-[16px] text-soft">
            {b.plate} · {b.phase}
          </p>
        </div>
        <p className="monte mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-soft" style={{ '--d': '200ms' } as React.CSSProperties}>
          Pour passer de la ceinture {depart} à la ceinture {couleur} ({b.kyu}), la progression française de l'enseignement du judo
          impose {nage.length} techniques de projection et {katame.length} techniques de contrôle au sol, auxquelles s'ajoutent{' '}
          {situations.length} situations d'étude. L'objectif de la planche : {b.focus.charAt(0).toLowerCase()}
          {b.focus.slice(1)}
        </p>
      </header>

      <dl className="grid gap-x-10 gap-y-6 border-t border-rule py-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Phase d'apprentissage", v: b.phase },
          { k: 'Valeurs du code moral', v: b.values },
          { k: 'Répartition du programme', v: `${b.nagePart} % debout · ${100 - b.nagePart} % sol` },
          { k: 'Volume attendu', v: b.volume.replace(/ · /g, ' ; ') },
        ].map(({ k, v }) => (
          <div key={k} className="min-w-0">
            <dt className="text-[13px] text-faint">{k}</dt>
            <dd className="mt-1 text-[15px] leading-snug">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="border-t border-rule py-12">
        <h2 className="font-jp mb-2 text-[1.6rem] font-bold leading-tight">Les techniques imposées</h2>
        <p className="mb-8 max-w-[62ch] text-[15px] leading-[1.7] text-soft">
          Chaque technique renvoie à sa fiche : nom japonais, décomposition en kuzushi, tsukuri et kake, points clés et démonstration filmée.
        </p>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="mb-3 flex items-baseline justify-between text-[15px] font-semibold">
              Debout · nage-waza
              <span className="text-[13px] font-normal tabular-nums text-faint">{nage.length} techniques</span>
            </h3>
            <div className="border-b border-rule">
              {nage.map((t) => (
                <LigneTechnique key={t.slug} t={t} />
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 flex items-baseline justify-between text-[15px] font-semibold">
              Au sol · katame-waza
              <span className="text-[13px] font-normal tabular-nums text-faint">{katame.length} techniques</span>
            </h3>
            <div className="border-b border-rule">
              {katame.map((t) => (
                <LigneTechnique key={t.slug} t={t} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {situations.length > 0 && (
        <section className="border-t border-rule py-12">
          <h2 className="font-jp mb-2 text-[1.6rem] font-bold leading-tight">Les situations d'étude</h2>
          <p className="mb-8 max-w-[62ch] text-[15px] leading-[1.7] text-soft">
            Ce ne sont pas des techniques à nommer mais des situations à résoudre : se déplacer, esquiver, retourner uke, dégager une jambe.
            Au sol, elles occupent l'essentiel du programme, ce qui explique la part qu'il y prend ({100 - b.nagePart} %). Chaque ligne déplie sa démonstration.
          </p>
          <div className="grid gap-x-12 gap-y-9 lg:grid-cols-2">
            <StudyList niveau="h3" title="Debout" items={situations.filter((x) => x.domain === 'nage')} />
            <StudyList niveau="h3" title="Au sol" items={situations.filter((x) => x.domain === 'katame')} />
          </div>
        </section>
      )}

      <Faq questions={questionsCeinture(belt, nom)} />

      <section className="border-t border-rule py-12">
        <div className="flex flex-wrap items-center gap-3">
          <Link to={{ name: 'train' }} className="tap inline-flex items-center bg-signal px-5 py-3 text-[15px] font-semibold text-field transition hover:brightness-110">
            Réviser ce programme au dojo
          </Link>
          <Link to={{ name: 'ceintures' }} className="tap inline-flex items-center border border-edge px-5 py-3 text-[14px] font-medium transition hover:border-ink">
            Toutes les ceintures
          </Link>
        </div>
        <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed text-faint">
          Programme relevé sur la{' '}
          <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            progression française de l'enseignement du judo
          </a>
          , publiée par la fédération. Judodex n'est pas un site officiel : en cas de doute, la planche de la fédération fait foi.
        </p>
      </section>

      <nav aria-label="Ceintures voisines" className="grid border-t border-rule sm:grid-cols-2">
        {precedente && precedente.id !== belt && CEINTURES.includes(precedente.id) ? (
          <Link to={{ name: 'ceinture', belt: precedente.id }} className="group py-7 sm:pr-8">
            <span className="block text-[13px] text-faint">← Ceinture précédente</span>
            <span className="font-jp mt-2 flex items-center gap-3 text-[1.4rem] font-bold leading-tight underline-offset-4 group-hover:underline">
              <BeltMark belt={precedente.id} width={36} height={10} />
              Ceinture {precedente.name.toLowerCase()}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {suivante && (
          <Link
            to={suivante === 'noire' ? { name: 'dan', dan: 1 } : { name: 'ceinture', belt: suivante }}
            className="group border-t border-rule py-7 sm:col-start-2 sm:border-l sm:border-t-0 sm:pl-8 sm:text-right"
          >
            <span className="block text-[13px] text-faint">Ceinture suivante →</span>
            <span className="font-jp mt-2 flex items-center gap-3 text-[1.4rem] font-bold leading-tight underline-offset-4 group-hover:underline sm:justify-end">
              <BeltMark belt={suivante} width={36} height={10} />
              Ceinture {beltOf(suivante).name.toLowerCase()}
            </span>
          </Link>
        )}
      </nav>
    </article>
  )
}

