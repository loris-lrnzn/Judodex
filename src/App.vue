<template>
  <div id="app">
    <Header
      v-model="searchTerm"
      @toggle-menu="toggleMenu"
      @update-ceintures="updateCeintures"
    />

    <main>
      <router-view
        :searchQuery="searchTerm"
        :selectedCeintures="activeCeintures"
        :showCeintureFilter="true"
      />
    </main>

    <aside v-if="isMenuOpen" class="side-menu">
      <nav>
        <ul>
          <li><router-link to="/">Accueil</router-link></li>
          <li><router-link to="/techniques">Techniques</router-link></li>
          <li><router-link to="/a-propos">À propos</router-link></li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script>
import { ref } from 'vue'
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header,
  },
  setup() {
    const searchTerm = ref('')
    const activeCeintures = ref([])
    const isMenuOpen = ref(false)

    function toggleMenu() {
      isMenuOpen.value = !isMenuOpen.value
    }

    function updateCeintures(ceintures) {
      activeCeintures.value = ceintures
    }

    return {
      searchTerm,
      activeCeintures,
      isMenuOpen,
      toggleMenu,
      updateCeintures,
    }
  },
}
</script>


<style lang="scss" scoped>
@use '@/styles/variables' as vars;

#app {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background-color: vars.$color-background-light;
  min-height: 100vh;
}

main {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}
</style>
