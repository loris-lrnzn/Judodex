interface Props {
  title: string
  aside?: React.ReactNode
}

/** Titre de section, en mincho ; à droite, au besoin, un décompte ou une précision. */
export function SectionHead({ title, aside }: Props) {
  return (
    <div className="mb-6 flex min-w-0 items-baseline justify-between gap-4">
      <h2 className="font-jp min-w-0 text-[1.6rem] font-bold leading-tight">{title}</h2>
      {aside && <span className="shrink-0 text-[13px] tabular-nums text-faint">{aside}</span>}
    </div>
  )
}
