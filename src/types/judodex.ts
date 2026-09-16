/** Une phase pédagogique d'une technique (Kuzushi / Tsukuri / Kake). */
export interface Phase {
  kanji: string
  label: string
  meaning: string
  description: string
}

/**
 * Garde relative des deux judokas : même garde — ai-yotsu — quand tous deux
 * sont droitiers ou tous deux gauchers, garde croisée — kenka-yotsu — sinon.
 * Un lien sans garde vaut dans les deux.
 */
export type GardeRelative = 'ai-yotsu' | 'kenka-yotsu'

/** Ce que fait uke au moment de l'attaque. Second axe de la situation. */
export type Deplacement = 'avance' | 'recule' | 'tourne' | 'plante'

/**
 * Situation de combat d'où part une attaque. Les deux axes sont facultatifs :
 * une attaque qui marche partout n'en porte aucun.
 */
export interface Situation {
  garde?: GardeRelative
  deplacement?: Deplacement
}

/** Ce que uke oppose à l'attaque, et qui déclenche la suite du système. */
export type Defense = 'bloque-bassin' | 'bras-tendus' | 'casse-avant' | 'esquive-hanche' | 'recule-jambe'

/** Ce qui atteste un lien. `usage` est ce qui reste à relire. */
export type Attestation = 'ffjudo' | 'kodokan' | 'usage'

/**
 * Lien entre deux techniques — ou d'une technique vers elle-même dans le seul
 * cas du redoublement, qui insiste avec la même attaque. Quatre formes, qui sont les quatre manières de
 * poursuivre : enchaîner ailleurs, insister dans la même direction, répondre
 * à une projection, ou continuer au sol quand ça ne tombe pas. La cible est
 * toujours une fiche du catalogue.
 */
export interface Combination {
  slug: string
  type: 'enchainement' | 'redoublement' | 'contre' | 'liaison-sol'
  context: string
  /** D'où part l'attaque. Absent quand le lien vaut en toute situation. */
  situation?: Situation
  /** Ce que uke oppose et qui ouvre ce lien. */
  defense?: Defense
  /** Ce qui atteste le lien ; `usage` appelle une relecture. */
  attestation?: Attestation
}

/** Les 8 familles du Gokyo étendu telles que présentes dans les données. */
export type Family =
  | 'te-waza'
  | 'koshi-waza'
  | 'ashi-waza'
  | 'ma-sutemi-waza'
  | 'yoko-sutemi-waza'
  | 'osaekomi-waza'
  | 'shime-waza'
  | 'kansetsu-waza'

/** Groupe visuel (palette) : 5 macro-familles. */
export type FamilyGroup = 'te-waza' | 'koshi-waza' | 'ashi-waza' | 'sutemi-waza' | 'ne-waza'

export type Level = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | 'Maître'

export interface Technique {
  slug: string
  name: string
  translation: string
  kanji: string
  family: Family
  level: Level
  /** Démonstration du Kodokan, la référence japonaise. */
  youtubeId: string | null
  /** Durée de cette vidéo, en secondes. */
  youtubeDuration?: number
  /** Démonstration de la fédération française, quand elle existe. */
  ffjudoId?: string | null
  ffjudoDuration?: number
  intro: string
  phases: Phase[]
  keyPoints?: string[]
  combinations?: Combination[]
}

export interface JudodexData {
  name: string
  description: string
  /** Date du dernier relevé de la nomenclature. */
  scrapedAt: string
  count: number
  techniques: Technique[]
}

/** Progression de l'utilisateur sur une technique. */
export type Mastery = 'unknown' | 'learning' | 'mastered'

export interface ProgressEntry {
  mastery: Mastery
  tokui: boolean
  updatedAt: string
  /** Boîte de Leitner (0 à 5) pour la révision espacée. */
  box?: number
  /** Date de la prochaine révision, au format AAAA-MM-JJ. */
  due?: string
}

export type ProgressMap = Record<string, ProgressEntry>

/** Le judo se reconnaît d'abord à l'œil, ensuite au sens du nom. */
export type QuizMode = 'video' | 'translation'

export type BestScores = Partial<Record<QuizMode, number>>

export interface QuizQuestion {
  mode: QuizMode
  answer: Technique
  choices: Technique[]
}

/** Situation d'étude d'une planche : un exercice filmé, hors technique imposée. */
export interface StudySituation {
  label: string
  id: string
  domain: 'nage' | 'katame'
}
