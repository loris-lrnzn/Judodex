import { ETAPES, etapeMeta, indexEtape, type EtapeId } from '../../hooks/useParcours'

interface Props {
  id: EtapeId
  /** Ce que l'étape affiche à droite de son titre, quand elle a un compte à donner. */
  compte?: React.ReactNode
  onPrecedente: () => void
  onSuivante: () => void
  /** Intitulé du bouton d'avancement, quand « Suivant » ne dit pas assez. */
  suivant?: string
  children: React.ReactNode
}

/**
 * Le cadre d'une étape : sa question, ce qu'elle sert à établir, son contenu,
 * et de quoi passer à la suivante. Une question par écran, posée en toutes
 * lettres — le bilan se lisait jusqu'ici comme un relevé, sans jamais rien
 * demander à personne.
 */
export function Etape({ id, compte, onPrecedente, onSuivante, suivant, children }: Props) {
  const meta = etapeMeta(id)
  const i = indexEtape(id)
  const dernier = i === ETAPES.length - 1

  return (
    <section aria-labelledby={`etape-${id}`} className="pt-10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="annot text-signal tabular-nums">
          Étape {i + 1} / {ETAPES.length}
        </span>
        <span className="font-jp text-[13px] text-faint">{meta.jp}</span>
        {compte && <span className="annot ml-auto text-faint">{compte}</span>}
      </div>

      <h1 id={`etape-${id}`} className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[38px]">
        {meta.question}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-soft">{meta.but}</p>

      <div className="mt-8">{children}</div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-rule pt-5">
        {i > 0 && (
          <button
            onClick={onPrecedente}
            className="tap annot inline-flex items-center border border-edge px-3 py-2.5 text-soft transition hover:border-ink hover:text-ink"
          >
            ← Retour
          </button>
        )}
        {!dernier && (
          <button
            onClick={onSuivante}
            className="ml-auto bg-signal px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-field transition hover:brightness-110"
          >
            {suivant ?? 'Continuer'} →
          </button>
        )}
      </div>
    </section>
  )
}
