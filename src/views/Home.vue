<template>
  <div class="home-page">

    <!-- ── Hero ── -->
    <section class="hero" aria-label="Accueil Judodex">
      <div class="hero-kanji" aria-hidden="true">柔道</div>
      <div class="hero-body">
        <p class="hero-eyebrow">Répertoire de référence</p>
        <h1 class="hero-title">
          JUDO<span class="hero-accent">DEX</span>
        </h1>
        <p class="hero-count">
          <template v-if="loading">
            <span class="hero-spinner"></span>
          </template>
          <template v-else>
            <span class="count-num">{{ techniques.length }}&thinsp;technique{{ techniques.length > 1 ? 's' : '' }}</span>
            <span v-if="selectedCeinture" class="count-filter" :style="{ '--c': BELT_COLORS[selectedCeinture] }">
              · {{ selectedCeinture }}
            </span>
            <span v-if="selectedPosition" class="count-filter count-filter--pos">
              · {{ selectedPosition }}
            </span>
          </template>
        </p>

        <!-- Technique du jour -->
        <div
          v-if="featured"
          class="hero-featured"
          @click="goTo(featured.id)"
          role="button"
          :aria-label="`Voir la technique du jour : ${featured.title}`"
        >
          <p class="hf-label">★ Technique du jour</p>
          <div class="hf-card">
            <div class="hf-img-wrap">
              <img :src="featured.acf.image" :alt="featured.title" class="hf-img" loading="lazy" @error="$event.target.src = './placeholder.svg'" />
            </div>
            <div class="hf-content">
              <div class="hf-meta" v-if="featured.acf.ceinture">
                <span class="hf-dot" :style="{ background: BELT_COLORS[featured.acf.ceinture.toLowerCase()] }"></span>
                <span class="hf-belt">{{ featured.acf.ceinture }}</span>
                <span v-if="featured.acf.type" class="hf-type">· {{ featured.acf.type }}</span>
              </div>
              <p class="hf-title">{{ featured.title }}</p>
              <p v-if="featured.acf.traduction" class="hf-sub">{{ featured.acf.traduction }}</p>
            </div>
            <span class="hf-arrow" aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Barre de filtres sticky ── -->
    <div class="filter-bar">
      <div class="filter-scroll">

        <!-- Position -->
        <button
          class="pos-pill"
          :class="{ active: selectedPosition === '' }"
          :aria-pressed="selectedPosition === ''"
          @click="setPosition('')"
        >Tout</button>
        <button
          class="pos-pill"
          :class="{ active: selectedPosition === 'debout' }"
          :aria-pressed="selectedPosition === 'debout'"
          @click="setPosition('debout')"
        >Debout</button>
        <button
          class="pos-pill"
          :class="{ active: selectedPosition === 'sol' }"
          :aria-pressed="selectedPosition === 'sol'"
          @click="setPosition('sol')"
        >Sol</button>

        <span class="filter-sep" aria-hidden="true"></span>

        <!-- Ceintures -->
        <button
          v-for="belt in BELTS"
          :key="belt.value"
          class="belt-chip"
          :class="{ active: selectedCeinture === belt.value }"
          :aria-pressed="selectedCeinture === belt.value"
          :style="selectedCeinture === belt.value
            ? { background: BELT_COLORS[belt.value], borderColor: BELT_COLORS[belt.value], color: belt.value === 'blanche' ? '#111' : '#fff' }
            : {}"
          @click="toggleBelt(belt.value)"
        >
          <span class="chip-dot" :style="{ background: BELT_COLORS[belt.value] }"></span>
          {{ belt.label }}
        </button>

      </div>
    </div>

    <!-- ── Contenu ── -->
    <section class="grid-section">

      <!-- Chargement : skeleton cards -->
      <div v-if="loading" class="techniques-grid" aria-hidden="true">
        <div v-for="n in 10" :key="n" class="skel-card">
          <div class="skel-card-img"><div class="skel-shimmer"></div></div>
          <div class="skel-card-belt"></div>
          <div class="skel-card-info">
            <div class="skel-el skel-cname"></div>
            <div class="skel-el skel-csub"></div>
          </div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="state-msg state-err">{{ error.message }}</div>

      <!-- Grille -->
      <div v-else-if="techniques.length" aria-live="polite" aria-atomic="false">

        <!-- Compteur de résultats -->
        <p class="result-count">
          {{ techniques.length }} technique{{ techniques.length > 1 ? 's' : '' }}
          <template v-if="selectedCeinture">
            · ceinture <strong>{{ selectedCeinture }}</strong>
          </template>
          <template v-if="selectedPosition">
            · <strong>{{ selectedPosition }}</strong>
          </template>
        </p>

        <div
          class="techniques-grid"
          :key="`grid|${selectedPosition}|${selectedCeinture}|${props.searchQuery}`"
        >
          <TechniqueCard
            v-for="(technique, i) in techniques"
            :key="technique.id"
            :title="technique.title"
            :image="technique.acf.image"
            :ceinture="technique.acf.ceinture"
            :traduction="technique.acf.traduction"
            :index="i + 1"
            @click="goTo(technique.id)"
          />
        </div>
      </div>

      <!-- Vide -->
      <div v-else class="state-msg">
        <span class="empty-dash">—</span>
        <p>Aucune technique trouvée.</p>
        <button class="reset-btn" @click="resetFilters">Réinitialiser les filtres</button>
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TechniqueCard from '../components/TechniqueCard.vue'

const props = defineProps<{
  searchQuery: string
}>()

const emit = defineEmits(['clear-search'])

const BELT_COLORS: Record<string, string> = {
  blanche: '#c8c8c8',
  jaune:   '#f1c40f',
  orange:  '#e67e22',
  verte:   '#27ae60',
  bleue:   '#2980b9',
  marron:  '#8e5e3b',
  noire:   '#555555',
}

const BELTS = [
  { value: 'blanche', label: 'Blanche' },
  { value: 'jaune',   label: 'Jaune' },
  { value: 'orange',  label: 'Orange' },
  { value: 'verte',   label: 'Verte' },
  { value: 'bleue',   label: 'Bleue' },
  { value: 'marron',  label: 'Marron' },
  { value: 'noire',   label: 'Noire' },
]

const techniques = ref<any[]>([])
const allTechniques = ref<any[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
const selectedPosition = ref('')
const selectedCeinture = ref('')
const router = useRouter()

onMounted(() => { document.title = 'Judodex — Répertoire de techniques de judo' })

// Technique du jour : change chaque jour, déterministe
const featured = computed(() => {
  if (!allTechniques.value.length) return null
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000)
  return allTechniques.value[dayOfYear % allTechniques.value.length]
})

async function fetchTechniques() {
  loading.value = true
  error.value = null
  try {
    const params = new URLSearchParams()
    if (props.searchQuery)      params.append('search',   props.searchQuery)
    if (selectedPosition.value) params.append('position', selectedPosition.value)
    if (selectedCeinture.value) params.append('ceinture', selectedCeinture.value)

    const isUnfiltered = !props.searchQuery && !selectedPosition.value && !selectedCeinture.value
    const cacheKey = `judodex:techniques:${params.toString()}`

    // Essai du cache sessionStorage
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)
        techniques.value = data
        if (isUnfiltered && !allTechniques.value.length) allTechniques.value = data
        loading.value = false
        return
      }
    } catch {}

    const res = await fetch(`${import.meta.env.VITE_API_URL}/techniques?${params}`)
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
    const data = await res.json()
    techniques.value = data
    try { sessionStorage.setItem(cacheKey, JSON.stringify(data)) } catch {}
    if (isUnfiltered && !allTechniques.value.length) allTechniques.value = data
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
}

// Chargement initial
fetchTechniques()

// Filtres position/ceinture → immédiat
watch([selectedPosition, selectedCeinture], fetchTechniques)

// Recherche texte → debounce 350ms pour ne pas spammer l'API
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => props.searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(fetchTechniques, 350)
})

function setPosition(pos: string) {
  selectedPosition.value = pos
}

function toggleBelt(value: string) {
  selectedCeinture.value = selectedCeinture.value === value ? '' : value
}

function resetFilters() {
  selectedPosition.value = ''
  selectedCeinture.value = ''
  emit('clear-search')
}

function goTo(id: number | string) {
  router.push({ name: 'technique-details', params: { id } })
}
</script>

<style scoped lang="scss">
$bg:     #0A0A0A;
$accent: #E50000;
$text:   #fff;
$muted:  rgba(255,255,255,0.45);
$dim:    rgba(255,255,255,0.22);
$border: rgba(255,255,255,0.07);

.home-page {
  min-height: 100vh;
  background: $bg;
}

// ── Hero ─────────────────────────────────────────────────────
.hero {
  position: relative;
  overflow: hidden;
  padding: 52px 20px 44px;
  text-align: center;
  background: linear-gradient(180deg, #111111 0%, #0A0A0A 100%);

  @media (max-width: 480px) {
    padding: 40px 16px 36px;
  }
}

.hero-kanji {
  position: absolute;
  right: -1%;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(110px, 22vw, 240px);
  line-height: 1;
  color: rgba(229,0,0,0.045);
  pointer-events: none;
  user-select: none;
  font-family: serif;
  letter-spacing: -0.03em;
}

.hero-body {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
}

.hero-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.72em;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: $muted;
  margin-bottom: 10px;
}

.hero-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: clamp(3.8rem, 13vw, 7.5rem);
  line-height: 0.92;
  letter-spacing: 0.04em;
  color: $text;
  margin-bottom: 14px;
}

.hero-accent {
  background: linear-gradient(135deg, $accent, #FF4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-count {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0 4px;
  min-height: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8em;
  font-weight: 500;
  color: $muted;
  letter-spacing: 0.04em;
}

.count-num {
  color: $muted;
}

.count-filter {
  color: var(--c, $muted);
  font-weight: 600;
  text-transform: capitalize;
}

.count-filter--pos {
  color: rgba(255,255,255,0.55);
}

.hero-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255,255,255,0.1);
  border-top-color: $accent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

// ── Technique du jour ─────────────────────────────────────────
.hero-featured {
  margin-top: 22px;
  cursor: pointer;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;

  &:active .hf-card {
    transform: scale(0.98) !important;
    transition-duration: 0.08s;
    background: rgba(255,255,255,0.06);
  }
}

.hf-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.67em;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $accent;
  margin-bottom: 8px;
}

.hf-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px;
  padding: 8px 14px 8px 8px;
  text-align: left;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;

  .hero-featured:hover & {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.18);
    transform: translateY(-1px);
  }
}

.hf-img-wrap {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}

.hf-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 3px;
}

.hf-content {
  flex: 1;
  min-width: 0;
}

.hf-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.hf-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.hf-belt {
  font-family: 'Inter', sans-serif;
  font-size: 0.62em;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $muted;
}

.hf-type {
  font-family: 'Inter', sans-serif;
  font-size: 0.62em;
  color: $dim;
}

.hf-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.05rem;
  letter-spacing: 0.05em;
  color: #fff;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hf-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.64em;
  color: $dim;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.hf-arrow {
  font-size: 1em;
  color: $muted;
  flex-shrink: 0;
  transition: transform 0.2s, color 0.2s;

  .hero-featured:hover & {
    transform: translateX(3px);
    color: $text;
  }
}

// ── Barre de filtres sticky ──────────────────────────────────
.filter-bar {
  position: sticky;
  top: 57px;
  z-index: 100;
  background: rgba(10,10,10,0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid $border;

  // Indicateurs de scroll (fade latéral)
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 32px;
    z-index: 1;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, rgba(10,10,10,0.96), transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, rgba(10,10,10,0.96), transparent);
  }
}

.filter-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

// Pilules position
.pos-pill {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  padding: 0 16px;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  background: transparent;
  color: $muted;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.18s;

  &:hover:not(.active) {
    color: $text;
    border-color: rgba(255,255,255,0.22);
  }

  &.active {
    background: $accent;
    border-color: $accent;
    color: $text;
  }
}

// Séparateur
.filter-sep {
  width: 1px;
  height: 18px;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
  margin: 0 2px;
}

// Chips ceinture
.belt-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 13px;
  min-height: 34px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  background: transparent;
  color: $muted;
  font-family: 'Inter', sans-serif;
  font-size: 0.76em;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.18s, color 0.18s;

  &:hover:not(.active) {
    border-color: rgba(255,255,255,0.22);
    color: $text;
  }

  &.active { font-weight: 600; }
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Section grille ───────────────────────────────────────────
.grid-section {
  padding: 16px 14px 32px;
  max-width: 1400px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 24px 24px 48px;
  }
}

.result-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.75em;
  color: $muted;
  margin-bottom: 14px;
  letter-spacing: 0.02em;

  strong {
    color: rgba(255,255,255,0.75);
    font-weight: 600;
    text-transform: capitalize;
  }
}

// ── Grille ───────────────────────────────────────────────────
.techniques-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (min-width: 520px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
  }

  // Animation d'entrée échelonnée
  > :deep(*) {
    animation: rise 0.38s ease both;
  }

  @for $i from 1 through 30 {
    > :deep(*:nth-child(#{$i})) {
      animation-delay: #{($i - 1) * 0.03}s;
    }
  }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

// ── États ────────────────────────────────────────────────────
.state-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 24px;
  text-align: center;
  color: $muted;
  font-family: 'Inter', sans-serif;
}

.state-err { color: $accent; }

.empty-dash {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 2.5rem;
  color: rgba(229,0,0,0.4);
}

.reset-btn {
  margin-top: 4px;
  padding: 8px 20px;
  background: rgba(229,0,0,0.1);
  border: 1px solid rgba(229,0,0,0.3);
  border-radius: 20px;
  color: rgba(255,255,255,0.75);
  font-family: 'Inter', sans-serif;
  font-size: 0.82em;
  cursor: pointer;
  transition: background 0.18s;
  &:hover { background: rgba(229,0,0,0.2); }
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Skeleton cards ────────────────────────────────────────────
@keyframes home-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}

@mixin skel-anim {
  background: linear-gradient(90deg, #1c1c1c 0%, rgba(255,255,255,0.07) 50%, #1c1c1c 100%);
  background-size: 300% 100%;
  animation: home-shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
}

.skel-card {
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 4px 16px rgba(0,0,0,0.45);
}

.skel-card-img {
  flex: 1 1 0;
  min-height: 0;
  background: #e8e8e8;
  position: relative;
  overflow: hidden;
}

.skel-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(210,210,210,0.7) 50%, transparent 100%);
  background-size: 300% 100%;
  animation: home-shimmer 1.8s ease-in-out infinite;
}

.skel-card-belt {
  height: 3px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.06);
}

.skel-card-info {
  flex: 0 0 auto;
  background: #1a1a1a;
  padding: 7px 10px 9px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.skel-el { @include skel-anim; }
.skel-cname { height: 15px; width: 70%; }
.skel-csub  { height: 10px; width: 48%; }

// Vague décalée : chaque carte démarre 80ms après la précédente
@for $i from 1 through 10 {
  .skel-card:nth-child(#{$i}) {
    .skel-shimmer,
    .skel-el {
      animation-delay: #{($i - 1) * 0.08}s;
    }
  }
}
</style>
