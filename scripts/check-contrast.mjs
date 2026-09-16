/**
 * Vérifie que la palette tient les rapports de contraste annoncés.
 *
 * Les teintes vivent dans index.css et nulle part ailleurs : ce contrôle les
 * y relit, plutôt que d'en garder une copie qui dériverait. Une couleur
 * retouchée à l'œil sans repasser ici finit par exclure quelqu'un.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/index.css'), 'utf8')

const jeton = (nom) => css.match(new RegExp(`--c-${nom}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]

const canal = (c) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}
const rapport = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const fonds = { tapis: jeton('field'), planche: jeton('plate') }

/** seuil : 7 pour un texte courant (AAA), 4.5 pour un accent, 3 pour un bord. */
const regles = [
  ['ink', 7, 'texte principal'],
  ['soft', 7, 'texte courant'],
  ['faint', 7, 'annotations'],
  ['blue', 7, 'repérage et focus'],
  ['signal', 4.5, 'accent de signalement'],
  ['edge', 3, 'bord de commande'],
  ['te', 7, 'famille — bras'],
  ['koshi', 7, 'famille — hanche'],
  ['ashi', 7, 'famille — jambe'],
  ['sutemi', 7, 'famille — sacrifice'],
  ['ne', 7, 'famille — sol'],
]

let fautes = 0
console.log('jeton    seuil   tapis  planche   rôle')
for (const [nom, seuil, role] of regles) {
  const c = jeton(nom)
  if (!c) {
    console.log(`${nom.padEnd(8)} introuvable dans index.css`)
    fautes++
    continue
  }
  const a = rapport(c, fonds.tapis)
  const b = rapport(c, fonds.planche)
  const ok = a >= seuil && b >= seuil
  if (!ok) fautes++
  console.log(
    `${nom.padEnd(8)} ${String(seuil).padStart(4)}  ${a.toFixed(2).padStart(6)}  ${b.toFixed(2).padStart(7)}   ${ok ? '·' : '✗'} ${role}`,
  )
}

// Le vermillon sert aussi de fond : le texte posé dessus doit tenir.
const surSignal = rapport(jeton('signal'), jeton('field'))
console.log(`\ntexte « tapis » sur fond vermillon : ${surSignal.toFixed(2)} ${surSignal >= 4.5 ? '·' : '✗'} (seuil 4.5)`)
if (surSignal < 4.5) fautes++

console.log(fautes === 0 ? '\nPalette conforme.' : `\n${fautes} teinte(s) sous le seuil.`)
process.exit(fautes === 0 ? 0 : 1)
