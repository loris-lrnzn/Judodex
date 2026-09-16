import type { Technique } from '../types/judodex'

/**
 * Les huit directions du déséquilibre — happo no kuzushi — et les quatre
 * secteurs de chute que la fédération retient pour la ceinture noire.
 *
 * Convention de saisie : tori droitier, garde droite. La direction est celle
 * où part uke, exprimée du point de vue de uke. Une garde gauche renvoie la
 * lecture en miroir, ce dont `enGarde` se charge à l'affichage.
 *
 * Les quatre directions cardinales — avant, arrière, droite, gauche — ne
 * remplissent aucun secteur : une projection droit devant ne prouve pas qu'on
 * sait attaquer dans le coin avant droit. C'est voulu, et le diagnostic le dit.
 */

export type Direction = 'av' | 'av-d' | 'd' | 'ar-d' | 'ar' | 'ar-g' | 'g' | 'av-g'
export type Secteur = 'av-d' | 'ar-d' | 'ar-g' | 'av-g'

export interface DirectionMeta {
  id: Direction
  label: string
  court: string
  jp: string
  /** Angle sur la rose, uke au centre et face vers le haut. */
  angle: number
  /** Secteur de chute rempli, ou null pour les quatre cardinales. */
  secteur: Secteur | null
}

export const DIRECTIONS: DirectionMeta[] = [
  { id: 'av', label: 'Avant', court: 'AV', jp: '前', angle: 0, secteur: null },
  { id: 'av-d', label: 'Avant droit', court: 'AVD', jp: '右前隅', angle: 45, secteur: 'av-d' },
  { id: 'd', label: 'Droite', court: 'D', jp: '右', angle: 90, secteur: null },
  { id: 'ar-d', label: 'Arrière droit', court: 'ARD', jp: '右後隅', angle: 135, secteur: 'ar-d' },
  { id: 'ar', label: 'Arrière', court: 'AR', jp: '後', angle: 180, secteur: null },
  { id: 'ar-g', label: 'Arrière gauche', court: 'ARG', jp: '左後隅', angle: 225, secteur: 'ar-g' },
  { id: 'g', label: 'Gauche', court: 'G', jp: '左', angle: 270, secteur: null },
  { id: 'av-g', label: 'Avant gauche', court: 'AVG', jp: '左前隅', angle: 315, secteur: 'av-g' },
]

export const directionMeta = (id: Direction) => DIRECTIONS.find((d) => d.id === id)!

export const SECTEURS: Secteur[] = ['av-d', 'ar-d', 'ar-g', 'av-g']
export const secteurLabel = (s: Secteur) => directionMeta(s).label

export type Garde = 'droite' | 'gauche'

const MIROIR: Record<Direction, Direction> = {
  av: 'av',
  'av-d': 'av-g',
  d: 'g',
  'ar-d': 'ar-g',
  ar: 'ar',
  'ar-g': 'ar-d',
  g: 'd',
  'av-g': 'av-d',
}

/** Lecture d'une direction pour la garde du pratiquant. */
export const enGarde = (dir: Direction, garde: Garde): Direction => (garde === 'droite' ? dir : MIROIR[dir])

export interface Releve {
  dir: Direction
  /**
   * Faux quand la direction dépend de la forme enseignée ou du sens de
   * l'entrée : la planche propose alors de la corriger.
   */
  sur: boolean
}

/**
 * Direction de chaque projection. Les entrées marquées `sur: false` sont
 * celles dont la lecture varie d'un club à l'autre, ou dont la forme admet
 * plusieurs sens : le pratiquant peut les régler lui-même.
 */
export const DIRECTION_OF: Record<string, Releve> = {
  // ── Koshi-waza. Tori tourne le dos et charge uke sur la hanche droite :
  // le déséquilibre part sur le coin avant droit de uke.
  'o-goshi': { dir: 'av-d', sur: true },
  'uki-goshi': { dir: 'av-d', sur: true },
  'harai-goshi': { dir: 'av-d', sur: true },
  'hane-goshi': { dir: 'av-d', sur: true },
  'koshi-guruma': { dir: 'av-d', sur: true },
  'tsuri-goshi': { dir: 'av-d', sur: true },
  'tsurikomi-goshi': { dir: 'av-d', sur: true },
  'sode-tsurikomi-goshi': { dir: 'av-d', sur: true },
  'kubi-nage': { dir: 'av-d', sur: true },
  'uchi-mata-hanche': { dir: 'av-d', sur: true },
  // Contres de hanche : uke, qui attaquait vers l'avant, repart en arrière.
  'ushiro-goshi': { dir: 'ar', sur: false },
  'utsuri-goshi': { dir: 'av-g', sur: false },

  // ── Te-waza.
  'ippon-seoi-nage': { dir: 'av-d', sur: true },
  'morote-seoi-nage': { dir: 'av-d', sur: true },
  'eri-seoi-nage': { dir: 'av-d', sur: true },
  'seoi-otoshi': { dir: 'av-d', sur: true },
  'tai-otoshi': { dir: 'av-d', sur: true },
  'uki-otoshi': { dir: 'av-d', sur: true },
  'yama-arashi': { dir: 'av-d', sur: true },
  'kata-guruma': { dir: 'av', sur: false },
  'sumi-otoshi': { dir: 'ar-d', sur: false },
  'sukui-nage': { dir: 'ar', sur: false },
  'morote-gari': { dir: 'ar', sur: true },
  'kuchiki-taoshi': { dir: 'ar-d', sur: false },
  'kibisu-gaeshi': { dir: 'ar-d', sur: false },
  'te-guruma': { dir: 'ar-g', sur: false },
  'obi-otoshi': { dir: 'ar', sur: false },
  'obi-tori-gaeshi': { dir: 'ar', sur: false },
  'uchi-mata-sukashi': { dir: 'av-g', sur: false },

  // ── Ashi-waza. Les grands fauchages arrière sont les repères les plus
  // sûrs : o-soto et ko-soto prennent la jambe droite de uke, o-uchi la
  // gauche, ko-uchi la droite par l'intérieur.
  'o-soto-gari': { dir: 'ar-d', sur: true },
  'o-soto-otoshi': { dir: 'ar-d', sur: true },
  'o-soto-guruma': { dir: 'ar', sur: false },
  'ko-soto-gari': { dir: 'ar-d', sur: true },
  'ko-soto-gake': { dir: 'ar-d', sur: true },
  'o-uchi-gari': { dir: 'ar-g', sur: true },
  'ko-uchi-gari': { dir: 'ar-d', sur: true },
  'uchi-mata-jambe': { dir: 'av-d', sur: true },
  'ashi-guruma': { dir: 'av-d', sur: true },
  'o-guruma': { dir: 'av-d', sur: true },
  'sasae-tsurikomi-ashi': { dir: 'av-d', sur: false },
  'harai-tsurikomi-ashi': { dir: 'av-d', sur: false },
  'hiza-guruma': { dir: 'av-g', sur: false },
  'de-ashi-barai': { dir: 'd', sur: false },
  'okuri-ashi-barai': { dir: 'g', sur: false },
  'tsubame-gaeshi': { dir: 'g', sur: false },
  // Contres : ils renvoient l'attaquant dans le secteur opposé au sien.
  'o-soto-gaeshi': { dir: 'ar-g', sur: false },
  'o-uchi-gaeshi': { dir: 'ar-d', sur: false },
  'ko-uchi-gaeshi': { dir: 'ar-g', sur: false },
  'hane-goshi-gaeshi': { dir: 'ar-g', sur: false },

  // ── Ma-sutemi-waza. Tori se sacrifie en arrière : uke passe par-dessus.
  'tomoe-nage': { dir: 'av', sur: true },
  'ura-nage': { dir: 'ar', sur: true },
  'sumi-gaeshi': { dir: 'av-g', sur: false },
  'tawara-gaeshi': { dir: 'av', sur: false },
  'hikikomi-gaeshi': { dir: 'av', sur: false },

  // ── Yoko-sutemi-waza. Tori se sacrifie sur le côté.
  'yoko-otoshi': { dir: 'd', sur: false },
  'yoko-gake': { dir: 'd', sur: false },
  'tani-otoshi': { dir: 'ar-d', sur: false },
  'yoko-guruma': { dir: 'av-g', sur: false },
  'yoko-wakare': { dir: 'av', sur: false },
  'yoko-tomoe-nage': { dir: 'av-g', sur: false },
  'daki-wakare': { dir: 'g', sur: false },
  'uki-waza': { dir: 'av-d', sur: false },
  // Makikomi : l'enroulement suit le sens de la technique qui le porte.
  'soto-makikomi': { dir: 'av-d', sur: true },
  'hane-makikomi': { dir: 'av-d', sur: true },
  'harai-makikomi': { dir: 'av-d', sur: true },
  'uchi-mata-makikomi': { dir: 'av-d', sur: true },
  'uchi-makikomi': { dir: 'av-d', sur: true },
  'o-soto-makikomi': { dir: 'ar-d', sur: false },
  'ko-uchi-makikomi': { dir: 'ar-d', sur: false },
}

/** Techniques dont la direction demande à être confirmée par le pratiquant. */
export const A_CONFIRMER = Object.entries(DIRECTION_OF)
  .filter(([, r]) => !r.sur)
  .map(([slug]) => slug)

/**
 * Direction d'une technique, corrections du pratiquant comprises et lue dans
 * sa garde. Renvoie null au sol : le ne-waza ne se lit pas en secteurs.
 */
export function directionDe(
  slug: string,
  garde: Garde = 'droite',
  corrections: Record<string, Direction> = {},
): Direction | null {
  const base = corrections[slug] ?? DIRECTION_OF[slug]?.dir
  return base ? enGarde(base, garde) : null
}

/** Secteur de chute rempli par une technique, ou null. */
export const secteurDe = (
  slug: string,
  garde: Garde = 'droite',
  corrections: Record<string, Direction> = {},
): Secteur | null => {
  const dir = directionDe(slug, garde, corrections)
  return dir ? directionMeta(dir).secteur : null
}

/** Les trois manières de conclure au sol, pour la seconde moitié du bilan. */
export const CONCLUSIONS = [
  { id: 'osaekomi-waza', label: 'Immobiliser', jp: '抑込技' },
  { id: 'shime-waza', label: 'Étrangler', jp: '絞技' },
  { id: 'kansetsu-waza', label: 'Luxer', jp: '関節技' },
] as const

export const estDebout = (t: Technique) => t.slug in DIRECTION_OF
