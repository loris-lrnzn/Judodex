<template>
  <div class="technique-details-page">
    <button @click="goBack" class="back-button">Retour à l'accueil</button>
    <div v-if="loading">Chargement des détails de la technique...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <div v-else-if="technique">
      <h1>{{ technique.title }}</h1>
      
      <div class="image-section">
        <img :src="technique.acf.image" :alt="technique.title" class="detail-image" />
      </div>

      <div class="info-section">
        <p><strong>Ceinture :</strong> {{ technique.acf.ceinture }}</p>
        <p><strong>Type :</strong> {{ technique.acf.type }}</p>
        <p><strong>Mouvement :</strong> {{ technique.acf.mouvement }}</p>
        <p><strong>Direction :</strong> {{ technique.acf.direction }}</p>
      </div>

      <div class="lexique-section card">
        <h2>Lexique</h2>
        <p><strong>Traduction :</strong> {{ technique.acf.traduction }}</p>
      </div>

      <div class="video-section card">
        <h2>Vidéo de Démonstration</h2>
        <div v-if="technique.acf.lien_video_demonstration">
          <iframe
            v-if="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)"
            :src="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-iframe"
          ></iframe>
          <p v-else>Le format du lien vidéo n'est pas reconnu pour l'intégration directe.</p>
        </div>
        <p v-else>Aucune vidéo de démonstration disponible.</p>
      </div>

      <div v-if="technique.related_techniques && technique.related_techniques.length > 0" class="related-techniques-section card">
        <h2>Techniques similaires</h2>
        <div class="related-techniques-grid">
          <TechniqueCard
            v-for="relatedTech in technique.related_techniques"
            :key="relatedTech.id"
            :title="relatedTech.title"
            :image="relatedTech.image"
            @click="goToTechniqueDetails(relatedTech.id)"
          />
        </div>
      </div>
      <div v-else class="message">Aucune technique similaire trouvée.</div>

    </div>
    <div v-else>Technique non trouvée.</div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'; // Ajout de 'watch'
import { useRoute, useRouter } from 'vue-router';
import TechniqueCard from '../components/TechniqueCard.vue'; // Assure-toi d'importer TechniqueCard

export default {
  components: {
    TechniqueCard // Déclare TechniqueCard pour pouvoir l'utiliser dans le template
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const technique = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchTechniqueDetails = async (id) => { // La fonction accepte maintenant un ID
      loading.value = true;
      error.value = null;
      technique.value = null; // Réinitialise la technique pour éviter d'afficher l'ancienne

      try {
        const response = await fetch(`/api/techniques/${id}`);
        if (!response.ok) {
          // Si c'est un 404, affiche un message spécifique
          if (response.status === 404) {
            throw new Error("Cette technique n'existe pas ou n'est plus disponible.");
          }
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        technique.value = data;

      } catch (e) {
        error.value = e;
        console.error("Erreur lors de la récupération des détails de la technique:", e);
      } finally {
        loading.value = false;
      }
    };

    // Fonction utilitaire pour extraire l'ID YouTube et construire l'URL d'embed
    const getYouTubeEmbedUrl = (url) => {
      if (!url) return null;
      const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    };

    // Fonction pour naviguer vers les détails d'une autre technique (utile pour les techniques similaires)
    const goToTechniqueDetails = (id) => {
      router.push({ name: 'technique-details', params: { id: id } });
    };

    // IMPORTANT : Utiliser watch pour recharger les détails quand l'ID dans l'URL change
    // C'est nécessaire quand on clique sur une "technique similaire" sur la même page
    watch(() => route.params.id, (newId) => {
      if (newId) {
        fetchTechniqueDetails(newId);
      }
    }, { immediate: true }); // immediate: true exécute le watcher au premier montage du composant

    const goBack = () => {
      router.back();
    };

    return {
      technique,
      loading,
      error,
      goBack,
      getYouTubeEmbedUrl,
      goToTechniqueDetails // Exposer la nouvelle fonction au template
    };
  }
}
</script>

<style scoped>
.technique-details-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.back-button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #0056b3;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.image-section {
  text-align: center;
  margin-bottom: 20px;
}

.detail-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-section,
.lexique-section,
.video-section,
.related-techniques-section { /* Ajouté pour les styles de section */
  margin-bottom: 25px;
}

.card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h2 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
  color: #444;
  margin-bottom: 10px;
}

p strong {
  color: #333;
}

.video-iframe {
  width: 100%;
  aspect-ratio: 16 / 9; /* Maintient le ratio 16:9 pour la vidéo */
  border-radius: 8px;
}

.related-techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Plus petites cartes pour les similaires */
  gap: 15px;
  justify-content: center;
}
</style>