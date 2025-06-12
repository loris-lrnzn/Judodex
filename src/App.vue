<template>
  <div id="app">
    <Header /> <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'; // Importe le Header
</script>

<style scoped>
/* Les styles ici sont pour la mise en page générale de l'application si nécessaire */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Pour que le pied de page (si tu en as un) soit en bas */
}

main {
  flex-grow: 1; /* Permet au contenu principal de prendre l'espace restant */
}
</style>