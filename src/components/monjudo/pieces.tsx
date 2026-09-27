import { useEffect, useRef } from 'react'
import type { Technique } from '../../types/judodex'
import { familyVars, kanjiSize } from '../../lib/families'
import { ETAPES, etapeMeta, indexEtape, jauges, type EtapeId, type Lecture, type MonJudo, type Suggestion } from '../../lib/monjudo'
import { CarteJudo } from './CarteJudo'

/**
 * Une technique qu’on prend ou qu’on laisse. Le nom japonais porte la
 * famille, la ligne du dessous dit pourquoi elle est proposée ; une fois
 * prise, la tuile passe en négatif et le dit d’un ✓.
 */
export function Tuile({
  t,
  raison,
  attestee,
  choisie,
  note,
  onClick,
  disabled,
}: {
  t: Technique
  raison?: string
  attestee?: boolean
  choisie: boolean
  /** Précision à droite : le coin, « autre coin »… */
  note?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={choisie}
      style={familyVars(t.family)}
      className={`group relative flex w-full min-w-0 items-center gap-3 border px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-35 ${
        choisie ? 'border-ink bg-ink text-field' : 'border-edge bg-plate/40 hover:border-ink hover:bg-plate'
      }`}
    >
      <span
        lang="ja"
        className={`font-jp w-[4.2rem] shrink-0 whitespace-nowrap font-bold leading-none ${choisie ? 'text-field' : 'text-(--fam)'}`}
        style={{ fontSize: kanjiSize(t.kanji, 'row') }}
      >
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-snug">{t.name}</span>
        {raison && (
          <span className={`mt-0.5 line-clamp-2 block text-[12.5px] leading-snug ${choisie ? 'text-field/75' : 'text-faint'}`}>
            {attestee && <span className={choisie ? '' : 'text-soft'}>● </span>}
            {raison}
          </span>
        )}
      </span>
      {note && <span className={`hidden shrink-0 text-[12px] sm:block ${choisie ? 'text-field/75' : 'text-faint'}`}>{note}</span>}
      <span
        aria-hidden
        className={`grid size-6 shrink-0 place-items-center border text-[13px] font-bold transition ${
          choisie ? 'border-field/40 text-field' : 'border-edge text-transparent group-hover:text-faint'
        }`}
      >
        {choisie ? '✓' : '+'}
      </span>
    </button>
  )
}

/** Une liste de suggestions, avec la légende de ce qui vient du catalogue. */
export function Suggestions({
  liste,
  choisie,
  onChoisir,
  note,
  vide,
  limite = 8,
  plein,
}: {
  liste: Suggestion[]
  choisie: (slug: string) => boolean
  onChoisir: (t: Technique) => void
  note?: (t: Technique) => string | undefined
  vide: string
  limite?: number
  /** Quand la place est prise, on ne peut plus qu’enlever. */
  plein?: boolean
}) {
  if (liste.length === 0) return <p className="border border-dashed border-edge px-4 py-5 text-[14px] text-faint">{vide}</p>
  const attestees = liste.some((x) => x.attestee)
  return (
    <div>
      <ul className="grid gap-1.5">
        {liste.slice(0, limite).map((x) => (
          <li key={x.t.slug}>
            <Tuile
              t={x.t}
              raison={x.raison}
              attestee={x.attestee}
              choisie={choisie(x.t.slug)}
              note={note?.(x.t)}
              disabled={plein && !choisie(x.t.slug)}
              onClick={() => onChoisir(x.t)}
            />
          </li>
        ))}
      </ul>
      {attestees && <p className="mt-2 text-[12.5px] text-faint">● relié par le catalogue à ce que tu as déjà choisi</p>}
    </div>
  )
}

/**
 * Le geste libre : aller chercher n’importe quelle technique. Il se présente
 * comme un champ de recherche, en tête de liste — c’est là qu’on le cherche,
 * pas sous huit suggestions.
 */
export function Libre({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap mb-3 mt-4 flex h-12 w-full min-w-0 items-center gap-3 border border-edge bg-field/60 px-4 text-left text-[15px] text-faint transition hover:border-ink hover:text-soft"
    >
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" strokeLinecap="round" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="hidden shrink-0 text-[12.5px] sm:inline">tout le catalogue</span>
    </button>
  )
}

/** Le fil des sept étapes : on peut sauter de l’une à l’autre, rien n’est verrouillé. */
export function Fil({ courante, vue, aller }: { courante: EtapeId; vue: (id: EtapeId) => boolean; aller: (id: EtapeId) => void }) {
  const rail = useRef<HTMLOListElement>(null)
  useEffect(() => {
    rail.current?.querySelector('[aria-current="step"]')?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [courante])
  return (
    <nav aria-label="Étapes de Mon judo" className="border-b border-rule">
      <ol ref={rail} className="rail-x flex min-w-0 gap-1 overflow-x-auto">
        {ETAPES.map((e, n) => {
          const active = e.id === courante
          const faite = vue(e.id) && !active
          return (
            <li key={e.id} className="shrink-0 lg:min-w-0 lg:flex-1">
              <button
                onClick={() => aller(e.id)}
                aria-current={active ? 'step' : undefined}
                className={`group relative flex h-12 w-full min-w-0 items-center gap-2 pr-4 text-left transition-colors lg:pr-1 ${
                  active ? 'text-ink' : faite ? 'text-soft hover:text-ink' : 'text-faint hover:text-soft'
                }`}
              >
                <span
                  aria-hidden
                  className={`grid size-6 shrink-0 place-items-center text-[12px] font-semibold tabular-nums transition-colors ${
                    active ? 'bg-signal text-field' : faite ? 'bg-ink/85 text-field' : 'border border-edge'
                  }`}
                >
                  {faite ? '✓' : n + 1}
                </span>
                <span className="min-w-0 whitespace-nowrap text-[13.5px] font-medium lg:truncate">{e.titre}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-0 bottom-0 h-[3px] transition-transform duration-200 ${
                    active ? 'scale-x-100 bg-signal' : 'scale-x-0 bg-edge group-hover:scale-x-100'
                  }`}
                  style={{ transformOrigin: 'left' }}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Le cadre d’une étape : sa question, ce qu’elle sert à établir, son contenu,
 * et à côté la carte qui se remplit. Sur téléphone, la carte se résume en une
 * ligne de jauges, et la barre d’avancement reste sous le pouce.
 */
export function Cadre({
  id,
  mj,
  l,
  onPrecedente,
  onSuivante,
  suivant,
  children,
}: {
  id: EtapeId
  mj: MonJudo
  l: Lecture
  onPrecedente: () => void
  onSuivante: () => void
  suivant?: string
  children: React.ReactNode
}) {
  const meta = etapeMeta(id)
  const i = indexEtape(id)
  return (
    <section aria-labelledby={`etape-${id}`} className="grid gap-x-12 pt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:pt-10">
      <div className="min-w-0">
        <p className="monte text-[13px] tabular-nums text-faint">
          Étape {i + 1} sur {ETAPES.length}
        </p>
        <h1
          id={`etape-${id}`}
          className="font-jp monte mt-3 text-[clamp(2rem,6vw,3rem)] font-extrabold leading-[1.08] [text-wrap:balance]"
          style={{ '--d': '60ms' } as React.CSSProperties}
        >
          {meta.question}
        </h1>
        <p className="monte mt-3 max-w-xl text-[16px] leading-[1.65] text-soft" style={{ '--d': '120ms' } as React.CSSProperties}>
          {meta.but}
        </p>

        {/* Sur téléphone, la carte se lit en une ligne. */}
        <dl className="mt-5 grid grid-cols-4 gap-2 border-y border-rule py-2.5 lg:hidden">
          {jauges(l).map((j) => (
            <div key={j.id} className="min-w-0">
              <dt className="truncate text-[11px] text-faint">{j.label}</dt>
              <dd className="text-[14px] font-semibold tabular-nums">
                {j.n}
                <span className="text-[11px] font-normal text-faint">/{j.sur}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="monte mt-7" style={{ '--d': '180ms' } as React.CSSProperties}>
          {children}
        </div>

        <div className="sticky bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 -mx-4 mt-10 flex items-center gap-3 border-t border-rule bg-field/95 px-4 py-3 backdrop-blur sm:bottom-0 sm:mx-0 sm:px-0">
          {i > 0 && (
            <button
              onClick={onPrecedente}
              className="tap inline-flex items-center px-1 py-2.5 text-[14px] font-medium text-soft underline decoration-edge underline-offset-4 transition hover:text-ink hover:decoration-ink"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={onSuivante}
            className="tap group ml-auto inline-flex items-center gap-2 bg-signal px-6 py-3 text-[15px] font-semibold text-field transition hover:brightness-110"
          >
            {suivant ?? 'Continuer'}
            <span aria-hidden className="vector-push">→</span>
          </button>
        </div>
      </div>

      {/* La carte se remplit à mesure : c’est elle qu’on construit. */}
      <aside aria-label="Ta carte, en construction" className="hidden lg:block">
        <div className="sticky top-20">
          <p className="mb-2 text-[13px] text-faint">Ta carte se remplit</p>
          <CarteJudo mj={mj} l={l} variante="apercu" />
        </div>
      </aside>
    </section>
  )
}
