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
import { Surtitre } from '../components/Surtitre'

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
      { value: 'review', label: 'Révision du jour', list: dex.session(SESSION), hint: 'Ce qui arrive à échéance' },
      {
        value: 'belt',
        label: `Ceinture ${dex.currentGroup.belt.name.toLowerCase()}`,
        list: dex.currentGroup.techniques,
        hint: `Le programme du ${dex.currentGroup.belt.kyu}`,
      },
      { value: 'discover', label: 'Découverte', list: dex.suggestions, hint: 'Ce que tu n\'as pas abordé' },
      { value: 'all', label: 'Tout le catalogue', list: dex.techniques, hint: 'Tirage libre' },
    ],
    [dex],
  )

  const current = queue?.[step]

  /**
   * Les leurres se tirent dans tout le catalogue : une seule technique filmée
   * suffit à une séance sur la démonstration. Sans aucune, le support bascule
   * sur la traduction plutôt que de rester choisi et grisé à la fois.
   */
  const videoPossible = useMemo(() => (pools.find((p) => p.value === pool)?.list ?? []).some((t) => clipFor(t) !== null), [pools, pool])
  const listeChoisie = pools.find((p) => p.value === pool)?.list ?? []
  useEffect(() => {
    // Une liste vide — la ceinture noire, qui n'a pas de programme de kyu —
    // ne dit rien du support : on ne touche à rien.
    if (!videoPossible && mode === 'video' && listeChoisie.length > 0) setMode('translation')
  }, [videoPossible, mode, listeChoisie.length])

  /**
   * La file est tirée dès l'écran de réglage, et non au clic : le lecteur peut
   * ainsi charger la première vidéo à l'avance plutôt qu'une autre au hasard.
   */
  const filePrete = useMemo(() => {
    const source = pools.find((x) => x.value === pool)?.list ?? []
    const utilisables = mode === 'video' ? source.filter((t) => clipFor(t) !== null) : source
    return [...utilisables].sort(() => Math.random() - 0.5).slice(0, SESSION)
    // La file ne se retire pas à chaque réponse : le périmètre, le support et
    // le grade préparé la renouvellent, ainsi que le retour à la préparation —
    // sans quoi la révision du jour proposait encore ce qu'on venait de revoir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, mode, dex.currentBelt, queue === null])

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

  /** Les techniques manquées de la séance, pour les reprendre aussitôt. */
  const manquees = useMemo(
    () =>
      [...new Set(resultats.filter((r) => !r.correct).map((r) => r.slug))]
        .map((slug) => dex.bySlug.get(slug))
        .filter((t): t is Technique => !!t),
    [resultats, dex.bySlug],
  )

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

  const start = (list: Technique[] = filePrete) => {
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

  // Pendant une séance, le pied de page se retire : on est sur le tapis, pas
  // dans le carnet.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-seance', enSeance)
    return () => document.documentElement.removeAttribute('data-seance')
  }, [enSeance])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8">
      {/* Écran de préparation.
          Il tient dans un écran de téléphone, bouton compris : quoi réviser
          en quatre grandes cases, deux réglages à deux positions, et la
          séance. Tout a une valeur par défaut raisonnable ; on peut lancer
          sans rien toucher. */}
      {!queue && (
        <div className="pb-14 pt-6 sm:pt-20">
          <Surtitre className="monte">Révision espacée</Surtitre>
          <h1 className="display monte mt-3 sm:mt-5" style={{ '--d': '80ms' } as React.CSSProperties}>Dojo</h1>
          <p className="monte mt-3 max-w-xl text-[15px] leading-[1.6] text-soft sm:mt-4 sm:text-[16px]" style={{ '--d': '160ms' } as React.CSSProperties}>
            Dix questions. Juste, la technique revient plus tard ; manquée, elle revient demain.
          </p>

          <div className="monte mt-6 sm:mt-8" style={{ '--d': '240ms' } as React.CSSProperties}>
            <p id="que-reviser" className="text-[14px] font-medium text-soft">Que réviser</p>
            <div role="group" aria-labelledby="que-reviser" className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pools.map((p) => {
                const on = pool === p.value
                // La case du grade reste toujours ouvrable, même vide : c'est
                // elle qui donne accès au choix de la ceinture. La fermer pour
                // la ceinture noire enfermait dans ce choix.
                const vide = p.list.length === 0 && p.value !== 'belt'
                const noire = p.value === 'belt' && dex.currentBelt === 'noire'
                const contenu = (
                  <>
                    {on && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-signal" />}
                    <span className="font-jp block text-[1.6rem] font-bold leading-none tabular-nums sm:text-[1.9rem]">{noire ? '—' : p.list.length}</span>
                    <span className="mt-2 block text-[14.5px] font-semibold leading-tight sm:mt-3">{p.label}</span>
                    <span className={`mt-1 block text-[12.5px] leading-snug ${on ? 'text-soft' : 'text-faint'}`}>
                      {noire ? 'Le programme des dan' : vide && p.value === 'review' ? 'Rien d\'échu aujourd\'hui' : p.hint}
                    </span>
                  </>
                )
                const cls = `relative flex min-w-0 flex-col items-start justify-start border p-3 text-left transition sm:p-4 ${
                  on ? 'border-ink bg-plate' : 'border-edge hover:border-ink'
                } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-edge`
                return (
                  <button key={p.value} onClick={() => setPool(p.value)} disabled={vide} aria-pressed={on} className={cls}>
                    {contenu}
                  </button>
                )
              })}
            </div>

            {/* Le choix du grade préparé reste toujours visible. */}
              <div role="group" aria-labelledby="je-prepare" className="mt-3 flex flex-wrap items-center gap-1.5">
                <span id="je-prepare" className="mr-1 text-[13px] text-faint">Je prépare</span>
                {dex.beltGroups.map((g) => {
                  const on = g.belt.id === dex.currentBelt
                  return (
                    <button
                      key={g.belt.id}
                      onClick={() => {
                        dex.setCurrentBelt(g.belt.id)
                      }}
                      aria-pressed={on}
                      title={g.belt.kyu}
                      className={`tap inline-flex h-8 items-center gap-1.5 border px-2.5 text-[13px] font-medium transition ${
                        on ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
                      }`}
                    >
                      <BeltMark belt={g.belt.id} width={16} height={6} />
                      {g.belt.name}
                    </button>
                  )
                })}
              </div>

            {pool === 'belt' && dex.currentBelt === 'noire' && (
              <p className="mt-3 border-l-[3px] border-edge bg-plate px-4 py-3 text-[14px] leading-relaxed text-soft">
                La ceinture noire ne s'obtient pas sur une liste de techniques mais par l'examen des dan.{' '}
                <Link to={{ name: 'dan', dan: 1 }} className="font-medium text-ink underline decoration-edge underline-offset-4 hover:decoration-ink">
                  Voir le programme des trois premiers dan →
                </Link>
              </p>
            )}

            <div className="mt-5 grid gap-x-6 gap-y-3.5 sm:mt-6 sm:grid-cols-2">
              <Bascule
                label="Question"
                valeur={mode}
                options={MODES.map((m) => ({
                  value: m.value,
                  label: m.label,
                  // Une liste vide ne dit rien du support : c'est le bouton de
                  // séance qui se grise, pas le choix.
                  disabled: m.value === 'video' && !videoPossible && listeChoisie.length > 0,
                  title:
                    m.value === 'video' && !videoPossible && listeChoisie.length > 0
                      ? "Aucune de ces techniques n'a de démonstration filmée"
                      : undefined,
                }))}
                onChange={setMode}
              />
              <Bascule
                label="Réponse"
                valeur={format}
                options={[
                  { value: 'choice' as Format, label: 'Choix multiple' },
                  { value: 'recall' as Format, label: 'De mémoire' },
                ]}
                onChange={setFormat}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center sm:gap-5">
              <button
                onClick={() => start()}
                disabled={filePrete.length === 0}
                className="tap group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-signal px-7 py-4 text-[16px] font-semibold text-field transition hover:brightness-110 disabled:opacity-30"
              >
                Commencer la séance
                {filePrete.length > 0 && (
                  <span className="font-normal opacity-75">· {filePrete.length} question{filePrete.length > 1 ? 's' : ''}</span>
                )}
              </button>
              <p className="text-[13px] leading-relaxed text-faint">
                {MODES.find((m) => m.value === mode)!.hint}.{' '}
                {format === 'choice' ? 'Quatre propositions, une seule juste.' : 'Tu la nommes, puis tu te notes.'}
                {best[mode] !== undefined && <> Record : {best[mode]}/{SESSION}.</>}
              </p>
            </div>
          </div>

          {dex.stats.due === 0 && dex.stats.learning > 0 && (
            <p className="mt-8 border-l-[3px] border-edge bg-plate p-4 text-[14px] leading-relaxed text-soft">
              Aucune révision n'est due aujourd'hui. Tes {dex.stats.learning} techniques en cours reviendront à leur échéance. Tu peux
              tout de même lancer une séance libre.
            </p>
          )}

          {/* Passage de grade : le programme du 1er dan, hors séance de révision. */}
          <Link to={{ name: 'dan', dan: 1 }} className="group mt-12 flex min-w-0 items-center gap-5 border-t border-rule pt-6">
            <span lang="ja" aria-hidden className="font-jp shrink-0 text-[2.4rem] font-bold leading-none text-faint">
              黒帯
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-jp block text-[1.3rem] font-bold leading-tight underline-offset-4 group-hover:underline">
                Ceinture noire
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-soft">
                Le programme des trois premiers dan, unité par unité : les katas de l'UV1, les listes de l'UV2 et le tirage du jury.
              </span>
            </span>
            <span aria-hidden className="vector-push shrink-0 text-faint group-hover:text-ink">→</span>
          </Link>
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
              {/* Chaque question garde sa couleur : juste, manquée, en cours. */}
              {queue.map((_, i) => (
                <span
                  key={i}
                  className={`h-[5px] flex-1 transition-colors duration-300 ${
                    resultats[i] ? (resultats[i].correct ? 'bg-ink' : 'bg-signal') : i === step ? 'bg-soft/60' : 'bg-rule'
                  }`}
                />
              ))}
            </div>
            <span className="text-[13px] tabular-nums text-faint">
              {step + 1}/{queue.length}
            </span>
            <button onClick={quit} className="tap inline-flex items-center text-[13px] text-faint hover:text-signal">
              Quitter
            </button>
          </div>

          <p className="text-center text-[14px] text-faint">{MODES.find((m) => m.value === mode)!.prompt}</p>

          {/* L'indice */}
          <div className="mt-5">
            {mode === 'translation' && (
              <div className="grid min-h-44 place-items-center bg-plate px-5 py-8 text-center sm:p-10">
                <div>
                  {/* Guillemets insécables : jamais un « » » seul sur sa ligne. */}
                  <p className="font-jp text-[clamp(1.8rem,6vw,2.6rem)] font-bold leading-tight [text-wrap:balance]">
                    «&nbsp;{current.translation}&nbsp;»
                  </p>
                  <p className="mt-3 text-[13px] text-faint">{FAMILY_META[current.family].label}</p>
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
                  // Une seule couleur de fond par état : la bonne réponse passe
                  // en négatif, l'erreur se cerne de vermillon, le reste s'efface.
                  let cls = 'border-edge bg-plate/50 hover:border-ink hover:bg-plate'
                  if (picked) {
                    if (isAnswer) cls = 'border-ink bg-ink text-field'
                    else if (isPicked) cls = 'border-signal bg-field text-ink'
                    else cls = 'border-rule bg-plate/50 opacity-40'
                  }
                  return (
                    <fm.button
                      key={c.slug}
                      onClick={() => answerChoice(c.slug)}
                      disabled={!!picked}
                      animate={picked && isPicked && !isAnswer ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                      style={familyVars(c.family)}
                      className={`flex min-h-[60px] items-center gap-3 border px-3.5 py-3 text-left transition ${cls}`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center border text-[12px] font-semibold tabular-nums ${
                          picked && isAnswer ? 'border-field/40 text-field' : picked && isPicked ? 'border-signal bg-signal text-field' : 'border-rule text-faint'
                        }`}
                      >
                        {picked && isAnswer ? '✓' : picked && isPicked ? '✕' : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{c.name}</span>
                        {picked && <span className="block truncate text-[13px] opacity-75">{c.translation}</span>}
                      </span>
                      {picked && (
                        <span lang="ja" className={`font-jp shrink-0 text-xl font-bold ${isAnswer ? 'text-field' : 'text-(--fam)'}`}>
                          {c.kanji}
                        </span>
                      )}
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
                <button onClick={() => setRevealed(true)} className="w-full border border-edge py-3.5 text-[15px] font-semibold transition hover:border-ink">
                  Révéler la réponse
                </button>
              ) : (
                <fm.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-plate p-6 text-center">
                    <p className="font-jp text-3xl font-bold">{current.name}</p>
                    <p className="mt-1.5 text-sm text-soft">{current.translation}</p>
                    <p className="mt-2 text-[13px] text-faint">{FAMILY_META[current.family].label}</p>
                  </div>
                  <p className="mt-5 text-center text-[14px] text-soft">Tu savais la nommer ?</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        grade(false)
                        advance()
                      }}
                      className="border border-signal py-3.5 text-[15px] font-semibold text-signal transition hover:bg-signal hover:text-field"
                    >
                      À revoir
                    </button>
                    <button
                      onClick={() => {
                        grade(true)
                        advance()
                      }}
                      className="bg-ink py-3.5 text-[15px] font-semibold text-field transition hover:bg-soft"
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
          <p className="text-[14px] text-faint">
            Bilan du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {MODES.find((m) => m.value === mode)!.label}
          </p>

          <h2 className="display mt-3">
            {score} sur {queue.length}
          </h2>

          <div className="mt-4 flex items-baseline gap-3">
            <span lang="ja" className="font-jp text-[1.4rem] font-bold text-signal">
              {score === queue.length ? '一本' : score >= queue.length * 0.7 ? '技あり' : score >= queue.length * 0.4 ? '有効' : '待て'}
            </span>
            <span className="text-[15px] text-soft">
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
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6">
            {[
              { n: `${Math.round((score / queue.length) * 100)} %`, l: 'précision' },
              { n: meilleureSerie, l: 'meilleure série' },
              { n: queue.length - score, l: 'restent à revoir' },
            ].map((k) => (
              <div key={k.l} className="flex flex-col-reverse">
                <dd className="mt-1 text-[1.6rem] font-semibold tabular-nums leading-none">{k.n}</dd>
                <dt className="text-[13px] text-faint">{k.l}</dt>
              </div>
            ))}
          </dl>

          {/* Ce qu'on fait maintenant, avant le détail : reprendre tout de suite
              ce qui a été manqué, tant que la démonstration est fraîche. */}
          <div className="mt-9 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {manquees.length > 0 && (
              <button
                onClick={() => start(manquees)}
                className="tap inline-flex items-center justify-center gap-2 bg-signal px-6 py-3.5 text-[15px] font-semibold text-field transition hover:brightness-110"
              >
                Reprendre {manquees.length === 1 ? 'la manquée' : `les ${manquees.length} manquées`}
              </button>
            )}
            <button
              onClick={quit}
              className={`tap inline-flex items-center justify-center px-6 py-3.5 text-[15px] font-semibold transition ${
                manquees.length > 0 ? 'border border-edge hover:border-ink' : 'bg-signal text-field hover:brightness-110'
              }`}
            >
              Nouvelle séance
            </button>
            <button
              onClick={() => onNavigate({ name: 'home' })}
              className="tap inline-flex items-center justify-center px-4 py-3.5 text-[15px] font-medium text-soft underline decoration-edge underline-offset-4 hover:text-ink"
            >
              Retour au carnet
            </button>
          </div>

          {/* Le détail, question par question */}
          <div className="mt-10">
            <SectionHead title="Détail de la séance" aside={`${resultats.length} questions`} />
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
                    className="group flex min-w-0 items-center gap-3 border-b border-rule py-3 sm:gap-4"
                  >
                    <span
                      className="size-2.5 shrink-0"
                      style={{ background: r.correct ? 'var(--c-ink)' : 'var(--c-signal)' }}
                      title={r.correct ? 'juste' : 'manquée'}
                    />
                    <span lang="ja" className="font-jp w-[3.4rem] shrink-0 whitespace-nowrap text-[15px] leading-none text-(--fam)">
                      {t.kanji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold leading-snug underline-offset-4 group-hover:underline">{t.name}</span>
                      <span className="mt-0.5 block truncate text-[13px] leading-snug text-faint">
                        {t.translation}
                      </span>
                    </span>
                    {due && <span className="shrink-0 text-[13px] text-faint">{quand(due)}</span>}
                    <span aria-hidden className="vector-push text-faint group-hover:text-ink">→</span>
                  </Link>
                )
              })}
            </div>
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-faint">
              Une technique manquée redevient due immédiatement : elle reparaîtra dans la prochaine séance. Une bonne réponse la repousse
              d'{INTERVALS[1]} jour, puis de {INTERVALS[2]}, {INTERVALS[3]}, {INTERVALS[4]} et jusqu'à{' '}
              {INTERVALS[INTERVALS.length - 1]} jours, l'écart s'allongeant à chaque succès.
            </p>
          </div>

        </fm.div>
      )}
    </div>
  )
}

/** Échéance dite comme on la dit : aujourd'hui, demain, dans trois jours. */
function quand(due: string): string {
  const jours = Math.round((new Date(due).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  if (jours <= 0) return "revient aujourd'hui"
  if (jours === 1) return 'revient demain'
  return `revient dans ${jours} jours`
}

/** Réglage à deux positions : un intitulé, et un interrupteur segmenté. */
function Bascule<T extends string>({
  label,
  valeur,
  options,
  onChange,
}: {
  label: string
  valeur: T
  options: { value: T; label: string; disabled?: boolean; title?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="min-w-0">
      <p className="text-[14px] font-medium text-soft">{label}</p>
      <div role="group" aria-label={label} className="mt-2 grid grid-cols-2 border border-edge">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            disabled={o.disabled}
            title={o.title}
            aria-pressed={valeur === o.value}
            className={`tap min-w-0 px-3 py-2.5 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
              valeur === o.value ? 'bg-ink text-field' : 'text-soft hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
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
    <div className={`flex flex-wrap items-center justify-between gap-3 border-l-[3px] bg-plate px-4 py-3 ${correct ? 'border-ink' : 'border-signal'}`}>
      <div className="min-w-0">
        <p className="text-[15px]">
          <span className={`font-semibold ${correct ? 'text-ink' : 'text-signal'}`}>{correct ? 'Juste.' : 'Manqué.'}</span>{' '}
          <button onClick={onOpen} className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            {t.name}
          </button>{' '}
          <span className="text-soft">— {t.translation}</span>
        </p>
        {due && <p className="mt-0.5 text-[13px] text-faint">Prochaine révision le {new Date(due).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>}
      </div>
      <button onClick={onNext} className="shrink-0 bg-ink px-4 py-2.5 text-[14px] font-semibold text-field transition hover:bg-soft">
        {last ? 'Voir le bilan' : 'Suivant →'}
      </button>
    </div>
  )
}
