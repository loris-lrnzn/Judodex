import { CASES, DEPLACEMENTS, GARDES, caseDe, type Case } from '../lib/situations'
import type { Technique } from '../types/judodex'

interface Props {
  parCase: Record<Case, Technique[]>
  actif?: Case | null
  /** Case dont la liste est ouverte, pour la marquer sur la grille. */
  ouvert?: Case | null
  onSurvol?: (c: Case | null) => void
  /** Ouvre une case : c'est là qu'on ajoute les techniques qui la tiennent. */
  onChoisir?: (c: Case) => void
}

/**
 * Le pendant de la rose sur l'autre axe. La rose dit où uke tombe ; la grille
 * dit d'où l'on part. Les deux se remplissent séparément, et c'est le point :
 * on peut tenir les quatre coins sans avoir jamais rien monté en garde
 * croisée.
 */
export function GrilleSituations({ parCase, actif = null, ouvert = null, onSurvol, onChoisir }: Props) {
  const tenues = CASES.filter((c) => parCase[c].length > 0).length

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse">
          <caption className="sr-only">
            Couverture des situations : {tenues} cases tenues sur huit, garde relative en lignes et déplacement de uke
            en colonnes.
          </caption>
          <thead>
            <tr>
              <td />
              {DEPLACEMENTS.map((d) => (
                <th key={d.id} scope="col" className="annot px-1 pb-2 text-center font-normal text-faint">
                  {d.court}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GARDES.map((g) => (
              <tr key={g.id}>
                <th scope="row" className="annot py-1 pr-2.5 text-right align-middle font-normal">
                  <span className="block whitespace-nowrap">{g.label}</span>
                  <span className="font-jp block text-[11px] text-faint">{g.jp}</span>
                </th>
                {DEPLACEMENTS.map((d) => {
                  const c = caseDe(g.id, d.id)
                  const n = parCase[c].length
                  return (
                    <td key={d.id} className="p-0.5">
                      {/* La case s'ouvre comme un quartier de la rose : le « + »
                          dit que le geste existe, le nombre dit ce qu'on tient. */}
                      <button
                        onMouseEnter={() => onSurvol?.(c)}
                        onMouseLeave={() => onSurvol?.(null)}
                        onClick={() => onChoisir?.(c)}
                        disabled={!onChoisir}
                        aria-expanded={onChoisir ? ouvert === c : undefined}
                        aria-label={`${g.label}, ${d.court.toLowerCase()} — ${n || 'aucune'} technique${n > 1 ? 's' : ''}`}
                        title={n ? parCase[c].map((t) => t.name).join(', ') : `${g.label}, ${d.court.toLowerCase()} — rien encore`}
                        className={`flex h-11 w-full items-center justify-center gap-1.5 border text-[13px] tabular-nums transition ${
                          n ? 'border-signal bg-signal/15 text-ink' : 'border-dashed border-rule text-faint'
                        } ${ouvert === c ? 'outline outline-2 outline-ink' : actif === c ? 'outline outline-1 outline-ink' : ''} ${
                          onChoisir ? 'hover:border-ink' : ''
                        }`}
                      >
                        <span>{n || '—'}</span>
                        {onChoisir && <span className="text-[11px] leading-none text-faint">+</span>}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
