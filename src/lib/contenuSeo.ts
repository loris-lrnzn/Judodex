import type { FamilyGroup } from '../types/judodex'

/**
 * Ce que dit la page d'une famille de techniques, avant la liste.
 *
 * Une liste de noms japonais ne répond à aucune question. Ces textes disent ce
 * qu'est la famille, comment elle se distingue des autres et par où l'aborder ;
 * ils sont écrits pour Judodex et ne reprennent que ce que le catalogue montre.
 */
export interface TexteFamille {
  /** Le titre de la page, tel qu'on le cherche. */
  h1: string
  /** Le nom courant, au singulier, pour les questions : « le koshi-waza ». */
  terme: string
  intro: string[]
  /** Une question et sa réponse, qui répondent à ce que l'on tape dans un moteur. */
  question: { q: string; a: string }
}

export const FAMILLE_TEXTE: Record<FamilyGroup, TexteFamille> = {
  'te-waza': {
    h1: 'Te-waza : les techniques de bras en judo',
    terme: 'les te-waza',
    intro: [
      "Les te-waza (手技, « techniques de la main ») regroupent les projections où l'effort vient surtout des bras et des épaules. Tori tire, pousse ou soulève uke avec les mains, souvent en pivotant ou en s'abaissant, tandis que les hanches et les jambes servent surtout d'appui. Le kuzushi décide de tout : un uke bien déséquilibré se projette avec peu de force.",
      "On y trouve les seoi-nage, projections par-dessus l'épaule, ainsi que tai-otoshi, kata-guruma ou sukui-nage. Elles s'apprennent tôt, parce qu'elles montrent nettement la logique du judo : déséquilibre, placement, exécution.",
    ],
    question: {
      q: "Qu'est-ce que les te-waza en judo ?",
      a: "Les te-waza (手技) sont les projections où l'action des bras et des épaules domine : tori tire, pousse ou soulève uke avec les mains, les hanches et les jambes servant d'appui. Les seoi-nage et tai-otoshi en sont les exemples les plus courants.",
    },
  },
  'koshi-waza': {
    h1: 'Koshi-waza : les techniques de hanche en judo',
    terme: 'les koshi-waza',
    intro: [
      "Les koshi-waza (腰技, « techniques de hanche ») projettent uke en le chargeant sur la hanche. Tori place son bassin plus bas que celui de uke, le colle contre lui, puis le fait basculer en tournant ou en soulevant. La force vient des jambes et du bassin, les bras ne font que guider.",
      "O-goshi, la grande hanche, est la projection de référence pour comprendre le levier du bassin ; harai-goshi y ajoute un fauchage de la jambe, uki-goshi une rotation plus souple. Ces techniques demandent de la proximité, donc une bonne saisie et une entrée rapide.",
    ],
    question: {
      q: "Qu'est-ce que les koshi-waza en judo ?",
      a: "Les koshi-waza (腰技) sont les projections de hanche : tori place son bassin sous celui de uke et le fait basculer sur sa hanche. O-goshi, harai-goshi et uki-goshi en sont les exemples les plus connus.",
    },
  },
  'ashi-waza': {
    h1: 'Ashi-waza : les techniques de jambe en judo',
    terme: 'les ashi-waza',
    intro: [
      "Les ashi-waza (足技, « techniques de jambe ») attaquent les appuis de uke avec le pied ou la jambe : balayer, faucher, crocheter ou bloquer. Moins énergiques que les projections de hanche, elles reposent sur le timing : on touche l'appui au moment où uke y transfère son poids.",
      "De-ashi-barai balaie le pied qui avance, o-soto-gari fauche la jambe arrière, ko-uchi-gari crochète l'intérieur du pied. Elles sont au cœur des premiers passages de grade, parce qu'elles apprennent à sentir le poids de l'autre.",
    ],
    question: {
      q: "Qu'est-ce que les ashi-waza en judo ?",
      a: "Les ashi-waza (足技) sont les projections de jambe : tori balaie, fauche, crochète ou bloque les appuis de uke avec le pied ou la jambe. De-ashi-barai et o-soto-gari en sont des exemples.",
    },
  },
  'sutemi-waza': {
    h1: 'Sutemi-waza : les techniques de sacrifice en judo',
    terme: 'les sutemi-waza',
    intro: [
      "Les sutemi-waza (捨身技, « techniques où l'on sacrifie le corps ») se font en se laissant tomber : tori abandonne sa position debout pour entraîner uke dans sa chute. On distingue les ma-sutemi-waza, où tori tombe en arrière, sur le dos, et les yoko-sutemi-waza, où il tombe sur le côté.",
      "Tomoe-nage, la projection en cercle, et sumi-gaeshi illustrent les sacrifices en arrière ; yoko-guruma et tani-otoshi, les sacrifices latéraux. Elles demandent un uke déjà engagé, et un bon contrôle de la chute pour ne pas se retrouver sous lui.",
    ],
    question: {
      q: "Qu'est-ce que les sutemi-waza en judo ?",
      a: "Les sutemi-waza (捨身技) sont les projections de sacrifice : tori se laisse tomber, en arrière (ma-sutemi-waza) ou sur le côté (yoko-sutemi-waza), pour entraîner uke dans sa chute. Tomoe-nage en est l'exemple classique.",
    },
  },
  'ne-waza': {
    h1: 'Ne-waza : le travail au sol en judo',
    terme: 'le ne-waza',
    intro: [
      "Le ne-waza (寝技, « travail au sol ») commence quand le combat quitte la position debout. Il regroupe trois familles de katame-waza, les techniques de contrôle : les immobilisations (osaekomi-waza), les étranglements (shime-waza) et les clés articulaires (kansetsu-waza).",
      "Au sol, le judo cherche à tenir uke sur le dos, à l'étrangler ou à le contraindre à abandonner. En compétition, les clés ne visent que le coude. Kesa-gatame, la plus classique des immobilisations, est le contrôle fondamental du travail au sol ; les premières ceintures s'y consacrent surtout à des situations d'étude, plus qu'à des techniques nommées.",
    ],
    question: {
      q: "Qu'est-ce que le ne-waza en judo ?",
      a: "Le ne-waza (寝技) est le travail au sol : immobilisations (osaekomi-waza), étranglements (shime-waza) et clés articulaires (kansetsu-waza). Ensemble, ce sont les katame-waza, les techniques de contrôle.",
    },
  },
}
