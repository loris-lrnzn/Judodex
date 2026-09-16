import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { parseRoute } from './hooks/useRoute'

// Hors-ligne : indispensable dans un dojo sans réseau.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

/**
 * Le fragment de l'écran demandé, chargé avant le premier rendu.
 *
 * Les pages sont écrites d'avance en HTML : le lecteur voit la fiche avant que
 * la moindre ligne de script ne s'exécute. Sans cette attente, l'application
 * reprend la page en deux temps — elle efface le texte pour poser
 * « Chargement… », puis remet le texte quand le fragment de l'écran arrive.
 * Le contenu disparaît sous les yeux de quelqu'un en train de le lire, et le
 * navigateur compte le second affichage comme le vrai.
 *
 * Les chemins d'import sont les mêmes que ceux d'`App` : le module est donc
 * déjà là quand `lazy` le redemande, et la reprise se fait d'un seul coup.
 */
const ÉCRANS: Partial<Record<ReturnType<typeof parseRoute>['name'], () => Promise<unknown>>> = {
  technique: () => import('./screens/TechniqueScreen'),
  train: () => import('./screens/TrainScreen'),
  profil: () => import('./screens/ProfilScreen'),
  dan: () => import('./screens/DanScreen'),
  reglages: () => import('./screens/ReglagesScreen'),
}

const démarrer = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

// Un fragment introuvable n'empêche pas de démarrer : la garde d'App le dira
// mieux qu'une page blanche.
const attendu = ÉCRANS[parseRoute(window.location.pathname).name]
if (attendu) void attendu().catch(() => {}).then(démarrer)
else démarrer()
