import { describe, expect, it } from 'vitest'
import raw from '../data/techniques.json'
import type { JudodexData, Technique } from '../types/judodex'
import {
  VIERGE,
  contresDe,
  decoder,
  encoder,
  lire,
  normaliser,
  priorites,
  suggestionsCoin,
  suggestionsEntree,
  suggestionsReaction,
  suggestionsTransition,
  type MonJudo,
} from '../lib/monjudo'
import { secteurDe } from '../lib/secteurs'

const techniques = (raw as unknown as JudodexData).techniques as Technique[]
const cat = { techniques, bySlug: new Map(techniques.map((t) => [t.slug, t])) }
const connue = (s: string) => cat.bySlug.has(s)
const judo = (partiel: Partial<MonJudo>): MonJudo => ({ ...normaliser(VIERGE, connue), ...partiel })

describe('Mon judo, construit de A à Z', () => {
  it('part d’une page blanche et ne laisse entrer que ce qu’il reconnaît', () => {
    const e = normaliser(
      { garde: 'ambidextre', tokui: 'inconnue', coins: { 'av-d': ['o-goshi', 'o-goshi', 'rien'] }, reactions: { bloque: 'ko-uchi-gari', vole: 'x' }, courante: 'nulle-part' },
      connue,
    )
    expect(e.garde).toBe('droite')
    expect(e.tokui).toBeNull()
    expect(e.coins['av-d']).toEqual(['o-goshi'])
    expect(e.reactions).toEqual({ bloque: 'ko-uchi-gari' })
    expect(e.courante).toBe('toi')
  })

  it('range la technique de prédilection dans son coin, et le renverse en garde gauche', () => {
    const droite = lire(judo({ tokui: 'o-goshi' }), cat)
    expect(droite.coinTokui).toBe(secteurDe('o-goshi', 'droite'))
    expect(droite.parCoin[droite.coinTokui!][0].slug).toBe('o-goshi')
    const gauche = lire(judo({ tokui: 'o-goshi', garde: 'gauche' }), cat)
    expect(gauche.coinTokui).not.toBe(droite.coinTokui)
  })

  it('ne propose dans un coin que ce qui y tombe', () => {
    const mj = judo({ tokui: 'o-uchi-gari' })
    for (const s of ['av-d', 'ar-d', 'ar-g', 'av-g'] as const)
      for (const x of suggestionsCoin(s, mj, cat).slice(0, 12)) expect(secteurDe(x.t.slug, 'droite')).toBe(s)
  })

  it('met en tête des réactions les suites que le catalogue attache à cette réaction', () => {
    const mj = judo({ tokui: 'o-uchi-gari' })
    const recule = suggestionsReaction('recule', mj, cat)
    expect(recule.length).toBeGreaterThan(0)
    // O-uchi-gari déclare un redoublement quand uke retire sa jambe.
    expect(recule[0].attestee).toBe(true)
    expect(recule.map((x) => x.t.slug)).toContain('o-uchi-gari')
  })

  it('dit ce que uke peut renvoyer sur la technique choisie', () => {
    expect(contresDe(judo({ tokui: 'o-uchi-gari' }), cat).map((c) => c.t.slug)).toContain('o-uchi-gaeshi')
  })

  it('compte une direction ouverte seulement quand la suite change de coin', () => {
    const l = lire(judo({ tokui: 'o-uchi-gari', reactions: { recule: 'o-uchi-gari', bloque: 'ippon-seoi-nage' } }), cat)
    expect(l.reactions.find((r) => r.id === 'recule')!.changeDeCoin).toBe(false)
    expect(l.reactions.find((r) => r.id === 'bloque')!.changeDeCoin).toBe(true)
    expect(l.directionsOuvertes).toBe(1)
  })

  it('propose les entrées et les passages au sol à partir du judo construit', () => {
    const l = lire(judo({ tokui: 'o-uchi-gari' }), cat)
    expect(suggestionsEntree('ai-yotsu:plante', l, cat)[0].t.slug).toBe('o-uchi-gari')
    expect(suggestionsTransition(l, cat).map((x) => x.t.slug)).toContain('tate-shiho-gatame')
  })

  it('ne donne jamais plus de trois priorités, dans l’ordre de construction', () => {
    const vide = priorites(lire(judo({}), cat))
    expect(vide).toHaveLength(3)
    expect(vide[0].etape).toBe('technique')
  })

  it('tient la carte entière dans un lien, et la relit à l’identique', () => {
    const mj = judo({
      prenom: 'Loris',
      garde: 'gauche',
      tokui: 'seoi-otoshi',
      coins: { 'av-d': [], 'ar-d': ['o-uchi-gari'], 'ar-g': ['ko-uchi-gari'], 'av-g': [] },
      reactions: { bloque: 'ko-uchi-gari' },
      entrees: { 'ai-yotsu:plante': 'seoi-otoshi' },
      transition: 'kesa-gatame',
      finition: 'ude-hishigi-juji-gatame',
    })
    const relu = decoder(encoder(mj), connue)!
    for (const k of ['prenom', 'garde', 'tokui', 'coins', 'reactions', 'entrees', 'transition', 'finition'] as const) expect(relu[k]).toEqual(mj[k])
    expect(relu.courante).toBe('carte')
    expect(decoder('n’importe quoi', connue)).toBeNull()
  })
})
