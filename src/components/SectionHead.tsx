interface Props {
  title: string
  jp: string
  aside?: React.ReactNode
}

/** Titre de section : intitulé, nom japonais, filet de raccord. */
export function SectionHead({ title, jp, aside }: Props) {
  return (
    <div className="mb-6 flex min-w-0 items-center gap-3">
      <h2 className="min-w-0 text-[13px] font-semibold uppercase tracking-[0.14em]">{title}</h2>
      <span className="font-jp whitespace-nowrap text-[13px] text-faint">{jp}</span>
      <span className="h-px min-w-3 flex-1 bg-rule" />
      {aside && <span className="annot hidden whitespace-nowrap text-faint sm:inline">{aside}</span>}
    </div>
  )
}
