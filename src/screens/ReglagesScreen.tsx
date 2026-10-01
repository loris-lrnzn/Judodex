import { useCallback, useRef, useState } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { useProfil } from '../hooks/useProfil'
import { useMonJudo } from '../hooks/useMonJudo'
import { normaliser } from '../lib/monjudo'
import { Link } from '../components/Link'
import { SectionHead } from '../components/SectionHead'
import { exportProgress, importProgress } from '../lib/backup'
import { A_CONFIRMER, DIRECTIONS, DIRECTION_OF, directionDe, type Direction } from '../lib/secteurs'
import { GARDES } from '../lib/situations'
import { Surtitre } from '../components/Surtitre'
import { derniereSauvegarde, dite } from '../lib/sauvegarde'

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
  const connue = useCallback((s: string) => dex.bySlug.has(s), [dex.bySlug])
  const monJudo = useMonJudo(connue)
  const fichier = useRef<HTMLInputElement>(null)
  const [filtre, setFiltre] = useState(false)
  const [derniere, setDerniere] = useState(derniereSauvegarde)

  const corrigees = Object.keys(profil.corrections).length

  const restaurer = async (f: File) => {
    try {
      const { progress, profil: p, monJudo: m } = await importProgress(f, connue)
      dex.replaceProgress(progress)
      if (p) profil.remplacer(p)
      if (m) monJudo.remplacer(normaliser(m, connue))
      onNotify(p || m ? 'Carnet restauré' : 'Progression restaurée')
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Import impossible')
    }
  }

  const liste = filtre ? A_CONFIRMER.filter((slug) => slug in profil.corrections) : A_CONFIRMER

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      {/* ── En-tête ── */}
      <div className="max-w-3xl pt-12 sm:pt-20">
        <Surtitre className="monte">Ton carnet</Surtitre>
        <h1 className="display monte mt-5" style={{ '--d': '80ms' } as React.CSSProperties}>Réglages</h1>
        <p className="monte mt-5 max-w-xl text-[16px] leading-[1.7] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
          Ce que l'application doit savoir de toi pour lire ton judo, et de quoi emporter le carnet ailleurs. Tout
          reste dans ce navigateur : rien n'est envoyé nulle part.
        </p>
      </div>


      {/* Quatre sections et une longue liste : à partir du bureau, un sommaire
          reste sous les yeux, et la liste des directions se range sur deux
          colonnes au lieu de dérouler trente-cinq lignes. */}
      <div className="lg:grid lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-x-16">
        <nav aria-label="Sections des réglages" className="hidden lg:block">
          <ul className="sticky top-24 mt-14 space-y-1 border-l border-rule">
            {[
              ['garde', 'Ta garde'],
              ['directions', 'Directions'],
              ['sauvegarde', 'Sauvegarde'],
              ['effacer', 'Tout effacer'],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[14px] text-faint transition-colors hover:border-ink hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-4xl">
      {/* ── Garde ── */}
      <div id="garde" className="mt-12 scroll-mt-24">
        <SectionHead title="Ta garde" />
        <p className="mb-4 max-w-xl text-[14px] leading-relaxed text-soft">
          Elle renverse la lecture des coins en miroir : un gaucher ne fait pas tomber du même côté. C'est la même
          garde que la première étape de Mon judo ; la changer ici change ta carte.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-edge">
            {(['droite', 'gauche'] as const).map((g) => (
              <button
                key={g}
                onClick={() => monJudo.setGarde(g)}
                aria-pressed={monJudo.mj.garde === g}
                className={`min-h-11 px-4 text-[13px] capitalize transition sm:min-h-0 sm:py-2.5 ${
                  monJudo.mj.garde === g ? 'bg-ink text-field' : 'text-soft hover:text-ink'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <p className="annot min-w-0 flex-1 text-faint">
            {monJudo.mj.garde === 'droite' ? 'Lecture pour un droitier.' : 'Lecture renversée pour un gaucher.'}
          </p>
        </div>
        <p className="annot mt-3 max-w-xl leading-relaxed text-faint">
          À ne pas confondre avec la garde relative des entrées ({GARDES.map((g) => g.label.toLowerCase()).join(', ')}) :
          celle-là décrit une opposition entre deux judokas, celle-ci te décrit toi.
        </p>
      </div>

      {/* ── Directions ── */}
      <div id="directions" className="mt-14 scroll-mt-24">
        <SectionHead title="Directions des projections" aside={corrigees ? `${corrigees} corrigées` : undefined} />
        <p className="max-w-xl text-[14px] leading-relaxed text-soft">
          La direction d'une projection dépend de la forme enseignée. {A_CONFIRMER.length} des{' '}
          {Object.keys(DIRECTION_OF).length} projections du catalogue admettent plusieurs lectures : si ton club en
          enseigne une autre, corrige-la ici, et les coins de ta carte suivront. Les autres, celles dont la direction ne fait
          pas débat, ne sont pas proposées.
        </p>
        {monJudo.mj.garde === 'gauche' && (
          <p className="annot mt-2 max-w-xl leading-relaxed text-faint">
            Les directions se saisissent toujours en garde droite. La rose les renverse ensuite pour ta garde.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {corrigees > 0 && (
            <>
              <button
                onClick={() => setFiltre((v) => !v)}
                aria-pressed={filtre}
                className={`border px-3 py-2 transition ${
                  filtre ? 'border-signal bg-signal text-field' : 'border-edge hover:border-ink'
                } text-[14px] font-medium`}
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

        <ul className="mt-5 grid gap-x-12 border-b border-rule/60 md:grid-cols-2">
          {liste.map((slug) => {
            const t = dex.bySlug.get(slug)
            if (!t) return null
            const courante = directionDe(slug, 'droite', profil.corrections)!
            const corrigee = slug in profil.corrections
            return (
              <li key={slug} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule/60 py-2.5">
                <Link
                  to={{ name: 'technique', slug }}
                  className="-my-2 min-w-0 flex-1 truncate py-3.5 text-[14px] transition-colors hover:text-signal"
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
                  className="h-10 shrink-0 border border-edge bg-plate px-2 text-[13px] text-ink sm:h-8"
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
      <div id="sauvegarde" className="mt-14 scroll-mt-24">
        <SectionHead title="Sauvegarde" />
        <p className="max-w-xl text-[14px] leading-relaxed text-soft">
          Le carnet vit dans ce navigateur seul. Un fichier exporté emporte tout : les techniques acquises et leurs
          échéances de révision, tes directions corrigées et ta carte de Mon judo.
        </p>

        <dl className="mt-5 grid gap-x-8 gap-y-3 border-y border-rule py-4 sm:grid-cols-3">
          {[
            { k: 'Techniques suivies', v: `${dex.stats.mastered + dex.stats.learning} sur ${dex.stats.total}` },
            { k: 'Directions corrigées', v: corrigees || 'aucune' },
            { k: 'Mon judo', v: monJudo.mj.tokui ? dex.bySlug.get(monJudo.mj.tokui)?.name ?? '—' : 'à construire' },
          ].map(({ k, v }) => (
            <div key={k} className="min-w-0">
              <dt className="annot text-faint">{k}</dt>
              <dd className="mt-1 text-[14px] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => (
              exportProgress({ progress: dex.progress, profil, monJudo: monJudo.mj }),
              setDerniere(derniereSauvegarde()),
              onNotify('Carnet exporté')
            )}
            className="bg-signal px-5 py-3 text-[15px] font-semibold text-field transition hover:brightness-110"
          >
            Exporter le carnet
          </button>
          <button
            onClick={() => fichier.current?.click()}
            className="border border-edge px-4 py-3 transition hover:border-ink text-[14px] font-medium"
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
          Une restauration remplace le carnet en place. Exporte d'abord si tu tiens à l'état actuel.
        </p>
        <p className="annot mt-1 text-faint">Dernière sauvegarde : {dite(derniere)}</p>
      </div>

      {/* ── Effacement ── */}
      <div id="effacer" className="mt-14 scroll-mt-24">
        <SectionHead title="Tout effacer" />
        <p className="max-w-xl text-[14px] leading-relaxed text-soft">
          Efface la progression, les échéances de révision et les tokui-waza. La garde, les directions corrigées et les
          systèmes sont conservés : ce sont des réglages, pas des acquis.
        </p>
        <button
          onClick={() => {
            if (!window.confirm('Effacer toute ta progression ? Cette action est définitive.')) return
            dex.resetProgress()
            onNotify('Progression effacée')
          }}
          className="annot mt-4 border border-signal px-4 py-3 text-signal transition hover:bg-signal hover:text-field"
        >
          Effacer ma progression
        </button>
      </div>

      <p className="annot mt-14 border-t border-rule pt-5 text-faint">
        Aucune donnée ne quitte ton appareil · 設定
      </p>
            </div>
      </div>
    </div>
  )
}
