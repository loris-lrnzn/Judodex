interface Props {
  value: number
  total: number
  size?: number
}

/**
 * La progression lue comme un angle. Le rapporteur reste lisible à zéro :
 * l'arc de référence est tracé plein, l'aiguille se pose à l'origine et le
 * relevé central affiche la part accomplie, pas un décompte.
 */
export function Protractor({ value, total, size = 210 }: Props) {
  const pct = total ? value / total : 0
  const SWEEP = 270
  const START = 135
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 26

  const polar = (deg: number, radius: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
  }

  const arc = (fromDeg: number, sweepDeg: number, radius: number) => {
    const [x1, y1] = polar(fromDeg, radius)
    const [x2, y2] = polar(fromDeg + sweepDeg, radius)
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius} ${radius} 0 ${sweepDeg > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }

  const ticks = Array.from({ length: SWEEP / 15 + 1 }, (_, i) => i * 15)
  const needle = START + SWEEP * pct
  const [nx, ny] = polar(needle, r)
  const [ox, oy] = polar(needle, r - 16)

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${value} techniques acquises sur ${total}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: size }}
    >
      {/* Graduations */}
      {ticks.map((t) => {
        const major = t % 45 === 0
        const [x1, y1] = polar(START + t, r + 4)
        const [x2, y2] = polar(START + t, r + (major ? 13 : 9))
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-rule)" strokeWidth={major ? 1.6 : 0.9} />
      })}

      {/* Arc de référence, puis part accomplie */}
      <path d={arc(START, SWEEP, r)} fill="none" stroke="var(--c-rule)" strokeWidth="2" />
      {pct > 0 && <path d={arc(START, SWEEP * pct, r)} fill="none" stroke="var(--c-signal)" strokeWidth="7" strokeLinecap="butt" />}

      {/* Aiguille, posée sur l'arc */}
      <line x1={ox} y1={oy} x2={nx} y2={ny} stroke="var(--c-ink)" strokeWidth="1.6" />
      <circle cx={nx} cy={ny} r="3.4" fill="var(--c-ink)" />

      {/* Relevé */}
      <text x={cx} y={cy + 4} textAnchor="middle" className="font-mono" fontSize="40" fontWeight="600" fill="var(--c-ink)">
        {Math.round(pct * 100)}
        <tspan fontSize="18" dy="-14">
          %
        </tspan>
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" className="font-mono" fontSize="9.5" letterSpacing="1.6" fill="var(--c-faint)">
        ACQUISES
      </text>
    </svg>
  )
}
