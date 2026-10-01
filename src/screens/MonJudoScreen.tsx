import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { Judodex } from '../hooks/useJudodex'
import { useMonJudo } from '../hooks/useMonJudo'
import { useProfil } from '../hooks/useProfil'
import { lire, type EtapeId } from '../lib/monjudo'
import { Surtitre } from '../components/Surtitre'
import { Cadre, Fil } from '../components/monjudo/pieces'
import { EtapeCoins, EtapeEntrees, EtapeReactions, EtapeSol, EtapeTechnique, EtapeToi, type EtapeProps } from '../components/monjudo/Etapes'
import { EtapeCarte } from '../components/monjudo/EtapeCarte'

const ETAPES_CONSTRUCTION = {
  toi: EtapeToi,
  technique: EtapeTechnique,
  coins: EtapeCoins,
  reactions: EtapeReactions,
  entrees: EtapeEntrees,
  sol: EtapeSol,
} as const

const SUIVANT: Partial<Record<EtapeId, string>> = {
  toi: 'C’est parti',
  sol: 'Voir ma carte',
}

/**
 * Mon judo, construit de A à Z.
 *
 * Rien n’y vient du reste du carnet : on ne part pas de ce qu’on a coché
 * ailleurs, on compose. Sept étapes, une question chacune, et la carte qui se
 * remplit à côté à chaque choix — c’est elle qu’on emporte à la fin.
 */
export function MonJudoScreen({ dex, onNotify }: { dex: Judodex; onNotify: (m: string) => void }) {
  const connue = useCallback((s: string) => dex.bySlug.has(s), [dex.bySlug])
  const api = useMonJudo(connue)
  const { corrections } = useProfil()
  const cat = useMemo(() => ({ techniques: dex.techniques, bySlug: dex.bySlug }), [dex.techniques, dex.bySlug])
  const l = useMemo(() => lire(api.mj, cat, corrections), [api.mj, cat, corrections])
  const etape = api.mj.courante

  // Changer d’étape ramène en haut : la question se lit avant la réponse.
  const premiere = useRef(true)
  useEffect(() => {
    if (premiere.current) {
      premiere.current = false
      return
    }
    window.scrollTo({ top: 0 })
  }, [etape])

  const Etape = etape === 'carte' ? null : ETAPES_CONSTRUCTION[etape]
  const props: EtapeProps = { api, l, dex, corrections }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-7">
      <div className="non-imprime">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-6 sm:pt-14">
          <Surtitre>Mon judo</Surtitre>
          <span className="ml-auto hidden text-[13px] text-faint sm:inline">Construit de A à Z, rangé à part de ton carnet</span>
        </div>
        <div className="mt-4">
          <Fil courante={etape} vue={api.vue} aller={api.aller} />
        </div>
      </div>

      {Etape ? (
        <Cadre key={etape} id={etape} mj={api.mj} l={l} onPrecedente={api.precedente} onSuivante={api.suivante} suivant={SUIVANT[etape]}>
          <Etape {...props} />
        </Cadre>
      ) : (
        <EtapeCarte api={api} l={l} onNotify={onNotify} />
      )}
    </div>
  )
}

export default MonJudoScreen
