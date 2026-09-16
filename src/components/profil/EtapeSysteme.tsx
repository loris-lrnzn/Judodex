import type { Judodex } from '../../hooks/useJudodex'
import type { Bilan } from '../../hooks/useBilan'
import type { useSystemes } from '../../hooks/useSystemes'
import { CarteSysteme, ChoixArmes } from './pieces'
import type { Combination } from '../../types/judodex'

interface Props {
  dex: Judodex
  bilan: Bilan
  systemes: ReturnType<typeof useSystemes>
  carteOuverte: string | null
  onOuvrirCarte: (slug: string | null) => void
  onAjouter: (arme: string, type: Combination['type']) => void
}

/** L'étape où l'on construit : une technique, ce qu'on en fait, ce qu'elle expose. */
export function EtapeSysteme({ dex, bilan, systemes, carteOuverte, onOuvrirCarte, onAjouter }: Props) {
  const { candidates, armes, mesSystemes } = bilan

  if (candidates.length === 0)
    return (
      <p className="border-l-[5px] border-rule bg-plate p-4 text-[14px] leading-relaxed text-soft">
        Aucune de tes techniques n'a d'enchaînement connu : il n'y a rien à construire pour l'instant. Reviens à
        l'étape du répertoire et coche quelques projections de plus.
      </p>
    )

  return (
    <div>
      <p className="mb-6 max-w-2xl text-[14px] leading-relaxed text-soft">
        Uke ne se laisse pas faire. Il bloque, il recule, il te laisse passer dans le vide — et c'est ce que tu fais
        de sa réaction qui distingue un système d'une simple liste de techniques.
      </p>

      {/* Savoir faire une technique et bâtir dessus sont deux choses : ce rang
          n'est que le répertoire, offert au choix. Rien n'y entre de soi-même. */}
      <h3 className="annot mb-1 text-faint">D'abord, sur laquelle bâtis-tu ?</h3>
      <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-faint">
        Voici les techniques de ton répertoire qui portent des enchaînements. Aucune n'est encore dans ton système :
        savoir faire une technique n'est pas la placer. Choisis celles que tu attaques vraiment.
      </p>
      <ChoixArmes candidates={candidates} estArme={systemes.estArme} onBasculer={systemes.basculerArme} />

      {armes.length === 0 ? (
        <p className="mt-6 border-l-[5px] border-signal bg-plate p-4 text-[14px] leading-relaxed text-soft">
          Clique une technique ci-dessus : celle que tu places vraiment, en compétition ou au randori. Sa carte s'ouvre
          juste dessous. Une technique marquée <strong>tokui-waza</strong> sur sa fiche y est d'office.
        </p>
      ) : (
        <>
          <h3 className="annot mb-2.5 mt-8 text-faint">Ensuite, coche ce que tu fais quand il se défend</h3>
          <div className="space-y-4">
            {mesSystemes.map((sys) => (
              <CarteSysteme
                key={sys.arme.slug}
                s={sys}
                tokui={dex.getProgress(sys.arme.slug).tokui}
                ouverte={carteOuverte === sys.arme.slug}
                onOuvrir={() => onOuvrirCarte(carteOuverte === sys.arme.slug ? null : sys.arme.slug)}
                onBasculer={(cle) => systemes.basculer(sys.arme.slug, cle)}
                onToutRetenir={() => systemes.toutRetenir(sys.arme.slug, sys.toutesLesCles)}
                onVider={() => systemes.vider(sys.arme.slug)}
                onRetirerArme={() => systemes.basculerArme(sys.arme.slug)}
                onAjouter={(type) => onAjouter(sys.arme.slug, type)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
