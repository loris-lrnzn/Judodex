import { useRef, useState } from 'react'
import type { MonJudoApi } from '../../hooks/useMonJudo'
import { encoder, etapeMeta, priorites, type Lecture } from '../../lib/monjudo'
import { partagerLien, telechargerCarte } from '../../lib/exportCarte'
import { CarteJudo } from './CarteJudo'

/** Les trois façons de sortir la carte de l’écran. */
export function ActionsCarte({
  carte,
  nomFichier,
  lien,
  titre,
  onNotify,
}: {
  carte: React.RefObject<HTMLDivElement | null>
  nomFichier: string
  /** Absent pour une carte reçue : on ne repartage pas celle d’un autre. */
  lien?: string
  titre: string
  onNotify: (m: string) => void
}) {
  const [image, setImage] = useState(false)
  const bouton = 'tap inline-flex items-center justify-center gap-2 px-5 py-3 text-[15px] font-semibold transition'
  return (
    <div className="non-imprime flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button
        disabled={image}
        onClick={async () => {
          if (!carte.current) return
          setImage(true)
          try {
            await telechargerCarte(carte.current, nomFichier)
            onNotify('Image enregistrée')
          } catch {
            onNotify('L’image n’a pas pu être créée')
          } finally {
            setImage(false)
          }
        }}
        className={`${bouton} bg-signal text-field hover:brightness-110 disabled:opacity-60`}
      >
        {image ? 'Préparation de l’image…' : 'Télécharger l’image'}
      </button>
      {lien && (
        <button
          onClick={async () => {
            const fait = await partagerLien(lien, titre)
            if (fait === 'copie') onNotify('Lien copié : il rouvre ta carte telle quelle')
            if (fait === 'echec') onNotify('Le lien n’a pas pu être copié')
          }}
          className={`${bouton} border border-edge hover:border-ink`}
        >
          Partager le lien
        </button>
      )}
      <button onClick={() => window.print()} className={`${bouton} border border-edge hover:border-ink`}>
        Imprimer
      </button>
    </div>
  )
}

export function EtapeCarte({ api, l, onNotify }: { api: MonJudoApi; l: Lecture; onNotify: (m: string) => void }) {
  const { mj } = api
  const carte = useRef<HTMLDivElement>(null)
  const aFaire = priorites(l)
  const lien = `${window.location.origin}/mon-judo/carte/${encoder(mj)}`
  const nom = mj.prenom ? `judo-de-${mj.prenom.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}` : 'mon-judo'

  return (
    <section aria-labelledby="etape-carte" className="pt-8 lg:pt-10">
      <div className="non-imprime">
        <p className="monte text-[13px] tabular-nums text-faint">Étape 7 sur 7</p>
        <h1 id="etape-carte" className="font-jp monte mt-3 text-[clamp(2rem,6vw,3rem)] font-extrabold leading-[1.08]" style={{ '--d': '60ms' } as React.CSSProperties}>
          {etapeMeta('carte').question}
        </h1>
        <p className="monte mt-3 max-w-xl text-[16px] leading-[1.65] text-soft" style={{ '--d': '120ms' } as React.CSSProperties}>
          {etapeMeta('carte').but}
        </p>
      </div>

      <div className="mt-8 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div ref={carte} className="monte min-w-0 bg-field" style={{ '--d': '180ms' } as React.CSSProperties}>
          <CarteJudo mj={mj} l={l} />
        </div>

        <div className="non-imprime min-w-0 lg:sticky lg:top-20">
          <ActionsCarte carte={carte} nomFichier={nom} lien={lien} titre={mj.prenom ? `Le judo de ${mj.prenom}` : 'Mon judo'} onNotify={onNotify} />

          {/* Jamais plus de trois : une liste de dix manques n’en fait traiter aucun. */}
          <div className="mt-9">
            <h2 className="font-jp text-[1.35rem] font-bold">{aFaire.length ? 'À travailler en priorité' : 'Rien ne manque'}</h2>
            {aFaire.length ? (
              <ol className="mt-3 space-y-2">
                {aFaire.map((p, i) => (
                  <li key={p.titre}>
                    <button onClick={() => api.aller(p.etape)} className="group flex w-full min-w-0 gap-3 border border-edge p-3.5 text-left transition hover:border-ink">
                      <span className="font-jp shrink-0 text-[1.4rem] font-bold leading-none text-signal">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-semibold leading-snug underline-offset-4 group-hover:underline">{p.titre}</span>
                        <span className="mt-1 block text-[13px] leading-snug text-faint">{p.texte}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-[14px] leading-relaxed text-soft">
                Quatre coins, une réponse à chaque réaction, une entrée dans chaque situation et une finition au sol. Le travail porte maintenant sur la
                qualité de ce que tu as construit.
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tout reprendre à zéro ? Ta carte actuelle sera effacée ; le reste du carnet n’est pas touché.')) api.recommencer()
            }}
            className="tap mt-8 inline-flex items-center text-[13.5px] text-faint underline decoration-rule underline-offset-4 hover:text-signal"
          >
            Recommencer de zéro
          </button>
        </div>
      </div>
    </section>
  )
}
