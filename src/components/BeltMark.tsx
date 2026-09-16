import { BELTS, beltOf, type BeltId } from '../lib/belts'

/** Bande d'obi : la ceinture, avec son nœud, à la couleur du grade. */
export function BeltMark({ belt, width = 26, height = 7 }: { belt: BeltId | null; width?: number; height?: number }) {
  // Hors programme : un trait neutre, pas une ceinture qui n'existe pas.
  if (!belt)
    return (
      <span
        className="inline-block shrink-0 border-t border-dashed border-rule align-middle"
        style={{ width, height }}
        title="Hors progression française"
        aria-label="Hors progression française"
      />
    )
  const b = beltOf(belt)
  return (
    <span
      className="relative inline-block shrink-0 align-middle"
      style={{ width, height, background: b.color, outline: '1px solid var(--c-faint)', outlineOffset: '-1px' }}
      title={`Ceinture ${b.name.toLowerCase()} · ${b.kyu}`}
      aria-label={`Ceinture ${b.name.toLowerCase()}`}
    >
      <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-black/25" />
    </span>
  )
}

/** Échelle des cinq grades, celui atteint étant marqué. */
export function BeltScale({ belt, height = 9 }: { belt: BeltId | null; height?: number }) {
  return (
    <span className="flex items-end gap-[2px]" aria-label={belt ? `Ceinture ${beltOf(belt).name.toLowerCase()}` : "Hors progression"}>
      {BELTS.map((b) => {
        const on = b.id === belt
        return <span key={b.id} className="w-[4px]" style={{ height: on ? height : height * 0.45, background: on ? b.color : 'var(--c-rule)' }} />
      })}
    </span>
  )
}
