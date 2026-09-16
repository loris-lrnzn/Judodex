import type { Judodex } from '../../hooks/useJudodex'
import type { Bilan } from '../../hooks/useBilan'
import { RoseSecteurs } from '../RoseSecteurs'
import { LigneTechnique, ListeCochable, Plus, basculerRepertoire } from './pieces'
import { directionMeta, type Secteur } from '../../lib/secteurs'

/**
 * Ordre des cartes, calqué sur la place des quartiers à l'écran. La rose étant
 * vue depuis tori, l'arrière de uke est en haut de planche et sa droite à
 * gauche : les cartes suivent, pour que l'œil aille de l'une à l'autre sans
 * traduire.
 */
const ORDRE_CARTES: Secteur[] = ['ar-d', 'ar-g', 'av-d', 'av-g']

interface Props {
  dex: Judodex
  bilan: Bilan
  ouvert: Secteur | null
  survol: Secteur | null
  onOuvrir: (s: Secteur | null) => void
  onSurvol: (s: Secteur | null) => void
  onChercher: (s: Secteur) => void
}

/** L'étape où l'on remplit son répertoire : c'est la matière de tout le reste. */
export function EtapeRepertoire({ dex, bilan, ouvert, survol, onOuvrir, onSurvol, onChercher }: Props) {
  const tenus = 4 - bilan.vides.length

  return (
    <div>
      {bilan.vierge && (
        <p className="mb-8 border-l-[5px] border-signal bg-plate p-4 text-[14px] leading-relaxed text-soft">
          Ta planche est vide pour l'instant. Clique un quartier de la rose, ou un <strong>+</strong> à droite, et coche
          les projections que tu sais faire. Trois ou quatre suffisent pour que la suite ait du sens.
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[300px]">
          <RoseSecteurs
            repertoire={bilan.compte.repertoire}
            tokui={bilan.compte.tokui}
            actif={survol}
            ouvert={ouvert}
            onChoisir={(s) => onOuvrir(ouvert === s ? null : s)}
          />
          <p className="annot mt-3 text-center leading-relaxed text-faint">
            Uke au centre, toi en bas de planche. Clique un quartier pour y ajouter tes techniques.
          </p>
        </div>

        <div className="grid min-w-0 gap-x-6 gap-y-6 sm:grid-cols-2">
          {ORDRE_CARTES.map((s) => {
            const list = bilan.parSecteur[s]
            return (
              <div key={s} onMouseEnter={() => onSurvol(s)} onMouseLeave={() => onSurvol(null)} className="min-w-0">
                <div className={`mb-1 flex items-center gap-2.5 border-b pb-2 ${ouvert === s ? 'border-signal' : 'border-ink'}`}>
                  <button
                    onClick={() => onOuvrir(ouvert === s ? null : s)}
                    aria-expanded={ouvert === s}
                    title={`Ouvrir la liste de l'${directionMeta(s).label.toLowerCase()}`}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-signal"
                  >
                    <span className="annot min-w-0 truncate">{directionMeta(s).label}</span>
                    <span className={`annot ml-auto shrink-0 ${list.length ? 'text-faint' : 'text-signal'}`}>{list.length}</span>
                  </button>
                  <Plus
                    label={`Ajouter une technique en ${directionMeta(s).label.toLowerCase()}`}
                    onClick={() => onChercher(s)}
                  />
                </div>
                {list.length > 0 ? (
                  <ul>
                    {list.map((p) => (
                      <LigneTechnique key={p.t.slug} t={p.t} fort={p.tokui} />
                    ))}
                  </ul>
                ) : (
                  <p className="py-2.5 text-[13px] leading-relaxed text-faint">Rien encore dans ce coin.</p>
                )}
                <div className="mt-2">
                  <Plus large label={`Ajouter en ${directionMeta(s).label.toLowerCase()}`} onClick={() => onChercher(s)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {ouvert && (
        <ListeCochable
          titre={directionMeta(ouvert).label}
          jp={directionMeta(ouvert).jp}
          aide="Coche les projections que tu sais faire : elles entrent à ton répertoire, ici comme dans tout le carnet."
          techniques={bilan.catalogueParSecteur[ouvert]}
          estAcquise={(slug) => bilan.acquis.has(slug)}
          estTokui={(slug) => dex.getProgress(slug).tokui}
          onBasculer={(slug) => basculerRepertoire(dex, slug)}
          onChercher={() => onChercher(ouvert)}
          onFermer={() => onOuvrir(null)}
        />
      )}

      {bilan.cardinales.length > 0 && (
        <p className="mt-8 border-l-[5px] border-rule bg-plate p-4 text-[13px] leading-relaxed text-soft">
          {bilan.cardinales.length === 1 ? 'Une de tes projections part' : `${bilan.cardinales.length} de tes projections partent`}{' '}
          droit devant ou droit derrière — {bilan.cardinales.map((p) => p.t.name).join(', ')}. Elles ne comblent aucun
          coin : la ceinture noire demande les quatre coins, pas les quatre points cardinaux.
        </p>
      )}

      {!bilan.vierge && (
        <p className="mt-8 text-[14px] leading-relaxed text-soft">
          {tenus === 4
            ? 'Les quatre coins sont tenus. C’est exactement ce que la ceinture noire demande.'
            : `${tenus} coin${tenus > 1 ? 's' : ''} sur quatre. On verra à la fin par quoi combler ${
                bilan.vides.length > 1 ? 'les autres' : "l'autre"
              }.`}
        </p>
      )}
    </div>
  )
}
