<template>
  <div id="app">
    <Header
      v-model="appSearchQuery"
      @toggle-filters="toggleFilters"
    />
    <main>
      <router-view
        :showCeintureFilter="showCeintureFilter"
        :searchQuery="appSearchQuery"
        @toggle-filters="toggleFilters"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from './components/Header.vue';

const appSearchQuery = ref('');
const showCeintureFilter = ref(true);

function toggleFilters() {
  showCeintureFilter.value = !showCeintureFilter.value;
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background-color: var(--color-background-light);
  min-height: 100vh;
}

main {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
}
</style>