import type { Combination, Technique } from '../types/judodex'
import { deplacementMeta, gardeMeta } from './situations'
import { directionMeta, secteurDe, type Direction, type Garde, type Secteur } from './secteurs'

/**
 * Un système d'attaque, au sens du tapis : une technique de prédilection, ce
 * que uke oppose, et ce qu'on fait de sa réponse.
 *
 * Une liste de techniques n'est pas un système. Ce qui en fait un, c'est
 * qu'une réaction de uke soit déjà prévue — et surtout qu'au moins une des
 * suites fasse tomber dans un autre coin que la technique de départ. Sans
 * cela, on a plusieurs manières de faire tomber uke du même côté, et un
 * adversaire qui vous connaît n'a qu'un seul côté à défendre.
 */

/** Identifiant stable d'une branche, pour la retenir ou l'écarter. */
export const cleBranche = (l: Combination) => `${l.type}:${l.slug}`

export interface Branche {
  cle: string
  lien: Combination
  cible: Technique
  /** Secteur où tombe la cible, null pour une cardinale ou un travail au sol. */
  secteur: Secteur | null
  /** La suite fait-elle tomber uke dans un autre coin que la technique de départ ? */
  ouvre: boolean
  /** La cible est-elle déjà au répertoire du pratiquant ? */
  acquise: boolean
  /** Le pratiquant a-t-il déclaré faire cette suite ? */
  retenue: boolean
  /** Branche ajoutée à la main plutôt que proposée par le catalogue. */
  libre: boolean
  /** Phrase de déclenchement, telle qu'elle se dit au dojo. */
  amorce: string
}

export interface Systeme {
  arme: Technique
  secteur: Secteur | null
  /** Ce qu'on enchaîne quand uke se défend, dans un autre coin ou non. */
  suites: Branche[]
  /** La même attaque, insistée. */
  redoublements: Branche[]
  /** Ce qui prend le relais au sol quand uke tombe mal. */
  sol: Branche[]
  /** Ce que uke peut renvoyer : le risque de la technique, pas son prolongement. */
  risques: Branche[]
  /** Autres coins atteints par les suites retenues, celui de départ non compris. */
  autresCoins: Secteur[]
  /** Nombre de branches retenues, tous groupes confondus. */
  montees: number
  /** Toutes les clés proposées, pour le bouton « tout retenir ». */
  toutesLesCles: string[]
  verdict: string
}

const AMORCES: Record<string, string> = {
  'bloque-bassin': 'Il bloque le bassin',
  'bras-tendus': 'Il tient à distance',
  'casse-avant': 'Il se casse en avant',
  'esquive-hanche': 'Il esquive la hanche',
  'recule-jambe': 'Il retire la jambe',
}

/** Ce qui déclenche une branche : la défense de uke, sinon sa situation. */
function amorceDe(l: Combination): string {
  if (l.defense) return AMORCES[l.defense]
  const d = l.situation?.deplacement
  const g = l.situation?.garde
  if (d && g) return `${deplacementMeta(d).label}, ${gardeMeta(g).label.toLowerCase()}`
  if (d) return deplacementMeta(d).label
  if (g) return gardeMeta(g).label
  return 'En toute situation'
}

/**
 * Monte le système d'une arme. `acquis` sert à distinguer ce que le pratiquant
 * tient déjà de ce qui lui reste à apprendre : les deux s'affichent, mais on
 * ne compte comme porte ouverte que ce qu'il sait faire.
 */
export function monter(
  arme: Technique,
  /** Liens du catalogue, et le catalogue entier pour résoudre les ajouts. */
  liens: { technique: Technique; lien: Combination }[],
  catalogue: Map<string, Technique>,
  acquis: Set<string>,
  garde: Garde,
  corrections: Record<string, Direction>,
  retenues: Set<string> = new Set(),
  libres: { type: Combination['type']; slug: string }[] = [],
): Systeme {
  const parSlug = catalogue
  const secteur = secteurDe(arme.slug, garde, corrections)

  /**
   * Les branches ajoutées à la main prennent la forme d'un lien du catalogue,
   * avec un contexte qui dit d'où elles viennent. Elles sont retenues d'office :
   * on ne les ajoute pas pour ne pas les faire.
   */
  const tousLesLiens = [
    ...liens,
    ...libres.flatMap((b) => {
      const cible = parSlug.get(b.slug)
      if (!cible || liens.some((x) => x.lien.slug === b.slug && x.lien.type === b.type)) return []
      return [{ technique: cible, lien: { slug: b.slug, type: b.type, context: 'ajoutée à votre système' } as Combination }]
    }),
  ]
  const estLibre = (l: Combination) => libres.some((b) => b.slug === l.slug && b.type === l.type)

  const faire = (l: Combination, cible: Technique): Branche => {
    const s = secteurDe(cible.slug, garde, corrections)
    return {
      cle: cleBranche(l),
      lien: l,
      cible,
      secteur: s,
      ouvre: !!s && s !== secteur,
      acquise: acquis.has(cible.slug),
      retenue: retenues.has(cleBranche(l)) || estLibre(l),
      libre: estLibre(l),
      amorce: amorceDe(l),
    }
  }

  // Toutes les branches du catalogue s'affichent : ce sont les propositions.
  // Seules celles que le pratiquant a retenues comptent dans le verdict.
  const parType = (type: Combination['type']) =>
    tousLesLiens.filter((x) => x.lien.type === type).map((x) => faire(x.lien, x.technique))

  // Ce qu'on a retenu remonte, puis ce qui ouvre un secteur, puis ce qu'on sait
  // déjà faire : l'ordre dans lequel on a envie de les voir en construisant.
  const suites = parType('enchainement').sort(
    (a, b) =>
      Number(b.retenue) - Number(a.retenue) || Number(b.ouvre) - Number(a.ouvre) || Number(b.acquise) - Number(a.acquise),
  )
  const redoublements = parType('redoublement')
  const sol = parType('liaison-sol')
  const risques = parType('contre')

  const toutes = [...suites, ...redoublements, ...sol, ...risques]
  const autresCoins = [...new Set(suites.filter((b) => b.retenue && b.ouvre && b.acquise).map((b) => b.secteur!))]
  const montees = toutes.filter((b) => b.retenue).length

  return {
    arme,
    secteur,
    suites,
    redoublements,
    sol,
    risques,
    autresCoins,
    montees,
    toutesLesCles: toutes.map((b) => b.cle),
    verdict: verdictDe(autresCoins, sol, secteur, montees),
  }
}

/**
 * Le verdict n'est pas une note : c'est la phrase qu'un entraîneur dirait en
 * regardant travailler. On énonce le manque le plus gênant, un seul.
 */
function verdictDe(coins: Secteur[], sol: Branche[], secteur: Secteur | null, montees: number): string {
  // Rien de coché : le système n'est pas encore construit, et le dire vaut
  // mieux qu'un verdict sévère sur un travail qui n'a pas commencé.
  if (montees === 0) return "Rien de coché pour l'instant : dis ce que tu fais, le verdict suivra."

  const auSol = sol.some((b) => b.retenue && b.acquise)
  // Une suite au sol déclarée mais non acquise n'est pas une sortie : on ne
  // conclut pas avec une technique qu'on ne sait pas faire.
  const solCoche = sol.filter((b) => b.retenue)
  const solAApprendre = !auSol && solCoche.length > 0
  const manqueSol = solAApprendre
    ? `${solCoche[0].cible.name} prend le relais, mais tu ne la sais pas encore`
    : "rien au sol quand uke tombe mal"

  const combien = coins.length === 1 ? 'Un autre coin' : `${coins.length} autres coins`

  if (!coins.length)
    return secteur
      ? `Tout tombe en ${directionMeta(secteur).label.toLowerCase()} — un adversaire n'a qu'un côté à défendre${
          auSol ? ', même si le sol prend le relais.' : `, et ${manqueSol}.`
        }`
      : "Aucune suite ne fait tomber ailleurs : le système reste prévisible debout."
  if (!auSol) return `${combien} debout, mais ${manqueSol}.`
  return `${combien}, et le sol prend le relais : le système tient.`
}
