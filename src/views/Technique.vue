<template>
  <div class="technique-details-page">
    <div class="technique-image-top">
      <img :src="technique.acf.image" :alt="technique.title" class="detail-image-top" @error="onImageError" />
    </div>



    <div v-if="loading" class="loading-message">
      <div class="spinner"></div>
      Chargement des détails de la technique...
    </div>

    <div v-else-if="error" class="error-message">{{ error.message }}</div>

    <div v-else-if="technique">
      <h1 class="technique-main-title">{{ technique.title }}</h1>

      <div v-if="technique.acf.ceinture" class="belt-tag-wrapper">
        <span class="belt-tag" :style="{
          backgroundColor: BELT_COLORS[technique.acf.ceinture.toLowerCase()] || '#999',
          color: technique.acf.ceinture.toLowerCase() === 'blanche' ? '#000' : '#fff'
        }">
          {{ technique.acf.ceinture.toUpperCase() }}
        </span>

      </div>


      <div class="tags-section">

        <span v-if="technique.acf.type" class="tag tag-type">
          {{ technique.acf.type.toUpperCase() }}
        </span>
        <span v-if="technique.acf.mouvement" class="tag tag-mouvement">
          {{ technique.acf.mouvement.toUpperCase() }}
        </span>

      </div>

      <div class="lexique-section card">
        <h2 class="card-title">LEXIQUE</h2>
        <p>
          <span class="lexique-main">{{ technique.title }}</span>
          <span v-if="technique.acf.traduction" class="lexique-trad"> — {{ technique.acf.traduction }}</span>
        </p>
        <p v-if="technique.acf.type">
          <span class="lexique-main">{{ technique.acf.type }}</span>
          <span v-if="LEXIQUE[technique.acf.type]" class="lexique-trad"> — {{ LEXIQUE[technique.acf.type] }}</span>
        </p>
        <p v-if="technique.acf.mouvement">
          <span class="lexique-main">{{ technique.acf.mouvement }}</span>
          <span v-if="LEXIQUE[technique.acf.mouvement]" class="lexique-trad"> — {{ LEXIQUE[technique.acf.mouvement]
          }}</span>
        </p>
      </div>

      <div class="video-section card">
        <h2 class="card-title">VIDÉO</h2>
        <div v-if="technique.acf.lien_video_demonstration" class="video-wrapper">
          <iframe v-if="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)"
            :src="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen class="video-iframe"
            sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"></iframe>
          <p v-else>Le format du lien vidéo n'est pas reconnu pour l'intégration directe.</p>
        </div>
        <p v-else>Aucune vidéo de démonstration disponible.</p>
      </div>

      <div v-if="technique.related_techniques?.length" class="related-techniques-section card">
        <h2 class="card-title">
          VOIR D'AUTRES MOUVEMENTS
          <template v-if="technique.acf.mouvement">
            DE
            <span class="lexique-main">
              {{ LEXIQUE[technique.acf.mouvement] || technique.acf.mouvement }}
            </span>
          </template>
        </h2>
        <div class="related-techniques-grid">
          <TechniqueCard v-for="relatedTech in technique.related_techniques.slice(0, 6)" :key="relatedTech.id"
            :title="relatedTech.title" :image="relatedTech.image" @click="goToTechniqueDetails(relatedTech.id)" />
        </div>

      </div>
      <div><button @click="goBack" class="back-button" aria-label="Retour à l'accueil">
          Retour à l'accueil
        </button></div>
    </div>

    <div v-else class="no-results-message">Technique non trouvée.</div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TechniqueCard from '../components/TechniqueCard.vue';
import { LEXIQUE } from '@/utils/lexique.js'


const fallbackImage = '/images/fallback-image.jpg';

export default {
  components: { TechniqueCard },
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
        const response = await fetch(`https://sae401-25.mmi-stdie.fr/lorisl/wp-json/judodex/v1/techniques/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Cette technique n'existe pas ou n'est plus disponible.");
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        technique.value = data;
      } catch (e) {
        error.value = e;
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const getYouTubeEmbedUrl = (url) => {
      if (!url) return null;
      const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    };

    const goToTechniqueDetails = (id) => {
      router.push({ name: 'technique-details', params: { id } });
    };

    const goBack = () => {
      router.push({ path: '/' }) // Va toujours à l'accueil
    };

    const onImageError = (event) => {
      event.target.src = fallbackImage;
    };

    watch(() => route.params.id, (newId) => {
      if (newId) fetchTechniqueDetails(newId);
    }, { immediate: true });

    const BELT_COLORS = {
      blanche: '#ffffff',
      jaune: '#f1c40f',
      orange: '#e67e22',
      verte: '#27ae60',
      bleue: '#2980b9',
      marron: '#8e5e3b',
      noire: '#000000'
    };


    return {
      technique,
      loading,
      error,
      goBack,
      getYouTubeEmbedUrl,
      goToTechniqueDetails,
      onImageError,
      LEXIQUE,
      BELT_COLORS
    };
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/_variables.scss';

.technique-details-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: $color-background-light;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .back-button {
    background-color: $color-primary-dark;
    color: #fff;
    padding: 12px 28px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1em;
    font-weight: bold;
    margin: 40px auto 0 auto;
    display: block;
    width: fit-content;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: darken($color-primary-dark, 10%);
    }
  }

  .technique-main-title {
    color: $color-primary-dark;
    text-align: center;
    margin-bottom: 25px;
    font-size: 2.5em;
    text-transform: uppercase;
  }

  .image-section {
    text-align: center;
    margin-bottom: 30px;

    .detail-image {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .belt-tag-wrapper {
    text-align: center;
    margin-bottom: 20px;
  }

  .belt-tag {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 20px;
    color: white;
    font-weight: bold;
    font-size: 1em;
    text-transform: uppercase;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }


  .tags-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;

    .tag {
      background-color: #eee;
      color: #333;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: bold;
      text-transform: uppercase;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

      &.tag-type {
        background-color: $color-primary-red;
        color: white;
      }

      &.tag-mouvement {
        background-color: $color-primary-dark;
        color: white;
      }
    }
  }

  .card {
    background-color: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 10px $color-shadow;
    margin-bottom: 30px;

    .card-title {
      color: $color-primary-dark;
      margin-top: 0;
      margin-bottom: 20px;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      text-transform: uppercase;
      font-size: 1.5em;
      text-align: center;
    }
  }

  .lexique-section p {
    font-size: 1.1em;
    line-height: 1.8;
    color: #444;

    .lexique-main {
      color: $color-primary-dark;
      font-weight: bold;
      margin-right: 6px;
    }

    .lexique-trad {
      color: #707070;
      font-weight: normal;
    }
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .video-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }

  .related-techniques-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); // min 160px par card
    gap: 20px; // espace entre les cards
    justify-content: center;
    margin-top: 20px;
    align-items: stretch; // pour que toutes les cards aient la même hauteur
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
    color: $color-primary-dark;
  }

  /* Spinner CSS */
  .spinner {
    margin: 0 auto 15px;
    width: 40px;
    height: 40px;
    border: 4px solid lighten($color-accent-blue, 40%);
    border-top-color: $color-accent-blue;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .technique-image-top {
    background: #fff;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    padding: 32px 0 16px 0;
    text-align: center;
    margin: -20px -20px 32px -20px; // pour coller à gauche/droite si padding sur le parent
  }

  .detail-image-top {
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 0 0 28px 28px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
    background: #fff;
    display: block;
    margin: 0 auto;
  }
}

/* à mettre dans TechniqueCard.vue ou dans un style global */
.technique-card {
  min-width: 0; // important pour le grid
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
