import { useRef, useState } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { useProfil } from '../hooks/useProfil'
import { useSystemes } from '../hooks/useSystemes'
import { Link } from '../components/Link'
import { SectionHead } from '../components/SectionHead'
import { exportProgress, importProgress } from '../lib/backup'
import { A_CONFIRMER, DIRECTIONS, DIRECTION_OF, directionDe, type Direction } from '../lib/secteurs'
import { GARDES } from '../lib/situations'

interface Props {
  dex: Judodex
  onNotify: (m: string) => void
}

/**
 * Les réglages du carnet, rassemblés.
 *
 * Ils vivaient à deux endroits qui n'étaient ni l'un ni l'autre le bon : le
 * réglage des directions au bas du bilan, où un formulaire de trente-cinq
 * sélecteurs n'avait rien à faire, et la sauvegarde derrière un menu « ⋯ »
 * qui cachait un bouton d'effacement définitif sans rien en dire.
 */
export function ReglagesScreen({ dex, onNotify }: Props) {
  const profil = useProfil()
  const systemes = useSystemes()
  const fichier = useRef<HTMLInputElement>(null)
  const [filtre, setFiltre] = useState(false)

  const corrigees = Object.keys(profil.corrections).length

  const restaurer = async (f: File) => {
    try {
      const { progress, profil: p, systemes: s } = await importProgress(f)
      dex.replaceProgress(progress)
      if (p) profil.remplacer(p)
      if (s) systemes.remplacer(s)
      onNotify(p || s ? 'Carnet restauré' : 'Progression restaurée')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Import impossible')
    }
  }

  const liste = filtre ? A_CONFIRMER.filter((slug) => slug in profil.corrections) : A_CONFIRMER

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8">
      {/* ── En-tête ── */}
      <div className="pt-12">
        <span className="annot border border-ink px-1.5 py-1 leading-none">Carnet</span>
        <h1 className="display mt-5">Réglages</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="dimension w-20" />
          <span className="font-jp text-base tracking-[0.3em] text-faint">設定</span>
        </div>
        <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-soft">
          Ce que l'application doit savoir de vous pour lire votre judo, et de quoi emporter le carnet ailleurs. Tout
          reste dans ce navigateur : rien n'est envoyé nulle part.
        </p>
      </div>

      {/* ── Garde ── */}
      <div className="mt-12">
        <SectionHead title="Votre garde" jp="組み手" />
        <p className="mb-4 max-w-xl text-[13.5px] leading-relaxed text-soft">
          Elle renverse la lecture des secteurs en miroir : un gaucher n'a pas les mêmes coins. Le bilan s'y adapte, et
          la même bascule s'y trouve aussi, pour comparer d'un clic.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-edge">
            {(['droite', 'gauche'] as const).map((g) => (
              <button
                key={g}
                onClick={() => profil.setGarde(g)}
                aria-pressed={profil.garde === g}
                className={`min-h-11 px-4 text-[12px] capitalize transition sm:min-h-0 sm:py-2.5 ${
                  profil.garde === g ? 'bg-signal text-field' : 'text-soft hover:text-ink'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <p className="annot min-w-0 flex-1 text-faint">
            {profil.garde === 'droite' ? 'Lecture pour un droitier.' : 'Lecture renversée pour un gaucher.'}
          </p>
        </div>
        <p className="annot mt-3 max-w-xl leading-relaxed text-faint">
          À ne pas confondre avec la garde relative du bilan ({GARDES.map((g) => g.label.toLowerCase()).join(', ')}) :
          celle-là décrit une opposition entre deux judokas, celle-ci vous décrit vous.
        </p>
      </div>

      {/* ── Directions ── */}
      <div className="mt-14">
        <SectionHead title="Directions des projections" jp="調整" aside={corrigees ? `${corrigees} corrigées` : undefined} />
        <p className="max-w-xl text-[13.5px] leading-relaxed text-soft">
          La direction d'une projection dépend de la forme enseignée. {A_CONFIRMER.length} des{' '}
          {Object.keys(DIRECTION_OF).length} projections du catalogue admettent plusieurs lectures : si votre club en
          enseigne une autre, corrigez-la ici, et la rose du bilan suivra. Les autres, celles dont la direction ne fait
          pas débat, ne sont pas proposées.
        </p>
        {profil.garde === 'gauche' && (
          <p className="annot mt-2 max-w-xl leading-relaxed text-faint">
            Les directions se saisissent toujours en garde droite. La rose les renverse ensuite pour votre garde.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {corrigees > 0 && (
            <>
              <button
                onClick={() => setFiltre((v) => !v)}
                aria-pressed={filtre}
                className={`annot border px-3 py-2 transition ${
                  filtre ? 'border-signal bg-signal text-field' : 'border-ink hover:bg-ink hover:text-field'
                }`}
              >
                {filtre ? 'Voir les 35' : `Voir mes ${corrigees} corrections`}
              </button>
              <button
                onClick={() => (profil.reinitialiser(), setFiltre(false), onNotify("Directions d'origine rétablies"))}
                className="tap annot inline-flex items-center text-faint underline transition-colors hover:text-signal"
              >
                Tout rétablir
              </button>
            </>
          )}
        </div>

        <ul className="mt-5 border-t border-ink">
          {liste.map((slug) => {
            const t = dex.bySlug.get(slug)
            if (!t) return null
            const courante = directionDe(slug, 'droite', profil.corrections)!
            const corrigee = slug in profil.corrections
            return (
              <li key={slug} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule/60 py-2.5">
                <Link
                  to={{ name: 'technique', slug }}
                  className="-my-2 min-w-0 flex-1 truncate py-3.5 text-[13.5px] transition-colors hover:text-signal"
                >
                  {t.name}
                </Link>
                {corrigee && (
                  <span className="annot shrink-0 text-signal" title={`D'origine : ${DIRECTION_OF[slug].dir}`}>
                    modifiée
                  </span>
                )}
                <label className="sr-only" htmlFor={`dir-${slug}`}>
                  Direction de {t.name}
                </label>
                <select
                  id={`dir-${slug}`}
                  value={courante}
                  onChange={(e) =>
                    profil.corriger(slug, e.target.value === DIRECTION_OF[slug].dir ? null : (e.target.value as Direction))
                  }
                  className="h-10 shrink-0 border border-edge bg-plate px-2 text-[12px] text-ink sm:h-8"
                >
                  {DIRECTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Sauvegarde ── */}
      <div className="mt-14">
        <SectionHead title="Sauvegarde" jp="保存" />
        <p className="max-w-xl text-[13.5px] leading-relaxed text-soft">
          Le carnet vit dans ce navigateur seul. Un fichier exporté emporte tout : les techniques acquises et leurs
          échéances de révision, votre garde, vos directions corrigées et vos systèmes montés.
        </p>

        <dl className="mt-5 grid gap-x-8 gap-y-3 border-y border-rule py-4 sm:grid-cols-3">
          {[
            { k: 'Techniques suivies', v: `${dex.stats.mastered + dex.stats.learning} sur ${dex.stats.total}` },
            { k: 'Directions corrigées', v: corrigees || 'aucune' },
            { k: 'Systèmes montés', v: systemes.retouchees || 'aucun' },
          ].map(({ k, v }) => (
            <div key={k} className="min-w-0">
              <dt className="annot text-faint">{k}</dt>
              <dd className="mt-1 text-[13.5px] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => (
              exportProgress({ progress: dex.progress, profil, systemes: systemes.etat }),
              onNotify('Carnet exporté')
            )}
            className="bg-signal px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-field transition hover:brightness-110"
          >
            Exporter le carnet
          </button>
          <button
            onClick={() => fichier.current?.click()}
            className="annot border border-ink px-4 py-3 transition hover:bg-ink hover:text-field"
          >
            Restaurer depuis un fichier
          </button>
          <input
            ref={fichier}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void restaurer(f)
              e.target.value = ''
            }}
          />
        </div>
        <p className="annot mt-3 max-w-xl leading-relaxed text-faint">
          Une restauration remplace le carnet en place. Exportez d'abord si vous tenez à l'état actuel.
        </p>
      </div>

      {/* ── Effacement ── */}
      <div className="mt-14">
        <SectionHead title="Tout effacer" jp="消去" />
        <p className="max-w-xl text-[13.5px] leading-relaxed text-soft">
          Efface la progression, les échéances de révision et les tokui-waza. La garde, les directions corrigées et les
          systèmes sont conservés : ce sont des réglages, pas des acquis.
        </p>
        <button
          onClick={() => {
            if (!window.confirm('Effacer toute votre progression ? Cette action est définitive.')) return
            dex.resetProgress()
            onNotify('Progression effacée')
          }}
          className="annot mt-4 border border-signal px-4 py-3 text-signal transition hover:bg-signal hover:text-field"
        >
          Effacer ma progression
        </button>
      </div>

      <p className="annot mt-14 border-t border-rule pt-5 text-faint">
        Aucune donnée ne quitte votre appareil · 設定
      </p>
    </div>
  )
}
