import type { BeltId } from './belts'
import type { FamilyGroup } from '../types/judodex'

/**
 * Le vocabulaire du judo, tel qu'on l'entend au dojo.
 *
 * Un débutant arrive avec des mots qu'il ne connaît pas — kuzushi, uke, dan —
 * et c'est aussi ce qu'il tape dans un moteur de recherche. Chaque terme a son
 * adresse (`/lexique#kuzushi`) et renvoie vers les fiches où il sert.
 */
export type CategorieTerme = 'principes' | 'dojo' | 'combat' | 'pratique' | 'techniques' | 'grades'

export interface Terme {
  /** Identifiant d'ancre : minuscules et tirets. */
  id: string
  nom: string
  /** Écriture japonaise. */
  jp: string
  /** La traduction en quelques mots. */
  sens: string
  definition: string
  categorie: CategorieTerme
  /** Fiches du catalogue où le terme se voit. */
  techniques?: string[]
  /** Page d'une famille de techniques. */
  famille?: FamilyGroup
  /** Page d'une ceinture. */
  ceinture?: BeltId
  /** Autres termes du lexique à lire avec celui-ci. */
  voir?: string[]
}

export const CATEGORIES: { id: CategorieTerme; titre: string; intro: string }[] = [
  { id: 'principes', titre: 'Principes', intro: "Les idées sur lesquelles Jigoro Kano a fondé le judo, et les trois temps de toute technique." },
  { id: 'dojo', titre: 'Le dojo et ses rôles', intro: "Le lieu, la tenue, ceux qui y pratiquent et la manière de s'y saluer." },
  { id: 'combat', titre: 'Combat et arbitrage', intro: "Ce que dit l'arbitre et ce qui se marque." },
  { id: 'pratique', titre: "Façons de s'entraîner", intro: 'Chuter, répéter, combattre à l’entraînement, exécuter une forme.' },
  { id: 'techniques', titre: 'Les techniques', intro: 'Les grandes familles, et les mots qui décrivent comment elles se suivent.' },
  { id: 'grades', titre: 'Grades et katas', intro: 'Kyu, dan, et les formes imposées à la ceinture noire.' },
]

export const TERMES: Terme[] = [
  // ── Principes ────────────────────────────────────────────────────────
  {
    id: 'judo',
    nom: 'Judo',
    jp: '柔道',
    sens: 'La voie de la souplesse',
    categorie: 'principes',
    definition:
      "Art martial et sport de combat créé par Jigoro Kano en 1882 au Kodokan, à Tokyo. Il se pratique en kimono, debout et au sol, et cherche à vaincre en cédant plutôt qu'en opposant la force à la force : ju, la souplesse ; do, la voie.",
    voir: ['ju', 'kodokan'],
  },
  {
    id: 'ju',
    nom: 'Ju',
    jp: '柔',
    sens: 'Souplesse, céder',
    categorie: 'principes',
    definition:
      "Le principe de souplesse : adapter sa force à celle du partenaire au lieu de la heurter. Si uke pousse, tori peut tirer ; s'il tire, tori peut avancer. C'est l'idée que le mot « judo » porte dans son nom.",
    voir: ['judo', 'kuzushi'],
  },
  {
    id: 'kodokan',
    nom: 'Kodokan',
    jp: '講道館',
    sens: "Le lieu où l'on enseigne la voie",
    categorie: 'principes',
    definition:
      "L'institut fondé par Jigoro Kano en 1882 à Tokyo, berceau et référence du judo. C'est lui qui a classé les projections dans le Gokyo et dont la nomenclature fait autorité ; ses démonstrations filmées servent de référence sur ce site.",
    voir: ['gokyo', 'judo'],
  },
  {
    id: 'seiryoku-zenyo',
    nom: "Seiryoku zen'yo",
    jp: '精力善用',
    sens: "Le meilleur emploi de l'énergie",
    categorie: 'principes',
    definition:
      "L'un des deux principes du judo selon Jigoro Kano : employer son énergie physique et mentale de la manière la plus efficace, à l'entraînement comme dans la vie courante. Une technique de judo réussie en est l'illustration : peu de force, beaucoup d'effet.",
    voir: ['jita-kyoei', 'kuzushi'],
  },
  {
    id: 'jita-kyoei',
    nom: 'Jita kyoei',
    jp: '自他共栄',
    sens: 'Entraide et prospérité mutuelle',
    categorie: 'principes',
    definition:
      "L'autre principe de Jigoro Kano : progresser ensemble. Le judo se pratique à deux, et l'on ne devient meilleur qu'avec un partenaire qui progresse aussi. On ne gagne pas contre lui, on avance avec lui.",
    voir: ['seiryoku-zenyo', 'tori', 'uke'],
  },
  {
    id: 'kuzushi',
    nom: 'Kuzushi',
    jp: '崩し',
    sens: 'Déséquilibre',
    categorie: 'principes',
    definition:
      "Le déséquilibre : rompre l'équilibre de uke avant de le projeter. C'est le premier des trois temps d'une technique, et le plus important. Sans kuzushi, la projection demande de la force ; avec lui, elle en demande peu. Il se travaille dans huit directions.",
    techniques: ['o-goshi', 'de-ashi-barai', 'tai-otoshi'],
    voir: ['happo-no-kuzushi', 'tsukuri', 'kake'],
  },
  {
    id: 'happo-no-kuzushi',
    nom: 'Happo no kuzushi',
    jp: '八方の崩し',
    sens: 'Les huit directions du déséquilibre',
    categorie: 'principes',
    definition:
      "Les huit directions dans lesquelles on peut déséquilibrer uke : avant, arrière, droite, gauche et les quatre diagonales. Les quatre diagonales forment les secteurs de chute que le programme de la ceinture noire demande de savoir attaquer.",
    voir: ['kuzushi', 'dan'],
  },
  {
    id: 'tsukuri',
    nom: 'Tsukuri',
    jp: '作り',
    sens: 'Préparation, placement',
    categorie: 'principes',
    definition:
      "Le deuxième temps : tori place son corps, ses pieds et ses saisies pour se mettre en position de projeter uke, déjà déséquilibré. Un bon tsukuri est rapide et ne laisse pas à uke le temps de rétablir son équilibre.",
    techniques: ['o-goshi', 'harai-goshi'],
    voir: ['kuzushi', 'kake'],
  },
  {
    id: 'kake',
    nom: 'Kake',
    jp: '掛け',
    sens: 'Exécution',
    categorie: 'principes',
    definition:
      "Le troisième temps : l'exécution de la technique, le moment où tori projette. Kuzushi, tsukuri et kake s'enchaînent sans pause ; on les sépare pour les apprendre, jamais pour les exécuter.",
    techniques: ['o-goshi', 'uchi-mata-hanche'],
    voir: ['kuzushi', 'tsukuri'],
  },

  // ── Le dojo et ses rôles ─────────────────────────────────────────────
  {
    id: 'tori',
    nom: 'Tori',
    jp: '取り',
    sens: 'Celui qui prend',
    categorie: 'dojo',
    definition:
      "Celui qui exécute la technique. Les rôles s'échangent sans cesse : en randori, chacun est tour à tour tori et uke.",
    voir: ['uke', 'randori'],
  },
  {
    id: 'uke',
    nom: 'Uke',
    jp: '受け',
    sens: 'Celui qui reçoit',
    categorie: 'dojo',
    definition:
      "Celui qui reçoit la technique et chute. Un bon uke attaque sincèrement, offre une résistance juste et sait chuter sans se blesser : c'est un rôle à part entière, qui s'apprend.",
    voir: ['tori', 'ukemi'],
  },
  {
    id: 'dojo',
    nom: 'Dojo',
    jp: '道場',
    sens: 'Le lieu de la voie',
    categorie: 'dojo',
    definition:
      "La salle où l'on pratique. Son sol est recouvert de tatami, et l'on y salue en entrant comme en sortant. C'est aussi le nom de l'écran de révision de ce site.",
    voir: ['tatami', 'rei', 'sensei'],
  },
  {
    id: 'tatami',
    nom: 'Tatami',
    jp: '畳',
    sens: 'Les tapis du dojo',
    categorie: 'dojo',
    definition:
      "Les tapis qui recouvrent le sol du dojo et amortissent les chutes. Au Japon, le mot désigne d'abord la natte traditionnelle en paille de riz ; en judo, la surface de pratique.",
    voir: ['dojo', 'ukemi'],
  },
  {
    id: 'sensei',
    nom: 'Sensei',
    jp: '先生',
    sens: 'Professeur',
    categorie: 'dojo',
    definition: "Le professeur. Titre de respect donné à celui qui enseigne le judo, au dojo comme en dehors.",
    voir: ['dojo', 'rei'],
  },
  {
    id: 'judoka',
    nom: 'Judoka',
    jp: '柔道家',
    sens: 'Pratiquant de judo',
    categorie: 'dojo',
    definition: "Celui qui pratique le judo, quel que soit son niveau, de la ceinture blanche à la noire.",
    voir: ['judo'],
  },
  {
    id: 'judogi',
    nom: 'Judogi',
    jp: '柔道着',
    sens: 'La tenue de judo',
    categorie: 'dojo',
    definition:
      "La tenue : une veste, un pantalon et une ceinture. Les saisies se font sur le tissu, ce qui explique sa solidité. On l'appelle couramment « kimono », même si ce mot désigne autre chose au Japon.",
    voir: ['obi', 'kumi-kata'],
  },
  {
    id: 'obi',
    nom: 'Obi',
    jp: '帯',
    sens: 'La ceinture',
    categorie: 'dojo',
    definition:
      "La ceinture, qui maintient la veste et indique le grade. Dans la progression française, les couleurs se suivent ainsi : blanche, jaune, orange, verte, bleue, marron, puis noire.",
    ceinture: 'jaune',
    voir: ['kyu', 'dan'],
  },
  {
    id: 'rei',
    nom: 'Rei',
    jp: '礼',
    sens: 'Le salut',
    categorie: 'dojo',
    definition:
      "Le salut, debout ou à genoux, qui ouvre et clôt le travail avec un partenaire. Il exprime le respect, l'une des valeurs du code moral du judo.",
    voir: ['dojo', 'sensei'],
  },

  // ── Combat et arbitrage ──────────────────────────────────────────────
  {
    id: 'hajime',
    nom: 'Hajime',
    jp: '始め',
    sens: 'Commencez',
    categorie: 'combat',
    definition: "L'ordre de l'arbitre qui lance le combat, ou le relance après un arrêt.",
    voir: ['matte', 'sore-made'],
  },
  {
    id: 'matte',
    nom: 'Matte',
    jp: '待て',
    sens: 'Attendez, stop',
    categorie: 'combat',
    definition:
      "L'ordre d'arrêter momentanément : les combattants s'immobilisent et reprennent leur place, jusqu'au prochain hajime.",
    voir: ['hajime', 'sore-made'],
  },
  {
    id: 'sore-made',
    nom: 'Sore made',
    jp: 'それまで',
    sens: "C'est fini",
    categorie: 'combat',
    definition: "L'annonce de la fin du combat, quand le temps est écoulé ou que la victoire est acquise.",
    voir: ['hajime', 'ippon'],
  },
  {
    id: 'ippon',
    nom: 'Ippon',
    jp: '一本',
    sens: 'Un point entier',
    categorie: 'combat',
    definition:
      "Le score maximal, qui met fin au combat : une projection franche sur le dos avec force et vitesse, un abandon, ou une immobilisation tenue 20 secondes. C'est l'idéal que vise toute technique de judo.",
    voir: ['waza-ari', 'osaekomi'],
  },
  {
    id: 'waza-ari',
    nom: 'Waza-ari',
    jp: '技あり',
    sens: 'Presque un ippon',
    categorie: 'combat',
    definition:
      "Un score inférieur à l'ippon : la technique était bonne mais lui manquait un élément, la force, la vitesse ou la chute sur le dos. Au sol, une immobilisation de 10 à 19 secondes vaut waza-ari.",
    voir: ['ippon', 'yuko'],
  },
  {
    id: 'yuko',
    nom: 'Yuko',
    jp: '有効',
    sens: 'Efficace',
    categorie: 'combat',
    definition:
      "Un score inférieur au waza-ari. Supprimé des règles de la Fédération internationale de judo en 2017, il y est revenu en 2025, pour l'olympiade qui mène aux Jeux de Los Angeles 2028. Au sol, il est attribué dès 5 secondes d'immobilisation ; debout, il récompense une projection qui n'atteint pas le waza-ari, par exemple une chute sur le côté, sur le coude ou sur les fesses.",
    voir: ['waza-ari', 'ippon', 'osaekomi'],
  },
  {
    id: 'shido',
    nom: 'Shido',
    jp: '指導',
    sens: 'Directive, pénalité',
    categorie: 'combat',
    definition:
      "Une pénalité que l'arbitre inflige pour une faute légère, comme une attitude trop défensive ou une saisie interdite. Les shidos s'accumulent et peuvent mener à la disqualification.",
    voir: ['hansoku-make'],
  },
  {
    id: 'hansoku-make',
    nom: 'Hansoku-make',
    jp: '反則負け',
    sens: 'Défaite par faute',
    categorie: 'combat',
    definition: "La disqualification, prononcée pour une faute grave ou à force de pénalités accumulées.",
    voir: ['shido'],
  },
  {
    id: 'osaekomi',
    nom: 'Osaekomi',
    jp: '抑込',
    sens: 'Immobilisation',
    categorie: 'combat',
    definition:
      "L'annonce qui déclenche le chronomètre quand uke est immobilisé sur le dos. Tenue 5 secondes, l'immobilisation vaut yuko ; 10 secondes, waza-ari ; 20 secondes, ippon. Si uke s'en libère avant, l'arbitre annonce toketa.",
    techniques: ['kesa-gatame', 'yoko-shiho-gatame'],
    famille: 'ne-waza',
    voir: ['osaekomi-waza', 'toketa'],
  },
  {
    id: 'toketa',
    nom: 'Toketa',
    jp: '解けた',
    sens: 'Immobilisation rompue',
    categorie: 'combat',
    definition: "L'annonce que l'immobilisation est rompue : uke s'est libéré, le chronomètre s'arrête.",
    voir: ['osaekomi'],
  },
  {
    id: 'shiai',
    nom: 'Shiai',
    jp: '試合',
    sens: 'Compétition',
    categorie: 'combat',
    definition: "Le combat officiel, avec un arbitre, un temps limité et un résultat. S'oppose au randori, où personne ne cherche à gagner.",
    voir: ['randori'],
  },

  // ── Façons de s'entraîner ────────────────────────────────────────────
  {
    id: 'randori',
    nom: 'Randori',
    jp: '乱取',
    sens: 'Prise libre',
    categorie: 'pratique',
    definition:
      "Le combat d'entraînement libre : chacun attaque et défend à sa guise, sans enjeu, pour essayer ses techniques et sentir celles de l'autre. C'est le moyen de progresser le plus complet, parce qu'il oblige à s'adapter.",
    voir: ['shiai', 'uchi-komi'],
  },
  {
    id: 'uchi-komi',
    nom: 'Uchi-komi',
    jp: '打込',
    sens: "Répétition de l'entrée",
    categorie: 'pratique',
    definition:
      "La répétition de l'entrée d'une technique, sans projeter, pour en graver le geste : saisie, déséquilibre, placement. C'est l'exercice de base pour installer un tokui-waza.",
    voir: ['nage-komi', 'tokui-waza'],
  },
  {
    id: 'nage-komi',
    nom: 'Nage-komi',
    jp: '投込',
    sens: 'Répétition avec projection',
    categorie: 'pratique',
    definition: "La même répétition qu'à l'uchi-komi, mais avec projection, uke chutant à chaque fois.",
    voir: ['uchi-komi', 'ukemi'],
  },
  {
    id: 'ukemi',
    nom: 'Ukemi',
    jp: '受身',
    sens: "L'art de chuter",
    categorie: 'pratique',
    definition:
      "Les chutes : en arrière, sur le côté, en avant et roulée. C'est le premier apprentissage, parce qu'il rend tout le reste possible sans danger. Il figure au programme de la ceinture jaune.",
    ceinture: 'jaune',
    voir: ['uke', 'tatami'],
  },
  {
    id: 'kumi-kata',
    nom: 'Kumi-kata',
    jp: '組み方',
    sens: 'La saisie',
    categorie: 'pratique',
    definition:
      "La manière de saisir le judogi de l'adversaire, qui précède et prépare le kuzushi. Une bonne saisie permet d'attaquer ; celui qui domine la saisie domine souvent le combat.",
    voir: ['judogi', 'kuzushi', 'ai-yotsu'],
  },
  {
    id: 'ai-yotsu',
    nom: 'Ai-yotsu',
    jp: '相四つ',
    sens: 'Même garde',
    categorie: 'pratique',
    definition:
      "Les deux judokas ont la même garde, tous deux droitiers ou tous deux gauchers : leurs hanches se présentent de face. S'oppose à kenka-yotsu.",
    voir: ['kenka-yotsu', 'migi-kumi'],
  },
  {
    id: 'kenka-yotsu',
    nom: 'Kenka-yotsu',
    jp: '喧嘩四つ',
    sens: 'Garde croisée',
    categorie: 'pratique',
    definition: "Un droitier face à un gaucher. Les saisies et les attaques changent : telle projection qui passait en ai-yotsu devient difficile, et inversement.",
    voir: ['ai-yotsu'],
  },
  {
    id: 'migi-kumi',
    nom: 'Migi-kumi, hidari-kumi',
    jp: '右組・左組',
    sens: 'Garde droite, garde gauche',
    categorie: 'pratique',
    definition:
      "La garde du judoka. En migi-kumi, la main droite saisit le revers et le pied droit est devant ; en hidari-kumi, c'est l'inverse. Elle renverse la lecture des techniques, des coins de chute et de la carte de Mon judo.",
    voir: ['ai-yotsu', 'kenka-yotsu'],
  },
  {
    id: 'kata',
    nom: 'Kata',
    jp: '形',
    sens: 'Forme',
    categorie: 'pratique',
    definition:
      "Un enchaînement codifié de techniques, exécuté à deux avec un partenaire coopératif. Les katas transmettent les principes du judo sous leur forme la plus pure ; deux d'entre eux, le nage no kata et le katame no kata, sont au programme de la ceinture noire.",
    voir: ['nage-no-kata', 'katame-no-kata', 'dan'],
  },

  // ── Les techniques ───────────────────────────────────────────────────
  {
    id: 'waza',
    nom: 'Waza',
    jp: '技',
    sens: 'Technique',
    categorie: 'techniques',
    definition: "Une technique. Le mot entre dans le nom de toutes les familles : te-waza, koshi-waza, ashi-waza, ne-waza…",
    voir: ['nage-waza', 'katame-waza'],
  },
  {
    id: 'nage-waza',
    nom: 'Nage-waza',
    jp: '投技',
    sens: 'Techniques de projection',
    categorie: 'techniques',
    definition:
      "Les techniques de projection, faites debout : te-waza (bras), koshi-waza (hanche), ashi-waza (jambe) et sutemi-waza (sacrifice). Selon la ceinture, elles occupent de 40 à 60 % du programme.",
    famille: 'te-waza',
    voir: ['tachi-waza', 'te-waza', 'koshi-waza', 'ashi-waza', 'sutemi-waza'],
  },
  {
    id: 'katame-waza',
    nom: 'Katame-waza',
    jp: '固技',
    sens: 'Techniques de contrôle',
    categorie: 'techniques',
    definition:
      "Les techniques de contrôle, qui se font au sol : les immobilisations (osaekomi-waza), les étranglements (shime-waza) et les clés articulaires (kansetsu-waza).",
    famille: 'ne-waza',
    voir: ['ne-waza', 'osaekomi-waza', 'shime-waza', 'kansetsu-waza'],
  },
  {
    id: 'tachi-waza',
    nom: 'Tachi-waza',
    jp: '立技',
    sens: 'Techniques debout',
    categorie: 'techniques',
    definition: "Le travail debout, par opposition au travail au sol. Il comprend les projections et tout ce qui les prépare : saisies, déplacements, déséquilibres.",
    voir: ['nage-waza', 'ne-waza'],
  },
  {
    id: 'ne-waza',
    nom: 'Ne-waza',
    jp: '寝技',
    sens: 'Travail au sol',
    categorie: 'techniques',
    definition:
      "Le travail au sol, qui commence quand le combat quitte la position debout. Il regroupe les trois familles de katame-waza et les situations d'étude du programme : retourner uke, dégager une jambe, reprendre l'initiative en position inférieure.",
    famille: 'ne-waza',
    voir: ['katame-waza', 'tachi-waza'],
  },
  {
    id: 'te-waza',
    nom: 'Te-waza',
    jp: '手技',
    sens: 'Techniques de bras',
    categorie: 'techniques',
    definition:
      "Les projections où l'effort vient surtout des bras et des épaules : seoi-nage, tai-otoshi, kata-guruma, sukui-nage. Tori tire, pousse ou soulève, les hanches et les jambes servant d'appui.",
    techniques: ['ippon-seoi-nage', 'tai-otoshi'],
    famille: 'te-waza',
    voir: ['nage-waza'],
  },
  {
    id: 'koshi-waza',
    nom: 'Koshi-waza',
    jp: '腰技',
    sens: 'Techniques de hanche',
    categorie: 'techniques',
    definition:
      "Les projections où uke est chargé sur la hanche : tori place son bassin plus bas que celui de uke et le fait basculer. O-goshi, harai-goshi et uki-goshi en sont les exemples les plus connus.",
    techniques: ['o-goshi', 'harai-goshi'],
    famille: 'koshi-waza',
    voir: ['nage-waza'],
  },
  {
    id: 'ashi-waza',
    nom: 'Ashi-waza',
    jp: '足技',
    sens: 'Techniques de jambe',
    categorie: 'techniques',
    definition:
      "Les projections qui attaquent les appuis de uke avec le pied ou la jambe : balayer, faucher, crocheter, bloquer. De-ashi-barai, o-soto-gari et ko-uchi-gari en sont des exemples.",
    techniques: ['de-ashi-barai', 'o-soto-gari'],
    famille: 'ashi-waza',
    voir: ['nage-waza'],
  },
  {
    id: 'sutemi-waza',
    nom: 'Sutemi-waza',
    jp: '捨身技',
    sens: 'Techniques de sacrifice',
    categorie: 'techniques',
    definition:
      "Les projections où tori se laisse tomber pour entraîner uke. On distingue les ma-sutemi-waza, où tori tombe en arrière sur le dos (tomoe-nage), et les yoko-sutemi-waza, où il tombe sur le côté (yoko-guruma).",
    techniques: ['tomoe-nage', 'yoko-guruma'],
    famille: 'sutemi-waza',
    voir: ['nage-waza'],
  },
  {
    id: 'osaekomi-waza',
    nom: 'Osaekomi-waza',
    jp: '抑込技',
    sens: 'Immobilisations',
    categorie: 'techniques',
    definition:
      "Les techniques d'immobilisation : tenir uke sur le dos, de façon qu'il ne puisse pas se dégager. Kesa-gatame, yoko-shiho-gatame et tate-shiho-gatame sont les premières que l'on apprend.",
    techniques: ['kesa-gatame', 'yoko-shiho-gatame', 'tate-shiho-gatame'],
    famille: 'ne-waza',
    voir: ['osaekomi', 'katame-waza'],
  },
  {
    id: 'shime-waza',
    nom: 'Shime-waza',
    jp: '絞技',
    sens: 'Étranglements',
    categorie: 'techniques',
    definition:
      "Les étranglements, qui contraignent l'adversaire à abandonner par compression du cou. Ils s'apprennent avec un partenaire qui sait quand taper pour signaler l'abandon, et ne s'exécutent jamais pour de bon à l'entraînement.",
    techniques: ['hadaka-jime', 'okuri-eri-jime'],
    famille: 'ne-waza',
    voir: ['katame-waza'],
  },
  {
    id: 'kansetsu-waza',
    nom: 'Kansetsu-waza',
    jp: '関節技',
    sens: 'Clés articulaires',
    categorie: 'techniques',
    definition:
      "Les clés articulaires, qui forcent une articulation au-delà de son amplitude. En compétition, seules les clés de coude sont autorisées.",
    techniques: ['ude-hishigi-juji-gatame', 'ude-garami'],
    famille: 'ne-waza',
    voir: ['katame-waza'],
  },
  {
    id: 'tokui-waza',
    nom: 'Tokui-waza',
    jp: '得意技',
    sens: 'Technique de prédilection',
    categorie: 'techniques',
    definition:
      "La technique dont le judoka a fait son arme : celle qu'il cherche, qu'il place, et autour de laquelle le reste de son judo s'organise. Elle se construit sur le tatami par des centaines de répétitions.",
    voir: ['uchi-komi', 'renraku-waza'],
  },
  {
    id: 'renraku-waza',
    nom: 'Renraku-waza',
    jp: '連絡技',
    sens: 'Enchaînements',
    categorie: 'techniques',
    definition:
      "Les enchaînements : attaquer une seconde technique à partir de la réaction de uke à la première, ou après l'avoir manquée. La plupart des projections réussies en compétition sont le fruit d'une suite.",
    techniques: ['o-goshi', 'harai-goshi'],
    voir: ['kaeshi-waza', 'tokui-waza'],
  },
  {
    id: 'kaeshi-waza',
    nom: 'Kaeshi-waza',
    jp: '返技',
    sens: 'Contres',
    categorie: 'techniques',
    definition:
      "Les contres : utiliser l'attaque de uke pour le projeter lui-même. O-soto-gaeshi, par exemple, répond à un o-soto-gari.",
    techniques: ['o-soto-gaeshi', 'ushiro-goshi'],
    voir: ['renraku-waza'],
  },
  {
    id: 'gokyo',
    nom: 'Gokyo',
    jp: '五教',
    sens: 'Les cinq groupes',
    categorie: 'techniques',
    definition:
      "La classification des projections par le Kodokan en cinq groupes de huit techniques, du plus simple au plus difficile. Elle a longtemps servi de base à l'enseignement des projections.",
    voir: ['kodokan', 'nage-waza'],
  },

  // ── Grades et katas ──────────────────────────────────────────────────
  {
    id: 'kyu',
    nom: 'Kyu',
    jp: '級',
    sens: 'Grade avant la ceinture noire',
    categorie: 'grades',
    definition:
      "Les grades qui précèdent la ceinture noire. Ils décroissent à mesure que l'on progresse : dans la progression française, la ceinture jaune est le 5ᵉ kyu et la marron le 1ᵉʳ kyu.",
    ceinture: 'jaune',
    voir: ['dan', 'obi'],
  },
  {
    id: 'dan',
    nom: 'Dan',
    jp: '段',
    sens: 'Grade de ceinture noire',
    categorie: 'grades',
    definition:
      "Les grades de la ceinture noire, qui croissent à partir du premier. Chaque dan se compose d'unités de valeur passées séparément : kata, technique, efficacité et engagement personnel.",
    voir: ['shodan', 'kyu'],
  },
  {
    id: 'shodan',
    nom: 'Shodan',
    jp: '初段',
    sens: 'Premier dan',
    categorie: 'grades',
    definition: "Le premier dan : la ceinture noire. Le programme n'y ajoute aucune technique nouvelle, mais demande un système d'attaque autour du tokui-waza, un système de défense et l'étude d'un kata.",
    voir: ['dan', 'tokui-waza'],
  },
  {
    id: 'nage-no-kata',
    nom: 'Nage no kata',
    jp: '投の形',
    sens: 'La forme des projections',
    categorie: 'grades',
    definition:
      "Le kata des projections : quinze techniques en cinq séries de trois, chacune exécutée à droite puis à gauche. Il est au programme de la ceinture noire, en partie au premier dan, en entier au deuxième.",
    voir: ['kata', 'katame-no-kata'],
  },
  {
    id: 'katame-no-kata',
    nom: 'Katame no kata',
    jp: '固の形',
    sens: 'La forme des techniques de contrôle',
    categorie: 'grades',
    definition:
      "Le kata des techniques de contrôle au sol : immobilisations, étranglements et clés. Il est au programme du troisième dan.",
    voir: ['kata', 'nage-no-kata'],
  },
  {
    id: 'kodokan-goshin-jitsu',
    nom: 'Kodokan goshin jitsu',
    jp: '講道館護身術',
    sens: "La forme d'autodéfense du Kodokan",
    categorie: 'grades',
    definition:
      "Le kata d'autodéfense du Kodokan, qui peut remplacer le nage no kata comme kata de la ceinture noire. Il oppose un défenseur à des attaques de la vie courante.",
    voir: ['kata', 'nage-no-kata'],
  },
]

export const termeParId = (id: string) => TERMES.find((t) => t.id === id)
