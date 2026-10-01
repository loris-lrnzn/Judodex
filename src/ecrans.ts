import { ecran } from './lib/ecrans'

/**
 * Les écrans secondaires, qui sortent du chargement initial. App les affiche ;
 * main.tsx précharge celui de l'adresse demandée avant le premier rendu.
 */
export const ecrans = {
  technique: ecran(() => import('./screens/TechniqueScreen').then((m) => m.TechniqueScreen)),
  train: ecran(() => import('./screens/TrainScreen').then((m) => m.TrainScreen)),
  profil: ecran(() => import('./screens/MonJudoScreen').then((m) => m.MonJudoScreen)),
  carteJudo: ecran(() => import('./screens/CarteRecueScreen').then((m) => m.CarteRecueScreen)),
  dan: ecran(() => import('./screens/DanScreen').then((m) => m.DanScreen)),
  reglages: ecran(() => import('./screens/ReglagesScreen').then((m) => m.ReglagesScreen)),
  ceintures: ecran(() => import('./screens/CeinturesScreen').then((m) => m.CeinturesScreen)),
  ceinture: ecran(() => import('./screens/CeintureScreen').then((m) => m.CeintureScreen)),
  famille: ecran(() => import('./screens/FamilleScreen').then((m) => m.FamilleScreen)),
  lexique: ecran(() => import('./screens/LexiqueScreen').then((m) => m.LexiqueScreen)),
  aPropos: ecran(() => import('./screens/AProposScreen').then((m) => m.AProposScreen)),
}
