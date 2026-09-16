import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Direction, Garde } from '../lib/secteurs'
import type { Case } from '../lib/situations'

export interface Profil {
  /** Garde habituelle : elle renverse la lecture des secteurs. */
  garde: Garde
  /** Directions corrigées par le pratiquant, par identifiant de fiche. */
  corrections: Record<string, Direction>
  /**
   * Situations attribuées à la main, par identifiant de fiche.
   *
   * Les cases de la grille se remplissent d'après les liens du catalogue, qui
   * ne disent le déplacement de uke que là où quelqu'un l'a écrit. Un judoka
   * qui place son seoi-nage quand uke avance doit pouvoir le dire, même si
   * aucun lien ne l'atteste : c'est son judo, pas celui du catalogue.
   */
  situations: Record<string, Case[]>
}

const DEFAUT: Profil = { garde: 'droite', corrections: {}, situations: {} }

/**
 * Remet une valeur stockée à la forme courante — même précaution que pour les
 * systèmes : un carnet enregistré avant l'ajout d'un champ n'en a pas trace,
 * et le champ arriverait `undefined` au lieu de son défaut.
 */
export const normaliserProfil = (p: Partial<Profil> | null | undefined): Profil => ({
  garde: p?.garde ?? DEFAUT.garde,
  corrections: p?.corrections ?? DEFAUT.corrections,
  situations: p?.situations ?? DEFAUT.situations,
})

/**
 * Réglages personnels du bilan. Ils ne décrivent pas un niveau — le carnet
 * s'en charge — mais la manière dont le pratiquant lit son propre judo.
 */
export function useProfil() {
  const [brut, setBrut] = useLocalStorage<Partial<Profil>>('judodex:profil:v1', DEFAUT)

  const profil = useMemo(() => normaliserProfil(brut), [brut])

  const setProfil = useCallback(
    (f: (p: Profil) => Profil) => setBrut((b) => f(normaliserProfil(b))),
    [setBrut],
  )

  const setGarde = useCallback((garde: Garde) => setProfil((p) => ({ ...p, garde })), [setProfil])

  const corriger = useCallback(
    (slug: string, dir: Direction | null) =>
      setProfil((p) => {
        const corrections = { ...p.corrections }
        if (dir) corrections[slug] = dir
        else delete corrections[slug]
        return { ...p, corrections }
      }),
    [setProfil],
  )

  const reinitialiser = useCallback(() => setProfil((p) => ({ ...p, corrections: {} })), [setProfil])

  /** Attribue ou retire une situation à une technique, du point de vue du pratiquant. */
  const basculerSituation = useCallback(
    (slug: string, cas: Case) =>
      setProfil((p) => {
        const liste = p.situations[slug] ?? []
        const suivante = liste.includes(cas) ? liste.filter((c) => c !== cas) : [...liste, cas]
        const situations = { ...p.situations }
        if (suivante.length) situations[slug] = suivante
        else delete situations[slug]
        return { ...p, situations }
      }),
    [setProfil],
  )

  /** Remplace le profil entier — restauration d'une sauvegarde. */
  const remplacer = useCallback((p: Profil) => setBrut(normaliserProfil(p)), [setBrut])

  return useMemo(
    () => ({ ...profil, setGarde, corriger, basculerSituation, reinitialiser, remplacer }),
    [profil, setGarde, corriger, basculerSituation, reinitialiser, remplacer],
  )
}
