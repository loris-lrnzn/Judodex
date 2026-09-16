import type { Route } from '../hooks/useRoute'
import { routePath } from '../hooks/useRoute'
import type { Technique } from '../types/judodex'

/**
 * Ce que la page dit d'elle-même : titre, résumé, adresse canonique.
 *
 * Une application à une seule page garde le titre du document du premier
 * chargement jusqu'au dernier. L'onglet, l'historique, le partage et les
 * lecteurs d'écran annoncent alors tous la même chose sur cent douze pages
 * différentes. On recalcule donc l'en-tête du document à chaque route, au
 * même endroit que le routeur.
 */

export const SITE = 'Judodex'
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://judodex.fr').replace(/\/+$/, '')

const ACCUEIL =
  'Le carnet du judoka : 104 techniques décomposées en kuzushi, tsukuri et kake, révision espacée et suivi de progression.'

export interface Head {
  /** Titre complet du document, marque comprise. */
  title: string
  description: string
  canonical: string
  /** Aperçu de partage. Chaque fiche a le sien ; le reste partage celui du site. */
  image: string
  /** Texte de remplacement de cet aperçu, pour qui ne voit pas l'image. */
  imageAlt: string
}

/** L'aperçu générique, celui des écrans qui n'ont pas de sujet propre. */
const OG_SITE = `${SITE_URL}/og.png`

const RESUMES: Partial<Record<Route['name'], { titre: string; description: string }>> = {
  home: { titre: 'Le carnet du judoka', description: ACCUEIL },
  browse: {
    titre: 'Les 104 techniques',
    description:
      'Le catalogue complet du judo, rangé par famille ou par ceinture : te-waza, koshi-waza, ashi-waza, sutemi-waza et travail au sol.',
  },
  train: {
    titre: 'Dojo — séance de révision',
    description:
      "Dix questions sur la démonstration filmée ou sur le sens du nom. Chaque réponse replanifie la révision de la technique.",
  },
  profil: {
    titre: 'Mon judo — bilan personnel',
    description:
      "Où tombent vos adversaires, ce que vous savez opposer dans chaque garde, et ce que vous faites quand uke se défend.",
  },
  reglages: {
    titre: 'Réglages',
    description: 'Votre garde, la direction des projections et la sauvegarde du carnet. Tout reste dans ce navigateur.',
  },
  notFound: { titre: 'Page introuvable', description: ACCUEIL },
}

const DAN: Record<number, { titre: string; description: string }> = {
  1: {
    titre: 'Ceinture noire — 1er dan',
    description: "Le programme du 1er dan : nage no kata, listes de l'UV2 et tirage du jury.",
  },
  2: {
    titre: 'Ceinture noire — 2e dan',
    description: "Le programme du 2e dan : nage no kata complet, listes de l'UV2 et tirage du jury.",
  },
  3: {
    titre: 'Ceinture noire — 3e dan',
    description: 'Le programme du 3e dan : katame no kata, listes de spécialité et tirage du jury.',
  },
}

/** Coupe un résumé à la longueur qu'un moteur de recherche affiche. */
const court = (s: string, max = 160) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`)

export function headFor(route: Route, technique?: Technique | null): Head {
  const canonical = SITE_URL + routePath(route)

  if (route.name === 'technique') {
    if (!technique)
      return {
        title: `Technique introuvable — ${SITE}`,
        description: court(ACCUEIL),
        canonical,
        image: OG_SITE,
        imageAlt: `${SITE} — le carnet du judoka`,
      }
    return {
      title: `${technique.name} — ${technique.translation} | ${SITE}`,
      description: court(technique.intro || `${technique.name} : ${technique.translation}.`),
      canonical,
      // Une fiche partagée montre sa propre technique, pas la couverture du carnet.
      image: `${SITE_URL}/og/${technique.slug}.png`,
      imageAlt: `${technique.name} (${technique.kanji}) — ${technique.translation}`,
    }
  }

  if (route.name === 'dan') {
    const d = DAN[route.dan]
    return {
      title: `${d.titre} — ${SITE}`,
      description: court(d.description),
      canonical,
      image: OG_SITE,
      imageAlt: `${SITE} — ${d.titre}`,
    }
  }

  const r = RESUMES[route.name] ?? RESUMES.home!
  return {
    title: route.name === 'home' ? `${SITE} — ${r.titre}` : `${r.titre} — ${SITE}`,
    description: court(r.description),
    canonical,
    image: OG_SITE,
    imageAlt: `${SITE} — ${r.titre}`,
  }
}
