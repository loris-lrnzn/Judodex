import { useMemo, useState } from 'react'
import type { Judodex } from '../../hooks/useJudodex'
import type { MonJudoApi } from '../../hooks/useMonJudo'
import type { Technique } from '../../types/judodex'
import { FAMILY_META, GROUP_META, familyVars, kanjiSize } from '../../lib/families'
import { directionMeta, estDebout, secteurDe, type Direction, type Secteur } from '../../lib/secteurs'
import { CASES, DEPLACEMENTS, GARDES, caseDe, casesDe, deplacementMeta, gardeMeta, type Case } from '../../lib/situations'
import {
  FINITIONS,
  PAR_COIN,
  REACTIONS,
  contresDe,
  suggestionsCoin,
  suggestionsEntree,
  suggestionsReaction,
  suggestionsTransition,
  type Lecture,
  type ReactionId,
} from '../../lib/monjudo'
import type { FamilyGroup } from '../../types/judodex'
import { ChoixTechnique } from '../ChoixTechnique'
import { YouTubeFacade } from '../YouTubeFacade'
import { PlancheCoins } from './CarteJudo'
import { Libre, Suggestions, Tuile } from './pieces'

export interface EtapeProps {
  api: MonJudoApi
  l: Lecture
  dex: Judodex
  corrections: Record<string, Direction>
}

const coinDe = (slug: string, p: EtapeProps) => secteurDe(slug, p.api.mj.garde, p.corrections)
const libelleCoin = (s: Secteur | null) => (s ? directionMeta(s).label.toLowerCase() : undefined)

/** La fenêtre de choix libre, commune à toutes les étapes. */
function useChoixLibre() {
  const [choix, setChoix] = useState<{ titre: string; aide?: string; proposees: Technique[]; garder: (t: Technique) => boolean; onChoisir: (t: Technique) => void } | null>(null)
  const rendu = (dex: Judodex) => (
    <ChoixTechnique
      open={!!choix}
      dex={dex}
      titre={choix?.titre ?? ''}
      aide={choix?.aide}
      proposees={choix?.proposees ?? []}
      exclues={choix ? new Set(dex.techniques.filter((t) => !choix.garder(t)).map((t) => t.slug)) : undefined}
      onChoisir={(t) => choix?.onChoisir(t)}
      onClose={() => setChoix(null)}
    />
  )
  return { ouvrir: setChoix, rendu }
}

// ─── 1. Toi ─────────────────────────────────────────────────────────────

const KUMI = [
  { g: 'droite' as const, jp: '右組', romaji: 'Migi-kumi', label: 'Droitier', detail: 'Main droite au revers, pied droit devant.' },
  { g: 'gauche' as const, jp: '左組', romaji: 'Hidari-kumi', label: 'Gaucher', detail: 'Main gauche au revers, pied gauche devant.' },
]

export function EtapeToi({ api }: EtapeProps) {
  const { mj } = api
  return (
    <div className="space-y-9">
      <div>
        <label htmlFor="prenom" className="block text-[14px] font-medium text-soft">
          Ton prénom <span className="font-normal text-faint">— facultatif, il signe ta carte</span>
        </label>
        <input
          id="prenom"
          value={mj.prenom}
          onChange={(e) => api.setPrenom(e.target.value)}
          placeholder="Ton prénom"
          autoComplete="given-name"
          maxLength={40}
          className="mt-2 h-12 w-full max-w-sm border border-edge bg-field/60 px-4 text-[17px] text-ink outline-none transition placeholder:text-faint focus:border-ink"
        />
      </div>

      <div>
        <p id="garde" className="text-[14px] font-medium text-soft">
          Ta garde
        </p>
        <div role="radiogroup" aria-labelledby="garde" className="mt-2.5 grid gap-3 sm:grid-cols-2">
          {KUMI.map((k) => {
            const on = mj.garde === k.g
            return (
              <button
                key={k.g}
                role="radio"
                aria-checked={on}
                onClick={() => api.setGarde(k.g)}
                className={`relative flex min-w-0 items-center gap-5 border p-5 text-left transition ${on ? 'border-ink bg-plate' : 'border-edge hover:border-ink'}`}
              >
                {on && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-signal" />}
                <span lang="ja" aria-hidden className={`font-jp shrink-0 text-[3rem] font-extrabold leading-none ${on ? 'text-ink' : 'text-faint'}`}>
                  {k.jp}
                </span>
                <span className="min-w-0">
                  <span className="block text-[18px] font-semibold">{k.label}</span>
                  <span className="block text-[13px] italic text-faint">{k.romaji}</span>
                  <span className="mt-1.5 block text-[14px] leading-snug text-soft">{k.detail}</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-faint">
          Tout le reste se lit dans ce sens : les coins où tu fais tomber se renversent en miroir pour un gaucher.
        </p>
      </div>
    </div>
  )
}

// ─── 2. Ta technique ────────────────────────────────────────────────────

const GROUPES_DEBOUT: FamilyGroup[] = ['te-waza', 'koshi-waza', 'ashi-waza', 'sutemi-waza']

export function EtapeTechnique(p: EtapeProps) {
  const { api, l, dex } = p
  const [groupe, setGroupe] = useState<FamilyGroup | 'toutes'>(() => (l.tokui ? FAMILY_META[l.tokui.family].group : 'toutes'))
  const [q, setQ] = useState('')
  const plier = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ' ')

  const liste = useMemo(
    () =>
      dex.techniques
        .filter(estDebout)
        .filter((t) => groupe === 'toutes' || FAMILY_META[t.family].group === groupe)
        .filter((t) => !q.trim() || plier(`${t.name} ${t.translation} ${t.kanji}`).includes(plier(q.trim()))),
    [dex.techniques, groupe, q],
  )

  const t = l.tokui
  const suites = t ? (t.combinations ?? []).filter((c) => c.type === 'enchainement' || c.type === 'redoublement').length : 0

  return (
    <div>
      {/* La technique choisie, montrée : c’est un choix qu’on fait en voyant le geste. */}
      {t && (
        <div style={familyVars(t.family)} className="mb-8 grid gap-5 border border-ink bg-plate p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:p-5">
          <div className="min-w-0">
            {t.youtubeId || t.ffjudoId ? (
              <YouTubeFacade key={t.slug} id={(t.youtubeId ?? t.ffjudoId)!} title={`${t.name} — démonstration`} bare />
            ) : (
              <div className="grid aspect-video place-items-center bg-field">
                <span lang="ja" className="font-jp text-(--fam)" style={{ fontSize: kanjiSize(t.kanji, 'hero') }}>
                  {t.kanji}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-signal">Ta technique</p>
            <p className="mt-1 flex items-baseline gap-3">
              <span lang="ja" className="font-jp text-[2rem] font-extrabold leading-none text-(--fam)">
                {t.kanji}
              </span>
              <span className="font-jp text-[1.6rem] font-extrabold leading-tight">{t.name}</span>
            </p>
            <p className="mt-1 text-[14.5px] text-soft">{t.translation}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-faint">Fait tomber</dt>
                <dd className="mt-0.5 font-semibold">{libelleCoin(l.coinTokui) ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-faint">Suites connues</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{suites}</dd>
              </div>
            </dl>
            <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-faint">{t.intro}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Famille" className="rail-x flex max-w-full gap-1 overflow-x-auto">
          {(['toutes', ...GROUPES_DEBOUT] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupe(g)}
              aria-pressed={groupe === g}
              className={`tap inline-flex h-9 shrink-0 items-center gap-2 border px-3 text-[14px] font-medium transition ${
                groupe === g ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
              }`}
            >
              {g !== 'toutes' && (
                <span lang="ja" className="font-jp" style={{ color: groupe === g ? undefined : GROUP_META[g].color }}>
                  {GROUP_META[g].kanji}
                </span>
              )}
              {g === 'toutes' ? 'Toutes' : GROUP_META[g].name}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrer…"
          aria-label="Filtrer les techniques"
          className="h-9 min-w-0 flex-1 border border-edge bg-transparent px-3 text-[14px] outline-none placeholder:text-faint focus:border-ink sm:max-w-[14rem]"
        />
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
        {liste.map((x) => {
          const on = x.slug === t?.slug
          return (
            <li key={x.slug}>
              <button
                onClick={() => api.setTokui(on ? null : x.slug)}
                aria-pressed={on}
                style={familyVars(x.family)}
                className={`relative flex h-full w-full min-w-0 flex-col items-start border p-3 text-left transition ${
                  on ? 'border-ink bg-ink text-field' : 'border-edge bg-plate/40 hover:border-ink hover:bg-plate'
                }`}
              >
                <span lang="ja" className={`font-jp whitespace-nowrap font-bold leading-none ${on ? 'text-field' : 'text-(--fam)'}`} style={{ fontSize: kanjiSize(x.kanji, 'row') }}>
                  {x.kanji}
                </span>
                <span className="mt-2.5 block text-[14.5px] font-semibold leading-tight [overflow-wrap:anywhere]">{x.name}</span>
                <span className={`mt-0.5 block text-[12.5px] leading-snug ${on ? 'text-field/75' : 'text-faint'}`}>{x.translation}</span>
                {on && <span aria-hidden className="absolute right-2.5 top-2.5 text-[13px] font-bold">✓</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {liste.length === 0 && <p className="mt-4 text-[14px] text-faint">Aucune projection ne correspond.</p>}
    </div>
  )
}

// ─── 3. Tes coins ───────────────────────────────────────────────────────

export function EtapeCoins(p: EtapeProps) {
  const { api, l, dex, corrections } = p
  const { mj } = api
  const [ouvert, setOuvert] = useState<Secteur>(() => l.coinsVides[0] ?? l.coinTokui ?? 'av-d')
  const libre = useChoixLibre()
  const cat = { techniques: dex.techniques, bySlug: dex.bySlug }
  const liste = suggestionsCoin(ouvert, mj, cat, corrections)
  const plein = mj.coins[ouvert].length >= PAR_COIN
  const tokuiIci = l.coinTokui === ouvert && l.tokui

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
      <div>
        <PlancheCoins l={l} ouvert={ouvert} onChoisir={setOuvert} />
        <p className="mt-3 text-[13.5px] leading-relaxed text-faint">
          {l.coinsTenus.length} coin{l.coinsTenus.length > 1 ? 's' : ''} sur quatre. Touche un coin pour le remplir ; les hachures montrent ce qui manque.
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3 border-b border-edge pb-2">
          <h2 className="font-jp text-[1.4rem] font-bold">{directionMeta(ouvert).label}</h2>
          <span className="text-[13px] tabular-nums text-faint">
            {mj.coins[ouvert].length + (tokuiIci ? 1 : 0)} / {PAR_COIN + (tokuiIci ? 1 : 0)}
          </span>
        </div>
        {tokuiIci && (
          <p className="mt-3 text-[13.5px] text-soft">
            Ta technique, <span className="font-semibold text-ink">{l.tokui!.name}</span>, tombe déjà ici. Ajoute ce qui la complète.
          </p>
        )}
        <Libre
          label="Chercher une autre technique"
          onClick={() =>
            libre.ouvrir({
              titre: `Ajouter en ${directionMeta(ouvert).label.toLowerCase()}`,
              aide: 'Seules les projections qui tombent dans ce coin sont proposées.',
              proposees: liste.map((x) => x.t),
              garder: (t) => estDebout(t) && coinDe(t.slug, p) === ouvert && t.slug !== mj.tokui && !mj.coins[ouvert].includes(t.slug),
              onChoisir: (t) => api.basculerCoin(ouvert, t.slug),
            })
          }
        />
        <div className="mt-3">
          <Suggestions
            liste={liste}
            choisie={(s) => mj.coins[ouvert].includes(s)}
            onChoisir={(t) => api.basculerCoin(ouvert, t.slug)}
            plein={plein}
            vide="Aucune projection du catalogue ne tombe dans ce coin."
          />
        </div>
        {plein && <p className="mt-2 text-[13px] text-faint">Trois par coin, c’est assez : retire-en une pour en changer.</p>}
      </div>
      {libre.rendu(dex)}
    </div>
  )
}

// ─── 4. Ses réactions ───────────────────────────────────────────────────

export function EtapeReactions(p: EtapeProps) {
  const { api, l, dex } = p
  const { mj } = api
  const [active, setActive] = useState<ReactionId>(() => REACTIONS.find((r) => !mj.reactions[r.id])?.id ?? 'bloque')
  const libre = useChoixLibre()
  const cat = { techniques: dex.techniques, bySlug: dex.bySlug }

  if (!l.tokui)
    return (
      <div className="border border-dashed border-edge p-6">
        <p className="text-[15px] text-soft">Un système part d’une technique. Choisis d’abord la tienne.</p>
        <button onClick={() => api.aller('technique')} className="tap mt-4 bg-signal px-5 py-2.5 text-[14px] font-semibold text-field">
          Choisir ma technique →
        </button>
      </div>
    )

  const meta = REACTIONS.find((r) => r.id === active)!
  const liste = suggestionsReaction(active, mj, cat, p.corrections)
  const contres = contresDe(mj, cat)

  return (
    <div>
      <p className="text-[15px] text-soft">
        Tu attaques en <span className="font-semibold text-ink">{l.tokui.name}</span>. Uke réagit. Pour chacune de ses réactions, que fais-tu ?
      </p>

      {/* Les quatre réactions : on les traite l’une après l’autre, et chacune dit si elle a sa réponse. */}
      <div role="tablist" aria-label="Réactions de uke" className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {REACTIONS.map((r) => {
          const x = l.reactions.find((y) => y.id === r.id)!
          const on = active === r.id
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(r.id)}
              className={`relative min-w-0 border p-3 text-left transition ${on ? 'border-ink bg-plate' : 'border-edge hover:border-ink'}`}
            >
              {on && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-signal" />}
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14.5px] font-semibold">{r.label}</span>
                <span aria-hidden className={`text-[13px] font-bold ${x.t ? 'text-ink' : 'text-faint'}`}>{x.t ? '✓' : '·'}</span>
              </span>
              <span className="mt-1 block truncate text-[12.5px] text-faint">{x.t ? x.t.name : 'à choisir'}</span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" aria-label={meta.label} className="mt-6">
        <p className="text-[14px] leading-relaxed text-soft">
          <span className="font-semibold text-ink">{meta.label}.</span> {meta.detail} Une suite qui fait tomber dans un autre coin vaut double : il a deux
          côtés à défendre.
        </p>
        <Libre
          label="Choisir une autre suite"
          onClick={() =>
            libre.ouvrir({
              titre: `${meta.label} : ta suite`,
              proposees: liste.map((x) => x.t),
              garder: estDebout,
              onChoisir: (t) => api.setReaction(active, t.slug),
            })
          }
        />
        <div className="mt-4">
          <Suggestions
            liste={liste}
            choisie={(s) => mj.reactions[active] === s}
            onChoisir={(t) => api.setReaction(active, mj.reactions[active] === t.slug ? null : t.slug)}
            note={(t) => {
              const s = coinDe(t.slug, p)
              if (!s) return undefined
              return s !== l.coinTokui ? `↗ ${libelleCoin(s)}` : `même coin`
            }}
            vide="Le catalogue ne relie aucune suite à cette technique. Choisis-la toi-même."
          />
        </div>

      </div>

      {contres.length > 0 && (
        <div className="mt-9 border-l-[3px] border-signal bg-plate p-4 sm:p-5">
          <p className="text-[14px] font-semibold">Attention à ce qu’il peut te renvoyer</p>
          <p className="mt-1 text-[13.5px] text-faint">Sur {l.tokui.name}, un uke averti connaît ces contres. Les connaître, c’est déjà s’en garder.</p>
          <ul className="mt-3 space-y-2">
            {contres.map((c) => (
              <li key={c.t.slug} style={familyVars(c.t.family)} className="flex min-w-0 items-baseline gap-3">
                <span lang="ja" className="font-jp w-[4.2rem] shrink-0 whitespace-nowrap font-bold text-(--fam)">
                  {c.t.kanji}
                </span>
                <span className="min-w-0">
                  <span className="text-[14.5px] font-semibold">{c.t.name}</span>
                  <span className="text-[13px] text-faint"> — {c.context}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {libre.rendu(dex)}
    </div>
  )
}

// ─── 5. Tes entrées ─────────────────────────────────────────────────────

export function EtapeEntrees(p: EtapeProps) {
  const { api, l, dex } = p
  const { mj } = api
  const [ouverte, setOuverte] = useState<Case>(() => CASES.find((c) => !mj.entrees[c]) ?? CASES[0])
  const libre = useChoixLibre()
  const cat = { techniques: dex.techniques, bySlug: dex.bySlug }
  const [g, d] = ouverte.split(':') as [Parameters<typeof gardeMeta>[0], Parameters<typeof deplacementMeta>[0]]
  const liste = suggestionsEntree(ouverte, l, cat)
  const casesTokui = l.tokui ? casesDe(l.tokui).filter((c) => !mj.entrees[c]) : []

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] table-fixed border-separate border-spacing-1.5">
          <caption className="sr-only">Tes entrées : garde relative en lignes, déplacement de uke en colonnes</caption>
          <thead>
            <tr>
              <td className="w-[6.5rem]" />
              {DEPLACEMENTS.map((x) => (
                <th key={x.id} scope="col" className="pb-1 text-center text-[13px] font-medium text-soft">
                  {x.court}
                  <span lang="ja" className="font-jp block text-[11px] font-normal text-faint">
                    {x.jp}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GARDES.map((gm) => (
              <tr key={gm.id}>
                <th scope="row" className="pr-2 text-left text-[13px] font-medium leading-tight">
                  {gm.label}
                  <span lang="ja" className="font-jp block text-[11px] font-normal text-faint">
                    {gm.jp}
                  </span>
                </th>
                {DEPLACEMENTS.map((x) => {
                  const c = caseDe(gm.id, x.id)
                  const t = l.parEntree[c]
                  const on = ouverte === c
                  return (
                    <td key={x.id} className="p-0">
                      <button
                        onClick={() => setOuverte(c)}
                        aria-pressed={on}
                        aria-label={`${gm.label}, ${x.court.toLowerCase()} — ${t ? t.name : 'rien de prévu'}`}
                        style={t ? familyVars(t.family) : undefined}
                        className={`flex h-16 w-full flex-col items-center justify-center border px-1 transition ${
                          t ? 'border-rule bg-plate' : 'hachure border-dashed border-edge'
                        } ${on ? 'outline outline-2 -outline-offset-1 outline-signal' : 'hover:border-ink'}`}
                      >
                        {t ? (
                          <>
                            <span lang="ja" className="font-jp whitespace-nowrap font-bold leading-none text-(--fam)" style={{ fontSize: kanjiSize(t.kanji, 'row') }}>
                              {t.kanji}
                            </span>
                            <span className="mt-1 block w-full truncate text-[11px] text-faint">{t.name}</span>
                          </>
                        ) : (
                          <span className="text-[18px] leading-none text-faint">+</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {casesTokui.length > 0 && (
        <button
          onClick={() => casesTokui.forEach((c) => api.setEntree(c, l.tokui!.slug))}
          className="tap mt-3 inline-flex items-center gap-2 border border-edge px-4 py-2.5 text-[14px] font-medium text-soft transition hover:border-ink hover:text-ink"
        >
          Placer {l.tokui!.name} là où le catalogue la place
          <span className="text-faint">· {casesTokui.length}</span>
        </button>
      )}

      <div className="mt-7">
        <div className="border-b border-edge pb-2">
          <h2 className="font-jp text-[1.4rem] font-bold">
            {gardeMeta(g).label}, {deplacementMeta(d).court.toLowerCase()}
          </h2>
          <p className="mt-1 text-[13.5px] text-faint">{gardeMeta(g).note}</p>
        </div>
        <Libre
          label="Choisir une autre technique"
          onClick={() =>
            libre.ouvrir({
              titre: `${gardeMeta(g).label}, ${deplacementMeta(d).court.toLowerCase()}`,
              proposees: liste.map((x) => x.t),
              garder: estDebout,
              onChoisir: (t) => api.setEntree(ouverte, t.slug),
            })
          }
        />
        <div className="mt-3">
          <Suggestions
            liste={liste}
            choisie={(s) => mj.entrees[ouverte] === s}
            onChoisir={(t) => api.setEntree(ouverte, mj.entrees[ouverte] === t.slug ? null : t.slug)}
            vide="Rien dans ton judo ni dans le catalogue ne part de cette situation."
            limite={7}
          />
        </div>
      </div>
      {libre.rendu(dex)}
    </div>
  )
}

// ─── 6. Au sol ──────────────────────────────────────────────────────────

const estSol = (t: Technique) => FAMILY_META[t.family].group === 'ne-waza'

export function EtapeSol(p: EtapeProps) {
  const { api, l, dex } = p
  const { mj } = api
  const libre = useChoixLibre()
  const cat = { techniques: dex.techniques, bySlug: dex.bySlug }
  const transitions = suggestionsTransition(l, cat)
  const [domaine, setDomaine] = useState<(typeof FINITIONS)[number]['id']>(() =>
    l.finition ? (l.finition.family as (typeof FINITIONS)[number]['id']) : 'osaekomi-waza',
  )
  const finitions = dex.techniques.filter((t) => t.family === domaine)

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-jp text-[1.4rem] font-bold">Il tombe mal : tu enchaînes sur…</h2>
        <p className="mt-1 text-[14px] text-faint">Les passages que le catalogue attache aux projections de ton judo.</p>
        <Libre
          label="Choisir un autre contrôle au sol"
          onClick={() =>
            libre.ouvrir({
              titre: 'Ton passage au sol',
              proposees: transitions.map((x) => x.t),
              garder: estSol,
              onChoisir: (t) => api.setTransition(t.slug),
            })
          }
        />
        <div className="mt-4">
          <Suggestions
            liste={transitions}
            choisie={(s) => mj.transition === s}
            onChoisir={(t) => api.setTransition(mj.transition === t.slug ? null : t.slug)}
            vide="Tes projections n’ont pas de passage au sol relevé. Choisis-en un toi-même."
            limite={6}
          />
        </div>

      </div>

      <div>
        <h2 className="font-jp text-[1.4rem] font-bold">Et tu finis par…</h2>
        <div role="group" aria-label="Manière de finir" className="mt-4 grid grid-cols-3 gap-1.5">
          {FINITIONS.map((f) => {
            const on = domaine === f.id
            return (
              <button
                key={f.id}
                onClick={() => setDomaine(f.id)}
                aria-pressed={on}
                className={`relative min-w-0 border p-3 text-left transition sm:p-4 ${on ? 'border-ink bg-plate' : 'border-edge hover:border-ink'}`}
              >
                {on && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-signal" />}
                <span lang="ja" className="font-jp block text-[1.3rem] font-bold leading-none" style={{ color: GROUP_META['ne-waza'].color }}>
                  {f.jp}
                </span>
                <span className="mt-2 block text-[15px] font-semibold">{f.label}</span>
                <span className="mt-0.5 hidden text-[12.5px] leading-snug text-faint sm:block">{f.detail}</span>
              </button>
            )
          })}
        </div>
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {finitions.map((t) => (
            <li key={t.slug}>
              <Tuile t={t} raison={t.translation} choisie={mj.finition === t.slug} onClick={() => api.setFinition(mj.finition === t.slug ? null : t.slug)} />
            </li>
          ))}
        </ul>
      </div>
      {libre.rendu(dex)}
    </div>
  )
}

