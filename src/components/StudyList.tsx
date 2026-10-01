import { useState } from 'react'
import { YouTubeFacade } from './YouTubeFacade'
import type { StudySituation } from '../types/judodex'

interface Props {
  title: string
  items: StudySituation[]
  /** Niveau du titre : h4 sous une planche de l'accueil, h3 sous un h2 de page. */
  niveau?: 'h3' | 'h4'
}

/** Au-delà, la liste se replie : quatorze lignes d'un bloc écrasent la planche. */
const REPLI = 6

/**
 * Situations d'étude d'une planche. Ce ne sont pas des techniques imposées,
 * mais elles constituent l'essentiel du travail demandé, surtout au sol.
 * Chaque ligne déplie sa démonstration.
 */
export function StudyList({ title, items, niveau: Titre = 'h4' }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const [tout, setTout] = useState(false)
  if (items.length === 0) return null

  // Replier ne doit pas faire disparaître la démonstration qu'on regarde.
  const repliable = items.length > REPLI + 2
  const ouverte = items.findIndex((s) => s.id === open)
  const visibles = !repliable || tout ? items : items.slice(0, Math.max(REPLI, ouverte + 1))

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-edge pb-2">
        <Titre className="text-[15px] font-semibold">{title}</Titre>
        <span className="text-[13px] tabular-nums text-faint">{items.length}</span>
      </div>
      <ul>
        {visibles.map((s) => (
          <li key={s.id} className="border-b border-rule/60 last:border-0">
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              aria-expanded={open === s.id}
              className="group flex w-full min-w-0 items-center gap-3 py-2.5 text-left"
            >
              <span aria-hidden className="w-4 shrink-0 text-faint">{open === s.id ? '−' : '+'}</span>
              <span className="min-w-0 flex-1 text-[14.5px] leading-snug underline-offset-4 group-hover:underline">{s.label}</span>
            </button>
            {open === s.id && (
              <div className="pb-3">
                <YouTubeFacade id={s.id} title={s.label} bare />
              </div>
            )}
          </li>
        ))}
      </ul>
      {repliable && (tout || visibles.length < items.length) && (
        <button
          onClick={() => setTout((v) => !v)}
          aria-expanded={tout}
          className="tap mt-1 inline-flex items-center py-2 text-[14px] font-medium text-soft underline decoration-edge underline-offset-4 hover:text-ink hover:decoration-ink"
        >
          {tout ? 'Réduire la liste' : `Voir les ${items.length} situations`}
        </button>
      )}
    </div>
  )
}
