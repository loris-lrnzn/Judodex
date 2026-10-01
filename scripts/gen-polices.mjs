/**
 * Réduit Shippori Mincho B1 aux caractères que le carnet affiche, et écrit
 * src/fonts/ : par graisse (700 et 800), un fichier woff2 latin et un fichier
 * japonais, avec leur feuille de style.
 *
 * Le latin est séparé du japonais parce que presque tous les titres sont en
 * latin : le navigateur ne télécharge le fichier des kanji que si la page en
 * affiche, et le titre de l'accueil n'attend plus 120 Ko pour sa police.
 *
 * La police complète pèse 15 Mo par graisse. Google la découpe en une centaine
 * de tranches ; servies par le site, elles faisaient passer la feuille de
 * style de 55 à 287 Ko, et ce fichier bloque l'affichage. Les caractères
 * réellement employés — latin, ponctuation, et les kanji et kana qui figurent
 * dans le code ou les données — tiennent en quelques dizaines de Ko.
 *
 * Un caractère absent retombe sur Noto Serif JP puis sur la police serif du
 * système : rien ne casse, la graisse change seulement. Après avoir ajouté un
 * kanji nouveau au catalogue : npm run polices
 *
 * Source : https://github.com/google/fonts/tree/main/ofl/shipporiminchob1
 * Licence : SIL OFL 1.1, texte dans src/fonts/OFL-Shippori-Mincho.txt
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import subsetFont from 'subset-font'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/shipporiminchob1'
const GRAISSES = [
  { poids: 700, source: 'ShipporiMinchoB1-Bold.ttf' },
  { poids: 800, source: 'ShipporiMinchoB1-ExtraBold.ttf' },
]

// Les textes que le site peut afficher.
const dossiers = ['src']
const extensions = new Set(['.ts', '.tsx', '.css', '.json', '.html'])
const caracteres = new Set()
const lire = (chemin) => {
  for (const c of readFileSync(chemin, 'utf8')) caracteres.add(c)
}
const parcourir = (dossier) => {
  for (const nom of readdirSync(dossier)) {
    if (nom === '__tests__' || nom === 'fonts') continue
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) parcourir(chemin)
    else if (extensions.has(extname(nom))) lire(chemin)
  }
}
dossiers.forEach((d) => parcourir(join(racine, d)))
lire(join(racine, 'index.html'))

// Le latin et la ponctuation en entier : le prénom saisi dans Mon judo est libre.
for (let c = 0x20; c <= 0x17f; c++) caracteres.add(String.fromCodePoint(c))
for (let c = 0x2010; c <= 0x2027; c++) caracteres.add(String.fromCodePoint(c))
for (let c = 0x3000; c <= 0x303f; c++) caracteres.add(String.fromCodePoint(c)) // ponctuation japonaise
for (let c = 0x3041; c <= 0x30ff; c++) caracteres.add(String.fromCodePoint(c)) // hiragana, katakana
const estLatin = (c) => {
  const p = c.codePointAt(0)
  return p <= 0x24f || (p >= 0x2000 && p <= 0x206f) || p === 0x20ac || p === 0x2122
}
const tous = [...caracteres].filter((c) => c.codePointAt(0) > 0x1f)
const jeux = {
  latin: tous.filter(estLatin).join(''),
  japonais: tous.filter((c) => !estLatin(c)).join(''),
}
// Ce que chaque fichier a le droit de servir : le latin, ou tout le reste.
const PLAGES = {
  latin: 'U+0000-024F, U+2000-206F, U+20AC, U+2122',
  japonais: 'U+0250-1FFF, U+2070-20AB, U+20AD-2121, U+2123-10FFFF',
}

const cache = join(racine, 'node_modules/.cache/polices')
mkdirSync(cache, { recursive: true })
mkdirSync(join(racine, 'src/fonts'), { recursive: true })

let css = '/* Produit par scripts/gen-polices.mjs — ne pas modifier à la main. */\n'
for (const { poids, source } of GRAISSES) {
  const local = join(cache, source)
  if (!existsSync(local)) {
    console.log(`polices : téléchargement de ${source}…`)
    const rep = await fetch(`${BASE}/${source}`)
    if (!rep.ok) throw new Error(`${source} : HTTP ${rep.status}`)
    writeFileSync(local, Buffer.from(await rep.arrayBuffer()))
  }
  for (const [jeu, texte] of Object.entries(jeux)) {
    const sortie = await subsetFont(readFileSync(local), texte, { targetFormat: 'woff2' })
    const nom = `shippori-mincho-b1-${jeu}-${poids}.woff2`
    writeFileSync(join(racine, 'src/fonts', nom), sortie)
    css += `@font-face {
  font-family: 'Shippori Mincho B1';
  font-style: normal;
  font-display: swap;
  font-weight: ${poids};
  src: url(./${nom}) format('woff2');
  unicode-range: ${PLAGES[jeu]};
}
`
    console.log(`polices : ${poids} ${jeu} — ${(sortie.length / 1024).toFixed(1)} ko, ${[...texte].length} caractères.`)
  }
}
writeFileSync(join(racine, 'src/fonts/shippori-mincho-b1.css'), css)
