/**
 * Écrit chaque route sous forme de HTML complet dans dist/.
 *
 * Le carnet est une application rendue par le navigateur : le fichier servi ne
 * contient qu'un `<div id="root">` vide. Google finit par exécuter le script
 * et voir la page ; les robots des moteurs génératifs — GPTBot, ClaudeBot,
 * PerplexityBot, OAI-SearchBot — ne l'exécutent pas. Pour eux, les cent douze
 * pages du site étaient rigoureusement vides : rien à lire, rien à citer.
 *
 * On rend donc chaque route une fois, au build, et on écrit le résultat.
 * L'application se recharge par-dessus au premier affichage : le HTML servi
 * n'est pas une version figée du carnet, c'est sa première image, celle que
 * lit une machine qui ne saurait pas l'animer.
 *
 * Le mouvement est coupé pendant le rendu (`reducedMotion`), sans quoi les
 * blocs seraient saisis à mi-apparition, transparents.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'
import { preview } from 'vite'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(racine, 'dist')

if (!existsSync(join(dist, 'index.html'))) {
  console.warn('prerender : dist/index.html absent, rien à rendre.')
  process.exit(0)
}

const data = JSON.parse(readFileSync(join(racine, 'src/data/techniques.json'), 'utf8'))

/*
 * L'adresse introuvable est rendue elle aussi, sous le nom que l'hébergeur
 * sait servir avec un vrai code 404. Sans elle, toute adresse inconnue
 * renvoyait l'accueil avec un code 200 : un moteur y voit une page valide de
 * plus, en double de la racine, et le catalogue se dilue dans des adresses
 * qui n'existent pas.
 */
const INTROUVABLE = '/adresse-qui-n-existe-pas'

const routes = [
  '/',
  '/techniques',
  '/dojo',
  '/mon-judo',
  '/reglages',
  '/dojo/ceinture-noire',
  '/dojo/ceinture-noire/2e-dan',
  '/dojo/ceinture-noire/3e-dan',
  ...(data.techniques ?? []).map((t) => `/technique/${t.slug}`),
  INTROUVABLE,
]

const serveur = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'silent' })
const base = `http://localhost:4179`

const navigateur = await chromium.launch()
const contexte = await navigateur.newContext({
  viewport: { width: 1280, height: 900 },
  // Le service worker mettrait en cache la page rendue au lieu de la servir.
  serviceWorkers: 'block',
  reducedMotion: 'reduce',
})
const page = await contexte.newPage()

/* Les écrans secondaires arrivent en fragments demandés à l'exécution : le
   navigateur ne les découvre qu'une fois le script principal évalué, et la
   page rendue d'avance reste alors affichée plusieurs secondes avant que
   l'application ne la reprenne. On relève les fragments réellement chargés
   pour chaque route et on les annonce dans l'en-tête : ils descendent dès
   lors en parallèle du script principal. */
let fragments = []
page.on('response', (r) => {
  const u = new URL(r.url())
  if (u.origin === base && /^\/assets\/.*\.js$/.test(u.pathname)) fragments.push(u.pathname)
})

let écrits = 0
let vides = 0

for (const route of routes) {
  fragments = []
  await page.goto(base + route, { waitUntil: 'networkidle' })
  // Le titre est posé par useHead : sa présence atteste que React a rendu.
  await page.waitForFunction(() => document.querySelector('h1') !== null && document.title.includes('Judodex'), {
    timeout: 15000,
  })

  let html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML)

  // Le navigateur a pu poser lui-même son propre lien pendant le rendu : on
  // ne redouble pas ce que la page annonce déjà.
  const àPrécharger = [...new Set(fragments)].filter((f) => !html.includes(f))
  if (àPrécharger.length) {
    const liens = àPrécharger.map((f) => `<link rel="modulepreload" crossorigin href="${f}">`).join('\n    ')
    html = html.replace('</head>', `  ${liens}\n  </head>`)
  }

  // Une page sans texte n'a pas fini de se rendre : mieux vaut le savoir.
  // La page d'erreur, elle, est courte par nature.
  const texte = await page.evaluate(() => document.body.innerText.trim().length)
  if (texte < 200 && route !== INTROUVABLE) {
    console.warn(`prerender : ${route} rendu presque vide (${texte} caractères).`)
    vides++
  }

  if (route === INTROUVABLE) {
    writeFileSync(join(dist, '404.html'), html)
  } else {
    const dossier = route === '/' ? dist : join(dist, route)
    mkdirSync(dossier, { recursive: true })
    writeFileSync(join(dossier, 'index.html'), html)
  }
  écrits++
}

await navigateur.close()
await serveur.httpServer.close()

console.log(`prerender : ${écrits} pages écrites en HTML complet${vides ? `, ${vides} à vérifier` : ''}.`)
process.exit(vides > 0 ? 1 : 0)
