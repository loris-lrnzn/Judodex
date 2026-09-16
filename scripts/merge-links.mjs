/**
 * Fusionne src/data/links.json dans src/data/techniques.json.
 *
 * links.json est le fichier d'écriture des liens : c'est là qu'on rédige un
 * enchaînement, un redoublement, un contre ou une liaison au sol. techniques.json
 * en porte la copie, parce que c'est lui que l'application charge. Ce script
 * refait la copie et refuse tout lien mal formé plutôt que de le laisser passer
 * jusqu'à l'écran.
 *
 *   node scripts/merge-links.mjs          vérifie et écrit
 *   node scripts/merge-links.mjs --check  vérifie seulement
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const fichier = (n) => join(racine, 'src', 'data', n)

const TYPES = ['enchainement', 'redoublement', 'contre', 'liaison-sol']
const GARDES = ['ai-yotsu', 'kenka-yotsu']
const DEPLACEMENTS = ['avance', 'recule', 'tourne', 'plante']
const DEFENSES = ['bloque-bassin', 'bras-tendus', 'casse-avant', 'esquive-hanche', 'recule-jambe']
const ATTESTATIONS = ['ffjudo', 'kodokan', 'usage']
const NE_WAZA = new Set(['osaekomi-waza', 'shime-waza', 'kansetsu-waza'])

const data = JSON.parse(readFileSync(fichier('techniques.json'), 'utf8'))
const liens = JSON.parse(readFileSync(fichier('links.json'), 'utf8'))
const techniques = data.techniques ?? data
const famille = new Map(techniques.map((t) => [t.slug, t.family]))

const erreurs = []
const dit = (slug, i, message) => erreurs.push(`${slug}[${i}] ${message}`)

for (const [slug, liste] of Object.entries(liens)) {
  if (!famille.has(slug)) {
    erreurs.push(`${slug} — fiche inconnue au catalogue`)
    continue
  }
  const vus = new Set()
  liste.forEach((l, i) => {
    if (!famille.has(l.slug)) dit(slug, i, `cible inconnue : ${l.slug}`)
    // Un redoublement insiste avec la même attaque : c'est le seul type qui
    // se déclare vers sa propre fiche.
    if (l.slug === slug && l.type !== 'redoublement') dit(slug, i, 'lien vers elle-même')
    if (vus.has(l.slug)) dit(slug, i, `cible en double : ${l.slug}`)
    vus.add(l.slug)
    if (!TYPES.includes(l.type)) dit(slug, i, `type inconnu : ${l.type}`)
    if (typeof l.context !== 'string' || l.context.length <= 10) dit(slug, i, 'contexte trop court')
    if (l.attestation && !ATTESTATIONS.includes(l.attestation)) dit(slug, i, `attestation inconnue : ${l.attestation}`)
    if (l.defense && !DEFENSES.includes(l.defense)) dit(slug, i, `défense inconnue : ${l.defense}`)
    if (l.situation) {
      const { garde, deplacement, ...reste } = l.situation
      if (garde && !GARDES.includes(garde)) dit(slug, i, `garde inconnue : ${garde}`)
      if (deplacement && !DEPLACEMENTS.includes(deplacement)) dit(slug, i, `déplacement inconnu : ${deplacement}`)
      if (Object.keys(reste).length) dit(slug, i, `champ de situation inconnu : ${Object.keys(reste).join(', ')}`)
      if (!garde && !deplacement) dit(slug, i, 'situation vide — l\'omettre plutôt')
    }
    // Un redoublement insiste avec la même attaque ou une voisine debout ;
    // une liaison au sol doit franchir la frontière, et elle seule.
    const versSol = NE_WAZA.has(famille.get(l.slug))
    if (l.type === 'liaison-sol' && !versSol) dit(slug, i, 'liaison-sol qui ne va pas au sol')
    if (l.type !== 'liaison-sol' && versSol && !NE_WAZA.has(famille.get(slug)))
      dit(slug, i, `va au sol sans être typé liaison-sol (${l.type})`)
  })
}

if (erreurs.length) {
  console.error(`${erreurs.length} lien(s) refusé(s) :\n` + erreurs.map((e) => '  · ' + e).join('\n'))
  process.exit(1)
}

const compte = {}
for (const liste of Object.values(liens)) for (const l of liste) compte[l.type] = (compte[l.type] ?? 0) + 1
const total = Object.values(compte).reduce((a, b) => a + b, 0)
const situes = Object.values(liens).flat().filter((l) => l.situation).length
// `attestation` absente vaut héritage : ces liens précèdent le champ et ne sont
// pas présentés à la relecture. Seul `usage` explicite l'est.
const aRelire = Object.values(liens).flat().filter((l) => l.attestation === 'usage').length
const sansSource = Object.values(liens).flat().filter((l) => !l.attestation).length

console.log(`${total} liens — ` + TYPES.map((t) => `${t} ${compte[t] ?? 0}`).join(', '))
console.log(`${situes} situés, ${aRelire} en usage à relire, ${sansSource} hérités sans attestation`)

if (process.argv.includes('--check')) process.exit(0)

for (const t of techniques) {
  const liste = liens[t.slug]
  if (liste?.length) t.combinations = liste
  else delete t.combinations
}
writeFileSync(fichier('techniques.json'), JSON.stringify(data, null, 2) + '\n')
console.log('techniques.json réécrit')
