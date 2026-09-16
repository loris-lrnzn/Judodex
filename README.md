# Judodex 柔道技図鑑

Le carnet du judoka : les 104 techniques du judo, leur décomposition martiale,
et une mémoire de ce que vous travaillez.

React 19 · TypeScript strict · Tailwind CSS 4 · Framer Motion · Vite 6 · Vitest.

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # 66 tests, dont un parcours applicatif complet
npm run audit     # contrôle de mise en page de 320 à 1440 pixels
npm run build
npm run preview   # nécessaire pour vérifier le fonctionnement hors ligne
```

## Le parti pris

Une encyclopédie n'apprend rien à personne. L'application est donc construite
autour de la mémoire, pas de la consultation.

- **Relevé** est l'écran d'accueil : la planche de grade que vous préparez et
  l'état de chaque technique qu'elle impose, ce que vous travaillez, votre
  avancée par famille.
- **Planches** est le catalogue. Il se classe par famille ou par ceinture, au
  choix, au lieu d'un mur de vignettes indifférenciées.
- **Dojo** fait remonter les techniques à réviser selon un système de Leitner.
  Une réponse juste repousse l'échéance, une erreur la ramène à demain. La
  séance peut porter sur le programme du grade préparé.

La recherche n'occupe aucune place à l'écran : elle s'ouvre par `/` ou `Ctrl+K`.
Les filtres sont réduits à trois axes, masqués tant qu'on ne les demande pas.

## Les contenus

Les textes du catalogue sont écrits pour Judodex : présentation de chaque
technique, décomposition en kuzushi, tsukuri et kake, points clés et contexte
des enchaînements. Cela représente 104 présentations, 207 descriptions de
phase, 418 points clés et 189 contextes d'enchaînement.

Ce qui n'est repris de personne parce que cela n'appartient à personne : la
nomenclature japonaise, les kanji, la traduction française usuelle, la famille
et le niveau. Ce qui reste attribué parce que nous n'en sommes pas l'auteur :
le programme de passage de grade, publié par la fédération, et les
démonstrations filmées, produites par le Kodokan et par France Judo.

Les photographies ont été retirées. Elles étaient hébergées ailleurs et de
qualité inégale, entre rendus générés et captures portant le nom de la
technique en incrustation. Une fiche sans démonstration filmée affiche
désormais son kanji.

## Les enchaînements

Un contrôle de cette partie a révélé un défaut sérieux, hérité du relevé
d'origine : l'écran complétait la liste des enchaînements avec des techniques
de la même famille, présentées à l'identique. Sur les 104 fiches, **398 lignes
affichées sous le titre « Enchaînements » n'en étaient pas**. Vingt-quatre
cibles ne correspondaient d'ailleurs à aucune fiche et étaient ignorées en
silence.

Les liens ont été réécrits pour Judodex : 231 relations, toutes typées et
toutes pointant vers une fiche existante.

| Type | Nombre | Ce que c'est |
|---|---|---|
| Enchaînement | 214 | la première attaque ouvre la seconde |
| Contre | 17 | la seconde répond à la première |

Chaque lien porte la situation qui le déclenche, et la fiche les présente en
trois blocs distincts, en pleine largeur sous le corps de la fiche : les
enchaînements, les contres, et le voisinage de famille clairement désigné comme
tel. La répartition en deux colonnes du corps s'adapte à la fiche : les points
clés passent à droite quand la technique n'a pas de décomposition en trois
phases, faute de quoi cette colonne resterait presque vide. Six tests garantissent qu'aucune cible
n'est invalide, qu'aucune technique ne se renvoie à elle-même et que les
contres classiques restent déclarés dans les deux sens.

## Le programme de passage de grade

Le judo ne progresse pas par difficulté abstraite mais par passage de grade,
et chaque passage a sa planche. L'application reprend les six planches de la
**progression française de l'enseignement du judo** publiée par la fédération,
de la ceinture blanche à la ceinture noire.

Les listes de `src/lib/belts.ts` sont relevées sur ces planches : soixante-
quatre des cent quatre fiches y figurent, réparties en projections et travail
au sol comme sur l'affiche d'origine.

| Planche | Nage-waza | Katame-waza |
|---|---|---|
| Blanche à jaune, 5ᵉ kyu | 8 | 3 |
| Jaune à orange, 4ᵉ kyu | 8 | 3 |
| Orange à verte, 3ᵉ kyu | 8 | 4 |
| Verte à bleue, 2ᵉ kyu | 8 | 8 |
| Bleue à marron, 1ᵉʳ kyu | 7 | 7 |
| Marron à noire, 1ᵉʳ dan | aucune technique nouvelle | |

Chaque planche porte aussi ce que la fédération y inscrit en dehors des
techniques : les deux valeurs du code moral, la part du programme accordée au
debout et au sol, et le volume de pratique attendu en séances, interclubs ou
compétitions.

Cette part est imprimée sur la planche à côté de chaque domaine, sans légende,
et elle ne suit pas le nombre de techniques imposées : la planche blanche à
jaune annonce 40 % de nage-waza pour huit projections, et 60 % de katame-waza
pour trois immobilisations seulement.

L'explication tient dans le reste de la planche. Le programme au sol ne repose
pas sur des techniques nommées mais sur des **situations d'étude** : retourner
uke à plat ventre, dégager sa jambe en demi-garde, passer les jambes en garde
papillon, reprendre l'initiative en position inférieure. La planche blanche à
jaune en compte quatorze au sol contre trois debout, ce qui justifie les 60 %.

Ces 60 situations, relevées sur les mêmes pages GI et démontrées en vidéo, sont
désormais listées sous les techniques de chaque planche. Chaque ligne déplie sa
démonstration.

La planche du premier dan n'impose aucune technique nouvelle. Elle demande un
système d'attaque construit autour du tokui-waza dans les quatre secteurs de
chute, un système de défense, l'étude du Nage no kata ou du Kodokan goshin
jitsu, et l'examen shodan en quatre unités de valeur : UV1 kata, UV2 technique,
UV3 efficacité, UV4 engagement personnel, en dominante technique ou en
dominante compétition. L'application la présente sous cette forme.

Les quarante fiches restantes forment le répertoire complémentaire, présenté à
part et jamais mêlé au programme.

L'accueil affiche la planche préparée avec ses deux colonnes et l'état de
chaque technique. Le catalogue se classe par planche au choix. Le dojo peut
consacrer une séance au programme du grade préparé.

Source : https://www.ffjudo.com/progression-francaise

## Mon judo, ou le parcours en cinq questions

Le reste de l'application dit ce qu'on connaît. Cette planche-là, `/mon-judo`,
dit ce qu'on **sait faire, et dans quelle direction** — ce qui n'est pas la
même chose et compte davantage sur un tapis.

Elle a d'abord été un relevé : six sections déployées d'un bloc, qui
répondaient à six questions sans jamais en poser aucune, et dont on ne savait
par quel bout les prendre. Elle demande maintenant **une chose à la fois**,
dans l'ordre où les réponses s'appellent l'une l'autre — la garde décide des
coins, les coins font la matière du système, le système donne le bilan. Le fil
du haut laisse revenir en arrière ou sauter à la fin : il guide, il n'enferme
pas.

1. **Ta garde.** Droitier ou gaucher, en un clic, avec une rose de
   démonstration qui bascule en miroir sous les yeux. Un premier écran auquel
   on répond vaut mieux qu'un premier écran qu'on subit.
2. **Ton répertoire.** La rose des huit directions et les quatre coins où uke
   tombe. Le plan est vu depuis tori : il se tient en bas de planche, uke lui
   fait face au-dessus. Les directions sont stockées dans le repère de uke —
   son avant, sa droite — et la vue les fait donc pivoter d'un demi-tour :
   l'arrière de uke se lit en haut, et sa droite à gauche, puisqu'il nous fait
   face. Un rayon par direction, dont la longueur compte les techniques et dont
   le trait plein compte les tokui-waza ; un secteur vide est hachuré.

   **Chaque quartier se clique** et ouvre la liste de toutes les projections du
   catalogue qui y tombent, acquises ou non. On coche celles qu'on sait faire :
   elles entrent au répertoire, ici comme partout ailleurs dans le carnet, avec
   leur première révision programmée. Le clic sur la planche ne se devinant pas
   tout seul, un `+` est dessiné dans chaque quartier, et le même geste est
   offert deux fois en clair sur les cartes voisines — un `+` à droite de
   l'intitulé, un `+ Ajouter` sous la fin de chaque liste.
3. **Tes situations.** Deux axes croisés — la garde relative, *même garde* ou
   *garde croisée*, et ce que fait uke : il vient, il fuit, il contourne, il
   bloque. Huit cases, tenues dès qu'une attaque du répertoire s'y applique.
   Une seule suffit. La garde absente d'un lien vaut « les deux », parce que
   c'est une restriction et non un renseignement ; le déplacement absent, lui,
   ne remplit rien — sinon la grille serait pleine dès le premier jour et ne
   montrerait plus aucun trou.

   **Chaque case se clique**, exactement comme un quartier de la rose, et ouvre
   la liste des techniques du catalogue relevées dans ce cas. L'étape a d'abord
   été muette — on y lisait un manque sans pouvoir rien y faire, seule des cinq
   à ne proposer aucun geste. C'est le même panneau cochable que le répertoire,
   `ListeCochable`, écrit une fois pour les deux.

   Le catalogue ne dit le déplacement de uke que là où quelqu'un l'a écrit, et
   il l'a écrit pour quatre-vingts liens sur trois cent cinquante. Un judoka qui
   place son seoi-nage quand uke avance doit pouvoir le dire même si aucun lien
   ne l'atteste : le `+` d'une case range la technique choisie dans ce cas, et
   `profil.situations` garde ces attributions, comme `profil.corrections` garde
   les directions corrigées. Le catalogue propose, le pratiquant a le dernier
   mot sur son propre judo — la couverture additionne les deux.

   Ce que l'étape modifie s'arrête aux situations : décocher une technique la
   retire de ce cas et de rien d'autre. Un tokui-waza reste un tokui-waza,
   qu'on l'emploie ou non quand uke avance. Ce que le catalogue range ici, en
   revanche, ne se décoche pas : il n'a pas à être contredit d'un clic
   distrait, et la case le dit au survol.
4. **Ton système.** Une technique de prédilection, ce que uke oppose, ce qu'on
   fait de sa réponse. Elles se choisissent parmi les techniques du répertoire
   pourvues d'au moins une liaison ; les tokui-waza y sont d'office. La carte
   d'une technique range ses suites en quatre : *il se défend, j'enchaîne* ;
   *j'insiste* — le redoublement, seul lien du catalogue qui pointe vers sa
   propre fiche ; *il tombe mal, j'enchaîne au sol* ; et *ce que je prends*,
   les contres qu'elle expose.

   L'écran a d'abord parlé d'armes, de portes et de systèmes « à monter » —
   trois métaphores de mon cru empilées sur un lexique japonais déjà exigeant.
   Il dit maintenant *technique préférée*, *fait tomber en avant droit*, *rien
   de coché*. Le titre du groupe au sol disait même « ça ne tombe pas, je
   continue au sol », ce qui ne veut rien dire : si uke ne tombe pas, on reste
   debout. Il tombe mal — sur le ventre, sur le côté, pas sur le dos — et c'est
   de là qu'on enchaîne.

   Le catalogue propose, le pratiquant retient. Une version antérieure faisait
   l'inverse — tout coché d'office, on retirait — mais on ne sentait alors nulle
   part qu'on construisait : tout était déjà là. Et la proposition n'est pas une
   limite : un `+` par groupe ouvre le sélecteur de techniques, restreint à ce
   qui a un sens pour ce groupe. Une branche ajoutée ainsi est retenue d'office.
   Les cartes sont repliées et gardent leur verdict visible : c'est la seule
   ligne qu'on veut comparer d'une arme à l'autre sans rien ouvrir.
5. **Ton bilan.** Trois chiffres, puis **une seule chose à faire** — jamais
   trois. Un bilan qui énumère quatre manques n'en fait traiter aucun : on
   désigne le plus gênant dans l'ordre où les choses se construisent, avec les
   techniques qui le comblent et le bouton qui ramène à l'étape concernée.
   Suivent les verdicts des armes, une ligne chacun, et le sol sur son propre
   axe — le ne-waza ne se lit pas en secteurs : les trois manières de conclure,
   immobiliser, étrangler, luxer, chacune disant par quelle projection du
   répertoire on y arrive.

Le verdict d'une arme n'est pas une note mais une phrase : deux portes et une
sortie au sol, ou bien tout qui part du même côté. Ne comptent comme portes que
les suites **retenues**, **acquises**, et tombant dans un autre secteur que
l'arme — une suite qu'on ne sait pas encore faire n'ouvre rien.

Le calcul du bilan vit dans `useBilan`, l'état du parcours dans `useParcours`,
chaque étape dans son fichier sous `components/profil/` : l'écran n'est plus
qu'un aiguillage de cent-soixante-dix lignes, contre mille auparavant.

Un mot sur le stockage, parce qu'il a mordu une fois. `useLocalStorage` rend le
JSON tel qu'il a été écrit : un carnet enregistré avant l'ajout d'un champ n'en
a pas trace, et le champ arrive `undefined` au lieu de son défaut — la page
tombait entière à la première lecture. Le profil, les systèmes et le parcours
passent donc chacun par un `normaliser()` à la lecture comme à l'écriture, et
ajouter un champ demain ne cassera pas les carnets d'aujourd'hui.

### Les réglages, `/reglages`

Ils vivaient à deux endroits qui n'étaient ni l'un ni l'autre le bon : un
formulaire de trente-cinq sélecteurs au bas du bilan, et la sauvegarde derrière
un menu « ⋯ » qui cachait un effacement définitif sans rien en dire. La page les
rassemble, et le menu ne fait plus qu'y conduire.

- **La garde**, la même que sur le bilan, où elle ouvre le parcours.
- **Les directions.** Trente-cinq des soixante-neuf projections admettent
  plusieurs lectures selon la forme enseignée, et le pratiquant peut les
  corriger lui-même ; les trente-quatre autres, celles dont la direction ne fait
  pas débat, ne sont pas proposées. Un filtre montre les seules corrections
  faites.
- **La sauvegarde.** Le fichier exporté est passé en version 2 : il emporte la
  progression comme avant, et désormais le profil — garde et directions
  corrigées — et les systèmes montés, sans quoi une restauration rendrait un
  répertoire sans la lecture qu'on en avait faite. Les fichiers version 1
  restent lisibles. À la relecture, rien n'entre qui ne soit reconnu : une garde
  inconnue retombe sur droite, une direction inventée disparaît.
- **L'effacement**, qui ne touche que les acquis. La garde, les directions et
  les systèmes sont des réglages : ils survivent, et la page le dit avant qu'on
  clique.

### Les liens du catalogue

Tout cela repose sur un modèle de liens élargi. Une fiche déclare quatre formes
de poursuite, qui sont les quatre manières de continuer : `enchainement`
— attaquer ailleurs —, `redoublement` — insister avec la même attaque, donc le
seul lien autorisé à pointer vers sa propre fiche —, `liaison-sol` — continuer
au sol quand ça ne tombe pas —, et `contre`. Chaque lien peut porter la
`situation` d'où il part, la `defense` de uke qui le déclenche, et son
`attestation` — `ffjudo`, `kodokan` ou `usage`, ce dernier signalant ce qui
reste à relire.

Les liens s'écrivent dans `src/data/links.json`, jamais dans `techniques.json`,
qui n'en porte que la copie chargée par l'application. `npm run links` vérifie
puis fusionne, `npm run links:check` vérifie seulement. Le contrôle refuse une
cible inconnue, un doublon, un contexte trop court, un mot hors vocabulaire, une
`liaison-sol` qui ne descend pas au sol — et, inversement, tout lien qui
descend au sol sans le déclarer.

La répartition du catalogue est instructive en soi : vingt-huit projections sur
soixante-neuf tombent en avant droit, contre cinq en arrière gauche. C'est
précisément pourquoi l'exigence des quatre secteurs existe — un judoka
accumule naturellement le coin qu'il travaille depuis toujours.

## La planche de la ceinture noire

La planche marron à noire n'impose aucune technique : c'est l'examen qui en
tient lieu. Le dojo ouvre donc une planche à part, `/dojo/ceinture-noire`, qui
porte les trois premiers dan. Chaque grade a son adresse — `/2e-dan`,
`/3e-dan` — et ses quatre unités de valeur.

- **UV1, le kata.** Le nage no kata aux deux premiers dan, le katame no kata au
  troisième, et le kodokan goshin jitsu en alternative. Les quinze techniques
  de chacun des deux premiers renvoient à leur fiche. Le 1er dan n'exige que
  les trois premières séries du nage no kata en dominante compétition : c'est
  l'affichage par défaut, le kata complet tient derrière un second onglet.
- **UV2, la technique.** Le programme technique du grade, une liste par
  famille, et un bouton qui reproduit le tirage du jury. Le 1er dan tire six
  projections couvrant les quatre familles debout et quatre contrôles couvrant
  les trois familles au sol ; les 2e et 3e dan tirent deux projections et deux
  contrôles, dans des familles distinctes. Les tests vérifient ces contraintes
  sur deux cents tirages par grade. Le tirage ne porte que sur les techniques
  imposées : l'épreuve en compte deux de plus — les défenses, choisies par le
  candidat dans la série de son grade — et la planche le dit sous le bouton,
  pour que le compte affiché ne surprenne pas.
- **UV3 et UV4** sont rappelées avec leur règlement et leurs critères, sans
  liste de techniques : elles n'en comportent pas.

Trois précisions sur les sources. Uchi-mata figure deux fois au programme du
1er dan, en koshi-waza et en ashi-waza ; le catalogue sépare déjà la forme
hanche de la forme jambe, et le classement du référentiel recouvre exactement
cette distinction. Ashi-garami clôt la troisième série du katame no kata sans
figurer au répertoire judo : elle est nommée, mais sans lien, plutôt que
silencieusement omise. Enfin, les vingt attaques imposées ne sont publiées
qu'en planche dessinée : la règle de l'épreuve est donnée, la liste ne l'est
pas, faute de source en toutes lettres.

Le référentiel des juges décrit UV1, UV2 et UV4. Il ne traite pas l'UV3, qui ne
relève pas des juges de kata et de technique : la planche s'en tient donc au
principe de l'unité, sans détail d'épreuve inventé.

Source : CSDGE, Référentiel des juges 2024/2025, programmes techniques, et
feuille d'évaluation FEDT-1A.

## La séance du dojo

Au judo on reconnaît une technique à l'œil, pas à ses idéogrammes. La séance
porte donc sur la **démonstration filmée**, ou à défaut sur le sens du nom. Le
mode kanji a été retiré : il ne correspond à rien de ce qu'on apprend sur un
tapis.

Montrer une vidéo sans donner la réponse demande trois précautions, toutes
vérifiées en conditions réelles plutôt que supposées.

- **Le générique nomme la technique.** Sa durée a été relevée image par image
  sur les deux séries : la carte de titre tient environ cinq secondes. L'extrait
  démarre donc à six secondes, juste après elle, et pas plus tard : partir au
  quart de la vidéo, comme au premier essai, amputait quatre secondes de
  démonstration pour rien.
- **L'habillage YouTube affiche le titre** à l'arrêt, au chargement, au
  démarrage de la lecture, et de nouveau au moindre survol. Aucun paramètre
  d'intégration ne le supprime de façon fiable. La parade est géométrique :
  l'image est agrandie d'un tiers et recentrée, si bien que le bandeau et les
  logos tombent hors du cadre visible. Ce qui sort du champ ne peut plus être
  lu, quoi que dessine le lecteur. Le facteur est réglé au plus juste : au-delà,
  les plans serrés des démonstrations sont amputés. Un volet opaque, piloté par
  l'API du lecteur, couvre en plus les phases où rien ne joue, et le lecteur
  vérifie l'identité de la vidéo avant de découvrir l'image, faute de quoi la
  question précédente resterait affichée sous l'énoncé suivant.
- **La fin de vidéo ramène au générique.** Plutôt que la lecture en boucle, qui
  repasse par le titre, l'extrait est relancé à son point de départ une seconde
  et demie avant la fin.
- **Les sous-titres automatiques prononcent le nom**, ils sont désactivés.
- **Le Kodokan incruste le nom en bas à gauche pendant toute la vidéo.** Un
  cache d'angle le couvre, le recadrage seul ne l'atteignant pas sans amputer
  l'image. La série fédérale, qui ne porte pas ce défaut, reste préférée quand
  elle existe.

Le lecteur est construit une seule fois par séance et change simplement de
vidéo d'une question à l'autre. Deux autres pistes ont été mesurées puis
abandonnées : précharger la question suivante pendant la correction, qui
allonge l'attente en concurrençant la vidéo affichée, et préchauffer le lecteur
hors écran, que le navigateur refuse de faire jouer dans un cadre invisible.

Le délai avant que l'image apparaisse est ainsi passé de 3,9 à 1,3 seconde en
médiane, mesuré dans un navigateur sans interface, donc plutôt pessimiste.

La réponse donnée, la vidéo entière réapparaît avec son titre et ses commandes.
Les touches 1 à 4 répondent, Entrée enchaîne.

La séance se termine par un bilan et non par un écran de fin de partie : le
score, la précision, la meilleure série, puis le détail des dix questions, avec
pour chacune le résultat, la fiche accessible d'un clic et la date de sa
prochaine révision.

## Les démonstrations filmées

Chaque fiche renvoie à une démonstration vidéo, et souvent à deux, présentées
côte à côte plutôt qu'imposées : celle du **Kodokan**, la référence japonaise,
et celle de **France Judo**, relevée sur les pages GI de la progression
française.

| Source | Techniques couvertes |
|---|---|
| Kodokan | 95 |
| France Judo | 60 |
| Les deux | 56 |
| Au moins une | 99 sur 104 |

Les identifiants ont tous été vérifiés : chaque vidéo répond et provient bien
de la chaîne annoncée. Cinq fiches restent sans démonstration parce qu'aucune
des deux sources n'en publie : Eri-seoi-nage, Kuzure-yoko-shiho-gatame,
Kuzure-tate-shiho-gatame, Morote-jime et Ashi-gatame-jime. La fiche affiche
alors son kanji en grand.

Cette vérification a mis au jour une erreur dans les données d'origine :
Ashi-gatame-jime, un étranglement par la jambe, portait la vidéo de
Ude-hishigi-ashi-gatame, une clé de bras. La vidéo a été retirée plutôt que de
montrer une autre technique, et un test empêche la régression.

## La direction artistique — planche technique

Le judo s'enseigne sur des planches annotées. L'interface en reprend le
vocabulaire, et rien n'y est décoratif.

- **Papier millimétré** en substrat des planches, **réticules de repérage**
  aux angles, **lignes de cote** à traits d'extrémité, **cartouches de figure**
  numérotés.
- **Les kanji sont le sujet**, pas un ornement. Chaque technique est
  identifiée par ses idéogrammes, chaque famille par le sien. Leur corps
  s'adapte au nombre de caractères, de un à cinq, pour qu'un nom long ne se
  casse jamais en deux lignes.
- **La progression lue comme un angle**, sur un rapporteur gradué de quinze en
  quinze degrés. Le judo est une affaire d'angles, et le relevé central affiche
  une part accomplie, jamais un décompte.
- **Le niveau se lit à la graduation** autant qu'à la couleur de ceinture :
  cinq traits dont le rang est rempli.
- **Le tampon de contrôle** marque une technique acquise, apposé de travers.

Trois couleurs seulement : le trait, le bleu de repérage, le rouge de
signalement. Les familles reprennent des teintes de crayon technique. En thème
sombre, la planche devient un cyanotype, bleu de Prusse et traits clairs.

Typographie IBM Plex Sans pour les titres et le texte, IBM Plex Mono pour
toutes les annotations et cotations, Shippori Mincho réservé aux seuls
idéogrammes. Aucun angle arrondi. Le texte courant tient 13 pour 1 sur le fond,
les légendes 5,9, le vermillon de signalement 5, et les cinq teintes de famille
de 7,7 à 11.

## Mise en page et contrôle

`npm run audit` lance un navigateur sans interface, charge chaque écran à
320, 390, 768 et 1440 pixels, et signale tout débordement horizontal en
nommant l'élément fautif, ainsi que les cibles tactiles sous 28 pixels.
Aucune règle `overflow-x` masquante n'est employée : les débordements sont
corrigés à leur cause.

## Architecture

```
src/
├─ types/judodex.ts          Types du domaine
├─ lib/
│  ├─ families.ts            5 macro-familles, couleurs
│  ├─ belts.ts               Les six planches de la progression française
│  ├─ secteurs.ts            Huit directions, quatre secteurs de chute
│  ├─ situations.ts          Garde relative × déplacement de uke, couverture
│  ├─ systeme.ts             Montage d'un système d'attaque et son verdict
│  ├─ search.ts              Index et score de correspondance approchée
│  ├─ srs.ts                 Révision espacée (boîtes de Leitner)
│  ├─ quiz.ts                Génération des questions
│  ├─ backup.ts              Export et import du carnet (v2)
│  └─ motionFeatures.ts      Animations chargées à part
├─ hooks/
│  ├─ useJudodex.ts          Catalogue, progression, statistiques, files
│  ├─ useBilan.ts            Tout ce que le bilan sait d'un judo
│  ├─ useParcours.ts         Les cinq étapes et où l'on en est
│  ├─ useProfil.ts           Garde et directions corrigées
│  ├─ useSystemes.ts         Armes, branches retenues, branches ajoutées
│  ├─ useBrowseFilters.ts    Affinage local du catalogue
│  ├─ useRoute.ts            Routeur sur l'History API
│  ├─ useLocalStorage.ts     Persistance différée
│  └─ useUi.ts               Thème, focus, défilement, connexion
├─ components/               AppShell, Link, CommandPalette, ChoixTechnique,
│                            TechniqueCard, RoseSecteurs, GrilleSituations,
│                            Protractor, Seal, BeltMark, SectionHead,
│                            YouTubeFacade, LazyImage, Toast
│  └─ profil/                Le parcours du bilan : FilParcours, Etape,
│                            les cinq étapes, et leurs pièces communes
├─ screens/                  HomeScreen, BrowseScreen, TechniqueScreen,
│                            TrainScreen, DanScreen, ProfilScreen, ReglagesScreen
├─ __tests__/                Logique métier et parcours applicatif (jsdom)
└─ data/
   ├─ links.json             Les liens, fichier d'écriture
   └─ techniques.json        Les 104 techniques, liens fusionnés
```

Aucun écran ne contient de logique métier : tout vient de `useJudodex`, et
le bilan de `useBilan`, qui s'appuie dessus.

## Décisions techniques

- **Navigation par vraies ancres.** Chaque technique a son adresse
  (`/technique/o-goshi`) : on peut la copier, l'ouvrir dans un onglet, la
  partager. Le clic simple reste géré sans rechargement.
- **Révision espacée** à six paliers, de un à soixante jours, stockée avec la
  progression et incluse dans les sauvegardes.
- **Chargement** : la fiche technique et le dojo sont hors du bundle initial,
  comme les fonctionnalités d'animation. Payload initial de 112 Ko compressés.
- **Rendu** : `content-visibility` sur les cartes, kanji au lieu d'images dans
  le catalogue, façade YouTube qui ne charge l'iframe qu'au clic.
- **Hors ligne** : service worker, coquille et *tous* les fragments d'écran
  pré-chargés à l'installation, médias consultés conservés. L'application
  reste entièrement utilisable dans un dojo sans réseau, y compris sur les
  écrans jamais ouverts auparavant. Le cache est apparié avec `ignoreVary` :
  les ressources versionnées sont servies avec `Vary: Origin`, et sans cela
  la page, qui les redemande avec `crossorigin`, n'appariait jamais ce que le
  service worker avait mis de côté.
- **Accessibilité** : focus piégé et restitué, navigation clavier complète,
  `prefers-reduced-motion` respecté, changement de page annoncé aux lecteurs
  d'écran, cibles tactiles à 44 px au pointeur grossier. Toutes les teintes de
  texte tiennent 7:1 (AAA) contre les deux fonds, le vermillon excepté, porté
  à 4.5:1 comme accent ; les bords de commandes tiennent 3:1. Vérifié par
  `npm run contraste`, qui relit la palette dans `index.css`.
- **Survol des listes** : une ligne qui passe en négatif porte sa propre marge
  intérieure, compensée par une marge négative pour que le texte reste aligné
  sur la colonne. Sans cela le contenu touche les bords et la flèche est
  rognée.
- **Données réelles** : 8 familles, 5 niveaux jusqu'à Maître, images et vidéos
  parfois absentes, 35 techniques de sol sans décomposition en trois phases.
  Chacun de ces cas a son rendu propre.


## Référencement, classique et génératif

Le carnet est rendu par le navigateur. Google finit par exécuter le script et
voir les pages ; les robots des moteurs génératifs — GPTBot, OAI-SearchBot,
ClaudeBot, PerplexityBot — ne l'exécutent pas. Avant le pré-rendu, ils
recevaient cent douze fois le même fichier, contenant un `<div id="root">`
vide : rien à lire, rien à citer, aucune chance d'être la source d'une réponse.

`scripts/prerender.mjs` rend donc chaque route une fois au build, dans un
navigateur sans mouvement, et écrit le résultat dans `dist/<route>/index.html`.
L'application se recharge par-dessus au premier affichage : le HTML servi n'est
pas une version figée du carnet, c'est sa première image, celle que lit une
machine qui ne saurait pas l'animer. Une fiche passe ainsi de 0 à environ
2 000 caractères lisibles sans script, le catalogue à 5 700.

Le pré-rendu ne coûte rien à l'affichage, il le sert — mesuré sur un serveur
qui compresse comme le fera l'hébergeur :

| profil | route | sans pré-rendu | avec pré-rendu |
| --- | --- | --- | --- |
| 4G, CPU ÷2 | accueil | FCP 652 · LCP 784 | FCP 596 · LCP 728 |
| 4G, CPU ÷2 | fiche | FCP 504 · LCP 848 | FCP 432 · LCP 432 |
| 3G rapide, CPU ÷4 | accueil | FCP 1628 · LCP 2012 | FCP 1372 · LCP 1372 |
| 3G rapide, CPU ÷4 | fiche | FCP 1648 · LCP 2008 | FCP 1324 · LCP 1324 |

Mesurer sur `vite preview` induirait en erreur deux fois : il renvoie
`index.html` pour toute adresse avant de regarder si un fichier existe — les
pages pré-rendues n'y sont jamais servies — et il ne compresse pas, ce qui
triple le poids du script principal et déplace la LCP de plusieurs secondes.
`npm run serve` sert `dist/` comme l'hébergeur : fichier d'abord, repli
ensuite, et compression.

S'ajoutent trois choses qu'un moteur génératif cherche pour citer une page :

- **Données structurées** (`src/lib/jsonld.ts`). Une technique est une
  procédure, pas un article : elle est déclarée en `HowTo`, ses trois phases en
  `HowToStep`. S'y ajoutent le fil d'Ariane et l'identité du site.
- **`llms.txt`**, sommaire écrit pour une machine qui lit : ce que le site
  contient, la forme des adresses, les 104 fiches par famille, et les sources.
- **`robots.txt`** qui autorise nommément les robots des moteurs génératifs.
  Une permission implicite se perd au premier durcissement de configuration.

Le nom japonais, les kanji, la traduction et la décomposition en trois phases
sont désormais lisibles hors du navigateur : c'est ce qui permet à une réponse
générée sur « comment fait-on o-goshi » de s'appuyer sur le carnet.

## Mise en production

Le site est une application statique : `npm run build` produit `dist/`, qui se
sert tel quel.

```
npm run build      # tsc + vite + pré-rendu + service worker + robots/sitemap/llms
npm run serve      # sert dist/ comme l'hébergeur (fichier d'abord, compression)
npm run contraste  # vérifie la palette contre les seuils WCAG
npm run og         # regénère public/og.png, l'aperçu de partage
```

**Le domaine.** Il est écrit à un seul endroit, `VITE_SITE_URL` dans `.env`, et
sert au canonical, aux balises de partage, au sitemap et à `llms.txt`. Le changer là suffit ;
les balises statiques d'`index.html` sont substituées au build, les balises
par page le sont à l'exécution par `src/hooks/useHead.ts`.

**La redirection de repli.** Les adresses sont propres (`/technique/o-goshi`) et
le routage se fait côté navigateur : sans réécriture, un accès direct ou un
rafraîchissement renvoie un 404 du serveur. `vercel.json` porte la règle, avec
les en-têtes de cache (les fichiers de `assets/` sont immuables, `sw.js` ne
l'est jamais) et les en-têtes de sécurité. Sur un autre hébergeur, la règle à
reproduire est : toute requête qui ne désigne pas un fichier existant sert
`/index.html` avec un statut 200.

**Après chaque déploiement**, le service worker change de version — son nom
suit l'empreinte des fichiers produits — et purge les caches précédents. Un
onglet resté ouvert sur l'ancienne version tombe sur un fragment disparu : la
garde (`src/components/Garde.tsx`) le reconnaît et propose le rechargement,
au lieu de la page blanche.
