import { useEffect, useMemo, useRef, useState } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import type { Technique } from '../types/judodex'
import { Aucun, ChampRecherche, LISTE_ID, LigneTechnique, Palette, PiedPalette, optionId } from './Palette'

interface Props {
  open: boolean
  dex: Judodex
  onClose: () => void
  onSelect: (slug: string) => void
}

/**
 * Trois façons de chercher, données en exemple : le nom, les idéogrammes, le
 * geste. Sans elles, rien ne dit qu'on peut taper « balayage » et trouver
 * de-ashi-barai.
 */
const EXEMPLES = [
  { requete: 'seoi', sens: 'un nom' },
  { requete: '大外', sens: 'des kanji' },
  { requete: 'balayage', sens: 'un geste' },
]

/**
 * Recherche en surcouche, ouverte par « / » ou Ctrl+K. Elle remplace la barre
 * de filtres permanente : rien n'occupe l'écran tant qu'on ne cherche pas.
 */
export function CommandPalette({ open, dex, onClose, onSelect }: Props) {
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

  const results = useMemo<Technique[]>(() => (query.trim() ? dex.search(query, 20) : dex.suggestions.slice(0, 5)), [query, dex])

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

  const cherche = query.trim().length > 0

  return (
    <Palette open={open} label="Rechercher une technique" onClose={onClose}>
      <ChampRecherche
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onKeyDown={onKeyDown}
        onClose={onClose}
        placeholder="Nom, kanji, traduction, geste…"
        label="Rechercher"
        actif={results[cursor] ? optionId(results[cursor].slug) : undefined}
        ouvert={results.length > 0}
      />

      {!cherche && (
        <div className="shrink-0 border-b border-rule px-4 py-3.5 sm:px-5">
          <p className="text-[13px] text-faint">Cherche par…</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXEMPLES.map((x) => (
              <button
                key={x.requete}
                onClick={() => {
                  setQuery(x.requete)
                  inputRef.current?.focus()
                }}
                className="tap inline-flex items-baseline gap-2 border border-edge px-3 py-1.5 text-[14px] transition hover:border-ink"
              >
                <span className={`font-medium text-ink ${/[぀-鿿]/.test(x.requete) ? 'font-jp' : ''}`}>{x.requete}</span>
                <span className="text-[12.5px] text-faint">{x.sens}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div tabIndex={0} aria-label="Résultats de la recherche" role="region" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!cherche && <p className="px-4 pb-1 pt-3.5 text-[13px] text-faint sm:px-5">Pour débuter</p>}
        {cherche && results.length === 0 ? (
          <Aucun requete={query} />
        ) : (
          <ul id={LISTE_ID} role="listbox" aria-label="Techniques" className="pb-1.5">
            {results.map((t, i) => (
              <LigneTechnique
                key={t.slug}
                t={t}
                dex={dex}
                requete={query}
                actif={i === cursor}
                action="ouvrir la fiche"
                onChoisir={() => choose(t)}
                onSurvol={() => setCursor(i)}
              />
            ))}
          </ul>
        )}
      </div>

      <PiedPalette
        action="ouvrir"
        compte={cherche ? `${results.length} résultat${results.length > 1 ? 's' : ''}` : `${dex.techniques.length} techniques`}
      />
    </Palette>
  )
}
