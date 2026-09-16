import type { Combination, Deplacement, GardeRelative, Technique } from '../types/judodex'

/**
 * Les situations de combat — d'où part une attaque.
 *
 * À ne pas confondre avec `src/data/situations.json`, qui recense les
 * situations d'étude filmées de chaque planche : celles-ci sont des cas de
 * tapis, pas des vidéos.
 *
 * Les secteurs de chute disent où uke tombe ; ils ne disent rien de ce qui
 * précède. Un judoka peut tenir les quatre coins et n'avoir jamais rien monté
 * en garde croisée. D'où ce second relevé, sur deux axes croisés : la garde
 * relative et le déplacement de uke. Huit cases, et une case est tenue dès
 * qu'une attaque du répertoire s'y applique — une suffit, le système se juge
 * ailleurs.
 */

export interface GardeMeta {
  id: GardeRelative
  label: string
  jp: string
  romaji: string
  /** Ce que la garde change concrètement pour tori. */
  note: string
}

export const GARDES: GardeMeta[] = [
  {
    id: 'ai-yotsu',
    label: 'Même garde',
    jp: '相四つ',
    romaji: 'ai-yotsu',
    note: 'Les deux judokas ont la même garde : les hanches se présentent de face.',
  },
  {
    id: 'kenka-yotsu',
    label: 'Garde croisée',
    jp: '喧嘩四つ',
    romaji: 'kenka-yotsu',
    note: "L'un est droitier, l'autre gaucher : le côté fort de chacun est celui que l'autre bloque.",
  },
]

export interface DeplacementMeta {
  id: Deplacement
  label: string
  /** Formulation du point de vue de tori, telle qu'elle se dit au dojo. */
  court: string
  jp: string
}

export const DEPLACEMENTS: DeplacementMeta[] = [
  { id: 'avance', label: 'Uke avance', court: 'Il vient', jp: '前進' },
  { id: 'recule', label: 'Uke recule', court: 'Il fuit', jp: '後退' },
  { id: 'tourne', label: 'Uke tourne', court: 'Il contourne', jp: '回り' },
  { id: 'plante', label: 'Uke est planté', court: 'Il bloque', jp: '静止' },
]

export const gardeMeta = (id: GardeRelative) => GARDES.find((g) => g.id === id)!
export const deplacementMeta = (id: Deplacement) => DEPLACEMENTS.find((d) => d.id === id)!

/** Identifiant d'une case de la grille, garde et déplacement joints. */
export type Case = `${GardeRelative}:${Deplacement}`

export const caseDe = (garde: GardeRelative, deplacement: Deplacement): Case => `${garde}:${deplacement}`

/** Les huit cases, dans l'ordre de lecture de la grille. */
export const CASES: Case[] = GARDES.flatMap((g) => DEPLACEMENTS.map((d) => caseDe(g.id, d.id)))

/**
 * Cases couvertes par un lien. Les deux axes ne se lisent pas de la même
 * manière, et c'est voulu :
 *
 * — La garde absente vaut « les deux ». Une projection sert dans les deux
 *   gardes tant qu'on n'a pas dit le contraire ; la garde est une restriction,
 *   pas une information à collecter.
 * — Le déplacement absent ne vaut rien. Un lien qui dit « si la manche se
 *   défait » ne renseigne pas sur le déplacement de uke, et le compter dans
 *   les quatre colonnes serait une affirmation qu'on n'a pas. La grille se
 *   remplit de ce qui est attesté, sinon elle est pleine dès le premier jour
 *   et ne montre plus aucun trou.
 */
export function casesDuLien(c: Combination): Case[] {
  const deplacement = c.situation?.deplacement
  if (!deplacement) return []
  const gardes = c.situation?.garde ? [c.situation.garde] : GARDES.map((g) => g.id)
  return gardes.map((g) => caseDe(g, deplacement))
}

export interface Couverture {
  /** Techniques du répertoire qui s'appliquent, par case. */
  parCase: Record<Case, Technique[]>
  tenues: Case[]
  vides: Case[]
}

/**
 * Cases d'une technique : celles que ses liens attestent, plus celles que le
 * pratiquant lui a attribuées. Le catalogue ne dit le déplacement de uke que
 * là où quelqu'un l'a écrit ; le judoka qui place son seoi-nage quand uke
 * avance a le dernier mot sur son propre judo.
 */
export function casesDe(t: Technique, attributions: Record<string, Case[]> = {}): Case[] {
  const vues = new Set<Case>()
  for (const l of t.combinations ?? []) for (const c of casesDuLien(l)) vues.add(c)
  for (const c of attributions[t.slug] ?? []) vues.add(c)
  return [...vues]
}

/**
 * Relevé de couverture pour un répertoire donné. Une case est tenue dès
 * qu'une attaque s'y applique : c'est la règle retenue, la plus simple, et
 * elle suffit à faire apparaître le trou de la garde croisée.
 */
export function couverture(repertoire: Technique[], attributions: Record<string, Case[]> = {}): Couverture {
  const parCase = Object.fromEntries(CASES.map((c) => [c, [] as Technique[]])) as Record<Case, Technique[]>
  for (const t of repertoire) for (const c of casesDe(t, attributions)) parCase[c].push(t)
  return {
    parCase,
    tenues: CASES.filter((c) => parCase[c].length > 0),
    vides: CASES.filter((c) => parCase[c].length === 0),
  }
}
