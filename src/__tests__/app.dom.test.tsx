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

  it('mène chaque famille de l’accueil à sa section du catalogue', async () => {
    render(<App />)
    const jambe = await screen.findByRole('link', { name: /Jambe/ })
    expect(jambe.getAttribute('href')).toBe('/techniques#ashi-waza')
  })

  it('suit l’ordre du catalogue d’une fiche à l’autre, sans boucler', async () => {
    history.replaceState(null, '', '/technique/o-goshi')
    render(<App />)
    const voisines = await screen.findByRole('navigation', { name: /Techniques voisines/i })
    const liens = within(voisines).getAllByRole('link').map((a) => a.getAttribute('href'))
    // O-goshi ouvre la hanche : il vient après la dernière technique de bras.
    expect(liens).toEqual(['/technique/uchi-mata-sukashi', '/technique/uki-goshi'])
  })

  it('ne propose pas de fiche précédente à la première du catalogue', async () => {
    history.replaceState(null, '', '/technique/ippon-seoi-nage')
    render(<App />)
    const voisines = await screen.findByRole('navigation', { name: /Techniques voisines/i })
    expect(within(voisines).getAllByRole('link')).toHaveLength(1)
    expect(within(voisines).queryByText(/Technique précédente/)).toBeNull()
  })

  it('ouvre la recherche et y trouve une technique par son kanji', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('/')
    const dialog = await screen.findByRole('dialog', { name: /Rechercher/i })
    await user.type(within(dialog).getByRole('combobox'), '大腰')
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

  it("laisse toujours choisir le grade préparé, quoi qu'on révise", async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/dojo')
    render(<App />)
    await screen.findByRole('heading', { name: 'Dojo' })
    expect(screen.getByRole('group', { name: 'Je prépare' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Ceinture jaune.*programme/ }))
    expect(screen.getByRole('group', { name: 'Je prépare' })).toBeTruthy()
  })

  it('laisse revenir sur une autre ceinture après avoir choisi la noire', async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/dojo')
    render(<App />)
    await user.click(await screen.findByRole('button', { name: /Ceinture jaune.*programme/ }))
    const grades = screen.getByRole('group', { name: 'Je prépare' })
    await user.click(within(grades).getByRole('button', { name: /Noire$/ }))
    // La ceinture noire se prépare par l'examen des dan : on le dit, sans
    // retirer le choix du grade.
    expect(screen.getByRole('link', { name: /Voir le programme des trois premiers dan/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Commencer la séance/i }).hasAttribute('disabled')).toBe(true)
    await user.click(within(grades).getByRole('button', { name: /Orange$/ }))
    expect(screen.getByRole('button', { name: /Ceinture orange.*programme/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /Commencer la séance/i }).hasAttribute('disabled')).toBe(false)
  })

  it('mène du Dojo à la planche de la ceinture noire', async () => {
    history.replaceState(null, '', '/dojo')
    render(<App />)
    // La carte du Dojo, et non le plan du carnet en pied de page.
    const lien = await screen.findByRole('link', { name: /Ceinture noire.*trois premiers dan/i })
    expect(lien.getAttribute('href')).toBe('/dojo/ceinture-noire')
  })

  it('porte en pied de page le plan du carnet et ses sources', async () => {
    render(<App />)
    const plan = screen.getByRole('navigation', { name: /Plan du carnet/i })
    expect(within(plan).getByRole('link', { name: 'Ceinture noire' }).getAttribute('href')).toBe('/dojo/ceinture-noire')
    expect(screen.getByRole('link', { name: /progression française, France Judo/i }).getAttribute('href')).toContain('ffjudo.com')
  })
})

describe('Mon judo, construit de A à Z', () => {
  const MJ = 'judodex:mon-judo:v1'

  it('part d’une page blanche, sans rien lire du carnet', async () => {
    const user = userEvent.setup()
    // Des techniques acquises et un tokui-waza dans le carnet : Mon judo n'en tient aucun compte.
    localStorage.setItem(
      'judodex:progress:v1',
      JSON.stringify({ 'o-goshi': { mastery: 'mastered', tokui: true, updatedAt: '' }, 'o-soto-gari': { mastery: 'mastered', tokui: false, updatedAt: '' } }),
    )
    history.replaceState(null, '', '/mon-judo')
    render(<App />)
    expect(await screen.findByRole('heading', { name: /Qui monte sur le tapis/ })).toBeTruthy()
    const fil = screen.getByRole('navigation', { name: /Étapes de Mon judo/ })
    await user.click(within(fil).getByRole('button', { name: /Tes coins/ }))
    expect(await screen.findByRole('heading', { name: /Où fais-tu tomber/ })).toBeTruthy()
    // Quatre coins vides dans la planche de l'étape, autant dans l'aperçu de la carte.
    expect(screen.getAllByText('Personne ne tombe ici').length).toBeGreaterThanOrEqual(4)
  })

  it('construit un judo étape par étape et le montre sur la carte', async () => {
    const user = userEvent.setup()
    history.replaceState(null, '', '/mon-judo')
    render(<App />)
    await user.type(await screen.findByLabelText(/Ton prénom/), 'Loris')
    await user.click(screen.getByRole('radio', { name: /Gaucher/ }))
    await user.click(screen.getByRole('button', { name: /C’est parti/ }))
    await user.click((await screen.findAllByRole('button', { name: /Seoi-Otoshi/ }))[0])
    await user.click(screen.getByRole('button', { name: /Continuer/ }))
    expect(await screen.findByRole('heading', { name: /Où fais-tu tomber/ })).toBeTruthy()
    const fil = screen.getByRole('navigation', { name: /Étapes de Mon judo/ })
    await user.click(within(fil).getByRole('button', { name: /Ta carte/ }))
    const carte = await screen.findByRole('article', { name: 'Le judo de Loris' })
    expect(within(carte).getByText('Gaucher', { exact: false })).toBeTruthy()
    expect(within(carte).getAllByText('Seoi-Otoshi').length).toBeGreaterThan(0)
  })

  it('propose aux réactions les suites de la technique, et dit ce qu’elle expose', async () => {
    const user = userEvent.setup()
    localStorage.setItem(MJ, JSON.stringify({ tokui: 'o-uchi-gari', courante: 'reactions' }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)
    await user.click(await screen.findByRole('tab', { name: /Il recule/ }))
    const panneau = screen.getByRole('tabpanel')
    // Le redoublement quand uke retire sa jambe est écrit dans le catalogue.
    await user.click(within(panneau).getAllByRole('button', { name: /O-Uchi-Gari/ })[0])
    expect(screen.getByRole('tab', { name: /Il recule/ }).textContent).toMatch(/O-Uchi-Gari/)
    expect(screen.getByText(/Attention à ce qu’il peut te renvoyer/)).toBeTruthy()
    expect(screen.getAllByText('O-Uchi-Gaeshi').length).toBeGreaterThan(0)
  })

  it('ne donne jamais plus de trois choses à travailler', async () => {
    localStorage.setItem(MJ, JSON.stringify({ courante: 'carte' }))
    history.replaceState(null, '', '/mon-judo')
    render(<App />)
    const titre = await screen.findByRole('heading', { name: 'À travailler en priorité' })
    const liste = titre.parentElement!.querySelector('ol')!
    expect(liste.querySelectorAll('li').length).toBe(3)
  })

  it('ouvre une carte reçue par lien, sans toucher à la sienne', async () => {
    const { encoder, normaliser } = await import('../lib/monjudo')
    const connue = () => true
    const code = encoder({ ...normaliser({}, connue), prenom: 'Aiko', tokui: 'uchi-mata' })
    localStorage.setItem(MJ, JSON.stringify({ prenom: 'Loris' }))
    history.replaceState(null, '', `/mon-judo/carte/${code}`)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Le judo de Aiko' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Construire mon judo/ }).getAttribute('href')).toBe('/mon-judo')
    expect(JSON.parse(localStorage.getItem(MJ)!).prenom).toBe('Loris')
  })

  it('expose Mon judo dans la navigation principale', async () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /Navigation principale/i })
    expect(within(nav).getByRole('link', { name: /Mon judo/i }).getAttribute('href')).toBe('/mon-judo')
  })
})
