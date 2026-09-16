import { memo } from 'react'
import type { ProgressEntry, Technique } from '../types/judodex'
import { familyVars, kanjiSize } from '../lib/families'
import { Seal } from './Seal'
import { Link } from './Link'
import { BeltMark } from './BeltMark'
import type { BeltId } from '../lib/belts'

interface Props {
  technique: Technique
  number: number
  progress: ProgressEntry
  belt: BeltId | null
}

/**
 * Fiche de relevé. Le kanji est le spécimen, posé hors d'axe : le judo
 * commence par le déséquilibre. Le glyphe de mouvement annote la mécanique,
 * la ligne de cote mesure l'avancement.
 */
export const TechniqueCard = memo(function TechniqueCard({ technique: t, number, progress, belt }: Props) {
  const mastered = progress.mastery === 'mastered'
  const learning = progress.mastery === 'learning'

  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="card-cv group relative flex h-[196px] flex-col overflow-hidden bg-plate px-3 pb-2.5 pt-2 transition-colors duration-150 hover:bg-ink"
    >
      {/* Ligne d'annotation */}
      <div className="relative z-10 flex items-start justify-between">
        <span className="annot text-faint transition-colors group-hover:text-field/55">{String(number).padStart(3, '0')}</span>
        <span className="flex items-center gap-2">
          {progress.tokui && (
            <span className="annot text-signal transition-colors group-hover:text-field" title="Technique de prédilection">
              Tokui
            </span>
          )}
          <BeltMark belt={belt} />
        </span>
      </div>

      {/* Spécimen. Le cachet se tient à droite du glyphe, à mi-hauteur : dans le
          coin, il se posait sur la bande de ceinture. */}
      <div className="relative flex flex-1 items-center">
        <span
          className={`font-jp vector-push select-none whitespace-nowrap leading-[0.9] text-(--fam) transition-colors group-hover:text-(--fam-hi) ${mastered ? 'pr-9' : ''}`}
          style={{ fontSize: kanjiSize(t.kanji), opacity: mastered ? 1 : learning ? 0.92 : 0.72 }}
        >
          {t.kanji}
        </span>
        {mastered && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2">
            <Seal size={26} />
          </span>
        )}
      </div>

      {/* Désignation */}
      <div className="relative z-10">
        <h3 className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] transition-colors group-hover:text-field">{t.name}</h3>
        <p className="truncate text-[11px] text-faint transition-colors group-hover:text-field/60">{t.translation}</p>

        {/* Ligne de cote : l'avancement, mesuré. Elle vire au blanc sur fond encré. */}
        <div className="dimension mt-2.5">
          <span
            className="absolute left-0 top-0 h-px bg-signal transition-all duration-500 group-hover:bg-field"
            style={{ width: mastered ? '100%' : learning ? '45%' : '0%' }}
          />
        </div>
      </div>
    </Link>
  )
})
