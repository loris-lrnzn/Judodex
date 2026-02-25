<template>
  <header class="main-header">
    <div class="header-inner">
      <transition name="hmode" mode="out-in">

        <!-- Mode normal : logo + bouton search -->
        <div v-if="!searchMode" key="normal" class="row-normal">
          <router-link to="/" class="logo" aria-label="Accueil Judodex">
            <span class="logo-judo">JUDO</span><span class="logo-dex">DEX</span>
          </router-link>

          <div class="actions">
            <!-- Badge terme actif -->
            <button
              v-if="modelValue"
              class="term-badge"
              @click="enterSearch"
              aria-label="Modifier la recherche"
            >
              <span class="term-text">{{ modelValue }}</span>
              <span class="term-clear" @click.stop="$emit('update:modelValue', '')" aria-label="Effacer">✕</span>
            </button>

            <button class="icon-btn" @click="enterSearch" aria-label="Rechercher">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6.5" cy="6.5" r="4.5"/>
                <path d="M10.5 10.5l3 3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mode search : retour + input pleine largeur -->
        <div v-else key="search" class="row-search">
          <button class="icon-btn" @click="exitSearch" aria-label="Retour">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 3L5 8l5 5"/>
            </svg>
          </button>

          <input
            ref="inputRef"
            type="text"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            placeholder="Rechercher une technique…"
            class="search-input"
            @keydown.esc="exitSearch"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />

          <button
            v-if="modelValue"
            class="icon-btn"
            @click="$emit('update:modelValue', '')"
            aria-label="Effacer"
          >✕</button>
        </div>

      </transition>
    </div>

    <div class="header-line" aria-hidden="true"></div>
  </header>
</template>

<script>
import { defineComponent, ref, nextTick } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'Header',
  components: { RouterLink },
  props: {
    modelValue: { type: String, required: true },
  },
  emits: ['update:modelValue'],
  setup() {
    const searchMode = ref(false)
    const inputRef = ref(null)

    async function enterSearch() {
      searchMode.value = true
      await nextTick()
      inputRef.value?.focus()
    }

    function exitSearch() {
      searchMode.value = false
    }

    return { searchMode, inputRef, enterSearch, exitSearch }
  },
})
</script>

<style scoped lang="scss">
$bg:      #0A0A0A;
$accent:  #E50000;
$accentl: #FF4444;
$text:    #FFFFFF;
$muted:   rgba(255,255,255,0.4);
$border:  rgba(255,255,255,0.07);

.main-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(10,10,10,0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-inner {
  height: 56px;
  padding: 0 18px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;

  @media (max-width: 480px) { padding: 0 14px; }
}

// ── Rows ─────────────────────────────────────────────────────
.row-normal,
.row-search {
  display: flex;
  align-items: center;
  width: 100%;
}

.row-normal {
  justify-content: space-between;
}

.row-search {
  gap: 10px;
}

// ── Logo ─────────────────────────────────────────────────────
.logo {
  text-decoration: none;
  line-height: 1;
  flex-shrink: 0;
}

.logo-judo {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.75rem;
  letter-spacing: 0.06em;
  color: $text;
}

.logo-dex {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.75rem;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, $accent, $accentl);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// ── Actions ───────────────────────────────────────────────────
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid $border;
  border-radius: 8px;
  color: $muted;
  font-size: 0.88em;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.18s, background 0.18s, border-color 0.18s;

  svg {
    width: 14px;
    height: 14px;
    display: block;
  }

  &:hover {
    background: rgba(229,0,0,0.12);
    border-color: rgba(229,0,0,0.35);
    color: $text;
  }
}

// ── Terme actif badge ─────────────────────────────────────────
.term-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background: rgba(229,0,0,0.1);
  border: 1px solid rgba(229,0,0,0.3);
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.18s;

  &:hover { background: rgba(229,0,0,0.18); }
}

.term-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.78em;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  max-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.term-clear {
  font-size: 0.7em;
  color: $muted;
  transition: color 0.15s;
  &:hover { color: $text; }
}

// ── Input pleine largeur ──────────────────────────────────────
.search-input {
  flex: 1;
  height: 36px;
  padding: 0 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: $text;
  font-family: 'Inter', sans-serif;
  font-size: 0.92em;
  outline: none;
  transition: border-color 0.18s, background 0.18s;

  &::placeholder { color: rgba(255,255,255,0.28); }
  &:focus {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.22);
  }
}

// ── Transition mode ───────────────────────────────────────────
.hmode-enter-active,
.hmode-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.hmode-enter-from { opacity: 0; transform: translateY(4px); }
.hmode-leave-to   { opacity: 0; transform: translateY(-4px); }

// ── Ligne rouge décorative ────────────────────────────────────
.header-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, $accent 40%, $accentl 60%, transparent);
  opacity: 0.3;
}
</style>
