import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': { // C'est le chemin que ton application Vue va utiliser
        target: 'http://localhost:10003/wp-json/judodex/v1', // C'est l'URL de base de ton API WordPress
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Important pour retirer '/api' avant d'envoyer la requête à WordPress
      },
    },
  },
})
