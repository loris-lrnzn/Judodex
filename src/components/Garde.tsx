import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  erreur: Error | null
}

/**
 * Ce qui reste debout quand un écran tombe.
 *
 * Deux fautes mènent à la page blanche en production, et aucune des deux n'est
 * hypothétique : une exception dans un écran, et surtout l'échec de chargement
 * d'un morceau de code. Les écrans secondaires arrivent en fragments dont le
 * nom porte une empreinte ; un déploiement pendant qu'un onglet est resté
 * ouvert efface les anciens, et le fragment demandé n'existe plus. Sans garde,
 * l'application disparaît sans un mot.
 *
 * Le remède tient en une phrase : dire ce qui s'est passé, et proposer le
 * rechargement, qui suffit dans le cas du fragment périmé.
 */
export class Garde extends Component<Props, State> {
  state: State = { erreur: null }

  static getDerivedStateFromError(erreur: Error): State {
    return { erreur }
  }

  componentDidCatch(erreur: Error) {
    // Rien à envoyer nulle part : le carnet ne parle à aucun serveur. La
    // console reste le seul endroit où lire ce qui a cassé.
    console.error('Judodex — écran interrompu :', erreur)
  }

  render() {
    if (!this.state.erreur) return this.props.children

    const fragment = /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
      this.state.erreur.message,
    )
    // Un fragment manquant a deux causes, et il ne faut pas les confondre :
    // le réseau absent, ou un déploiement passé par là pendant que l'onglet
    // était resté ouvert. Recharger ne répare que la seconde.
    const horsLigne = fragment && typeof navigator !== 'undefined' && navigator.onLine === false
    const périmé = fragment && !horsLigne

    return (
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-16 sm:px-7">
        <div className="plate grid-paper p-5 sm:p-10">
          <span className="annot border border-signal px-1.5 py-1 leading-none text-signal">Interruption</span>

          <h1 className="display mt-5">
            {horsLigne ? (
              <>
                Cet écran
                <br />
                n'est pas
                <br />
                hors ligne.
              </>
            ) : périmé ? (
              <>
                Le carnet
                <br />
                a été mis à jour.
              </>
            ) : (
              <>
                Quelque chose
                <br />
                s'est cassé.
              </>
            )}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="dimension w-28" />
            <span className="annot text-faint">中断 · INTERRUPTION</span>
          </div>

          <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-soft">
            {horsLigne
              ? "Vous êtes sans réseau et cette partie du carnet n'a pas encore été mise de côté sur l'appareil. Elle sera disponible dès la prochaine ouverture avec du réseau."
              : périmé
                ? "Une nouvelle version est en ligne et cette page travaillait encore sur l'ancienne. Rechargez : rien n'est perdu."
                : "Cet écran n'a pas pu s'afficher. Votre progression est enregistrée dans ce navigateur et n'est pas touchée."}
          </p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="tap annot inline-flex items-center justify-center bg-signal px-5 py-3 text-center text-field transition hover:brightness-110"
            >
              {horsLigne ? 'Réessayer' : 'Recharger le carnet'} →
            </button>
            <a
              href="/"
              className="tap annot inline-flex items-center justify-center border border-ink px-5 py-3 text-center transition hover:bg-ink hover:text-field"
            >
              Revenir à l'accueil
            </a>
          </div>

          <p className="annot mt-8 max-w-lg leading-relaxed text-faint">{this.state.erreur.message}</p>
        </div>
      </div>
    )
  }
}
