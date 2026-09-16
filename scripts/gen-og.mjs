/**
 * Rend les aperçus de partage : public/og.png et une carte par technique.
 *
 * Une carte de partage n'est pas une capture de la page : elle est lue à la
 * taille d'une vignette dans une conversation. On y met donc trois choses,
 * grandes : le nom, ce que c'est, et le trait de la planche technique qui fait
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

const STYLE = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0f2e20;color:#edf3ea;
       font-family:'IBM Plex Sans',sans-serif;position:relative;overflow:hidden;
       background-image:linear-gradient(rgba(237,243,234,.055) 1px,transparent 1px),
                        linear-gradient(90deg,rgba(237,243,234,.055) 1px,transparent 1px);
       background-size:48px 48px}
  .cadre{position:absolute;inset:36px;border:1px solid #265640}
  .reticule{position:absolute;width:22px;height:22px;
       background-image:linear-gradient(#edf3ea,#edf3ea),linear-gradient(#edf3ea,#edf3ea);
       background-size:22px 1px,1px 22px;background-position:center,center;
       background-repeat:no-repeat;opacity:.55}
  .tl{top:48px;left:48px}.br{bottom:48px;right:48px}
  .corps{position:absolute;inset:96px 96px 96px 104px;display:flex;align-items:center;gap:64px}
  .texte{flex:1;min-width:0}
  .annot{font-family:'IBM Plex Mono',monospace;font-size:19px;letter-spacing:.16em;
         text-transform:uppercase;font-weight:500;color:#a9c4b0}
  .etiquette{display:inline-block;border:1px solid #edf3ea;padding:7px 12px;line-height:1;
             font-family:'IBM Plex Mono',monospace;font-size:18px;letter-spacing:.16em;
             text-transform:uppercase;font-weight:500}
  h1{font-weight:700;line-height:.92;letter-spacing:-.045em;margin-top:26px}
  p{font-size:27px;line-height:1.45;color:#c3d8c8;margin-top:26px;max-width:640px}
  .cote{display:flex;align-items:center;gap:18px;margin-top:34px}
  .trait{position:relative;height:1px;width:150px;background:#265640}
  .trait::before,.trait::after{content:'';position:absolute;top:-4px;width:1px;height:9px;background:#edf3ea}
  .trait::before{left:0}.trait::after{right:0}
  .sceau{width:290px;height:290px;flex:none;position:relative;display:grid;place-items:center}
  .sceau svg{position:absolute;inset:0}
  .kanji{font-family:'Shippori Mincho B1',serif;font-weight:800;line-height:1.02;color:#edf3ea;
         text-align:center;width:250px}
`

const SCEAU = `<svg viewBox="0 0 290 290" fill="none">
        <circle cx="145" cy="145" r="138" stroke="#265640" stroke-width="2"/>
        <circle cx="145" cy="145" r="120" stroke="#265640" stroke-width="1" stroke-dasharray="3 5"/>
        <path d="M15.3 192.2A138 138 0 0 0 274.7 192.2" stroke="#ff6247" stroke-width="13" stroke-linecap="round"/>
        <circle cx="274.7" cy="192.2" r="11" fill="#ff6247"/>
      </svg>`

const echappe = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Le titre occupe toute la largeur disponible quel que soit sa longueur :
 * « O-Goshi » et « Yoko-Otoshi » ne peuvent pas prendre le même corps sans que
 * le second déborde du cadre.
 */
const corpsTitre = (nom) => (nom.length <= 8 ? 96 : nom.length <= 12 ? 76 : nom.length <= 17 ? 60 : 48)

/*
 * Le kanji occupe le sceau sans en sortir. Au-delà de trois caractères il
 * passe sur deux lignes — « 腕挫三角固 » sur une seule déborderait du disque,
 * quelle que soit la taille où on le réduirait sans le rendre illisible.
 */
const corpsKanji = (k) => (k.length <= 1 ? 168 : k.length === 2 ? 126 : k.length === 3 ? 88 : 78)

function carte({ etiquette, titre, texte, kanji, annot }) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@600;700&family=Shippori+Mincho+B1:wght@800&display=swap" rel="stylesheet">
<style>${STYLE}</style></head><body>
  <div class="cadre"></div><div class="reticule tl"></div><div class="reticule br"></div>
  <div class="corps">
    <div class="texte">
      <span class="etiquette">${echappe(etiquette)}</span>
      <h1 style="font-size:${corpsTitre(titre)}px">${echappe(titre)}</h1>
      <p>${echappe(texte)}</p>
      <div class="cote"><span class="trait"></span><span class="annot">${echappe(annot)}</span></div>
    </div>
    <div class="sceau">
      ${SCEAU}
      <span class="kanji" style="font-size:${corpsKanji(kanji)}px">${echappe(kanji)}</span>
    </div>
  </div>
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
    etiquette: 'Carnet de pratique',
    titre: 'Judodex',
    texte: `Les ${techniques.length} techniques du judo, décomposées en kuzushi, tsukuri et kake.`,
    kanji: '柔',
    annot: '柔道技図鑑',
  }),
  join(racine, 'public/og.png'),
)

const dossier = join(racine, 'public/og')
mkdirSync(dossier, { recursive: true })

for (const t of techniques) {
  await rendre(
    carte({
      etiquette: FAMILLES[t.family] ?? t.family,
      titre: t.name,
      texte: t.translation,
      kanji: t.kanji,
      annot: t.level,
    }),
    join(dossier, `${t.slug}.png`),
  )
}

await navigateur.close()
console.log(`gen-og : public/og.png et ${techniques.length} cartes dans public/og/ (1200×630).`)
