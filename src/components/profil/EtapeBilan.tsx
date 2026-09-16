import type { Judodex } from '../../hooks/useJudodex'
import type { Bilan } from '../../hooks/useBilan'
import type { EtapeId } from '../../hooks/useParcours'
import { Compte, LigneTechnique } from './pieces'
import { Link } from '../Link'
import { directionMeta } from '../../lib/secteurs'
import { CASES, deplacementMeta, gardeMeta } from '../../lib/situations'

interface Props {
  dex: Judodex
  bilan: Bilan
  aller: (id: EtapeId) => void
}

interface Consigne {
  titre: string
  texte: string
  etape: EtapeId
  bouton: string
}

/**
 * Une seule chose à faire, jamais trois.
 *
 * Un bilan qui énumère quatre manques n'en fait traiter aucun. On désigne donc
 * le plus gênant — dans l'ordre où les choses se construisent — et on renvoie
 * à l'étape qui le règle.
 */
function prochaine(b: Bilan): Consigne | null {
  if (b.vierge)
    return {
      titre: 'Commence par dire ce que tu sais faire',
      texte: "Trois ou quatre projections suffisent pour que le reste du bilan ait quelque chose à lire.",
      etape: 'repertoire',
      bouton: 'Remplir ma planche',
    }

  if (b.vides.length)
    return {
      titre: `Il te manque ${b.vides.length === 1 ? 'un coin' : `${b.vides.length} coins`}`,
      texte: `Personne ne te fait tomber en ${b.vides
        .map((s) => directionMeta(s).label.toLowerCase())
        .join(' ni en ')}. C'est là qu'un adversaire qui te connaît ira se mettre — et c'est ce que le passage de ceinture noire vérifie.`,
      etape: 'repertoire',
      bouton: 'Combler ce coin',
    }

  if (!b.armes.length)
    return {
      titre: 'Dis quelle technique tu places vraiment',
      texte: 'Tu couvres les quatre coins. Il te reste à dire laquelle est ta préférée, et ce que tu fais quand uke la bloque.',
      etape: 'systeme',
      bouton: 'Construire mon système',
    }

  const unSeulCoin = b.mesSystemes.filter((s) => s.autresCoins.length === 0)
  if (unSeulCoin.length)
    return {
      titre: `${unSeulCoin[0].arme.name} fait toujours tomber du même côté`,
      texte: "Toutes ses suites retombent dans le même coin. Il suffit d'une qui change de direction pour que l'adversaire ait deux côtés à défendre au lieu d'un.",
      etape: 'systeme',
      bouton: 'Ajouter une suite',
    }

  if (b.situations.vides.length) {
    const [g, d] = b.situations.vides[0].split(':') as [Parameters<typeof gardeMeta>[0], Parameters<typeof deplacementMeta>[0]]
    return {
      titre: `${gardeMeta(g).label}, ${deplacementMeta(d).court.toLowerCase()}`,
      texte: "Tu n'as encore rien à opposer dans ce cas de figure. C'est le dernier angle mort du bilan.",
      etape: 'situations',
      bouton: 'Voir quoi travailler',
    }
  }

  return null
}

/** La synthèse : ce qui est tenu, ce qui manque, et par quoi commencer. */
export function EtapeBilan({ dex, bilan, aller }: Props) {
  const suite = prochaine(bilan)
  const ouvrantes = bilan.mesSystemes.filter((s) => s.autresCoins.length > 0).length

  return (
    <div>
      {/* Ce qui est tenu, en trois chiffres. */}
      <div className="flex flex-wrap gap-x-4 gap-y-5 border border-ink bg-plate p-4 sm:p-5">
        <Compte n={4 - bilan.vides.length} sur={4} label="Coins où tu fais tomber" jp="崩しの方向" />
        <Compte n={bilan.situations.tenues.length} sur={CASES.length} label="Cas de garde couverts" jp="組み手" />
        <Compte
          n={ouvrantes}
          sur={Math.max(bilan.armes.length, 1)}
          label="Techniques qui font tomber ailleurs"
          jp="得意技"
        />
      </div>

      {/* La seule chose à faire ensuite. */}
      {suite ? (
        <div className="mt-8 border-l-[5px] border-signal bg-plate p-4 sm:p-5">
          <span className="annot text-signal">La prochaine chose à faire</span>
          <h3 className="mt-2 text-[19px] font-semibold leading-tight">{suite.titre}</h3>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-soft">{suite.texte}</p>
          {bilan.vides.length > 0 && !bilan.vierge && bilan.propositions[bilan.vides[0]]?.length > 0 && (
            <ul className="mt-3 max-w-md">
              {bilan.propositions[bilan.vides[0]].map(({ t, depuis }) => (
                <LigneTechnique key={t.slug} t={t} note={depuis ? `s'enchaîne depuis ${depuis.name}` : t.translation} />
              ))}
            </ul>
          )}
          <button
            onClick={() => aller(suite.etape)}
            className="mt-4 inline-flex bg-signal px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-field transition hover:brightness-110"
          >
            {suite.bouton} →
          </button>
        </div>
      ) : (
        <div className="mt-8 border-l-[5px] border-signal bg-plate p-4 sm:p-5">
          <span className="annot text-signal">Rien à redire</span>
          <h3 className="mt-2 text-[19px] font-semibold leading-tight">Ton judo tient debout</h3>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-soft">
            Quatre coins, huit cas de garde, et chacune de tes techniques fait tomber dans plus d'un coin. Le travail se
            déplace maintenant sur la qualité de ce que tu as, plus sur ce qui te manque.
          </p>
        </div>
      )}

      {/* Les systèmes, une ligne chacun. */}
      {bilan.mesSystemes.length > 0 && (
        <div className="mt-10">
          <h3 className="annot mb-2 border-b border-ink pb-2 text-faint">Tes techniques de prédilection</h3>
          <ul>
            {bilan.mesSystemes.map((s) => (
              <li key={s.arme.slug} className="border-b border-rule/60 py-2.5">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
                  <Link to={{ name: 'technique', slug: s.arme.slug }} className="text-[14px] font-semibold transition-colors hover:text-signal">
                    {s.arme.name}
                  </Link>
                  {s.secteur && <span className="annot text-faint">{directionMeta(s.secteur).label.toLowerCase()}</span>}
                  <span className={`annot ml-auto shrink-0 ${s.autresCoins.length ? 'text-signal' : 'text-faint'}`}>
                    {s.autresCoins.length === 0
                      ? 'un seul coin'
                      : s.autresCoins.length === 1
                        ? '2 coins'
                        : `${s.autresCoins.length + 1} coins`}
                  </span>
                </div>
                <p className="annot mt-1 leading-relaxed text-faint">{s.verdict}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Le sol, sur son propre axe. */}
      <div className="mt-10">
        <h3 className="annot mb-2 border-b border-ink pb-2 text-faint">
          Quand ça finit au sol
          <span className="ml-2 text-rule">寝技</span>
        </h3>
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {bilan.sol.map((c) => (
            <div key={c.id} className="min-w-0">
              <div className="mb-1 flex items-center gap-2.5 border-b border-rule pb-2">
                <span className="annot min-w-0 truncate">{c.label}</span>
                <span className={`annot ml-auto shrink-0 ${c.list.length ? 'text-faint' : 'text-signal'}`}>{c.list.length}</span>
              </div>
              {c.list.length > 0 ? (
                <ul>
                  {c.list.map((t) => {
                    const venant = c.depuis.get(t.slug)
                    return (
                      <LigneTechnique
                        key={t.slug}
                        t={t}
                        fort={dex.getProgress(t.slug).tokui}
                        note={venant ? `depuis ${venant.map((x) => x.name).join(', ')}` : undefined}
                      />
                    )
                  })}
                </ul>
              ) : (
                <p className="py-2.5 text-[13px] leading-relaxed text-faint">Rien pour finir de cette manière.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-5">
        <p className="annot min-w-0 flex-1 leading-relaxed text-faint">
          La direction d'une projection dépend de la forme enseignée. Si ton club en enseigne une autre, corrige-la.
        </p>
        <Link
          to={{ name: 'reglages' }}
          className="annot shrink-0 border border-ink px-3 py-2.5 transition hover:bg-ink hover:text-field"
        >
          Régler les directions
        </Link>
      </div>
    </div>
  )
}
