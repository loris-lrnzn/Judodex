import { useMemo, useState } from 'react'
import { m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { Link } from '../components/Link'
import { SectionHead } from '../components/SectionHead'
import { FAMILY_META, GROUP_META } from '../lib/families'
import {
  DANS,
  DAN_SOURCE,
  GROUPES_NAGE,
  GROUPES_NE,
  PROGRAMMES,
  danOf,
  groupeMeta,
  kataOf,
  programmeSlugs,
  programmeTotal,
  seriesFor,
  tirerUv2,
  type Dan,
  type DanId,
  type Groupe,
  type Kata,
  type Tirage,
  type Uv,
  type UvCode,
} from '../lib/dan'
import type { Technique } from '../types/judodex'

interface Props {
  dan: DanId
  dex: Judodex
}

/* ------------------------------------------------------------------ pièces */

/** Ligne de technique : rang, nom, sens, famille, lien vers la fiche. */
function Ligne({ t, rang, dex, note }: { t: Technique; rang?: string; dex: Judodex; note?: string }) {
  const group = GROUP_META[FAMILY_META[t.family].group]
  const acquise = dex.getProgress(t.slug).mastery === 'mastered'

  return (
    <li className="border-b border-rule/60 last:border-0">
      <Link
        to={{ name: 'technique', slug: t.slug }}
        className="group flex min-w-0 items-center gap-3 py-2.5 pr-1 transition-colors hover:text-signal"
      >
        {rang && <span className="annot w-6 shrink-0 text-faint">{rang}</span>}
        <span className="h-3.5 w-[3px] shrink-0" style={{ background: group.color }} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] leading-snug">{t.name}</span>
          <span className="annot block truncate text-faint">{note ?? t.translation}</span>
        </span>
        {acquise && (
          <span className="annot shrink-0 text-faint" title="Acquise">
            ✓
          </span>
        )}
        <span className="font-jp shrink-0 text-[13px] text-faint">{t.kanji}</span>
      </Link>
    </li>
  )
}

/** Technique du kata absente du catalogue : nommée, mais sans lien. */
function LigneSansFiche({ label, rang }: { label: string; rang?: string }) {
  const [nom, kanji, sens] = label.split(' · ')
  return (
    <li className="border-b border-rule/60 last:border-0">
      <div className="flex min-w-0 items-center gap-3 py-2.5 pr-1 text-faint">
        {rang && <span className="annot w-6 shrink-0">{rang}</span>}
        <span className="h-3.5 w-[3px] shrink-0 bg-rule" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] leading-snug">{nom}</span>
          <span className="annot block truncate">{sens ?? 'Hors du catalogue'}</span>
        </span>
        <span className="font-jp shrink-0 text-[13px]">{kanji}</span>
      </div>
    </li>
  )
}

function Encart({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <div className="annot mb-2 border-b border-ink pb-2">{title}</div>
      <ul className="space-y-1.5">
        {items.map((x) => (
          <li key={x} className="flex gap-2.5 text-[13px] leading-relaxed text-soft">
            <span className="mt-[7px] h-px w-2.5 shrink-0 bg-rule" aria-hidden />
            <span className="min-w-0">{x}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Criteres({ uv }: { uv: Uv }) {
  return (
    <div className="mt-10 grid gap-8 border-t border-ink pt-8 sm:grid-cols-2">
      <Encart title="Règlement" items={uv.regles} />
      <Encart title="Ce que le jury regarde" items={uv.criteres} />
    </div>
  )
}

/* --------------------------------------------------------------------- UV1 */

function PlancheKata({ kata, dan, dex }: { kata: Kata; dan: Dan; dex: Judodex }) {
  const partiel = kata.id === 'nage-no-kata' && !!dan.kata.seriesNageNoKata
  const [complet, setComplet] = useState(false)
  const series = complet ? kata.series : seriesFor(kata, dan)
  const total = series.reduce((n, s) => n + s.slugs.length, 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold">
            {kata.name} <span className="font-jp ml-1.5 text-faint">{kata.jp}</span>
          </h2>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-soft">{kata.resume}</p>
        </div>
        {partiel && (
          <div className="flex shrink-0 border border-edge">
            <button
              onClick={() => setComplet(false)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition ${!complet ? 'bg-signal text-field' : 'text-soft hover:text-ink'}`}
            >
              {dan.kata.seriesNageNoKata} séries
            </button>
            <button
              onClick={() => setComplet(true)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.1em] transition ${complet ? 'bg-signal text-field' : 'text-soft hover:text-ink'}`}
            >
              Kata complet
            </button>
          </div>
        )}
      </div>

      {series.length > 0 && (
        <>
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {series.map((s) => (
              <div key={s.num} className="min-w-0">
                <div className="mb-1 flex items-center gap-2.5 border-b border-ink pb-2">
                  <span className="annot shrink-0 border border-ink px-1.5 py-0.5 leading-none">{s.num}</span>
                  <span className="annot min-w-0 truncate">{s.label}</span>
                  <span className="font-jp ml-auto shrink-0 text-[12px] text-faint">{s.jp}</span>
                </div>
                <ul>
                  {s.slugs.map((slug, i) => {
                    const t = dex.bySlug.get(slug)
                    const rang = String(i + 1)
                    if (t) return <Ligne key={slug} t={t} rang={rang} dex={dex} />
                    const hors = s.horsCatalogue?.[slug]
                    return hors ? <LigneSansFiche key={slug} label={hors} rang={rang} /> : null
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="annot mt-6 text-faint">
            {total} techniques · {series.length} séries
          </p>
        </>
      )}

      {kata.sansFiches && (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {kata.sansFiches.map((s) => (
            <div key={s.label} className="min-w-0 border-t border-ink pt-3">
              <div className="annot">{s.label}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-soft">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-rule pt-6">
        <Encart title="Déroulement" items={kata.reperes} />
      </div>
    </div>
  )
}

function PanneauKata({ dan, dex, uv }: { dan: Dan; dex: Judodex; uv: Uv }) {
  const katas = dan.kata.katas.map(kataOf)
  const [actif, setActif] = useState<Kata['id']>(katas[0].id)
  const kata = kataOf(actif)

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Encart title="Dominante compétition" items={[dan.kata.competition]} />
        <Encart title="Dominante technique" items={[dan.kata.technique]} />
      </div>

      {katas.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {katas.map((k) => (
            <button
              key={k.id}
              onClick={() => setActif(k.id)}
              aria-pressed={k.id === actif}
              className={`border px-3.5 py-2.5 text-[12px] transition ${
                k.id === actif ? 'border-signal bg-signal text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'
              }`}
            >
              {k.name}
              <span className="font-jp ml-1.5 opacity-70">{k.jp}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PlancheKata key={kata.id} kata={kata} dan={dan} dex={dex} />
      </div>

      <Criteres uv={uv} />
    </div>
  )
}

/* --------------------------------------------------------------------- UV2 */

function PanneauTechnique({ dan, dex, uv }: { dan: Dan; dex: Judodex; uv: Uv }) {
  const [tirage, setTirage] = useState<Tirage | null>(null)
  const prog = PROGRAMMES[dan.id]
  const total = programmeTotal(dan.id)

  const rendre = (items: { slug: string; groupe: Groupe }[]) => (
    <ul>
      {items.map((it, i) => {
        const t = dex.bySlug.get(it.slug)
        return t ? <Ligne key={it.slug} t={t} rang={String(i + 1)} dex={dex} note={groupeMeta(it.groupe).label} /> : null
      })}
    </ul>
  )

  return (
    <div>
      <div className="border border-ink bg-plate p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold">Tirage du jury</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-soft">{dan.tirage.note}</p>
            <p className="annot mt-2 max-w-md leading-relaxed text-faint">
              L'épreuve compte {dan.tirage.total} techniques. Les {dan.tirage.nage + dan.tirage.ne} tirées ici sont celles que
              le jury impose ; les {dan.tirage.total - dan.tirage.nage - dan.tirage.ne} défenses restent au choix du
              candidat, dans la {dan.defense.toLowerCase()}.
            </p>
          </div>
          <button
            onClick={() => setTirage(tirerUv2(dan.id))}
            className="shrink-0 bg-signal px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-field transition hover:brightness-110"
          >
            {tirage ? 'Retirer' : `Tirer les ${dan.tirage.nage + dan.tirage.ne} techniques`}
          </button>
        </div>

        {tirage && (
          <fm.div
            key={[...tirage.nage, ...tirage.ne].map((x) => x.slug).join()}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6 grid gap-x-10 gap-y-6 border-t border-rule pt-5 sm:grid-cols-2"
          >
            <div className="min-w-0">
              <div className="annot mb-1 border-b border-ink pb-2">Debout · {dan.tirage.nage} techniques</div>
              {rendre(tirage.nage)}
            </div>
            <div className="min-w-0">
              <div className="annot mb-1 border-b border-ink pb-2">Au sol · {dan.tirage.ne} techniques</div>
              {rendre(tirage.ne)}
            </div>
          </fm.div>
        )}
      </div>

      <div className="mt-12">
        <SectionHead title={`Programme technique du ${dan.name}`} jp={dan.jp} aside={`${total} techniques`} />
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {[...GROUPES_NAGE, ...GROUPES_NE].map((id) => {
            const g = groupeMeta(id)
            const slugs = prog[id]
            if (slugs.length === 0) return null
            return (
              <div key={id} className="min-w-0">
                <div className="mb-1 flex items-center gap-2.5 border-b border-ink pb-2">
                  <span className="annot min-w-0 truncate">{g.label}</span>
                  <span className="font-jp shrink-0 text-[12px] text-faint">{g.jp}</span>
                  <span className="annot ml-auto shrink-0 text-faint">{slugs.length}</span>
                </div>
                <ul>
                  {slugs.map((slug) => {
                    const t = dex.bySlug.get(slug)
                    return t ? <Ligne key={slug} t={t} dex={dex} /> : null
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-8 border-l-[5px] border-signal bg-plate p-4">
          <div className="annot mb-1.5">
            Défense <span className="font-jp ml-1 text-faint">防御</span>
          </div>
          <p className="text-[13px] leading-relaxed text-soft">
            Deux techniques de défense au choix du candidat, prises dans la {dan.defense.toLowerCase()} des vingt attaques
            imposées. Les deux attaques et les deux défenses doivent être différentes. Le référentiel ne publie ces vingt
            attaques qu'en planche dessinée : leur liste n'est pas reprise ici, faute de source en toutes lettres.
          </p>
        </div>
      </div>

      <Criteres uv={uv} />
    </div>
  )
}

/* --------------------------------------------------------------- UV3 / UV4 */

function PanneauSimple({ uv }: { uv: Uv }) {
  return (
    <div>
      <h2 className="text-[15px] font-semibold">
        {uv.label} <span className="font-jp ml-1.5 text-faint">{uv.jp}</span>
      </h2>
      <p className="mt-3 max-w-xl text-[14px] leading-[1.7] text-soft">{uv.resume}</p>
      <Criteres uv={uv} />
    </div>
  )
}

/* ------------------------------------------------------------------ écran */

export function DanScreen({ dan: danId, dex }: Props) {
  const dan = danOf(danId)
  const [actif, setActif] = useState<UvCode>('UV1')
  const uv = dan.uvs.find((u) => u.code === actif)!

  /** Part du programme du grade déjà marquée acquise, kata compris. */
  const avancee = useMemo(() => {
    const slugs = new Set(programmeSlugs(danId))
    for (const k of dan.kata.katas) for (const s of kataOf(k).series.flatMap((x) => x.slugs)) slugs.add(s)
    let acquises = 0
    for (const s of slugs) if (dex.bySlug.has(s) && dex.getProgress(s).mastery === 'mastered') acquises++
    return { acquises, total: [...slugs].filter((s) => dex.bySlug.has(s)).length }
  }, [danId, dan, dex])

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8">
      <div className="pt-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="annot border border-ink px-1.5 py-1 leading-none">Passage de grade</span>
          <Link
            to={{ name: 'train' }}
            className="annot -mr-2 ml-auto flex h-8 items-center px-2 text-faint transition-colors hover:text-signal"
          >
            ← Dojo
          </Link>
        </div>
        <h1 className="display mt-5">Ceinture noire</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="dimension w-20" />
          <span className="font-jp text-base tracking-[0.3em] text-faint">黒帯</span>
        </div>
        <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-soft">
          Chaque dan se compose de quatre unités de valeur, passées séparément et acquises définitivement. Les deux premières
          se préparent sur le tapis : le kata et la démonstration technique. Les listes qui suivent sont celles de la
          fédération.
        </p>
      </div>

      {/* Grade préparé. Chaque grade a son adresse. */}
      <div className="mt-10 flex flex-wrap gap-2">
        {DANS.map((d) => (
          <Link
            key={d.id}
            to={{ name: 'dan', dan: d.id }}
            aria-current={d.id === danId ? 'page' : undefined}
            className={`border px-4 py-3 text-[13px] font-semibold transition ${
              d.id === danId ? 'border-signal bg-signal text-field' : 'border-edge bg-plate text-soft hover:border-ink hover:text-ink'
            }`}
          >
            {d.name}
            <span className="font-jp ml-2 text-[12px] opacity-70">{d.jp}</span>
          </Link>
        ))}
      </div>

      <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-soft">{dan.resume}</p>
      <div className="annot mt-3 text-faint">
        {avancee.acquises} des {avancee.total} techniques de ce grade sont marquées acquises dans votre carnet.
      </div>

      {/* Unités de valeur */}
      <div className="mt-8 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-4">
        {dan.uvs.map((u) => {
          const on = u.code === actif
          return (
            <button
              key={u.code}
              onClick={() => setActif(u.code)}
              aria-pressed={on}
              className={`min-w-0 border-b border-r border-rule px-3 py-3.5 text-left transition ${
                on ? 'bg-signal text-field' : 'bg-plate text-soft hover:text-ink'
              }`}
            >
              <span className="annot block">{u.code}</span>
              <span className="mt-1 block truncate text-[13px] font-semibold">{u.label}</span>
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-soft">{uv.resume}</p>

      <fm.div
        key={`${danId}-${actif}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-10"
      >
        {actif === 'UV1' && <PanneauKata dan={dan} dex={dex} uv={uv} />}
        {actif === 'UV2' && <PanneauTechnique dan={dan} dex={dex} uv={uv} />}
        {(actif === 'UV3' || actif === 'UV4') && <PanneauSimple uv={uv} />}
      </fm.div>

      <p className="annot mt-14 border-t border-rule pt-5 text-faint">Programme officiel · {DAN_SOURCE}</p>
    </div>
  )
}
