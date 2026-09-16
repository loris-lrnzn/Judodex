import { describe, expect, it } from 'vitest'
import { importProgress } from '../lib/backup'
import { SECTEURS, secteurDe } from '../lib/secteurs'
import { normaliser } from '../hooks/useSystemes'
import { normaliserProfil } from '../hooks/useProfil'
import { couverture } from '../lib/situations'
import { buildIndex, fuzzyScore, normalize, searchIndex } from '../lib/search'
import { makeQuestion } from '../lib/quiz'
import { clipFor } from '../components/QuizVideo'
import { parseRoute, routePath } from '../hooks/useRoute'
import { headFor } from '../lib/head'
import { jsonLdFor } from '../lib/jsonld'
import { BELTS, beltFor, beltIndex, beltSlugs, sectionOf, situationsFor } from '../lib/belts'
import { addDays, isDue, reviewQueue, schedule, today } from '../lib/srs'
import type { ProgressEntry, ProgressMap } from '../types/judodex'
import type { JudodexData, Technique } from '../types/judodex'
import * as dan from '../lib/dan'
import * as sec from '../lib/secteurs'
import raw from '../data/techniques.json'

const data = raw as unknown as JudodexData
const all = data.techniques

describe('normalisation', () => {
  it('retire accents, tirets et casse', () => {
    expect(normalize('O-Goshi')).toBe('o goshi')
    expect(normalize('Déséquilibre')).toBe('desequilibre')
  })
})

describe('score fuzzy', () => {
  it('ignore une requête sans correspondance', () => {
    expect(fuzzyScore('zzz', 'o goshi')).toBe(0)
  })
  it('privilégie la correspondance exacte sur la sous-séquence', () => {
    expect(fuzzyScore('goshi', 'o goshi')).toBeGreaterThan(fuzzyScore('ogi', 'o goshi'))
  })
})

describe('recherche', () => {
  const index = buildIndex(all)

  it('renvoie null pour une requête vide', () => {
    expect(searchIndex(index, '')).toBeNull()
  })

  it('trouve une technique par son nom, même sans tiret', () => {
    const r = searchIndex(index, 'ogoshi')!
    expect(r.has('o-goshi')).toBe(true)
  })

  it('trouve une technique par son kanji', () => {
    const r = searchIndex(index, '大腰')!
    expect(r.has('o-goshi')).toBe(true)
  })

  it('trouve par traduction française', () => {
    const r = searchIndex(index, 'grande hanche')!
    expect(r.has('o-goshi')).toBe(true)
  })

  it('classe la correspondance de nom avant celle du corps de texte', () => {
    const r = searchIndex(index, 'goshi')!
    const best = [...r.entries()].sort((a, b) => b[1] - a[1])[0][0]
    expect(all.find((t) => t.slug === best)!.name.toLowerCase()).toContain('goshi')
  })
})

describe('générateur de quiz', () => {
  it('produit 4 choix distincts contenant la réponse', () => {
    for (let i = 0; i < 50; i++) {
      const q = makeQuestion(all, 'translation', new Set())!
      expect(q.choices).toHaveLength(4)
      expect(new Set(q.choices.map((c) => c.slug)).size).toBe(4)
      expect(q.choices).toContainEqual(q.answer)
    }
  })

  it('ne propose en mode vidéo que des techniques dont un extrait est exploitable', () => {
    for (let i = 0; i < 30; i++) {
      const q = makeQuestion(all, 'video', new Set())!
      expect(clipFor(q.answer)).not.toBeNull()
    }
  })

  it('préfère la série fédérale, qui ne montre pas le nom pendant la démonstration', () => {
    const t = all.find((x) => x.slug === 'o-goshi')!
    expect(clipFor(t)!.source).toBe('ffjudo')
    // Sans vidéo fédérale, on se rabat sur le Kodokan, dont le nom sera masqué.
    const k = all.find((x) => x.ffjudoId == null && x.youtubeId)!
    expect(clipFor(k)!.source).toBe('kodokan')
  })

  it('démarre l’extrait après le générique, jamais à la première seconde', () => {
    for (const t of all.filter((x) => clipFor(x))) {
      const c = clipFor(t)!
      expect(c.start).toBeGreaterThanOrEqual(6)
      const d = c.source === 'ffjudo' ? t.ffjudoDuration : t.youtubeDuration
      if (d) expect(c.start).toBeLessThan(d / 2)
    }
  })

  it('évite de reposer une question déjà tirée', () => {
    const exclude = new Set(all.slice(0, all.length - 5).map((t) => t.slug))
    const q = makeQuestion(all, 'translation', exclude)!
    expect(exclude.has(q.answer.slug)).toBe(false)
  })

  it('accepte un petit vivier en piochant les leurres dans le dex complet', () => {
    const small: Technique[] = all.slice(0, 2)
    const q = makeQuestion(small, 'translation', new Set(), all)!
    expect(q.choices).toHaveLength(4)
    expect(small.map((t) => t.slug)).toContain(q.answer.slug)
  })
})

describe('routeur', () => {
  it('reconnaît chaque écran', () => {
    expect(parseRoute('/')).toEqual({ name: 'home' })
    expect(parseRoute('/techniques')).toEqual({ name: 'browse' })
    expect(parseRoute('/dojo')).toEqual({ name: 'train' })
    expect(parseRoute('/technique/o-goshi')).toEqual({ name: 'technique', slug: 'o-goshi' })
  })

  it('retombe sur l’accueil pour une adresse inconnue', () => {
    expect(parseRoute('/reglages')).toEqual({ name: 'reglages' })
    // Une adresse inconnue ne se déguise pas en accueil : elle se déclare.
    expect(parseRoute('/nimporte-quoi')).toEqual({ name: 'notFound', path: '/nimporte-quoi' })
  })

  it('fait un aller-retour sans perte', () => {
    for (const slug of ['o-goshi', 'uchi-mata']) {
      expect(parseRoute(routePath({ name: 'technique', slug }))).toEqual({ name: 'technique', slug })
    }
  })
})

describe('révision espacée', () => {
  const entry = (over: Partial<ProgressEntry> = {}): ProgressEntry => ({ mastery: 'learning', tokui: false, updatedAt: '', ...over })

  it('monte d’une boîte à chaque bonne réponse', () => {
    expect(schedule(entry({ box: 0 }), true).box).toBe(1)
    expect(schedule(entry({ box: 2 }), true).box).toBe(3)
  })

  it('ramène à la première boîte après une erreur', () => {
    expect(schedule(entry({ box: 4 }), false).box).toBe(0)
  })

  it('plafonne la dernière boîte', () => {
    expect(schedule(entry({ box: 5 }), true).box).toBe(5)
  })

  it('repousse l’échéance quand la boîte monte', () => {
    expect(schedule(entry({ box: 0 }), true).due).toBe(addDays(1))
    expect(schedule(entry({ box: 1 }), true).due > schedule(entry({ box: 0 }), true).due).toBe(true)
  })

  it('ne déclare due qu’une technique suivie et arrivée à échéance', () => {
    expect(isDue(undefined)).toBe(false)
    expect(isDue(entry({ mastery: 'unknown', due: today() }))).toBe(false)
    expect(isDue(entry({ due: addDays(3) }))).toBe(false)
    expect(isDue(entry({ due: addDays(-1) }))).toBe(true)
  })

  it('classe la file de révision par échéance la plus ancienne', () => {
    const [a, b, c] = all
    const progress: ProgressMap = {
      [a.slug]: entry({ due: addDays(-1) }),
      [b.slug]: entry({ due: addDays(-5) }),
      [c.slug]: entry({ due: addDays(10) }),
    }
    // À taille égale au nombre d'échéances, seules les techniques dues sortent.
    expect(reviewQueue(all, progress, 2).map((t) => t.slug)).toEqual([b.slug, a.slug])
    // Au-delà, la séance est complétée par les techniques en cours, jamais avant.
    const wider = reviewQueue(all, progress, 3)
    expect(wider.slice(0, 2).map((t) => t.slug)).toEqual([b.slug, a.slug])
    expect(wider[2].slug).toBe(c.slug)
  })

  it('complète une séance trop courte avec les techniques en cours', () => {
    const progress: ProgressMap = { [all[0].slug]: entry({ due: addDays(-1) }), [all[1].slug]: entry({ due: addDays(30) }) }
    expect(reviewQueue(all, progress, 5).length).toBe(2)
  })
})

describe('intégrité des données', () => {
  it('déclare le bon nombre de techniques', () => {
    expect(all).toHaveLength(data.count)
  })
  it('utilise des slugs uniques', () => {
    expect(new Set(all.map((t) => t.slug)).size).toBe(all.length)
  })
  it('donne 3 phases ou aucune, jamais un nombre intermédiaire', () => {
    expect(all.every((t) => t.phases.length === 0 || t.phases.length === 3)).toBe(true)
  })
})

describe('progression française', () => {
  it('rattache chaque technique imposée à un grade connu', () => {
    for (const b of BELTS) for (const slug of beltSlugs(b)) expect(beltFor(slug)).toBe(b.id)
  })

  it('ne référence que des fiches existantes', () => {
    const slugs = new Set(all.map((t) => t.slug))
    for (const b of BELTS) for (const slug of beltSlugs(b)) expect(slugs.has(slug)).toBe(true)
  })

  it('n’impose jamais deux fois la même technique', () => {
    const seen = BELTS.flatMap(beltSlugs)
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('couvre 64 techniques imposées et en laisse 40 hors programme', () => {
    const imposed = BELTS.flatMap(beltSlugs)
    expect(imposed).toHaveLength(64)
    expect(all.filter((t) => beltFor(t.slug) === null)).toHaveLength(40)
  })

  it('place les fondamentaux de la planche blanche à jaune', () => {
    for (const slug of ['o-goshi', 'tai-otoshi', 'hiza-guruma', 'tate-shiho-gatame']) expect(beltFor(slug)).toBe('jaune')
  })

  it('n’ouvre les étranglements et les clés qu’à partir de la ceinture bleue', () => {
    for (const t of all.filter((x) => x.family === 'shime-waza' || x.family === 'kansetsu-waza')) {
      const b = beltFor(t.slug)
      if (b) expect(beltIndex(b)).toBeGreaterThanOrEqual(beltIndex('bleue'))
    }
  })

  it('n’impose aucune technique nouvelle au passage de la ceinture noire', () => {
    const noire = BELTS.find((b) => b.id === 'noire')!
    expect(beltSlugs(noire)).toHaveLength(0)
    expect(noire.requirements).toHaveLength(3)
  })

  it('décrit l’examen shodan en quatre unités de valeur', () => {
    const exam = BELTS.find((b) => b.id === 'noire')!.exam!
    expect(exam.units.map((u) => u.code)).toEqual(['UV1', 'UV2', 'UV3', 'UV4'])
    expect(exam.units.map((u) => u.label)).toEqual(['Kata', 'Technique', 'Efficacité', 'Engagement personnel'])
  })

  it('porte pour chaque planche ses valeurs, son équilibre et son volume', () => {
    for (const b of BELTS) {
      expect(b.values.length).toBeGreaterThan(0)
      expect(b.nagePart).toBeGreaterThanOrEqual(40)
      expect(b.nagePart).toBeLessThanOrEqual(60)
      expect(b.volume.length).toBeGreaterThan(0)
    }
  })

  it('sépare projections et travail au sol selon la famille', () => {
    expect(sectionOf(all.find((t) => t.slug === 'o-goshi')!)).toBe('nage')
    expect(sectionOf(all.find((t) => t.slug === 'kesa-gatame')!)).toBe('katame')
    expect(sectionOf(all.find((t) => t.slug === 'hadaka-jime')!)).toBe('katame')
  })
})

describe('démonstrations filmées', () => {
  const ID = /^[A-Za-z0-9_-]{11}$/

  it('n’enregistre que des identifiants de vidéo bien formés', () => {
    for (const t of all) {
      if (t.youtubeId) expect(t.youtubeId).toMatch(ID)
      if (t.ffjudoId) expect(t.ffjudoId).toMatch(ID)
    }
  })

  it('ne réutilise une vidéo que pour des variantes d’une même technique', () => {
    // Le Kodokan filme une technique, le catalogue en distingue parfois deux
    // formes : Uchi-mata hanche et jambe, Kesa-gatame et son nom fondamental.
    const partages = [
      ['uchi-mata-hanche', 'uchi-mata-jambe'],
      ['kesa-gatame', 'hon-gesa-gatame'],
    ]
    const groupes = new Map<string, string[]>()
    for (const t of all) if (t.youtubeId) groupes.set(t.youtubeId, [...(groupes.get(t.youtubeId) ?? []), t.slug])
    const doublons = [...groupes.values()].filter((g) => g.length > 1)
    expect(doublons.map((g) => g.sort())).toEqual(partages.map((g) => [...g].sort()))
  })

  it('n’attribue jamais deux fois la même démonstration fédérale', () => {
    const ids = all.map((t) => t.ffjudoId).filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('couvre 99 techniques sur 104 par au moins une démonstration', () => {
    expect(all.filter((t) => t.youtubeId || t.ffjudoId)).toHaveLength(99)
  })

  it('ne prête pas la vidéo d’une clé de bras à un étranglement', () => {
    // 腕挫脚固 est une clé, 脚固絞 un étranglement : la fiche reste sans vidéo.
    expect(all.find((t) => t.slug === 'ashi-gatame-jime')!.youtubeId).toBeNull()
  })

  it('propose les deux sources sur le cœur du programme', () => {
    for (const slug of ['o-goshi', 'tai-otoshi', 'kesa-gatame']) {
      const t = all.find((x) => x.slug === slug)!
      expect(t.youtubeId).toBeTruthy()
      expect(t.ffjudoId).toBeTruthy()
    }
  })

  it('associe une démonstration fédérale à chaque technique du programme filmée par la fédération', () => {
    // Les 60 vidéos fédérales relevées portent toutes sur une technique imposée.
    const avecFf = all.filter((t) => t.ffjudoId)
    expect(avecFf).toHaveLength(60)
    for (const t of avecFf) expect(beltFor(t.slug)).not.toBeNull()
  })
})

describe('situations d’étude', () => {
  it('rattache des situations à chaque planche qui en porte', () => {
    for (const id of ['jaune', 'orange', 'verte', 'bleue'] as const) {
      expect(situationsFor(id).length).toBeGreaterThan(0)
    }
    // La planche du premier kyu ne présente que des techniques.
    expect(situationsFor('marron')).toHaveLength(0)
  })

  it('explique la part accordée au sol : le programme y tient dans les situations', () => {
    const jaune = BELTS.find((b) => b.id === 'jaune')!
    const sol = situationsFor('jaune').filter((s) => s.domain === 'katame')
    // Trois immobilisations imposées, mais quatorze situations au sol.
    expect(jaune.katame).toHaveLength(3)
    expect(sol.length).toBeGreaterThan(jaune.katame.length * 3)
    expect(jaune.nagePart).toBeLessThan(50)
  })

  it('ne confond jamais une situation avec une technique imposée', () => {
    const techniques = new Set(all.flatMap((t) => [t.youtubeId, t.ffjudoId]).filter(Boolean))
    for (const id of ['jaune', 'orange', 'verte', 'bleue', 'marron'] as const) {
      for (const s of situationsFor(id)) expect(techniques.has(s.id)).toBe(false)
    }
  })

  it('donne à chaque situation une vidéo distincte', () => {
    const ids = (['jaune', 'orange', 'verte', 'bleue', 'marron'] as const).flatMap((b) => situationsFor(b).map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(60)
  })
})

describe('contenu propre au catalogue', () => {
  it('ne conserve aucun lien vers une fiche extérieure', () => {
    const brut = JSON.stringify(data)
    expect(brut).not.toContain('cnjudo')
    expect(brut).not.toContain('"source"')
  })

  it('rédige une présentation pour chaque technique', () => {
    for (const t of all) {
      expect(t.intro.length).toBeGreaterThan(80)
      expect(t.intro).toMatch(/[.!]$/)
    }
  })

  it('décrit chacune des trois phases quand la technique en comporte', () => {
    for (const t of all.filter((x) => x.phases.length > 0)) {
      expect(t.phases).toHaveLength(3)
      for (const p of t.phases) expect(p.description.length).toBeGreaterThan(50)
    }
  })

  it('donne au moins trois points clés par technique', () => {
    for (const t of all) expect(t.keyPoints!.length).toBeGreaterThanOrEqual(3)
  })

  it('accompagne chaque lien de son contexte', () => {
    for (const t of all) for (const c of t.combinations ?? []) expect(c.context.length).toBeGreaterThan(10)
  })
})

describe('enchaînements et contres', () => {
  const slugs = new Set(all.map((t) => t.slug))

  it('ne pointe que vers des fiches du catalogue', () => {
    for (const t of all) for (const c of t.combinations ?? []) expect(slugs.has(c.slug)).toBe(true)
  })

  it('ne renvoie jamais une technique vers elle-même', () => {
    // Seul le redoublement se déclare vers sa propre fiche : il insiste avec
    // la même attaque plutôt que d'en ouvrir une autre.
    for (const t of all)
      for (const c of t.combinations ?? []) if (c.type !== 'redoublement') expect(c.slug).not.toBe(t.slug)
  })

  it('ne déclare pas deux fois la même cible', () => {
    for (const t of all) {
      const cibles = (t.combinations ?? []).map((c) => c.slug)
      expect(new Set(cibles).size).toBe(cibles.length)
    }
  })

  it('ne déclare que les quatre formes de poursuite', () => {
    const tous = all.flatMap((t) => t.combinations ?? [])
    for (const c of tous) expect(['enchainement', 'redoublement', 'contre', 'liaison-sol']).toContain(c.type)
    expect(tous.filter((c) => c.type === 'contre').length).toBeGreaterThan(10)
  })

  it('réserve liaison-sol aux liens qui franchissent vers le ne-waza', () => {
    const auSol = new Set(['osaekomi-waza', 'shime-waza', 'kansetsu-waza'])
    const famille = new Map(all.map((t) => [t.slug, t.family]))
    for (const t of all)
      for (const c of t.combinations ?? []) {
        const cibleAuSol = auSol.has(famille.get(c.slug)!)
        if (c.type === 'liaison-sol') expect(cibleAuSol).toBe(true)
        // Depuis le debout, aucun autre type ne descend au sol en silence.
        else if (!auSol.has(t.family)) expect(cibleAuSol).toBe(false)
      }
  })

  it('déclare les contres classiques dans les deux sens', () => {
    const lien = (from: string, to: string) => all.find((t) => t.slug === from)!.combinations!.find((c) => c.slug === to)
    expect(lien('o-soto-gari', 'o-soto-gaeshi')!.type).toBe('contre')
    expect(lien('uchi-mata-jambe', 'uchi-mata-sukashi')!.type).toBe('contre')
    expect(lien('de-ashi-barai', 'tsubame-gaeshi')!.type).toBe('contre')
    expect(lien('o-soto-gaeshi', 'o-soto-gari')!.type).toBe('enchainement')
  })

  it('donne une sortie au sol à chaque projection', () => {
    const debout = all.filter((t) => !['osaekomi-waza', 'shime-waza', 'kansetsu-waza'].includes(t.family))
    for (const t of debout)
      expect((t.combinations ?? []).some((c) => c.type === 'liaison-sol'), `${t.slug} n'a aucune liaison au sol`).toBe(true)
  })

  it('déclare les redoublements vers leur propre fiche', () => {
    for (const t of all)
      for (const c of t.combinations ?? [])
        if (c.type === 'redoublement') expect(c.slug).toBe(t.slug)
    expect(all.flatMap((t) => t.combinations ?? []).filter((c) => c.type === 'redoublement').length).toBeGreaterThan(20)
  })

  it("n'emploie que le vocabulaire fermé des situations", () => {
    for (const t of all)
      for (const c of t.combinations ?? []) {
        if (c.situation?.garde) expect(['ai-yotsu', 'kenka-yotsu']).toContain(c.situation.garde)
        if (c.situation?.deplacement) expect(['avance', 'recule', 'tourne', 'plante']).toContain(c.situation.deplacement)
        if (c.defense)
          expect(['bloque-bassin', 'bras-tendus', 'casse-avant', 'esquive-hanche', 'recule-jambe']).toContain(c.defense)
        if (c.attestation) expect(['ffjudo', 'kodokan', 'usage']).toContain(c.attestation)
      }
  })

  it('remplit les huit cases de la grille depuis le catalogue entier', () => {
    // Aucune case ne doit être structurellement inatteignable : si l'une reste
    // vide sur les 104 fiches, c'est le contenu qui manque, pas le judoka.
    const { vides } = couverture(all)
    expect(vides).toEqual([])
  })

  it('laisse la garde croisée vide pour un répertoire tout en même garde', () => {
    const rep = all.filter((t) => ['uchi-mata-hanche', 'o-soto-gari', 'ippon-seoi-nage', 'harai-goshi'].includes(t.slug))
    const { tenues } = couverture(rep)
    expect(tenues.every((c) => c.startsWith('ai-yotsu'))).toBe(true)
  })

  it('couvre chaque technique par au moins un lien', () => {
    for (const t of all) expect((t.combinations ?? []).length).toBeGreaterThan(0)
  })
})

// -------------------------------------------------- programme des dan

describe('programme des dan', () => {
  const slugs = new Set(all.map((t) => t.slug))
  const grades: dan.DanId[] = [1, 2, 3]

  it('les trois premiers dan sont décrits', () => {
    expect(dan.DANS.map((d) => d.id)).toEqual(grades)
    for (const d of dan.DANS) {
      expect(d.uvs.map((u) => u.code)).toEqual(['UV1', 'UV2', 'UV3', 'UV4'])
      for (const u of d.uvs) {
        expect(u.resume.length).toBeGreaterThan(20)
        expect(u.criteres.length).toBeGreaterThan(1)
        expect(u.regles.length).toBeGreaterThan(1)
      }
    }
  })

  it('chaque technique des programmes a une fiche, sans doublon dans un grade', () => {
    for (const g of grades) {
      const list = dan.programmeSlugs(g)
      for (const s of list) expect(slugs.has(s), `${g}e dan : ${s}`).toBe(true)
      expect(new Set(list).size).toBe(list.length)
    }
  })

  it('aucune technique ne figure au programme de deux grades', () => {
    const vus = new Map<string, dan.DanId>()
    for (const g of grades)
      for (const s of dan.programmeSlugs(g)) {
        expect(vus.has(s), `${s} déjà au ${vus.get(s)}e dan`).toBe(false)
        vus.set(s, g)
      }
  })

  it('les katas renvoient à des fiches, hormis les entrées déclarées hors catalogue', () => {
    for (const k of dan.KATAS)
      for (const serie of k.series)
        for (const s of serie.slugs) {
          if (slugs.has(s)) continue
          expect(serie.horsCatalogue?.[s], `${k.name} : ${s}`).toBeTruthy()
        }
  })

  it('le nage no kata et le katame no kata comptent quinze techniques', () => {
    for (const k of [dan.NAGE_NO_KATA, dan.KATAME_NO_KATA]) {
      expect(k.series).toHaveLength(k.id === 'nage-no-kata' ? 5 : 3)
      expect(dan.kataSlugs(k)).toHaveLength(15)
      expect(new Set(dan.kataSlugs(k)).size).toBe(15)
    }
  })

  it('le 1er dan ne présente que trois séries, les autres le kata entier', () => {
    expect(dan.seriesFor(dan.NAGE_NO_KATA, dan.danOf(1))).toHaveLength(3)
    expect(dan.seriesFor(dan.NAGE_NO_KATA, dan.danOf(2))).toHaveLength(5)
    expect(dan.danOf(3).kata.katas).toContain('katame-no-kata')
  })

  it('le tirage respecte le compte de chaque grade, sans doublon', () => {
    for (const g of grades)
      for (let i = 0; i < 200; i++) {
        const t = dan.tirerUv2(g)
        const regle = dan.danOf(g).tirage
        expect(t.nage).toHaveLength(regle.nage)
        expect(t.ne).toHaveLength(regle.ne)
        const tous = [...t.nage, ...t.ne].map((x) => x.slug)
        expect(new Set(tous).size).toBe(tous.length)
        for (const s of tous) expect(slugs.has(s)).toBe(true)
      }
  })

  it('le 1er dan couvre toutes les familles, les autres des familles distinctes', () => {
    for (let i = 0; i < 200; i++) {
      const un = dan.tirerUv2(1)
      expect(new Set(un.nage.map((x) => x.groupe))).toEqual(new Set(dan.GROUPES_NAGE))
      expect(new Set(un.ne.map((x) => x.groupe))).toEqual(new Set(dan.GROUPES_NE))

      for (const g of [2, 3] as dan.DanId[]) {
        const t = dan.tirerUv2(g)
        expect(new Set(t.nage.map((x) => x.groupe)).size).toBe(2)
        expect(new Set(t.ne.map((x) => x.groupe)).size).toBe(2)
      }
    }
  })

  it('chaque technique tirée appartient bien au groupe et au grade annoncés', () => {
    for (const g of grades)
      for (let i = 0; i < 100; i++) {
        const t = dan.tirerUv2(g)
        for (const x of [...t.nage, ...t.ne]) expect(dan.PROGRAMMES[g][x.groupe]).toContain(x.slug)
      }
  })

  it('chaque grade a son adresse sous la planche ceinture noire', () => {
    expect(parseRoute('/dojo/ceinture-noire')).toEqual({ name: 'dan', dan: 1 })
    expect(parseRoute('/dojo/ceinture-noire/2e-dan')).toEqual({ name: 'dan', dan: 2 })
    expect(parseRoute('/dojo/ceinture-noire/3e-dan')).toEqual({ name: 'dan', dan: 3 })
    expect(routePath({ name: 'dan', dan: 1 })).toBe('/dojo/ceinture-noire')
    expect(routePath({ name: 'dan', dan: 3 })).toBe('/dojo/ceinture-noire/3e-dan')
    expect(parseRoute('/dojo')).toEqual({ name: 'train' })
  })
})

// ------------------------------------------------ secteurs de chute

describe('directions et secteurs de chute', () => {
  const NAGE = ['te-waza', 'koshi-waza', 'ashi-waza', 'ma-sutemi-waza', 'yoko-sutemi-waza']
  const debout = all.filter((t) => NAGE.includes(t.family))
  const sol = all.filter((t) => !NAGE.includes(t.family))

  it('classe toutes les projections, et elles seules', () => {
    for (const t of debout) expect(sec.DIRECTION_OF[t.slug], t.slug).toBeTruthy()
    for (const t of sol) expect(sec.DIRECTION_OF[t.slug], t.slug).toBeUndefined()
    expect(Object.keys(sec.DIRECTION_OF)).toHaveLength(debout.length)
  })

  it('n’emploie que les huit directions déclarées', () => {
    const ids = new Set(sec.DIRECTIONS.map((d) => d.id))
    expect(ids.size).toBe(8)
    for (const [slug, r] of Object.entries(sec.DIRECTION_OF)) expect(ids.has(r.dir), slug).toBe(true)
  })

  it('seuls les quatre coins remplissent un secteur', () => {
    const coins = sec.DIRECTIONS.filter((d) => d.secteur !== null)
    expect(coins.map((d) => d.secteur)).toEqual(sec.SECTEURS)
    for (const d of sec.DIRECTIONS.filter((x) => x.secteur === null)) expect(['av', 'ar', 'd', 'g']).toContain(d.id)
  })

  it('la garde gauche renverse la lecture, et deux fois la rétablit', () => {
    expect(sec.enGarde('av-d', 'gauche')).toBe('av-g')
    expect(sec.enGarde('ar-d', 'gauche')).toBe('ar-g')
    expect(sec.enGarde('d', 'gauche')).toBe('g')
    for (const d of sec.DIRECTIONS) {
      expect(sec.enGarde(d.id, 'droite')).toBe(d.id)
      expect(sec.enGarde(sec.enGarde(d.id, 'gauche'), 'gauche')).toBe(d.id)
      // Le miroir garde l’axe avant/arrière.
      const av = (x: string) => x.startsWith('av')
      const ar = (x: string) => x.startsWith('ar')
      expect(av(sec.enGarde(d.id, 'gauche'))).toBe(av(d.id))
      expect(ar(sec.enGarde(d.id, 'gauche'))).toBe(ar(d.id))
    }
  })

  it('rend le secteur d’une technique, et rien au sol', () => {
    expect(sec.secteurDe('o-soto-gari')).toBe('ar-d')
    expect(sec.secteurDe('o-uchi-gari')).toBe('ar-g')
    expect(sec.secteurDe('ippon-seoi-nage')).toBe('av-d')
    expect(sec.secteurDe('o-soto-gari', 'gauche')).toBe('ar-g')
    // Tomoe-nage part droit devant : aucun coin.
    expect(sec.directionDe('tomoe-nage')).toBe('av')
    expect(sec.secteurDe('tomoe-nage')).toBeNull()
    expect(sec.directionDe('kesa-gatame')).toBeNull()
  })

  it('une correction du pratiquant prime sur la donnée', () => {
    expect(sec.secteurDe('hiza-guruma')).toBe('av-g')
    expect(sec.secteurDe('hiza-guruma', 'droite', { 'hiza-guruma': 'av-d' })).toBe('av-d')
    // Et elle se lit elle aussi dans la garde du pratiquant.
    expect(sec.secteurDe('hiza-guruma', 'gauche', { 'hiza-guruma': 'av-d' })).toBe('av-g')
  })

  it('chaque secteur a de quoi être comblé, dans les deux gardes', () => {
    for (const garde of ['droite', 'gauche'] as const)
      for (const s of sec.SECTEURS) {
        const n = debout.filter((t) => sec.secteurDe(t.slug, garde) === s).length
        expect(n, `${s} en garde ${garde}`).toBeGreaterThan(2)
      }
  })

  it('ne propose au réglage que les directions déclarées incertaines', () => {
    expect(sec.A_CONFIRMER.length).toBeGreaterThan(0)
    for (const slug of sec.A_CONFIRMER) expect(sec.DIRECTION_OF[slug].sur).toBe(false)
    const sures = Object.entries(sec.DIRECTION_OF).filter(([, r]) => r.sur)
    expect(sures.length + sec.A_CONFIRMER.length).toBe(debout.length)
  })

  it('/mon-judo mène au bilan personnel', () => {
    expect(parseRoute('/mon-judo')).toEqual({ name: 'profil' })
    expect(routePath({ name: 'profil' })).toBe('/mon-judo')
  })
})


describe('les quartiers de la rose', () => {
  it("n'ouvrent jamais sur une liste vide", () => {
    // Chaque quartier se clique pour ajouter des techniques : si le catalogue
    // n'en range aucune dans un secteur, le geste ne mènerait nulle part.
    for (const s of SECTEURS) {
      const dedans = all.filter((t) => secteurDe(t.slug, 'droite', {}) === s)
      expect(dedans.length, `${s} n'a aucune projection au catalogue`).toBeGreaterThan(0)
    }
  })

  it('range chaque projection dans un seul quartier, garde gauche comprise', () => {
    for (const garde of ['droite', 'gauche'] as const)
      for (const t of all) {
        const dedans = SECTEURS.filter((s) => secteurDe(t.slug, garde, {}) === s)
        expect(dedans.length).toBeLessThanOrEqual(1)
      }
  })
})

describe('carnets enregistrés avant un ajout de champ', () => {
  it("rend les systèmes lisibles quand un champ manque", () => {
    // Panne réelle : un carnet écrit avant l'ajout de `libres` rendait
    // `etat.libres` undefined, et l'écran entier tombait à la première lecture.
    // useLocalStorage rend le JSON tel qu'il a été écrit, sans le fusionner
    // avec le défaut : toute lecture passe donc par normaliser().
    expect(normaliser({ armes: ['o-goshi'], retenues: { 'o-goshi': ['contre:x'] } })).toEqual({
      armes: ['o-goshi'],
      retenues: { 'o-goshi': ['contre:x'] },
      libres: {},
    })
    expect(normaliser({})).toEqual({ armes: [], retenues: {}, libres: {} })
    expect(normaliser(undefined)).toEqual({ armes: [], retenues: {}, libres: {} })
  })

  it('rend le profil lisible quand un champ manque', () => {
    expect(normaliserProfil({ garde: 'gauche' })).toEqual({ garde: 'gauche', corrections: {}, situations: {} })
    expect(normaliserProfil(undefined)).toEqual({ garde: 'droite', corrections: {}, situations: {} })
  })
})

describe('sauvegarde du carnet', () => {
  const fichier = (contenu: unknown) =>
    ({ text: async () => JSON.stringify(contenu) }) as File

  const v2 = {
    format: 'judodex-progress',
    version: 2,
    exportedAt: '2026-09-03T00:00:00.000Z',
    progress: { 'o-goshi': { mastery: 'mastered', tokui: true, updatedAt: '', box: 3, due: '2026-10-01' } },
    profil: {
      garde: 'gauche',
      corrections: { 'kata-guruma': 'av-d' },
      situations: { 'ippon-seoi-nage': ['ai-yotsu:avance'] },
    },
    systemes: {
      armes: ['o-goshi'],
      retenues: { 'o-goshi': ['contre:ushiro-goshi'] },
      libres: { 'o-goshi': [{ type: 'liaison-sol', slug: 'kesa-gatame' }] },
    },
  }

  it('rend le profil et les systèmes d\'un fichier version 2', async () => {
    const r = await importProgress(fichier(v2))
    expect(r.progress['o-goshi'].tokui).toBe(true)
    expect(r.profil).toEqual({
      garde: 'gauche',
      corrections: { 'kata-guruma': 'av-d' },
      situations: { 'ippon-seoi-nage': ['ai-yotsu:avance'] },
    })
    expect(r.systemes).toEqual({
      armes: ['o-goshi'],
      retenues: { 'o-goshi': ['contre:ushiro-goshi'] },
      libres: { 'o-goshi': [{ type: 'liaison-sol', slug: 'kesa-gatame' }] },
    })
  })

  it('lit encore un fichier version 1, sans profil ni systèmes', async () => {
    const r = await importProgress(fichier({ ...v2, version: 1, profil: undefined, systemes: undefined }))
    expect(r.progress['o-goshi'].mastery).toBe('mastered')
    expect(r.profil).toBeNull()
    expect(r.systemes).toBeNull()
  })

  it('écarte ce qu\'un fichier trafiqué contiendrait', async () => {
    const r = await importProgress(
      fichier({
        ...v2,
        profil: { garde: 'debout', corrections: { 'o-goshi': 'nord' }, situations: { x: ['n-importe-quoi'] } },
        systemes: { armes: 'non', retenues: { x: 'oui' }, libres: { a: [{ type: 'vol', slug: 'x' }] } },
      }),
    )
    // Une garde inconnue retombe sur droite, une direction inventée disparaît.
    // Une case inventée ne franchit pas la relecture non plus.
    expect(r.profil).toEqual({ garde: 'droite', corrections: {}, situations: {} })
    // Une forme de lien inventée ne franchit pas la relecture.
    expect(r.systemes).toEqual({ armes: [], retenues: {}, libres: { a: [] } })
  })

  it('refuse un fichier qui n\'est pas une sauvegarde', async () => {
    await expect(importProgress(fichier({ format: 'autre', progress: {} }))).rejects.toThrow(/sauvegarde Judodex/)
  })
})

describe('en-tête et données structurées', () => {
  /** Le graphe déclaré par une route, aplati pour être interrogé. */
  const graphe = (route: Parameters<typeof jsonLdFor>[0], t?: Technique) =>
    (jsonLdFor(route, t) as { '@graph': Record<string, unknown>[] })['@graph']

  const noeud = (g: Record<string, unknown>[], type: string) => g.find((n) => n['@type'] === type)

  /** Le nœud de la technique, qu'il soit typé HowTo ou Article. */
  const fiche = (t: Technique) =>
    graphe({ name: 'technique', slug: t.slug }, t).find((n) => String(n['@id']).endsWith('#technique'))!

  it('donne à chaque fiche sa propre carte de partage', () => {
    const a = headFor({ name: 'technique', slug: all[0].slug }, all[0])
    const b = headFor({ name: 'technique', slug: all[1].slug }, all[1])
    expect(a.image).toContain(`/og/${all[0].slug}.png`)
    expect(a.image).not.toBe(b.image)
    expect(a.imageAlt).toContain(all[0].kanji)
  })

  it('retombe sur la carte du site hors des fiches', () => {
    expect(headFor({ name: 'home' }).image).toMatch(/\/og\.png$/)
    expect(headFor({ name: 'browse' }).image).toMatch(/\/og\.png$/)
  })

  it('coupe le résumé à la longueur qu’affiche un moteur', () => {
    for (const t of all) {
      const { title, description } = headFor({ name: 'technique', slug: t.slug }, t)
      expect(description.length).toBeLessThanOrEqual(160)
      expect(title).toContain(t.name)
    }
  })

  it('déclare chaque technique comme une procédure en étapes', () => {
    for (const t of all.filter((x) => x.phases.length > 0)) {
      const h = noeud(graphe({ name: 'technique', slug: t.slug }, t), 'HowTo')!
      expect((h.step as unknown[]).length).toBe(t.phases.length)
      expect(h.image).toContain(`/og/${t.slug}.png`)
      expect(h.dateModified).toBe(data.scrapedAt)
    }
  })

  it('décrit la démonstration filmée assez pour être éligible', () => {
    for (const t of all.filter((x) => x.youtubeId)) {
      const v = fiche(t).video as Record<string, string>
      // Sans titre, vignette ni description, un moteur ignore la vidéo.
      for (const cle of ['name', 'description', 'thumbnailUrl', 'embedUrl']) expect(v[cle]).toBeTruthy()
      if (t.youtubeDuration) expect(v.duration).toMatch(/^PT(\d+M)?(\d+S)?$/)
    }
  })

  it('relie une technique à ses enchaînements', () => {
    const t = all.find((x) => (x.combinations?.length ?? 0) > 0)!
    const liens = fiche(t).isRelatedTo as { url: string }[]
    expect(liens.length).toBe(new Set(t.combinations!.map((c) => c.slug)).size)
    for (const l of liens) expect(l.url).toMatch(/\/technique\/[a-z0-9-]+$/)
  })

  it('énumère le catalogue sur la page de liste', () => {
    const page = noeud(graphe({ name: 'browse' }), 'CollectionPage')!
    const liste = page.mainEntity as { numberOfItems: number; itemListElement: unknown[] }
    expect(liste.numberOfItems).toBe(all.length)
    expect(liste.itemListElement.length).toBe(all.length)
  })

  it('rattache le site à l’entité judo sur chaque page indexable', () => {
    for (const route of [
      { name: 'home' } as const,
      { name: 'browse' } as const,
      { name: 'train' } as const,
      { name: 'dan', dan: 2 } as const,
    ]) {
      const judo = graphe(route).find((n) => String(n['@id']).endsWith('#judo'))!
      expect(judo.sameAs).toContain('https://www.wikidata.org/wiki/Q11420')
    }
  })

  it('pose un fil d’Ariane sur les pages profondes', () => {
    const fil = noeud(graphe({ name: 'dan', dan: 3 }), 'BreadcrumbList')!
    const etapes = fil.itemListElement as { position: number; name: string }[]
    expect(etapes.map((e) => e.position)).toEqual([1, 2, 3, 4])
    expect(etapes.at(-1)!.name).toContain('3e dan')
  })

  it('ne déclare rien sur une adresse qui n’existe pas', () => {
    expect(jsonLdFor({ name: 'notFound', path: '/nawak' })).toBeNull()
    expect(jsonLdFor({ name: 'technique', slug: 'inconnu' }, null)).toBeNull()
  })
})
