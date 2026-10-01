/**
 * Réduit Shippori Mincho B1 aux caractères que le carnet affiche, et écrit
 * src/fonts/ : deux fichiers woff2 (700 et 800) et leur feuille de style.
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
const texte = [...caracteres].filter((c) => c.codePointAt(0) > 0x1f).join('')

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
  const sortie = await subsetFont(readFileSync(local), texte, { targetFormat: 'woff2' })
  writeFileSync(join(racine, `src/fonts/shippori-mincho-b1-${poids}.woff2`), sortie)
  css += `@font-face {
  font-family: 'Shippori Mincho B1';
  font-style: normal;
  font-display: swap;
  font-weight: ${poids};
  src: url(./shippori-mincho-b1-${poids}.woff2) format('woff2');
}
`
  console.log(`polices : ${poids} — ${(sortie.length / 1024).toFixed(1)} ko, ${caracteres.size} caractères.`)
}
writeFileSync(join(racine, 'src/fonts/shippori-mincho-b1.css'), css)
