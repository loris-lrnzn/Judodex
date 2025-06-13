// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: './', // essentiel pour Netlify ou hébergement dans un sous-dossier
    server: {
      proxy: isProduction ? undefined : {
        '/api': {
          target: 'https://sae401-25.mmi-stdie.fr/lorisl/wp-json/judodex/v1',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  }
})
