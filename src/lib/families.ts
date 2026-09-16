import type { Family, FamilyGroup, Level } from '../types/judodex'

export interface FamilyMeta {
  group: FamilyGroup
  label: string
  kanji: string
  short: string
}

export const FAMILY_META: Record<Family, FamilyMeta> = {
  'te-waza': { group: 'te-waza', label: 'Te-waza', kanji: '手技', short: 'Techniques de bras' },
  'koshi-waza': { group: 'koshi-waza', label: 'Koshi-waza', kanji: '腰技', short: 'Techniques de hanche' },
  'ashi-waza': { group: 'ashi-waza', label: 'Ashi-waza', kanji: '足技', short: 'Techniques de jambe' },
  'ma-sutemi-waza': { group: 'sutemi-waza', label: 'Ma-sutemi-waza', kanji: '真捨身技', short: 'Sacrifice arrière' },
  'yoko-sutemi-waza': { group: 'sutemi-waza', label: 'Yoko-sutemi-waza', kanji: '横捨身技', short: 'Sacrifice latéral' },
  'osaekomi-waza': { group: 'ne-waza', label: 'Osaekomi-waza', kanji: '抑込技', short: 'Immobilisations' },
  'shime-waza': { group: 'ne-waza', label: 'Shime-waza', kanji: '絞技', short: 'Étranglements' },
  'kansetsu-waza': { group: 'ne-waza', label: 'Kansetsu-waza', kanji: '関節技', short: 'Clés articulaires' },
}

export const FAMILIES = Object.keys(FAMILY_META) as Family[]

/**
 * Une couleur par macro-famille, empruntée aux teintures japonaises
 * traditionnelles. Ce sont des variables CSS : elles s'adaptent au thème.
 */
export const GROUP_META: Record<FamilyGroup, { kanji: string; name: string; jp: string; color: string; colorHi: string; principle: string }> = {
  'te-waza': { kanji: '手', name: 'Bras', jp: '手技', color: 'var(--c-te)', colorHi: 'var(--c-te-hi)', principle: "Projeter par l'action des bras et des épaules." },
  'koshi-waza': { kanji: '腰', name: 'Hanche', jp: '腰技', color: 'var(--c-koshi)', colorHi: 'var(--c-koshi-hi)', principle: 'Charger uke sur la hanche et le faire basculer.' },
  'ashi-waza': { kanji: '足', name: 'Jambe', jp: '足技', color: 'var(--c-ashi)', colorHi: 'var(--c-ashi-hi)', principle: 'Faucher, balayer ou bloquer les appuis.' },
  'sutemi-waza': { kanji: '捨', name: 'Sacrifice', jp: '捨身技', color: 'var(--c-sutemi)', colorHi: 'var(--c-sutemi-hi)', principle: 'Se laisser tomber pour entraîner le partenaire.' },
  'ne-waza': { kanji: '寝', name: 'Sol', jp: '寝技', color: 'var(--c-ne)', colorHi: 'var(--c-ne-hi)', principle: 'Contrôler, immobiliser, étrangler ou luxer au sol.' },
}

export const GROUPS = Object.keys(GROUP_META) as FamilyGroup[]

export const LEVELS: Level[] = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Maître']

/**
 * Niveaux. La ceinture donne la couleur, le nombre de traits donne le rang :
 * la difficulté se lit à la graduation autant qu'à la teinte.
 */
export const LEVEL_META: Record<Level, { belt: string; rank: number; abbr: string }> = {
  Débutant: { belt: '#e2b322', rank: 1, abbr: 'DÉB' },
  Intermédiaire: { belt: '#dd7f22', rank: 2, abbr: 'INT' },
  Avancé: { belt: '#2f8046', rank: 3, abbr: 'AVA' },
  Expert: { belt: '#2f62ad', rank: 4, abbr: 'EXP' },
  Maître: { belt: '#1a1a1a', rank: 5, abbr: 'MAÎ' },
}

export const groupOf = (family: Family) => FAMILY_META[family].group
export const familyColor = (family: Family) => GROUP_META[FAMILY_META[family].group].color

/** Version éclaircie, à employer dès que le fond passe à l'encre. */
export const familyColorLite = (family: Family) => GROUP_META[FAMILY_META[family].group].colorHi

/** Les deux teintes d'une famille, prêtes à poser en variables CSS. */
export const familyVars = (family: Family) =>
  ({ '--fam': familyColor(family), '--fam-hi': familyColorLite(family) }) as React.CSSProperties
export const subFamilies = (g: FamilyGroup): Family[] => FAMILIES.filter((f) => FAMILY_META[f].group === g)

/**
 * Les noms de techniques comptent de un à cinq idéogrammes. Le corps doit
 * suivre, sinon les noms longs se cassent en deux lignes et écrasent la fiche.
 */
export function kanjiSize(kanji: string, scale: 'card' | 'row' | 'hero' | 'family' = 'card'): string {
  const n = [...kanji].length
  const table = {
    card: ['3.4rem', '3.4rem', '2.55rem', '1.95rem', '1.6rem'],
    row: ['1.5rem', '1.5rem', '1.15rem', '0.95rem', '0.82rem'],
    hero: ['6rem', '6rem', '4.6rem', '3.6rem', '3rem'],
    family: ['2.9rem', '2.9rem', '2.4rem', '2rem', '1.7rem'],
  }[scale]
  return table[Math.min(Math.max(n, 1), 5) - 1]
}
