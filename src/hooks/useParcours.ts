import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Le parcours du bilan.
 *
 * Six sections déployées d'un bloc ne disent pas par où commencer, et l'ordre
 * dans lequel on les lit n'est pas indifférent : on ne peut pas monter un
 * système avant d'avoir dit ce qu'on sait faire. Le bilan se traverse donc en
 * cinq étapes, dans l'ordre où elles dépendent l'une de l'autre — et rien
 * n'empêche de revenir en arrière, ni d'aller droit à la fin.
 */
export const ETAPES = [
  {
    id: 'garde',
    titre: 'Ta garde',
    question: 'Tu es droitier ou gaucher ?',
    jp: '組み手',
    /** Ce que l'étape sert à établir, en une ligne, à hauteur de tapis. */
    but: 'Tout le reste se lit dans ce sens-là.',
  },
  {
    id: 'repertoire',
    titre: 'Ton répertoire',
    question: 'Qu\'est-ce que tu sais faire ?',
    jp: '崩しの方向',
    but: 'Coche tes techniques dans les quatre coins où uke tombe.',
  },
  {
    id: 'situations',
    titre: 'Tes situations',
    question: 'D\'où sais-tu partir ?',
    jp: '相四つ',
    but: "Où uke tombe est une chose, d'où tu pars en est une autre.",
  },
  {
    id: 'systeme',
    titre: 'Ton système',
    question: 'Et quand il se défend ?',
    jp: '連絡変化',
    but: 'Une attaque isolée ne fait pas un système.',
  },
  {
    id: 'bilan',
    titre: 'Ton bilan',
    question: 'Voilà ton judo.',
    jp: '私の柔道',
    but: 'Ce que tu tiens, ce qui manque, et par quoi commencer.',
  },
] as const

export type EtapeId = (typeof ETAPES)[number]['id']

export const etapeMeta = (id: EtapeId) => ETAPES.find((e) => e.id === id)!
export const indexEtape = (id: EtapeId) => ETAPES.findIndex((e) => e.id === id)

export interface EtatParcours {
  /** Étape affichée. */
  courante: EtapeId
  /** Étapes que le pratiquant a validées d'un « Suivant ». */
  vues: EtapeId[]
}

const DEFAUT: EtatParcours = { courante: 'garde', vues: [] }

/** Même précaution qu'ailleurs : un carnet d'hier n'a pas les champs d'aujourd'hui. */
export const normaliserParcours = (e: Partial<EtatParcours> | null | undefined): EtatParcours => ({
  courante: ETAPES.some((x) => x.id === e?.courante) ? e!.courante! : DEFAUT.courante,
  vues: Array.isArray(e?.vues) ? e.vues.filter((v) => ETAPES.some((x) => x.id === v)) : [],
})

export function useParcours() {
  const [brut, setBrut] = useLocalStorage<Partial<EtatParcours>>('judodex:parcours:v1', DEFAUT)
  const etat = useMemo(() => normaliserParcours(brut), [brut])

  const aller = useCallback(
    (courante: EtapeId) => setBrut((b) => ({ ...normaliserParcours(b), courante })),
    [setBrut],
  )

  /** Valide l'étape courante et passe à la suivante. */
  const suivante = useCallback(
    () =>
      setBrut((b) => {
        const e = normaliserParcours(b)
        const i = indexEtape(e.courante)
        const vues = e.vues.includes(e.courante) ? e.vues : [...e.vues, e.courante]
        return { courante: ETAPES[Math.min(i + 1, ETAPES.length - 1)].id, vues }
      }),
    [setBrut],
  )

  const precedente = useCallback(
    () =>
      setBrut((b) => {
        const e = normaliserParcours(b)
        return { ...e, courante: ETAPES[Math.max(indexEtape(e.courante) - 1, 0)].id }
      }),
    [setBrut],
  )

  const vue = useCallback((id: EtapeId) => etat.vues.includes(id), [etat])

  return useMemo(
    () => ({ courante: etat.courante, vues: etat.vues, aller, suivante, precedente, vue }),
    [etat, aller, suivante, precedente, vue],
  )
}
