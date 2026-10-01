/**
 * Écrit dist/llms-full.txt : tout le texte du site — fiches, ceintures,
 * familles, lexique — dans un seul fichier qu'un modèle lit d'un trait.
 *
 * Les données vivent en TypeScript ; esbuild, déjà là avec Vite, les compile
 * à la volée plutôt que de les dupliquer dans un script qui ne les lit pas.
 */
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(racine, 'dist')
if (!existsSync(dist)) {
  console.warn('gen-llms-full : dist absent, rien à écrire.')
  process.exit(0)
}

const base = (process.env.VITE_SITE_URL ?? readFileSync(join(racine, '.env.production'), 'utf8').match(/VITE_SITE_URL=(\S+)/)?.[1] ?? '').replace(/\/+$/, '')
if (!base) {
  console.warn('gen-llms-full : VITE_SITE_URL absent, llms-full.txt non généré.')
  process.exit(0)
}
const donnees = JSON.parse(readFileSync(join(racine, 'src/data/techniques.json'), 'utf8'))
const maj = (donnees.scrapedAt ?? new Date().toISOString()).slice(0, 10)

const r = await build({
  entryPoints: [join(racine, 'scripts/llms-full.source.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'silent',
})
const cache = join(racine, 'node_modules/.cache/llms-full')
mkdirSync(cache, { recursive: true })
const module = join(cache, 'source.mjs')
writeFileSync(module, r.outputFiles[0].text)
const { contenu } = await import(pathToFileURL(module).href)
const texte = contenu(base, maj)
writeFileSync(join(dist, 'llms-full.txt'), texte)
console.log(`gen-llms-full : llms-full.txt écrit (${Math.round(texte.length / 1024)} Ko).`)
