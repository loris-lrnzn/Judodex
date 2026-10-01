/**
 * La marque : le J noué. Une ceinture fait la barre du J, le nœud tient à
 * l'angle, et le pan qui pend dessine le fût et la boucle de la lettre. Elle
 * se lit sans connaître le japonais : on voit l'initiale et la ceinture.
 *
 * Dans l'application, la marque ne dépasse jamais une vingtaine de pixels :
 * c'est la version simplifiée, sans coutures, qui est dessinée ici. La
 * version détaillée, avec ses coutures, est celle de l'icône (public/icon.svg).
 */
export function JNoue({ className = '', reserve = 'field' }: { className?: string; reserve?: 'field' | 'plate' }) {
  // Les couleurs sont posées en style en ligne, pas par des classes : l'export
  // de la carte en image n'emporte pas la feuille de style, et une classe
  // laissait ici le J en noir. Les variables, elles, descendent de l'élément
  // racine, dont l'export recopie les propriétés.
  const signal = 'var(--color-signal)'
  return (
    <svg viewBox="60 76 336 380" aria-hidden className={`shrink-0 overflow-visible ${className}`}>
      <path d="M300 150V316A100 100 0 0 1 110 360" fill="none" strokeWidth="80" style={{ stroke: signal }} />
      <rect x="112" y="104" width="284" height="80" style={{ fill: signal }} />
      {/* Le nœud, détouré d'un trait couleur du fond qui le détache de la ceinture. */}
      <rect x="242" y="86" width="116" height="116" strokeWidth="20" style={{ fill: signal, stroke: `var(--color-${reserve})` }} />
    </svg>
  )
}

/**
 * Le nom de l'application, dont la marque fait le J. Le reste du mot peut se
 * retirer aux largeurs où la place manque ; la marque seule reste alors.
 * Les lecteurs d'écran entendent le nom entier, pas une lettre et un dessin.
 */
export function Signature({
  className = '',
  texteClassName = '',
  marqueClassName = '',
  reserve,
}: {
  className?: string
  texteClassName?: string
  marqueClassName?: string
  reserve?: 'field' | 'plate'
}) {
  return (
    <span className={`font-jp inline-flex items-baseline font-extrabold leading-none tracking-[-0.01em] ${className}`}>
      <span className="sr-only">Judodex</span>
      {/* Le bas de la boucle descend un peu sous la ligne de base, comme le
          J d'une capitale à empattements. */}
      <JNoue reserve={reserve} className={`h-[0.864em] w-[0.764em] translate-y-[0.07em] ${marqueClassName}`} />
      <span aria-hidden className={texteClassName}>
        udodex
      </span>
    </span>
  )
}
