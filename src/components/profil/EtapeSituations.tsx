import type { Judodex } from '../../hooks/useJudodex'
import type { useProfil } from '../../hooks/useProfil'
import type { Bilan } from '../../hooks/useBilan'
import { GrilleSituations } from '../GrilleSituations'
import { ListeCochable, Plus } from './pieces'
import { CASES, DEPLACEMENTS, GARDES, deplacementMeta, gardeMeta, type Case } from '../../lib/situations'

/**
 * Intitulé d'une case, dans les mots qu'affiche la grille : « garde croisée,
 * il fuit ». Une seule formulation pour toute la page — les en-têtes de la
 * grille disaient « il vient » là où le reste disait « uke avance ».
 */
export function libelleCase(c: Case) {
  const [g, d] = c.split(':') as [(typeof GARDES)[number]['id'], (typeof DEPLACEMENTS)[number]['id']]
  return `${gardeMeta(g).label}, ${deplacementMeta(d).court.toLowerCase()}`
}

interface Props {
  dex: Judodex
  profil: ReturnType<typeof useProfil>
  bilan: Bilan
  survol: Case | null
  ouvert: Case | null
  onSurvol: (c: Case | null) => void
  onOuvrir: (c: Case | null) => void
  onChercher: (c: Case) => void
}

/** L'autre couverture : non plus où uke tombe, mais d'où l'on part. */
export function EtapeSituations({ dex, profil, bilan, survol, ouvert, onSurvol, onOuvrir, onChercher }: Props) {
  const { situations } = bilan
  const tenues = situations.tenues.length

  return (
    <div>
      <p className="mb-6 max-w-2xl text-[14px] leading-relaxed text-soft">
        Deux choses décident d'une attaque avant même que tu la lances : la <strong>garde</strong> de celui d'en face —
        la même que la tienne, ou l'inverse — et ce qu'il fait de ses appuis. Huit cas en tout. Une case est tenue dès
        qu'une de tes techniques s'y applique.
      </p>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        <div className="min-w-0">
          <GrilleSituations
            parCase={situations.parCase}
            actif={survol}
            ouvert={ouvert}
            onSurvol={onSurvol}
            onChoisir={(c) => onOuvrir(ouvert === c ? null : c)}
          />
          <p className="annot mt-3 leading-relaxed text-faint">
            {tenues} case{tenues > 1 ? 's' : ''} sur {CASES.length}. Clique une case pour voir les techniques qui la
            tiennent et cocher les tiennes — comme sur la rose.
          </p>
        </div>

        <div className="min-w-0">
          {situations.vides.length === 0 ? (
            <p className="border-l-[5px] border-signal bg-plate p-4 text-[14px] leading-relaxed text-soft">
              Les huit cas sont tenus. Quelle que soit la garde d'en face et ce qu'il fait de ses appuis, tu as une
              attaque à lui opposer.
            </p>
          ) : (
            <>
              <p className="mb-4 text-[14px] leading-relaxed text-soft">
                {situations.vides.length === 1 ? 'Un cas te manque' : `${situations.vides.length} cas te manquent`}. Coche
                ce que tu sais déjà faire, ou ouvre la case pour voir tout ce qui la tient.
              </p>
              <div className="space-y-5">
                {situations.vides.slice(0, 3).map((c) => (
                  <div key={c} className="min-w-0 border-t border-ink pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onOuvrir(ouvert === c ? null : c)}
                        aria-expanded={ouvert === c}
                        className="annot border border-signal px-1.5 py-1 leading-none text-signal transition hover:bg-signal hover:text-field"
                      >
                        {libelleCase(c)}
                      </button>
                      <Plus label={`Chercher une technique pour ${libelleCase(c)}`} onClick={() => onChercher(c)} />
                    </div>
                    {bilan.propositionsSituation[c]?.length ? (
                      <ul className="mt-2 space-y-1.5">
                        {bilan.propositionsSituation[c].map((t) => (
                          <li key={t.slug} className="flex min-w-0 items-start gap-2.5">
                            <button
                              onClick={() => {
                                if (!bilan.acquis.has(t.slug)) dex.setMastery(t.slug, 'mastered')
                                profil.basculerSituation(t.slug, c)
                              }}
                              role="switch"
                              aria-checked={bilan.acquis.has(t.slug)}
                              aria-label={`${t.name} à ton répertoire`}
                              className={`mt-[3px] grid size-4 shrink-0 place-items-center border text-[10px] leading-none transition ${
                                bilan.acquis.has(t.slug)
                                  ? 'border-signal bg-signal text-field'
                                  : 'border-rule text-transparent hover:border-ink'
                              }`}
                            >
                              ✓
                            </button>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13.5px] text-soft">{t.name}</span>
                              <span className="annot block truncate text-faint">{t.translation}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="py-2 text-[13px] leading-relaxed text-faint">
                        Aucune technique du catalogue n'est encore relevée dans ce cas.
                      </p>
                    )}
                  </div>
                ))}
                {situations.vides.length > 3 && (
                  <p className="annot text-faint">
                    Et {situations.vides.length - 3} cas de plus, à voir quand ceux-ci seront tenus.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {ouvert && (
        <ListeCochable
          titre={libelleCase(ouvert)}
          aide="Toutes les techniques relevées dans ce cas. Coche celles que tu y emploies — ça ne change rien au reste de ton carnet."
          techniques={bilan.catalogueParCase[ouvert]}
          estAcquise={(slug) => bilan.acquis.has(slug)}
          estTokui={(slug) => dex.getProgress(slug).tokui}
          // Ici on parle de situations, pas du carnet : décocher retire la
          // technique de ce cas et de rien d'autre. Une technique du catalogue
          // rangée ici par ses liens ne s'en retire pas — c'est le catalogue
          // qui le dit, pas le pratiquant.
          onBasculer={(slug) => {
            if (!bilan.acquis.has(slug)) dex.setMastery(slug, 'mastered')
            profil.basculerSituation(slug, ouvert)
          }}
          verrouillee={(slug) =>
            bilan.acquis.has(slug) && !(profil.situations[slug] ?? []).includes(ouvert)
          }
          estAttribuee={(slug) => (profil.situations[slug] ?? []).includes(ouvert)}
          onBasculerAttribution={(slug) => profil.basculerSituation(slug, ouvert)}
          onChercher={() => onChercher(ouvert)}
          onFermer={() => onOuvrir(null)}
        />
      )}
    </div>
  )
}