import { describe, expect, it } from 'vitest'
import raw from '../data/techniques.json'
import routes from '../data/routes.json'
import { CEINTURES, FAMILLES, parseRoute, routePath, type Route } from '../hooks/useRoute'
import { BELTS, beltOf } from '../lib/belts'
import { GROUPS } from '../lib/families'
import { headFor } from '../lib/head'
import { jsonLdFor } from '../lib/jsonld'
import { questionsCeinture, questionsCeintures, questionsFamille, questionsTechnique } from '../lib/faq'
import { CATEGORIES, TERMES } from '../lib/lexique'
import { FAMILLE_TEXTE } from '../lib/contenuSeo'
import type { JudodexData } from '../types/judodex'

const data = raw as unknown as JudodexData
const slugs = new Set(data.techniques.map((t) => t.slug))

const pages: Route[] = [
  { name: 'ceintures' },
  ...CEINTURES.map((belt) => ({ name: 'ceinture', belt }) as Route),
  ...FAMILLES.map((group) => ({ name: 'famille', group }) as Route),
  { name: 'lexique' },
  { name: 'aPropos' },
]

const graphe = (r: Route) => (jsonLdFor(r, null, data.count) as { '@graph': Record<string, unknown>[] })['@graph']
const noeud = (r: Route, type: string) => graphe(r).find((n) => n['@type'] === type)

describe('pages d’entrée : ceintures, familles, lexique, à propos', () => {
  it('publie exactement les ceintures et les familles que le site connaît', () => {
    // Les ceintures de couleur : toutes sauf la noire, qui a ses pages de dan.
    expect(CEINTURES).toEqual(BELTS.filter((b) => b.id !== 'noire').map((b) => b.id))
    expect(FAMILLES).toEqual(GROUPS)
    expect(routes.ceintures).toEqual(CEINTURES)
    expect(routes.familles).toEqual(FAMILLES)
  })

  it('relit chaque adresse comme elle est écrite, et refuse celles qui n’existent pas', () => {
    for (const r of pages) expect(parseRoute(routePath(r))).toEqual(r)
    expect(parseRoute('/ceinture/violette').name).toBe('notFound')
    expect(parseRoute('/ceinture/noire').name).toBe('notFound')
    expect(parseRoute('/famille/inconnue').name).toBe('notFound')
    expect(parseRoute('/ceinture/jaune/extra').name).toBe('notFound')
    expect(parseRoute('/lexique/x').name).toBe('notFound')
  })

  it('donne à chacune un titre et un résumé propres, à la taille d’un résultat', () => {
    const titres = new Set<string>()
    const descriptions = new Set<string>()
    for (const r of pages) {
      const h = headFor(r)
      expect(h.title.length, h.title).toBeLessThanOrEqual(70)
      expect(h.title).toMatch(/Judodex$/)
      expect(h.description.length, h.description).toBeGreaterThanOrEqual(80)
      expect(h.description.length, h.description).toBeLessThanOrEqual(160)
      expect(h.canonical).toContain(routePath(r))
      titres.add(h.title)
      descriptions.add(h.description)
    }
    expect(titres.size).toBe(pages.length)
    expect(descriptions.size).toBe(pages.length)
  })

  it('déclare pour chaque ceinture la liste exacte des techniques imposées', () => {
    for (const belt of CEINTURES) {
      const b = beltOf(belt)
      const l = noeud({ name: 'ceinture', belt }, 'CollectionPage')!.mainEntity as { itemListElement: { url: string }[] }
      expect(l.itemListElement.map((e) => e.url.split('/technique/')[1])).toEqual([...b.nage, ...b.katame])
    }
  })

  it('ne cite que des fiches qui existent', () => {
    for (const belt of CEINTURES) for (const s of [...beltOf(belt).nage, ...beltOf(belt).katame]) expect(slugs.has(s), s).toBe(true)
  })

  it('écrit des questions dont la réponse est dans la planche, et les déclare en FAQPage', () => {
    const nom = (s: string) => data.techniques.find((t) => t.slug === s)!.name
    for (const belt of CEINTURES) {
      const qs = questionsCeinture(belt, nom)
      const b = beltOf(belt)
      expect(qs[0].a).toContain(String(b.nage.length))
      expect(qs[0].a).toContain(nom(b.nage[0]))
      const f = noeud({ name: 'ceinture', belt }, 'FAQPage')!.mainEntity as { name: string; acceptedAnswer: { text: string } }[]
      expect(f.map((x) => x.name)).toEqual(qs.map((x) => x.q))
      expect(f.every((x) => x.acceptedAnswer.text.length > 20)).toBe(true)
    }
    expect(questionsCeintures().length).toBeGreaterThanOrEqual(3)
    for (const group of FAMILLES) {
      expect(questionsFamille(group, data.techniques.slice(0, 3)).length).toBe(2)
    }
  })

  it('a un texte pour chaque famille', () => {
    for (const g of GROUPS) {
      expect(FAMILLE_TEXTE[g].h1).toBeTruthy()
      expect(FAMILLE_TEXTE[g].intro.length).toBeGreaterThanOrEqual(2)
      expect(FAMILLE_TEXTE[g].question.a.length).toBeGreaterThan(60)
    }
  })

  it('ne présente que le fil d’Ariane voulu, de l’accueil à la page', () => {
    for (const r of pages) {
      const fil = noeud(r, 'BreadcrumbList')!.itemListElement as { name: string }[]
      expect(fil[0].name).toBe('Judodex')
      expect(fil.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('lexique', () => {
  it('donne à chaque terme une ancre unique, un sens et une définition', () => {
    const ids = TERMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of TERMES) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/)
      expect(t.jp.length, t.id).toBeGreaterThan(0)
      expect(t.sens.length, t.id).toBeGreaterThan(2)
      expect(t.definition.length, t.id).toBeGreaterThan(50)
      expect(CATEGORIES.some((c) => c.id === t.categorie), t.id).toBe(true)
    }
  })

  it('ne renvoie qu’à des termes et à des fiches qui existent', () => {
    const ids = new Set(TERMES.map((t) => t.id))
    for (const t of TERMES) {
      for (const v of t.voir ?? []) expect(ids.has(v), `${t.id} → ${v}`).toBe(true)
      for (const s of t.techniques ?? []) expect(slugs.has(s), `${t.id} → ${s}`).toBe(true)
      expect(t.voir ?? [], t.id).not.toContain(t.id)
    }
  })

  it('range au moins un terme dans chaque catégorie', () => {
    for (const c of CATEGORIES) expect(TERMES.some((t) => t.categorie === c.id), c.id).toBe(true)
  })

  it('déclare chaque terme comme un terme défini du lexique', () => {
    const l = noeud({ name: 'lexique' }, 'DefinedTermSet')!.hasDefinedTerm as { name: string; url: string }[]
    expect(l).toHaveLength(TERMES.length)
    expect(l.every((x) => x.url.includes('/lexique#'))).toBe(true)
  })
})

describe('questions des fiches', () => {
  const nom = (s: string) => data.techniques.find((t) => t.slug === s)?.name ?? s

  it('pose au moins trois questions sur chaque fiche, et y répond avec la fiche', () => {
    for (const t of data.techniques) {
      const qs = questionsTechnique(t, nom)
      expect(qs.length, t.slug).toBeGreaterThanOrEqual(3)
      for (const { q, a } of qs) {
        expect(q.endsWith('?'), `${t.slug} : ${q}`).toBe(true)
        expect(q).toContain(t.name)
        expect(a.length, `${t.slug} : ${q}`).toBeGreaterThan(40)
      }
      // La décomposition, quand il y en a une, est reprise phase par phase.
      if (t.phases.length) for (const p of t.phases) expect(qs.find((x) => x.q.startsWith('Comment faire'))!.a).toContain(p.label)
    }
  })

  it('dit la ceinture quand la technique est imposée, et l’absence de planche sinon', () => {
    const oGoshi = data.techniques.find((t) => t.slug === 'o-goshi')!
    expect(questionsTechnique(oGoshi, nom).find((x) => x.q.includes('ceinture'))!.a).toMatch(/ceinture jaune \(5ᵉ kyu\)/)
    const horsPlanche = data.techniques.find((t) => !BELTS.some((b) => [...b.nage, ...b.katame].includes(t.slug)))!
    expect(questionsTechnique(horsPlanche, nom).find((x) => x.q.includes('ceinture'))!.a).toMatch(/aucune planche/)
  })

  it('déclare ces questions dans la fiche, avec le reste de ses données', () => {
    const t = data.techniques[0]
    const f = (jsonLdFor({ name: 'technique', slug: t.slug }, t, data.count) as { '@graph': Record<string, unknown>[] })['@graph'].find((n) => n['@type'] === 'FAQPage')!
    expect((f.mainEntity as unknown[]).length).toBe(questionsTechnique(t, nom).length)
  })
})
