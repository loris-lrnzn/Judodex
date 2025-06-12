import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import TechniqueView from '../views/Technique.vue' // <-- IMPORTE LE NOUVEAU COMPOSANT

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/techniques/:id', // <-- NOUVELLE ROUTE :id est un paramètre dynamique
      name: 'technique-details',
      component: TechniqueView // Pointez vers le composant Technique.vue
    }
  ]
})

export default router