import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
// Polices servies par le site lui-même : aucune requête vers Google, donc
// aucune adresse IP transmise, et le dojo sans réseau garde son typographe.
// Shippori Mincho est réduite aux caractères du carnet : npm run polices.
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './fonts/shippori-mincho-b1.css'
import './index.css'
import App from './App'
import { ecrans } from './ecrans'
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
 * Attendre ne suffit pas : encore faut-il que l'écran se rende sans suspendre
 * (voir lib/ecrans.tsx), ce que `React.lazy` ne sait pas faire.
 */
/**
 * Quand la page vient d'être écrite d'avance, son contenu est déjà à l'écran,
 * entrée en scène comprise. React le reconstruit : sans précaution, chaque bloc
 * repartirait de transparent et rejouerait son animation, le texte disparaissant
 * puis revenant sous les yeux du lecteur — et la LCP ne compte que le second
 * affichage. On pose un drapeau, que la première navigation retire.
 */
const racine = document.getElementById('root')!
if (racine.childElementCount > 0) document.documentElement.setAttribute('data-prerendu', '')

const démarrer = () =>
  createRoot(racine).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>,
  )

// Un fragment introuvable n'empêche pas de démarrer : la garde d'App le dira
// mieux qu'une page blanche.
const attendu = ecrans[parseRoute(window.location.pathname).name as keyof typeof ecrans]
if (attendu) void attendu.precharger().catch(() => {}).then(démarrer)
else démarrer()

/**
 * Une fois la page affichée, on télécharge les autres écrans pendant que le
 * navigateur est au repos : le premier clic sur Dojo ou Mon judo ne part plus
 * sur le réseau, et ne passe pas par « Chargement… » sur une connexion lente.
 * Un visiteur qui économise ses données, ou dont la connexion est lente, n'y
 * est pas soumis : l'écran se chargera au moment où il le demandera.
 */
const connexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
if (!connexion?.saveData && !/(^|-)2g$/.test(connexion?.effectiveType ?? '')) {
  const auRepos = (f: () => void) => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(f, { timeout: 4000 })
    else setTimeout(f, 2000) // Safari ne connaît pas requestIdleCallback
  }
  // Quelques secondes après le chargement : plus tôt, ces fragments se
  // disputent la bande passante avec l'image et les polices de la page, et
  // retardent son affichage complet sur une connexion lente (mesuré).
  window.addEventListener('load', () => {
    setTimeout(
      () =>
        auRepos(() => {
          for (const e of Object.values(ecrans)) void e.precharger().catch(() => {})
        }),
      3000,
    )
  })
}
