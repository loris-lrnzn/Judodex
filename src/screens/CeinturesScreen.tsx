import type { Judodex } from '../hooks/useJudodex'
import { BELTS, PROGRESSION_SOURCE } from '../lib/belts'
import { CEINTURES } from '../hooks/useRoute'
import { questionsCeintures } from '../lib/faq'
import { BeltMark } from '../components/BeltMark'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { Faq, Fil } from '../components/PageSeo'

/** Vue d'ensemble de la progression : de la ceinture blanche à la noire, une ligne par passage. */
export function CeinturesScreen({ dex }: { dex: Judodex }) {
  return (
    <article className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-7">
      <Fil elements={[{ label: 'Ceintures de judo' }]} />

      <header className="pb-12 pt-6 sm:pt-12">
        <Surtitre className="monte">Progression française</Surtitre>
        <h1 className="display monte mt-5 max-w-4xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          Les ceintures de judo : le programme, de la blanche à la noire
        </h1>
        <p className="monte mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
          Le judo ne progresse pas par difficulté abstraite mais par passage de grade, et chaque passage a sa planche : des techniques de
          projection et de contrôle au sol, des situations d'étude, deux valeurs du code moral et un volume de pratique. Voici les six
          passages, avec ce que chacun impose.
        </p>
      </header>

      <ol className="border-b border-rule">
        {BELTS.map((b) => {
          const publiee = CEINTURES.includes(b.id)
          const to = publiee ? ({ name: 'ceinture', belt: b.id } as const) : ({ name: 'dan', dan: 1 } as const)
          const nbTech = b.nage.length + b.katame.length
          return (
            <li key={b.id} className="border-t border-rule">
              <Link to={to} className="group grid items-center gap-x-8 gap-y-3 py-6 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
                <span className="flex items-center gap-3 sm:block">
                  <BeltMark belt={b.id} width={84} height={20} />
                  <span className="text-[13px] text-faint sm:mt-2 sm:block">{b.kyu}</span>
                </span>
                <span className="min-w-0">
                  <span className="font-jp block text-[1.5rem] font-bold leading-tight underline-offset-4 group-hover:underline">
                    Ceinture {b.name.toLowerCase()}
                  </span>
                  <span className="mt-1 block text-[14px] text-faint">
                    {b.plate} · {b.phase}
                  </span>
                  <span className="mt-2 block max-w-[60ch] text-[15px] leading-relaxed text-soft">{b.focus}</span>
                </span>
                <span className="text-[13px] tabular-nums text-faint sm:text-right">
                  {nbTech > 0 ? `${b.nage.length} projections · ${b.katame.length} au sol` : 'Examen des dan'}
                  <span aria-hidden className="vector-push ml-3 text-ink">→</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      <section className="py-12">
        <h2 className="font-jp mb-4 text-[1.6rem] font-bold leading-tight">Comment lire les grades</h2>
        <div className="grid max-w-3xl gap-4 text-[15px] leading-[1.7] text-soft">
          <p>
            Les ceintures de couleur sont des <strong className="font-semibold text-ink">kyu</strong> : ils décroissent à mesure qu'on avance,
            du 5ᵉ kyu (jaune) au 1ᵉʳ kyu (marron). La ceinture noire ouvre la série des <strong className="font-semibold text-ink">dan</strong>,
            qui croissent à partir du premier.
          </p>
          <p>
            Les {dex.techniques.length} fiches du catalogue ne figurent pas toutes sur une planche : {dex.offProgramme.length} appartiennent au
            répertoire complémentaire, et restent consultables dans le{' '}
            <Link to={{ name: 'browse' }} className="text-ink underline decoration-edge underline-offset-4 hover:decoration-ink">
              catalogue
            </Link>
            . Les termes japonais sont expliqués dans le{' '}
            <Link to={{ name: 'lexique' }} className="text-ink underline decoration-edge underline-offset-4 hover:decoration-ink">
              lexique du judo
            </Link>
            .
          </p>
        </div>
      </section>

      <Faq questions={questionsCeintures()} />

      <p className="border-t border-rule py-8 text-[13px] leading-relaxed text-faint">
        Programme relevé sur la{' '}
        <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
          progression française de l'enseignement du judo
        </a>
        , publiée par la fédération.
      </p>
    </article>
  )
}
