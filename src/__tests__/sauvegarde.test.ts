import { describe, expect, it } from 'vitest'
import { dite, joursDepuis, rappelNecessaire } from '../lib/sauvegarde'

const now = new Date('2026-10-01T12:00:00Z')
const il_y_a = (jours: number) => new Date(now.getTime() - jours * 86_400_000).toISOString()

describe('rappel de sauvegarde', () => {
  it('ne dit rien tant qu’il y a peu à perdre', () => {
    expect(rappelNecessaire({ suivies: 2, derniere: null, reporte: null }, now)).toBe(false)
  })

  it('rappelle à qui n’a jamais exporté', () => {
    expect(rappelNecessaire({ suivies: 3, derniere: null, reporte: null }, now)).toBe(true)
  })

  it('se tait pendant les trente jours qui suivent un export', () => {
    expect(rappelNecessaire({ suivies: 20, derniere: il_y_a(29), reporte: null }, now)).toBe(false)
    expect(rappelNecessaire({ suivies: 20, derniere: il_y_a(30), reporte: null }, now)).toBe(true)
  })

  it('se tait deux semaines après un « plus tard »', () => {
    expect(rappelNecessaire({ suivies: 20, derniere: il_y_a(90), reporte: il_y_a(13) }, now)).toBe(false)
    expect(rappelNecessaire({ suivies: 20, derniere: il_y_a(90), reporte: il_y_a(14) }, now)).toBe(true)
  })

  it('traite une date illisible comme une date absente', () => {
    expect(joursDepuis('pas une date', now)).toBeNull()
    expect(rappelNecessaire({ suivies: 5, derniere: 'n’importe quoi', reporte: null }, now)).toBe(true)
  })

  it('dit la date comme on la dit', () => {
    expect(dite(null, now)).toBe('jamais')
    expect(dite(il_y_a(0), now)).toBe("aujourd'hui")
    expect(dite(il_y_a(1), now)).toBe('hier')
    expect(dite(il_y_a(12), now)).toBe('il y a 12 jours')
    expect(dite(il_y_a(95), now)).toBe('il y a 3 mois')
  })
})
