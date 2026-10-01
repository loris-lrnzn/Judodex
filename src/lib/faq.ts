import { beltFor, beltOf, nextBeltAfter, type BeltId } from './belts'
import { FAMILLE_TEXTE } from './contenuSeo'
import { FAMILY_META, GROUP_META } from './families'
import type { FamilyGroup, Technique } from '../types/judodex'

/**
 * Les questions et réponses des pages d'entrée : pour une ceinture, pour une
 * famille. Elles ne disent que ce que la planche ou le catalogue contient —
 * les mêmes lignes sont écrites sur la page et déclarées aux moteurs.
 */
export type Question = { q: string; a: string }

const liste = (noms: string[]) => (noms.length <= 1 ? noms.join('') : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`)

export function questionsCeinture(belt: BeltId, nom: (slug: string) => string): Question[] {
  const b = beltOf(belt)
  const suivante = nextBeltAfter(belt)
  const couleur = b.name.toLowerCase()
  return [
    {
      q: `Quelles techniques faut-il connaître pour la ceinture ${couleur} de judo ?`,
      a: `La planche « ${b.plate} » impose ${b.nage.length} projections (${liste(b.nage.map(nom))}) et ${b.katame.length} techniques au sol (${liste(b.katame.map(nom))}). S'y ajoutent des situations d'étude, surtout au sol.`,
    },
    {
      q: `Combien de séances faut-il pour passer la ceinture ${couleur} ?`,
      a: `La progression française attend, pour ce passage de grade : ${b.volume.replace(/ · /g, ' ; ')}.`,
    },
    {
      q: `Quelles valeurs du code moral accompagnent la ceinture ${couleur} ?`,
      a: `Le passage ${b.plate.toLowerCase()} porte deux valeurs du code moral : ${b.values.toLowerCase()}.`,
    },
    ...(suivante
      ? [
          {
            q: `Quelle ceinture passe-t-on après la ceinture ${couleur} ?`,
            a: `Après la ceinture ${couleur} (${b.kyu}) vient la ceinture ${beltOf(suivante).name.toLowerCase()} (${beltOf(suivante).kyu}).`,
          },
        ]
      : []),
  ]
}

export function questionsFamille(group: FamilyGroup, techniques: Technique[]): Question[] {
  const texte = FAMILLE_TEXTE[group]
  const meta = GROUP_META[group]
  return [
    texte.question,
    {
      q: `Quelles sont les techniques de ${meta.name.toLowerCase()} du judo ?`,
      a: `Le catalogue en compte ${techniques.length} : ${liste(techniques.map((t) => t.name))}.`,
    },
  ]
}

export function questionsCeintures(): Question[] {
  return [
    {
      q: 'Dans quel ordre passe-t-on les ceintures de judo ?',
      a: 'Dans la progression française : blanche, jaune, orange, verte, bleue, marron, puis noire. Chaque passage de grade a sa planche de techniques et de situations d\'étude.',
    },
    {
      q: 'Quelle ceinture correspond à quel grade ?',
      a: 'Les ceintures de couleur sont des kyu, qui décroissent : jaune 5ᵉ kyu, orange 4ᵉ, verte 3ᵉ, bleue 2ᵉ, marron 1ᵉʳ kyu. La ceinture noire ouvre la série des dan, du premier dan à plus.',
    },
    {
      q: 'Où trouver le programme technique de chaque ceinture ?',
      a: 'Chaque ceinture a sa page, avec les projections et les techniques au sol imposées, les situations d\'étude, les valeurs du code moral et le volume de pratique attendu. La ceinture noire a la sienne, avec les trois premiers dan.',
    },
  ]
}

/**
 * Les questions d'une fiche : ce que tape quelqu'un qui cherche la technique.
 * Les réponses reprennent la fiche — décomposition, planche, enchaînements — et
 * rien d'autre ; elles sont écrites sur la page, puis déclarées.
 */
export function questionsTechnique(t: Technique, nom: (slug: string) => string): Question[] {
  const famille = FAMILY_META[t.family]
  const ceinture = beltFor(t.slug)
  // Les liens du catalogue ont quatre formes ; seules trois se disent en phrase.
  // Le redoublement — insister avec la même attaque — renvoie à la fiche elle-même.
  const vers = (type: string) => [...new Set((t.combinations ?? []).filter((c) => c.type === type && c.slug !== t.slug).map((c) => c.slug))]
  const suites = vers('enchainement')
  const sol = vers('liaison-sol')
  const contres = vers('contre')
  const phrase = (s: string) => s.replace(/\.$/, '')
  return [
    {
      q: `Que signifie ${t.name} en judo ?`,
      a: `${t.name} (${t.kanji}) signifie « ${t.translation.charAt(0).toLowerCase()}${t.translation.slice(1)} ». C'est une technique de la famille ${famille.label} (${famille.short.toLowerCase()}), de niveau ${t.level.toLowerCase()}.`,
    },
    ...(t.phases.length > 0
      ? [
          {
            q: `Comment faire ${t.name} ?`,
            a: `${t.name} se décompose en trois temps. ${t.phases.map((p) => `${p.label} (${p.meaning.toLowerCase()}) : ${phrase(p.description)}.`).join(' ')}`,
          },
        ]
      : (t.keyPoints ?? []).length > 0
        ? [
            {
              q: `Comment réussir ${t.name} ?`,
              a: `Les points clés de ${t.name} : ${(t.keyPoints ?? []).map(phrase).join(' ; ')}.`,
            },
          ]
        : []),
    {
      q: `À quelle ceinture ${t.name} est-elle au programme ?`,
      a: ceinture
        ? `${t.name} est imposée au passage de la ceinture ${beltOf(ceinture).name.toLowerCase()} (${beltOf(ceinture).kyu}) dans la progression française de l'enseignement du judo.`
        : `${t.name} ne figure sur aucune planche de passage de grade de la progression française : elle appartient au répertoire complémentaire du catalogue.`,
    },
    ...(suites.length + sol.length + contres.length > 0
      ? [
          {
            q: `Quelles techniques enchaîner avec ${t.name} ?`,
            a: [
              suites.length ? `Depuis ${t.name}, le catalogue enchaîne sur ${liste(suites.map(nom))}.` : '',
              sol.length ? `Quand la projection ne tombe pas, elle se poursuit au sol par ${liste(sol.map(nom))}.` : '',
              contres.length ? `Elle peut être contrée par ${liste(contres.map(nom))}.` : '',
            ]
              .filter(Boolean)
              .join(' '),
          },
        ]
      : []),
  ]
}
