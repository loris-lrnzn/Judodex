/**
 * Rend les aperçus de partage : public/og.png et une carte par technique.
 *
 * Une carte de partage n'est pas une capture de la page : elle est lue à la
 * taille d'une vignette dans une conversation. On y met donc trois choses,
 * grandes : le nom, ce que c'est, et le sol de tatami et le cachet qui font
 * reconnaître le carnet.
 *
 * Les cent quatre fiches en ont chacune la leur. Partager o-goshi et partager
 * uchi-mata montrait jusqu'ici la même couverture ; le lien ne disait rien de
 * ce qu'il y avait au bout, et un aperçu qui ne distingue rien ne se clique
 * pas. La carte d'une fiche porte son kanji, son nom et sa traduction.
 *
 * À relancer quand la marque ou le catalogue change : npm run og
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

const FAMILLES = {
  'te-waza': 'Technique de bras',
  'koshi-waza': 'Technique de hanche',
  'ashi-waza': 'Technique de jambe',
  'ma-sutemi-waza': 'Sacrifice en arrière',
  'yoko-sutemi-waza': 'Sacrifice sur le côté',
  'osaekomi-waza': 'Immobilisation',
  'shime-waza': 'Étranglement',
  'kansetsu-waza': 'Luxation',
}

/** Teinte de chaque famille, reprise de la palette de l'application. */
const TEINTES = {
  'te-waza': '#91c9ee',
  'koshi-waza': '#f6b57d',
  'ashi-waza': '#cfe98f',
  'ma-sutemi-waza': '#e3b3e6',
  'yoko-sutemi-waza': '#e3b3e6',
  'osaekomi-waza': '#e8ca77',
  'shime-waza': '#e8ca77',
  'kansetsu-waza': '#e8ca77',
}

/*
 * La carte reprend l'ouverture des pages : le tatami posé en damier, le cachet
 * vermillon, un surtitre à trait rouge, le nom en mincho. Le kanji se dresse
 * à droite, en colonne, à la teinte de la famille.
 */
const STYLE = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0f2e20;color:#edf3ea;
       font-family:'IBM Plex Sans',sans-serif;position:relative;overflow:hidden}
  .sol{position:absolute;inset:0;
       background-image:
         radial-gradient(ellipse 70% 70% at 30% 0%,rgba(237,243,234,.08),transparent 70%),
         url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='288' height='288'%3E%3Cdefs%3E%3Cpattern id='h' width='4' height='4' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 .5H4' stroke='rgba(237,243,234,0.04)'/%3E%3C/pattern%3E%3Cpattern id='v' width='4' height='4' patternUnits='userSpaceOnUse'%3E%3Cpath d='M.5 0V4' stroke='rgba(237,243,234,0.04)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='144' height='144' fill='url(%23h)'/%3E%3Crect x='144' width='144' height='144' fill='url(%23v)'/%3E%3Crect y='144' width='144' height='144' fill='url(%23v)'/%3E%3Crect x='144' y='144' width='144' height='144' fill='url(%23h)'/%3E%3Cpath fill='none' stroke='rgba(0,0,0,0.45)' d='M0 .5H288M0 144.5H288M.5 0V288M144.5 0V288M0 72.5H144M216.5 0V144M72.5 144V288M144 216.5H288'/%3E%3Cpath fill='none' stroke='rgba(237,243,234,0.06)' d='M0 1.5H288M0 145.5H288M1.5 0V288M145.5 0V288M0 73.5H144M217.5 0V144M73.5 144V288M144 217.5H288'/%3E%3C/svg%3E");
       background-position:0 0,-72px -40px}
  .marque{position:absolute;top:56px;left:80px;display:flex;align-items:center;gap:18px}
  .hanko{width:58px;height:58px;background:#ff6c53;color:#0f2e20;display:grid;place-items:center;
         font-family:'Shippori Mincho B1',serif;font-weight:800;font-size:38px;line-height:1;position:relative}
  .hanko::after{content:'';position:absolute;inset:4px;border:2px solid rgba(15,46,32,.35)}
  .nom{font-family:'Shippori Mincho B1',serif;font-weight:800;font-size:36px;line-height:1}
  .corps{position:absolute;left:80px;right:420px;bottom:84px}
  .surtitre{display:flex;align-items:center;gap:18px;font-size:26px;font-weight:500;color:#cadacc}
  .surtitre::before{content:'';width:48px;height:2px;background:#ff6c53}
  h1{font-family:'Shippori Mincho B1',serif;font-weight:800;line-height:1;letter-spacing:-.015em;margin-top:24px}
  p{font-size:30px;line-height:1.4;color:#cadacc;margin-top:20px;max-width:680px}
  .kanji{position:absolute;right:96px;top:50%;transform:translateY(-50%);
         font-family:'Shippori Mincho B1',serif;font-weight:800;line-height:1;
         writing-mode:vertical-rl;white-space:nowrap}
  .creux{color:transparent;-webkit-text-stroke:2px #3d8b67}
`

const echappe = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Le titre occupe toute la largeur disponible quel que soit sa longueur :
 * « O-Goshi » et « Ude-Hishigi-Sankaku-Gatame » ne peuvent pas prendre le
 * même corps sans que le second déborde.
 */
const corpsTitre = (nom) => (nom.length <= 8 ? 104 : nom.length <= 12 ? 84 : nom.length <= 17 ? 66 : 52)

/** La colonne de kanji tient dans la hauteur de la carte, de un à cinq caractères. */
const corpsKanji = (k) => Math.min(220, Math.floor(470 / [...k].length))

function carte({ surtitre, titre, texte, kanji, teinte, creux = false, taille = corpsTitre(titre) }) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@500;600&family=Shippori+Mincho+B1:wght@800&display=swap" rel="stylesheet">
<style>${STYLE}</style></head><body>
  <div class="sol"></div>
  <div class="marque"><span class="hanko">柔</span><span class="nom">Judodex</span></div>
  <div class="corps">
    <div class="surtitre">${echappe(surtitre)}</div>
    <h1 style="font-size:${taille}px">${echappe(titre)}</h1>
    <p>${echappe(texte)}</p>
  </div>
  <span class="kanji${creux ? ' creux' : ''}" lang="ja" style="font-size:${corpsKanji(kanji)}px;color:${creux ? 'transparent' : teinte}">${echappe(kanji)}</span>
</body></html>`
}

const data = JSON.parse(readFileSync(join(racine, 'src/data/techniques.json'), 'utf8'))
const techniques = data.techniques ?? []

const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

/** Rend une carte et l'écrit. Les polices doivent être prêtes avant la capture. */
async function rendre(html, chemin) {
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: chemin })
}

// La couverture du carnet, celle des écrans qui n'ont pas de sujet propre.
await rendre(
  carte({
    surtitre: 'Le carnet du judoka',
    titre: 'Apprendre le judo, geste par geste.',
    texte: `Les ${techniques.length} techniques, décomposées et démontrées.`,
    kanji: '柔道',
    creux: true,
    // La devise passe sur deux lignes : elle garde un corps de couverture.
    taille: 72,
  }),
  join(racine, 'public/og.png'),
)

const dossier = join(racine, 'public/og')
mkdirSync(dossier, { recursive: true })

for (const t of techniques) {
  await rendre(
    carte({
      surtitre: FAMILLES[t.family] ?? t.family,
      titre: t.name,
      texte: t.translation,
      kanji: t.kanji,
      teinte: TEINTES[t.family] ?? '#edf3ea',
    }),
    join(dossier, `${t.slug}.png`),
  )
}

await navigateur.close()
console.log(`gen-og : public/og.png et ${techniques.length} cartes dans public/og/ (1200×630).`)
