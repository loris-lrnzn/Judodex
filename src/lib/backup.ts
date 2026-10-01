import type { ProgressMap } from '../types/judodex'
import type { Profil } from '../hooks/useProfil'
import type { Direction } from './secteurs'
import { CASES, type Case } from './situations'
import { MAX_BOX, jourLocal } from './srs'
import { noterSauvegarde } from './sauvegarde'

const FORMAT = 'judodex-progress'

/**
 * Le carnet entier, tel qu'il se sauvegarde.
 *
 * La version 1 ne portait que la progression. La 2 y ajoutait le profil —
 * garde et directions corrigées — et les systèmes de l'ancien bilan. La 3
 * remplace ces systèmes par Mon judo, construit de A à Z. Les fichiers
 * version 1 et 2 restent lisibles : leurs champs manquants valent défaut, et
 * les systèmes de la version 2, qu'aucun écran ne lit plus, sont laissés de
 * côté.
 */
export interface Backup {
  format: typeof FORMAT
  version: 1 | 2 | 3
  exportedAt: string
  progress: ProgressMap
  profil?: Profil
  /** Mon judo tel qu'il est rangé ; relu par `normaliser` à la restauration. */
  monJudo?: unknown
}

/** Ce qu'une restauration rend à l'application. */
export interface Restauration {
  progress: ProgressMap
  profil: Profil | null
  /** Brut : c'est l'écran, qui connaît le catalogue, qui le relit. */
  monJudo: unknown | null
}

export interface ADeposer {
  progress: ProgressMap
  profil: Profil
  monJudo: unknown
}

/** Télécharge le carnet sous forme de fichier JSON. */
export function exportProgress({ progress, profil, monJudo }: ADeposer) {
  const payload: Backup = {
    format: FORMAT,
    version: 3,
    exportedAt: new Date().toISOString(),
    progress,
    profil,
    monJudo,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `judodex-${jourLocal()}.json`
  a.click()
  URL.revokeObjectURL(url)
  noterSauvegarde()
}

const DIRECTIONS: Direction[] = ['av', 'av-d', 'd', 'ar-d', 'ar', 'ar-g', 'g', 'av-g']

/** On ne fait entrer que ce qu'on reconnaît : un fichier trafiqué ne casse rien. */
function lireProfil(p: unknown): Profil | null {
  if (!p || typeof p !== 'object') return null
  const brut = p as Partial<Profil>
  const corrections: Record<string, Direction> = {}
  for (const [slug, dir] of Object.entries(brut.corrections ?? {}))
    if (!INCONNUS.has(slug) && DIRECTIONS.includes(dir as Direction)) corrections[slug] = dir as Direction

  const situations: Record<string, Case[]> = {}
  for (const [slug, liste] of Object.entries(brut.situations ?? {}))
    if (!INCONNUS.has(slug) && Array.isArray(liste)) {
      const propres = liste.filter((c): c is Case => CASES.includes(c as Case))
      if (propres.length) situations[slug] = propres
    }

  return { garde: brut.garde === 'gauche' ? 'gauche' : 'droite', corrections, situations }
}

/** Une sauvegarde pèse quelques dizaines de Ko ; au-delà, ce n'est pas la nôtre. */
const TAILLE_MAX = 2 * 1024 * 1024
const JOUR = /^\d{4}-\d{2}-\d{2}$/
const INCONNUS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Lit un fichier de sauvegarde, ou lève une erreur claire. `connue` écarte les
 * techniques qui ne sont pas au catalogue : un fichier venu d'ailleurs, ou
 * d'une version plus récente, ne glisse pas de fiches fantômes dans le carnet.
 */
export async function importProgress(file: File, connue: (slug: string) => boolean = () => true): Promise<Restauration> {
  if (file.size > TAILLE_MAX) throw new Error("Ce fichier est trop lourd pour être une sauvegarde Judodex.")
  const parsed = JSON.parse(await file.text()) as Partial<Backup>
  if (parsed.format !== FORMAT || typeof parsed.progress !== 'object' || parsed.progress === null) {
    throw new Error("Ce fichier n'est pas une sauvegarde Judodex.")
  }
  const clean: ProgressMap = {}
  for (const [slug, e] of Object.entries(parsed.progress)) {
    if (!e || typeof e !== 'object' || INCONNUS.has(slug) || !connue(slug)) continue
    const mastery = e.mastery === 'learning' || e.mastery === 'mastered' ? e.mastery : 'unknown'
    clean[slug] = {
      mastery,
      tokui: !!e.tokui,
      updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : '',
      ...(Number.isInteger(e.box) && e.box! >= 0 && e.box! <= MAX_BOX ? { box: e.box } : {}),
      ...(typeof e.due === 'string' && JOUR.test(e.due) ? { due: e.due } : {}),
    }
  }
  return {
    progress: clean,
    profil: lireProfil(parsed.profil),
    monJudo: parsed.monJudo && typeof parsed.monJudo === 'object' ? parsed.monJudo : null,
  }
}
