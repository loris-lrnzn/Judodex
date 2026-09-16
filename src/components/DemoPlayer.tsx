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
        <div className="plate grid aspect-video place-items-center overflow-hidden">{fallback}</div>
        <p className="annot mt-2 text-faint">Aucune démonstration filmée disponible</p>
      </>
    )
  }

  const id = source === 'kodokan' ? t.youtubeId! : t.ffjudoId!

  return (
    <>
      <YouTubeFacade key={id} id={id} title={`${t.name} — démonstration ${SOURCES[source].label}`} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {available.length > 1 ? (
          <div className="flex items-stretch">
            {available.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                aria-pressed={source === s}
                className={`tap annot -ml-px inline-flex items-center border px-2.5 py-1.5 transition first:ml-0 ${
                  source === s ? 'z-10 border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
                }`}
              >
                {SOURCES[s].label}
              </button>
            ))}
          </div>
        ) : (
          <span className="annot text-faint">{SOURCES[source].label}</span>
        )}
        <span className="annot text-faint">{SOURCES[source].hint}</span>
      </div>
    </>
  )
}
