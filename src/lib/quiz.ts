import type { QuizMode, QuizQuestion, Technique } from '../types/judodex'
import { clipFor } from '../components/QuizVideo'

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Génère une question : la bonne réponse + 3 leurres, de préférence de la
 * même famille (plus difficile, plus pédagogique).
 */
export function makeQuestion(
  pool: Technique[],
  mode: QuizMode,
  exclude: Set<string>,
  distractorPool: Technique[] = pool,
): QuizQuestion | null {
  const playable = (t: Technique) => (mode === 'video' ? clipFor(t) !== null : true)
  const eligible = pool.filter((t) => playable(t) && !exclude.has(t.slug))
  const candidates = eligible.length ? eligible : pool.filter(playable)
  if (!candidates.length || distractorPool.length < 4) return null
  const answer = candidates[Math.floor(Math.random() * candidates.length)]
  const sameFamily = shuffle(distractorPool.filter((t) => t.slug !== answer.slug && t.family === answer.family))
  const others = shuffle(distractorPool.filter((t) => t.slug !== answer.slug && t.family !== answer.family))
  const distractors = [...sameFamily, ...others].slice(0, 3)
  return { mode, answer, choices: shuffle([answer, ...distractors]) }
}
