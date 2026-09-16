import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import type { Route } from '../hooks/useRoute'
import { makeQuestion } from '../lib/quiz'
import { INTERVALS } from '../lib/srs'
import { FAMILY_META, familyVars } from '../lib/families'
import { QuizVideo, clipFor } from '../components/QuizVideo'
import { SectionHead } from '../components/SectionHead'
import { BeltMark } from '../components/BeltMark'
import { Link } from '../components/Link'
import { loadYouTubeApi } from '../lib/youtube'
import { useBestScores } from '../hooks/useUi'
import type { QuizMode, QuizQuestion, Technique } from '../types/judodex'

interface Props {
  dex: Judodex
  onNavigate: (r: Route) => void
}

type Format = 'recall' | 'choice'
type Pool = 'review' | 'belt' | 'discover' | 'all'

const MODES: { value: QuizMode; label: string; jp: string; prompt: string; hint: string }[] = [
  {
    value: 'video',
    label: 'Démonstration',
    jp: '映像',
    prompt: 'Quelle technique est démontrée ?',
    hint: 'La vidéo démarre après le générique et le nom reste masqué',
  },
  {
    value: 'translation',
    label: 'Traduction',
    jp: '訳',
    prompt: 'Quelle technique porte ce sens ?',
    hint: 'Du sens français vers le nom japonais',
  },
]

const SESSION = 10

export function TrainScreen({ dex, onNavigate }: Props) {
  const [best, setBest] = useBestScores()
  const [format, setFormat] = useState<Format>('choice')
  const [mode, setMode] = useState<QuizMode>('video')
  const [pool, setPool] = useState<Pool>(dex.stats.due > 0 ? 'review' : 'all')

  const [queue, setQueue] = useState<Technique[] | null>(null)
  const [step, setStep] = useState(0)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  /** Résultat de chaque question, pour le bilan de fin de séance. */
  const [resultats, setResultats] = useState<{ slug: string; correct: boolean }[]>([])

  const pools: { value: Pool; label: string; list: Technique[]; hint: string }[] = useMemo(
    () => [
      { value: 'review', label: 'Révision du jour', list: dex.session(SESSION), hint: "Les techniques dont l'échéance est atteinte" },
      {
        value: 'belt',
        label: `Programme ceinture ${dex.currentGroup.belt.name.toLowerCase()}`,
        list: dex.currentGroup.techniques,
        hint: `Le programme du grade que vous préparez, ${dex.currentGroup.belt.kyu}`,
      },
      { value: 'discover', label: 'Découverte', list: dex.suggestions, hint: "Des techniques que vous n'avez pas encore abordées" },
      { value: 'all', label: 'Tout le catalogue', list: dex.techniques, hint: `Tirage libre parmi les ${dex.techniques.length} techniques` },
    ],
    [dex],
  )

  const current = queue?.[step]

  /**
   * La file est tirée dès l'écran de réglage, et non au clic : le lecteur peut
   * ainsi charger la première vidéo à l'avance plutôt qu'une autre au hasard.
   */
  const filePrete = useMemo(() => {
    const source = pools.find((x) => x.value === pool)?.list ?? []
    const utilisables = mode === 'video' ? source.filter((t) => clipFor(t) !== null) : source
    return [...utilisables].sort(() => Math.random() - 0.5).slice(0, SESSION)
    // La file ne se retire pas à chaque réponse : seuls le périmètre et le
    // support la renouvellent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, mode])

  const premierExtrait = useMemo(() => (filePrete[0] ? clipFor(filePrete[0]) : null), [filePrete])

  /** Plus longue suite de bonnes réponses, déduite du relevé. */
  const meilleureSerie = useMemo(() => {
    let max = 0
    let en = 0
    for (const r of resultats) {
      en = r.correct ? en + 1 : 0
      if (en > max) max = en
    }
    return max
  }, [resultats])

  const enCours = !!queue && step < (queue?.length ?? 0)
  /** Vrai quand une question est affichée. */
  const enSeance = enCours && !!queue?.[step]
  /** Extrait montré, ou celui de la première question tant qu'elle n'a pas commencé. */
  const clipAffiche = enSeance && queue ? clipFor(queue[step]) : premierExtrait

  const prepare = useCallback(
    (t: Technique | undefined, m: QuizMode, f: Format) => {
      if (!t) return
      setPicked(null)
      setRevealed(false)
      setQuestion(f === 'choice' ? makeQuestion([t], m, new Set(), dex.techniques) : { mode: m, answer: t, choices: [t] })
    },
    [dex.techniques],
  )

  const start = () => {
    const list = filePrete
    if (!list.length) return
    setQueue(list)
    setStep(0)
    setScore(0)
    setResultats([])
    prepare(list[0], mode, format)
  }

  const grade = (correct: boolean) => {
    if (!current) return
    dex.review(current.slug, correct)
    setResultats((r) => [...r, { slug: current.slug, correct }])
    setScore((s) => s + (correct ? 1 : 0))
  }

  const answerChoice = (slug: string) => {
    if (picked || !question) return
    setPicked(slug)
    grade(slug === question.answer.slug)
  }

  const advance = () => {
    if (!queue) return
    const nextStep = step + 1
    if (nextStep >= queue.length) {
      setBest((b) => ({ ...b, [mode]: Math.max(b[mode] ?? 0, score) }))
      setStep(nextStep)
      setQuestion(null)
      return
    }
    setStep(nextStep)
    prepare(queue[nextStep], mode, format)
  }

  // L'interface du lecteur est longue à charger : on la demande dès l'arrivée
  // sur l'écran, pour qu'elle soit prête au lancement de la séance.
  useEffect(() => {
    void loadYouTubeApi()
  }, [])

  // Clavier : 1 à 4 pour répondre, Entrée ou Espace pour enchaîner.
  useEffect(() => {
    if (!queue || !question) return
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) return
      if (format === 'choice' && !picked && question && /^[1-4]$/.test(e.key)) {
        const c = question.choices[Number(e.key) - 1]
        if (c) {
          e.preventDefault()
          answerChoice(c.slug)
        }
      } else if (format === 'choice' && picked && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        advance()
      } else if (format === 'recall' && !revealed && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        setRevealed(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const quit = () => {
    setQueue(null)
    setQuestion(null)
    setStep(0)
  }

  const finished = queue && step >= queue.length

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8">
      {/* Écran de préparation */}
      {!queue && (
        <div className="pb-14 pt-12">
          <div className="flex items-center gap-3">
            <span className="annot border border-ink px-1.5 py-1 leading-none">Séance de révision</span>
          </div>
          <h1 className="display mt-5">Dojo</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="dimension w-20" />
            <span className="font-jp text-base tracking-[0.3em] text-faint">稽古</span>
          </div>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-soft">
            Dix questions, sur la démonstration filmée ou sur le sens du nom. Chaque réponse ajuste la date de la prochaine révision :
            juste, la technique revient plus tard ; fausse, elle revient demain. Le carnet retient tout.
          </p>

          <div className="border-t border-ink mt-10">
          <Field label="Que réviser">
            {pools.map((p) =>
              // La ceinture noire n'a pas de programme de kyu à réviser : le
              // périmètre renvoie alors vers le programme des dan, plus bas.
              p.value === 'belt' && dex.currentBelt === 'noire' ? (
                <Link
                  key={p.value}
                  to={{ name: 'dan', dan: 1 }}
                  title="Le programme des trois premiers dan"
                  className={`${pill(false)} flex items-center gap-1.5`}
                >
                  {p.label}
                  <span className="opacity-70">→</span>
                </Link>
              ) : (
                <button
                  key={p.value}
                  onClick={() => setPool(p.value)}
                  disabled={p.list.length === 0}
                  title={p.list.length === 0 ? 'Aucune technique dans ce groupe' : p.hint}
                  className={pill(pool === p.value)}
                >
                  {p.label}
                  <span className="ml-1.5 font-mono text-[10px] opacity-70">{p.list.length}</span>
                </button>
              ),
            )}
          </Field>
          <Field label="Je prépare">
            {dex.beltGroups.map((g) => {
              const on = g.belt.id === dex.currentBelt
              return (
                <button
                  key={g.belt.id}
                  onClick={() => {
                    dex.setCurrentBelt(g.belt.id)
                    // Le programme de la ceinture noire n'est pas révisable ici.
                    if (g.belt.id === 'noire' && pool === 'belt') setPool('all')
                  }}
                  aria-pressed={on}
                  title={g.belt.kyu}
                  className={`${pill(on)} flex items-center gap-2 normal-case tracking-normal text-[11.5px]`}
                >
                  <BeltMark belt={g.belt.id} width={20} height={7} />
                  {g.belt.name}
                  {g.techniques.length > 0 && (
                    <span className="font-mono text-[10px] opacity-60">
                      {g.mastered}/{g.techniques.length}
                    </span>
                  )}
                </button>
              )
            })}
          </Field>
          <Field label="Question">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                disabled={m.value === 'video' && pools.find((p) => p.value === pool)!.list.filter((t) => clipFor(t)).length < 4}
                className={pill(mode === m.value)}
              >
                <span className="font-jp mr-1.5">{m.jp}</span>
                {m.label}
              </button>
            ))}
          </Field>

          <Field label="Réponse">
            <button onClick={() => setFormat('choice')} className={pill(format === 'choice')}>
              Choix multiple
            </button>
            <button onClick={() => setFormat('recall')} className={pill(format === 'recall')}>
              De mémoire
            </button>
          </Field>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              onClick={start}
              disabled={pools.find((p) => p.value === pool)!.list.length === 0}
              className="bg-signal px-8 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-field transition hover:brightness-110 disabled:opacity-30"
            >
              Commencer la séance
            </button>
            <p className="max-w-sm text-[11.5px] leading-relaxed text-faint">
              {MODES.find((m) => m.value === mode)!.hint}. {format === 'choice' ? 'Quatre propositions, une seule correcte.' : 'Vous récitez de mémoire, puis vous vous évaluez.'}
              {best[mode] !== undefined && ` Record : ${best[mode]}/${SESSION}.`}
            </p>
          </div>

          {/* Passage de grade : le programme du 1er dan, hors séance de révision. */}
          <Link
            to={{ name: 'dan', dan: 1 }}
            className="group mt-10 flex min-w-0 items-center gap-4 border border-ink bg-plate p-5 transition-colors hover:border-signal sm:p-6"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold transition-colors group-hover:text-signal">
                Ceinture noire <span className="font-jp ml-1.5 text-faint">黒帯</span>
              </span>
              <span className="mt-1.5 block text-[12.5px] leading-relaxed text-soft">
                Le programme des trois premiers dan, unité par unité : les katas de l'UV1, les listes de l'UV2 et le tirage du jury.
              </span>
            </span>
            <span className="annot shrink-0 text-faint transition-colors group-hover:text-signal">→</span>
          </Link>

          {dex.stats.due === 0 && dex.stats.learning > 0 && (
            <p className="mt-8 border-l-[5px] border-signal bg-plate p-4 text-[13px] leading-relaxed text-soft">
              Aucune révision n'est due aujourd'hui. Vos {dex.stats.learning} techniques en cours reviendront à leur échéance. Vous pouvez
              tout de même lancer une séance libre.
            </p>
          )}
        </div>
      )}

      {/* Séance en cours. La section reste montée pendant le réglage, sans rien
          afficher : c'est ce qui permet au lecteur vidéo de survivre au
          démarrage au lieu d'être reconstruit, ce qui coûtait quatre secondes. */}
      <div className={enSeance ? 'py-8' : ''}>
        {enSeance && question && current && (
        <>
          {/* Barre de progression de séance */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex flex-1 gap-1">
              {queue.map((_, i) => (
                <span key={i} className={`h-[5px] flex-1 transition ${i < step ? 'bg-signal' : i === step ? 'bg-ink' : 'bg-rule'}`} />
              ))}
            </div>
            <span className="font-mono text-[11px] tabular-nums text-faint">
              {step + 1}/{queue.length}
            </span>
            <button onClick={quit} className="tap inline-flex items-center text-[11px] text-faint hover:text-signal">
              Quitter
            </button>
          </div>

          <p className="text-center text-[12px] text-faint">{MODES.find((m) => m.value === mode)!.prompt}</p>

          {/* L'indice */}
          <div className="mt-5">
            {mode === 'translation' && (
              <div className="plate grid min-h-44 place-items-center p-8 text-center">
                <div>
                  <p className="text-4xl font-bold leading-tight tracking-[-0.02em]">« {current.translation} »</p>
                  <p className="annot mt-3 text-faint">{FAMILY_META[current.family].label}</p>
                </div>
              </div>
            )}
          </div>

        </>
        )}

        {/* Emplacement unique du lecteur pour toute la séance : il n'est
            construit qu'une fois et change simplement de vidéo d'une question
            à l'autre. Le préchauffer hors écran a été essayé et abandonné :
            le navigateur refuse de lancer la lecture dans un cadre invisible. */}
        {enSeance && mode === 'video' && clipAffiche && (
          <div key="lecteur" className="mt-5">
            <QuizVideo clip={clipAffiche} revealed={format === 'choice' ? !!picked : revealed} />
          </div>
        )}

        {enSeance && question && current && (
        <>
          {/* Reconnaissance */}
          {format === 'choice' && (
            <>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {question.choices.map((c, i) => {
                  const isAnswer = c.slug === question.answer.slug
                  const isPicked = c.slug === picked
                  let cls = 'border-rule hover:border-ink'
                  if (picked) {
                    if (isAnswer) cls = 'border-ink bg-ink text-field'
                    else if (isPicked) cls = 'border-signal bg-signal text-field'
                    else cls = 'border-rule opacity-45'
                  }
                  return (
                    <fm.button
                      key={c.slug}
                      onClick={() => answerChoice(c.slug)}
                      disabled={!!picked}
                      animate={picked && isPicked && !isAnswer ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                      style={familyVars(c.family)}
                      className={`flex items-center gap-3 border bg-plate px-3.5 py-3.5 text-left transition ${cls}`}
                    >
                      <span className="grid size-6 shrink-0 place-items-center border border-rule font-mono text-[10px] text-faint">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{c.name}</span>
                        {picked && <span className="block truncate text-[11px] text-faint">{c.translation}</span>}
                      </span>
                      {picked && <span className="font-jp shrink-0 text-xl text-(--fam)">{c.kanji}</span>}
                    </fm.button>
                  )
                })}
              </div>

              <AnimatePresence>
                {picked && (
                  <fm.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                    <Verdict correct={picked === question.answer.slug} t={question.answer} dex={dex} onNext={advance} onOpen={() => onNavigate({ name: 'technique', slug: question.answer.slug })} last={step + 1 >= queue.length} />
                  </fm.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Mémorisation */}
          {format === 'recall' && (
            <div className="mt-5">
              {!revealed ? (
                <button onClick={() => setRevealed(true)} className="w-full border border-ink py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition hover:bg-ink hover:text-field">
                  Révéler la réponse
                </button>
              ) : (
                <fm.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="border border-ink bg-plate p-6 text-center">
                    <p className="text-3xl font-bold tracking-[-0.02em]">{current.name}</p>
                    <p className="mt-1.5 text-sm text-soft">{current.translation}</p>
                    <p className="annot mt-2 text-faint">{FAMILY_META[current.family].label}</p>
                  </div>
                  <p className="annot mt-5 text-center text-faint">Étiez-vous capable de la nommer ?</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        grade(false)
                        advance()
                      }}
                      className="border border-signal py-3.5 text-[11px] font-bold uppercase tracking-widest text-signal transition hover:bg-signal hover:text-field"
                    >
                      À revoir
                    </button>
                    <button
                      onClick={() => {
                        grade(true)
                        advance()
                      }}
                      className="bg-ink py-3.5 text-[11px] font-bold uppercase tracking-widest text-field transition hover:bg-signal"
                    >
                      Je savais
                    </button>
                  </div>
                </fm.div>
              )}
            </div>
          )}
        </>
        )}
      </div>

      {/* Bilan de séance : une planche de relevé, pas un écran de fin de partie.
          Ce qui compte après une séance, c'est ce qu'on a manqué et quand cela
          reviendra. */}
      {finished && queue && (
        <fm.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-10">
          <div className="flex items-center gap-3">
            <span className="annot border border-ink px-1.5 py-1 leading-none">BILAN</span>
            <span className="annot text-faint">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {MODES.find((m) => m.value === mode)!.label}
            </span>
          </div>

          <h2 className="display mt-5">
            {score} sur {queue.length}
          </h2>

          <div className="mt-4 flex items-center gap-3">
            <span className="dimension w-16" />
            <span className="font-jp text-base text-signal">
              {score === queue.length ? '一本' : score >= queue.length * 0.7 ? '技あり' : score >= queue.length * 0.4 ? '有効' : '待て'}
            </span>
            <span className="annot text-faint">
              {score === queue.length
                ? 'Ippon, séance parfaite'
                : score >= queue.length * 0.7
                  ? 'Waza-ari, très solide'
                  : score >= queue.length * 0.4
                    ? 'Yuko, les bases sont là'
                    : 'Matte, on reprend les fondamentaux'}
            </span>
          </div>

          {/* Relevé chiffré */}
          <dl className="mt-8 grid max-w-lg grid-cols-3 border border-rule">
            {[
              { n: `${Math.round((score / queue.length) * 100)} %`, l: 'précision' },
              { n: meilleureSerie, l: 'meilleure série' },
              { n: queue.length - score, l: 'restent à revoir' },
            ].map((k, i) => (
              <div key={k.l} className={`px-4 py-3 ${i < 2 ? 'border-r border-rule' : ''}`}>
                <dd className="font-mono text-2xl font-semibold leading-none">{k.n}</dd>
                <dt className="annot mt-1.5 text-faint">{k.l}</dt>
              </div>
            ))}
          </dl>

          {/* Le détail, question par question */}
          <div className="mt-10">
            <SectionHead title="Détail de la séance" jp="記録" aside={`${resultats.length} questions`} />
            <div className="border-t border-rule">
              {resultats.map((r, i) => {
                const t = dex.bySlug.get(r.slug)
                if (!t) return null
                const due = dex.getProgress(r.slug).due
                return (
                  <Link
                    key={`${r.slug}-${i}`}
                    to={{ name: 'technique', slug: r.slug }}
                    style={familyVars(t.family)}
                    className="group -mx-3 flex min-w-0 items-center gap-3 border-b border-rule px-3 py-3 transition-colors hover:bg-ink hover:text-field sm:gap-4"
                  >
                    <span className="annot w-6 shrink-0 text-faint transition-colors group-hover:text-field/55">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="size-2.5 shrink-0"
                      style={{ background: r.correct ? 'var(--c-ink)' : 'var(--c-signal)' }}
                      title={r.correct ? 'juste' : 'manquée'}
                    />
                    <span className="font-jp w-[3.4rem] shrink-0 whitespace-nowrap text-center text-[15px] leading-none text-(--fam) transition-colors group-hover:text-(--fam-hi)">
                      {t.kanji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold leading-snug">{t.name}</span>
                      <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-faint transition-colors group-hover:text-field/55">
                        {t.translation}
                      </span>
                    </span>
                    {due && (
                      <span className="annot hidden shrink-0 text-faint transition-colors group-hover:text-field/55 sm:block">
                        revue le {new Date(due).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    )}
                    <span className="vector-push text-faint transition-colors group-hover:text-field">→</span>
                  </Link>
                )
              })}
            </div>
            <p className="mt-4 max-w-2xl text-[11.5px] leading-relaxed text-faint">
              Une technique manquée redevient due immédiatement : elle reparaîtra dans la prochaine séance. Une bonne réponse la repousse
              d'{INTERVALS[1]} jour, puis de {INTERVALS[2]}, {INTERVALS[3]}, {INTERVALS[4]} et jusqu'à{' '}
              {INTERVALS[INTERVALS.length - 1]} jours, l'écart s'allongeant à chaque succès.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={quit}
              className="annot border border-ink px-5 py-3 transition hover:bg-ink hover:text-field"
            >
              Nouvelle séance
            </button>
            <button
              onClick={() => onNavigate({ name: 'home' })}
              className="annot bg-ink px-5 py-3 text-field transition hover:bg-signal"
            >
              Retour au carnet →
            </button>
          </div>
        </fm.div>
      )}
    </div>
  )
}

const pill = (active: boolean) =>
  `tap inline-flex h-9 items-center border px-3.5 text-[11px] uppercase tracking-widest transition disabled:opacity-25 ${
    active ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
  }`

/** Ligne de formulaire imprimé : intitulé en marge, choix à droite. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[130px_1fr] sm:gap-6">
      <p className="annot pt-2.5 text-faint">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Verdict({
  correct,
  t,
  dex,
  onNext,
  onOpen,
  last,
}: {
  correct: boolean
  t: Technique
  dex: Judodex
  onNext: () => void
  onOpen: () => void
  last: boolean
}) {
  const due = dex.getProgress(t.slug).due
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-l-[5px] border-signal bg-plate px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm">
          <span className={`annot ${correct ? 'text-ink' : 'text-signal'}`}>{correct ? 'Juste.' : 'Manqué.'}</span>{' '}
          <button onClick={onOpen} className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            {t.name}
          </button>{' '}
          <span className="text-soft">— {t.translation}</span>
        </p>
        {due && <p className="mt-0.5 text-[11px] text-faint">Prochaine révision le {new Date(due).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>}
      </div>
      <button onClick={onNext} className="shrink-0 bg-ink px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-field transition hover:bg-signal">
        {last ? 'Voir le bilan' : 'Suivant →'}
      </button>
    </div>
  )
}
