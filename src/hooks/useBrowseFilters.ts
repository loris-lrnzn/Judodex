import { useCallback, useMemo, useState } from 'react'
import type { Mastery, Technique } from '../types/judodex'
import type { BeltId } from '../lib/belts'
import type { Judodex } from './useJudodex'

export type GroupBy = 'family' | 'belt'

export interface BrowseFilters {
  belt: BeltId | null
  mastery: Mastery | null
  tokuiOnly: boolean
}

const EMPTY: BrowseFilters = { belt: null, mastery: null, tokuiOnly: false }

/** Filtres du catalogue et choix du classement, par famille ou par grade. */
export function useBrowseFilters(dex: Judodex) {
  const [filters, setFilters] = useState<BrowseFilters>(EMPTY)
  const [groupBy, setGroupBy] = useState<GroupBy>('family')

  const setBelt = useCallback((belt: BeltId | null) => setFilters((f) => ({ ...f, belt: f.belt === belt ? null : belt })), [])
  const setMastery = useCallback((mastery: Mastery | null) => setFilters((f) => ({ ...f, mastery: f.mastery === mastery ? null : mastery })), [])
  const toggleTokui = useCallback(() => setFilters((f) => ({ ...f, tokuiOnly: !f.tokuiOnly })), [])
  const clear = useCallback(() => setFilters(EMPTY), [])

  const active = (filters.belt ? 1 : 0) + (filters.mastery ? 1 : 0) + (filters.tokuiOnly ? 1 : 0)

  const apply = useCallback(
    (list: Technique[]) =>
      list.filter((t) => {
        if (filters.belt && dex.beltOfTechnique(t.slug) !== filters.belt) return false
        const e = dex.progress[t.slug]
        if (filters.mastery && (e?.mastery ?? 'unknown') !== filters.mastery) return false
        if (filters.tokuiOnly && !e?.tokui) return false
        return true
      }),
    [filters, dex],
  )

  const familySections = useMemo(
    () => dex.sections.map((s) => ({ ...s, techniques: apply(s.techniques) })).filter((s) => s.techniques.length > 0),
    [dex.sections, apply],
  )

  const beltSections = useMemo(
    () => dex.beltGroups.map((g) => ({ ...g, techniques: apply(g.techniques) })).filter((g) => g.techniques.length > 0),
    [dex.beltGroups, apply],
  )

  /** Le répertoire qui ne figure sur aucune planche de passage de grade. */
  const offSection = useMemo(() => (filters.belt ? [] : apply(dex.offProgramme)), [filters.belt, dex.offProgramme, apply])

  const count = useMemo(
    () =>
      groupBy === 'family'
        ? familySections.reduce((n, s) => n + s.techniques.length, 0)
        : beltSections.reduce((n, s) => n + s.techniques.length, 0) + offSection.length,
    [groupBy, familySections, beltSections, offSection],
  )

  return { filters, groupBy, setGroupBy, setBelt, setMastery, toggleTokui, clear, active, familySections, beltSections, offSection, count }
}
