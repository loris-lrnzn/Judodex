/**
 * Récupère les miniatures des démonstrations et les range dans public/miniatures.
 *
 * Les afficher depuis i.ytimg.com envoie l'adresse IP du visiteur à Google dès
 * l'ouverture de l'accueil, sans qu'il ait cliqué sur rien. Servies par le site
 * lui-même, elles ne coûtent plus rien en vie privée, et elles fonctionnent
 * hors ligne. Seule la lecture, au clic, appelle encore YouTube.
 *
 * hqdefault est un 4:3 de 480×360 dont l'image 16:9 occupe le centre, entre
 * deux bandes noires : on garde les 270 lignes du milieu.
 *
 * À relancer quand une démonstration est ajoutée : npm run miniatures
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const sortie = join(racine, 'public/miniatures')
mkdirSync(sortie, { recursive: true })

const lire = (f) => JSON.parse(readFileSync(join(racine, 'src/data', f), 'utf8'))

const ids = new Set()
for (const t of lire('techniques.json').techniques) {
  if (t.youtubeId) ids.add(t.youtubeId)
  if (t.ffjudoId) ids.add(t.ffjudoId)
}
for (const planche of Object.values(lire('situations.json'))) for (const s of planche) ids.add(s.id)

const aFaire = [...ids].filter((id) => !existsSync(join(sortie, `${id}.webp`)))
console.log(`miniatures : ${ids.size} démonstrations, ${aFaire.length} à récupérer.`)

let echecs = 0
for (const id of aFaire) {
  try {
    const rep = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
    if (!rep.ok) throw new Error(`HTTP ${rep.status}`)
    const jpg = Buffer.from(await rep.arrayBuffer())
    const webp = execFileSync('magick', ['jpg:-', '-gravity', 'center', '-crop', '480x270+0+0', '+repage', '-quality', '72', 'webp:-'], {
      input: jpg,
      maxBuffer: 10 * 1024 * 1024,
    })
    writeFileSync(join(sortie, `${id}.webp`), webp)
  } catch (e) {
    echecs++
    console.warn(`miniatures : ${id} — ${e.message}`)
  }
}
console.log(`miniatures : ${aFaire.length - echecs} écrites${echecs ? `, ${echecs} en échec` : ''}.`)
process.exit(echecs ? 1 : 0)
