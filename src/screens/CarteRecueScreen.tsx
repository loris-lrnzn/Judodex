import { useMemo, useRef } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { decoder, lire } from '../lib/monjudo'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { CarteJudo } from '../components/monjudo/CarteJudo'
import { ActionsCarte } from '../components/monjudo/EtapeCarte'

/**
 * Une carte reçue par lien. Elle tient entière dans l’adresse : on la lit,
 * on la montre, et on invite à construire la sienne. Elle ne touche pas à la
 * carte de celui qui l’ouvre.
 */
export function CarteRecueScreen({ code, dex, onNotify }: { code: string; dex: Judodex; onNotify: (m: string) => void }) {
  const carte = useRef<HTMLDivElement>(null)
  const mj = useMemo(() => decoder(code, (s) => dex.bySlug.has(s)), [code, dex.bySlug])
  const l = useMemo(() => (mj ? lire(mj, { techniques: dex.techniques, bySlug: dex.bySlug }) : null), [mj, dex])

  if (!mj || !l)
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-7">
        <Surtitre>Carte de judo</Surtitre>
        <h1 className="display mt-5">Cette carte ne se lit pas.</h1>
        <p className="mt-5 max-w-lg text-[15px] leading-[1.7] text-soft">Le lien a peut-être été coupé en route. Demande-le de nouveau, ou construis ta propre carte.</p>
        <Link to={{ name: 'profil' }} className="tap mt-8 inline-flex bg-signal px-6 py-3.5 text-[15px] font-semibold text-field">
          Construire mon judo →
        </Link>
      </div>
    )

  const titre = mj.prenom ? `Le judo de ${mj.prenom}` : 'Une carte de judo'
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="non-imprime pt-6 sm:pt-14">
        <Surtitre>Carte partagée</Surtitre>
        <h1 className="display mt-4">{titre}</h1>
      </div>
      <div className="mt-8 grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div ref={carte} className="min-w-0 bg-field">
          <CarteJudo mj={mj} l={l} />
        </div>
        <div className="non-imprime lg:sticky lg:top-20">
          <p className="text-[15px] leading-relaxed text-soft">
            Une technique, quatre coins, ce qu’on fait quand uke résiste, d’où l’on part et comment on finit au sol. Construire le tien prend cinq minutes.
          </p>
          <Link to={{ name: 'profil' }} className="tap group mt-5 inline-flex items-center gap-2 bg-signal px-6 py-3.5 text-[15px] font-semibold text-field hover:brightness-110">
            Construire mon judo
            <span aria-hidden className="vector-push">→</span>
          </Link>
          <div className="mt-8">
            <ActionsCarte carte={carte} nomFichier="carte-de-judo" titre={titre} onNotify={onNotify} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarteRecueScreen
