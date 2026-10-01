import type { Route } from '../hooks/useRoute'
import { routePath } from '../hooks/useRoute'
import type { Technique } from '../types/judodex'
import { beltOf } from './belts'
import { FAMILY_META, GROUP_META } from './families'
import { FAMILLE_TEXTE } from './contenuSeo'
import { TERMES } from './lexique'
import donnees from '../data/techniques.json'

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

/** L'accueil se présente par ce que les gens cherchent : des techniques de judo, en français. */
const ACCUEIL_RECHERCHE =
  'Les 104 techniques de judo en français : nom japonais, kanji, décomposition en kuzushi, tsukuri et kake, démonstration filmée et programme de chaque ceinture.'

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
  home: { titre: 'Les 104 techniques de judo, en français', description: ACCUEIL_RECHERCHE },
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
    titre: 'Mon judo — construis ton judo',
    description:
      'Ta technique, les quatre coins où tu fais tomber, ce que tu fais quand uke résiste, tes entrées et ta finition au sol : ton judo, étape par étape, sur une carte à garder.',
  },
  carteJudo: {
    titre: 'Une carte de judo',
    description: 'Un judo construit sur Judodex : sa technique, ses coins, son système et sa finition au sol. Construis le tien.',
  },
  reglages: {
    titre: 'Réglages',
    description: 'Ta garde, la direction des projections et la sauvegarde du carnet. Tout reste dans ce navigateur.',
  },
  notFound: { titre: 'Page introuvable', description: ACCUEIL },
  ceintures: {
    titre: 'Les ceintures de judo : programme, blanche à noire',
    description:
      "Le programme de chaque ceinture de judo, de la jaune à la noire : techniques de projection et de sol imposées, situations d'étude, valeurs du code moral et volume de pratique.",
  },
  lexique: {
    titre: 'Lexique du judo : le vocabulaire japonais expliqué',
    description: `${TERMES.length} termes du judo expliqués avec leur écriture japonaise : kuzushi, tsukuri, kake, uke, tori, ippon, kyu, dan, katas et familles de techniques.`,
  },
  aPropos: {
    titre: 'À propos de Judodex : méthode et sources',
    description:
      "D'où viennent les contenus de Judodex : textes écrits pour le carnet, programmes de la fédération, démonstrations du Kodokan et de France Judo, et mises à jour.",
  },
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

/**
 * Coupe un résumé à la longueur qu'un moteur de recherche affiche, de
 * préférence sur la fin d'une phrase : un résumé qui s'arrête au milieu d'une
 * proposition (« …celui par lequel c… ») se lit comme un défaut dans les
 * résultats. À défaut de phrase assez longue, on coupe sur un mot.
 */
/** Petits mots qui ne peuvent pas finir une phrase coupée. */
const OUTILS = /\s+(?:le|la|les|l'|un|une|des|du|de|d'|à|au|aux|en|et|ou|par|sur|vers|son|sa|ses|ce|qui|que|qu')$/i

export const court = (s: string, max = 160) => {
  if (s.length <= max) return s
  const fin = [...s.slice(0, max).matchAll(/[.!?»)](?=\s)/g)].map((m) => m.index! + 1).pop()
  if (fin && fin >= 70) return s.slice(0, fin)
  let mot = s.slice(0, max - 1).replace(/\s+\S*$/, '').replace(/[\s,;:—-]+$/, '')
  // Une coupe qui laisse « …ce qui ouvre la » en suspens se lit mal : on recule
  // jusqu'à un mot qui porte du sens.
  while (OUTILS.test(mot)) mot = mot.replace(OUTILS, '').replace(/[\s,;:—-]+$/, '')
  return `${mot}…`
}

/**
 * Les pages qui ne doivent pas entrer dans l'index : l'adresse inconnue, la
 * fiche sans technique, les réglages (rien à y chercher) et les cartes de
 * judo partagées, dont chacune est une adresse de plus sans texte propre.
 */
export const horsIndex = (route: Route, technique?: Technique | null) =>
  route.name === 'notFound' || route.name === 'reglages' || route.name === 'carteJudo' || (route.name === 'technique' && !technique)

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

  if (route.name === 'ceinture') {
    const b = beltOf(route.belt)
    const couleur = b.name.toLowerCase()
    return {
      title: `Ceinture ${couleur} de judo : programme et techniques — ${SITE}`,
      description: court(
        `Programme de la ceinture ${couleur} de judo (${b.kyu}) : ${b.nage.length} projections et ${b.katame.length} techniques au sol imposées, situations d'étude, valeurs et volume de pratique.`,
      ),
      canonical,
      image: OG_SITE,
      imageAlt: `${SITE} — ceinture ${couleur}`,
    }
  }

  if (route.name === 'famille') {
    const texte = FAMILLE_TEXTE[route.group]
    const meta = GROUP_META[route.group]
    const n = (donnees as { techniques: { family: keyof typeof FAMILY_META }[] }).techniques.filter((t) => FAMILY_META[t.family].group === route.group).length
    return {
      title: `${texte.h1} — ${SITE}`,
      description: court(
        `Les ${n} techniques de ${meta.name.toLowerCase()} du judo (${meta.jp}) : principe, liste complète avec nom japonais, kanji et traduction, et ceinture de chaque technique.`,
      ),
      canonical,
      image: OG_SITE,
      imageAlt: `${SITE} — ${texte.h1}`,
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
