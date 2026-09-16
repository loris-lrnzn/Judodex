import type { ProgressMap } from '../types/judodex'
import type { Profil } from '../hooks/useProfil'
import type { BrancheLibre, EtatSystemes } from '../hooks/useSystemes'
import type { Direction } from './secteurs'
import { CASES, type Case } from './situations'

const FORMAT = 'judodex-progress'

/**
 * Le carnet entier, tel qu'il se sauvegarde.
 *
 * La version 1 ne portait que la progression. La 2 y ajoute le profil — garde
 * et directions corrigées — et les systèmes montés, sans quoi une restauration
 * rendrait un répertoire sans la lecture qu'on en avait faite. Les fichiers
 * version 1 restent lisibles : leurs champs manquants valent défaut.
 */
export interface Backup {
  format: typeof FORMAT
  version: 1 | 2
  exportedAt: string
  progress: ProgressMap
  profil?: Profil
  systemes?: EtatSystemes
}

/** Ce qu'une restauration rend à l'application. */
export interface Restauration {
  progress: ProgressMap
  profil: Profil | null
  systemes: EtatSystemes | null
}

export interface ADeposer {
  progress: ProgressMap
  profil: Profil
  systemes: EtatSystemes
}

/** Télécharge le carnet sous forme de fichier JSON. */
export function exportProgress({ progress, profil, systemes }: ADeposer) {
  const payload: Backup = {
    format: FORMAT,
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
    profil,
    systemes,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `judodex-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const DIRECTIONS: Direction[] = ['av', 'av-d', 'd', 'ar-d', 'ar', 'ar-g', 'g', 'av-g']

/** On ne fait entrer que ce qu'on reconnaît : un fichier trafiqué ne casse rien. */
function lireProfil(p: unknown): Profil | null {
  if (!p || typeof p !== 'object') return null
  const brut = p as Partial<Profil>
  const corrections: Record<string, Direction> = {}
  for (const [slug, dir] of Object.entries(brut.corrections ?? {}))
    if (DIRECTIONS.includes(dir as Direction)) corrections[slug] = dir as Direction

  const situations: Record<string, Case[]> = {}
  for (const [slug, liste] of Object.entries(brut.situations ?? {}))
    if (Array.isArray(liste)) {
      const propres = liste.filter((c): c is Case => CASES.includes(c as Case))
      if (propres.length) situations[slug] = propres
    }

  return { garde: brut.garde === 'gauche' ? 'gauche' : 'droite', corrections, situations }
}

function lireSystemes(s: unknown): EtatSystemes | null {
  if (!s || typeof s !== 'object') return null
  const brut = s as Partial<EtatSystemes>
  const retenues: Record<string, string[]> = {}
  for (const [arme, liste] of Object.entries(brut.retenues ?? {}))
    if (Array.isArray(liste)) retenues[arme] = liste.filter((c): c is string => typeof c === 'string')
  const TYPES = ['enchainement', 'redoublement', 'contre', 'liaison-sol']
  const libres: Record<string, BrancheLibre[]> = {}
  for (const [arme, liste] of Object.entries(brut.libres ?? {}))
    if (Array.isArray(liste))
      libres[arme] = liste.filter(
        (b): b is BrancheLibre => !!b && typeof b === 'object' && typeof b.slug === 'string' && TYPES.includes(b.type),
      )
  return {
    armes: Array.isArray(brut.armes) ? brut.armes.filter((a): a is string => typeof a === 'string') : [],
    retenues,
    libres,
  }
}

/** Lit un fichier de sauvegarde, ou lève une erreur claire. */
export async function importProgress(file: File): Promise<Restauration> {
  const parsed = JSON.parse(await file.text()) as Partial<Backup>
  if (parsed.format !== FORMAT || typeof parsed.progress !== 'object' || parsed.progress === null) {
    throw new Error("Ce fichier n'est pas une sauvegarde Judodex.")
  }
  const clean: ProgressMap = {}
  for (const [slug, e] of Object.entries(parsed.progress)) {
    if (!e || typeof e !== 'object') continue
    const mastery = e.mastery === 'learning' || e.mastery === 'mastered' ? e.mastery : 'unknown'
    clean[slug] = {
      mastery,
      tokui: !!e.tokui,
      updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : '',
      ...(typeof e.box === 'number' ? { box: e.box } : {}),
      ...(typeof e.due === 'string' ? { due: e.due } : {}),
    }
  }
  return { progress: clean, profil: lireProfil(parsed.profil), systemes: lireSystemes(parsed.systemes) }
}
