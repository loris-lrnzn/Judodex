/**
 * Écrit robots.txt et sitemap.xml dans dist/, après le build.
 *
 * Le plan du site se déduit du catalogue plutôt que d'être tenu à la main :
 * une technique ajoutée demain y figure sans que personne ait à y penser.
 * Le domaine vient de VITE_SITE_URL, l'unique endroit où il est écrit.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(racine, 'dist')

/** Lit VITE_SITE_URL dans l'environnement, sinon dans .env.production ou .env. */
function siteUrl() {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL
  for (const nom of ['.env.production', '.env']) {
    const env = join(racine, nom)
    if (!existsSync(env)) continue
    const m = readFileSync(env, 'utf8').match(/^\s*VITE_SITE_URL\s*=\s*(.+)$/m)
    if (m) return m[1].trim()
  }
  return null
}

const base = siteUrl()?.replace(/\/+$/, '')
if (!base) {
  console.warn('gen-seo : VITE_SITE_URL absent, robots.txt et sitemap.xml non générés.')
  process.exit(0)
}
if (!existsSync(dist)) {
  console.warn('gen-seo : dist/ absent, rien à écrire.')
  process.exit(0)
}

const data = JSON.parse(readFileSync(join(racine, 'src/data/techniques.json'), 'utf8'))
const techniques = data.techniques ?? []
/** Date du dernier relevé, au format que lisent les moteurs. */
const maj = (data.scrapedAt ?? new Date().toISOString()).slice(0, 10)

const pages = [
  { loc: '/', priority: '1.0', changefreq: 'monthly' },
  { loc: '/techniques', priority: '0.9', changefreq: 'monthly' },
  { loc: '/dojo', priority: '0.8', changefreq: 'monthly' },
  { loc: '/mon-judo', priority: '0.7', changefreq: 'monthly' },
  { loc: '/dojo/ceinture-noire', priority: '0.7', changefreq: 'yearly' },
  { loc: '/dojo/ceinture-noire/2e-dan', priority: '0.6', changefreq: 'yearly' },
  { loc: '/dojo/ceinture-noire/3e-dan', priority: '0.6', changefreq: 'yearly' },
  { loc: '/reglages', priority: '0.2', changefreq: 'yearly' },
  ...techniques.map((t) => ({ loc: `/technique/${t.slug}`, priority: '0.8', changefreq: 'yearly', technique: t })),
]

const echappe = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Une fiche porte deux ressources que le plan du site sait déclarer à part :
 * sa carte de partage et sa démonstration filmée. Déclarées, elles entrent
 * dans la recherche d'images et dans celle de vidéos — deux portes d'entrée
 * de plus vers la même page, qu'un plan réduit aux adresses laisse fermées.
 */
function extras(p) {
  const t = p.technique
  if (!t) return ''
  const img = `
    <image:image><image:loc>${base}/og/${t.slug}.png</image:loc><image:title>${echappe(`${t.name} — ${t.translation}`)}</image:title></image:image>`
  if (!t.youtubeId) return img
  return (
    img +
    `
    <video:video><video:thumbnail_loc>https://i.ytimg.com/vi/${t.youtubeId}/maxresdefault.jpg</video:thumbnail_loc><video:title>${echappe(`${t.name} (${t.kanji}) — démonstration`)}</video:title><video:description>${echappe(`Démonstration de référence de ${t.name}, ${t.translation.toLowerCase()}.`)}</video:description><video:player_loc>https://www.youtube-nocookie.com/embed/${t.youtubeId}</video:player_loc>${t.youtubeDuration ? `<video:duration>${t.youtubeDuration}</video:duration>` : ''}<video:family_friendly>yes</video:family_friendly></video:video>`
  )
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
  ...pages.map(
    (p) =>
      `  <url><loc>${base}${p.loc}</loc><lastmod>${maj}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority>${extras(p)}</url>`,
  ),
  '</urlset>',
  '',
].join('\n')

writeFileSync(join(dist, 'sitemap.xml'), xml)
/*
 * Les robots des moteurs génératifs n'exécutent pas le script : c'est le
 * pré-rendu qui leur donne quelque chose à lire. Reste à les autoriser
 * nommément — une permission implicite se perd au premier durcissement de
 * configuration, et l'absence de mention se lit parfois comme un refus.
 */
const AGENTS_IA = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot', 'Amazonbot', 'meta-externalagent', 'DuckAssistBot', 'cohere-ai', 'MistralAI-User']

writeFileSync(
  join(dist, 'robots.txt'),
  [
    'User-agent: *',
    'Allow: /',
    '',
    "# Moteurs de recherche générative : le contenu leur est ouvert, il est pré-rendu pour eux.",
    ...AGENTS_IA.flatMap((a) => [`User-agent: ${a}`, 'Allow: /', '']),
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n'),
)
/*
 * llms.txt : un sommaire écrit pour une machine qui lit, pas pour un moteur
 * qui classe. Il dit en clair ce que le site contient, d'où viennent les
 * données et comment les adresses sont formées — ce qu'un modèle devrait
 * autrement déduire de cent douze pages.
 */
const FAMILLES = {
  'te-waza': 'techniques de bras',
  'koshi-waza': 'techniques de hanche',
  'ashi-waza': 'techniques de jambe',
  'ma-sutemi-waza': 'sacrifices en arrière',
  'yoko-sutemi-waza': 'sacrifices sur le côté',
  'osaekomi-waza': 'immobilisations',
  'shime-waza': 'étranglements',
  'kansetsu-waza': 'luxations',
}

const parFamille = new Map()
for (const t of techniques) {
  if (!parFamille.has(t.family)) parFamille.set(t.family, [])
  parFamille.get(t.family).push(t)
}

const llms = [
  '# Judodex — le carnet du judoka',
  '',
  `> Catalogue des ${techniques.length} techniques de judo en français. Chaque technique porte son nom japonais, ses kanji, sa traduction, sa famille, son niveau de ceinture et sa décomposition en trois phases — kuzushi (déséquilibre), tsukuri (placement), kake (exécution) —, ses points clés et ses enchaînements vers d'autres techniques. Dernier relevé de la nomenclature : ${maj}.`,
  '',
  "Le site est une application consultable hors ligne ; toutes les pages sont également servies en HTML complet. Les adresses de fiche suivent la forme `/technique/<slug>`.",
  '',
  '## Pages principales',
  '',
  `- [Accueil](${base}/) : progression et programme de la ceinture préparée.`,
  `- [Catalogue complet](${base}/techniques) : les ${techniques.length} techniques, par famille ou par ceinture.`,
  `- [Dojo](${base}/dojo) : séance de révision espacée sur la démonstration filmée ou le sens du nom.`,
  `- [Mon judo](${base}/mon-judo) : bilan personnel — directions de projection, situations de garde, systèmes d'attaque.`,
  `- [Ceinture noire](${base}/dojo/ceinture-noire) : programme des 1er, 2e et 3e dan (katas, listes, tirage du jury).`,
  '',
  '## Techniques par famille',
  '',
  ...[...parFamille.entries()].flatMap(([fam, list]) => [
    `### ${fam} — ${FAMILLES[fam] ?? fam} (${list.length})`,
    '',
    ...list.map((t) => `- [${t.name} ${t.kanji}](${base}/technique/${t.slug}) : ${t.translation}.`),
    '',
  ]),
  '## Sources',
  '',
  "- Nomenclature et programme de passage de grade : Fédération française de judo.",
  '- Démonstrations de référence : Kodokan.',
  '',
].join('\n')

writeFileSync(join(dist, 'llms.txt'), llms)

console.log(`gen-seo : ${pages.length} URLs dans sitemap.xml, robots.txt et llms.txt écrits (${base}).`)
