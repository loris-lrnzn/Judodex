import { useCallback, useMemo } from 'react'
import type { Judodex } from './useJudodex'
import type { useProfil } from './useProfil'
import type { useSystemes } from './useSystemes'
import {
  CONCLUSIONS,
  DIRECTIONS,
  SECTEURS,
  directionDe,
  directionMeta,
  secteurDe,
  type Direction,
  type Secteur,
} from '../lib/secteurs'
import { CASES, casesDe, couverture, type Case } from '../lib/situations'
import { monter } from '../lib/systeme'
import type { Combination, Technique } from '../types/judodex'

/** Familles du sol : elles ne répondent pas d'une situation de garde. */
const NE_WAZA = ['osaekomi-waza', 'shime-waza', 'kansetsu-waza']

/** Une technique placée sur la rose, avec ce que le carnet en dit. */
export interface Place {
  t: Technique
  dir: Direction
  secteur: Secteur | null
  tokui: boolean
}

/**
 * Tout ce que le bilan sait du judo d'un pratiquant.
 *
 * Le calcul vit ici et nulle part ailleurs : l'écran du bilan le traverse en
 * cinq étapes qui se partagent les mêmes chiffres, et deux d'entre elles se
 * contrediraient vite si chacune refaisait les siens.
 */
export function useBilan(
  dex: Judodex,
  profil: ReturnType<typeof useProfil>,
  systemes: ReturnType<typeof useSystemes>,
) {
  /** Répertoire : ce que le carnet donne pour acquis, tokui-waza compris. */
  const places = useMemo<Place[]>(() => {
    const out: Place[] = []
    for (const t of dex.techniques) {
      const p = dex.getProgress(t.slug)
      if (p.mastery !== 'mastered' && !p.tokui) continue
      const dir = directionDe(t.slug, profil.garde, profil.corrections)
      if (!dir) continue
      out.push({ t, dir, secteur: directionMeta(dir).secteur, tokui: !!p.tokui })
    }
    return out
  }, [dex, profil.garde, profil.corrections])

  const acquis = useMemo(() => new Set(places.map((p) => p.t.slug)), [places])

  const compte = useMemo(() => {
    const vide = () => Object.fromEntries(DIRECTIONS.map((d) => [d.id, 0])) as Record<Direction, number>
    const repertoire = vide()
    const tokui = vide()
    for (const p of places) {
      repertoire[p.dir]++
      if (p.tokui) tokui[p.dir]++
    }
    return { repertoire, tokui }
  }, [places])

  const parSecteur = useMemo(() => {
    const map = Object.fromEntries(SECTEURS.map((s) => [s, [] as Place[]])) as Record<Secteur, Place[]>
    for (const p of places) if (p.secteur) map[p.secteur].push(p)
    for (const s of SECTEURS) map[s].sort((a, b) => Number(b.tokui) - Number(a.tokui) || a.t.name.localeCompare(b.t.name))
    return map
  }, [places])

  /**
   * Le catalogue entier rangé par secteur, indépendamment du répertoire :
   * c'est ce qu'un quartier de la rose ouvre, pour qu'on puisse y ajouter.
   */
  const catalogueParSecteur = useMemo(() => {
    const map = Object.fromEntries(SECTEURS.map((s) => [s, [] as Technique[]])) as Record<Secteur, Technique[]>
    for (const t of dex.techniques) {
      const sec = secteurDe(t.slug, profil.garde, profil.corrections)
      if (sec) map[sec].push(t)
    }
    for (const s of SECTEURS) map[s].sort((a, b) => dex.numberOf.get(a.slug)! - dex.numberOf.get(b.slug)!)
    return map
  }, [dex, profil.garde, profil.corrections])

  /** Projections qui ne remplissent aucun coin : elles partent droit. */
  const cardinales = useMemo(() => places.filter((p) => !p.secteur), [places])

  const vides = useMemo(() => SECTEURS.filter((s) => parSecteur[s].length === 0), [parSecteur])

  /** Couverture des situations : d'où l'on sait partir, et non plus où ça tombe. */
  const situations = useMemo(
    () => couverture(places.map((p) => p.t), profil.situations),
    [places, profil.situations],
  )

  /**
   * Le catalogue rangé par case de la grille, indépendamment du répertoire :
   * c'est ce qu'une case ouvre, pour qu'on puisse y ajouter comme on ajoute
   * dans un quartier de la rose. Restreint au debout : une situation de garde
   * ne se règle pas avec un étranglement.
   */
  const catalogueParCase = useMemo(() => {
    const map = Object.fromEntries(CASES.map((c) => [c, [] as Technique[]])) as Record<Case, Technique[]>
    for (const t of dex.techniques) {
      if (NE_WAZA.includes(t.family)) continue
      for (const c of casesDe(t, profil.situations)) map[c].push(t)
    }
    for (const c of CASES) map[c].sort((a, b) => dex.numberOf.get(a.slug)! - dex.numberOf.get(b.slug)!)
    return map
  }, [dex, profil.situations])

  /**
   * Pour une case vide, les techniques qui l'attestent. Comme pour les
   * secteurs, on préfère ce qui s'accroche déjà au répertoire.
   */
  const propositionsSituation = useMemo(() => {
    const programme = new Set(dex.currentGroup.techniques.map((t) => t.slug))
    return Object.fromEntries(
      situations.vides.map((c) => {
        // Une situation de garde se règle debout : proposer un étranglement
        // pour combler « garde croisée, uke tourne » n'aurait aucun sens.
        const candidats = dex.techniques.filter(
          (t) => !acquis.has(t.slug) && !NE_WAZA.includes(t.family) && casesDe(t, profil.situations).includes(c),
        )
        const rang = (t: Technique) => (programme.has(t.slug) ? 0 : 1)
        return [
          c,
          [...candidats]
            .sort((a, b) => rang(a) - rang(b) || dex.numberOf.get(a.slug)! - dex.numberOf.get(b.slug)!)
            .slice(0, 3),
        ]
      }),
    ) as Record<Case, Technique[]>
  }, [situations.vides, dex, acquis, profil.situations])

  /**
   * Les techniques sur lesquelles un système peut se monter : celles du
   * répertoire qui portent au moins une liaison. Les tokui-waza en sont
   * d'office — c'est ce que « tokui » veut dire —, les autres se choisissent
   * ici même, pour que le premier geste de la construction soit à portée.
   */
  const candidates = useMemo(
    () =>
      places
        .filter((p) => dex.linksOf(p.t).length > 0)
        .sort((a, b) => Number(b.tokui) - Number(a.tokui) || a.t.name.localeCompare(b.t.name))
        .map((p) => ({ t: p.t, tokui: p.tokui })),
    [places, dex],
  )

  const armes = useMemo(
    () => candidates.filter(({ t, tokui }) => tokui || systemes.estArme(t.slug)).map(({ t }) => t),
    [candidates, systemes],
  )

  const mesSystemes = useMemo(
    () =>
      armes.map((t) =>
        monter(
          t,
          dex.linksOf(t).map((l) => ({ technique: l.technique, lien: l.lien })),
          dex.bySlug,
          acquis,
          profil.garde,
          profil.corrections,
          systemes.retenuesDe(t.slug),
          systemes.libresDe(t.slug),
        ),
      ),
    [armes, dex, acquis, profil.garde, profil.corrections, systemes],
  )

  /**
   * Pour un secteur vide, les techniques à y travailler. On propose d'abord
   * celles qui s'enchaînent avec ce que le pratiquant fait déjà : une attaque
   * isolée ne fait pas un système.
   */
  const propositions = useMemo(() => {
    const programme = new Set(dex.currentGroup.techniques.map((t) => t.slug))

    return Object.fromEntries(
      vides.map((s) => {
        const candidats = dex.techniques.filter(
          (t) => !acquis.has(t.slug) && secteurDe(t.slug, profil.garde, profil.corrections) === s,
        )

        // Une liaison depuis le répertoire vaut mieux qu'une technique isolée.
        const liees = new Map<string, Technique>()
        for (const p of places)
          for (const l of dex.linksOf(p.t))
            if (
              l.type === 'enchainement' &&
              secteurDe(l.technique.slug, profil.garde, profil.corrections) === s &&
              !acquis.has(l.technique.slug)
            )
              liees.set(l.technique.slug, p.t)

        const rang = (t: Technique) => (liees.has(t.slug) ? 0 : programme.has(t.slug) ? 1 : 2)
        const tries = [...candidats].sort((a, b) => rang(a) - rang(b) || dex.numberOf.get(a.slug)! - dex.numberOf.get(b.slug)!)

        return [s, tries.slice(0, 3).map((t) => ({ t, depuis: liees.get(t.slug) ?? null }))]
      }),
    ) as Record<Secteur, { t: Technique; depuis: Technique | null }[]>
  }, [vides, places, dex, acquis, profil.garde, profil.corrections])

  /**
   * Au sol, on ne compte pas des secteurs : on compte des manières de finir.
   * Chaque conclusion dit maintenant par quelle projection du répertoire on y
   * arrive — c'est ce que les liaisons debout-sol ont rendu possible.
   */
  const sol = useMemo(
    () =>
      CONCLUSIONS.map((c) => {
        const list = dex.techniques.filter((t) => {
          const p = dex.getProgress(t.slug)
          return t.family === c.id && (p.mastery === 'mastered' || p.tokui)
        })
        const depuis = new Map<string, Technique[]>()
        for (const p of places)
          for (const l of dex.linksOf(p.t))
            if (l.type === 'liaison-sol' && l.technique.family === c.id)
              depuis.set(l.technique.slug, [...(depuis.get(l.technique.slug) ?? []), p.t])
        return { ...c, list, depuis }
      }),
    [dex, places],
  )

  /**
   * Ce qu'on propose pour une branche ajoutée à la main. Une sortie au sol se
   * choisit parmi les contrôles, une suite debout parmi les projections :
   * proposer l'inverse serait proposer une faute.
   */
  const proposeesBranche = useCallback(
    (type: Combination['type']) => {
      return dex.techniques.filter((t) => NE_WAZA.includes(t.family) === (type === 'liaison-sol'))
    },
    [dex],
  )
  return {
    places,
    acquis,
    compte,
    parSecteur,
    catalogueParSecteur,
    catalogueParCase,
    cardinales,
    vides,
    situations,
    propositionsSituation,
    candidates,
    armes,
    mesSystemes,
    propositions,
    sol,
    proposeesBranche,
    /** Le carnet ne retient encore aucune projection. */
    vierge: places.length === 0,
  }
}

export type Bilan = ReturnType<typeof useBilan>
