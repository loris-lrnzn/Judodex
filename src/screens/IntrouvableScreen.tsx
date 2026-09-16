import { Link } from '../components/Link'

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
      <div className="plate grid-paper p-5 sm:p-10">
        <span className="annot border border-ink px-1.5 py-1 leading-none">Erreur 404</span>

        <h1 className="display mt-5">
          Cette page
          <br />
          n'existe pas.
        </h1>

        <div className="mt-5 flex items-center gap-3">
          <span className="dimension w-28" />
          <span className="annot text-faint">迷子 · HORS PLANCHE</span>
        </div>

        <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-soft">
          Rien ne répond à l'adresse <code className="font-mono text-[13.5px] text-ink">{path}</code>. Elle a peut-être
          été mal recopiée, ou la fiche qu'elle désignait a changé de nom.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            to={{ name: 'browse' }}
            className="tap annot inline-flex items-center justify-center bg-ink px-5 py-3 text-center text-field transition hover:bg-blue"
          >
            Ouvrir le catalogue →
          </Link>
          <Link
            to={{ name: 'home' }}
            className="tap annot inline-flex items-center justify-center border border-ink px-5 py-3 text-center transition hover:bg-ink hover:text-field"
          >
            Revenir au carnet
          </Link>
        </div>
      </div>
    </div>
  )
}
