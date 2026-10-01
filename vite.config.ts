/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

/**
 * Les feuilles de @fontsource déclarent chaque police en woff2 puis en woff.
 * Tout navigateur qui sait lancer cette application lit le woff2 : le repli
 * ne ferait que doubler le nombre de fichiers publiés — Shippori Mincho en
 * compte plus de cent par graisse.
 */
const woff2Seul = (): Plugin => ({
  name: 'woff2-seul',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('@fontsource') || !id.endsWith('.css')) return null
    return code.replace(/,\s*url\([^)]*\.woff\)\s*format\('woff'\)/g, '')
  },
})

export default defineConfig({
  plugins: [woff2Seul(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Le catalogue change rarement, le code souvent : séparés, un
        // déploiement ne fait pas retélécharger 200 Ko de textes inchangés.
        manualChunks: (id) => (id.endsWith('/src/data/techniques.json') ? 'catalogue' : undefined),
      },
    },
  },
  test: { environment: 'node', globals: true },
})
