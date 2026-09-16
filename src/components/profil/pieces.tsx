import type { Judodex } from '../../hooks/useJudodex'
import { Link } from '../Link'
import { FAMILY_META, GROUP_META } from '../../lib/families'
import { directionMeta } from '../../lib/secteurs'
import type { Branche, Systeme } from '../../lib/systeme'
import type { Combination, Technique } from '../../types/judodex'

/**
 * Retirer une technique du répertoire.
 *
 * Un tokui-waza qu'on ne compte plus parmi ses techniques n'a plus de sens :
 * décocher lève donc les deux marques d'un coup, plutôt que d'interdire le
 * geste et de renvoyer l'utilisateur à la fiche.
 */
export function basculerRepertoire(dex: Judodex, slug: string) {
  const p = dex.getProgress(slug)
  if (p.mastery === 'mastered' || p.tokui) {
    if (p.tokui) dex.toggleTokui(slug)
    dex.setMastery(slug, 'unknown')
  } else {
    dex.setMastery(slug, 'mastered')
  }
}

export function LigneTechnique({ t, note, fort }: { t: Technique; note?: string; fort?: boolean }) {
  const group = GROUP_META[FAMILY_META[t.family].group]
  return (
    <li className="border-b border-rule/60 last:border-0">
      <Link
        to={{ name: 'technique', slug: t.slug }}
        className="flex min-w-0 items-center gap-3 py-2.5 pr-1 transition-colors hover:text-signal"
      >
        <span className="h-3.5 w-[3px] shrink-0" style={{ background: group.color }} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[13.5px] leading-snug ${fort ? 'font-semibold' : ''}`}>{t.name}</span>
          {note && <span className="annot block truncate text-faint">{note}</span>}
        </span>
        {fort && (
          <span className="annot shrink-0 text-signal" title="Technique de prédilection">
            Tokui
          </span>
        )}
      </Link>
    </li>
  )
}

/**
 * Le geste d'ajout, partout le même. Un carré au trait plutôt qu'un simple
 * signe : sans cadre, le « + » se confond avec le texte et ne se donne pas
 * pour un bouton.
 */
export function Plus({ label, onClick, large }: { label: string; onClick: () => void; large?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`shrink-0 border border-edge leading-none text-faint transition hover:border-signal hover:bg-signal hover:text-field ${
        large ? 'annot inline-flex items-center gap-1.5 px-2 py-1.5' : 'grid size-5 place-items-center text-[13px]'
      }`}
    >
      <span className="text-[13px] leading-none">+</span>
      {large && <span>Ajouter</span>}
    </button>
  )
}

/** Un chiffre du bandeau de verdict : ce qui est tenu sur ce qui est demandé. */
export function Compte({ n, sur, label, jp }: { n: number; sur: number; label: string; jp: string }) {
  return (
    <div className="min-w-0 flex-1 border-l-[3px] border-rule pl-3">
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[26px] font-semibold leading-none tabular-nums ${n < sur ? 'text-signal' : 'text-ink'}`}>{n}</span>
        <span className="text-[15px] leading-none text-faint tabular-nums">/{sur}</span>
      </div>
      <div className="annot mt-2 truncate">{label}</div>
      <div className="font-jp truncate text-[11px] text-faint">{jp}</div>
    </div>
  )
}

/** Une branche proposée : le pratiquant dit s'il la fait, et elle entre au système. */
export function LigneBranche({ b, onBasculer }: { b: Branche; onBasculer: () => void }) {
  return (
    <li className="min-w-0 border-b border-rule/60 py-2 last:border-0">
      <div className="flex min-w-0 items-start gap-2.5">
        <button
          onClick={onBasculer}
          role="switch"
          aria-checked={b.retenue}
          title={b.retenue ? 'Retirer du système' : 'Je fais ça'}
          className={`mt-[3px] grid size-4 shrink-0 place-items-center border text-[10px] leading-none transition ${
            b.retenue ? 'border-signal bg-signal text-field' : 'border-rule text-transparent hover:border-ink'
          }`}
        >
          ✓
        </button>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              to={{ name: 'technique', slug: b.cible.slug }}
              className={`min-w-0 text-[13.5px] transition-colors hover:text-signal ${b.retenue ? '' : 'text-soft'}`}
            >
              {b.cible.name}
            </Link>
            {b.retenue && b.ouvre && b.acquise && (
              <span className="annot shrink-0 border border-signal px-1.5 py-0.5 leading-none text-signal">
                fait tomber en {directionMeta(b.secteur!).label.toLowerCase()}
              </span>
            )}
            {!b.acquise && (
              <span className="annot shrink-0 border border-rule px-1.5 py-0.5 leading-none text-faint">à apprendre</span>
            )}
          </span>
          <span className={`annot mt-1 block leading-relaxed ${b.retenue ? 'text-faint' : 'text-rule'}`}>
            <span className={b.retenue ? 'text-soft' : ''}>{b.amorce}</span> · {b.lien.context}
          </span>
        </span>
      </div>
    </li>
  )
}

/** Un bloc de branches, annoncé par son titre même quand il est vide. */
export function Groupe({
  titre,
  branches,
  vide,
  onBasculer,
  onAjouter,
  ajout,
}: {
  titre: string
  branches: Branche[]
  vide: string
  onBasculer: (cle: string) => void
  onAjouter?: () => void
  ajout?: string
}) {
  const n = branches.filter((b) => b.retenue).length
  return (
    <div className="min-w-0">
      <h4 className="annot flex items-baseline gap-2 border-b border-rule pb-1.5 text-faint">
        <span className="min-w-0 flex-1">{titre}</span>
        {branches.length > 0 && (
          <span className={`shrink-0 tabular-nums ${n ? 'text-signal' : 'text-rule'}`}>
            {n}/{branches.length}
          </span>
        )}
      </h4>
      {branches.length ? (
        <ul>
          {branches.map((b) => (
            <LigneBranche key={b.cle} b={b} onBasculer={() => onBasculer(b.cle)} />
          ))}
        </ul>
      ) : (
        <p className="py-2 text-[13px] leading-relaxed text-faint">{vide}</p>
      )}
      {onAjouter && ajout && (
        <div className="mt-2">
          <Plus large label={ajout} onClick={onAjouter} />
        </div>
      )}
    </div>
  )
}

/**
 * Une liste cochable : toutes les techniques d'un coin de la rose ou d'une
 * case de la grille, qu'on les fasse ou non. C'est le geste commun aux deux
 * étapes — on lisait qu'il manquait quelque chose sans pouvoir le combler
 * sans quitter la page.
 */
export function ListeCochable({
  titre,
  jp,
  aide,
  techniques,
  estAcquise,
  estTokui,
  onBasculer,
  verrouillee,
  estAttribuee,
  onBasculerAttribution,
  onChercher,
  onFermer,
}: {
  titre: string
  jp?: string
  aide: string
  techniques: Technique[]
  estAcquise: (slug: string) => boolean
  estTokui: (slug: string) => boolean
  onBasculer: (slug: string) => void
  /**
   * Cochée sans que le pratiquant puisse la décocher : c'est le catalogue qui
   * la range là, et il n'a pas à être contredit d'un clic distrait.
   */
  verrouillee?: (slug: string) => boolean
  /** Rangée ici par le pratiquant, et non par les liens du catalogue. */
  estAttribuee?: (slug: string) => boolean
  onBasculerAttribution?: (slug: string) => void
  onChercher?: () => void
  onFermer: () => void
}) {
  const n = techniques.filter((t) => estAcquise(t.slug)).length

  return (
    <div role="group" aria-label={titre} className="mt-8 border border-ink bg-plate p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-b border-ink pb-3">
        <h3 className="text-[15px] font-semibold">{titre}</h3>
        {jp && <span className="font-jp text-[13px] text-faint">{jp}</span>}
        <span className={`annot ${n ? 'text-faint' : 'text-signal'}`}>
          {n} sur {techniques.length} à ton répertoire
        </span>
        <button onClick={onFermer} className="annot ml-auto shrink-0 text-faint transition-colors hover:text-signal">
          Fermer
        </button>
      </div>

      <p className="annot mt-3 leading-relaxed text-faint">{aide}</p>

      {techniques.length === 0 ? (
        <p className="mt-3 text-[13px] leading-relaxed text-faint">
          Aucune technique du catalogue n'est encore relevée dans ce cas.
        </p>
      ) : (
        <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
          {techniques.map((t) => {
            const acquise = estAcquise(t.slug)
            const tokui = estTokui(t.slug)
            const figee = verrouillee?.(t.slug) ?? false
            const group = GROUP_META[FAMILY_META[t.family].group]
            return (
              <li key={t.slug} className="flex min-w-0 items-start gap-2.5 border-b border-rule/60 py-2">
                <button
                  onClick={() => onBasculer(t.slug)}
                  role="switch"
                  aria-checked={acquise || figee}
                  aria-label={`${t.name} à ton répertoire`}
                  disabled={figee}
                  title={figee ? "Le catalogue la range ici : rien à cocher" : undefined}
                  className={`mt-[3px] grid size-4 shrink-0 place-items-center border text-[10px] leading-none transition ${
                    acquise || figee ? 'border-signal bg-signal text-field' : 'border-rule text-transparent hover:border-ink'
                  } ${figee ? 'cursor-default opacity-70' : ''}`}
                >
                  ✓
                </button>
                <span className="h-3.5 w-[3px] shrink-0 translate-y-1" style={{ background: group.color }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <Link
                    to={{ name: 'technique', slug: t.slug }}
                    className={`block truncate text-[13.5px] transition-colors hover:text-signal ${acquise ? '' : 'text-soft'}`}
                  >
                    {t.name}
                  </Link>
                  <span className="annot block truncate text-faint">{t.translation}</span>
                </span>
                {estAttribuee?.(t.slug) && onBasculerAttribution && (
                  <button
                    onClick={() => onBasculerAttribution(t.slug)}
                    title="Tu as rangé cette technique ici toi-même. Cliquer la retire de ce cas."
                    className="annot shrink-0 text-faint underline transition-colors hover:text-signal"
                  >
                    par toi
                  </button>
                )}
                {tokui && <span className="annot shrink-0 text-signal">Tokui</span>}
              </li>
            )
          })}
        </ul>
      )}

      {onChercher && (
        <div className="mt-3">
          <Plus large label={`Chercher une autre technique pour ${titre.toLowerCase()}`} onClick={onChercher} />
        </div>
      )}
    </div>
  )
}

/**
 * La carte d'une technique de prédilection, repliée par défaut.
 *
 * Dépliées, quatre cartes font une page interminable qu'on parcourt au
 * défilement sans jamais rien comparer. Repliée, une carte tient en une ligne
 * qui dit l'essentiel — le coin, les suites, le verdict — et l'on ouvre celle
 * qu'on travaille.
 */
export function CarteSysteme({
  s,
  tokui,
  ouverte,
  onOuvrir,
  onBasculer,
  onToutRetenir,
  onVider,
  onRetirerArme,
  onAjouter,
}: {
  s: Systeme
  /** Une technique déclarée tokui-waza ne se retire que depuis sa fiche. */
  tokui: boolean
  ouverte: boolean
  onOuvrir: () => void
  onBasculer: (cle: string) => void
  onToutRetenir: () => void
  onVider: () => void
  onRetirerArme: () => void
  onAjouter: (type: Combination['type']) => void
}) {
  const nu = s.montees === 0

  return (
    <article className={`min-w-0 border bg-plate ${nu ? 'border-rule' : 'border-ink'}`}>
      <h3>
        <button
          onClick={onOuvrir}
          aria-expanded={ouverte}
          className="flex w-full min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1.5 p-4 text-left transition-colors hover:text-signal sm:px-5"
        >
          <span className="annot shrink-0 text-faint">{ouverte ? '▾' : '▸'}</span>
          <span className="text-[15px] font-semibold">{s.arme.name}</span>
          <span className="font-jp text-[13px] text-faint">{s.arme.kanji}</span>
          {s.secteur && (
            <span className="annot border border-rule px-1.5 py-0.5 leading-none text-faint">{directionMeta(s.secteur).label}</span>
          )}
          <span className={`annot ml-auto shrink-0 ${nu ? 'text-faint' : 'text-signal'}`}>
            {nu
              ? 'rien de coché'
              : s.autresCoins.length === 0
                ? 'un seul coin'
                : s.autresCoins.length === 1
                  ? '2 coins'
                  : `${s.autresCoins.length + 1} coins`}
          </span>
        </button>
      </h3>

      {/* Replié, on garde le verdict : c'est la seule ligne qu'on veut pouvoir
          comparer d'une arme à l'autre sans rien ouvrir. */}
      <p className={`px-4 pb-4 text-[13.5px] leading-relaxed text-soft sm:px-5 ${ouverte ? 'border-b border-ink' : ''}`}>
        {s.verdict}
      </p>

      {ouverte && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="annot min-w-0 flex-1 text-faint">
              {s.montees === 0
                ? 'Coche chaque suite que tu fais vraiment.'
                : `${s.montees} suite${s.montees > 1 ? 's' : ''} cochée${s.montees > 1 ? 's' : ''}.`}
            </p>
            {nu ? (
              <button onClick={onToutRetenir} className="annot shrink-0 border border-ink px-2.5 py-1.5 transition hover:bg-ink hover:text-field">
                Je fais tout ça
              </button>
            ) : (
              <button onClick={onVider} className="annot shrink-0 text-faint underline transition-colors hover:text-signal">
                Tout décocher
              </button>
            )}
            {tokui ? (
              <span className="annot shrink-0 text-faint" title="Se retire depuis la fiche de la technique">
                Tokui-waza
              </span>
            ) : (
              <button onClick={onRetirerArme} className="annot shrink-0 text-faint underline transition-colors hover:text-signal">
                Retirer cette technique
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-2">
            <Groupe
              titre="Il se défend, j'enchaîne"
              branches={s.suites}
              vide="Aucun enchaînement déclaré depuis cette attaque."
              onBasculer={onBasculer}
              onAjouter={() => onAjouter('enchainement')}
              ajout="Ajouter un enchaînement"
            />
            <Groupe
              titre="J'insiste"
              branches={s.redoublements}
              vide="Pas de redoublement connu : une seule chance à chaque entrée."
              onBasculer={onBasculer}
              onAjouter={() => onAjouter('redoublement')}
              ajout="Ajouter un redoublement"
            />
            <Groupe
              titre="Il tombe mal, j'enchaîne au sol"
              branches={s.sol}
              vide="Aucun enchaînement au sol connu depuis cette technique."
              onBasculer={onBasculer}
              onAjouter={() => onAjouter('liaison-sol')}
              ajout="Ajouter un enchaînement au sol"
            />
            <Groupe
              titre="Ce que je prends"
              branches={s.risques}
              vide="Aucun contre connu contre cette technique."
              onBasculer={onBasculer}
              onAjouter={() => onAjouter('contre')}
              ajout="Ajouter un contre"
            />
          </div>
        </div>
      )}
    </article>
  )
}

/** Le choix des techniques de prédilection : le premier geste de la construction. */
export function ChoixArmes({
  candidates,
  estArme,
  onBasculer,
}: {
  candidates: { t: Technique; tokui: boolean }[]
  estArme: (slug: string) => boolean
  onBasculer: (slug: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {candidates.map(({ t, tokui }) => {
        const choisie = tokui || estArme(t.slug)
        return (
          <button
            key={t.slug}
            onClick={() => !tokui && onBasculer(t.slug)}
            aria-pressed={choisie}
            disabled={tokui}
            title={tokui ? 'Tokui-waza : déclarée sur sa fiche, elle est là d\'office' : undefined}
            className={`annot border px-2.5 py-1.5 transition ${
              choisie
                ? 'border-signal bg-signal text-field'
                : 'border-edge text-soft hover:border-ink hover:text-ink'
            } ${tokui ? 'cursor-default' : ''}`}
          >
            {/* Le signe dit l'état du choix : ce rang propose, il n'affirme pas. */}
            <span aria-hidden className="mr-1.5 opacity-70">
              {choisie ? '✓' : '+'}
            </span>
            {t.name}
            {tokui && <span className="ml-1.5 opacity-70">tokui</span>}
          </button>
        )
      })}
    </div>
  )
}
