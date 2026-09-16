import { useState } from 'react'

/**
 * Façade YouTube : miniature statique, l'iframe n'est chargée qu'au clic.
 * Le bouton de lecture reprend le vocabulaire de la planche : un carré tracé,
 * pas une pastille.
 */
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false)
  return (
    <div className="plate relative aspect-video w-full overflow-hidden">
      {active ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setActive(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Lire la vidéo : ${title}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <span className="relative grid size-14 place-items-center border-2 border-signal bg-field text-signal transition group-hover:bg-signal group-hover:text-field">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
              <path d="M0 0l16 9-16 9z" />
            </svg>
          </span>
          <span className="annot absolute bottom-2 left-2 bg-ink px-1.5 py-0.5 text-field">Vidéo</span>
        </button>
      )}
    </div>
  )
}
