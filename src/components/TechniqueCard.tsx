import { memo } from 'react'
import type { ProgressEntry, Technique } from '../types/judodex'
import { familyVars, kanjiSize } from '../lib/families'
import { Seal } from './Seal'
import { Link } from './Link'
import { BeltMark } from './BeltMark'
import type { BeltId } from '../lib/belts'

interface Props {
  technique: Technique
  /** Rang dans le catalogue ; la fiche ne l'affiche plus, mais l'appelant le fournit. */
  number?: number
  progress: ProgressEntry
  belt: BeltId | null
}

/**
 * Carte du catalogue. Le nom se lit d'abord : la plupart des judokas le
 * connaissent en rōmaji, pas en idéogrammes. Le nom japonais, à la teinte de
 * la famille, vient en second ; l'état se dit en toutes lettres ou par le
 * cachet.
 */
export const TechniqueCard = memo(function TechniqueCard({ technique: t, progress, belt }: Props) {
  const mastered = progress.mastery === 'mastered'
  const learning = progress.mastery === 'learning'

  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="card-cv group relative flex h-full min-h-[176px] flex-col overflow-hidden px-4 pb-4 pt-4 transition-colors duration-300 hover:bg-plate"
    >
      {/* Le nom japonais, au corps de la carte : il porte la famille par sa
          teinte et glisse d'un cran au survol, dans le sens du geste. */}
      <span
        lang="ja"
        className="font-jp vector-push block whitespace-nowrap font-bold leading-none text-(--fam)"
        style={{ fontSize: kanjiSize(t.kanji, 'card') }}
      >
        {t.kanji}
      </span>

      <div className="mt-auto pt-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-[15px] font-semibold leading-tight underline-offset-4 [overflow-wrap:anywhere] group-hover:underline">{t.name}</h3>
          <span className="mt-[5px] shrink-0">
            <BeltMark belt={belt} width={20} height={6} />
          </span>
        </div>
        <p className="mt-0.5 text-[13px] leading-snug text-faint">{t.translation}</p>
        {(mastered || learning || progress.tokui) && (
          <p className="mt-2 flex items-center gap-2 text-[12.5px] font-medium">
            {mastered && (
              <>
                <Seal size={18} />
                <span className="text-soft">Acquise</span>
              </>
            )}
            {learning && <span className="text-signal">En cours</span>}
            {progress.tokui && <span className="text-signal" title="Technique de prédilection">Tokui</span>}
          </p>
        )}
      </div>

      {/* Le liseré de la famille, qui se déroule au survol comme le bord
          d'un tapis. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-(--fam) transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </Link>
  )
})
