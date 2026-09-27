/*
 * Sortir la carte de l’écran : en image, par un lien, sur papier.
 *
 * L’image est rendue par html-to-image, chargé au premier clic seulement. Une
 * image ne voit pas les polices de la page : on les lui donne, mais pas
 * toutes — Shippori Mincho découpe le japonais en une centaine de tranches,
 * et on n’embarque que celles dont la carte emploie un caractère.
 */

const POLICES =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Shippori+Mincho+B1:wght@700;800&display=swap'

/** Plages Unicode d’un bloc @font-face, lues telles que Google les écrit. */
function plages(bloc: string): [number, number][] | null {
  const m = bloc.match(/unicode-range:\s*([^;]+);/)
  if (!m) return null
  return m[1].split(',').map((r) => {
    const [a, b] = r.trim().replace(/^U\+/i, '').split('-')
    if (b) return [parseInt(a, 16), parseInt(b, 16)]
    return [parseInt(a.replace(/\?/g, '0'), 16), parseInt(a.replace(/\?/g, 'F'), 16)]
  })
}

const enDataUrl = (blob: Blob) =>
  new Promise<string>((ok, ko) => {
    const lecteur = new FileReader()
    lecteur.onload = () => ok(lecteur.result as string)
    lecteur.onerror = ko
    lecteur.readAsDataURL(blob)
  })

/** Les polices dont le texte a besoin, fichiers compris, prêtes à embarquer. */
async function policesPour(texte: string): Promise<string> {
  const css = await (await fetch(POLICES)).text()
  const points = [...new Set([...texte].map((c) => c.codePointAt(0)!))]
  const blocs = (css.match(/@font-face\s*{[^}]*}/g) ?? []).filter((bloc) => {
    const p = plages(bloc)
    return !p || points.some((c) => p.some(([lo, hi]) => c >= lo && c <= hi))
  })
  const embarques = await Promise.all(
    blocs.map(async (bloc) => {
      const url = bloc.match(/url\(([^)]+)\)/)?.[1]
      if (!url) return bloc
      return bloc.replace(url, await enDataUrl(await (await fetch(url)).blob()))
    }),
  )
  return embarques.join('\n')
}

/** Télécharge la carte en image, à deux fois la résolution de l’écran. */
export async function telechargerCarte(noeud: HTMLElement, fichier: string) {
  const { toPng } = await import('html-to-image')
  let fontEmbedCSS: string | undefined
  try {
    fontEmbedCSS = await policesPour(`${noeud.textContent ?? ''}受取Judodex`)
  } catch {
    // Sans réseau, l’image se fait quand même, avec les polices du système.
  }
  const url = await toPng(noeud, {
    pixelRatio: 2,
    fontEmbedCSS,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    cacheBust: true,
  })
  const a = document.createElement('a')
  a.href = url
  a.download = `${fichier}.png`
  a.click()
}

/**
 * Partage le lien : la feuille de partage du téléphone quand elle existe,
 * sinon le presse-papiers. Renvoie ce qui a été fait, pour le dire.
 */
export async function partagerLien(url: string, titre: string): Promise<'partage' | 'copie' | 'echec'> {
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ title: titre, url })
      return 'partage'
    } catch {
      /* partage annulé : on retombe sur la copie */
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copie'
  } catch {
    return 'echec'
  }
}
