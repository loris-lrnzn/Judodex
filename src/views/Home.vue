<template>
  <div class="home-page">
    <div class="home-content">
      <div class="search-and-filters-container">
        <div class="position-tabs">
          <button
            @click="togglePosition('debout')"
            :class="{ active: selectedPosition === 'debout' }"
            class="position-tab-button"
          >
            DEBOUT
          </button>
          <button
            @click="togglePosition('sol')"
            :class="{ active: selectedPosition === 'sol' }"
            class="position-tab-button"
          >
            SOL
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-message">Chargement des techniques...</div>
      <div v-else-if="error" class="error-message">{{ error.message }}</div>
      <div v-else-if="techniques.length > 0" class="techniques-grid">
        <TechniqueCard
          v-for="technique in techniques"
          :key="technique.id"
          :title="technique.title"
          :image="technique.acf.image"
          @click="goToTechniqueDetails(technique.id)"
        />
      </div>
      <div v-else class="no-results-message">Aucune technique trouvée.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TechniqueCard from '../components/TechniqueCard.vue'

const props = defineProps<{
  searchQuery: string
  showCeintureFilter: boolean
  selectedCeintures: string[]
}>()

const techniques = ref<any[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
const selectedPosition = ref('')
const router = useRouter()

async function fetchTechniques() {
  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (props.searchQuery) params.append('search', props.searchQuery)
    if (selectedPosition.value) params.append('position', selectedPosition.value)
    if (props.selectedCeintures?.length > 0) {
      params.append('ceinture', props.selectedCeintures[0])
    }

    const response = await fetch(`/api/techniques?${params.toString()}`)
    if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`)

    techniques.value = await response.json()
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.searchQuery, selectedPosition.value, props.selectedCeintures.slice()],
  fetchTechniques,
  { immediate: true }
)

function goToTechniqueDetails(id: number | string) {
  router.push({ name: 'technique-details', params: { id } })
}

function togglePosition(pos: string) {
  selectedPosition.value = selectedPosition.value === pos ? '' : pos
}
</script>


<style scoped lang="scss">
@use '../styles/variables' as *;

.home-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.home-content {
  width: 100%;
  margin: 0;
  padding: 0 16px; // Ajoute un padding horizontal pour éviter que les cards touchent les bords
}

.search-and-filters-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 0px;
  align-items: center;
  box-shadow: 0 4px 12px var(--color-shadow);
}

.position-tabs {
  display: flex;
  width: 100%;
  max-width: 300px;
  margin: 32px auto 32px auto; // <-- Ajoute du margin top et bottom
  border: 1px solid var(--color-primary-dark);
  border-radius: 8px;
  overflow: hidden;
}

.position-tab-button {
  flex: 1;
  padding: 0;
  background: $color-background-light;
  border: none;
  color: $color-primary-red;
  font-size: 2.2em;
  font-family: 'Righteous', Arial, sans-serif;
  cursor: pointer;
  transition: color 0.3s ease, background 0.3s ease;
  text-transform: uppercase;
  text-align: center;

  &.active {
    color: $color-primary-dark;
    background: $color-background-light;
  }

  &:hover:not(.active) {
    color: lighten($color-primary-red, 10%);
    background: $color-background-light;
  }
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px 10px;
  justify-items: center;
  padding: 0;

  @media (min-width: 500px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
    justify-content: center;
    padding: 16px 0;
  }

  @media (max-width: 500px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); // 140px ou moins selon la taille de tes cards
  }
}

.loading-message,
.error-message,
.no-results-message {
  text-align: center;
  font-size: 1.2em;
  color: #555;
  margin-top: 50px;
}

.error-message {
  color: var(--color-primary-dark);
}

@media (min-width: 1024px) {
  .home-page {
    max-width: 100%;
    padding: 20px 50px;
    margin: 0;
  }

  .home-content {
    padding: 0 50px;
  }

  .search-and-filters-container {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    padding: 20px;
  }

  .position-tabs {
    width: 100%;
    max-width: none;
    flex-basis: auto;
  }

  .filter-group {
    flex-basis: 100%;
    justify-content: flex-start;
  }
}
</style>

