<template>
  <div class="home-page">
    <h1>Judodex</h1>

    <div class="filters-section">
      <input
        type="text"
        v-model="searchQuery"
        @input="applyFilters"
        placeholder="Rechercher une technique..."
        class="search-input"
      />

      <div class="filter-group">
        <label for="position-filter">Position:</label>
        <select id="position-filter" v-model="selectedPosition" @change="applyFilters" class="filter-select">
          <option value="">Toutes</option>
          <option value="debout">Debout</option>
          <option value="sol">Sol</option>
          </select>
      </div>

      <div class="filter-group">
        <label for="ceinture-filter">Ceinture:</label>
        <select id="ceinture-filter" v-model="selectedCeinture" @change="applyFilters" class="filter-select">
          <option value="">Toutes</option>
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
    <div v-if="loading" class="message">Chargement des techniques de judo...</div>
    <div v-else-if="error" class="message error">
      Erreur lors du chargement : {{ error.message }}. Vérifiez que votre serveur WordPress est bien lancé.
    </div>

    <div v-else class="techniques-grid">
      <TechniqueCard
        v-for="technique in filteredTechniques" :key="technique.id"
        :title="technique.title"
        :image="technique.acf.image"
        @click="goToTechniqueDetails(technique.id)"
      />
      <div v-if="filteredTechniques.length === 0 && !loading" class="message">Aucune technique trouvée pour votre recherche.</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import TechniqueCard from '../components/TechniqueCard.vue';

export default {
  components: {
    TechniqueCard
  },
  setup() {
    const techniques = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const router = useRouter();

    // Variables réactives pour la recherche et les filtres
    const searchQuery = ref('');
    const selectedPosition = ref(''); // Vide pour "Toutes"
    const selectedCeinture = ref(''); // Vide pour "Toutes"
    // Ajoute d'autres refs pour d'autres filtres si tu les implémentes

    // Modifier fetchTechniques pour qu'elle puisse accepter des paramètres de filtre
    const fetchTechniques = async (filters = {}) => {
      loading.value = true;
      error.value = null;

      // Construire l'URL de l'API avec les paramètres de requête
      const params = new URLSearchParams();
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.position) {
        params.append('position', filters.position);
      }
      if (filters.ceinture) {
        params.append('ceinture', filters.ceinture);
      }
      // Ajoute d'autres paramètres pour d'autres filtres

      const queryString = params.toString();
      const url = `/api/techniques${queryString ? `?${queryString}` : ''}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        techniques.value = data;
      } catch (e) {
        error.value = e;
        console.error("Erreur lors de la récupération des techniques:", e);
      } finally {
        loading.value = false;
      }
    };

    // Fonction pour appliquer les filtres et relancer le fetch
    const applyFilters = () => {
      fetchTechniques({
        search: searchQuery.value,
        position: selectedPosition.value,
        ceinture: selectedCeinture.value,
        // ... ajoute d'autres filtres ici
      });
    };

    // Pour l'instant, on fait un filtrage côté client pour montrer le concept.
    // Plus tard, ce `computed` sera moins utile car le filtrage sera côté serveur.
    const filteredTechniques = computed(() => {
        // Si l'API filtre déjà, on retourne juste les techniques brutes.
        // Sinon, on applique le filtrage ici.
        // Pour l'instant, c'est un placeholder.
        // La vraie logique de filtrage sera dans la fonction fetchTechniques après l'API.
        return techniques.value;
    });


    onMounted(() => {
      // Au montage, charge toutes les techniques sans filtre initial
      fetchTechniques();
    });

    const goToTechniqueDetails = (id) => {
      router.push({ name: 'technique-details', params: { id: id } });
    };

    return {
      techniques, // Garde techniques pour le moment, mais filteredTechniques sera utilisé dans le template
      loading,
      error,
      searchQuery,
      selectedPosition,
      selectedCeinture,
      applyFilters,
      filteredTechniques, // Utilise ceci dans le template
      goToTechniqueDetails
    };
  }
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #eef4f8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-input {
  flex-grow: 1; /* Prend le plus de place possible */
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  max-width: 300px; /* Limite la largeur pour l'esthétique */
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  background-color: white;
}

.message {
  text-align: center;
  font-size: 1.1em;
  color: #555;
  margin-top: 20px;
}

.message.error {
  color: #d9534f;
  font-weight: bold;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
</style>