/**
 * Programme des trois premiers dan, relevé sur les documents de la Commission
 * spéciale des dan et grades équivalents de la fédération française :
 * « Référentiel des juges 2024/2025 » et la feuille d'évaluation FEDT-1A.
 *
 * Les listes sont celles des programmes techniques du référentiel. Elles ne
 * sont pas reformulées : seuls les identifiants de fiche sont ajoutés pour
 * relier chaque technique à son entrée du catalogue.
 *
 * Le référentiel décrit UV1, UV2 et UV4. Il ne traite pas l'UV3, qui ne relève
 * pas des juges de kata et de technique : ce qui en est dit ici s'en tient
 * donc au principe de l'unité, sans détail d'épreuve.
 */

export const DAN_SOURCE = 'CSDGE — Référentiel des juges 2024/2025'

export type DanId = 1 | 2 | 3
export type UvCode = 'UV1' | 'UV2' | 'UV3' | 'UV4'

export interface Uv {
  code: UvCode
  label: string
  jp: string
  /** Résumé de l'épreuve en une phrase. */
  resume: string
  /** Ce que le jury regarde. */
  criteres: string[]
  /** Points de règlement à connaître avant de se présenter. */
  regles: string[]
}

/* ----------------------------------------------------------------- katas */

export interface KataSerie {
  num: number
  label: string
  jp: string
  /** Identifiants de fiche, dans l'ordre du kata. */
  slugs: string[]
  /** Techniques du kata absentes du catalogue, affichées sans lien. */
  horsCatalogue?: Record<string, string>
}

export interface Kata {
  id: 'nage-no-kata' | 'katame-no-kata' | 'kodokan-goshin-jitsu'
  name: string
  jp: string
  resume: string
  series: KataSerie[]
  /** Repères de déroulement valables pour tout le kata. */
  reperes: string[]
  /**
   * Sections du kata qui sortent du répertoire judo et n'ont donc pas de
   * fiche : on les nomme sans prétendre les documenter.
   */
  sansFiches?: { label: string; jp: string; body: string }[]
}

export const NAGE_NO_KATA: Kata = {
  id: 'nage-no-kata',
  name: 'Nage no kata',
  jp: '投の形',
  resume:
    'Quinze projections en cinq séries de trois, chacune exécutée à droite puis à gauche.',
  series: [
    { num: 1, label: 'Techniques de bras', jp: '手技', slugs: ['uki-otoshi', 'ippon-seoi-nage', 'kata-guruma'] },
    { num: 2, label: 'Techniques de hanche', jp: '腰技', slugs: ['uki-goshi', 'harai-goshi', 'tsurikomi-goshi'] },
    { num: 3, label: 'Techniques de jambe', jp: '足技', slugs: ['okuri-ashi-barai', 'sasae-tsurikomi-ashi', 'uchi-mata-jambe'] },
    { num: 4, label: 'Sacrifices en arrière', jp: '真捨身技', slugs: ['tomoe-nage', 'ura-nage', 'sumi-gaeshi'] },
    { num: 5, label: 'Sacrifices sur le côté', jp: '横捨身技', slugs: ['yoko-gake', 'yoko-guruma', 'uki-waza'] },
  ],
  reperes: [
    'Salut debout au joseki, puis entre partenaires, avant et après le kata.',
    'Chaque technique est exécutée deux fois : à droite, puis à gauche.',
    'Uke attaque sincèrement et donne le déséquilibre que la technique exige.',
    'Tori se replace après chaque projection ; les partenaires reviennent à la distance de départ.',
    'Le rythme est constant : ni précipitation, ni temps mort entre les techniques.',
  ],
}

export const KATAME_NO_KATA: Kata = {
  id: 'katame-no-kata',
  name: 'Katame no kata',
  jp: '固の形',
  resume: 'Quinze contrôles au sol en trois séries de cinq : immobiliser, étrangler, luxer.',
  series: [
    {
      num: 1,
      label: 'Immobilisations',
      jp: '抑込技',
      slugs: ['kesa-gatame', 'kata-gatame', 'kami-shiho-gatame', 'yoko-shiho-gatame', 'kuzure-kami-shiho-gatame'],
    },
    {
      num: 2,
      label: 'Étranglements',
      jp: '絞技',
      slugs: ['kata-juji-jime', 'hadaka-jime', 'okuri-eri-jime', 'kata-ha-jime', 'gyaku-juji-jime'],
    },
    {
      num: 3,
      label: 'Clés',
      jp: '関節技',
      slugs: ['ude-garami', 'ude-hishigi-juji-gatame', 'ude-hishigi-ude-gatame', 'ude-hishigi-hiza-gatame', 'ashi-garami'],
      // Ashi-garami est une clé de jambe : elle ne figure pas au répertoire
      // judo du catalogue, mais elle clôt bien la troisième série.
      horsCatalogue: { 'ashi-garami': 'Ashi-Garami · 足緘 · Enroulement de jambe' },
    },
  ],
  reperes: [
    'Le kata se déroule à genoux, uke et tori partant de la position de départ à chaque technique.',
    "Chaque technique n'est exécutée qu'une fois, à droite.",
    'Uke résiste sincèrement selon un schéma convenu, puis abandonne en frappant deux fois.',
    'Tori maintient le contrôle vingt à trente secondes pour les immobilisations.',
    'Les partenaires reviennent à la position de départ entre chaque technique.',
  ],
}

export const KODOKAN_GOSHIN_JITSU: Kata = {
  id: 'kodokan-goshin-jitsu',
  name: 'Kodokan goshin jitsu',
  jp: '講道館護身術',
  resume:
    "Vingt et une défenses contre des attaques à mains nues puis armées. Elles sortent du répertoire judo et n'ont pas de fiche.",
  series: [],
  reperes: [
    "Le kata se présente en tori uniquement pour l'examen, avec un partenaire de son choix.",
    'Le cérémonial et le maniement des armes sont notés au même titre que les techniques.',
    'Les armes sont posées, saluées et reprises selon un protocole fixe.',
  ],
  sansFiches: [
    { label: 'Contre attaques à mains nues, à distance', jp: '徒手の部', body: 'Ryote-dori, hidari-eri-dori, migi-eri-dori, kata-ude-dori, ushiro-eri-dori, ushiro-jime, kakae-dori.' },
    { label: 'Contre attaques à mains nues, au contact', jp: '徒手の部', body: 'Naname-uchi, ago-tsuki, gammen-tsuki, mae-geri, yoko-geri.' },
    { label: 'Contre attaques armées', jp: '武器の部', body: 'Couteau : tsukkake, choku-tsuki, naname-tsuki. Bâton : furi-age, furi-oroshi, morote-tsuki. Pistolet : shomen-zuke, koshi-gamae, haimen-zuke.' },
  ],
}

export const KATAS: Kata[] = [NAGE_NO_KATA, KATAME_NO_KATA, KODOKAN_GOSHIN_JITSU]

/* ------------------------------------------------- programmes techniques */

export type Groupe = 'koshi' | 'te' | 'ashi' | 'sutemi' | 'osaekomi' | 'shime' | 'kansetsu'

export interface GroupeMeta {
  id: Groupe
  label: string
  jp: string
  domaine: 'nage' | 'ne'
}

export const GROUPES: GroupeMeta[] = [
  { id: 'koshi', label: 'Hanche', jp: '腰技', domaine: 'nage' },
  { id: 'te', label: 'Bras', jp: '手技', domaine: 'nage' },
  { id: 'ashi', label: 'Jambe', jp: '足技', domaine: 'nage' },
  { id: 'sutemi', label: 'Sacrifice', jp: '捨身技', domaine: 'nage' },
  { id: 'osaekomi', label: 'Immobilisation', jp: '抑込技', domaine: 'ne' },
  { id: 'shime', label: 'Étranglement', jp: '絞技', domaine: 'ne' },
  { id: 'kansetsu', label: 'Clé de coude', jp: '関節技', domaine: 'ne' },
]

export const GROUPES_NAGE: Groupe[] = ['koshi', 'te', 'ashi', 'sutemi']
export const GROUPES_NE: Groupe[] = ['osaekomi', 'shime', 'kansetsu']

export const groupeMeta = (id: Groupe) => GROUPES.find((g) => g.id === id)!

/** Programme technique d'un grade : une liste par famille. */
export type Programme = Record<Groupe, string[]>

/**
 * Programmes techniques du référentiel, une colonne par grade. Chaque grade a
 * sa propre liste : le jury n'y puise que dans celle du grade présenté.
 *
 * Uchi-mata figure deux fois au 1er dan, en koshi-waza et en ashi-waza. Le
 * catalogue sépare déjà la forme hanche de la forme jambe, et le classement du
 * référentiel recouvre exactement cette distinction.
 */
export const PROGRAMMES: Record<DanId, Programme> = {
  1: {
    koshi: ['harai-goshi', 'kubi-nage', 'koshi-guruma', 'o-goshi', 'tsurikomi-goshi', 'uchi-mata-hanche', 'uki-goshi'],
    te: ['ippon-seoi-nage', 'kata-guruma', 'uki-otoshi', 'tai-otoshi', 'morote-seoi-nage'],
    ashi: [
      'de-ashi-barai',
      'hiza-guruma',
      'sasae-tsurikomi-ashi',
      'ko-soto-gari',
      'ko-uchi-gari',
      'okuri-ashi-barai',
      'o-soto-gari',
      'o-uchi-gari',
      'uchi-mata-jambe',
    ],
    sutemi: ['sumi-gaeshi', 'tomoe-nage'],
    osaekomi: ['hon-gesa-gatame', 'kami-shiho-gatame', 'yoko-shiho-gatame', 'tate-shiho-gatame', 'ushiro-kesa-gatame'],
    shime: ['gyaku-juji-jime', 'hadaka-jime', 'kata-juji-jime', 'nami-juji-jime', 'okuri-eri-jime'],
    kansetsu: ['ude-hishigi-juji-gatame', 'ude-hishigi-ude-gatame', 'ude-garami'],
  },
  2: {
    koshi: ['hane-goshi', 'sode-tsurikomi-goshi', 'tsuri-goshi'],
    te: ['eri-seoi-nage', 'te-guruma', 'morote-gari', 'kuchiki-taoshi'],
    ashi: ['o-guruma', 'ashi-guruma', 'ko-soto-gake', 'o-soto-otoshi', 'tsubame-gaeshi'],
    sutemi: ['ura-nage', 'tani-otoshi', 'yoko-guruma', 'yoko-gake', 'ko-uchi-makikomi', 'yoko-tomoe-nage', 'uki-waza'],
    osaekomi: ['kuzure-kami-shiho-gatame', 'kuzure-kesa-gatame', 'kuzure-tate-shiho-gatame', 'kuzure-yoko-shiho-gatame'],
    shime: ['sankaku-jime', 'kata-ha-jime', 'kata-te-jime', 'sode-guruma-jime'],
    kansetsu: ['ude-hishigi-hiza-gatame', 'ude-hishigi-waki-gatame'],
  },
  3: {
    koshi: ['utsuri-goshi', 'ushiro-goshi'],
    te: ['sumi-otoshi', 'kibisu-gaeshi', 'uchi-mata-sukashi', 'sukui-nage', 'yama-arashi', 'seoi-otoshi'],
    ashi: ['harai-tsurikomi-ashi', 'o-soto-guruma', 'o-soto-gaeshi'],
    sutemi: ['soto-makikomi', 'harai-makikomi', 'yoko-wakare', 'yoko-otoshi', 'tawara-gaeshi', 'daki-wakare'],
    osaekomi: ['makura-kesa-gatame', 'kata-gatame'],
    shime: ['morote-jime', 'tsukkomi-jime', 'ashi-gatame-jime', 'ryote-jime'],
    kansetsu: ['ude-hishigi-ashi-gatame', 'ude-hishigi-sankaku-gatame', 'ude-hishigi-hara-gatame'],
  },
}

/* ------------------------------------------------------------------ dan */

export interface KataExigence {
  /** Ce que demande la dominante compétition. */
  competition: string
  /** Ce que demande la dominante technique. */
  technique: string
  /** Katas à étudier pour ce grade. */
  katas: Kata['id'][]
  /**
   * Séries du nage no kata exigées, quand le grade n'en demande qu'une partie.
   * Absent quand le kata se présente en entier.
   */
  seriesNageNoKata?: number
}

export interface TirageRegle {
  /** Nombre de projections imposées par le jury. */
  nage: number
  /** Nombre de contrôles au sol imposés. */
  ne: number
  /**
   * Vrai quand le jury doit couvrir toutes les familles du domaine ; faux
   * quand il lui suffit de puiser dans des familles différentes.
   */
  toutesFamilles: boolean
  /** Formulation du règlement, pour l'afficher telle quelle. */
  note: string
  /**
   * Nombre total de techniques à l'épreuve, défenses comprises. Il dépasse le
   * nombre tiré : les défenses sont choisies par le candidat, pas imposées.
   */
  total: number
}

export interface Dan {
  id: DanId
  name: string
  jp: string
  /** Ce que le grade demande, en une phrase. */
  resume: string
  kata: KataExigence
  tirage: TirageRegle
  /** Séries des vingt attaques imposées où puiser les deux défenses. */
  defense: string
  uvs: Uv[]
}

const UV3 = (resume: string): Uv => ({
  code: 'UV3',
  label: 'Efficacité',
  jp: '効',
  resume,
  criteres: [
    'Résultats obtenus en compétition officielle sur la période retenue',
    "Ou, pour la dominante technique, la voie de l'expression technique",
  ],
  regles: [
    "L'unité est acquise définitivement, comme les trois autres.",
    'Le référentiel des juges ne traite pas cette unité : elle ne relève pas des juges de kata et de technique. Les modalités et les barèmes sont publiés à part par la fédération.',
  ],
})

const CRITERES_KATA = [
  'Efficacité des déséquilibres, kuzushi',
  'Justesse des placements, tsukuri',
  'Contrôle des projections, kake',
  'Posture, timing et distance',
  'Placements, déplacements, replacements',
  "Synergie entre les partenaires et respect de l'ordre des techniques",
  'Justesse et sincérité des attaques de uke, maîtrise des chutes',
]

const CRITERES_UV2 = [
  'Connaissance des techniques',
  'Respect des principes : kuzushi, tsukuri, kake',
  'Sécurité et contrôle du partenaire lors de la projection',
  'Efficacité des contrôles au sol, posture et appuis',
  'Réalisme et contrôle dans les réponses à une agression',
]

export const DANS: Dan[] = [
  {
    id: 1,
    name: '1er dan',
    jp: '初段',
    resume:
      'Les trois premières séries du nage no kata, douze techniques tirées par le jury, et le premier engagement dans la vie sportive.',
    kata: {
      competition: 'Les trois premières séries du nage no kata en tori, tout ou partie des trois séries en uke.',
      technique: 'Le nage no kata en entier, ou le kodokan goshin jitsu, en tori, et tout ou partie du kata choisi en uke.',
      katas: ['nage-no-kata', 'kodokan-goshin-jitsu'],
      seriesNageNoKata: 3,
    },
    tirage: {
      nage: 6,
      ne: 4,
      toutesFamilles: true,
      note: 'Six projections couvrant les quatre familles debout, quatre contrôles couvrant les trois familles au sol.',
      total: 12,
    },
    defense: 'Séries A et B',
    uvs: [
      {
        code: 'UV1',
        label: 'Kata',
        jp: '形',
        resume: 'Présenter le nage no kata avec un partenaire de son choix, en tori et en uke.',
        criteres: CRITERES_KATA,
        regles: [
          'Dominante compétition : les trois premières séries en tori, tout ou partie des trois séries en uke.',
          'Dominante technique : le nage no kata en entier, ou le kodokan goshin jitsu, en tori, et tout ou partie du kata choisi en uke.',
          'Les candidats les plus âgés ne présentent que le rôle de tori.',
          'Le choix du partenaire relève du candidat.',
          "Le jugement porte sur l'ensemble de la prestation, et non sur le seul relevé des fautes.",
          'Équivalence : podium aux championnats de France kata.',
        ],
      },
      {
        code: 'UV2',
        label: 'Technique',
        jp: '技',
        resume: 'Démontrer douze techniques tirées par le jury, plus deux défenses de son choix, en cinq minutes environ.',
        criteres: CRITERES_UV2,
        regles: [
          'Six techniques de projection imposées, couvrant les quatre familles, démontrées en déplacement.',
          "Quatre techniques au sol imposées, couvrant les trois familles, démontrées en situation d'étude.",
          'Deux techniques de défense au choix, sur deux attaques différentes des séries A et B.',
          "Une méconnaissance est admise par domaine. Deux entraînent le refus de l'unité.",
          "L'unité n'est pas fractionnable : tout se démontre devant un seul jury, dans l'ordre.",
          "Dominante technique seulement, seconde épreuve : uchi-komi de 1 min 30 sur avancée puis 1 min 30 sur recul, deux techniques minimum, puis deux exercices d'application de deux minutes, kakari-geiko ou yaku-soku-geiko.",
        ],
      },
      UV3("Établir son efficacité, par les résultats en compétition ou par la voie de l'expression technique."),
      {
        code: 'UV4',
        label: 'Engagement personnel',
        jp: '志',
        resume: "Servir comme commissaire sportif sur une animation ou une compétition. Ce n'est pas un examen.",
        criteres: [
          "Stage de commissaire sportif d'une demi-journée",
          "Encadrement d'une animation ou d'une compétition officielle sur deux demi-journées",
        ],
        regles: [
          'Accessible dès la ceinture marron.',
          "Validation par l'organisme territorial délégataire dont dépend le candidat.",
          'Équivalence : commissaire sportif départemental en activité.',
        ],
      },
    ],
  },
  {
    id: 2,
    name: '2e dan',
    jp: '弐段',
    resume:
      "Le nage no kata en entier, une démonstration dynamique, quatre techniques tirées dans le programme du grade, et l'arbitrage.",
    kata: {
      competition: 'Le nage no kata en entier, en tori.',
      technique: 'Le nage no kata ou le kodokan goshin jitsu en entier, en tori. Le kata doit être différent de celui présenté au 1er dan.',
      katas: ['nage-no-kata', 'kodokan-goshin-jitsu'],
    },
    tirage: {
      nage: 2,
      ne: 2,
      toutesFamilles: false,
      note: 'Deux projections issues de deux familles différentes, deux contrôles issus de deux familles différentes.',
      total: 6,
    },
    defense: 'Série C',
    uvs: [
      {
        code: 'UV1',
        label: 'Kata',
        jp: '形',
        resume: 'Présenter en entier, dans le rôle de tori, le nage no kata ou le kodokan goshin jitsu.',
        criteres: [...CRITERES_KATA, 'Sincérité dans les actions et réactions de tori et de uke', 'Précision technique'],
        regles: [
          'Dominante compétition : le nage no kata en entier, en tori.',
          'Dominante technique : le nage no kata ou le kodokan goshin jitsu, en entier, en tori. Le kata doit être différent de celui présenté au 1er dan.',
          "Les observables sont ceux du 1er dan, mais le candidat doit montrer un niveau supérieur au grade précédent et davantage d'interactions.",
          'Équivalence : podium aux championnats de France kata.',
        ],
      },
      {
        code: 'UV2',
        label: 'Technique',
        jp: '技',
        resume:
          'Une démonstration dynamique de son choix, puis quatre techniques tirées dans le programme du 2e dan et deux défenses.',
        criteres: [
          ...CRITERES_UV2,
          "Logiques d'enchaînement sur des opportunités offertes ou créées",
          "Cohérence des réponses, aisance générale, aptitude à agir avec l'autre",
        ],
        regles: [
          'Première épreuve : une projection, un contrôle au sol et une défense au choix, dans un contexte dynamique, en cinq minutes maximum.',
          'Seconde épreuve : deux projections de deux familles différentes et deux contrôles de deux familles différentes, imposés par le jury dans le programme du 2e dan.',
          'Deux techniques de défense au choix dans la série C des vingt attaques imposées.',
          "L'unité n'est pas fractionnable : le résultat porte sur l'ensemble des épreuves.",
          "Dominante technique seulement, troisième épreuve : uchi-komi en déplacement 2 × 1 min 30 sur deux techniques, nage-komi en déplacement 2 × 1 min 30 sur deux techniques, puis deux exercices d'application de deux minutes.",
        ],
      },
      UV3("Établir son efficacité, par les résultats en compétition ou par la voie de l'expression technique."),
      {
        code: 'UV4',
        label: 'Engagement personnel',
        jp: '志',
        resume: "Servir comme arbitre sur une animation ou une compétition. Ce n'est pas un examen.",
        criteres: [
          "Stage d'arbitrage d'une demi-journée",
          "Encadrement d'une animation ou d'une compétition officielle sur deux demi-journées, en tant qu'arbitre",
        ],
        regles: [
          "Accessible dès l'obtention du 1er dan.",
          "Validation par l'organisme territorial délégataire dont dépend le candidat.",
          'Équivalence : arbitre départemental en activité.',
          "Aucun examen ne peut sanctionner le candidat : l'unité est validée par la participation.",
        ],
      },
    ],
  },
  {
    id: 3,
    name: '3e dan',
    jp: '参段',
    resume:
      'Deux katas dont le katame no kata, une démonstration de son propre judo dans trois directions, et une implication reconnue dans la vie du judo.',
    kata: {
      competition: 'Le katame no kata et le kodokan goshin jitsu, en entier, en tori.',
      technique: 'Le katame no kata, et soit le nage no kata, soit le kodokan goshin jitsu, en entier, en tori.',
      katas: ['katame-no-kata', 'kodokan-goshin-jitsu', 'nage-no-kata'],
    },
    tirage: {
      nage: 2,
      ne: 2,
      toutesFamilles: false,
      note: 'Deux projections issues de deux familles différentes, deux contrôles issus de deux familles différentes.',
      total: 6,
    },
    defense: 'Série D',
    uvs: [
      {
        code: 'UV1',
        label: 'Kata',
        jp: '形',
        resume: 'Présenter deux katas en entier, dans le rôle de tori, dont le katame no kata.',
        criteres: [...CRITERES_KATA, 'Sincérité dans les actions et réactions de tori et de uke', 'Justesse technique'],
        regles: [
          'Dominante compétition : le katame no kata et le kodokan goshin jitsu.',
          'Dominante technique : le katame no kata, et soit le nage no kata, soit le kodokan goshin jitsu.',
          "Un kata réussi est acquis : en cas de réussite à l'un des deux, le candidat valide ce kata.",
          "Cette règle ne joue pas si le candidat n'a étudié qu'un seul kata : il doit présenter les deux katas requis.",
          'Le candidat doit montrer son niveau de perfectionnement.',
        ],
      },
      {
        code: 'UV2',
        label: 'Technique',
        jp: '技',
        resume:
          'Démontrer son propre judo — trois projections dans trois directions, deux contrôles en situation de combat — puis quatre techniques tirées dans le programme du 3e dan.',
        criteres: [
          ...CRITERES_UV2,
          'Maîtrise des trois directions pour chaque projection choisie',
          'Capacité à agir depuis de vraies situations de combat au sol',
        ],
        regles: [
          'Première épreuve : trois projections au choix, chacune dans trois directions différentes et en contexte dynamique, trois minutes minimum.',
          'Puis deux contrôles au sol au choix, à partir de situations de combat, trois minutes minimum.',
          "Puis des défenses sur saisies, coups et armes, une minute minimum. L'ensemble ne dépasse pas neuf minutes.",
          'Seconde épreuve : deux projections de deux familles différentes et deux contrôles de deux familles différentes, imposés par le jury dans le programme du 3e dan, plus deux défenses de la série D.',
          "L'unité n'est pas fractionnable. Le jury compte au moins trois juges, 4e dan et plus.",
          "Dominante technique seulement, troisième épreuve : uchi-komi 3 × 1 min sur trois techniques, nage-komi 2 × 1 min sur deux techniques, puis deux exercices d'application de deux minutes.",
        ],
      },
      UV3("Établir son efficacité, par les résultats en compétition ou par la voie de l'expression technique."),
      {
        code: 'UV4',
        label: 'Engagement personnel',
        jp: '志',
        resume: "Justifier d'un titre ou d'une fonction tenue dans le judo depuis le grade précédent.",
        criteres: [
          'Enseignant en exercice, commissaire sportif départemental, arbitre départemental, juge',
          "Élu au sein d'un club, ou bénévole au sein d'un organisme territorial",
        ],
        regles: [
          "Attestation délivrée par la commission d'organisation des grades, portant sur au moins un titre ou une fonction depuis le dernier grade.",
          "À défaut, encadrement d'une animation ou d'une compétition sur quatre demi-journées.",
        ],
      },
    ],
  },
]

export const danOf = (id: DanId) => DANS.find((d) => d.id === id)!
export const kataOf = (id: Kata['id']) => KATAS.find((k) => k.id === id)!

/** Toutes les techniques du programme d'un grade, dans l'ordre des familles. */
export const programmeSlugs = (id: DanId) => GROUPES.flatMap((g) => PROGRAMMES[id][g.id])

/** Nombre de techniques au programme d'un grade. */
export const programmeTotal = (id: DanId) => programmeSlugs(id).length

/**
 * Séries du kata à présenter pour un grade : le 1er dan n'en demande que les
 * trois premières en dominante compétition, les autres grades le kata entier.
 */
export const seriesFor = (kata: Kata, dan: Dan) =>
  kata.id === 'nage-no-kata' && dan.kata.seriesNageNoKata
    ? kata.series.slice(0, dan.kata.seriesNageNoKata)
    : kata.series

/** Toutes les techniques d'un kata, dans l'ordre. */
export const kataSlugs = (kata: Kata, series = kata.series) => series.flatMap((s) => s.slugs)

/* --------------------------------------------------------------- tirage */

export interface TirageItem {
  slug: string
  groupe: Groupe
}

export interface Tirage {
  nage: TirageItem[]
  ne: TirageItem[]
}

const pioche = (source: string[], exclus: Set<string>, rand: () => number): string | null => {
  const libres = source.filter((s) => !exclus.has(s))
  return libres.length === 0 ? null : libres[Math.floor(rand() * libres.length)]
}

/**
 * Tirage d'un domaine. Le jury doit couvrir toutes les familles quand le
 * grade l'exige ; sinon il lui suffit de puiser dans des familles distinctes,
 * ce qui revient à tirer d'abord les familles, puis une technique dans
 * chacune.
 */
function tireDomaine(prog: Programme, familles: Groupe[], total: number, toutes: boolean, rand: () => number): TirageItem[] {
  const utiles = familles.filter((id) => prog[id].length > 0)
  const ordre = toutes ? utiles : [...utiles].sort(() => rand() - 0.5).slice(0, total)

  const pris = new Set<string>()
  const out: TirageItem[] = []

  for (const id of ordre) {
    const slug = pioche(prog[id], pris, rand)
    if (slug) {
      pris.add(slug)
      out.push({ slug, groupe: id })
    }
  }

  // Le nombre de familles peut être inférieur au nombre de techniques
  // demandées : on complète alors au hasard dans le domaine.
  let garde = 0
  while (out.length < total && garde++ < 200) {
    const id = utiles[Math.floor(rand() * utiles.length)]
    const slug = pioche(prog[id], pris, rand)
    if (!slug) continue
    pris.add(slug)
    out.push({ slug, groupe: id })
  }

  return out.slice(0, total)
}

/** Reproduit le tirage du jury pour un grade donné. */
export function tirerUv2(dan: DanId, rand: () => number = Math.random): Tirage {
  const d = danOf(dan)
  const prog = PROGRAMMES[dan]
  return {
    nage: tireDomaine(prog, GROUPES_NAGE, d.tirage.nage, d.tirage.toutesFamilles, rand),
    ne: tireDomaine(prog, GROUPES_NE, d.tirage.ne, d.tirage.toutesFamilles, rand),
  }
}
