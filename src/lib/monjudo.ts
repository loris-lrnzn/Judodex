import type { Combination, Technique } from '../types/judodex'
import { SECTEURS, directionMeta, directionDe, estDebout, secteurDe, type Direction, type Garde, type Secteur } from './secteurs'
import { CASES, casesDe, type Case } from './situations'

/*
 * Mon judo, construit de A à Z.
 *
 * Le parcours ne lit rien du reste du carnet : ni les techniques marquées
 * acquises, ni les tokui-waza des fiches. On part d'une page blanche et on
 * compose un judo comme on le décrirait à son professeur — une technique,
 * les coins où l'on fait tomber, ce qu'on fait quand uke résiste, d'où l'on
 * part, et comment on finit au sol. Le catalogue propose à chaque pas ; le
 * pratiquant choisit.
 */

// ─── Les étapes ─────────────────────────────────────────────────────────

export const ETAPES = [
  {
    id: 'toi',
    titre: 'Toi',
    question: 'Qui monte sur le tapis ?',
    but: 'Ta garde décide du reste : un gaucher ne fait pas tomber dans les mêmes coins qu’un droitier.',
  },
  {
    id: 'technique',
    titre: 'Ta technique',
    question: 'Quelle est ta technique ?',
    but: 'Celle que tu cherches, que tu places, et autour de laquelle tout s’organise : ton tokui-waza.',
  },
  {
    id: 'coins',
    titre: 'Tes coins',
    question: 'Où fais-tu tomber ?',
    but: 'Uke tombe dans l’un de quatre coins. Un adversaire qui te connaît défendra celui que tu attaques toujours.',
  },
  {
    id: 'reactions',
    titre: 'Ses réactions',
    question: 'Et quand il résiste ?',
    but: 'Personne ne se laisse projeter. Ce que tu fais de sa réaction, c’est ça, un système.',
  },
  {
    id: 'entrees',
    titre: 'Tes entrées',
    question: 'D’où pars-tu ?',
    but: 'Selon sa garde et ce qu’il fait de ses pieds, une attaque passe ou ne passe pas.',
  },
  {
    id: 'sol',
    titre: 'Au sol',
    question: 'Et s’il tombe mal ?',
    but: 'Sur le ventre, sur le côté : le combat continue au sol. Encore faut-il savoir comment le finir.',
  },
  {
    id: 'carte',
    titre: 'Ta carte',
    question: 'Voilà ton judo.',
    but: 'Tout ce que tu viens de construire, d’un coup d’œil, et ce qu’il faut travailler ensuite.',
  },
] as const

export type EtapeId = (typeof ETAPES)[number]['id']
export const indexEtape = (id: EtapeId) => ETAPES.findIndex((e) => e.id === id)
export const etapeMeta = (id: EtapeId) => ETAPES.find((e) => e.id === id)!

// ─── Les réactions de uke ───────────────────────────────────────────────

/**
 * Ce que uke fait quand on l’attaque. Chacune se reconnaît dans le catalogue
 * à la défense qu’un lien déclare, ou au déplacement qui le déclenche.
 */
export const REACTIONS = [
  {
    id: 'bloque',
    label: 'Il bloque',
    detail: 'Il se raidit, fige ses hanches ou tend les bras.',
    defenses: ['bloque-bassin', 'bras-tendus'],
    deplacements: ['plante'],
  },
  {
    id: 'recule',
    label: 'Il recule',
    detail: 'Il retire sa jambe ou recule pour sortir de l’attaque.',
    defenses: ['recule-jambe'],
    deplacements: ['recule'],
  },
  {
    id: 'penche',
    label: 'Il se penche',
    detail: 'Il casse sa posture en avant pour ne pas être chargé.',
    defenses: ['casse-avant'],
    deplacements: [] as string[],
  },
  {
    id: 'esquive',
    label: 'Il esquive',
    detail: 'Il tourne, contourne ta hanche ou saute ta jambe.',
    defenses: ['esquive-hanche'],
    deplacements: ['tourne'],
  },
] as const

export type ReactionId = (typeof REACTIONS)[number]['id']
export const reactionMeta = (id: ReactionId) => REACTIONS.find((r) => r.id === id)!

/** Ce que le catalogue relie à une réaction, depuis une technique donnée. */
export function lienRepond(l: Combination, r: ReactionId): boolean {
  const meta = reactionMeta(r)
  return (
    (!!l.defense && (meta.defenses as readonly string[]).includes(l.defense)) ||
    (!!l.situation?.deplacement && (meta.deplacements as readonly string[]).includes(l.situation.deplacement))
  )
}

// ─── L’état ─────────────────────────────────────────────────────────────

/** Au plus trois techniques par coin : au-delà, ce n’est plus un choix. */
export const PAR_COIN = 3

export interface MonJudo {
  prenom: string
  garde: Garde
  tokui: string | null
  /** Techniques ajoutées dans chaque coin, la technique de prédilection non comprise. */
  coins: Record<Secteur, string[]>
  reactions: Partial<Record<ReactionId, string>>
  entrees: Partial<Record<Case, string>>
  /** Ce qu’on enchaîne au sol quand uke tombe mal. */
  transition: string | null
  /** La manière de finir qu’on préfère. */
  finition: string | null
  courante: EtapeId
  vues: EtapeId[]
}

const coinsVides = (): Record<Secteur, string[]> => ({ 'av-d': [], 'ar-d': [], 'ar-g': [], 'av-g': [] })

export const VIERGE: MonJudo = {
  prenom: '',
  garde: 'droite',
  tokui: null,
  coins: coinsVides(),
  reactions: {},
  entrees: {},
  transition: null,
  finition: null,
  courante: 'toi',
  vues: [],
}

const ETAPE_IDS = ETAPES.map((e) => e.id) as EtapeId[]
const REACTION_IDS = REACTIONS.map((r) => r.id) as ReactionId[]

/**
 * Relit un état, qu’il vienne du navigateur, d’une sauvegarde ou d’un lien
 * partagé. Rien n’entre qui ne soit reconnu : un slug inconnu disparaît, une
 * garde inventée retombe sur droite. Un carnet enregistré avant l’ajout d’un
 * champ prend son défaut au lieu de faire tomber la page.
 */
export function normaliser(brut: unknown, connues: (slug: string) => boolean): MonJudo {
  const e = (brut && typeof brut === 'object' ? brut : {}) as Partial<Record<keyof MonJudo, unknown>>
  const slug = (v: unknown) => (typeof v === 'string' && connues(v) ? v : null)
  const coins = coinsVides()
  const c = (e.coins && typeof e.coins === 'object' ? e.coins : {}) as Record<string, unknown>
  for (const s of SECTEURS)
    if (Array.isArray(c[s])) coins[s] = [...new Set((c[s] as unknown[]).map(slug).filter((x): x is string => !!x))].slice(0, PAR_COIN)
  const reactions: MonJudo['reactions'] = {}
  const r = (e.reactions && typeof e.reactions === 'object' ? e.reactions : {}) as Record<string, unknown>
  for (const id of REACTION_IDS) {
    const v = slug(r[id])
    if (v) reactions[id] = v
  }
  const entrees: MonJudo['entrees'] = {}
  const en = (e.entrees && typeof e.entrees === 'object' ? e.entrees : {}) as Record<string, unknown>
  for (const k of CASES) {
    const v = slug(en[k])
    if (v) entrees[k] = v
  }
  return {
    prenom: typeof e.prenom === 'string' ? e.prenom.slice(0, 40) : '',
    garde: e.garde === 'gauche' ? 'gauche' : 'droite',
    tokui: slug(e.tokui),
    coins,
    reactions,
    entrees,
    transition: slug(e.transition),
    finition: slug(e.finition),
    courante: ETAPE_IDS.includes(e.courante as EtapeId) ? (e.courante as EtapeId) : 'toi',
    vues: Array.isArray(e.vues) ? ETAPE_IDS.filter((id) => (e.vues as unknown[]).includes(id)) : [],
  }
}

// ─── Lecture ────────────────────────────────────────────────────────────

export type Catalogue = { bySlug: Map<string, Technique>; techniques: Technique[] }

export interface Lecture {
  tokui: Technique | null
  /** Coin de la technique de prédilection, s’il y en a un. */
  coinTokui: Secteur | null
  /** Tout ce qui tombe dans chaque coin, la technique de prédilection en tête. */
  parCoin: Record<Secteur, Technique[]>
  coinsTenus: Secteur[]
  coinsVides: Secteur[]
  /** Les projections du judo construit, sans doublon. */
  projections: Technique[]
  reactions: { id: ReactionId; t: Technique | null; secteur: Secteur | null; changeDeCoin: boolean }[]
  /** Réactions dont la suite fait tomber ailleurs que la technique de départ. */
  directionsOuvertes: number
  entreesTenues: Case[]
  /** La technique lancée dans chaque situation, quand il y en a une. */
  parEntree: Partial<Record<Case, Technique>>
  transition: Technique | null
  finition: Technique | null
}

/** Tout ce que la carte affiche, calculé une fois. */
export function lire(mj: MonJudo, cat: Catalogue, corrections: Record<string, Direction> = {}): Lecture {
  const get = (s: string | null | undefined) => (s ? (cat.bySlug.get(s) ?? null) : null)
  const coin = (t: Technique | null) => (t ? secteurDe(t.slug, mj.garde, corrections) : null)
  const tokui = get(mj.tokui)
  const coinTokui = coin(tokui)

  const parCoin = coinsVides() as unknown as Record<Secteur, Technique[]>
  for (const s of SECTEURS) {
    const liste = mj.coins[s].map(get).filter((t): t is Technique => !!t)
    parCoin[s] = tokui && coinTokui === s ? [tokui, ...liste.filter((t) => t.slug !== tokui.slug)] : liste
  }

  const reactions = REACTION_IDS.map((id) => {
    const t = get(mj.reactions[id])
    const secteur = coin(t)
    return { id, t, secteur, changeDeCoin: !!secteur && secteur !== coinTokui }
  })

  const projections = uniques([tokui, ...SECTEURS.flatMap((s) => parCoin[s]), ...reactions.map((r) => r.t)].filter(
    (t): t is Technique => !!t && estDebout(t),
  ))

  return {
    tokui,
    coinTokui,
    parCoin,
    coinsTenus: SECTEURS.filter((s) => parCoin[s].length > 0),
    coinsVides: SECTEURS.filter((s) => parCoin[s].length === 0),
    projections,
    reactions,
    directionsOuvertes: new Set(reactions.filter((r) => r.changeDeCoin).map((r) => r.secteur)).size,
    entreesTenues: CASES.filter((c) => !!get(mj.entrees[c])),
    parEntree: Object.fromEntries(CASES.map((c) => [c, get(mj.entrees[c])]).filter(([, t]) => !!t)) as Lecture['parEntree'],
    transition: get(mj.transition),
    finition: get(mj.finition),
  }
}

const uniques = (liste: Technique[]) => [...new Map(liste.map((t) => [t.slug, t])).values()]

// ─── Suggestions ────────────────────────────────────────────────────────

export interface Suggestion {
  t: Technique
  /** Pourquoi on la propose, dit en une ligne. */
  raison: string
  /** Proposée d’après un lien écrit dans le catalogue, et non par défaut. */
  attestee: boolean
}

const projectionsDuCatalogue = (cat: Catalogue) => cat.techniques.filter(estDebout)

/** Techniques qui tombent dans un coin, celles que ton judo relie en tête. */
export function suggestionsCoin(s: Secteur, mj: MonJudo, cat: Catalogue, corrections: Record<string, Direction> = {}): Suggestion[] {
  const dans = (t: Technique) => secteurDe(t.slug, mj.garde, corrections) === s
  const tokui = mj.tokui ? cat.bySlug.get(mj.tokui) : undefined
  const deja = new Set([mj.tokui, ...mj.coins[s]])
  const liees: Suggestion[] = []
  for (const l of tokui?.combinations ?? []) {
    const t = cat.bySlug.get(l.slug)
    if (!t || deja.has(t.slug) || !dans(t) || l.type === 'contre' || l.type === 'liaison-sol') continue
    liees.push({ t, raison: `depuis ${tokui!.name} — ${l.context}`, attestee: true })
  }
  const vues = new Set(liees.map((x) => x.t.slug))
  const autres = projectionsDuCatalogue(cat)
    .filter((t) => dans(t) && !deja.has(t.slug) && !vues.has(t.slug))
    .sort((a, b) => rangNiveau(a) - rangNiveau(b))
    .map((t) => ({ t, raison: t.translation, attestee: false }))
  return [...liees, ...autres]
}

/**
 * Ce qu’on peut enchaîner quand uke réagit : d’abord ce que le catalogue
 * attache à cette réaction, puis les autres suites de la technique, puis les
 * techniques de ton propre judo qui font tomber dans un autre coin — c’est ce
 * changement de direction qui fait un système.
 */
export function suggestionsReaction(
  r: ReactionId,
  mj: MonJudo,
  cat: Catalogue,
  corrections: Record<string, Direction> = {},
): Suggestion[] {
  const tokui = mj.tokui ? cat.bySlug.get(mj.tokui) : undefined
  if (!tokui) return []
  const suites = (tokui.combinations ?? []).filter((l) => l.type === 'enchainement' || l.type === 'redoublement')
  const vers = (l: Combination) => cat.bySlug.get(l.slug)
  const exactes = suites
    .filter((l) => lienRepond(l, r) && vers(l))
    .map((l) => ({ t: vers(l)!, raison: l.type === 'redoublement' ? `tu insistes — ${l.context}` : l.context, attestee: true }))
  const vues = new Set(exactes.map((x) => x.t.slug))
  const autres = suites
    .filter((l) => !lienRepond(l, r) && vers(l) && !vues.has(l.slug))
    .map((l) => ({ t: vers(l)!, raison: l.context, attestee: false }))
  const coinTokui = secteurDe(tokui.slug, mj.garde, corrections)
  const miennes = SECTEURS.filter((s) => s !== coinTokui)
    .flatMap((s) => mj.coins[s])
    .map((slug) => cat.bySlug.get(slug))
    .filter((t): t is Technique => !!t)
    .map((t) => ({ t, raison: `dans ton judo — fait tomber ${directionMeta(secteurDe(t.slug, mj.garde, corrections)!).label.toLowerCase()}`, attestee: false }))
  return uniquesSuggestions([...exactes, ...autres, ...miennes])
}

/** Ce que uke peut renvoyer sur la technique de prédilection. */
export function contresDe(mj: MonJudo, cat: Catalogue): { t: Technique; context: string }[] {
  const tokui = mj.tokui ? cat.bySlug.get(mj.tokui) : undefined
  return (tokui?.combinations ?? [])
    .filter((l) => l.type === 'contre')
    .map((l) => ({ t: cat.bySlug.get(l.slug), context: l.context }))
    .filter((x): x is { t: Technique; context: string } => !!x.t)
}

/** Techniques de ton judo, puis du catalogue, que les liens placent dans une situation. */
export function suggestionsEntree(c: Case, lecture: Lecture, cat: Catalogue): Suggestion[] {
  const tiennent = (t: Technique) => casesDe(t).includes(c)
  const miennes = lecture.projections
  const mesAttestees = miennes.filter(tiennent).map((t) => ({ t, raison: 'dans ton judo, et le catalogue la place ici', attestee: true }))
  const mesAutres = miennes.filter((t) => !tiennent(t)).map((t) => ({ t, raison: 'dans ton judo', attestee: false }))
  const mesSlugs = new Set(miennes.map((t) => t.slug))
  const catalogue = projectionsDuCatalogue(cat)
    .filter((t) => tiennent(t) && !mesSlugs.has(t.slug))
    .map((t) => ({ t, raison: t.translation, attestee: true }))
  return [...mesAttestees, ...mesAutres, ...catalogue]
}

/** Les passages au sol qui partent des projections de ton judo. */
export function suggestionsTransition(lecture: Lecture, cat: Catalogue): Suggestion[] {
  const out: Suggestion[] = []
  for (const p of lecture.projections)
    for (const l of p.combinations ?? []) {
      const t = cat.bySlug.get(l.slug)
      if (l.type === 'liaison-sol' && t) out.push({ t, raison: `après ${p.name} — ${l.context}`, attestee: true })
    }
  return uniquesSuggestions(out)
}

/** Les trois manières de finir, et leurs techniques. */
export const FINITIONS = [
  { id: 'osaekomi-waza', label: 'Immobiliser', jp: '抑込技', detail: 'Le tenir sur le dos, vingt secondes.' },
  { id: 'shime-waza', label: 'Étrangler', jp: '絞技', detail: 'Au col ou au bras, jusqu’à l’abandon.' },
  { id: 'kansetsu-waza', label: 'Luxer', jp: '関節技', detail: 'Sur le coude, jusqu’à l’abandon.' },
] as const

const uniquesSuggestions = (liste: Suggestion[]) => [...new Map(liste.map((x) => [x.t.slug, x])).values()]
const RANG = { Débutant: 1, Intermédiaire: 2, Avancé: 3, Expert: 4, Maître: 5 } as const
const rangNiveau = (t: Technique) => RANG[t.level] ?? 9

// ─── Le diagnostic ──────────────────────────────────────────────────────

export interface Priorite {
  titre: string
  texte: string
  etape: EtapeId
}

/**
 * Les trois choses à travailler, dans l’ordre où les choses se construisent.
 * Jamais plus de trois : une liste de dix manques n’en fait traiter aucun.
 */
export function priorites(l: Lecture): Priorite[] {
  const out: Priorite[] = []
  if (!l.tokui) out.push({ titre: 'Choisir ta technique', texte: 'Tout le reste s’organise autour d’elle.', etape: 'technique' })
  if (l.coinsVides.length)
    out.push({
      titre: `Un coin de plus : ${directionMeta(l.coinsVides[0]).label.toLowerCase()}`,
      texte: `Personne ne te voit attaquer ${l.coinsVides.length > 1 ? `dans ${l.coinsVides.length} coins` : 'dans ce coin'}. C’est là qu’on se placera contre toi.`,
      etape: 'coins',
    })
  const sansReponse = l.reactions.filter((r) => !r.t)
  if (l.tokui && sansReponse.length)
    out.push({
      titre: `Une réponse quand ${reactionMeta(sansReponse[0].id).label.toLowerCase()}`,
      texte: 'Sans suite prévue, ta technique s’arrête à la première résistance.',
      etape: 'reactions',
    })
  else if (l.tokui && l.directionsOuvertes === 0 && l.reactions.some((r) => r.t))
    out.push({
      titre: 'Une suite dans une autre direction',
      texte: 'Toutes tes suites retombent du même côté : il suffit d’une qui change de coin pour qu’il ait deux côtés à défendre.',
      etape: 'reactions',
    })
  if (l.entreesTenues.length < CASES.length)
    out.push({
      titre: `${CASES.length - l.entreesTenues.length} situation${CASES.length - l.entreesTenues.length > 1 ? 's' : ''} sans entrée`,
      texte: 'Ce jour-là, contre cet adversaire, tu n’aurais rien à lancer.',
      etape: 'entrees',
    })
  if (!l.transition || !l.finition)
    out.push({
      titre: !l.transition ? 'Un passage au sol' : 'Une manière de finir',
      texte: 'Une projection qui ne marque pas ippon laisse le combat au sol.',
      etape: 'sol',
    })
  return out.slice(0, 3)
}

/** Où en est chaque partie, sur ce qu’elle demande. */
export function jauges(l: Lecture) {
  return [
    { id: 'coins', label: 'Coins', n: l.coinsTenus.length, sur: 4 },
    { id: 'reactions', label: 'Réactions', n: l.reactions.filter((r) => r.t).length, sur: REACTIONS.length },
    { id: 'entrees', label: 'Entrées', n: l.entreesTenues.length, sur: CASES.length },
    { id: 'sol', label: 'Sol', n: (l.transition ? 1 : 0) + (l.finition ? 1 : 0), sur: 2 },
  ] as const
}

// ─── Le lien partagé ────────────────────────────────────────────────────

/**
 * La carte tient dans son adresse : pas de compte, pas de serveur. On n’y
 * met que ce qui se voit — le parcours et ses étapes vues restent chez soi.
 */
export function encoder(mj: MonJudo): string {
  const court = {
    n: mj.prenom || undefined,
    g: mj.garde === 'gauche' ? 'g' : undefined,
    t: mj.tokui ?? undefined,
    c: Object.fromEntries(SECTEURS.filter((s) => mj.coins[s].length).map((s) => [s, mj.coins[s]])),
    r: mj.reactions,
    e: mj.entrees,
    s: [mj.transition, mj.finition],
  }
  const octets = new TextEncoder().encode(JSON.stringify(court))
  let bin = ''
  for (const o of octets) bin += String.fromCharCode(o)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decoder(code: string, connues: (slug: string) => boolean): MonJudo | null {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const court = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))))
    return normaliser(
      {
        prenom: court.n,
        garde: court.g === 'g' ? 'gauche' : 'droite',
        tokui: court.t,
        coins: court.c,
        reactions: court.r,
        entrees: court.e,
        transition: court.s?.[0],
        finition: court.s?.[1],
        courante: 'carte',
      },
      connues,
    )
  } catch {
    return null
  }
}

/** Lecture courte d’une direction pour l’affichage d’une ligne. */
export const directionCourte = (slug: string, garde: Garde, corrections: Record<string, Direction> = {}) => {
  const d = directionDe(slug, garde, corrections)
  return d ? directionMeta(d).label.toLowerCase() : null
}
