import type { Technique } from '../../types/judodex'
import { familyVars, kanjiSize } from '../../lib/families'
import { directionMeta, type Secteur } from '../../lib/secteurs'
import { DEPLACEMENTS, GARDES, caseDe } from '../../lib/situations'
import { REACTIONS, jauges, type Lecture, type MonJudo } from '../../lib/monjudo'
import { Signature } from '../Marque'

/*
 * La carte d’un judo. Elle sert deux fois : en aperçu, qui se remplit à côté
 * de chaque étape, et en affiche, au bout du parcours — celle qu’on
 * télécharge, qu’on imprime et qu’on partage. Tout y est lisible sans
 * explication : chaque bloc dit ce qu’il montre.
 */

interface Props {
  mj: MonJudo
  l: Lecture
  variante?: 'apercu' | 'affiche'
}

/** Les coins vus depuis tori : l’arrière de uke en haut, sa droite à gauche. */
const DISPOSITION: Secteur[] = ['ar-d', 'ar-g', 'av-d', 'av-g']

function Nom({ t, fort = false, petit = false, retour = false }: { t: Technique; fort?: boolean; petit?: boolean; retour?: boolean }) {
  return (
    <span style={familyVars(t.family)} className="flex min-w-0 items-baseline gap-2">
      <span lang="ja" className={`font-jp shrink-0 font-bold leading-none text-(--fam) ${petit ? 'text-[13px]' : 'text-[15px]'}`}>
        {t.kanji}
      </span>
      <span className={`min-w-0 leading-snug ${retour ? '[overflow-wrap:anywhere]' : 'truncate'} ${petit ? 'text-[12.5px]' : 'text-[14px]'} ${fort ? 'font-semibold text-ink' : 'text-soft'}`}>
        {t.name}
      </span>
    </span>
  )
}

function Bloc({ titre, jp, children, className = '' }: { titre: string; jp: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <h3 className="mb-3 flex items-baseline gap-2 border-b border-rule pb-2">
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-soft">{titre}</span>
        <span lang="ja" className="font-jp text-[12px] text-faint">
          {jp}
        </span>
      </h3>
      {children}
    </section>
  )
}

/** Les quatre coins autour de uke, tori en bas : la rose, mise à plat. */
export function PlancheCoins({
  l,
  petit = false,
  ouvert,
  onChoisir,
}: {
  l: Lecture
  petit?: boolean
  ouvert?: Secteur | null
  onChoisir?: (s: Secteur) => void
}) {
  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-2">
        {DISPOSITION.map((s) => {
          const liste = l.parCoin[s]
          const vide = liste.length === 0
          const contenu = (
            <>
              {/* Le compte suit le libellé : le coin intérieur de chaque case
                  reste libre pour uke, au centre de la planche. */}
              <span className={`block text-[12px] font-medium ${vide ? 'text-signal' : 'text-faint'}`}>
                {directionMeta(s).label}
                {!vide && <span className="tabular-nums"> · {liste.length}</span>}
              </span>
              <span className={`mt-1.5 flex flex-col gap-1 ${petit ? '' : 'min-h-[3.2rem]'}`}>
                {vide ? (
                  <span className="text-[12.5px] italic text-faint">Personne ne tombe ici</span>
                ) : (
                  liste.map((t) => <Nom key={t.slug} t={t} fort={t.slug === l.tokui?.slug} petit={petit} retour />)
                )}
              </span>
            </>
          )
          const cls = `relative block min-w-0 border p-2.5 text-left transition ${vide ? 'hachure border-dashed border-edge' : 'border-rule bg-field'} ${
            ouvert === s ? 'outline outline-2 -outline-offset-1 outline-signal' : ''
          }`
          return onChoisir ? (
            <button key={s} onClick={() => onChoisir(s)} aria-pressed={ouvert === s} className={`${cls} hover:border-ink`}>
              {contenu}
            </button>
          ) : (
            <div key={s} className={cls}>
              {contenu}
            </div>
          )
        })}
      </div>
      {/* Uke au centre, tori en bas : on lit la planche depuis sa place. */}
      <span
        aria-hidden
        className="font-jp pointer-events-none absolute left-1/2 top-[calc(50%-0.6rem)] grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-none border border-edge bg-field text-[14px] text-soft"
      >
        受
      </span>
      <p className="mt-1.5 text-center text-[11.5px] text-faint">
        <span lang="ja" className="font-jp">取</span> toi, face à uke
      </p>
    </div>
  )
}

/** Ta technique, et ce que tu fais de chacune de ses réactions. */
function Arbre({ l, petit }: { l: Lecture; petit: boolean }) {
  if (!l.tokui) return <p className="text-[13px] italic text-faint">Choisis d’abord ta technique.</p>
  return (
    <div>
      <Nom t={l.tokui} fort petit={petit} />
      <ul className="ml-[7px] mt-2 border-l border-edge">
        {REACTIONS.map((r) => {
          const x = l.reactions.find((y) => y.id === r.id)!
          return (
            <li key={r.id} className="relative flex min-w-0 items-baseline gap-2 py-1 pl-4">
              <span aria-hidden className="absolute left-0 top-[0.9rem] h-px w-3 bg-edge" />
              <span className={`w-[5.6rem] shrink-0 text-[12.5px] ${x.t ? 'text-faint' : 'text-signal'}`}>{r.label}</span>
              {x.t ? (
                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="min-w-0 flex-1">
                    <Nom t={x.t} petit={petit} />
                  </span>
                  {x.changeDeCoin && (
                    <span className="shrink-0 text-[11px] font-medium text-soft" title="Cette suite fait tomber dans un autre coin">
                      ↗ autre coin
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[12.5px] italic text-faint">rien de prévu</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Les huit situations, garde relative en lignes, déplacement de uke en colonnes. */
function Entrees({ l, petit }: { l: Lecture; petit: boolean }) {
  return (
    <table className="w-full table-fixed border-separate border-spacing-1">
      <thead>
        <tr>
          <td className="w-[4.6rem]" />
          {DEPLACEMENTS.map((d) => (
            <th key={d.id} scope="col" className="pb-0.5 text-center text-[11.5px] font-normal text-faint">
              {d.court}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {GARDES.map((g) => (
          <tr key={g.id}>
            <th scope="row" className="pr-1 text-left text-[11.5px] font-medium leading-tight text-soft">
              {g.label}
            </th>
            {DEPLACEMENTS.map((d) => {
              const t = l.parEntree[caseDe(g.id, d.id)]
              return (
                <td
                  key={d.id}
                  title={t ? `${t.name} — ${g.label.toLowerCase()}, ${d.court.toLowerCase()}` : 'Rien de prévu'}
                  className={`h-10 border text-center align-middle ${t ? 'border-rule bg-field' : 'hachure border-dashed border-edge'}`}
                  style={t ? familyVars(t.family) : undefined}
                >
                  {t ? (
                    <span className="flex flex-col items-center px-0.5">
                      <span
                        lang="ja"
                        className="font-jp whitespace-nowrap font-bold leading-none text-(--fam)"
                        // Cinq idéogrammes doivent tenir dans une case de la grille.
                        style={{ fontSize: petit ? '12px' : [...t.kanji].length >= 4 ? '0.72rem' : kanjiSize(t.kanji, 'row') }}
                      >
                        {t.kanji}
                      </span>
                      {!petit && <span className="mt-0.5 block w-full truncate text-[10.5px] text-faint">{t.name}</span>}
                    </span>
                  ) : (
                    <span className="text-[12px] text-faint">—</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Sol({ l, petit }: { l: Lecture; petit: boolean }) {
  const maillon = (label: string, t: Technique | null) => (
    <li className="flex min-w-0 items-baseline gap-2">
      <span className="w-[5.6rem] shrink-0 text-[12.5px] text-faint">{label}</span>
      {t ? <Nom t={t} petit={petit} /> : <span className="text-[12.5px] italic text-signal">à choisir</span>}
    </li>
  )
  return (
    <ol className="space-y-1.5">
      {maillon('Il tombe mal', l.transition)}
      {maillon('Tu finis', l.finition)}
    </ol>
  )
}

export function CarteJudo({ mj, l, variante = 'affiche' }: Props) {
  const petit = variante === 'apercu'
  const tokui = l.tokui

  return (
    <article
      aria-label={mj.prenom ? `Le judo de ${mj.prenom}` : 'Ta carte de judo'}
      className={`carte-judo relative overflow-hidden border border-edge bg-plate ${petit ? 'p-4' : 'p-5 sm:p-8'}`}
      style={tokui ? familyVars(tokui.family) : undefined}
    >
      {/* Le sol du dojo, en tête de carte. */}
      <div aria-hidden className="tatami pointer-events-none absolute inset-x-0 top-0 h-48 opacity-80" />

      <header className="relative flex min-w-0 items-start gap-4 sm:gap-6">
        <div className={`grid shrink-0 place-items-center border-2 ${tokui ? 'border-(--fam)' : 'border-dashed border-edge'} ${petit ? 'size-16' : 'size-24 sm:size-28'}`}>
          {tokui ? (
            <span
              lang="ja"
              className="font-jp whitespace-nowrap font-extrabold leading-none text-(--fam) [writing-mode:vertical-rl]"
              // La colonne tient dans le cadre, de un à cinq idéogrammes.
              style={{ fontSize: petit ? `${Math.min(1.7, 3.2 / [...tokui.kanji].length)}rem` : `${Math.min(2.8, 5 / [...tokui.kanji].length)}rem` }}
            >
              {tokui.kanji}
            </span>
          ) : (
            <span className="text-[12px] text-faint">?</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium text-faint">{mj.prenom ? 'Le judo de' : 'Ton judo'}</p>
          <p className={`font-jp font-extrabold leading-[1.05] ${petit ? 'text-[1.35rem]' : 'text-[clamp(1.8rem,5vw,2.8rem)]'}`}>
            {mj.prenom || (tokui ? tokui.name : 'En construction')}
          </p>
          <p className={`mt-1.5 text-soft ${petit ? 'text-[12.5px]' : 'text-[14.5px]'}`}>
            {mj.garde === 'droite' ? 'Droitier' : 'Gaucher'}
            {tokui && (
              <>
                {' · '}tokui-waza <span className="font-semibold text-ink">{tokui.name}</span>
                {l.coinTokui && <span className="text-faint"> · {directionMeta(l.coinTokui).label.toLowerCase()}</span>}
              </>
            )}
          </p>
        </div>
      </header>

      {/* Où en est chaque partie : quatre jauges, lisibles d’un coup d’œil. */}
      <dl className={`relative mt-5 grid grid-cols-4 gap-2 ${petit ? '' : 'sm:gap-4'}`}>
        {jauges(l).map((j) => {
          const plein = j.n >= j.sur
          return (
            <div key={j.id} className="min-w-0">
              <dt className="truncate text-[11.5px] text-faint">{j.label}</dt>
              <dd className={`font-jp font-bold leading-none tabular-nums ${petit ? 'text-[1.1rem]' : 'text-[1.6rem]'} ${plein ? 'text-ink' : j.n ? 'text-soft' : 'text-faint'}`}>
                {j.n}
                <span className="text-[0.6em] text-faint">/{j.sur}</span>
              </dd>
              <div aria-hidden className="mt-1.5 flex gap-[2px]">
                {Array.from({ length: j.sur }, (_, k) => (
                  <span key={k} className={`h-[3px] flex-1 ${k < j.n ? (plein ? 'bg-ink' : 'bg-signal') : 'bg-rule'}`} />
                ))}
              </div>
            </div>
          )
        })}
      </dl>

      <div className={`relative mt-6 grid gap-x-8 gap-y-6 ${petit ? '' : 'md:grid-cols-2'}`}>
        <Bloc titre="Tes coins" jp="崩し">
          <PlancheCoins l={l} petit={petit} />
        </Bloc>
        <Bloc titre="Quand il résiste" jp="連絡技">
          <Arbre l={l} petit={petit} />
        </Bloc>
        {!petit && (
          <Bloc titre="Tes entrées" jp="組み手">
            <Entrees l={l} petit={petit} />
          </Bloc>
        )}
        <Bloc titre="Au sol" jp="寝技">
          <Sol l={l} petit={petit} />
        </Bloc>
      </div>

      {!petit && (
        <footer className="relative mt-8 flex items-center gap-3 border-t border-rule pt-4">
          <Signature className="text-[1.3rem]" reserve="plate" />
          <span className="ml-auto text-[12px] text-faint">Le carnet du judoka</span>
        </footer>
      )}
    </article>
  )
}
