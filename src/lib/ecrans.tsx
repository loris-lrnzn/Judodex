import { lazy, type ComponentType } from 'react'

/**
 * Un écran chargé à la demande, qui ne fait pas clignoter la page quand son
 * code est déjà là.
 *
 * `React.lazy` suspend au premier rendu dès que sa fabrique renvoie une vraie
 * promesse, même résolue : le rappel ne part qu'au tour suivant. Au démarrage,
 * la page prérendue disparaissait donc derrière « Chargement… » le temps d'un
 * rendu, puis revenait : un décalage de mise en page de 0,49, mesuré sur la
 * fiche, le dojo et Mon judo. React lit pourtant la fabrique de façon
 * synchrone si l'objet qu'elle renvoie appelle son rappel tout de suite : une
 * fois le module préchargé, on lui en donne un.
 */
export interface Ecran<P extends object> extends React.LazyExoticComponent<ComponentType<P>> {
  /** Lance le chargement et le rend au plus tôt ; la promesse est celle du module. */
  precharger: () => Promise<unknown>
}

export function ecran<P extends object>(importer: () => Promise<ComponentType<P>>): Ecran<P> {
  let charge: ComponentType<P> | null = null
  let promesse: Promise<ComponentType<P>> | null = null

  const precharger = () => {
    promesse ??= importer().then(
      (composant) => (charge = composant),
      (erreur) => {
        promesse = null // un nouvel essai repartira de zéro
        throw erreur
      },
    )
    return promesse
  }

  const Ecran = lazy(() => {
    if (charge) {
      const deja = charge
      const synchrone = { then: (rappel: (m: { default: ComponentType<P> }) => void) => (rappel({ default: deja }), synchrone) }
      return synchrone as unknown as Promise<{ default: ComponentType<P> }>
    }
    return precharger().then((composant) => ({ default: composant }))
  }) as Ecran<P>
  Ecran.precharger = precharger
  return Ecran
}
