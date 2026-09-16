/**
 * Sert dist/ comme le fera l'hébergeur : fichier existant d'abord, repli sur
 * /index.html ensuite.
 *
 * `vite preview` renvoie index.html pour toute adresse inconnue avant même de
 * regarder si un fichier existe : les pages pré-rendues n'y sont jamais
 * servies, et toute mesure faite dessus décrit une application qui n'est pas
 * celle qu'on déploiera.
 */
import { createServer } from 'node:http'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname, normalize } from 'node:path'

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist')
const port = Number(process.argv[2] ?? 4180)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

const lire = async (chemin) => {
  try {
    const s = await stat(chemin)
    return s.isFile() ? readFile(chemin) : null
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const chemin = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')

  let fichier = join(dist, chemin)
  let corps = await lire(fichier)
  if (!corps) {
    fichier = join(dist, chemin, 'index.html')
    corps = await lire(fichier)
  }
  if (!corps) {
    fichier = join(dist, 'index.html')
    corps = await lire(fichier)
  }

  const ext = extname(fichier) || '.html'

  // L'hébergeur compresse le texte ; sans cela une mesure de performance
  // décrit un site trois fois plus lourd que celui qu'on servira.
  const compressible = ['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml', '.webmanifest'].includes(ext)
  const accepte = req.headers['accept-encoding'] ?? ''
  if (compressible && accepte.includes('br')) {
    corps = brotliCompressSync(corps, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
    res.setHeader('Content-Encoding', 'br')
  } else if (compressible && accepte.includes('gzip')) {
    corps = gzipSync(corps)
    res.setHeader('Content-Encoding', 'gzip')
  }
  // Le même en-tête que l'hébergeur : c'est lui qui fait échouer l'appariement
  // du cache du service worker quand on oublie `ignoreVary`.
  res.setHeader('Vary', 'Origin')
  res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream')
  if (chemin.startsWith('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.end(corps)
}).listen(port, () => console.log(`dist servi sur http://localhost:${port}`))
