/**
 * Surtitre de page : un trait vermillon et quelques mots, au-dessus du grand
 * titre. Chaque page s'ouvre ainsi, pour qu'on sache où l'on est avant même
 * de lire le titre.
 */
export function Surtitre({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-[14px] font-medium text-soft ${className}`}>
      <span aria-hidden className="h-px w-8 shrink-0 bg-signal" />
      {children}
    </p>
  )
}
