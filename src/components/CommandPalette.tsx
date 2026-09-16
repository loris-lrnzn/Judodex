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
  onClose: () => void
  onSelect: (slug: string) => void
}

/**
 * Recherche en surcouche, ouverte par « / » ou Ctrl+K. Elle remplace la barre
 * de filtres permanente : rien n'occupe l'écran tant qu'on ne cherche pas.
 */
export function CommandPalette({ open, dex, onClose, onSelect }: Props) {
  const trap = useFocusTrap<HTMLDivElement>(open)
  useScrollLock(open)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  const results = useMemo<Technique[]>(() => (query.trim() ? dex.search(query, 8) : dex.suggestions.slice(0, 5)), [query, dex])

  useEffect(() => setCursor(0), [query])

  const choose = (t: Technique) => {
    onSelect(t.slug)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault()
      choose(results[cursor])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <fm.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[6vh] backdrop-blur-[2px] sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <fm.div
            ref={trap}
            role="dialog"
            aria-modal
            aria-label="Rechercher une technique"
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden border border-ink bg-field shadow-[0_30px_80px_-30px_rgba(0,0,0,.55)]"
          >
            <div className="bg-ink text-field flex items-center gap-2 px-3 py-1.5">
              <span className="font-mono text-[10px] opacity-60">⌕</span>
              <span className="font-jp text-[13px] font-bold tracking-wide">RECHERCHE</span>
              <span className="font-jp text-[12px] opacity-70">検索</span>
              <span className="ml-auto font-mono text-[10px] opacity-60">{dex.techniques.length} entrées</span>
            </div>

            <div className="flex items-center gap-3 border-b border-ink px-4">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nom, kanji, traduction, geste…"
                className="font-jp h-14 flex-1 appearance-none bg-transparent text-[17px] outline-none placeholder:font-sans placeholder:text-[14px] placeholder:text-faint"
                type="search"
                enterKeyHint="go"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Rechercher"
              />
              <kbd className="hidden border border-rule px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">esc</kbd>
            </div>

            {!query && <p className="annot px-4 pt-3 text-faint">Suggestions pour débuter</p>}

            <ul className="max-h-[46svh] overflow-y-auto overscroll-contain p-1.5 sm:max-h-[52vh]">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-faint">Aucune technique trouvée.</li>}
              {results.map((t, i) => (
                <li key={t.slug}>
                  <button
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(t)}
                    style={familyVars(t.family)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${i === cursor ? 'bg-ink text-field' : ''}`}
                  >
                    <span className={`font-jp w-9 shrink-0 text-center text-xl leading-none ${i === cursor ? 'text-(--fam-lite)' : 'text-(--fam)'}`}>{t.kanji}</span>
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
              <span>↵ ouvrir</span>
            </div>
          </fm.div>
        </fm.div>
      )}
    </AnimatePresence>
  )
}
