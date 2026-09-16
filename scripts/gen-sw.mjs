/**
 * Inscrit dans dist/sw.js la version du build et la liste des fichiers à
 * mettre en cache d'avance.
 *
 * Le catalogue se consulte au bord du tatami, où le réseau manque souvent.
 * Sans cette liste, seuls les écrans ouverts pendant que le réseau était là
 * restaient consultables : le dojo, le bilan et la planche de ceinture noire
 * arrivent en fragments séparés, jamais chargés tant qu'on ne les a pas
 * demandés. La version suit l'empreinte des fichiers : un déploiement chasse
 * l'ancien cache sans que personne ait à y penser.
 */
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(racine, 'dist')
const assets = join(dist, 'assets')

if (!existsSync(assets)) {
  console.warn('gen-sw : dist/assets absent, service worker laissé tel quel.')
  process.exit(0)
}

const fichiers = readdirSync(assets)
  .filter((f) => /\.(js|css)$/.test(f))
  .sort()

const empreinte = createHash('sha256')
  .update(fichiers.map((f) => readFileSync(join(assets, f))).join(''))
  .digest('hex')
  .slice(0, 10)

const precache = ['/', '/techniques', '/dojo', '/mon-judo', '/reglages', '/icon.svg', '/og.png', '/manifest.webmanifest', ...fichiers.map((f) => `/assets/${f}`)]

const chemin = join(dist, 'sw.js')
let sw = readFileSync(chemin, 'utf8')
sw = sw
  .replace(/^const VERSION = .*$/m, `const VERSION = 'judodex-${empreinte}'`)
  .replace(/^const PRECACHE = .*$/m, `const PRECACHE = ${JSON.stringify(precache)}`)
writeFileSync(chemin, sw)

const poids = precache
  .filter((p) => p.startsWith('/assets/'))
  .reduce((s, p) => s + readFileSync(join(dist, p.slice(1))).length, 0)
console.log(`gen-sw : version judodex-${empreinte}, ${precache.length} fichiers pré-chargés (${Math.round(poids / 1024)} ko).`)
