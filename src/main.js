// src/main.js (VÉRIFIE CECI TRÈS ATTENTIVEMENT)
import './assets/main.css'
import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/* Importation de FontAwesome */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch, faFilter, faBars } from '@fortawesome/free-solid-svg-icons' // Importe les icônes spécifiques

/* Ajoute les icônes à la bibliothèque */
library.add(faSearch, faFilter, faBars)

const app = createApp(App)

app.use(router)

/* Enregistre le composant FontAwesomeIcon globalement */
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')