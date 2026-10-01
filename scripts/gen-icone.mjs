/**
 * Rend les icônes PNG de public/ à partir de public/icon.svg.
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

/*
 * Le manifest demande des PNG de 192 et 512 pixels : sans eux, Chrome sur
 * Android n'accepte pas toujours d'installer l'application. L'icône occupe
 * déjà toute la surface et tient dans la zone sûre d'une icône masquable :
 * le même rendu sert aux deux usages.
 */
const SORTIES = [
  { fichier: 'apple-touch-icon.png', taille: 180 },
  { fichier: 'icon-192.png', taille: 192 },
  { fichier: 'icon-512.png', taille: 512 },
]

const svg = readFileSync(join(racine, 'public/icon.svg'), 'utf8')

const navigateur = await chromium.launch()
for (const { fichier, taille } of SORTIES) {
  const page = await navigateur.newPage({ viewport: { width: taille, height: taille }, deviceScaleFactor: 1 })
  await page.setContent(
    `<!doctype html><style>*{margin:0}svg{display:block;width:${taille}px;height:${taille}px}</style>${svg}`,
  )
  await page.screenshot({ path: join(racine, 'public', fichier), omitBackground: false })
  await page.close()
  console.log(`gen-icone : public/${fichier} (${taille}×${taille}).`)
}
await navigateur.close()
