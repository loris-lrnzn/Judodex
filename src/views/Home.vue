<template>
  <div class="home-page">
    <div class="home-content">
      <div class="search-and-filters-container">
        <div class="position-tabs">
          <button
            @click="selectedPosition = 'debout'"
            :class="{ active: selectedPosition === 'debout' }"
            class="position-tab-button"
          >
            DEBOUT
          </button>
          <button
            @click="selectedPosition = 'sol'"
            :class="{ active: selectedPosition === 'sol' }"
            class="position-tab-button"
          >
            SOL
          </button>
        </div>

        <div v-if="showCeintureFilter" class="filter-group">
          <select v-model="selectedCeinture" class="filter-select">
            <option value="">Ceinture</option>
            <option value="blanche">Blanche</option>
            <option value="jaune">Jaune</option>
            <option value="orange">Orange</option>
            <option value="verte">Verte</option>
            <option value="bleue">Bleue</option>
            <option value="marron">Marron</option>
            <option value="noire">Noire</option>
          </select>
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

<script setup>
import { ref, watch, onMounted } from 'vue';
import TechniqueCard from '../components/TechniqueCard.vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  searchQuery: String,
  showCeintureFilter: Boolean,
});

const techniques = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedPosition = ref('');
const selectedCeinture = ref('');

const router = useRouter();

const fetchTechniques = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = new URLSearchParams();
    if (props.searchQuery) params.append('search', props.searchQuery);
    if (selectedPosition.value) params.append('position', selectedPosition.value);
    if (selectedCeinture.value) params.append('ceinture', selectedCeinture.value);

    const response = await fetch(`/api/techniques?${params.toString()}`);
    if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);

    techniques.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.searchQuery, selectedPosition.value, selectedCeinture.value],
  fetchTechniques,
  { immediate: true }
);

function goToTechniqueDetails(id) {
  router.push({ name: 'technique-details', params: { id } });
}
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.home-content {
  width: 100%;
  margin: 0;
  padding: 0;
}

.search-and-filters-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
  background-color: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-shadow);
}

.position-tabs {
  display: flex;
  width: 100%;
  border: 1px solid var(--color-primary-dark);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.position-tab-button {
  flex: 1;
  padding: 12px 0;
  background-color: white;
  border: none;
  color: var(--color-primary-dark);
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  text-transform: uppercase;
  text-align: center;
  border-right: 1px solid var(--color-primary-dark);
}

.position-tab-button:last-child {
  border-right: none;
}

.position-tab-button.active {
  background-color: var(--color-primary-dark);
  color: var(--color-text-light);
}

.position-tab-button:hover:not(.active) {
  background-color: #f5f5f5;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: white;
  font-size: 1em;
  cursor: pointer;
  flex-grow: 1;
  min-width: 150px;
}

.filter-select:focus {
  border-color: var(--color-accent-blue);
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  justify-content: center;
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

  .search-and-filters-container {
    flex-direction: row;
    justify-content: space-between;
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

  .techniques-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
