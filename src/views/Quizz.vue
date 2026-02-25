<template>
  <div class="quiz-page">

    <!-- ── Écran de démarrage ── -->
    <transition name="screen" mode="out-in">
      <div v-if="quizState === 'start'" key="start" class="screen screen-start">
        <div class="start-kanji" aria-hidden="true">練</div>
        <div class="start-content">
          <p class="start-eyebrow">Testez vos connaissances</p>
          <h1 class="start-title">JUDODEX<br/><span class="start-accent">QUIZ</span></h1>
          <p class="start-desc">
            10 questions sur les techniques, mouvements et traductions du judo.
          </p>

          <!-- Sélecteur de niveau -->
          <div class="diff-wrap">
            <p class="diff-label">Niveau</p>
            <div class="diff-belts">
              <button
                class="diff-pill"
                :class="{ active: selectedBelt === '' }"
                @click="selectedBelt = ''"
              >Tout</button>
              <button
                v-for="b in QUIZ_BELTS"
                :key="b.value"
                class="diff-pill"
                :class="{ active: selectedBelt === b.value }"
                :style="selectedBelt === b.value
                  ? { background: BELT_COLORS[b.value], borderColor: BELT_COLORS[b.value], color: b.value === 'blanche' ? '#111' : '#fff' }
                  : {}"
                @click="selectedBelt = b.value"
              >
                <span class="diff-dot" :style="{ background: BELT_COLORS[b.value] }"></span>
                {{ b.label }}
              </button>
            </div>
            <p v-if="selectedBelt" class="diff-hint">
              Techniques jusqu'à la ceinture {{ selectedBelt }}
            </p>
          </div>

          <button class="btn-primary" @click="startQuiz">Commencer</button>
        </div>
      </div>

      <!-- ── Question ── -->
      <div v-else-if="quizState === 'playing'" key="playing" class="screen screen-playing">

        <div v-if="loading" class="state-center">
          <span class="spinner"></span>
          <span>Génération des questions…</span>
        </div>

        <div v-else-if="error" class="state-center state-err">{{ error.message }}</div>

        <template v-else-if="currentQuestion">
          <!-- Barre de progression -->
          <div
            class="progress-bar-wrap"
            role="progressbar"
            :aria-valuenow="currentQuestionIndex + 1"
            aria-valuemin="1"
            :aria-valuemax="questions.length"
            :aria-label="`Question ${currentQuestionIndex + 1} sur ${questions.length}`"
          >
            <div
              class="progress-bar-fill"
              :style="{ width: ((currentQuestionIndex + 1) / questions.length * 100) + '%' }"
            ></div>
          </div>

          <!-- Header question -->
          <div class="q-header">
            <span class="q-counter">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
            <span class="q-score" aria-live="polite" :aria-label="`Score : ${score}`">
              <span class="score-icon" aria-hidden="true">★</span>
              {{ score }}
            </span>
          </div>

          <!-- Image (si présente) -->
          <transition name="img-fade" mode="out-in">
            <div v-if="currentQuestion.image" :key="currentQuestion.image" class="q-image-wrap">
              <img :src="currentQuestion.image" :alt="currentQuestion.question" class="q-image" loading="lazy" />
            </div>
          </transition>

          <!-- Question -->
          <transition name="q-fade" mode="out-in">
            <div :key="currentQuestionIndex" class="q-body">
              <p class="q-text">{{ currentQuestion.question }}</p>

              <!-- Options -->
              <div class="options-grid">
                <button
                  v-for="(option, idx) in currentQuestion.options"
                  :key="idx"
                  class="option-btn"
                  :class="{
                    selected:  selectedAnswer === option && !feedbackMessage,
                    correct:   feedbackMessage && option === currentQuestion.correctAnswer,
                    incorrect: feedbackMessage && selectedAnswer === option && option !== currentQuestion.correctAnswer,
                  }"
                  :disabled="!!feedbackMessage"
                  @click="selectAnswer(option)"
                >
                  <span class="option-letter">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                  <span class="option-text">{{ option }}</span>
                </button>
              </div>

              <!-- Feedback -->
              <transition name="fb-slide">
                <div v-if="feedbackMessage" class="feedback" :class="isCorrect ? 'fb-correct' : 'fb-wrong'">
                  <span class="fb-icon">{{ isCorrect ? '✓' : '✗' }}</span>
                  <span class="fb-text">{{ feedbackMessage }}</span>
                </div>
              </transition>

              <!-- Bouton suivant -->
              <transition name="fb-slide">
                <button v-if="feedbackMessage" class="btn-next" @click="nextQuestion">
                  {{ currentQuestionIndex < questions.length - 1 ? 'Question suivante →' : 'Voir mon score →' }}
                  <span class="btn-next-hint">Entrée</span>
                </button>
              </transition>

              <p v-if="!feedbackMessage" class="kbd-hint">
                Touches <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>
              </p>
            </div>
          </transition>
        </template>
      </div>

      <!-- ── Résultats ── -->
      <div v-else-if="quizState === 'results'" key="results" class="screen screen-results" :class="{ 'has-recap': wrongAnswers.length }">
        <div class="results-content">
          <div class="score-circle" :class="scoreGrade">
            <span class="score-num">{{ score }}</span>
            <span class="score-total">/ {{ questions.length }}</span>
          </div>

          <h2 class="results-title">{{ resultsTitle }}</h2>
          <p class="results-sub">{{ resultsSub }}</p>

          <div class="results-belt" v-if="resultsBelt">
            <span class="rb-dot" :style="{ background: resultsBelt.color }"></span>
            {{ resultsBelt.label }}
          </div>

          <div class="results-actions">
            <button class="btn-primary" @click="resetQuiz">Rejouer</button>
            <button class="btn-share" @click="shareScore">
              {{ shareMsg || 'Partager' }}
            </button>
          </div>

          <!-- Récap des questions ratées -->
          <div v-if="wrongAnswers.length" class="recap">
            <h3 class="recap-title">À revoir ({{ wrongAnswers.length }})</h3>
            <div
              v-for="(item, i) in wrongAnswers"
              :key="i"
              class="recap-item"
            >
              <img v-if="item.image" :src="item.image" :alt="item.correct" class="recap-img" />
              <p class="recap-q">{{ item.question }}</p>
              <div class="recap-answers">
                <span class="recap-wrong">
                  <span class="recap-icon">✗</span>{{ item.yourAnswer }}
                </span>
                <span class="recap-right">
                  <span class="recap-icon">✓</span>{{ item.correct }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { LEXIQUE } from '@/utils/lexique.js'

const quizState = ref('start')
const questions = ref([])
const currentQuestionIndex = ref(0)
const score = ref(0)
const selectedAnswer = ref(null)
const feedbackMessage = ref('')
const loading = ref(false)
const error = ref(null)
const selectedBelt = ref('')
const wrongAnswers = ref([])
const shareMsg = ref('')

const BELT_COLORS = {
  blanche: '#c8c8c8',
  jaune:   '#f1c40f',
  orange:  '#e67e22',
  verte:   '#27ae60',
  bleue:   '#2980b9',
  marron:  '#8e5e3b',
  noire:   '#555555',
}

const BELT_ORDER = ['blanche', 'jaune', 'orange', 'verte', 'bleue', 'marron', 'noire']

const QUIZ_BELTS = [
  { value: 'blanche', label: 'Blanche' },
  { value: 'jaune',   label: 'Jaune' },
  { value: 'orange',  label: 'Orange' },
  { value: 'verte',   label: 'Verte' },
  { value: 'bleue',   label: 'Bleue' },
  { value: 'marron',  label: 'Marron' },
  { value: 'noire',   label: 'Noire' },
]

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const isCorrect = computed(() => selectedAnswer.value === currentQuestion.value?.correctAnswer)

// ── Score grade ──────────────────────────────────────────────
const scoreGrade = computed(() => {
  const ratio = score.value / questions.value.length
  if (ratio >= 0.9)  return 'grade-s'
  if (ratio >= 0.7)  return 'grade-a'
  if (ratio >= 0.5)  return 'grade-b'
  return 'grade-c'
})

const resultsTitle = computed(() => {
  const ratio = score.value / questions.value.length
  if (ratio >= 0.9)  return 'Ippon !'
  if (ratio >= 0.7)  return 'Waza-ari !'
  if (ratio >= 0.5)  return 'Yuko !'
  return 'Entraîne-toi encore'
})

const resultsSub = computed(() => {
  const ratio = score.value / questions.value.length
  if (ratio >= 0.9)  return 'Maîtrise parfaite. Le tatami t\'appartient.'
  if (ratio >= 0.7)  return 'Bonne connaissance des techniques.'
  if (ratio >= 0.5)  return 'Tu progresses. Continue l\'entraînement !'
  return 'Revois les fiches de techniques et retente ta chance.'
})

const BELT_LEVELS = [
  { min: 0,   label: 'Ceinture Blanche', color: '#c8c8c8' },
  { min: 0.3, label: 'Ceinture Jaune',  color: '#f1c40f' },
  { min: 0.5, label: 'Ceinture Orange', color: '#e67e22' },
  { min: 0.7, label: 'Ceinture Verte',  color: '#27ae60' },
  { min: 0.9, label: 'Ceinture Bleue',  color: '#2980b9' },
]

const resultsBelt = computed(() => {
  if (!questions.value.length) return null
  const ratio = score.value / questions.value.length
  return [...BELT_LEVELS].reverse().find(b => ratio >= b.min) || BELT_LEVELS[0]
})

// ── Fetch & génération de questions ─────────────────────────
async function fetchTechniques() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/techniques`)
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    error.value = e
    return []
  } finally {
    loading.value = false
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function generateQuestions() {
  const data = await fetchTechniques()
  if (!data.length) {
    error.value = new Error('Impossible de charger les techniques.')
    return
  }

  // Filtrer par niveau ceinture si sélectionné
  const maxIdx = selectedBelt.value ? BELT_ORDER.indexOf(selectedBelt.value) : Infinity
  const filtered = selectedBelt.value
    ? data.filter(t => {
        if (!t.acf?.ceinture) return false
        const idx = BELT_ORDER.indexOf(t.acf.ceinture.toLowerCase())
        return idx >= 0 && idx <= maxIdx
      })
    : data

  const pool = filtered.length >= 4 ? filtered : data // fallback si trop peu de techniques
  const techs = shuffle([...pool])
  const generated = []

  const allMovements = Object.keys(LEXIQUE).filter(k => k.endsWith('-waza') && !['Tachi-waza','Ne-waza','Sutemi-waza','Ma-sutemi-waza','Yoko-sutemi-waza'].includes(k))
  const allTypes = ['Tachi-waza', 'Ne-waza']

  for (const tech of techs) {
    if (generated.length >= 10) break

    // Type 1 : traduction
    if (tech.acf.traduction) {
      const correct = tech.acf.traduction
      const wrong = shuffle(techs.filter(t => t.acf.traduction && t.acf.traduction !== correct).map(t => t.acf.traduction)).slice(0, 3)
      if (wrong.length === 3) {
        generated.push({ question: `Quelle est la traduction de "${tech.title}" ?`, options: shuffle([...wrong, correct]), correctAnswer: correct })
      }
    }

    if (generated.length >= 10) break

    // Type 2 : mouvement
    if (tech.acf.mouvement && allMovements.includes(tech.acf.mouvement)) {
      const correct = LEXIQUE[tech.acf.mouvement]
      const wrong = shuffle(allMovements.filter(m => m !== tech.acf.mouvement).map(m => LEXIQUE[m])).slice(0, 3)
      if (wrong.length === 3) {
        generated.push({ question: `Quel est le mouvement de "${tech.title}" ?`, options: shuffle([...wrong, correct]), correctAnswer: correct })
      }
    }

    if (generated.length >= 10) break

    // Type 3 : image
    if (tech.acf.image) {
      const correct = tech.title
      const wrong = shuffle(techs.filter(t => t.title !== correct).map(t => t.title)).slice(0, 3)
      if (wrong.length === 3) {
        generated.push({ question: 'Quelle technique est représentée ?', image: tech.acf.image, options: shuffle([...wrong, correct]), correctAnswer: correct })
      }
    }
  }

  // Fallback : type général
  for (const tech of techs) {
    if (generated.length >= 10) break
    if (tech.acf.type && allTypes.includes(tech.acf.type)) {
      const correct = LEXIQUE[tech.acf.type]
      const wrong = allTypes.filter(t => t !== tech.acf.type).map(t => LEXIQUE[t])
      if (wrong.length > 0) {
        generated.push({ question: `Quel est le type général de "${tech.title}" ?`, options: shuffle([...wrong, correct]), correctAnswer: correct })
      }
    }
  }

  questions.value = shuffle(generated.slice(0, 10))
}

async function startQuiz() {
  quizState.value = 'playing'
  currentQuestionIndex.value = 0
  score.value = 0
  selectedAnswer.value = null
  feedbackMessage.value = ''
  wrongAnswers.value = []
  await generateQuestions()
}

function selectAnswer(option) {
  if (feedbackMessage.value) return
  selectedAnswer.value = option
  if (option === currentQuestion.value.correctAnswer) {
    feedbackMessage.value = 'Bonne réponse !'
    score.value++
  } else {
    feedbackMessage.value = `Réponse correcte : ${currentQuestion.value.correctAnswer}`
    wrongAnswers.value.push({
      question: currentQuestion.value.question,
      yourAnswer: option,
      correct: currentQuestion.value.correctAnswer,
      image: currentQuestion.value.image || null,
    })
  }
}

function nextQuestion() {
  selectedAnswer.value = null
  feedbackMessage.value = ''
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  } else {
    quizState.value = 'results'
  }
}

// ── Titre de page dynamique ───────────────────────────────────
watch(quizState, (state) => {
  if (state === 'start')    document.title = 'Quiz · Judodex'
  else if (state === 'playing') document.title = 'Quiz en cours · Judodex'
  else document.title = `${score.value}/${questions.value.length} · Judodex`
}, { immediate: true })

// ── Raccourcis clavier ────────────────────────────────────────
function handleKey(e) {
  // Écran départ : Entrée pour commencer
  if (quizState.value === 'start' && e.key === 'Enter') {
    startQuiz()
    return
  }

  // Écran résultats : Entrée pour rejouer
  if (quizState.value === 'results' && e.key === 'Enter') {
    resetQuiz()
    return
  }

  if (quizState.value !== 'playing' || loading.value || !currentQuestion.value) return

  if (!feedbackMessage.value) {
    const idx = ['1', '2', '3', '4'].indexOf(e.key)
    if (idx !== -1 && currentQuestion.value.options[idx] !== undefined) {
      selectAnswer(currentQuestion.value.options[idx])
    }
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    nextQuestion()
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
  document.title = 'Judodex'
})

// ── Partage du score ──────────────────────────────────────────
async function shareScore() {
  const text = `${resultsTitle.value} — ${score.value}/${questions.value.length} au Judodex Quiz 🥋`
  if (navigator.share) {
    try { await navigator.share({ title: 'Judodex Quiz', text }) } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(text)
      shareMsg.value = 'Copié !'
      setTimeout(() => { shareMsg.value = '' }, 2000)
    } catch {}
  }
}

function resetQuiz() {
  quizState.value = 'start'
  questions.value = []
  currentQuestionIndex.value = 0
  score.value = 0
  selectedAnswer.value = null
  feedbackMessage.value = ''
  // selectedBelt conservé intentionnellement pour relancer au même niveau
}
</script>

<style scoped lang="scss">
$bg:      #0A0A0A;
$surface: #131313;
$raised:  #1C1C1C;
$accent:  #E50000;
$accentl: #FF4444;
$text:    #FFFFFF;
$muted:   rgba(255,255,255,0.48);
$dim:     rgba(255,255,255,0.22);
$border:  rgba(255,255,255,0.07);
$green:   #27ae60;
$red:     #e74c3c;

.quiz-page {
  min-height: calc(100vh - 64px);
  background: $bg;
}

// ── Transitions écrans ───────────────────────────────────────
.screen-enter-active,
.screen-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.screen-enter-from   { opacity: 0; transform: translateY(12px); }
.screen-leave-to     { opacity: 0; transform: translateY(-8px); }

// ── Écran de départ ──────────────────────────────────────────
.screen-start {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  overflow: hidden;
  padding: 40px 24px;
}

.start-kanji {
  position: absolute;
  right: -4%;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(160px, 30vw, 320px);
  line-height: 1;
  color: rgba(229,0,0,0.04);
  pointer-events: none;
  user-select: none;
  font-family: serif;
}

.start-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
  text-align: center;
}

.start-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 0.75em;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $muted;
  margin-bottom: 16px;
}

.start-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: clamp(3.5rem, 14vw, 6rem);
  line-height: 0.95;
  letter-spacing: 0.04em;
  color: $text;
  margin-bottom: 20px;
}

.start-accent {
  background: linear-gradient(135deg, $accent, $accentl);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.start-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.9em;
  color: $muted;
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto 24px;
}

// ── Sélecteur de niveau ───────────────────────────────────────
.diff-wrap {
  margin-bottom: 28px;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
}

.diff-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.72em;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: $muted;
  margin-bottom: 10px;
}

.diff-belts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.diff-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  background: transparent;
  color: $muted;
  font-family: 'Inter', sans-serif;
  font-size: 0.78em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;

  &:hover:not(.active) {
    border-color: rgba(255,255,255,0.22);
    color: $text;
  }

  &.active {
    font-weight: 600;
  }
}

.diff-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.diff-hint {
  font-family: 'Inter', sans-serif;
  font-size: 0.72em;
  color: $dim;
  margin-top: 8px;
  font-style: italic;
  text-transform: capitalize;
}

// ── Boutons principaux ────────────────────────────────────────
.btn-primary {
  display: inline-block;
  padding: 14px 40px;
  background: $accent;
  border: none;
  border-radius: 12px;
  color: $text;
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s, transform 0.18s;

  &:hover {
    background: $accentl;
    transform: translateY(-2px);
  }

  &:active { transform: translateY(0); }
}

// ── Écran de jeu ─────────────────────────────────────────────
.screen-playing {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px 40px;

  @media (min-width: 768px) { padding: 0 24px 48px; }
}

// Barre de progression
.progress-bar-wrap {
  height: 3px;
  background: rgba(255,255,255,0.07);
  position: sticky;
  top: 57px;
  z-index: 10;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent, $accentl);
  transition: width 0.4s ease;
}

// Header question
.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 20px;
}

.q-counter {
  font-family: 'Inter', sans-serif;
  font-size: 0.8em;
  font-weight: 600;
  color: $muted;
  letter-spacing: 0.06em;
}

.q-score {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82em;
  font-weight: 700;
  color: $text;
}

.score-icon { color: $accent; font-size: 0.9em; }

// Image question
.q-image-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  padding: 12px;
}

// Corps question
.q-body { }

.q-text {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 2.8vw, 1.2rem);
  font-weight: 600;
  color: $text;
  line-height: 1.45;
  margin-bottom: 24px;
}

// Options
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  color: rgba(255,255,255,0.75);
  font-family: 'Inter', sans-serif;
  font-size: 0.88em;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s;

  &:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.22);
    color: $text;
    background: $raised;
  }

  &.selected {
    border-color: rgba(255,255,255,0.35);
    background: $raised;
    color: $text;
  }

  &.correct {
    background: rgba(39,174,96,0.15);
    border-color: $green;
    color: #6ee3a5;
  }

  &.incorrect {
    background: rgba(231,76,60,0.15);
    border-color: $red;
    color: #f1948a;
  }

  &:disabled { cursor: not-allowed; }
}

.option-letter {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255,255,255,0.07);
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0;
  color: $muted;

  .option-btn.correct &  { background: rgba(39,174,96,0.25);  color: $green; }
  .option-btn.incorrect & { background: rgba(231,76,60,0.25); color: $red; }
}

.option-text {
  flex: 1;
  line-height: 1.3;
}

// Feedback
.feedback {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.88em;
  font-weight: 500;
  line-height: 1.4;

  &.fb-correct {
    background: rgba(39,174,96,0.12);
    border: 1px solid rgba(39,174,96,0.3);
    color: #7de3ab;
  }

  &.fb-wrong {
    background: rgba(231,76,60,0.1);
    border: 1px solid rgba(231,76,60,0.3);
    color: #f5a49c;
  }
}

.fb-icon {
  font-size: 1em;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.fb-text { flex: 1; }

// Bouton suivant
.btn-next {
  width: 100%;
  padding: 14px 16px;
  background: $raised;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: $text;
  font-family: 'Inter', sans-serif;
  font-size: 0.92em;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.2);
  }
}

// Animations question (texte + options : glissement latéral)
.q-fade-enter-active,
.q-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.q-fade-enter-from { opacity: 0; transform: translateX(12px); }
.q-fade-leave-to   { opacity: 0; transform: translateX(-8px); }

// Animation image (fondu doux, sans déplacement)
.img-fade-enter-active,
.img-fade-leave-active { transition: opacity 0.35s ease; }
.img-fade-enter-from,
.img-fade-leave-to     { opacity: 0; }

.fb-slide-enter-active,
.fb-slide-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.fb-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fb-slide-leave-to   { opacity: 0; }

// ── Résultats ────────────────────────────────────────────────
.screen-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 40px 24px;

  // Quand il y a un récap → passe en mode scroll
  &.has-recap {
    align-items: flex-start;
    min-height: unset;
    padding: 48px 24px 80px;
  }
}

.results-content {
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  border: 3px solid;
  position: relative;

  &.grade-s { border-color: #f1c40f; background: rgba(241,196,15,0.08); }
  &.grade-a { border-color: $green;  background: rgba(39,174,96,0.08); }
  &.grade-b { border-color: #2980b9; background: rgba(41,128,185,0.08); }
  &.grade-c { border-color: $muted;  background: rgba(255,255,255,0.04); }
}

.score-num {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 3rem;
  line-height: 1;
  color: $text;
}

.score-total {
  font-family: 'Inter', sans-serif;
  font-size: 0.75em;
  color: $muted;
  margin-top: 2px;
}

.results-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 2.4rem;
  letter-spacing: 0.06em;
  color: $text;
  margin-bottom: 10px;
}

.results-sub {
  font-family: 'Inter', sans-serif;
  font-size: 0.88em;
  color: $muted;
  line-height: 1.5;
  margin-bottom: 20px;
}

.results-belt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid $border;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82em;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  margin-bottom: 32px;
}

.rb-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.results-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-share {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: rgba(255,255,255,0.72);
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  min-width: 130px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
}

// Hint clavier — desktop uniquement
.kbd-hint {
  display: none;

  @media (hover: hover) and (pointer: fine) {
    display: block;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 0.72em;
    color: rgba(255,255,255,0.18);
    margin-top: 14px;
    letter-spacing: 0.02em;

    kbd {
      display: inline-block;
      padding: 1px 5px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      font-size: 0.95em;
      margin: 0 1px;
    }
  }
}

.btn-next-hint {
  display: none;

  @media (hover: hover) and (pointer: fine) {
    display: inline-block;
    margin-left: auto;
    font-family: 'Inter', sans-serif;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0;
    color: rgba(255,255,255,0.28);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    padding: 1px 5px;
    text-transform: none;
  }
}

// ── États intermédiaires ──────────────────────────────────────
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 24px;
  font-family: 'Inter', sans-serif;
  font-size: 0.9em;
  color: $muted;
}

.state-err { color: $accent; }

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: $accent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

// ── Récap des erreurs ─────────────────────────────────────────
.recap {
  margin-top: 36px;
  text-align: left;
}

.recap-title {
  font-family: 'Bebas Neue', Arial, sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.12em;
  color: $muted;
  margin-bottom: 14px;
  text-align: center;
}

.recap-item {
  background: $surface;
  border: 1px solid $border;
  border-left: 3px solid $red;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.recap-img {
  width: 100%;
  max-height: 110px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 6px;
  margin-bottom: 10px;
  display: block;
}

.recap-q {
  font-family: 'Inter', sans-serif;
  font-size: 0.83em;
  font-weight: 600;
  color: rgba(255,255,255,0.82);
  margin-bottom: 10px;
  line-height: 1.4;
}

.recap-answers {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.recap-wrong,
.recap-right {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Inter', sans-serif;
  font-size: 0.82em;
  line-height: 1.35;
}

.recap-wrong { color: #f5a49c; }
.recap-right { color: #7de3ab; font-weight: 600; }

.recap-icon {
  font-weight: 700;
  flex-shrink: 0;
  font-size: 0.85em;
}
</style>
