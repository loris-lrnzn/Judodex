import { Suspense } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ecran } from '../lib/ecrans'

const Bonjour = ({ nom }: { nom: string }) => <p>Bonjour {nom}</p>

describe('écran chargé à la demande', () => {
  it('suspend tant que son code n’est pas là', () => {
    const E = ecran(() => new Promise<typeof Bonjour>(() => {}))
    const html = renderToString(
      <Suspense fallback="REPLI">
        <E nom="Loris" />
      </Suspense>,
    )
    expect(html).toContain('REPLI')
  })

  it('se rend d’un seul coup, sans repli, une fois préchargé', async () => {
    // C'est ce qui évitait le décalage de 0,49 au démarrage : la page prérendue
    // ne doit pas disparaître derrière « Chargement… » quand le code est déjà là.
    const E = ecran(() => Promise.resolve(Bonjour))
    await E.precharger()
    const html = renderToString(
      <Suspense fallback="REPLI">
        <E nom="Loris" />
      </Suspense>,
    )
    expect(html).not.toContain('REPLI')
    expect(html).toContain('Bonjour')
  })

  it('retente après un échec de chargement', async () => {
    let essais = 0
    const E = ecran(() => (++essais === 1 ? Promise.reject(new Error('réseau')) : Promise.resolve(Bonjour)))
    await expect(E.precharger()).rejects.toThrow('réseau')
    await E.precharger()
    expect(essais).toBe(2)
  })
})
