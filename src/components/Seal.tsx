/**
 * Tampon de contrôle : la marque d'une technique validée. Carré, gravé,
 * apposé de travers comme un cachet de visa sur une planche.
 */
export function Seal({ size = 32, animate = false, char = '可' }: { size?: number; animate?: boolean; char?: string }) {
  return (
    <span
      aria-hidden
      title="Technique acquise"
      className={`relative grid shrink-0 place-items-center ${animate ? 'stamp-in' : 'tilt'}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 border-2 border-signal" />
      <span className="absolute inset-[3px] border border-signal opacity-45" />
      <span className="font-jp relative font-bold leading-none text-signal" style={{ fontSize: size * 0.5 }}>
        {char}
      </span>
    </span>
  )
}
