import type { useProfil } from '../../hooks/useProfil'
import { RoseSecteurs } from '../RoseSecteurs'
import { DIRECTIONS, directionMeta, type Direction } from '../../lib/secteurs'

/**
 * La première question, et la plus simple : droitier ou gaucher.
 *
 * Elle ouvre le parcours parce qu'elle renverse tout ce qui suit, et parce
 * qu'un premier écran auquel on répond d'un clic vaut mieux qu'un premier
 * écran qu'on subit.
 */
export function EtapeGarde({ profil }: { profil: ReturnType<typeof useProfil> }) {
  // Une rose de démonstration : deux attaques posées dans les coins avant, pour
  // qu'on voie la bascule opérer au moment où l'on choisit.
  const exemple = Object.fromEntries(DIRECTIONS.map((d) => [d.id, 0])) as Record<Direction, number>
  const demo = { ...exemple, [profil.garde === 'droite' ? 'av-d' : 'av-g']: 3, [profil.garde === 'droite' ? 'ar-d' : 'ar-g']: 2 }
  const vide = exemple

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-3">
          {(['droite', 'gauche'] as const).map((g) => (
            <button
              key={g}
              onClick={() => profil.setGarde(g)}
              aria-pressed={profil.garde === g}
              className={`min-w-[9rem] flex-1 border p-4 text-left transition ${
                profil.garde === g ? 'border-signal bg-signal text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
              }`}
            >
              <span className="block text-[17px] font-semibold capitalize leading-none">Garde {g}</span>
              <span className={`annot mt-2 block leading-relaxed ${profil.garde === g ? 'text-field/75' : 'text-faint'}`}>
                {g === 'droite' ? 'Pied droit devant, main droite au revers.' : 'Pied gauche devant, main gauche au revers.'}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-soft">
          Un gaucher ne fait pas tomber uke dans les mêmes coins qu'un droitier. Toute la suite du bilan se lit dans le
          sens que tu choisis ici, et la planche bascule en miroir d'un clic — regarde-la changer à droite.
        </p>
        <p className="annot mt-3 max-w-xl leading-relaxed text-faint">
          Tu peux revenir dessus n'importe quand, ici ou dans les réglages. Rien ne se perd à changer d'avis :
          c'est la même lecture, retournée.
        </p>
      </div>

      <figure className="mx-auto w-full max-w-[260px]">
        <RoseSecteurs repertoire={demo} tokui={vide} size={260} />
        <figcaption className="annot mt-3 text-center leading-relaxed text-faint">
          Exemple, ce n'est pas ton judo : trois attaques en{' '}
          {directionMeta(profil.garde === 'droite' ? 'av-d' : 'av-g').label.toLowerCase()}, deux en{' '}
          {directionMeta(profil.garde === 'droite' ? 'ar-d' : 'ar-g').label.toLowerCase()}.
        </figcaption>
      </figure>
    </div>
  )
}
