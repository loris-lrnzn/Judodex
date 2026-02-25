<template>
  <article
    class="technique-card"
    :style="{ '--belt': BELT_COLORS[ceinture?.toLowerCase()] || 'rgba(255,255,255,0.08)' }"
  >
    <!-- Zone image (fond blanc, image entière visible) -->
    <div class="card-image-zone">
      <span v-if="index" class="card-index">#{{ String(index).padStart(3, '0') }}</span>
      <img
        :src="image"
        :alt="title"
        class="card-img"
        :class="{ 'img-ready': imgLoaded }"
        loading="lazy"
        @load="imgLoaded = true"
        @error="imgLoaded = true; $event.target.src = './placeholder.svg'"
      />
    </div>

    <!-- Ligne séparatrice couleur ceinture -->
    <div class="belt-sep" aria-hidden="true"></div>

    <!-- Bandeau infos (fond sombre) -->
    <div class="card-info">
      <div v-if="ceinture" class="card-meta">
        <span class="belt-dot" :style="{ background: BELT_COLORS[ceinture.toLowerCase()] }"></span>
        <span class="belt-name">{{ ceinture }}</span>
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="traduction" class="card-sub">{{ traduction }}</p>
    </div>
  </article>
</template>

<script>
import { ref } from 'vue'

const BELT_COLORS = {
  blanche: '#c8c8c8',
  jaune:   '#f1c40f',
  orange:  '#e67e22',
  verte:   '#27ae60',
  bleue:   '#2980b9',
  marron:  '#8e5e3b',
  noire:   '#555555',
}

export default {
  name: 'TechniqueCard',
  props: {
    title:      { type: String, required: true },
    image:      { type: String, required: true },
    ceinture:   { type: String, default: null },
    traduction: { type: String, default: null },
    index:      { type: Number, default: null },
  },
  setup() {
    const imgLoaded = ref(false)
    return { BELT_COLORS, imgLoaded }
  },
}
</script>

<style scoped lang="scss">
.technique-card {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow:
    inset 3px 0 0 var(--belt),
    0 4px 16px rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.07);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  will-change: transform;

  &:hover {
    transform: translateY(-5px) scale(1.015);
    box-shadow:
      inset 3px 0 0 var(--belt),
      0 16px 40px rgba(0,0,0,0.65),
      0 4px 12px rgba(0,0,0,0.4);
  }

  // Retour tactile sur mobile
  &:active {
    transform: scale(0.97);
  }
}

// ── Zone image ────────────────────────────────────────────────
.card-image-zone {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  background: #ffffff;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  padding: 6px;
  opacity: 0;
  transition: transform 0.4s ease, opacity 0.3s ease;

  &.img-ready { opacity: 1; }

  .technique-card:hover & {
    transform: scale(1.04);
  }
}

.card-index {
  position: absolute;
  top: 6px;
  left: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.58em;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(0,0,0,0.2);
  line-height: 1;
  z-index: 1;
}

// ── Ligne séparatrice ceinture ────────────────────────────────
.belt-sep {
  height: 3px;
  flex-shrink: 0;
  background: var(--belt);
}

// ── Bandeau infos ─────────────────────────────────────────────
.card-info {
  flex: 0 0 auto;
  background: #1a1a1a;
  padding: 7px 10px 9px 10px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}

.belt-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.belt-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.58em;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.38);
}

.card-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  color: #ffffff;
  line-height: 1.1;
}

.card-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.6em;
  color: rgba(255,255,255,0.38);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
