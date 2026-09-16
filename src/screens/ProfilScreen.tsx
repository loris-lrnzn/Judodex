import { useState } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { useProfil } from '../hooks/useProfil'
import { useSystemes } from '../hooks/useSystemes'
import { useBilan } from '../hooks/useBilan'
import { useParcours } from '../hooks/useParcours'
import { ChoixTechnique } from '../components/ChoixTechnique'
import { FilParcours } from '../components/profil/FilParcours'
import { Etape } from '../components/profil/Etape'
import { EtapeGarde } from '../components/profil/EtapeGarde'
import { EtapeRepertoire } from '../components/profil/EtapeRepertoire'
import { EtapeSituations, libelleCase } from '../components/profil/EtapeSituations'
import { EtapeSysteme } from '../components/profil/EtapeSysteme'
import { EtapeBilan } from '../components/profil/EtapeBilan'
import { directionMeta, type Secteur } from '../lib/secteurs'
import { CASES, type Case } from '../lib/situations'
import type { Combination } from '../types/judodex'

interface Props {
  dex: Judodex
}

/** Intitulé de chaque forme de lien, pour le titre du sélecteur. */
const LIBELLE_TYPE: Record<Combination['type'], string> = {
  enchainement: 'un enchaînement',
  redoublement: 'un redoublement',
  contre: 'un contre',
  'liaison-sol': 'une sortie au sol',
}

/**
 * Mon judo, en cinq questions.
 *
 * La page posait six sections d'un bloc et n'en posait aucune : on y lisait un
 * relevé technique sans savoir par où le prendre. Elle demande maintenant une
 * chose à la fois, dans l'ordre où les réponses s'appellent — la garde décide
 * des coins, les coins font la matière du système, le système donne le bilan —
 * et le fil du haut laisse revenir en arrière ou sauter à la fin.
 *
 * L'écran n'est plus qu'un aiguillage : le calcul est dans `useBilan`, l'état
 * du parcours dans `useParcours`, et chaque étape dans son propre fichier.
 */
export function ProfilScreen({ dex }: Props) {
  const profil = useProfil()
  const systemes = useSystemes()
  const bilan = useBilan(dex, profil, systemes)
  const parcours = useParcours()

  const [survol, setSurvol] = useState<Secteur | null>(null)
  const [survolCase, setSurvolCase] = useState<Case | null>(null)
  const [ouvert, setOuvert] = useState<Secteur | null>(null)
  const [caseOuverte, setCaseOuverte] = useState<Case | null>(null)
  const [carteOuverte, setCarteOuverte] = useState<string | null>(null)

  /** Le sélecteur de technique, et ce qu'il alimente une fois choisi. */
  const [choix, setChoix] = useState<
    | { but: 'secteur'; secteur: Secteur }
    | { but: 'case'; cas: Case }
    | { but: 'branche'; arme: string; type: Combination['type'] }
    | null
  >(null)

  const etape = parcours.courante

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8">
      {/* ── L'ouvrage et son fil ── */}
      <div className="pt-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Mon judo</h2>
          <span className="font-jp text-[13px] text-faint">私の柔道</span>
          <span className="annot ml-auto text-faint">
            {bilan.places.length} technique{bilan.places.length > 1 ? 's' : ''} au répertoire
          </span>
        </div>
      </div>

      <div className="mt-4">
        <FilParcours courante={etape} vue={parcours.vue} aller={parcours.aller} />
      </div>

      {etape === 'garde' && (
        <Etape id="garde" onPrecedente={parcours.precedente} onSuivante={parcours.suivante}>
          <EtapeGarde profil={profil} />
        </Etape>
      )}

      {etape === 'repertoire' && (
        <Etape
          id="repertoire"
          compte={`${4 - bilan.vides.length}/4 coins`}
          onPrecedente={parcours.precedente}
          onSuivante={parcours.suivante}
        >
          <EtapeRepertoire
            dex={dex}
            bilan={bilan}
            ouvert={ouvert}
            survol={survol}
            onOuvrir={setOuvert}
            onSurvol={setSurvol}
            onChercher={(s) => setChoix({ but: 'secteur', secteur: s })}
          />
        </Etape>
      )}

      {etape === 'situations' && (
        <Etape
          id="situations"
          compte={`${bilan.situations.tenues.length}/${CASES.length} cas`}
          onPrecedente={parcours.precedente}
          onSuivante={parcours.suivante}
        >
          <EtapeSituations
            dex={dex}
            profil={profil}
            bilan={bilan}
            survol={survolCase}
            ouvert={caseOuverte}
            onSurvol={setSurvolCase}
            onOuvrir={setCaseOuverte}
            onChercher={(c) => setChoix({ but: 'case', cas: c })}
          />
        </Etape>
      )}

      {etape === 'systeme' && (
        <Etape
          id="systeme"
          compte={
            bilan.armes.length
              ? `${bilan.armes.length} technique${bilan.armes.length > 1 ? 's' : ''}`
              : undefined
          }
          onPrecedente={parcours.precedente}
          onSuivante={parcours.suivante}
          suivant="Voir mon bilan"
        >
          <EtapeSysteme
            dex={dex}
            bilan={bilan}
            systemes={systemes}
            carteOuverte={carteOuverte}
            onOuvrirCarte={setCarteOuverte}
            onAjouter={(arme, type) => setChoix({ but: 'branche', arme, type })}
          />
        </Etape>
      )}

      {etape === 'bilan' && (
        <Etape id="bilan" onPrecedente={parcours.precedente} onSuivante={parcours.suivante}>
          <EtapeBilan dex={dex} bilan={bilan} aller={parcours.aller} />
        </Etape>
      )}

      {choix && (
        <ChoixTechnique
          open
          dex={dex}
          titre={
            choix.but === 'secteur'
              ? `Ajouter en ${directionMeta(choix.secteur).label.toLowerCase()}`
              : choix.but === 'case'
                ? `Ajouter en ${libelleCase(choix.cas).toLowerCase()}`
                : `Ajouter ${LIBELLE_TYPE[choix.type]}`
          }
          aide={
            choix.but === 'secteur'
              ? 'Les projections qui tombent dans ce coin. La recherche donne accès à tout le catalogue.'
              : choix.but === 'case'
                ? "Tes techniques d'abord. Celle que tu choisis est rangée dans ce cas, même si aucun lien du catalogue ne l'y mettait."
                : "Ce que le catalogue propose d'abord ; cherche si ton judo n'y est pas."
          }
          proposees={
            choix.but === 'secteur'
              ? bilan.catalogueParSecteur[choix.secteur]
              : choix.but === 'case'
                ? // Le répertoire d'abord : le cas ordinaire est d'y ranger une
                  // technique qu'on fait déjà mais que le catalogue n'y met pas.
                  [
                    ...bilan.places.map((p) => p.t),
                    ...dex.techniques.filter((t) => !bilan.acquis.has(t.slug)),
                  ]
                : bilan.proposeesBranche(choix.type)
          }
          exclues={
            choix.but === 'secteur'
              ? bilan.acquis
              : choix.but === 'case'
                ? new Set(bilan.catalogueParCase[choix.cas].map((t) => t.slug))
              : new Set([
                  choix.arme,
                  ...(dex.bySlug.get(choix.arme)?.combinations ?? [])
                    .filter((c) => c.type === choix.type)
                    .map((c) => c.slug),
                  ...systemes
                    .libresDe(choix.arme)
                    .filter((b) => b.type === choix.type)
                    .map((b) => b.slug),
                ])
          }
          onChoisir={(t) => {
            if (choix.but === 'branche') {
              systemes.ajouterLibre(choix.arme, { type: choix.type, slug: t.slug })
            } else if (choix.but === 'case') {
              // Ranger une technique dans un cas suppose qu'on la fasse.
              if (!bilan.acquis.has(t.slug)) dex.setMastery(t.slug, 'mastered')
              profil.basculerSituation(t.slug, choix.cas)
            } else {
              dex.setMastery(t.slug, 'mastered')
            }
          }}
          onClose={() => setChoix(null)}
        />
      )}
    </div>
  )
}
