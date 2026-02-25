<template>
  <div id="app">
    <Header v-model="searchTerm" />

    <main>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component
            :is="Component"
            :searchQuery="searchTerm"
            @clear-search="searchTerm = ''"
          />
        </transition>
      </router-view>
    </main>

    <!-- Bottom navigation bar -->
    <nav class="bottom-nav" aria-label="Navigation principale">
      <router-link to="/" class="nav-item" active-class="is-active" exact>
        <svg class="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="8" height="8" rx="1.5"/>
          <rect x="11" y="1" width="8" height="8" rx="1.5"/>
          <rect x="1" y="11" width="8" height="8" rx="1.5"/>
          <rect x="11" y="11" width="8" height="8" rx="1.5"/>
        </svg>
        <span class="nav-label">Techniques</span>
      </router-link>

      <router-link to="/quizz" class="nav-item" active-class="is-active">
        <svg class="nav-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="10" r="8.5"/>
          <path d="M7.5 7.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 3.5"/>
          <circle cx="10" cy="15" r=".8" fill="currentColor" stroke="none"/>
        </svg>
        <span class="nav-label">Quiz</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { ref } from 'vue'
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: { Header },
  setup() {
    const searchTerm = ref('')
    return { searchTerm }
  },
}
</script>

<style lang="scss" scoped>
$bg:     #0A0A0A;
$border: rgba(255,255,255,0.07);
$accent: #E50000;
$muted:  rgba(255,255,255,0.4);

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg;
  overflow-x: hidden;
}

main {
  flex: 1 1 auto;
  padding-bottom: 64px;
}

// ── Transitions de page ───────────────────────────────────────
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// ── Bottom nav ────────────────────────────────────────────────
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 300;
  height: 64px;
  background: rgba(9, 9, 9, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid $border;
  display: flex;
  align-items: stretch;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  text-decoration: none;
  color: $muted;
  transition: color 0.18s;

  &.is-active {
    color: $accent;
    .nav-icon { transform: translateY(-1px); }
  }
}

.nav-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
  transition: transform 0.2s ease;
}

.nav-item:last-child .nav-icon { fill: none; }

.nav-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.66em;
  font-weight: 500;
  letter-spacing: 0.04em;
}
</style>
