import { useEffect, useRef } from 'react'
import { ETAPES, indexEtape, type EtapeId } from '../../hooks/useParcours'

interface Props {
  courante: EtapeId
  vue: (id: EtapeId) => boolean
  aller: (id: EtapeId) => void
}

/**
 * Le fil du parcours : cinq crans, l'un après l'autre.
 *
 * Il ne verrouille rien — on peut sauter à la fin dès le premier jour — mais
 * il dit dans quel ordre les questions s'appellent, et où l'on en est. C'est
 * la seule chose qui manquait vraiment à une page qui répondait à six
 * questions à la fois sans en poser aucune.
 */
export function FilParcours({ courante, vue, aller }: Props) {
  const i = indexEtape(courante)
  const rail = useRef<HTMLOListElement>(null)

  /* Sur un écran étroit, les cinq crans ne tiennent pas de front : le fil
     défile, et le cran courant vient se ranger sous le pouce de lui-même
     plutôt que d'attendre hors champ. */
  useEffect(() => {
    const el = rail.current?.querySelector('[aria-current="step"]')
    el?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [courante])

  return (
    <nav aria-label="Étapes du bilan" className="border-y border-rule">
      <ol ref={rail} className="rail-x flex min-w-0 overflow-x-auto">
        {ETAPES.map((e, n) => {
          const active = e.id === courante
          const faite = vue(e.id) && !active
          return (
            <li key={e.id} className="shrink-0 sm:min-w-0 sm:flex-1">
              <button
                onClick={() => aller(e.id)}
                aria-current={active ? 'step' : undefined}
                className={`group relative flex h-11 w-full min-w-0 items-center gap-2 pr-5 text-left sm:pr-3 transition-colors ${
                  active ? 'text-ink' : faite ? 'text-soft hover:text-ink' : 'text-faint hover:text-soft'
                }`}
              >
                <span className={`annot shrink-0 tabular-nums ${active ? 'text-signal' : ''}`}>
                  {faite ? '✓' : n + 1}
                </span>
                <span className="min-w-0 whitespace-nowrap text-[12.5px] font-medium sm:truncate">{e.titre}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-[3px] transition-transform duration-200 ${
                    active ? 'scale-x-100 bg-signal' : faite ? 'scale-x-100 bg-rule' : 'scale-x-0 bg-rule group-hover:scale-x-100'
                  }`}
                  style={{ transformOrigin: 'left' }}
                />
              </button>
            </li>
          )
        })}
      </ol>
      <p className="sr-only">
        Étape {i + 1} sur {ETAPES.length}
      </p>
    </nav>
  )
}
