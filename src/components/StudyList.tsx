import { useState } from 'react'
import { YouTubeFacade } from './YouTubeFacade'
import type { StudySituation } from '../types/judodex'

interface Props {
  title: string
  jp: string
  items: StudySituation[]
}

/**
 * Situations d'étude d'une planche. Ce ne sont pas des techniques imposées,
 * mais elles constituent l'essentiel du travail demandé, surtout au sol.
 * Chaque ligne déplie sa démonstration.
 */
export function StudyList({ title, jp, items }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  if (items.length === 0) return null

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-2.5 border-b border-ink pb-2">
        <span className="annot">{title}</span>
        <span className="font-jp text-[12px] text-faint">{jp}</span>
        <span className="annot ml-auto text-faint">{items.length}</span>
      </div>
      <ul>
        {items.map((s) => (
          <li key={s.id} className="border-b border-rule/60 last:border-0">
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              aria-expanded={open === s.id}
              className="group flex w-full min-w-0 items-center gap-3 py-2.5 text-left transition-colors hover:text-signal"
            >
              <span className="annot w-4 shrink-0 text-faint">{open === s.id ? '−' : '+'}</span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug">{s.label}</span>
            </button>
            {open === s.id && (
              <div className="pb-3">
                <YouTubeFacade id={s.id} title={s.label} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
