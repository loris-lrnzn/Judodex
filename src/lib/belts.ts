import type { Family, StudySituation, Technique } from '../types/judodex'
import situationsData from '../data/situations.json'

export type BeltId = 'jaune' | 'orange' | 'verte' | 'bleue' | 'marron' | 'noire'

export interface Belt {
  id: BeltId
  /** Grade obtenu au terme de la planche. */
  name: string
  kyu: string
  /** Intitulé de la planche officielle. */
  plate: string
  /** Phase d'apprentissage annoncée par la fédération. */
  phase: string
  /** Objectif de la planche, dans les termes de la fédération. */
  focus: string
  color: string
  /** Techniques de projection imposées, par leur identifiant de fiche. */
  nage: string[]
  /** Techniques de contrôle au sol imposées. */
  katame: string[]
  /** Les deux valeurs du code moral portées par la planche. */
  values: string
  /** Part du nage-waza dans le programme, en pourcentage ; le reste est du katame-waza. */
  nagePart: number
  /** Volume de pratique attendu. */
  volume: string
  /** Exigences hors techniques, pour la planche qui n'impose pas de technique. */
  requirements?: { title: string; body: string }[]
  /** Examen terminal, le cas échéant. */
  exam?: { name: string; note: string; units: { code: string; label: string }[] }
}

/**
 * Progression française de l'enseignement du judo, telle que publiée par la
 * fédération : une planche par passage de grade, de la ceinture blanche à la
 * ceinture noire. Les listes ci-dessous sont relevées sur ces planches.
 *
 * Source : https://www.ffjudo.com/progression-francaise
 */
export const BELTS: Belt[] = [
  {
    id: 'jaune',
    name: 'Jaune',
    kyu: '5ᵉ kyu',
    plate: 'Blanche à jaune',
    phase: 'Initiation',
    focus: 'Découvrir les bases du judo et ses règles essentielles.',
    values: 'Amitié et respect',
    nagePart: 40,
    volume: '35 séances minimum · 2 à 4 animations par an',
    color: '#e2b322',
    nage: ['de-ashi-barai', 'o-uchi-gari', 'morote-seoi-nage', 'o-goshi', 'hiza-guruma', 'o-soto-otoshi', 'tai-otoshi', 'uki-otoshi'],
    katame: ['kuzure-kesa-gatame', 'yoko-shiho-gatame', 'tate-shiho-gatame'],
  },
  {
    id: 'orange',
    name: 'Orange',
    kyu: '4ᵉ kyu',
    plate: 'Jaune à orange',
    phase: 'Perfectionnement global',
    focus: 'Consolider les bases techniques et les structurer progressivement.',
    values: 'Politesse et courage',
    nagePart: 50,
    volume: '45 séances minimum · 3 à 4 interclubs par an',
    color: '#dd7f22',
    nage: ['uki-goshi', 'harai-goshi', 'ippon-seoi-nage', 'tsurikomi-goshi', 'ko-soto-gari', 'ashi-guruma', 'o-soto-gari', 'ko-uchi-gari'],
    katame: ['ushiro-kesa-gatame', 'kami-shiho-gatame', 'kuzure-kami-shiho-gatame'],
  },
  {
    id: 'verte',
    name: 'Verte',
    kyu: '3ᵉ kyu',
    plate: 'Orange à verte',
    phase: 'Perfectionnement global',
    focus: 'Développer son répertoire technique et mieux comprendre le kuzushi.',
    values: 'Sincérité et contrôle de soi',
    nagePart: 60,
    volume: '45 séances minimum · 4 à 6 interclubs par an',
    color: '#43a35f',
    nage: [
      'sasae-tsurikomi-ashi',
      'ushiro-goshi',
      'uchi-mata-hanche',
      'uchi-mata-jambe',
      'okuri-ashi-barai',
      'sode-tsurikomi-goshi',
      'kubi-nage',
      'koshi-guruma',
    ],
    katame: ['makura-kesa-gatame', 'kesa-gatame', 'ura-gatame', 'kata-gatame'],
  },
  {
    id: 'bleue',
    name: 'Bleue',
    kyu: '2ᵉ kyu',
    plate: 'Verte à bleue',
    phase: 'Perfectionnement individualisé',
    focus: 'Affirmer sa maîtrise technique et construire son système de combat.',
    values: 'Modestie et honneur',
    nagePart: 50,
    volume: '55 séances minimum · 4 à 6 compétitions par an',
    color: '#5b8fe0',
    nage: ['kata-guruma', 'te-guruma', 'ko-uchi-makikomi', 'tomoe-nage', 'seoi-otoshi', 'sumi-gaeshi', 'tani-otoshi', 'harai-tsurikomi-ashi'],
    katame: [
      'ude-hishigi-juji-gatame',
      'uki-gatame',
      'ude-hishigi-sankaku-gatame',
      'hadaka-jime',
      'ude-hishigi-ude-gatame',
      'sankaku-jime',
      'okuri-eri-jime',
      'kata-te-jime',
    ],
  },
  {
    id: 'marron',
    name: 'Marron',
    kyu: '1ᵉʳ kyu',
    plate: 'Bleue à marron',
    phase: 'Perfectionnement individualisé',
    focus: 'Approfondir son judo et renforcer la cohérence de sa pratique.',
    values: 'Proactivité et confiance en soi',
    nagePart: 60,
    volume: '55 séances minimum · 4 à 6 compétitions par an',
    color: '#9a6a3e',
    nage: ['hane-goshi', 'kuchiki-taoshi', 'ura-nage', 'yoko-tomoe-nage', 'yoko-guruma', 'soto-makikomi', 'kibisu-gaeshi'],
    katame: [
      'ude-hishigi-hiza-gatame',
      'kata-ha-jime',
      'nami-juji-jime',
      'gyaku-juji-jime',
      'ude-hishigi-ashi-gatame',
      'ude-garami',
      'kata-juji-jime',
    ],
  },
  {
    id: 'noire',
    name: 'Noire',
    kyu: '1ᵉʳ dan',
    plate: 'Marron à noire',
    phase: 'Perfectionnement individualisé',
    focus: "Valider une maîtrise avancée et l'engagement durable.",
    values: 'Réalisation de soi et responsabilité',
    nagePart: 50,
    volume: "6 à 8 compétitions par an · tous les procédés d'entraînement",
    color: '#767268',
    nage: [],
    katame: [],
    requirements: [
      {
        title: "Système d'attaque",
        body: "Construire son système d'attaque autour de son tokui-waza, et savoir attaquer dans chacun des quatre secteurs de chute : avant droit, arrière droit, avant gauche, arrière gauche.",
      },
      {
        title: 'Système de défense',
        body: "Savoir défendre dans chacun des secteurs de chute, en esquivant, en bloquant, en coupant ou en contrant, et conserver une continuité d'action jusque dans le ne-waza.",
      },
      { title: 'Kata', body: 'Étudier le Nage no kata ou le Kodokan goshin jitsu.' },
    ],
    exam: {
      name: 'Examen shodan',
      note: 'Dominante technique ou dominante compétition.',
      units: [
        { code: 'UV1', label: 'Kata' },
        { code: 'UV2', label: 'Technique' },
        { code: 'UV3', label: 'Efficacité' },
        { code: 'UV4', label: 'Engagement personnel' },
      ],
    },
  },
]

export const BELT_ORDER: BeltId[] = BELTS.map((b) => b.id)
export const beltIndex = (id: BeltId) => BELT_ORDER.indexOf(id)
export const beltOf = (id: BeltId) => BELTS[beltIndex(id)]
export const nextBeltAfter = (id: BeltId): BeltId | null => BELT_ORDER[beltIndex(id) + 1] ?? null

/** Toutes les techniques imposées par une planche, projections puis sol. */
export const beltSlugs = (b: Belt) => [...b.nage, ...b.katame]

const INDEX: Map<string, BeltId> = new Map()
for (const b of BELTS) for (const slug of beltSlugs(b)) INDEX.set(slug, b.id)

/**
 * Grade auquel une technique est imposée, ou null si elle ne figure sur
 * aucune planche. Quarante des cent quatre fiches sont dans ce cas : ce sont
 * des techniques du répertoire, pas des exigences de passage de grade.
 */
export const beltFor = (slug: string): BeltId | null => INDEX.get(slug) ?? null

const NAGE_FAMILIES: Family[] = ['te-waza', 'koshi-waza', 'ashi-waza', 'ma-sutemi-waza', 'yoko-sutemi-waza']

/** Une technique relève du nage-waza ou du katame-waza selon sa famille. */
export const sectionOf = (t: Technique): 'nage' | 'katame' => (NAGE_FAMILIES.includes(t.family) ? 'nage' : 'katame')

/**
 * Situations d'étude de chaque planche : déplacements, esquives, retournements,
 * sorties de contrôle. Elles ne sont pas des techniques imposées, mais elles
 * occupent l'essentiel du programme au sol, ce qui explique la part que la
 * planche accorde à ce domaine.
 */
const SITUATIONS = situationsData as Record<string, StudySituation[]>

export const situationsFor = (id: BeltId): StudySituation[] => SITUATIONS[id] ?? []

export const PROGRESSION_SOURCE = 'https://www.ffjudo.com/progression-francaise'
