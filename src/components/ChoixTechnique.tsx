import { useEffect, useMemo, useRef, useState } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { Aucun, ChampRecherche, LISTE_ID, LigneTechnique, Palette, PiedPalette, optionId } from './Palette'
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

  const cherche = query.trim().length > 0

  return (
    <Palette open={open} label={titre} onClose={onClose}>
      <div className="flex shrink-0 items-baseline gap-3 px-4 pt-4 sm:px-5">
        <span className="font-jp text-[1.2rem] font-bold leading-tight">{titre}</span>
        <span className="ml-auto shrink-0 text-[13px] tabular-nums text-faint">{resultats.length} au choix</span>
      </div>

      <ChampRecherche
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onKeyDown={onKeyDown}
        onClose={onClose}
        placeholder="Chercher dans tout le catalogue…"
        label="Chercher une technique"
        actif={resultats[cursor] ? optionId(resultats[cursor].slug) : undefined}
        ouvert={resultats.length > 0}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!cherche && aide && <p className="px-4 pb-1 pt-3.5 text-[13px] leading-relaxed text-faint sm:px-5">{aide}</p>}
        {resultats.length === 0 ? (
          cherche ? (
            <Aucun requete={query} />
          ) : (
            <p className="px-5 py-10 text-center text-[14px] text-faint">Tout est déjà là.</p>
          )
        ) : (
          <ul id={LISTE_ID} role="listbox" aria-label="Techniques" className="pb-1.5">
            {resultats.map((t, i) => (
              <LigneTechnique
                key={t.slug}
                t={t}
                dex={dex}
                requete={query}
                actif={i === cursor}
                action="ajouter"
                onChoisir={() => choisir(t)}
                onSurvol={() => setCursor(i)}
              />
            ))}
          </ul>
        )}
      </div>

      <PiedPalette action="ajouter" compte={`${resultats.length} technique${resultats.length > 1 ? 's' : ''}`} />
    </Palette>
  )
}
