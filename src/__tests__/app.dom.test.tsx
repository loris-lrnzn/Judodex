// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

/**
 * Test de bout en bout léger : on parcourt réellement l'application pour
 * s'assurer qu'aucun écran ne plante et que la progression est bien retenue.
 */
beforeEach(() => {
  localStorage.clear()
  history.replaceState(null, '', '/')
  // matchMedia n'existe pas dans jsdom.
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
  window.scrollTo = () => {}
})

describe('parcours applicatif', () => {
  it('expose les entrées comme de vrais liens partageables', async () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    expect(within(nav).getByRole('link', { name: /Techniques/i }).getAttribute('href')).toBe('/techniques')
    expect(within(nav).getByRole('link', { name: /Dojo/i }).getAttribute('href')).toBe('/dojo')
  })

  it('affiche l’accueil avec la progression à zéro', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getAllByText(/104/).length).toBeGreaterThan(0)
  })

  it('navigue vers le catalogue, ouvre une fiche et retient l’acquisition', async () => {
    const user = userEvent.setup()
    render(<App />)

    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    await user.click(within(nav).getByRole('link', { name: /Techniques/i }))
    expect(await screen.findByRole('heading', { name: 'Techniques' })).toBeTruthy()

    // Les cinq familles structurent la page.
    expect(screen.getByRole('heading', { level: 2, name: 'Hanche' })).toBeTruthy()
    // Chaque famille est annoncée par son kanji.
    expect(screen.getAllByText('腰技').length).toBeGreaterThan(0)

    await user.click(await screen.findByRole('link', { name: /O-Goshi/ }))
    expect(await screen.findByRole('heading', { level: 1, name: 'O-Goshi' })).toBeTruthy()
    expect(window.location.pathname).toBe('/technique/o-goshi')
    // La fiche donne la décomposition martiale complète.
    expect(screen.getByText('Kuzushi')).toBeTruthy()
    expect(screen.getByText('Tsukuri')).toBeTruthy()
    expect(screen.getByText('Kake')).toBeTruthy()

    // Marquer la technique acquise met à jour l'écran et le stockage local.
    await user.click(screen.getByRole('button', { name: 'Acquise' }))
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('judodex:progress:v1') ?? '{}')
      expect(saved['o-goshi'].mastery).toBe('mastered')
    })
  })

  it('propose une révision une fois une technique en cours', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      'judodex:progress:v1',
      JSON.stringify({ 'o-goshi': { mastery: 'learning', tokui: false, updatedAt: '', box: 0, due: '2020-01-01' } }),
    )
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    await user.click(within(nav).getByRole('link', { name: /Dojo/i }))
    expect(await screen.findByRole('heading', { name: 'Dojo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Commencer la séance/i })).toBeTruthy()
  })

  it('affiche le programme du grade préparé et permet d’en changer', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Blanche à jaune' })).toBeTruthy()
    // La planche officielle sépare projections et travail au sol.
    expect(screen.getAllByText(/nage-waza/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/katame-waza/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /Verte/i }))
    expect(await screen.findByRole('heading', { name: 'Orange à verte' })).toBeTruthy()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('judodex:belt:v1') ?? '""')).toBe('verte'))
  })

  it('classe le catalogue par ceinture sur demande', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    await user.click(within(nav).getByRole('link', { name: /Techniques/i }))
    await user.click(await screen.findByRole('button', { name: 'Par ceinture' }))
    expect(await screen.findByRole('heading', { name: 'Bleue à marron' })).toBeTruthy()
    // Le reste du répertoire est présenté à part, jamais mêlé au programme.
    expect(screen.getByRole('heading', { name: 'Répertoire complémentaire' })).toBeTruthy()
  })

  it('ouvre la recherche et y trouve une technique par son kanji', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('/')
    const dialog = await screen.findByRole('dialog', { name: /Rechercher/i })
    await user.type(within(dialog).getByRole('searchbox'), '大腰')
    expect(await within(dialog).findByText('O-Goshi')).toBeTruthy()
  })
})

describe('planche de la ceinture noire', () => {
  it('affiche les unités, le kata et le tirage du 1er dan', async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/dojo/ceinture-noire')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /Ceinture noire/i })).toBeTruthy()

    // UV1 par défaut : les trois premières séries du nage no kata.
    expect(await screen.findByRole('heading', { level: 2, name: /Nage no kata/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Uki-otoshi/i }).getAttribute('href')).toBe('/technique/uki-otoshi')
    expect(screen.queryByRole('link', { name: /Yoko-gake/i })).toBeNull()

    await user.click(screen.getByRole('button', { name: /Kata complet/i }))
    expect(await screen.findByRole('link', { name: /Yoko-gake/i })).toBeTruthy()

    // UV2 : le tirage rend dix techniques réparties en deux colonnes.
    await user.click(screen.getByRole('button', { name: /^UV2/i }))
    await user.click(await screen.findByRole('button', { name: /Tirer les 10 techniques/i }))
    await waitFor(() => expect(screen.getByText(/Debout · 6 techniques/i)).toBeTruthy())
    expect(screen.getByText(/Au sol · 4 techniques/i)).toBeTruthy()
  })

  it('donne au 3e dan son katame no kata et son propre tirage', async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/dojo/ceinture-noire/3e-dan')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 2, name: /Katame no kata/i })).toBeTruthy()
    // Ashi-garami clôt la troisième série sans avoir de fiche : nommée, non liée.
    expect(screen.getByText(/Ashi-Garami/i)).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Ashi-Garami/i })).toBeNull()

    await user.click(screen.getByRole('button', { name: /^UV2/i }))
    await user.click(await screen.findByRole('button', { name: /Tirer les 4 techniques/i }))
    await waitFor(() => expect(screen.getByText(/Debout · 2 techniques/i)).toBeTruthy())
    // Le programme du 3e dan, pas celui du 1er. Le tirage pouvant sortir la
    // même technique, elle peut apparaître deux fois : on compte, sans exiger
    // l'unicité.
    expect(screen.getAllByRole('link', { name: /Yama-Arashi/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Kubi-Nage/i })).toBeNull()
  })

  it('relie les trois grades entre eux par de vrais liens', async () => {
    history.replaceState(null, '', '/dojo/ceinture-noire')
    render(<App />)
    expect((await screen.findByRole('link', { name: /2e dan/i })).getAttribute('href')).toBe('/dojo/ceinture-noire/2e-dan')
    expect(screen.getByRole('link', { name: /3e dan/i }).getAttribute('href')).toBe('/dojo/ceinture-noire/3e-dan')
  })

  it('mène du Dojo à la planche de la ceinture noire', async () => {
    history.replaceState(null, '', '/dojo')
    render(<App />)
    const lien = await screen.findByRole('link', { name: /Ceinture noire/i })
    expect(lien.getAttribute('href')).toBe('/dojo/ceinture-noire')
  })
})

describe('bilan personnel', () => {
  it('ouvre le bilan sur la première question du parcours', async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/mon-judo')
    render(<App />)

    // Le parcours commence par la garde : une question, pas un relevé.
    expect(await screen.findByRole('heading', { level: 1, name: /droitier ou gaucher/i })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Continuer/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /qu.est-ce que tu sais faire/i })).toBeTruthy()
    // Carnet vide : la planche invite à la remplir plutôt que de constater.
    expect(screen.getByText(/Ta planche est vide/i)).toBeTruthy()
  })

  it('place les techniques acquises sur la rose et renverse en garde gauche', async () => {
    const user = userEvent.setup()
    // O-soto-gari tombe en arrière droit, o-uchi-gari en arrière gauche.
    localStorage.setItem(
      'judodex:progress:v1',
      JSON.stringify({
        'o-soto-gari': { mastery: 'mastered', tokui: true, updatedAt: '2026-01-01' },
        'o-uchi-gari': { mastery: 'mastered', tokui: false, updatedAt: '2026-01-01' },
      }),
    )
    // On entre directement à l'étape du répertoire.
    localStorage.setItem('judodex:parcours:v1', JSON.stringify({ courante: 'repertoire', vues: ['garde'] }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /qu.est-ce que tu sais faire/i })).toBeTruthy()
    expect(screen.queryByText(/Ta planche est vide/i)).toBeNull()
    expect(screen.getAllByRole('link', { name: /O-Soto-Gari/i }).length).toBeGreaterThan(0)
    // La rose se lit depuis tori, qui se tient en bas de planche.
    expect(screen.getByRole('img', { name: /vue depuis tori/i })).toBeTruthy()
    expect(screen.getByText(/2 coins sur quatre/i)).toBeTruthy()

    // La garde gauche renverse la lecture sans rien perdre : on repasse par
    // l'étape qui la porte, puis on revient au répertoire.
    await user.click(screen.getByRole('button', { name: /Ta garde/i }))
    await user.click(await screen.findByRole('button', { name: /Garde gauche/i }))
    await user.click(screen.getByRole('button', { name: /Ton répertoire/i }))

    await waitFor(() => expect(screen.getByText(/2 coins sur quatre/i)).toBeTruthy())
    expect(screen.getAllByRole('link', { name: /O-Soto-Gari/i }).length).toBeGreaterThan(0)
  })

  it("laisse agir à l'étape des situations, comme sur la rose", async () => {
    const user = userEvent.setup()
    localStorage.setItem('judodex:parcours:v1', JSON.stringify({ courante: 'situations', vues: ['garde'] }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /d.où sais-tu partir/i })).toBeTruthy()

    // Une case de la grille s'ouvre et propose de cocher, comme un quartier.
    await user.click(screen.getAllByRole('button', { name: /Garde croisée, il fuit/i })[0])
    const panneau = await screen.findByRole('group', { name: /Garde croisée, il fuit/i })

    const cases = within(panneau).getAllByRole('switch', { name: /à ton répertoire/i })
    expect(cases.length).toBeGreaterThan(0)
    expect(cases[0].getAttribute('aria-checked')).toBe('false')
    await user.click(cases[0])
    await waitFor(() => expect(cases[0].getAttribute('aria-checked')).toBe('true'))
  })

  it("laisse ranger soi-même une technique dans un cas que le catalogue ignore", async () => {
    const user = userEvent.setup()
    // Ippon-seoi-nage est au répertoire, mais aucun de ses liens n'atteste
    // « uke avance » : sans le geste du pratiquant, la case reste vide.
    localStorage.setItem(
      'judodex:progress:v1',
      JSON.stringify({ 'ippon-seoi-nage': { mastery: 'mastered', tokui: false, updatedAt: '2026-01-01' } }),
    )
    localStorage.setItem('judodex:parcours:v1', JSON.stringify({ courante: 'situations', vues: ['garde'] }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)

    const cellule = (await screen.findAllByRole('button', { name: /Même garde, il vient/i }))[0]
    expect(cellule.getAttribute('aria-label')).toMatch(/aucune technique/i)

    await user.click(cellule)
    await user.click(await screen.findByRole('button', { name: /Chercher une autre technique/i }))
    await user.type(await screen.findByRole('searchbox', { name: /Chercher une technique/i }), 'ippon')
    await user.click(await screen.findByRole('button', { name: /Ippon-Seoi-Nage/i }))

    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /Même garde, il vient/i })[0].getAttribute('aria-label'),
      ).toMatch(/1 technique/i),
    )
  })

  it('mène du parcours au bilan, qui ne donne qu\'une chose à faire', async () => {
    localStorage.setItem('judodex:parcours:v1', JSON.stringify({ courante: 'bilan', vues: [] }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: /voilà ton judo/i })).toBeTruthy()
    expect(screen.getByText(/La prochaine chose à faire/i)).toBeTruthy()
    // Carnet vide : on renvoie à l'étape du répertoire, pas ailleurs.
    expect(screen.getByRole('button', { name: /Remplir ma planche/i })).toBeTruthy()
  })

  it('expose le bilan dans la navigation principale', async () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    expect(within(nav).getByRole('link', { name: /Mon judo/i }).getAttribute('href')).toBe('/mon-judo')
  })
})
