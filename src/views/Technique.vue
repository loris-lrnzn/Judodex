<template>
  <div class="technique-page">

    <!-- ── Skeleton loader ── -->
    <div v-if="loading" class="skeleton-page" aria-hidden="true">
      <div class="skel-back">
        <div class="skel-el skel-back-btn"></div>
      </div>
      <div class="skel-img-zone">
        <div class="skel-img-shimmer"></div>
      </div>
      <div class="skel-belt-line"></div>
      <div class="skel-info-zone">
        <div class="skel-chips-row">
          <div class="skel-el skel-chip"></div>
          <div class="skel-el skel-chip"></div>
        </div>
        <div class="skel-el skel-title-bar"></div>
        <div class="skel-el skel-sub-bar"></div>
      </div>
      <div class="skel-tabs-row">
        <div class="skel-el skel-tab-item"></div>
        <div class="skel-el skel-tab-item"></div>
        <div class="skel-el skel-tab-item"></div>
      </div>
      <div class="skel-body-zone">
        <div class="skel-el skel-line" style="width:82%"></div>
        <div class="skel-el skel-line" style="width:61%"></div>
        <div class="skel-el skel-line" style="width:90%"></div>
        <div class="skel-el skel-line" style="width:70%"></div>
      </div>
    </div>

    <!-- ── Erreur ── -->
    <div v-else-if="error" class="state-center state-error">
      {{ error.message }}
    </div>

    <!-- ── Introuvable ── -->
    <div v-else-if="!technique" class="state-center">
      Technique introuvable.
    </div>

    <!-- ── Contenu ── -->
    <template v-else>

      <!-- Bandeau retour sticky -->
      <div class="back-strip">
        <button class="back-btn" @click="goBack" aria-label="Retour aux techniques">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 3L5 8l5 5"/>
          </svg>
          Techniques
        </button>
      </div>

      <!-- En-tête technique : image + séparateur + infos -->
      <div
        class="detail-header"
        :style="{ '--belt': BELT_COLORS[technique.acf.ceinture?.toLowerCase()] || 'rgba(255,255,255,0.1)' }"
      >
        <!-- Zone image (fond blanc, technique entière visible) -->
        <div class="detail-image-zone">
          <img
            :src="technique.acf.image"
            :alt="technique.title"
            class="detail-img"
            :class="{ 'img-ready': detailImgLoaded }"
            @load="detailImgLoaded = true"
            @error="detailImgLoaded = true; $event.target.src = './placeholder.svg'"
          />
        </div>

        <!-- Ligne ceinture -->
        <div class="detail-belt-sep" aria-hidden="true"></div>

        <!-- Infos : chips + titre + sous-titre -->
        <div class="detail-info">
          <div class="detail-chips">
            <span
              v-if="technique.acf.ceinture"
              class="chip chip-belt"
              :style="{
                background: BELT_COLORS[technique.acf.ceinture.toLowerCase()] || '#666',
                color: technique.acf.ceinture.toLowerCase() === 'blanche' ? '#111' : '#fff',
              }"
            >{{ technique.acf.ceinture.toUpperCase() }}</span>
            <span v-if="technique.acf.type"     class="chip chip-type">{{ technique.acf.type }}</span>
            <span v-if="technique.acf.mouvement" class="chip chip-mvt">{{ technique.acf.mouvement }}</span>
          </div>
          <h1 class="detail-title">{{ technique.title }}</h1>
          <p v-if="technique.acf.traduction" class="detail-sub">{{ technique.acf.traduction }}</p>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="page-body">

        <nav class="tabs" role="tablist">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
            role="tab"
          >INFO</button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'video' }"
            @click="activeTab = 'video'"
            role="tab"
          >VIDÉO</button>
          <button
            v-if="technique.related_techniques?.length"
            class="tab-btn"
            :class="{ active: activeTab === 'liees' }"
            @click="activeTab = 'liees'"
            role="tab"
          >LIÉES <span class="tab-count">{{ technique.related_techniques.length }}</span></button>
        </nav>

        <!-- INFO -->
        <transition name="tab-fade" mode="out-in">
          <div v-if="activeTab === 'info'" key="info" class="tab-content">
            <div class="info-card">
              <p class="info-label">LEXIQUE</p>
              <div class="lexique-entries">
                <div class="lex-row">
                  <span class="lex-term">{{ technique.title }}</span>
                  <span v-if="technique.acf.traduction" class="lex-def">{{ technique.acf.traduction }}</span>
                </div>
                <div v-if="technique.acf.type" class="lex-row">
                  <span class="lex-term">{{ technique.acf.type }}</span>
                  <span v-if="LEXIQUE[technique.acf.type]" class="lex-def">{{ LEXIQUE[technique.acf.type] }}</span>
                </div>
                <div v-if="technique.acf.mouvement" class="lex-row">
                  <span class="lex-term">{{ technique.acf.mouvement }}</span>
                  <span v-if="LEXIQUE[technique.acf.mouvement]" class="lex-def">{{ LEXIQUE[technique.acf.mouvement] }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VIDÉO -->
          <div v-else-if="activeTab === 'video'" key="video" class="tab-content">
            <div class="info-card">
              <p class="info-label">VIDÉO DÉMO</p>
              <div v-if="technique.acf.lien_video_demonstration">
                <div v-if="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)" class="video-wrapper">
                  <iframe
                    :src="getYouTubeEmbedUrl(technique.acf.lien_video_demonstration)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="video-iframe"
                    sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
                  ></iframe>
                </div>
                <p v-else class="no-content">Format vidéo non reconnu.</p>
              </div>
              <p v-else class="no-content">Aucune vidéo disponible pour cette technique.</p>
            </div>
          </div>

          <!-- LIÉES -->
          <div v-else-if="activeTab === 'liees'" key="liees" class="tab-content">
            <div class="related-grid">
              <TechniqueCard
                v-for="rel in technique.related_techniques.slice(0, 6)"
                :key="rel.id"
                :title="rel.title"
                :image="rel.image"
                :ceinture="rel.acf?.ceinture || rel.ceinture"
                :traduction="rel.acf?.traduction || rel.traduction"
                @click="goToTechniqueDetails(rel.id)"
              />
            </div>
          </div>
        </transition>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TechniqueCard from '../components/TechniqueCard.vue'
import { LEXIQUE } from '@/utils/lexique.js'

const route  = useRoute()
const router = useRouter()

const technique    = ref(null)
const loading      = ref(true)
const error        = ref(null)
const activeTab    = ref('info')
const detailImgLoaded = ref(false)

const BELT_COLORS = {
  blanche: '#d8d8d8',
  jaune:   '#f1c40f',
  orange:  '#e67e22',
  verte:   '#27ae60',
  bleue:   '#2980b9',
  marron:  '#8e5e3b',
  noire:   '#444444',
}

async function fetchTechniqueDetails(id) {
  loading.value      = true
  error.value        = null
  technique.value    = null
  activeTab.value    = 'info'
  detailImgLoaded.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/techniques/${id}`)
    if (!res.ok) {
      if (res.status === 404) throw new Error("Cette technique n'existe pas.")
      throw new Error(`Erreur HTTP ${res.status}`)
    }
    technique.value = await res.json()
    document.title = `${technique.value.title} — Judodex`
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

function goToTechniqueDetails(id) {
  router.push({ name: 'technique-details', params: { id } })
}

function goBack() {
  router.push('/')
}

watch(() => route.params.id, (id) => { if (id) fetchTechniqueDetails(id) }, { immediate: true })

// Scroll vers le début du contenu à chaque changement d'onglet
watch(activeTab, async () => {
  await nextTick()
  document.querySelector('.page-body')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

onUnmounted(() => { document.title = 'Judodex' })
</script>

<style lang="scss" scoped>
$bg:      #0A0A0A;
$surface: #131313;
$raised:  #1C1C1C;
$accent:  #E50000;
$accentl: #FF4444;
$text:    #FFFFFF;
$muted:   rgba(255,255,255,0.5);
$dim:     rgba(255,255,255,0.25);
$border:  rgba(255,255,255,0.07);

.technique-page {
  min-height: 100vh;
  background: $bg;
}

// ── Bandeau retour ────────────────────────────────────────────
.back-strip {
  position: sticky;
  top: 57px;
  z-index: 100;
  background: rgba(10,10,10,0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid $border;
  padding: 0 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  background: none;
  border: none;
  color: $muted;
  font-family: 'Inter', sans-serif;
  font-size: 0.82em;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.18s;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &:hover { color: $text; }
}

// ── En-tête technique ─────────────────────────────────────────
.detail-header {
  // Accent gauche = couleur ceinture
  box-shadow: inset 4px 0 0 var(--belt, rgba(255,255,255,0.1));
}

// Zone image (fond blanc)
.detail-image-zone {
  background: #ffffff;
  width: 100%;
  height: clamp(220px, 42vw, 340px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 12px;
  display: block;
  opacity: 0;
  transition: opacity 0.35s ease;

  &.img-ready { opacity: 1; }
}

// Séparateur ceinture
.detail-belt-sep {
  height: 4px;
  background: var(--belt, rgba(255,255,255,0.08));
}

// Infos titre / chips
.detail-info {
  background: #111111;
  padding: 16px 18px 20px;

  @media (min-width: 768px) {
    padding: 20px 28px 24px;
  }
}

.detail-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.7em;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.chip-belt {
  // bg + color set inline
  border: 1px solid rgba(255,255,255,0.15);
}

.chip-type {
  background: rgba(229,0,0,0.85);
  color: #fff;
}

.chip-mvt {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.12);
}

.detail-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: clamp(2rem, 7vw, 3.2rem);
  letter-spacing: 0.04em;
  color: $text;
  line-height: 1;
  margin-bottom: 6px;
}

.detail-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.88em;
  color: $muted;
  margin: 0;
}

// ── Page body ─────────────────────────────────────────────────
.page-body {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 18px 96px;

  @media (min-width: 768px) {
    padding: 0 36px 96px;
  }
}

// ── Tabs ─────────────────────────────────────────────────────
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid $border;
  margin-bottom: 28px;
  margin-top: 20px;
}

.tab-btn {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  color: $muted;
  padding: 12px 18px;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent;
    transform: scaleX(0);
    transition: transform 0.22s ease;
  }

  &.active {
    color: $text;
    &::after { transform: scaleX(1); }
  }

  &:hover:not(.active) { color: rgba(255,255,255,0.7); }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: $muted;
}

.tab-btn.active .tab-count {
  background: rgba(229,0,0,0.18);
  color: $accent;
}

// ── Tab content ───────────────────────────────────────────────
.tab-content {
  animation: fade-up 0.28s ease both;
}

.info-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 16px;
}

.info-label {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.15em;
  color: $accent;
  margin-bottom: 16px;
}

.lexique-entries {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lex-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border;
  &:last-child { border-bottom: none; padding-bottom: 0; }
}

.lex-term {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.95em;
  color: $text;
}

.lex-def {
  font-family: 'Inter', sans-serif;
  font-size: 0.85em;
  color: $muted;
}

// Video
.video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 10px;
}

.video-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.no-content {
  color: $muted;
  font-size: 0.88em;
  font-family: 'Inter', sans-serif;
  text-align: center;
  padding: 40px 0;
}

// Related
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ── États ────────────────────────────────────────────────────
.state-center {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family: 'Inter', sans-serif;
  color: $muted;
}

.state-error { color: $accent; }

// ── Spinner ──────────────────────────────────────────────────
.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255,255,255,0.07);
  border-top-color: $accent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

// ── Keyframes ────────────────────────────────────────────────
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Tab transition ────────────────────────────────────────────
.tab-fade-enter-active,
.tab-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.tab-fade-enter-from   { opacity: 0; transform: translateY(6px); }
.tab-fade-leave-to     { opacity: 0; transform: translateY(-4px); }

// ── Skeleton loader ────────────────────────────────────────────
@keyframes skel-shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}

@mixin skel-anim {
  background: linear-gradient(90deg, $raised 0%, rgba(255,255,255,0.07) 50%, $raised 100%);
  background-size: 300% 100%;
  animation: skel-shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-page { background: $bg; }

.skel-el { @include skel-anim; }

.skel-back {
  position: sticky;
  top: 57px;
  z-index: 100;
  background: rgba(10,10,10,0.94);
  border-bottom: 1px solid $border;
  padding: 0 16px;
  height: 40px;
  display: flex;
  align-items: center;
}

.skel-back-btn { width: 80px; height: 12px; }

.skel-img-zone {
  background: #ebebeb;
  width: 100%;
  height: clamp(220px, 42vw, 340px);
  position: relative;
  overflow: hidden;
}

.skel-img-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(210,210,210,0.6) 50%, transparent 100%);
  background-size: 300% 100%;
  animation: skel-shimmer 1.8s ease-in-out infinite;
}

.skel-belt-line { height: 4px; background: rgba(255,255,255,0.06); }

.skel-info-zone {
  background: #111111;
  padding: 16px 18px 20px;

  @media (min-width: 768px) { padding: 20px 28px 24px; }
}

.skel-chips-row {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.skel-chip      { width: 64px; height: 22px; border-radius: 20px; }
.skel-title-bar { width: 55%;  height: 42px; margin-bottom: 10px; }
.skel-sub-bar   { width: 38%;  height: 13px; }

.skel-tabs-row {
  max-width: 860px;
  margin: 20px auto 0;
  padding: 0 18px 12px;
  display: flex;
  gap: 6px;
  border-bottom: 1px solid $border;

  @media (min-width: 768px) { padding: 0 36px 12px; }
}

.skel-tab-item { width: 52px; height: 16px; }

.skel-body-zone {
  max-width: 860px;
  margin: 28px auto 0;
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (min-width: 768px) { padding: 0 36px; }
}

.skel-line { height: 14px; width: 100%; }
</style>
