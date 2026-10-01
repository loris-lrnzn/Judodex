# Judodex 柔道技図鑑

Le carnet du judoka : les 104 techniques du judo, leur décomposition martiale,
et une mémoire de ce que vous travaillez.

React 19 · TypeScript strict · Tailwind CSS 4 · Framer Motion · Vite 6 · Vitest.

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # 145 tests, dont un parcours applicatif complet
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

## Mon judo, construit de A à Z

Le reste du carnet dit ce qu'on connaît. `/mon-judo` sert à **composer son
judo**, et c'est pour cela qu'il ne lit rien du reste : ni les techniques
marquées acquises, ni les tokui-waza des fiches. On part d'une page blanche,
comme on décrirait son judo à son professeur, et l'état est rangé à part
(`judodex:mon-judo:v1`).

Une première version partait du carnet : le répertoire était ce qu'on avait
coché ailleurs, et le bilan en faisait la lecture. On y constatait son judo
sans jamais le construire.

Sept étapes, une question chacune, et **la carte se remplit à côté** à chaque
choix — sur téléphone, elle se résume en quatre jauges sous la question.

1. **Toi.** Un prénom, facultatif, qui signe la carte ; la garde, droitier ou
   gaucher — migi-kumi, hidari-kumi. Tout le reste se lit dans ce sens.
2. **Ta technique.** Le tokui-waza, choisi parmi les soixante-neuf
   projections, par famille ou par nom. Une fois pris, il se montre : la
   démonstration, le coin où il fait tomber, le nombre de suites que le
   catalogue lui connaît.
3. **Tes coins.** Les quatre coins de chute, vus depuis tori — l'arrière de
   uke en haut, sa droite à gauche, uke au centre. Un coin vide est hachuré.
   On touche un coin, on y range jusqu'à trois techniques ; le catalogue
   propose d'abord ce que la technique de prédilection y enchaîne.
4. **Ses réactions.** Il bloque, il recule, il se penche, il esquive : pour
   chacune, une suite. Le catalogue propose en tête les liens qui déclarent
   cette défense ou ce déplacement, puis les autres suites de la technique,
   puis les techniques de son propre judo qui font tomber **dans un autre
   coin** — c'est ce changement de direction qui fait un système, et chaque
   proposition dit si elle en change. Les contres que la technique expose
   sont signalés en dessous : ils ne font pas une étape, on les lit au moment
   où ils comptent.
5. **Tes entrées.** Même garde ou garde croisée, uke qui vient, fuit,
   contourne ou bloque : huit cases, une technique chacune. Un bouton place
   la technique de prédilection partout où le catalogue la place.
6. **Au sol.** Le passage quand uke tombe mal — ceux que le catalogue attache
   aux projections choisies — puis la manière de finir : immobiliser,
   étrangler ou luxer.
7. **Ta carte.** Le résultat, d'un coup d'œil : quatre jauges, la planche des
   coins, l'arbre des réactions, la grille des entrées, la chaîne au sol. À
   côté, **les trois choses à travailler**, jamais plus, dans l'ordre où les
   choses se construisent, chacune ramenant à son étape.

À chaque étape, un bouton ouvre tout le catalogue : les suggestions guident,
elles ne limitent pas. Un point marque ce que le catalogue relie aux choix
déjà faits ; le reste est proposé sans prétendre à rien.

**La carte sort de l'écran** de trois manières :

- **En image.** `html-to-image`, chargé au premier clic seulement, rend la
  carte à deux fois la résolution de l'écran. Une image ne voit pas les
  polices de la page ; on les lui donne, lues dans les `@font-face` de la
  feuille de style, en ne gardant que les plages Unicode dont la carte emploie
  un caractère. Les styles de la marque sont posés en ligne : une classe CSS
  n'accompagne pas le nœud dans l'image, et le J sortait noir.
  Mesuré : moins d'une seconde.
- **Par un lien.** La carte tient entière dans son adresse,
  `/mon-judo/carte/<code>` : pas de compte, pas de serveur. Celui qui l'ouvre
  la voit, peut la télécharger ou l'imprimer, et est invité à construire la
  sienne ; sa propre carte n'est pas touchée. Le code est relu par le même
  `normaliser` que le stockage : un lien trafiqué ne fait rien entrer
  d'inconnu.
- **Sur papier.** À l'impression, la palette passe au clair — imprimer le
  tapis vert viderait une cartouche pour rien — et tout ce qui n'est pas la
  carte se retire.

La logique vit dans `lib/monjudo.ts`, sans interface : l'état et sa
relecture, les suggestions de chaque étape, la lecture qu'en fait la carte,
les priorités et l'encodage du lien. Elle a ses propres tests.

### Les réglages, `/reglages`

Ils vivaient à deux endroits qui n'étaient ni l'un ni l'autre le bon : un
formulaire de trente-cinq sélecteurs au bas du bilan, et la sauvegarde derrière
un menu « ⋯ » qui cachait un effacement définitif sans rien en dire. La page les
rassemble, et le menu ne fait plus qu'y conduire.

- **La garde**, la même que la première étape de Mon judo : la changer ici change la carte.
- **Les directions.** Trente-cinq des soixante-neuf projections admettent
  plusieurs lectures selon la forme enseignée, et le pratiquant peut les
  corriger lui-même ; les trente-quatre autres, celles dont la direction ne fait
  pas débat, ne sont pas proposées. Un filtre montre les seules corrections
  faites.
- **La sauvegarde.** Le fichier exporté est en version 3 : la progression,
  les directions corrigées et la carte de Mon judo. Les fichiers version 1 et
  2 restent lisibles ; les systèmes de l'ancien bilan qu'emportait la
  version 2 sont laissés de côté, aucun écran ne les lisant plus. À la relecture, rien n'entre qui ne soit reconnu : une garde
  inconnue retombe sur droite, une direction inventée disparaît.
- **L'effacement**, qui ne touche que les acquis. Les directions et Mon judo
  survivent, et la page le dit avant qu'on clique.

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

Le lecteur attend de s'être déclaré prêt avant d'être interrogé : la
surveillance de sa lecture démarrait avant, et levait une erreur à chaque
séance. Il est aussi, cette fois réellement, construit une seule fois : une
dépendance mal posée le recréait à chaque question, et avec lui la poignée de
main avec YouTube. Mesuré sur quatre questions enchaînées, l'image apparaît
entre 1,4 et 2,5 secondes.

La réponse donnée, la vidéo entière réapparaît avec son titre et ses commandes.
Les touches 1 à 4 répondent, Entrée enchaîne.

La préparation tient dans un écran de téléphone, bouton compris : quoi
réviser en quatre grandes cases, dont le nombre dit ce qu'on va trouver, puis
deux réglages à deux positions. Tout a une valeur par défaut ; on peut lancer
sans rien toucher. Le grade préparé n'apparaît que lorsqu'on révise son
programme, et une seule technique filmée suffit à une séance sur la
démonstration, les leurres se tirant dans tout le catalogue.

Pendant la séance, le pied de page se retire. La barre de progression garde la
couleur de chaque réponse, et la bonne réponse passe en négatif une fois le
choix fait.

La séance se termine par un bilan et non par un écran de fin de partie : le
score, la précision, la meilleure série, puis le détail des dix questions, avec
pour chacune le résultat, la fiche accessible d'un clic et le moment de sa
prochaine révision, dit comme on le dit : aujourd'hui, demain, dans trois
jours. Avant ce détail, un bouton reprend aussitôt les techniques manquées,
tant que la démonstration est fraîche.

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

## La direction artistique — un carnet de judoka

La première version habillait l'interface en planche technique : papier
millimétré, réticules aux angles, lignes de cote, annotations en capitales
mono, rapporteur gradué. Tout y était justifié, et tout ensemble faisait
écran : on lisait le décor avant le judo. Il n'en reste que ce qui appartient
au judo.

- **Le tatami pour fond**, un vert profond et franchement chromatique ; le
  **vermillon**, sa complémentaire, pour ce qui appelle une action ; la
  **couleur des ceintures** pour la progression.
- **Les kanji sont le sujet**, pas un ornement. Chaque technique est
  identifiée par ses idéogrammes, chaque famille par le sien. Leur corps
  s'adapte au nombre de caractères, de un à cinq, pour qu'un nom long ne se
  casse jamais en deux lignes.
- **Les titres en mincho**, comme les noms japonais qu'ils accompagnent ; le
  texte courant en sans-serif, à 15 pixels au moins, les mentions à 13.
- **Le sol du dojo.** Chaque page s'ouvre sur une surface de combat vue d'en
  haut, posée comme au judo : des carrés de deux mètres faits de deux tapis
  d'un mètre sur deux, couchés puis debout en damier. Le joint est marqué d'une
  ombre et d'un liseré de lumière, et la trame de chaque tapis suit son sens. Il s'efface vers le
  bas : il pose le lieu, puis laisse lire. Un grain très fin ôte au vert son
  air d'aplat d'écran.
- **Le cachet.** La marque du carnet est un hanko vermillon, 柔 gravé en
  réserve, dans l'en-tête, l'icône et les aperçus de partage ; c'est la même
  marque que le tampon, apposé de travers, qui valide une technique acquise.
- **柔道 en creux**, monumental, en tête de l'accueil : le trait seul, pour
  qu'il porte la page sans disputer la lecture au titre.
- **Une seule entrée en scène** par page : le kanji se trace de haut en bas,
  dans le sens où il s'écrit, puis surtitre, titre, texte et vidéo montent
  l'un après l'autre. Rien ne bouge ensuite, sauf au survol.
- **Le pied de page** porte les deux principes de Jigoro Kano, 精力善用 et
  自他共栄, le plan du carnet et ses sources.
- **Aucun angle arrondi.**

Le carnet **tutoie**, partout : c'est l'usage du tapis.

Typographie IBM Plex Sans pour le texte, Shippori Mincho pour les titres et
les idéogrammes, IBM Plex Mono réservé aux touches de clavier et aux adresses.
Les polices sont servies par le site : IBM Plex par `@fontsource`, Shippori
Mincho réduite aux caractères du carnet par `npm run polices` (la police
complète pèse 15 Mo par graisse ; deux fichiers de 120 Ko suffisent). Après
l'ajout d'un kanji nouveau, relancer cette commande. Le texte
courant tient 7:1 contre le fond, le vermillon 4.5:1, les cinq teintes de
famille au moins 7:1 ; `npm run contraste` le vérifie.

### Ce que l'accueil montre, et dans quel ordre

Un nouveau venu trouve à droite du titre **la technique du jour** : tirée du
programme de la ceinture préparée, pourvue d'une démonstration, la même toute
la journée. C'est de quoi commencer sans rien avoir à choisir. Dès qu'il y a
une progression, cette place revient au relevé chiffré.

Viennent ensuite, dans l'ordre où on les cherche en ouvrant le carnet : ce
qu'on a **en cours de travail**, la **planche du grade préparé**, puis les
**cinq familles**, dont chacune mène à sa section du catalogue
(`/techniques#ashi-waza`). Les carrés d'état de la planche ont leur légende ;
une liste de situations d'étude de plus de huit lignes se replie.

### La fiche

Sur téléphone, l'ordre du document fait l'ordre de lecture : le nom, **la
démonstration**, puis le texte et les réglages. Sur grand écran, la vidéo
occupe la troisième colonne sur toute la hauteur de l'en-tête. Le fil
d'Ariane mène à la famille. La navigation d'une fiche à l'autre suit l'ordre
du catalogue affiché — famille, puis sous-famille — et s'arrête aux deux
bouts au lieu de boucler.

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
│  ├─ monjudo.ts             Mon judo : état, suggestions, carte, lien partagé
│  ├─ exportCarte.ts         La carte en image, par lien, sur papier
│  ├─ search.ts              Index et score de correspondance approchée
│  ├─ srs.ts                 Révision espacée (boîtes de Leitner)
│  ├─ quiz.ts                Génération des questions
│  ├─ backup.ts              Export et import du carnet (v3)
│  └─ motionFeatures.ts      Animations chargées à part
├─ hooks/
│  ├─ useJudodex.ts          Catalogue, progression, statistiques, files
│  ├─ useMonJudo.ts          L'état de Mon judo, rangé à part du carnet
│  ├─ useProfil.ts           Directions corrigées
│  ├─ useBrowseFilters.ts    Affinage local du catalogue
│  ├─ useRoute.ts            Routeur sur l'History API
│  ├─ useLocalStorage.ts     Persistance différée
│  └─ useUi.ts               Thème, focus, défilement, connexion
├─ components/               AppShell, Link, CommandPalette, ChoixTechnique,
│                            Palette, TechniqueCard, Seal, BeltMark,
│                            SectionHead, Surtitre, StudyList, DemoPlayer,
│                            YouTubeFacade, QuizVideo, Toast
│  └─ monjudo/               CarteJudo, les sept étapes et leurs pièces
├─ screens/                  HomeScreen, BrowseScreen, TechniqueScreen,
│                            TrainScreen, DanScreen, MonJudoScreen,
│                            CarteRecueScreen, ReglagesScreen
├─ __tests__/                Logique métier et parcours applicatif (jsdom)
└─ data/
   ├─ links.json             Les liens, fichier d'écriture
   └─ techniques.json        Les 104 techniques, liens fusionnés
```

Aucun écran ne contient de logique métier : tout vient de `useJudodex`, et
Mon judo de `lib/monjudo.ts`.

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
npm run og         # regénère public/og.png et les 104 cartes de partage
npm run miniatures # récupère les miniatures des démonstrations dans public/miniatures
npm run polices    # réduit Shippori Mincho aux caractères du carnet
npm run icone      # regénère les icônes PNG (180, 192, 512) depuis icon.svg
```

**La vie privée.** Un visiteur ne contacte que le site lui-même tant qu'il ne
lance pas une vidéo : les polices et les miniatures sont servies localement,
et seule la lecture appelle YouTube (`youtube-nocookie.com`). Une
Content-Security-Policy dans `vercel.json` le garantit : si une page tente de
charger autre chose, le navigateur le refuse. Ajouter une origine externe
demande donc de l'ajouter à la politique, ce qui se voit en relecture.

**La sauvegarde.** Le carnet ne vit que dans le navigateur. L'accueil rappelle
d'exporter quand la dernière sauvegarde a plus de trente jours (« Plus tard »
fait taire le rappel quatorze jours), à condition d'avoir au moins trois
techniques suivies ; la date figure aussi sous le bouton d'export des réglages.

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
