import type { ProgressEntry, Technique } from '../types/judodex'

/**
 * Révision espacée, système de Leitner simplifié.
 * Une réponse juste fait monter d'une boîte, une erreur ramène à la première.
 * Les intervalles sont en jours.
 */
export const INTERVALS = [0, 1, 3, 7, 21, 60] as const
export const MAX_BOX = INTERVALS.length - 1

export const today = () => new Date().toISOString().slice(0, 10)

export const addDays = (days: number, from = new Date()) => {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Prochaine boîte et prochaine échéance après une réponse. */
export function schedule(entry: ProgressEntry | undefined, correct: boolean): { box: number; due: string } {
  const current = entry?.box ?? 0
  const box = correct ? Math.min(current + 1, MAX_BOX) : 0
  return { box, due: addDays(INTERVALS[box]) }
}

/** Une technique est à réviser si elle est suivie et que son échéance est passée. */
export const isDue = (entry: ProgressEntry | undefined, day = today()) =>
  !!entry && entry.mastery !== 'unknown' && (entry.due ?? '0000-00-00') <= day

/**
 * File de révision : d'abord les échéances dépassées (les plus anciennes
 * d'abord), puis, si la séance est trop courte, des techniques en cours.
 */
export function reviewQueue(techniques: Technique[], progress: Record<string, ProgressEntry>, size = 12): Technique[] {
  const day = today()
  const due = techniques
    .filter((t) => isDue(progress[t.slug], day))
    .sort((a, b) => (progress[a.slug]?.due ?? '').localeCompare(progress[b.slug]?.due ?? ''))
  if (due.length >= size) return due.slice(0, size)
  const learning = techniques.filter((t) => progress[t.slug]?.mastery === 'learning' && !isDue(progress[t.slug], day))
  return [...due, ...learning].slice(0, size)
}

/** Nombre de techniques dont l'échéance est atteinte. */
export const dueCount = (techniques: Technique[], progress: Record<string, ProgressEntry>) => {
  const day = today()
  return techniques.reduce((n, t) => n + (isDue(progress[t.slug], day) ? 1 : 0), 0)
}
