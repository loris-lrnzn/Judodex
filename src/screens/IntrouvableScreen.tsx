import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'

/**
 * L'adresse ne mène nulle part.
 *
 * Servir l'accueil à sa place, comme le faisait le routeur, cache la faute :
 * on croit avoir ouvert la bonne page, l'URL reste fausse, et un moteur de
 * recherche indexe l'accueil sous cent adresses différentes. On le dit, et on
 * remet en route.
 */
export function IntrouvableScreen({ path }: { path: string }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-16 sm:px-7">
      <div>
        <Surtitre>Erreur 404</Surtitre>
        <h1 className="display mt-5">Cette page n'existe pas.</h1>

        <p className="mt-5 max-w-lg text-[15px] leading-[1.7] text-soft">
          Rien ne répond à l'adresse <code className="bg-plate px-1 font-mono text-[14px] text-ink">{path}</code>. Elle a peut-être
          été mal recopiée, ou la fiche qu'elle désignait a changé de nom.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            to={{ name: 'browse' }}
            className="tap inline-flex items-center justify-center bg-ink px-5 py-3 text-center text-[15px] font-semibold text-field transition hover:bg-soft"
          >
            Ouvrir le catalogue
          </Link>
          <Link
            to={{ name: 'home' }}
            className="tap inline-flex items-center justify-center border border-edge px-5 py-3 text-center transition hover:border-ink text-[14px] font-medium"
          >
            Revenir au carnet
          </Link>
        </div>
      </div>
    </div>
  )
}
