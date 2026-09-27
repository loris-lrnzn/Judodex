/**
 * Rend public/apple-touch-icon.png à partir de public/icon.svg.
 *
 * Safari sur iPhone n'accepte pas d'icône SVG pour l'écran d'accueil : sans
 * PNG, il pose une capture de la page à la place. 180 × 180 est la taille
 * que demandent les iPhone récents ; iOS arrondit lui-même les coins, l'image
 * reste donc carrée et pleine.
 *
 * À relancer quand l'icône change : npm run icone
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const TAILLE = 180

const svg = readFileSync(join(racine, 'public/icon.svg'), 'utf8')

const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: TAILLE, height: TAILLE }, deviceScaleFactor: 1 })
await page.setContent(
  `<!doctype html><style>*{margin:0}svg{display:block;width:${TAILLE}px;height:${TAILLE}px}</style>${svg}`,
)
await page.screenshot({ path: join(racine, 'public/apple-touch-icon.png'), omitBackground: false })
await navigateur.close()

console.log(`gen-icone : public/apple-touch-icon.png (${TAILLE}×${TAILLE}).`)
