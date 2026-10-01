import { useState } from 'react'
import { YouTubeFacade } from './YouTubeFacade'
import type { Technique } from '../types/judodex'

const SOURCES = {
  kodokan: { label: 'Kodokan', hint: 'La référence japonaise' },
  ffjudo: { label: 'France Judo', hint: 'La démonstration fédérale' },
} as const

type SourceId = keyof typeof SOURCES

/**
 * Démonstration de la technique. Deux sources existent souvent : le Kodokan
 * et la fédération française. On les propose côte à côte plutôt que d'en
 * imposer une, et on n'affiche que celles qui existent.
 */
export function DemoPlayer({ technique: t, fallback }: { technique: Technique; fallback: React.ReactNode }) {
  const available = ([] as SourceId[]).concat(t.youtubeId ? ['kodokan'] : [], t.ffjudoId ? ['ffjudo'] : [])
  const [source, setSource] = useState<SourceId | null>(available[0] ?? null)

  if (!source) {
    return (
      <>
        <div className="grid aspect-video place-items-center overflow-hidden bg-plate">{fallback}</div>
        <p className="mt-3 text-[13px] text-faint">Aucune démonstration filmée disponible.</p>
      </>
    )
  }

  const id = source === 'kodokan' ? t.youtubeId! : t.ffjudoId!

  return (
    <>
      <YouTubeFacade key={id} id={id} title={`${t.name} — démonstration ${SOURCES[source].label}`} bare priorite />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {available.length > 1 ? (
          <div className="flex gap-1" role="group" aria-label="Source de la démonstration">
            {available.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                aria-pressed={source === s}
                className={`tap inline-flex h-8 items-center px-2.5 font-medium transition ${
                  source === s ? 'bg-ink text-field' : 'text-soft hover:text-ink'
                }`}
              >
                {SOURCES[s].label}
              </button>
            ))}
          </div>
        ) : (
          <span className="font-medium text-soft">{SOURCES[source].label}</span>
        )}
        <span className="text-faint">{SOURCES[source].hint}</span>
      </div>
    </>
  )
}
