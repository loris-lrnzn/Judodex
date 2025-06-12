<template>
  <header class="main-header">
    <div class="header-left">
      <router-link to="/" class="logo-link">
        <span class="logo-text">JUDODEX</span>
      </router-link>
    </div>
    <div class="header-center">
      </div>
    <div class="header-right">
      <div class="icon-group">
        <button class="icon-button"><i class="fas fa-search"></i></button>
        <button class="icon-button"><i class="fas fa-heart"></i></button>
        <button class="icon-button"><i class="fas fa-bars"></i></button>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router'; // Importe RouterLink pour la navigation

export default defineComponent({
  name: 'Header',
  components: {
    RouterLink // Déclare RouterLink pour l'utiliser dans le template
  }
});
</script>

<style scoped>
.main-header {
  background-color: var(--color-primary-dark); /* Rouge foncé */
  color: var(--color-text-light); /* Texte blanc */
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px var(--color-shadow);
}

.header-left .logo-link {
  font-size: 1.8em; /* Taille du logo */
  font-weight: bold;
  text-transform: uppercase;
  color: var(--color-text-light);
  letter-spacing: 2px;
}

.header-right .icon-group {
  display: flex;
  gap: 15px; /* Espacement entre les icônes */
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 1.2em; /* Taille des icônes */
  cursor: pointer;
  transition: color 0.3s ease;
}

.icon-button:hover {
  color: #f0f0f0; /* Légèrement plus clair au survol */
}

/* Styles pour les icônes FontAwesome (si tu les utilises) */
/* N'oublie pas d'importer FontAwesome dans ton index.html ou via npm si ce n'est pas déjà fait */
/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"> */
</style>