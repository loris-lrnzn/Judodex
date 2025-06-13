// src/main.js

import '@/styles/main.scss' // ← Correct si l'alias '@' est bien configuré

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch, faFilter, faBars } from '@fortawesome/free-solid-svg-icons'

library.add(faSearch, faFilter, faBars)

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
