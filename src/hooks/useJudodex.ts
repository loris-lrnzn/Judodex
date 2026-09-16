import { useCallback, useMemo } from 'react'
import type {
  Combination,
  Family,
  FamilyGroup,
  JudodexData,
  Mastery,
  ProgressEntry,
  ProgressMap,
  Technique,
} from '../types/judodex'
import { buildIndex, searchIndex } from '../lib/search'
import { FAMILY_META, GROUPS, LEVEL_META, subFamilies } from '../lib/families'
import { dueCount, isDue, reviewQueue, schedule, today } from '../lib/srs'
import { BELTS, beltFor, beltIndex, beltSlugs, nextBeltAfter, sectionOf, type BeltId } from '../lib/belts'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'judodex:progress:v1'
const DEFAULT_ENTRY: ProgressEntry = { mastery: 'unknown', tokui: false, updatedAt: '' }

export interface BeltGroup {
  belt: (typeof BELTS)[number]
  /** Toutes les techniques imposées par la planche. */
  techniques: Technique[]
  /** Projections et travail au sol, comme la planche les sépare. */
  nage: Technique[]
  katame: Technique[]
  mastered: number
  learning: number
  /** Part acquise du programme, de 0 à 1. */
  ratio: number
}

export interface Section {
  group: FamilyGroup
  techniques: Technique[]
  subs: { family: Family; techniques: Technique[] }[]
  mastered: number
}

/**
 * Source unique de vérité de l'application : le catalogue, la progression
 * de l'utilisateur et tout ce qui s'en déduit. Aucun rendu ici.
 */
export function useJudodex(data: JudodexData) {
  const techniques = data.techniques

  const bySlug = useMemo(() => new Map(techniques.map((t) => [t.slug, t])), [techniques])
  const numberOf = useMemo(() => new Map(techniques.map((t, i) => [t.slug, i + 1])), [techniques])
  const index = useMemo(() => buildIndex(techniques), [techniques])

  /** Grade auquel chaque technique est imposée, ou null hors programme. */
  const beltBySlug = useMemo(() => new Map(techniques.map((t) => [t.slug, beltFor(t.slug)])), [techniques])
  const beltOfTechnique = useCallback((slug: string): BeltId | null => beltBySlug.get(slug) ?? null, [beltBySlug])

  // ─── Progression ─────────────────────────────────────────────
  const [progress, setProgress, resetProgress] = useLocalStorage<ProgressMap>(STORAGE_KEY, {})

  const getProgress = useCallback((slug: string): ProgressEntry => progress[slug] ?? DEFAULT_ENTRY, [progress])

  const patch = useCallback(
    (slug: string, changes: Partial<ProgressEntry>) =>
      setProgress((p) => ({ ...p, [slug]: { ...DEFAULT_ENTRY, ...p[slug], ...changes, updatedAt: new Date().toISOString() } })),
    [setProgress],
  )

  const setMastery = useCallback(
    (slug: string, mastery: Mastery) => {
      // Entrer en apprentissage programme la première révision pour aujourd'hui.
      const extra = mastery === 'unknown' ? { box: undefined, due: undefined } : { box: progress[slug]?.box ?? 0, due: progress[slug]?.due ?? today() }
      patch(slug, { mastery, ...extra })
    },
    [patch, progress],
  )

  const cycleMastery = useCallback(
    (slug: string) => {
      const order: Mastery[] = ['unknown', 'learning', 'mastered']
      setMastery(slug, order[(order.indexOf(progress[slug]?.mastery ?? 'unknown') + 1) % order.length])
    },
    [progress, setMastery],
  )

  const toggleTokui = useCallback((slug: string) => patch(slug, { tokui: !(progress[slug]?.tokui ?? false) }), [patch, progress])

  /** Enregistre le résultat d'une révision et replanifie la technique. */
  const review = useCallback(
    (slug: string, correct: boolean) => {
      const entry = progress[slug]
      const { box, due } = schedule(entry, correct)
      const mastery: Mastery = box >= 3 ? 'mastered' : 'learning'
      patch(slug, { box, due, mastery })
    },
    [patch, progress],
  )

  const replaceProgress = useCallback((next: ProgressMap) => setProgress(next), [setProgress])

  // ─── Statistiques ────────────────────────────────────────────
  const stats = useMemo(() => {
    let learning = 0
    let mastered = 0
    let tokui = 0
    const byGroup = {} as Record<FamilyGroup, { total: number; mastered: number; learning: number }>
    for (const g of GROUPS) byGroup[g] = { total: 0, mastered: 0, learning: 0 }
    for (const t of techniques) {
      const e = progress[t.slug]
      const g = FAMILY_META[t.family].group
      byGroup[g].total++
      if (e?.mastery === 'learning') {
        learning++
        byGroup[g].learning++
      }
      if (e?.mastery === 'mastered') {
        mastered++
        byGroup[g].mastered++
      }
      if (e?.tokui) tokui++
    }
    const total = techniques.length
    return {
      total,
      learning,
      mastered,
      tokui,
      untouched: total - learning - mastered,
      completion: total ? Math.round((mastered / total) * 100) : 0,
      byGroup,
      due: dueCount(techniques, progress),
    }
  }, [techniques, progress])

  // ─── Les grades ──────────────────────────────────────────────
  const [currentBelt, setCurrentBelt] = useLocalStorage<BeltId>('judodex:belt:v1', 'jaune')

  const beltGroups = useMemo<BeltGroup[]>(
    () =>
      BELTS.map((belt) => {
        // On suit l'ordre de la planche, pas celui du catalogue.
        const list = beltSlugs(belt)
          .map((slug) => bySlug.get(slug))
          .filter((t): t is Technique => !!t)
        const mastered = list.filter((t) => progress[t.slug]?.mastery === 'mastered').length
        const learning = list.filter((t) => progress[t.slug]?.mastery === 'learning').length
        return {
          belt,
          techniques: list,
          nage: list.filter((t) => sectionOf(t) === 'nage'),
          katame: list.filter((t) => sectionOf(t) === 'katame'),
          mastered,
          learning,
          ratio: list.length ? mastered / list.length : 0,
        }
      }),
    [bySlug, progress],
  )

  /** Les fiches qui ne figurent sur aucune planche de passage de grade. */
  const offProgramme = useMemo(() => techniques.filter((t) => !beltBySlug.get(t.slug)), [techniques, beltBySlug])

  const currentGroup = useMemo(() => beltGroups.find((g) => g.belt.id === currentBelt) ?? beltGroups[0], [beltGroups, currentBelt])
  const nextBelt = nextBeltAfter(currentBelt)

  /** Techniques du programme en cours qui restent à acquérir. */
  const beltRemaining = useMemo(
    () => currentGroup.techniques.filter((t) => progress[t.slug]?.mastery !== 'mastered'),
    [currentGroup, progress],
  )

  /** Tout le programme jusqu'au grade courant inclus. */
  const beltProgramme = useMemo(
    () =>
      techniques.filter((t) => {
        const b = beltBySlug.get(t.slug)
        return !!b && beltIndex(b) <= beltIndex(currentBelt)
      }),
    [techniques, beltBySlug, currentBelt],
  )

  // ─── Le catalogue, structuré ─────────────────────────────────
  const sections = useMemo<Section[]>(
    () =>
      GROUPS.map((group) => {
        const list = techniques.filter((t) => FAMILY_META[t.family].group === group)
        const subs = subFamilies(group)
        return {
          group,
          techniques: list,
          subs: subs.length > 1 ? subs.map((family) => ({ family, techniques: list.filter((t) => t.family === family) })) : [],
          mastered: list.filter((t) => progress[t.slug]?.mastery === 'mastered').length,
        }
      }),
    [techniques, progress],
  )

  // ─── Listes utiles à l'accueil ───────────────────────────────
  const inProgress = useMemo(
    () =>
      techniques
        .filter((t) => progress[t.slug]?.mastery === 'learning')
        .sort((a, b) => (progress[b.slug]?.updatedAt ?? '').localeCompare(progress[a.slug]?.updatedAt ?? '')),
    [techniques, progress],
  )

  const tokuiList = useMemo(() => techniques.filter((t) => progress[t.slug]?.tokui), [techniques, progress])

  const dueList = useMemo(() => techniques.filter((t) => isDue(progress[t.slug])), [techniques, progress])

  const session = useCallback((size = 12) => reviewQueue(techniques, progress, size), [techniques, progress])

  /**
   * Suggestions : d'abord le programme du grade en cours, puis la suite,
   * en commençant toujours par les plus fondamentales.
   */
  const suggestions = useMemo(
    () =>
      techniques
        .filter((t) => !progress[t.slug] || progress[t.slug].mastery === 'unknown')
        .sort((a, b) => {
          // Le programme de passage de grade passe avant le reste du répertoire.
          const ra = beltBySlug.get(a.slug) ? beltIndex(beltBySlug.get(a.slug)!) : 99
          const rb = beltBySlug.get(b.slug) ? beltIndex(beltBySlug.get(b.slug)!) : 99
          return ra - rb || LEVEL_META[a.level].rank - LEVEL_META[b.level].rank || (numberOf.get(a.slug) ?? 0) - (numberOf.get(b.slug) ?? 0)
        })
        .slice(0, 6),
    [techniques, progress, numberOf, beltBySlug],
  )

  // ─── Recherche ───────────────────────────────────────────────
  const search = useCallback(
    (query: string, limit = 12): Technique[] => {
      const scores = searchIndex(index, query)
      if (!scores) return []
      return techniques
        .filter((t) => scores.has(t.slug))
        .sort((a, b) => (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0))
        .slice(0, limit)
    },
    [index, techniques],
  )

  /**
   * Liens déclarés, résolus vers leur fiche. `lien` porte la déclaration
   * entière — situation, défense, attestation — dont le bilan a besoin ;
   * `type` et `context` restent exposés à plat pour les fiches.
   */
  const linksOf = useCallback(
    (t: Technique) =>
      (t.combinations ?? [])
        .map((c) => {
          const cible = bySlug.get(c.slug)
          return cible ? { technique: cible, lien: c, type: c.type, context: c.context } : null
        })
        .filter(
          (x): x is { technique: Technique; lien: Combination; type: Combination['type']; context: string } => x !== null,
        ),
    [bySlug],
  )

  /** Voisinage de famille, présenté à part et jamais comme un enchaînement. */
  const sameFamilyAs = useCallback(
    (t: Technique) => techniques.filter((x) => x.family === t.family && x.slug !== t.slug),
    [techniques],
  )

  /** Voisins dans l'ordre du catalogue, pour la navigation d'une fiche à l'autre. */
  const neighbours = useCallback(
    (slug: string) => {
      const i = techniques.findIndex((t) => t.slug === slug)
      if (i === -1) return { prev: null, next: null }
      return {
        prev: techniques[(i - 1 + techniques.length) % techniques.length],
        next: techniques[(i + 1) % techniques.length],
      }
    },
    [techniques],
  )

  return {
    meta: { name: data.name, description: data.description, scrapedAt: data.scrapedAt },
    techniques,
    bySlug,
    numberOf,
    sections,
    progress,
    getProgress,
    setMastery,
    cycleMastery,
    toggleTokui,
    review,
    resetProgress,
    replaceProgress,
    stats,
    beltOfTechnique,
    beltGroups,
    currentBelt,
    setCurrentBelt,
    currentGroup,
    nextBelt,
    beltRemaining,
    beltProgramme,
    offProgramme,
    inProgress,
    tokuiList,
    dueList,
    suggestions,
    session,
    search,
    linksOf,
    sameFamilyAs,
    neighbours,
  }
}

export type Judodex = ReturnType<typeof useJudodex>
