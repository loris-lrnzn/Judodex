import type { Route } from '../hooks/useRoute'
import { routePath } from '../hooks/useRoute'
import { SITE, SITE_URL } from './head'
import donnees from '../data/techniques.json'
import type { Technique } from '../types/judodex'

/**
 * Ce que la page déclare d'elle-même en données structurées.
 *
 * Un moteur classique lit la page et devine. Un moteur génératif, lui, cherche
 * de quoi citer : une entité nommée, une procédure en étapes, une source. Le
 * catalogue a exactement cela — une technique porte un nom japonais, sa
 * traduction, sa décomposition en trois phases et ses points clés — mais rien
 * ne le disait dans un format lisible par une machine. On l'écrit ici, sans
 * rien affirmer que la page n'affiche.
 */

const FAMILLES: Record<string, string> = {
  'te-waza': 'Te-waza — techniques de bras',
  'koshi-waza': 'Koshi-waza — techniques de hanche',
  'ashi-waza': 'Ashi-waza — techniques de jambe',
  'ma-sutemi-waza': 'Ma-sutemi-waza — sacrifices en arrière',
  'yoko-sutemi-waza': 'Yoko-sutemi-waza — sacrifices sur le côté',
  'osaekomi-waza': 'Osaekomi-waza — immobilisations',
  'shime-waza': 'Shime-waza — étranglements',
  'kansetsu-waza': 'Kansetsu-waza — luxations',
}

/** Date du dernier relevé de la nomenclature, au format que lisent les moteurs. */
const MAJ = (donnees as { scrapedAt?: string }).scrapedAt ?? new Date().toISOString()

const EDITEUR = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#editeur`,
  name: SITE,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon.svg`,
}

/**
 * Le judo lui-même, désigné par ses identifiants publics.
 *
 * Sans cela, un moteur doit deviner que « ashi-waza » relève du judo et non
 * d'une marque ou d'un patronyme. Les deux `sameAs` rattachent le carnet à une
 * entité que les bases de connaissances connaissent déjà : c'est ce qui permet
 * d'être cité en réponse à une question sur le judo, et pas seulement trouvé
 * en réponse à une recherche sur « judodex ».
 */
const JUDO = {
  '@type': 'Thing',
  '@id': `${SITE_URL}/#judo`,
  name: 'Judo',
  sameAs: ['https://fr.wikipedia.org/wiki/Judo', 'https://www.wikidata.org/wiki/Q11420'],
}

/** Convertit une durée en secondes vers la notation ISO 8601 attendue. */
function duree(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return `PT${m ? `${m}M` : ''}${s || !m ? `${s}S` : ''}`
}

/** Fil d'Ariane : il dit à quel ensemble la page appartient. */
function filDAriane(elements: { nom: string; chemin: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: elements.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nom,
      item: SITE_URL + e.chemin,
    })),
  }
}

/**
 * La démonstration filmée, décrite entièrement.
 *
 * Une `embedUrl` seule ne suffit pas : sans titre, vignette ni durée, la vidéo
 * n'est pas éligible à l'affichage enrichi et le moteur l'ignore. La vignette
 * et la durée, elles, viennent des données qu'on a déjà.
 */
function video(t: Technique) {
  if (!t.youtubeId) return null
  return {
    '@type': 'VideoObject',
    name: `${t.name} (${t.kanji}) — démonstration`,
    description: `Démonstration de référence de ${t.name}, ${t.translation.toLowerCase()}.`,
    thumbnailUrl: `https://i.ytimg.com/vi/${t.youtubeId}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${t.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${t.youtubeId}`,
    inLanguage: 'fr',
    ...(t.youtubeDuration ? { duration: duree(t.youtubeDuration) } : {}),
  }
}

/**
 * Une technique est une procédure : un déséquilibre, un placement, une
 * exécution. `HowTo` dit cela mieux qu'un article, et c'est la forme qu'un
 * moteur sait reprendre en réponse à « comment fait-on o-goshi ».
 */
function technique(t: Technique) {
  const url = `${SITE_URL}/technique/${t.slug}`
  const film = video(t)
  /*
   * Les trente-cinq techniques de sol n'ont pas de décomposition en trois
   * phases : `HowTo` exige des étapes, on ne peut pas le déclarer sans. Elles
   * partent donc en `Article`, qui réclame à son tour un titre, un auteur et
   * une date — sans quoi la déclaration est incomplète et le moteur la
   * signale au lieu de l'exploiter.
   */
  const procedure = t.phases.length > 0
  const graphe: Record<string, unknown>[] = [
    {
      '@type': procedure ? 'HowTo' : 'Article',
      '@id': `${url}#technique`,
      name: `${t.name} (${t.kanji}) — ${t.translation}`,
      alternateName: [t.kanji, t.translation],
      description: t.intro,
      inLanguage: 'fr',
      url,
      // Une fiche sans image n'obtient pas d'affichage enrichi.
      image: `${SITE_URL}/og/${t.slug}.png`,
      dateModified: MAJ,
      publisher: EDITEUR,
      author: EDITEUR,
      ...(procedure ? {} : { headline: `${t.name} — ${t.translation}`, datePublished: MAJ }),
      isPartOf: { '@id': `${SITE_URL}/#site` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#page` },
      about: [
        { '@id': `${SITE_URL}/#judo` },
        {
          '@type': 'Thing',
          name: t.name,
          alternateName: t.kanji,
          description: `${t.translation}. Famille : ${FAMILLES[t.family] ?? t.family}.`,
        },
      ],
      ...(t.phases.length > 0
        ? {
            step: t.phases.map((p, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: `${p.label} (${p.kanji}) — ${p.meaning}`,
              text: p.description,
              url: `${url}#${p.label.toLowerCase()}`,
            })),
          }
        : {}),
      ...(t.keyPoints?.length ? { mentions: t.keyPoints.map((k) => ({ '@type': 'Thing', name: k })) } : {}),
      /*
       * Les enchaînements sont le vrai maillage du catalogue : ils disent
       * qu'o-goshi mène à harai-goshi. Déclarés, ils se lisent comme un
       * graphe de techniques et non comme cent quatre pages sans rapport.
       */
      ...(t.combinations?.length
        ? {
            isRelatedTo: [...new Set(t.combinations.map((c) => c.slug))].map((slug) => ({
              '@type': 'HowTo',
              '@id': `${SITE_URL}/technique/${slug}#technique`,
              url: `${SITE_URL}/technique/${slug}`,
            })),
          }
        : {}),
      ...(film ? { video: film } : {}),
    },
    filDAriane([
      { nom: 'Judodex', chemin: '/' },
      { nom: 'Techniques', chemin: '/techniques' },
      { nom: t.name, chemin: `/technique/${t.slug}` },
    ]),
  ]
  return graphe
}

/** Nom lisible de chaque écran, pour le fil d'Ariane. */
const NOMS: Partial<Record<Route['name'], string>> = {
  browse: 'Techniques',
  train: 'Dojo',
  profil: 'Mon judo',
  reglages: 'Réglages',
}

/** Le graphe de la page courante, ou null quand il n'y a rien à déclarer. */
export function jsonLdFor(route: Route, t?: Technique | null, total = 104): object | null {
  if (route.name === 'notFound') return null

  const base = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#site`,
    name: SITE,
    alternateName: 'Judodex — le carnet du judoka',
    url: `${SITE_URL}/`,
    inLanguage: 'fr',
    publisher: EDITEUR,
    about: { '@id': `${SITE_URL}/#judo` },
    description: `Catalogue des ${total} techniques de judo, décomposées en kuzushi, tsukuri et kake.`,
  }

  if (route.name === 'technique') {
    if (!t) return null
    return { '@context': 'https://schema.org', '@graph': [base, JUDO, ...technique(t)] }
  }

  if (route.name === 'browse') {
    const liste = (donnees as { techniques?: Technique[] }).techniques ?? []
    return {
      '@context': 'https://schema.org',
      '@graph': [
        base,
        JUDO,
        {
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/techniques#page`,
          name: `Les ${total} techniques de judo`,
          description: `Le catalogue complet du judo, rangé par famille — ${Object.values(FAMILLES).join(', ')}.`,
          inLanguage: 'fr',
          isPartOf: { '@id': `${SITE_URL}/#site` },
          about: { '@id': `${SITE_URL}/#judo` },
          dateModified: MAJ,
          /*
           * Le catalogue énuméré. C'est ce qui distingue une page de liste
           * d'une page de texte : le moteur y lit cent quatre entrées
           * nommées, chacune adressable, au lieu d'un bloc indistinct.
           */
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: liste.length,
            itemListOrder: 'https://schema.org/ItemListUnordered',
            itemListElement: liste.map((x, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${x.name} — ${x.translation}`,
              url: `${SITE_URL}/technique/${x.slug}`,
            })),
          },
        },
        filDAriane([
          { nom: 'Judodex', chemin: '/' },
          { nom: 'Techniques', chemin: '/techniques' },
        ]),
      ],
    }
  }

  if (route.name === 'home') {
    return { '@context': 'https://schema.org', '@graph': [base, JUDO, EDITEUR] }
  }

  if (route.name === 'dan') {
    const titre = `Ceinture noire — ${route.dan === 1 ? '1er' : `${route.dan}e`} dan`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        base,
        JUDO,
        {
          '@type': 'WebPage',
          '@id': SITE_URL + routePath(route) + '#page',
          url: SITE_URL + routePath(route),
          name: titre,
          inLanguage: 'fr',
          isPartOf: { '@id': `${SITE_URL}/#site` },
          about: { '@id': `${SITE_URL}/#judo` },
        },
        filDAriane([
          { nom: 'Judodex', chemin: '/' },
          { nom: 'Dojo', chemin: '/dojo' },
          { nom: 'Ceinture noire', chemin: '/dojo/ceinture-noire' },
          ...(route.dan === 1 ? [] : [{ nom: titre, chemin: routePath(route) }]),
        ]),
      ],
    }
  }

  const nom = NOMS[route.name]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      base,
      JUDO,
      {
        '@type': 'WebPage',
        '@id': SITE_URL + routePath(route) + '#page',
        url: SITE_URL + routePath(route),
        ...(nom ? { name: nom } : {}),
        inLanguage: 'fr',
        isPartOf: { '@id': `${SITE_URL}/#site` },
        about: { '@id': `${SITE_URL}/#judo` },
      },
      ...(nom
        ? [
            filDAriane([
              { nom: 'Judodex', chemin: '/' },
              { nom, chemin: routePath(route) },
            ]),
          ]
        : []),
    ],
  }
}
