/**
 * Le texte de llms-full.txt, écrit à partir des mêmes sources que le site :
 * les fiches, les planches de ceinture, les textes de famille et le lexique.
 * Compilé à la volée par gen-llms-full.mjs, pour ne pas recopier ces données
 * dans un script qui ne lit pas le TypeScript.
 */
import { BELTS } from '../src/lib/belts'
import { FAMILLE_TEXTE } from '../src/lib/contenuSeo'
import { GROUP_META, FAMILY_META } from '../src/lib/families'
import { CATEGORIES, TERMES } from '../src/lib/lexique'
import { CEINTURES } from '../src/hooks/useRoute'
import donnees from '../src/data/techniques.json'

type T = {
  slug: string
  name: string
  kanji: string
  translation: string
  family: keyof typeof FAMILY_META
  level: string
  intro?: string
  phases?: { label: string; kanji: string; meaning: string; description: string }[]
  keyPoints?: string[]
  combinations?: { slug: string; type: string; context: string }[]
}

const FAMILLES: Record<string, string> = {
  'te-waza': 'techniques de bras',
  'koshi-waza': 'techniques de hanche',
  'ashi-waza': 'techniques de jambe',
  'ma-sutemi-waza': 'sacrifices en arrière',
  'yoko-sutemi-waza': 'sacrifices sur le côté',
  'osaekomi-waza': 'immobilisations',
  'shime-waza': 'étranglements',
  'kansetsu-waza': 'luxations',
}

export function contenu(base: string, maj: string): string {
  const techniques = (donnees as unknown as { techniques: T[] }).techniques
  const nom = new Map(techniques.map((t) => [t.slug, t]))
  const lien = (slug: string) => `${nom.get(slug)?.name ?? slug} (${base}/technique/${slug})`
  const parFamille = new Map<string, T[]>()
  for (const t of techniques) parFamille.set(t.family, [...(parFamille.get(t.family) ?? []), t])

  const fiches = [...parFamille.entries()].flatMap(([fam, list]) => [
    `## ${fam} — ${FAMILLES[fam] ?? fam}`,
    '',
    ...list.flatMap((t) => {
      const suites = (t.combinations ?? []).filter((c) => nom.has(c.slug))
      return [
        `### ${t.name} ${t.kanji} — ${t.translation}`,
        '',
        `Adresse : ${base}/technique/${t.slug} · Niveau : ${t.level}`,
        '',
        t.intro ?? '',
        '',
        ...(t.phases ?? []).map((p) => `- **${p.label} (${p.kanji}) — ${p.meaning}.** ${p.description}`),
        ...((t.phases ?? []).length ? [''] : []),
        ...((t.keyPoints ?? []).length ? ['Points clés :', ...(t.keyPoints ?? []).map((k) => `- ${k}`), ''] : []),
        ...(suites.length
          ? ['Enchaînements et contres :', ...suites.map((c) => `- ${c.type === 'contre' ? 'Contre' : 'Enchaînement'} vers ${lien(c.slug)} : ${c.context}.`), '']
          : []),
      ]
    }),
  ])

  const ceintures = [
    '## Les ceintures de judo — programme de chaque passage de grade',
    '',
    `Page : ${base}/ceintures. Source : progression française de l'enseignement du judo (Fédération française de judo).`,
    '',
    ...CEINTURES.flatMap((id) => {
      const b = BELTS.find((x) => x.id === id)!
      return [
        `### Ceinture ${b.name.toLowerCase()} (${b.kyu}) — ${b.plate}`,
        '',
        `Page : ${base}/ceinture/${id}`,
        `Phase : ${b.phase}. Objectif : ${b.focus} Valeurs : ${b.values}. Répartition : ${b.nagePart} % debout, ${100 - b.nagePart} % sol. Volume : ${b.volume}.`,
        '',
        `Projections imposées : ${b.nage.map(lien).join(', ')}.`,
        `Techniques au sol imposées : ${b.katame.map(lien).join(', ')}.`,
        '',
      ]
    }),
  ]

  const familles = [
    '## Les familles de techniques',
    '',
    ...Object.entries(FAMILLE_TEXTE).flatMap(([g, t]) => [
      `### ${GROUP_META[g as keyof typeof GROUP_META].name} (${GROUP_META[g as keyof typeof GROUP_META].jp}) — ${t.h1}`,
      '',
      `Page : ${base}/famille/${g}`,
      '',
      ...t.intro.flatMap((p) => [p, '']),
    ]),
  ]

  const lexique = [
    '## Lexique du judo',
    '',
    `Page : ${base}/lexique`,
    '',
    ...CATEGORIES.flatMap((c) => [
      `### ${c.titre}`,
      '',
      ...TERMES.filter((t) => t.categorie === c.id).map((t) => `- **${t.nom} (${t.jp}) — ${t.sens}.** ${t.definition}`),
      '',
    ]),
  ]

  return [
    '# Judodex — le texte intégral du catalogue',
    '',
    `> ${techniques.length} techniques de judo, en français, avec le programme de chaque ceinture, les familles de techniques et un lexique du vocabulaire japonais. Chaque fiche : nom japonais et kanji, traduction, famille, niveau, présentation, décomposition en kuzushi (déséquilibre), tsukuri (placement) et kake (exécution), points clés et enchaînements. Relevé du ${maj}. Textes écrits pour Judodex.`,
    '',
    ...ceintures,
    ...familles,
    ...lexique,
    '# Les fiches',
    '',
    ...fiches,
    '## Sources',
    '',
    "- Nomenclature et programme de passage de grade : Fédération française de judo (progression française de l'enseignement du judo).",
    '- Démonstrations de référence : Kodokan.',
    '',
  ].join('\n')
}
