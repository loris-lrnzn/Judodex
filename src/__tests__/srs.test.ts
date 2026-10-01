import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addDays, isDue, jourLocal, schedule, today } from '../lib/srs'

describe('jours de révision en heure locale', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'Europe/Paris')
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('donne le jour local, pas le jour UTC, juste après minuit', () => {
    // 00 h 30 à Paris en été : il est encore 22 h 30 la veille en UTC.
    vi.setSystemTime(new Date('2026-07-15T22:30:00Z'))
    expect(today()).toBe('2026-07-16')
  })

  it('donne le jour local juste avant minuit', () => {
    // 23 h 30 à Paris en hiver : 22 h 30 UTC, même jour.
    vi.setSystemTime(new Date('2026-01-15T22:30:00Z'))
    expect(today()).toBe('2026-01-15')
  })

  it('compte les échéances en jours civils, au passage à l’heure d’été', () => {
    // Le 29 mars 2026 compte 23 heures à Paris.
    vi.setSystemTime(new Date('2026-03-28T12:00:00Z'))
    expect(addDays(1)).toBe('2026-03-29')
    expect(addDays(3)).toBe('2026-03-31')
  })

  it('ne rend pas une technique due avant son jour local', () => {
    vi.setSystemTime(new Date('2026-07-15T22:30:00Z'))
    const { due } = schedule(undefined, true) // boîte 1 : demain
    expect(due).toBe('2026-07-17')
    expect(isDue({ mastery: 'learning', tokui: false, box: 1, due, updatedAt: '' })).toBe(false)
  })

  it('formate sans dépendre de la locale', () => {
    expect(jourLocal(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
