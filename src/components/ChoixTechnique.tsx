import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { FAMILY_META, familyVars } from '../lib/families'
import { useFocusTrap, useScrollLock } from '../hooks/useUi'
import { BeltMark } from './BeltMark'
import type { Technique } from '../types/judodex'

interface Props {
  open: boolean
  dex: Judodex
  /** Intitulé de ce qu'on choisit, par exemple « Ajouter à l'avant droit ». */
  titre: string
  /** Ligne d'explication sous le titre, quand le choix demande un mot. */
  aide?: string
  /**
   * Techniques proposées avant toute frappe : le rayon pertinent du catalogue.
   * La recherche, elle, porte sur tout le catalogue moins les exclues.
   */
  proposees: Technique[]
  /** Techniques déjà présentes : elles ne se proposent pas deux fois. */
  exclues?: Set<string>
  onChoisir: (t: Technique) => void
  onClose: () => void
}

/**
 * Le choix d'une technique, sur le modèle de la recherche.
 *
 * Les listes proposées d'après le catalogue couvrent le cas ordinaire ; celui
 * qui veut un judo qui n'est dans aucune liste doit pouvoir aller le chercher
 * lui-même. D'où ce sélecteur : il s'ouvre sur la proposition, mais la barre
 * de recherche donne accès à tout.
 */
export function ChoixTechnique({ open, dex, titre, aide, proposees, exclues, onChoisir, onClose }: Props) {
  const trap = useFocusTrap<HTMLDivElement>(open)
  useScrollLock(open)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    window.setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

  const garder = (t: Technique) => !exclues?.has(t.slug)

  const resultats = useMemo<Technique[]>(
    () => (query.trim() ? dex.search(query, 30).filter(garder) : proposees.filter(garder)),
    [query, dex, proposees, exclues],
  )

  useEffect(() => setCursor(0), [query])

  const choisir = (t: Technique) => {
    onChoisir(t)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(resultats.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + resultats.length) % Math.max(resultats.length, 1))
    } else if (e.key === 'Enter' && resultats[cursor]) {
      e.preventDefault()
      choisir(resultats[cursor])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <fm.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[10vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <fm.div
            ref={trap}
            role="dialog"
            aria-modal
            aria-label={titre}
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden border border-ink bg-field shadow-[0_30px_80px_-30px_rgba(0,0,0,.55)]"
          >
            <div className="flex items-center gap-2 bg-ink px-3 py-1.5 text-field">
              <span className="font-mono text-[10px] opacity-60">＋</span>
              <span className="text-[13px] font-bold tracking-wide">{titre.toUpperCase()}</span>
              <span className="ml-auto font-mono text-[10px] opacity-60">{resultats.length} au choix</span>
            </div>

            <div className="flex items-center gap-3 border-b border-ink px-4">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Chercher dans tout le catalogue…"
                className="font-jp h-14 flex-1 appearance-none bg-transparent text-[17px] outline-none placeholder:font-sans placeholder:text-[14px] placeholder:text-faint"
                type="search"
                enterKeyHint="go"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Chercher une technique"
              />
              <kbd className="hidden border border-rule px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">esc</kbd>
            </div>

            {!query && aide && <p className="annot px-4 pt-3 leading-relaxed text-faint">{aide}</p>}

            <ul className="max-h-[46svh] overflow-y-auto overscroll-contain p-1.5 sm:max-h-[52vh]">
              {resultats.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-faint">
                  {query ? 'Aucune technique trouvée.' : 'Tout est déjà là.'}
                </li>
              )}
              {resultats.map((t, i) => (
                <li key={t.slug}>
                  <button
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choisir(t)}
                    style={familyVars(t.family)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${i === cursor ? 'bg-ink text-field' : ''}`}
                  >
                    <span className={`font-jp w-9 shrink-0 text-center text-xl leading-none ${i === cursor ? 'text-(--fam-lite)' : 'text-(--fam)'}`}>
                      {t.kanji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-jp block truncate text-sm font-bold">{t.name}</span>
                      <span className={`block truncate text-[11px] ${i === cursor ? 'text-field/60' : 'text-faint'}`}>
                        {t.translation} · {FAMILY_META[t.family].label}
                      </span>
                    </span>
                    <BeltMark belt={dex.beltOfTechnique(t.slug)} width={20} height={6} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="annot flex items-center gap-5 border-t border-rule px-4 py-2.5 text-faint">
              <span>↑↓ naviguer</span>
              <span>↵ ajouter</span>
            </div>
          </fm.div>
        </fm.div>
      )}
    </AnimatePresence>
  )
}
