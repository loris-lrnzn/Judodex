/**
 * Le rappel de sauvegarde.
 *
 * Le carnet ne vit que dans le navigateur : vider ses données, changer de
 * téléphone ou de profil efface la mémoire, qui est pourtant ce que l'appli
 * a de plus précieux. L'export existe, mais rien n'y ramenait. On retient la
 * date du dernier export, et l'accueil rappelle poliment quand elle s'éloigne.
 */

const CLE = 'judodex:derniere-sauvegarde'
const REPORT = 'judodex:rappel-reporte'

/** Au-delà de ce délai sans export, le rappel apparaît. */
export const DELAI_JOURS = 30
/** « Plus tard » fait taire le rappel pendant ce délai. */
export const REPORT_JOURS = 14
/** Sous ce nombre de techniques suivies, il n'y a pas encore de quoi perdre. */
export const SEUIL_SUIVIES = 3

const JOUR_MS = 86_400_000

const lire = (cle: string): string | null => {
  try {
    return localStorage.getItem(cle) || null
  } catch {
    return null
  }
}
const ecrire = (cle: string, valeur: string) => {
  try {
    localStorage.setItem(cle, valeur)
  } catch {
    /* navigation privée ou quota : le rappel reviendra, rien de grave */
  }
}

export const derniereSauvegarde = () => lire(CLE)
export const rappelReporte = () => lire(REPORT)

/** À appeler quand le fichier vient d'être exporté. */
export function noterSauvegarde(now = new Date()) {
  ecrire(CLE, now.toISOString())
}

export function reporterRappel(now = new Date()) {
  ecrire(REPORT, now.toISOString())
}

/** Jours entiers écoulés depuis une date ISO ; null si elle est absente ou illisible. */
export function joursDepuis(iso: string | null, now = new Date()): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return Math.max(0, Math.floor((now.getTime() - t) / JOUR_MS))
}

export function rappelNecessaire(
  { suivies, derniere, reporte }: { suivies: number; derniere: string | null; reporte: string | null },
  now = new Date(),
): boolean {
  if (suivies < SEUIL_SUIVIES) return false
  const depuisExport = joursDepuis(derniere, now)
  if (depuisExport !== null && depuisExport < DELAI_JOURS) return false
  const depuisReport = joursDepuis(reporte, now)
  return depuisReport === null || depuisReport >= REPORT_JOURS
}

/** La dernière sauvegarde, dite comme on la dit. */
export function dite(iso: string | null, now = new Date()): string {
  const j = joursDepuis(iso, now)
  if (j === null) return 'jamais'
  if (j === 0) return "aujourd'hui"
  if (j === 1) return 'hier'
  if (j < 60) return `il y a ${j} jours`
  return `il y a ${Math.floor(j / 30)} mois`
}
