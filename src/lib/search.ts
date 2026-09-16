import type { Technique } from '../types/judodex'

/** Normalise : minuscules, sans accents, tirets → espaces. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-_]/g, ' ')
    .trim()

/**
 * Score de sous-séquence (fuzzy léger) : retourne 0 si les lettres de `q`
 * n'apparaissent pas dans l'ordre dans `text`, sinon un score favorisant
 * les correspondances contiguës et en début de mot.
 */
export function fuzzyScore(q: string, text: string): number {
  if (!q) return 1
  if (text.includes(q)) return 100 + (text.startsWith(q) ? 50 : 0) - text.indexOf(q) * 0.1
  let ti = 0
  let score = 0
  let streak = 0
  for (const ch of q) {
    const idx = text.indexOf(ch, ti)
    if (idx === -1) return 0
    streak = idx === ti ? streak + 1 : 0
    score += 1 + streak * 2 + (idx === 0 || text[idx - 1] === ' ' ? 3 : 0)
    ti = idx + 1
  }
  return score
}

export interface SearchIndexEntry {
  slug: string
  primary: string // nom + kanji + traduction
  body: string // intro + phases + keyPoints
}

export function buildIndex(techniques: Technique[]): SearchIndexEntry[] {
  return techniques.map((t) => ({
    slug: t.slug,
    primary: normalize(`${t.name} ${t.kanji} ${t.translation}`),
    body: normalize(
      [t.intro, ...t.phases.map((p) => `${p.label} ${p.meaning} ${p.description}`), ...(t.keyPoints ?? [])].join(' '),
    ),
  }))
}

/** Renvoie la liste de slugs triés par pertinence, ou null si requête vide. */
export function searchIndex(index: SearchIndexEntry[], rawQuery: string): Map<string, number> | null {
  const q = normalize(rawQuery)
  if (q.length < 1) return null
  const result = new Map<string, number>()
  for (const e of index) {
    // Kanji : correspondance exacte de caractères (pas de fuzzy sur les idéogrammes)
    const primary = fuzzyScore(q, e.primary) * 3
    const body = q.length >= 3 && e.body.includes(q) ? 20 : 0
    const s = primary + body
    if (s > 0) result.set(e.slug, s)
  }
  return result
}
