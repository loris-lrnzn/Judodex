import { useEffect, useRef } from 'react'
import { AnimatePresence, m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { FAMILY_META, familyVars, kanjiSize } from '../lib/families'
import { useFocusTrap, useScrollLock } from '../hooks/useUi'
import { BeltMark } from './BeltMark'
import { Seal } from './Seal'
import type { Technique } from '../types/judodex'

/*
 * Les pièces communes aux deux fenêtres de choix : la recherche, et le
 * sélecteur de techniques de « Mon judo ». Elles étaient écrites deux fois ;
 * elles le sont une, et les deux fenêtres se ressemblent au trait près.
 */

/** Identifiant de la liste, que le champ désigne comme ce qu'il pilote. */
export const LISTE_ID = 'palette-liste'
export const optionId = (slug: string) => `palette-${slug}`

/**
 * Le voile et la fenêtre. Le voile assombrit la page au lieu de la délaver :
 * ce qu'on cherche passe devant, le reste recule.
 */
export function Palette({
  open,
  label,
  onClose,
  children,
}: {
  open: boolean
  label: string
  onClose: () => void
  children: React.ReactNode
}) {
  const trap = useFocusTrap<HTMLDivElement>(open)
  useScrollLock(open)
  return (
    <AnimatePresence>
      {open && (
        <fm.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(3,14,9,0.72)] px-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-[3px] sm:px-4 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <fm.div
            ref={trap}
            role="dialog"
            aria-modal
            aria-label={label}
            initial={{ opacity: 0, y: -14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-[640px] flex-col overflow-hidden border border-edge bg-field shadow-[0_40px_120px_-24px_rgba(0,0,0,.85)] sm:max-h-[76vh]"
          >
            {/* Le trait vermillon des surtitres, en tête de la fenêtre. */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-signal" />
            {children}
          </fm.div>
        </fm.div>
      )}
    </AnimatePresence>
  )
}

function Loupe() {
  return (
    <svg viewBox="0 0 16 16" className="size-[18px] shrink-0 text-faint" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Le champ. La loupe dit ce qu'il fait, la croix l'efface, et « Échap »
 * ferme — un vrai bouton, qui sert aussi à qui n'a pas de clavier : sur
 * téléphone, il s'appelle « Fermer ».
 */
export function ChampRecherche({
  inputRef,
  value,
  onChange,
  onKeyDown,
  onClose,
  placeholder,
  label,
  actif,
  ouvert,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onClose: () => void
  placeholder: string
  label: string
  /** Option désignée au clavier. */
  actif?: string
  ouvert: boolean
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-rule pl-4 pr-2 sm:pl-5 sm:pr-3">
      <Loupe />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="champ-palette h-16 min-w-0 flex-1 appearance-none bg-transparent text-[18px] text-ink outline-none placeholder:text-[16px] placeholder:text-faint [&::-webkit-search-cancel-button]:appearance-none"
        type="search"
        role="combobox"
        aria-expanded={ouvert}
        aria-controls={LISTE_ID}
        aria-activedescendant={actif}
        aria-autocomplete="list"
        enterKeyHint="go"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label={label}
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Effacer la saisie"
          className="tap grid size-8 shrink-0 place-items-center text-faint transition hover:text-ink"
        >
          <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      )}
      <button
        onClick={onClose}
        className="tap inline-flex h-8 shrink-0 items-center px-1 text-[14px] font-medium text-soft hover:text-ink sm:px-0"
      >
        <span className="sm:hidden">Fermer</span>
        <kbd className="hidden border border-rule px-1.5 py-0.5 font-mono text-[11px] text-faint transition hover:border-edge hover:text-ink sm:block">
          Échap
        </kbd>
      </button>
    </div>
  )
}

/** Sans accents ni capitales, tirets et espaces confondus : un caractère pour un. */
const plier = (s: string) =>
  [...s].map((c) => (c === '-' || c === '_' ? ' ' : c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().charAt(0) || c)).join('')

/**
 * Ce qui a été tapé, montré dans le résultat. La recherche tolère les
 * approximations ; le surlignage ne marque que la correspondance exacte,
 * accents et tirets mis à part. Il ne la devine jamais.
 */
export function Surligne({ texte, requete }: { texte: string; requete: string }) {
  const q = plier(requete.trim())
  const i = q ? plier(texte).indexOf(q) : -1
  if (i < 0) return <>{texte}</>
  return (
    <>
      {texte.slice(0, i)}
      <mark className="bg-transparent text-inherit underline decoration-signal decoration-2 underline-offset-[3px]">{texte.slice(i, i + q.length)}</mark>
      {texte.slice(i + q.length)}
    </>
  )
}

/**
 * Une technique dans la liste. La ligne désignée porte le trait vermillon et
 * dit ce que fera la touche Entrée ; elle vient se montrer quand on la
 * désigne au clavier au lieu de sortir du cadre.
 */
export function LigneTechnique({
  t,
  dex,
  requete,
  actif,
  action,
  onChoisir,
  onSurvol,
}: {
  t: Technique
  dex: Judodex
  requete: string
  actif: boolean
  action: string
  onChoisir: () => void
  onSurvol: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (actif) ref.current?.scrollIntoView?.({ block: 'nearest' })
  }, [actif])
  const acquise = dex.getProgress(t.slug).mastery === 'mastered'

  return (
    <li role="presentation">
      <button
        ref={ref}
        id={optionId(t.slug)}
        role="option"
        aria-selected={actif}
        tabIndex={-1}
        onMouseMove={onSurvol}
        onClick={onChoisir}
        style={familyVars(t.family)}
        className={`relative flex w-full items-center gap-4 px-4 py-3 text-left transition-colors sm:px-5 ${actif ? 'bg-plate' : ''}`}
      >
        <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] bg-signal transition-opacity ${actif ? 'opacity-100' : 'opacity-0'}`} />
        <span
          lang="ja"
          className="font-jp w-[4.6rem] shrink-0 whitespace-nowrap font-bold leading-none text-(--fam)"
          style={{ fontSize: kanjiSize(t.kanji, 'row') }}
        >
          {t.kanji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-semibold leading-snug">
            <Surligne texte={t.name} requete={requete} />
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-faint">
            <Surligne texte={t.translation} requete={requete} />
            <span className="hidden sm:inline"> · {FAMILY_META[t.family].short}</span>
          </span>
        </span>
        {acquise && <Seal size={18} />}
        <BeltMark belt={dex.beltOfTechnique(t.slug)} width={20} height={6} />
        <kbd
          aria-hidden
          className={`hidden w-7 shrink-0 text-right font-mono text-[12px] text-faint transition-opacity sm:block [@media(pointer:coarse)]:hidden ${actif ? 'opacity-100' : 'opacity-0'}`}
          title={action}
        >
          ↵
        </kbd>
      </button>
    </li>
  )
}

/** L'aide clavier, qui n'a de sens qu'avec un clavier, et le décompte. */
export function PiedPalette({ action, compte }: { action: string; compte: string }) {
  return (
    <div className="flex shrink-0 items-center gap-5 border-t border-rule px-4 py-2.5 text-[13px] text-faint sm:px-5">
      <span className="hidden items-center gap-1.5 sm:flex [@media(pointer:coarse)]:hidden">
        <kbd className="border border-rule px-1 font-mono text-[11px]">↑</kbd>
        <kbd className="border border-rule px-1 font-mono text-[11px]">↓</kbd>
        naviguer
      </span>
      <span className="hidden items-center gap-1.5 sm:flex [@media(pointer:coarse)]:hidden">
        <kbd className="border border-rule px-1 font-mono text-[11px]">↵</kbd>
        {action}
      </span>
      <span className="ml-auto tabular-nums">{compte}</span>
    </div>
  )
}

/** Rien ne répond : on le dit, et on dit comment chercher autrement. */
export function Aucun({ requete }: { requete: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p lang="ja" aria-hidden className="font-jp text-5xl font-bold text-edge">無</p>
      <p className="mt-4 text-[15px] text-soft">
        Rien pour « <span className="text-ink">{requete.trim()}</span> ».
      </p>
      <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-faint">
        Essaie le nom japonais, ses idéogrammes, ou ce que fait la technique.
      </p>
    </div>
  )
}
