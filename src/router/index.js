import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import TechniqueView from '../views/Technique.vue'
import QuizzView from '../views/Quizz.vue' // Import the new Quizz component

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/techniques/:id',
      name: 'technique-details',
      component: TechniqueView
    },
    {
      path: '/quizz',
      name: 'quizz',
      component: QuizzView
    }
  ]
})

export default router