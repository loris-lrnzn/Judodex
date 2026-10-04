import type { Judodex } from '../hooks/useJudodex'
import { PROGRESSION_SOURCE } from '../lib/belts'
import donnees from '../data/techniques.json'
import { Link } from '../components/Link'
import { Surtitre } from '../components/Surtitre'
import { Fil } from '../components/PageSeo'

const CONTACT = 'contact@judodex.fr'

const lien ='text-ink underline decoration-edge underline-offset-4 hover:decoration-ink'

/** Date du dernier relevé, dite en toutes lettres. */
const releve = new Date((donnees as { scrapedAt?: string }).scrapedAt ?? Date.now()).toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule py-10">
      <h2 className="font-jp mb-4 text-[1.6rem] font-bold leading-tight">{titre}</h2>
      <div className="grid max-w-3xl gap-4 text-[15px] leading-[1.75] text-soft">{children}</div>
    </section>
  )
}

/** Qui parle, d'où viennent les contenus et comment ils sont tenus à jour. */
export function AProposScreen({ dex }: { dex: Judodex }) {
  const fiches = dex.techniques
  const phases = fiches.reduce((n, t) => n + t.phases.length, 0)
  const points = fiches.reduce((n, t) => n + (t.keyPoints?.length ?? 0), 0)
  const filmees = fiches.filter((t) => t.youtubeId || t.ffjudoId).length

  return (
    <article className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-7">
      <Fil elements={[{ label: 'À propos' }]} />

      <header className="pb-10 pt-6 sm:pt-12">
        <Surtitre className="monte">Méthode et sources</Surtitre>
        <h1 className="display monte mt-5 max-w-4xl" style={{ '--d': '80ms' } as React.CSSProperties}>
          À propos de Judodex
        </h1>
        <p className="monte mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
          Judodex est un carnet de judo en français : le catalogue des {fiches.length} techniques, leur décomposition martiale, le programme de
          chaque passage de grade et une mémoire de ce que chacun travaille. Cette page dit d'où viennent les contenus et comment ils sont tenus.
        </p>
      </header>

      <Bloc titre="Ce que contient le carnet">
        <p>
          Chaque fiche porte le nom japonais de la technique, ses kanji, sa traduction, sa famille et son niveau. Elle la décompose en trois temps
          — <Link to={{ name: 'lexique' }} hash="kuzushi" className={lien}>kuzushi</Link>,{' '}
          <Link to={{ name: 'lexique' }} hash="tsukuri" className={lien}>tsukuri</Link> et{' '}
          <Link to={{ name: 'lexique' }} hash="kake" className={lien}>kake</Link> —, donne ses points clés, ses enchaînements et ses contres, et renvoie
          à une démonstration filmée quand une source en publie une.
        </p>
        <p>
          Le catalogue compte aujourd'hui {fiches.length} fiches, {phases} descriptions de phase et {points} points clés ; {filmees} fiches
          renvoient à une démonstration filmée. Les programmes de passage de grade se lisent sur les pages{' '}
          <Link to={{ name: 'ceintures' }} className={lien}>ceintures</Link>, et les familles de techniques sur leurs pages{' '}
          <Link to={{ name: 'famille', group: 'koshi-waza' }} className={lien}>famille</Link>.
        </p>
      </Bloc>

      <Bloc titre="D'où viennent les contenus">
        <ul className="grid gap-3">
          <li>
            <strong className="font-semibold text-ink">Les textes</strong> — présentations, décompositions, points clés et contextes
            d'enchaînement — sont écrits pour Judodex. Ils ne reprennent aucun texte d'un autre site.
          </li>
          <li>
            <strong className="font-semibold text-ink">La nomenclature</strong> — noms japonais, kanji, traduction usuelle, famille — n'appartient à
            personne : c'est celle de la pratique, telle que le Kodokan l'a fixée.
          </li>
          <li>
            <strong className="font-semibold text-ink">Les programmes de passage de grade</strong> sont ceux de la{' '}
            <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className={lien}>progression française de l'enseignement du judo</a>,
            publiée par la Fédération française de judo. Ceux des dan suivent le référentiel des juges de la commission spécialisée des dans et
            grades équivalents (CSDGE), saison 2024/2025.
          </li>
          <li>
            <strong className="font-semibold text-ink">Les démonstrations filmées</strong> sont celles du Kodokan et de France Judo, intégrées
            depuis leurs chaînes. Aucune vidéo n'est copiée ni hébergée ici.
          </li>
        </ul>
      </Bloc>

      <Bloc titre="Comment les fiches sont tenues">
        <p>
          Les liens entre techniques sont typés — enchaînement, redoublement, liaison au sol, contre — et chacun dit la situation qui le
          déclenche. Un contrôle automatique refuse une cible inconnue, un doublon, ou un lien qui descend au sol sans le dire. Les identifiants
          des vidéos sont vérifiés un par un : chaque vidéo répond et vient de la chaîne annoncée.
        </p>
        <p>Dernier relevé de la nomenclature : {releve}.</p>
      </Bloc>

      <Bloc titre="Ce que Judodex n'est pas">
        <p>
          Judodex n'est pas un site officiel de la Fédération française de judo ni du Kodokan. Il présente leurs programmes et leurs démonstrations
          pour aider à les apprendre, mais ne s'y substitue pas : pour un passage de grade, la planche publiée par la fédération fait foi, et
          l'enseignant du club reste le seul juge de ce qu'il faut travailler.
        </p>
        <p>
          Un livre ou une vidéo ne remplacent pas un partenaire. La décomposition en trois temps aide à comprendre une technique, mais on ne
          l'apprend que sur le tatami, avec un uke et un professeur.
        </p>
      </Bloc>

      <Bloc titre="Vie privée">
        <p>
          La progression, la garde, les directions corrigées et la carte de Mon judo restent dans ton navigateur : rien de tout cela n'est envoyé
          à un serveur, et aucun compte n'est demandé. Le site compte seulement ses visites avec Vercel Analytics, sans cookie, sans
          identifiant et sans te suivre d'une page ou d'un site à l'autre. Les polices et les miniatures sont servies par le site lui-même ; seule
          la lecture d'une vidéo contacte YouTube, au moment où tu la lances. Tu peux exporter ton carnet depuis les{' '}
          <Link to={{ name: 'reglages' }} className={lien}>réglages</Link>.
        </p>
      </Bloc>

      <Bloc titre="Contact">
        <p>
          Une erreur dans une fiche, une technique manquante, une vidéo qui ne répond plus ou une question sur le carnet : écris à{' '}
          <a href={`mailto:${CONTACT}`} className={lien}>{CONTACT}</a>.
        </p>
      </Bloc>
    </article>
  )
}
