import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Les systèmes que le pratiquant a montés.
 *
 * Deux choses s'y écrivent, et ce sont les deux gestes de la construction :
 * choisir une arme, puis retenir parmi les suites que le catalogue propose
 * celles qu'on fait vraiment. Retenir, et non écarter : une première version
 * proposait tout d'office et laissait retirer, mais on ne sentait alors nulle
 * part qu'on construisait quelque chose — tout était déjà là.
 *
 * Les tokui-waza déclarés sur les fiches comptent comme armes sans figurer
 * ici : `armes` ne porte que les choix faits depuis le bilan.
 */
export interface BrancheLibre {
  type: 'enchainement' | 'redoublement' | 'contre' | 'liaison-sol'
  slug: string
}

export interface EtatSystemes {
  /** Armes choisies depuis le bilan, en plus des tokui-waza. */
  armes: string[]
  /** Branches retenues, par arme : clés `type:slug`. */
  retenues: Record<string, string[]>
  /**
   * Branches ajoutées à la main, par arme. Le catalogue propose le judo
   * courant ; celui qui en fait un autre doit pouvoir l'écrire, sans quoi la
   * planche ne décrit que les systèmes déjà prévus par quelqu'un d'autre.
   */
  libres: Record<string, BrancheLibre[]>
}

const DEFAUT: EtatSystemes = { armes: [], retenues: {}, libres: {} }

/**
 * Remet une valeur stockée à la forme courante.
 *
 * `useLocalStorage` rend le JSON tel qu'il a été écrit : un carnet enregistré
 * avant l'ajout d'un champ n'en a pas trace, et le champ arrive `undefined`
 * plutôt qu'à sa valeur par défaut. Toute lecture passe donc par ici, et
 * ajouter un champ demain ne cassera pas les carnets d'aujourd'hui.
 */
export const normaliser = (e: Partial<EtatSystemes> | null | undefined): EtatSystemes => ({
  armes: e?.armes ?? DEFAUT.armes,
  retenues: e?.retenues ?? DEFAUT.retenues,
  libres: e?.libres ?? DEFAUT.libres,
})

export function useSystemes() {
  const [brut, setBrut] = useLocalStorage<Partial<EtatSystemes>>('judodex:systemes:v2', DEFAUT)

  const etat = useMemo(() => normaliser(brut), [brut])

  const setEtat = useCallback(
    (f: (e: EtatSystemes) => EtatSystemes) => setBrut((b) => f(normaliser(b))),
    [setBrut],
  )

  const retenuesDe = useCallback((arme: string) => new Set(etat.retenues[arme] ?? []), [etat])

  const estArme = useCallback((slug: string) => etat.armes.includes(slug), [etat])

  const basculerArme = useCallback(
    (slug: string) =>
      setEtat((e) => {
        if (!e.armes.includes(slug)) return { ...e, armes: [...e.armes, slug] }
        const retenues = { ...e.retenues }
        const libres = { ...e.libres }
        delete retenues[slug]
        delete libres[slug]
        return { armes: e.armes.filter((s) => s !== slug), retenues, libres }
      }),
    [setEtat],
  )

  const basculer = useCallback(
    (arme: string, cle: string) =>
      setEtat((e) => {
        const liste = e.retenues[arme] ?? []
        const suivante = liste.includes(cle) ? liste.filter((c) => c !== cle) : [...liste, cle]
        const retenues = { ...e.retenues }
        if (suivante.length) retenues[arme] = suivante
        else delete retenues[arme]
        return { ...e, retenues }
      }),
    [setEtat],
  )

  /** Retient d'un coup toutes les branches proposées : pour qui les fait toutes. */
  const toutRetenir = useCallback(
    (arme: string, cles: string[]) => setEtat((e) => ({ ...e, retenues: { ...e.retenues, [arme]: cles } })),
    [setEtat],
  )

  const vider = useCallback(
    (arme: string) =>
      setEtat((e) => {
        const retenues = { ...e.retenues }
        delete retenues[arme]
        return { ...e, retenues }
      }),
    [setEtat],
  )

  const libresDe = useCallback((arme: string) => etat.libres[arme] ?? [], [etat])

  const ajouterLibre = useCallback(
    (arme: string, branche: BrancheLibre) =>
      setEtat((e) => {
        const liste = e.libres[arme] ?? []
        if (liste.some((b) => b.slug === branche.slug && b.type === branche.type)) return e
        return { ...e, libres: { ...e.libres, [arme]: [...liste, branche] } }
      }),
    [setEtat],
  )

  const retirerLibre = useCallback(
    (arme: string, branche: BrancheLibre) =>
      setEtat((e) => {
        const liste = (e.libres[arme] ?? []).filter((b) => !(b.slug === branche.slug && b.type === branche.type))
        const libres = { ...e.libres }
        if (liste.length) libres[arme] = liste
        else delete libres[arme]
        return { ...e, libres }
      }),
    [setEtat],
  )

  /** Remplace l'état entier — restauration d'une sauvegarde. */
  const remplacer = useCallback((e: EtatSystemes) => setBrut(normaliser(e)), [setBrut])

  const retouchees = Object.keys(etat.retenues).length

  return useMemo(
    () => ({
      retenuesDe,
      estArme,
      basculerArme,
      basculer,
      toutRetenir,
      vider,
      libresDe,
      ajouterLibre,
      retirerLibre,
      remplacer,
      retouchees,
      etat,
    }),
    [retenuesDe, estArme, basculerArme, basculer, toutRetenir, vider, libresDe, ajouterLibre, retirerLibre, remplacer, retouchees, etat],
  )
}
