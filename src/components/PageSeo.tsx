import { Link } from './Link'
import { familyVars, kanjiSize } from '../lib/families'
import type { Route } from '../hooks/useRoute'
import type { Technique } from '../types/judodex'

/** Fil d'Ariane visible : le même que celui que la page déclare aux moteurs. */
export function Fil({ elements }: { elements: { label: string; to?: Route }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-2 pt-3 text-[13px] text-faint">
      {elements.map((e, i) => (
        <span key={e.label} className="flex items-center gap-x-2">
          {i > 0 && <span aria-hidden>›</span>}
          {e.to ? (
            <Link to={e.to} className="tap inline-flex items-center py-2 hover:text-ink">
              {e.label}
            </Link>
          ) : (
            <span>{e.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/**
 * Questions et réponses, écrites en clair sur la page : ce sont celles que la
 * page déclare dans ses données structurées, et un moteur n'en retient que ce
 * qu'un lecteur peut voir.
 */
export function Faq({ titre = 'Questions fréquentes', questions }: { titre?: string; questions: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq" className="border-t border-rule py-12">
      <h2 id="faq" className="font-jp mb-6 text-[1.6rem] font-bold leading-tight">
        {titre}
      </h2>
      <dl className="grid max-w-3xl gap-8">
        {questions.map(({ q, a }) => (
          <div key={q}>
            <dt className="text-[16px] font-semibold leading-snug">{q}</dt>
            <dd className="mt-2 text-[15px] leading-[1.7] text-soft">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Une technique en ligne : l'idéogramme à la teinte de sa famille, le nom, le sens. */
export function LigneTechnique({ t, note }: { t: Technique; note?: React.ReactNode }) {
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="group flex min-w-0 items-start gap-4 border-t border-rule py-3.5"
    >
      <span lang="ja" className="font-jp mt-0.5 w-[4.6rem] shrink-0 whitespace-nowrap leading-none text-(--fam)" style={{ fontSize: kanjiSize(t.kanji, 'row') }}>
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug underline-offset-4 group-hover:underline">{t.name}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-faint">{t.translation}</span>
      </span>
      {note && <span className="mt-0.5 shrink-0 text-[13px] text-faint">{note}</span>}
      <span aria-hidden className="vector-push mt-0.5 text-faint group-hover:text-ink">→</span>
    </Link>
  )
}
