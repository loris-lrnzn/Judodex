<template>
  <div class="technique-details-page">
    <button @click="goBack" class="back-button">
      Retour à l'accueil
    </button>

    <div v-if="loading" class="loading-message">Chargement des détails de la technique...</div>
    <div v-else-if="error" class="error-message">{{ error.message }}</div>
    <div v-else-if="technique">
      <h1 class="technique-main-title">{{ technique.title }}</h1>
      
      <div class="image-section">
        <img :src="technique.acf.image" :alt="technique.title" class="detail-image" />
      </div>

      <div class="tags-section">
        <span v-if="technique.position && technique.position.length > 0" class="tag tag-position">
          {{ technique.position[0].toUpperCase() }}
        </span>
        <span v-if="technique.acf.ceinture" class="tag tag-ceinture">
          {{ technique.acf.ceinture.toUpperCase() }}
        </span>
        <span v-if="technique.acf.type" class="tag tag-type">
          {{ technique.acf.type.toUpperCase() }}
        </span>
        <span v-if="technique.acf.mouvement" class="tag tag-mouvement">
          {{ technique.acf.mouvement.toUpperCase() }}
        </span>
        <span v-if="technique.acf.direction" class="tag tag-direction">
          {{ technique.acf.direction.toUpperCase() }}
        </span>
      </div>

      <div class="lexique-section card">
        <h2 class="card-title">LEXIQUE</h2>
        <p v-if="technique.acf.traduction">
          <span class="lexique-term">Traduction :</span> {{ technique.acf.traduction }}
        </p>
        </div>

      <div class="video-section card">
        <h2 class="card-title">VIDÉO</h2>
        <div v-if="technique.acf.lien_video_demonstration" class="video-wrapper">
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
        <h2 class="card-title">VOIR D'AUTRES MOUVEMENTS DE BRAS</h2>
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
      <div v-else class="no-results-message">Aucune technique similaire trouvée.</div>

    </div>
    <div v-else class="no-results-message">Technique non trouvée.</div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TechniqueCard from '../components/TechniqueCard.vue';

export default {
  components: {
    TechniqueCard
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const technique = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const fetchTechniqueDetails = async (id) => {
      loading.value = true;
      error.value = null;
      technique.value = null;

      try {
        const response = await fetch(`/api/techniques/${id}`);
        if (!response.ok) {
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

    const getYouTubeEmbedUrl = (url) => {
      if (!url) return null;
      const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`; // Correction de l'URL ici
      }
      return null;
    };

    const goToTechniqueDetails = (id) => {
      router.push({ name: 'technique-details', params: { id: id } });
    };

    watch(() => route.params.id, (newId) => {
      if (newId) {
        fetchTechniqueDetails(newId);
      }
    }, { immediate: true });

    const goBack = () => {
      router.back();
    };

    return {
      technique,
      loading,
      error,
      goBack,
      getYouTubeEmbedUrl,
      goToTechniqueDetails
    };
  }
}
</script>

<style scoped>
.technique-details-page {
  padding: 20px;
  max-width: 800px; /* Ajuste la largeur max */
  margin: 0 auto;
  background-color: var(--color-background-light); /* Fond clair */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.back-button {
  background-color: var(--color-accent-blue); /* Bleu du bouton */
  color: var(--color-text-light);
  padding: 10px 20px; /* Augmente légèrement le padding */
  border: none;
  border-radius: 25px; /* Bordure plus arrondie comme Figma */
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 25px; /* Plus d'espace sous le bouton */
  transition: background-color 0.3s ease;
  display: block; /* Prend toute la largeur si pas assez d'espace */
  width: fit-content; /* S'adapte au contenu */
  margin-left: auto; /* Centre ou aligne à droite */
  margin-right: auto; /* Centre ou aligne à gauche */
}

.back-button:hover {
  background-color: #0056b3;
}

.technique-main-title {
  color: var(--color-primary-dark); /* Couleur du titre principal */
  text-align: center;
  margin-bottom: 25px;
  font-size: 2.5em; /* Grande taille de police */
  text-transform: uppercase;
}

.image-section {
  text-align: center;
  margin-bottom: 30px;
}

.detail-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px; /* Coins arrondis pour l'image principale */
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* Styles pour les tags (pastilles) */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px; /* Espacement entre les tags */
  margin-bottom: 30px;
}

.tag {
  background-color: #eee; /* Couleur de fond par défaut */
  color: #333;
  padding: 8px 15px;
  border-radius: 20px; /* Forme de pastille */
  font-size: 0.9em;
  font-weight: bold;
  text-transform: uppercase;
  white-space: nowrap; /* Empêche les tags de passer à la ligne */
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

/* Couleurs spécifiques pour certains tags si tu le souhaites (comme dans Figma) */
.tag-position { background-color: #a00; color: white; } /* Rouge pour la position */
.tag-ceinture { background-color: #ffc107; color: #333; } /* Jaune pour la ceinture */
.tag-type { background-color: #28a745; color: white; } /* Vert pour le type */
.tag-mouvement { background-color: #007bff; color: white; } /* Bleu pour le mouvement */
.tag-direction { background-color: #6f42c1; color: white; } /* Violet pour la direction */


/* Styles pour les sections (cards) */
.card {
  background-color: white;
  padding: 25px; /* Plus de padding */
  border-radius: 12px; /* Rayon de bordure plus grand */
  box-shadow: 0 4px 10px var(--color-shadow); /* Ombre cohérente */
  margin-bottom: 30px; /* Espacement entre les sections */
}

.card-title {
  color: var(--color-primary-dark); /* Couleur du titre de section */
  margin-top: 0;
  margin-bottom: 20px; /* Plus d'espace sous le titre */
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  text-transform: uppercase; /* Titres en majuscules */
  font-size: 1.5em; /* Taille plus grande pour les titres de section */
}

/* Style spécifique pour le lexique */
.lexique-section p {
  font-size: 1.1em;
  line-height: 1.8;
  color: #444;
}

.lexique-term {
  font-weight: bold;
  color: var(--color-primary-dark); /* Rend le terme plus visible */
}

/* Style de la vidéo */
.video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* Ratio 16:9 (hauteur / largeur = 9/16 = 0.5625) */
  height: 0;
  overflow: hidden;
  border-radius: 8px; /* Coins arrondis pour le lecteur vidéo */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Styles pour les techniques similaires (grille pour l'instant) */
.related-techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); /* Plus petites cartes pour les similaires */
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

/* Message si pas de résultats */
.loading-message, .error-message, .no-results-message {
  text-align: center;
  font-size: 1.2em;
  color: #555;
  margin-top: 50px;
}

.error-message {
  color: var(--color-primary-dark);
}

/* Correction de l'URL d'embed YouTube dans la fonction getYouTubeEmbedUrl */
/* Ancien: https://www.youtube.com/embed/${match[1]} */
/* Nouveau: https://www.youtube.com/embed/${match[1]} */
</style>