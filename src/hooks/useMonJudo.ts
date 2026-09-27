import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { ETAPES, PAR_COIN, VIERGE, indexEtape, normaliser, type EtapeId, type MonJudo, type ReactionId } from '../lib/monjudo'
import type { Garde, Secteur } from '../lib/secteurs'
import type { Case } from '../lib/situations'

export const CLE_MON_JUDO = 'judodex:mon-judo:v1'

/**
 * L’état de Mon judo, rangé à part du carnet. Il se relit par `normaliser` à
 * chaque lecture : un slug disparu du catalogue, un champ ajouté depuis, rien
 * de cela ne fait tomber la page.
 */
export function useMonJudo(connue: (slug: string) => boolean) {
  const [brut, setBrut, effacer] = useLocalStorage<unknown>(CLE_MON_JUDO, VIERGE)
  const mj = useMemo(() => normaliser(brut, connue), [brut, connue])

  const maj = useCallback((f: (m: MonJudo) => MonJudo) => setBrut((b: unknown) => f(normaliser(b, connue))), [setBrut, connue])

  const aller = useCallback(
    (courante: EtapeId) =>
      maj((m) => ({ ...m, courante })),
    [maj],
  )
  const suivante = useCallback(
    () =>
      maj((m) => {
        const i = indexEtape(m.courante)
        const prochaine = ETAPES[Math.min(i + 1, ETAPES.length - 1)].id
        return { ...m, vues: [...new Set([...m.vues, m.courante])], courante: prochaine }
      }),
    [maj],
  )
  const precedente = useCallback(
    () => maj((m) => ({ ...m, courante: ETAPES[Math.max(indexEtape(m.courante) - 1, 0)].id })),
    [maj],
  )

  return {
    mj,
    aller,
    suivante,
    precedente,
    vue: (id: EtapeId) => mj.vues.includes(id),
    setPrenom: (prenom: string) => maj((m) => ({ ...m, prenom: prenom.slice(0, 40) })),
    setGarde: (garde: Garde) => maj((m) => ({ ...m, garde })),
    /** Changer de technique ne défait pas le reste : les coins restent, les suites se relisent. */
    setTokui: (tokui: string | null) =>
      maj((m) => ({
        ...m,
        tokui,
        // Une technique ne figure pas deux fois : si elle était rangée dans un
        // coin, elle en sort pour prendre la tête.
        coins: Object.fromEntries(Object.entries(m.coins).map(([s, l]) => [s, l.filter((x) => x !== tokui)])) as MonJudo['coins'],
      })),
    basculerCoin: (s: Secteur, slug: string) =>
      maj((m) => {
        const liste = m.coins[s]
        const coins = {
          ...m.coins,
          [s]: liste.includes(slug) ? liste.filter((x) => x !== slug) : liste.length >= PAR_COIN ? liste : [...liste, slug],
        }
        return { ...m, coins }
      }),
    setReaction: (r: ReactionId, slug: string | null) =>
      maj((m) => {
        const reactions = { ...m.reactions }
        if (slug) reactions[r] = slug
        else delete reactions[r]
        return { ...m, reactions }
      }),
    setEntree: (c: Case, slug: string | null) =>
      maj((m) => {
        const entrees = { ...m.entrees }
        if (slug) entrees[c] = slug
        else delete entrees[c]
        return { ...m, entrees }
      }),
    setTransition: (transition: string | null) => maj((m) => ({ ...m, transition })),
    setFinition: (finition: string | null) => maj((m) => ({ ...m, finition })),
    /** Tout reprendre à zéro. Le reste du carnet n’est pas touché. */
    recommencer: effacer,
    /** Remplace l’état entier : restauration d’une sauvegarde, ou carte reçue qu’on adopte. */
    remplacer: (m: MonJudo) => setBrut(m),
  }
}

export type MonJudoApi = ReturnType<typeof useMonJudo>
