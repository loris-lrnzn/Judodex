import { DIRECTIONS, SECTEURS, directionMeta, type Direction, type Secteur } from '../lib/secteurs'

interface Props {
  /** Nombre de techniques du répertoire par direction. */
  repertoire: Record<Direction, number>
  /** Nombre de tokui-waza par direction, inclus dans le répertoire. */
  tokui: Record<Direction, number>
  /** Secteur mis en avant, au survol d'une carte. */
  actif?: Secteur | null
  /** Secteur dont la liste est ouverte, pour le marquer sur la planche. */
  ouvert?: Secteur | null
  /** Ouvre un quartier : c'est là qu'on ajoute et retire ses techniques. */
  onChoisir?: (s: Secteur) => void
  size?: number
}

/**
 * Le plan est vu depuis tori : il se tient en bas, uke lui fait face au-dessus.
 * Les directions sont stockées dans le repère de uke — son avant, sa droite —
 * et la vue les fait donc pivoter d'un demi-tour. L'avant de uke, celui où il
 * tombe quand on le projette vers l'avant, pointe alors vers tori ; et la
 * droite de uke, qui fait face à tori, se lit à gauche de la planche.
 */
const VUE_DEPUIS_TORI = 180

/** Hauteur réservée à tori, sous la rose. */
const SOCLE = 48

/** Silhouette de tori, en bas de planche, tournée vers uke. */
function Tori({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="-30" y1="0" x2="30" y2="0" stroke="var(--c-rule)" strokeWidth="0.8" />
      <circle cx="0" cy="-11" r="8" fill="var(--c-field)" stroke="var(--c-rule)" strokeWidth="0.8" />
      <text x="0" y="-7" textAnchor="middle" className="font-jp" fontSize="10.5" fill="var(--c-faint)">
        取
      </text>
    </g>
  )
}

export function RoseSecteurs({ repertoire, tokui, actif = null, ouvert = null, onChoisir, size = 300 }: Props) {
  const c = size / 2
  const rMin = size * 0.11
  const rMax = size * 0.4
  const max = Math.max(1, ...DIRECTIONS.map((d) => repertoire[d.id]))

  const polar = (deg: number, radius: number) => {
    const a = ((deg + VUE_DEPUIS_TORI - 90) * Math.PI) / 180
    return [c + radius * Math.cos(a), c + radius * Math.sin(a)] as const
  }

  const rayon = (n: number) => (n === 0 ? rMin : rMin + (rMax - rMin) * (n / max))

  /** Quartier de 90° centré sur le coin d'un secteur. */
  const wedge = (deg: number, radius: number) => {
    const [x1, y1] = polar(deg - 45, radius)
    const [x2, y2] = polar(deg + 45, radius)
    return `M${c} ${c} L${x1.toFixed(1)} ${y1.toFixed(1)} A${radius} ${radius} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
  }

  const couvert = (s: Secteur) => repertoire[s] > 0

  return (
    <svg
      viewBox={`0 0 ${size} ${size + SOCLE}`}
      role="img"
      aria-label="Rose des secteurs de chute, vue depuis tori"
      className="h-auto w-full"
      style={{ maxWidth: size }}
    >
      <defs>
        <pattern id="rose-vide" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-rule)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Quartiers : les quatre secteurs de chute. Un secteur vide est hachuré.
          Chacun s'ouvre d'un clic sur la liste des projections qui y tombent,
          pour qu'on remplisse son répertoire là où on lit qu'il manque. */}
      {SECTEURS.map((s) => {
        const meta = directionMeta(s)
        const marque = ouvert === s || actif === s
        return (
          <path
            key={s}
            className={onChoisir ? 'rose-secteur' : undefined}
            d={wedge(meta.angle, rMax + 6)}
            fill={couvert(s) ? 'var(--c-plate)' : 'url(#rose-vide)'}
            stroke={ouvert === s ? 'var(--c-ink)' : marque ? 'var(--c-signal)' : 'var(--c-rule)'}
            strokeWidth={marque ? 1.8 : 0.8}
            {...(onChoisir && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `${meta.label} — ${repertoire[s]} projection${repertoire[s] > 1 ? 's' : ''}, ouvrir la liste`,
              'aria-expanded': ouvert === s,
              style: { cursor: 'pointer' },
              onClick: () => onChoisir(s),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChoisir(s)
                }
              },
            })}
          >
            <title>{`${meta.label} · ${repertoire[s]} projection${repertoire[s] > 1 ? 's' : ''}`}</title>
          </path>
        )
      })}

      {/* Le « + » de chaque quartier : sans lui, rien ne dit que la planche se
          clique. Posé à mi-rayon sur la bissectrice, il ne croise ni les
          rayons ni les relevés chiffrés du bord. */}
      {onChoisir &&
        SECTEURS.map((s) => {
          const [x, y] = polar(directionMeta(s).angle, (rMin + rMax) / 2 + 14)
          return (
            <text
              key={`plus-${s}`}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="13"
              className="pointer-events-none"
              fill={ouvert === s || actif === s ? 'var(--c-signal)' : 'var(--c-faint)'}
            >
              +
            </text>
          )
        })}

      {/* Cercles de repère */}
      {[rMin, (rMin + rMax) / 2, rMax].map((r) => (
        <circle key={r} cx={c} cy={c} r={r} fill="none" stroke="var(--c-rule)" strokeWidth="0.7" strokeDasharray="2 3" />
      ))}

      {/* Rayons */}
      {DIRECTIONS.map((d) => {
        const n = repertoire[d.id]
        const t = tokui[d.id]
        const coin = d.secteur !== null
        const [x0, y0] = polar(d.angle, rMin)
        const [x1, y1] = polar(d.angle, rayon(n))
        const [xt, yt] = polar(d.angle, rayon(t))
        return (
          <g key={d.id}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={n > 0 ? 'var(--c-ink)' : 'var(--c-rule)'} strokeWidth={coin ? 2 : 1} />
            {t > 0 && <line x1={x0} y1={y0} x2={xt} y2={yt} stroke="var(--c-signal)" strokeWidth={coin ? 6 : 3} />}
            {n > 0 && <circle cx={x1} cy={y1} r={coin ? 3 : 2} fill="var(--c-ink)" />}
          </g>
        )
      })}

      {/* Relevés chiffrés aux quatre coins */}
      {SECTEURS.map((s) => {
        const [x, y] = polar(directionMeta(s).angle, rMax + 20)
        return (
          <g key={`n-${s}`}>
            <title>{`${directionMeta(s).label} · ${repertoire[s]} projection${repertoire[s] > 1 ? 's' : ''}`}</title>
            <text
              x={x}
              y={y - 2}
              textAnchor="middle"
              className="font-mono"
              fontSize="16"
              fontWeight="600"
              fill={couvert(s) ? 'var(--c-ink)' : 'var(--c-faint)'}
            >
              {repertoire[s]}
            </text>
            <text x={x} y={y + 10} textAnchor="middle" className="font-mono" fontSize="8" letterSpacing="1.2" fill="var(--c-faint)">
              {directionMeta(s).court}
            </text>
          </g>
        )
      })}

      {/* Uke au centre. */}
      <circle cx={c} cy={c} r={rMin - 6} fill="var(--c-field)" stroke="var(--c-rule)" strokeWidth="0.8" />
      <text x={c} y={c + 5} textAnchor="middle" className="font-jp" fontSize="15" fill="var(--c-faint)">
        受
      </text>

      {/* Ligne de confrontation : elle dit qui regarde qui, hors de la rose
          pour ne pas se confondre avec le rayon « avant ». */}
      <line
        x1={c}
        y1={c + rMax + 8}
        x2={c}
        y2={size + SOCLE - 32}
        stroke="var(--c-rule)"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />
      <path d={`M${c} ${c + rMax + 10} l-3.5 -6 h7 Z`} fill="var(--c-faint)" />

      {/* Tori, en bas de planche. */}
      <Tori x={c} y={size + SOCLE - 8} />
    </svg>
  )
}
