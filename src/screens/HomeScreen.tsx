import { useState } from 'react'
import { m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { GROUPS, GROUP_META, familyVars, kanjiSize } from '../lib/families'
import { PROGRESSION_SOURCE, situationsFor } from '../lib/belts'
import { StudyList } from '../components/StudyList'
import { SectionHead } from '../components/SectionHead'
import { Seal } from '../components/Seal'
import { Link } from '../components/Link'
import { BeltMark } from '../components/BeltMark'
import type { Mastery, Technique } from '../types/judodex'
import { Surtitre } from '../components/Surtitre'
import { derniereSauvegarde, dite, rappelNecessaire, rappelReporte, reporterRappel } from '../lib/sauvegarde'

/** Une technique en cours : son nom japonais, son nom, sa traduction. */
function Row({ t, dex }: { t: Technique; dex: Judodex }) {
  const p = dex.getProgress(t.slug)
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="group flex min-w-0 items-center gap-4 border-b border-rule py-3"
    >
      <span
        lang="ja"
        className="font-jp w-[4.4rem] shrink-0 whitespace-nowrap leading-none text-(--fam)"
        style={{ fontSize: kanjiSize(t.kanji, 'row') }}
      >
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-tight underline-offset-4 group-hover:underline">{t.name}</span>
        <span className="mt-0.5 block truncate text-[13px] text-faint">{t.translation}</span>
      </span>
      {p.mastery === 'mastered' && <Seal size={20} />}
      <BeltMark belt={dex.beltOfTechnique(t.slug)} />
    </Link>
  )
}

const ETATS: { m: Mastery; label: string }[] = [
  { m: 'mastered', label: 'Acquise' },
  { m: 'learning', label: 'En cours' },
  { m: 'unknown', label: 'À découvrir' },
]

/** État d'une technique en un carré. À découvrir : vide mais tracé, jamais
 *  un carré fantôme. */
function Etat({ m }: { m: Mastery }) {
  return (
    <span
      aria-label={ETATS.find((e) => e.m === m)?.label}
      role="img"
      className="block size-2 shrink-0"
      style={{
        background: m === 'mastered' ? 'var(--c-ink)' : m === 'learning' ? 'var(--c-signal)' : 'transparent',
        boxShadow: m === 'unknown' ? 'inset 0 0 0 1px var(--c-faint)' : undefined,
      }}
    />
  )
}

/** Une colonne de la planche : les techniques imposées, avec leur état. */
function PlateList({ title, list, dex }: { title: string; list: Technique[]; dex: Judodex }) {
  if (list.length === 0) return null
  const done = list.filter((t) => dex.getProgress(t.slug).mastery === 'mastered').length
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-edge pb-2">
        <h4 className="text-[15px] font-semibold">{title}</h4>
        <span className="text-[13px] tabular-nums text-faint">
          {done} sur {list.length}
        </span>
      </div>
      <ul>
        {list.map((t) => {
          const m = dex.getProgress(t.slug).mastery
          return (
            <li key={t.slug} className="border-b border-rule/60 last:border-0">
              <Link
                to={{ name: 'technique', slug: t.slug }}
                style={familyVars(t.family)}
                className="group flex min-w-0 items-start gap-3.5 py-2.5"
              >
                <span className="mt-[7px]">
                  <Etat m={m} />
                </span>
                <span lang="ja" className="font-jp mt-[3px] w-[5rem] shrink-0 whitespace-nowrap text-[16px] leading-none text-(--fam)">{t.kanji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium leading-snug underline-offset-4 group-hover:underline">{t.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-faint">{t.translation}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Une technique par jour, tirée du programme préparé et pourvue d'une
 * démonstration : de quoi commencer sans avoir rien à choisir. Le tirage suit
 * la date, il reste le même toute la journée.
 */
function TechniqueDuJour({ dex }: { dex: Judodex }) {
  const filmees = (dex.currentGroup.techniques.length ? dex.currentGroup.techniques : dex.techniques).filter((t) => t.youtubeId || t.ffjudoId)
  if (filmees.length === 0) return null
  const t = filmees[Math.floor(Date.now() / 86_400_000) % filmees.length]
  const video = t.youtubeId ?? t.ffjudoId
  return (
    <Link to={{ name: 'technique', slug: t.slug }} style={familyVars(t.family)} className="group block min-w-0">
      <p className="text-[13px] text-faint">Technique du jour</p>
      <span className="relative mt-2 block aspect-video overflow-hidden bg-plate">
        <img
          src={`/miniatures/${video}.webp`}
          alt=""
          width={480}
          height={270}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {/* Le dégradé porte le nom japonais et couvre l'incrustation du titre
            que certaines démonstrations portent en bas à gauche. */}
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-field via-field/40 to-transparent" />
        <span lang="ja" className="font-jp absolute bottom-3 left-4 whitespace-nowrap text-[2.2rem] font-bold leading-none text-(--fam)">
          {t.kanji}
        </span>
      </span>
      <span className="font-jp mt-3 block text-[1.4rem] font-bold leading-tight underline-offset-4 group-hover:underline">{t.name}</span>
      <span className="mt-0.5 block text-[14px] text-soft">{t.translation}</span>
    </Link>
  )
}

/** Le carnet ne vit que dans ce navigateur : on rappelle d'en garder une copie. */
function RappelSauvegarde({ suivies }: { suivies: number }) {
  // Lu au montage seulement : les pages sont écrites d'avance sans localStorage,
  // le rappel ne figure donc jamais dans le HTML servi.
  const [infos] = useState(() => ({ derniere: derniereSauvegarde(), reporte: rappelReporte() }))
  const [masque, setMasque] = useState(false)
  if (masque || !rappelNecessaire({ suivies, ...infos })) return null
  return (
    <aside aria-label="Sauvegarde du carnet" className="mb-2 flex flex-col gap-3 border border-rule px-4 py-3 text-[14px] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-soft">
        Ton carnet ne vit que dans ce navigateur. Dernière sauvegarde : <span className="text-ink">{dite(infos.derniere)}</span>.
      </p>
      <div className="flex shrink-0 gap-4">
        <Link to={{ name: 'reglages' }} className="font-semibold underline underline-offset-4 hover:text-signal">
          Sauvegarder
        </Link>
        <button
          onClick={() => {
            reporterRappel()
            setMasque(true)
          }}
          className="text-faint underline underline-offset-4 hover:text-ink"
        >
          Plus tard
        </button>
      </div>
    </aside>
  )
}

export function HomeScreen({ dex }: { dex: Judodex }) {
  const { stats } = dex
  const fresh = stats.mastered === 0 && stats.learning === 0

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-7">
      {!fresh && (
        <div className="pt-6">
          <RappelSauvegarde suivies={stats.mastered + stats.learning} />
        </div>
      )}
      {/* ── Ouverture ──
          Le relevé n'apparaît qu'une fois qu'il y a quelque chose à relever :
          à zéro, une jauge vide ne dit rien d'autre que « rien ». */}
      <section className="grid min-w-0 gap-10 pb-8 pt-10 sm:pt-20 lg:grid-cols-[auto_minmax(0,1fr)_330px] lg:items-end lg:gap-x-14">
        {/* 柔道, monumental et en creux, écrit de haut en bas comme il se lit :
            la voie de la souplesse, en tête du carnet qui l'enseigne. */}
        <p
          lang="ja"
          aria-hidden
          className="font-jp kanji-creux trace hidden select-none self-stretch whitespace-nowrap text-[8.5rem] font-extrabold leading-[0.95] [writing-mode:vertical-rl] lg:block"
        >
          柔道
        </p>

        <div className="min-w-0">
          <div className="monte" style={{ '--d': '0ms' } as React.CSSProperties}>
            <Surtitre>Le carnet du judoka</Surtitre>
          </div>
          <h1 className="display monte mt-5" style={{ '--d': '80ms' } as React.CSSProperties}>
            {fresh ? 'Apprendre le judo, geste par geste.' : 'Reprenons le travail.'}
          </h1>

          <p className="monte mt-6 max-w-[56ch] text-[17px] leading-[1.65] text-soft" style={{ '--d': '160ms' } as React.CSSProperties}>
            {fresh
              ? "Chaque technique est décomposée en kuzushi, tsukuri et kake, démonstration à l'appui. Le carnet retient ce que tu travailles et te rappelle au bon moment ce qu'il faut revoir."
              : `${stats.learning} technique${stats.learning > 1 ? 's sont' : ' est'} en cours de travail. Le dojo sait lesquelles doivent revenir aujourd'hui.`}
          </p>

          <div className="monte mt-9 flex flex-col gap-2 sm:flex-row sm:flex-wrap" style={{ '--d': '240ms' } as React.CSSProperties}>
            {stats.due > 0 ? (
              <Link to={{ name: 'train' }} className="tap group inline-flex items-center justify-center gap-2 bg-signal px-6 py-3.5 text-[15px] font-semibold text-field transition hover:brightness-110">
                Réviser {stats.due} technique{stats.due > 1 ? 's' : ''}
                <span aria-hidden className="vector-push">→</span>
              </Link>
            ) : (
              <Link to={{ name: 'browse' }} className="tap group inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-[15px] font-semibold text-field transition hover:bg-soft">
                Ouvrir le catalogue
                <span aria-hidden className="vector-push">→</span>
              </Link>
            )}
            <Link to={{ name: 'train' }} className="tap inline-flex items-center justify-center border border-edge bg-field/40 px-6 py-3.5 text-[15px] font-medium transition hover:border-ink">
              Séance au dojo
            </Link>
          </div>
        </div>

        {fresh ? (
          <div className="monte min-w-0" style={{ '--d': '320ms' } as React.CSSProperties}>
            <TechniqueDuJour dex={dex} />
          </div>
        ) : (
          <div className="monte min-w-0" style={{ '--d': '320ms' } as React.CSSProperties}>
            <p className="font-jp text-[2.6rem] font-bold leading-none">
              {stats.mastered}
              <span className="text-[1.4rem] text-faint"> / {stats.total}</span>
            </p>
            <p className="mt-2 text-[14px] text-soft">techniques acquises</p>
            <div className="mt-3 h-[5px] w-full bg-rule" role="img" aria-label={`${stats.mastered} techniques acquises sur ${stats.total}`}>
              <div className="h-full bg-signal" style={{ width: `${stats.total ? (stats.mastered / stats.total) * 100 : 0}%` }} />
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-4 text-[13px]">
              {[
                { n: stats.learning, l: 'en cours' },
                { n: stats.tokui, l: 'préférées' },
                { n: stats.due, l: 'à revoir' },
              ].map((k) => (
                <div key={k.l} className="min-w-0">
                  <dt className="text-faint">{k.l}</dt>
                  <dd className="mt-0.5 text-[20px] font-semibold tabular-nums">{k.n}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* ── En cours ──
          Avant la planche : c'est ce qu'on vient reprendre en ouvrant le carnet. */}
      {dex.inProgress.length > 0 && (
        <section className="pt-14">
          <SectionHead title="En cours de travail" aside={`${dex.inProgress.length} fiches`} />
          <div className="grid gap-x-10 md:grid-cols-2">
            {dex.inProgress.slice(0, 8).map((t) => (
              <Row key={t.slug} t={t} dex={dex} />
            ))}
          </div>
        </section>
      )}

      {/* ── Passage de grade ── */}
      <section className="pb-14 pt-14">
        <SectionHead
          title="Passage de grade"
          aside={dex.currentGroup.techniques.length ? `${dex.currentGroup.mastered} sur ${dex.currentGroup.techniques.length} acquises` : undefined}
        />

        {/*
          Choix de la planche préparée. Le libellé n'est pas une pastille de
          plus : mêlé aux ceintures dans la même ligne qui se replie, il
          poussait la ceinture choisie à côté de lui et laissait les autres
          tomber en lignes inégales. Il monte donc au-dessus sur mobile, et
          passe en colonne dès qu'il y a la place — comme au dojo.
        */}
        <div className="mb-6 grid gap-2 sm:grid-cols-[130px_1fr] sm:items-start sm:gap-4">
          <p id="choix-planche" className="annot text-faint sm:pt-2">
            Je prépare
          </p>
          {/* Deux colonnes égales sur mobile : six ceintures y tiennent en
              trois rangées franches, sans qu'aucune reste seule en bas. */}
          <div
            role="group"
            aria-labelledby="choix-planche"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
          >
            {dex.beltGroups.map((g) => {
            const on = g.belt.id === dex.currentBelt
              return (
                <button
                  key={g.belt.id}
                  onClick={() => dex.setCurrentBelt(g.belt.id)}
                  aria-pressed={on}
                  title={g.belt.kyu}
                  className={`tap annot flex h-8 items-center gap-2 border px-2.5 transition ${on ? 'border-ink bg-ink text-field' : 'border-edge text-soft hover:border-ink hover:text-ink'}`}
                >
                  <BeltMark belt={g.belt.id} width={20} height={7} />
                  {g.belt.name}
                  {g.techniques.length > 0 && (
                    <span className="opacity-75">
                      {g.mastered}/{g.techniques.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* La planche */}
        <div className="bg-plate p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <BeltMark belt={dex.currentGroup.belt.id} width={54} height={12} />
                <h3 className="font-jp text-[1.5rem] font-bold leading-tight">{dex.currentGroup.belt.plate}</h3>
                <span className="annot text-faint">{dex.currentGroup.belt.kyu}</span>
              </div>
              <p className="annot mt-2 text-faint">{dex.currentGroup.belt.phase}</p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-soft">{dex.currentGroup.belt.focus}</p>
              <p className="annot mt-3 text-faint">
                Valeurs · <span className="text-ink">{dex.currentGroup.belt.values}</span>
              </p>
            </div>
            {dex.currentGroup.techniques.length > 0 && (
              <div className="sm:text-right">
                <div className="font-jp text-[2.4rem] font-bold leading-none">{Math.round(dex.currentGroup.ratio * 100)} %</div>
                <div className="annot mt-1 text-faint">du programme</div>
              </div>
            )}
          </div>

          {dex.currentGroup.techniques.length > 0 && (
            <>
              {/* Part accordée à chaque domaine, telle que la planche l'imprime.
                  Ce n'est pas la proportion des techniques imposées. */}
              <div className="mt-6">
                <p className="annot mb-2 text-faint">Part du programme</p>
                <div className="flex h-[6px] w-full">
                  <span className="bg-soft" style={{ width: `${dex.currentGroup.belt.nagePart}%` }} />
                  <span className="bg-rule" style={{ width: `${100 - dex.currentGroup.belt.nagePart}%` }} />
                </div>
                <div className="annot mt-1.5 flex justify-between text-faint">
                  <span>{dex.currentGroup.belt.nagePart}% debout · nage-waza</span>
                  <span>{100 - dex.currentGroup.belt.nagePart}% sol · katame-waza</span>
                </div>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-faint">
                  Part accordée à chaque domaine par la planche. Elle ne suit pas le nombre de techniques imposées : au sol, le programme
                  tient surtout dans les situations d'étude, listées plus bas.
                </p>
              </div>

              {/* Les carrés d'état ne se devinent pas : ils se lisent ici. */}
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-faint" aria-label="Légende">
                {ETATS.map((e) => (
                  <li key={e.label} className="flex items-center gap-2">
                    <Etat m={e.m} />
                    {e.label}
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                <PlateList title="Debout · nage-waza" list={dex.currentGroup.nage} dex={dex} />
                <PlateList title="Au sol · katame-waza" list={dex.currentGroup.katame} dex={dex} />
              </div>

              {situationsFor(dex.currentGroup.belt.id).length > 0 && (
                <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                  <StudyList
                    title="Situations d'étude debout"
                    items={situationsFor(dex.currentGroup.belt.id).filter((x) => x.domain === 'nage')}
                  />
                  <StudyList
                    title="Situations d'étude au sol"
                    items={situationsFor(dex.currentGroup.belt.id).filter((x) => x.domain === 'katame')}
                  />
                </div>
              )}
            </>
          )}

          {/* Premier dan : la planche n'impose aucune technique nouvelle */}
          {dex.currentGroup.belt.requirements && (
            <div className="mt-6 grid gap-px bg-rule sm:grid-cols-3">
              {dex.currentGroup.belt.requirements.map((r) => (
                <div key={r.title} className="bg-field p-4">
                  <h4 className="text-[15px] font-semibold">{r.title}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-soft">{r.body}</p>
                </div>
              ))}
              <div className="bg-field p-4 sm:col-span-3">
                <Link to={{ name: 'profil' }} className="annot text-signal transition-colors hover:underline">
                  Construire ton système dans Mon judo →
                </Link>
              </div>
            </div>
          )}

          {dex.currentGroup.belt.exam && (
            <div className="mt-6 border border-edge">
              <div className="flex flex-wrap items-baseline gap-3 border-b border-edge px-3 py-2.5">
                <span className="annot">{dex.currentGroup.belt.exam.name}</span>
                <span className="text-[13px] text-faint">{dex.currentGroup.belt.exam.note}</span>
              </div>
              <div className="grid gap-px bg-rule sm:grid-cols-4">
                {dex.currentGroup.belt.exam.units.map((u) => (
                  <div key={u.code} className="bg-field px-3 py-4">
                    <div className="text-[13px] font-semibold text-signal">{u.code}</div>
                    <div className="mt-1.5 text-[14px] font-semibold leading-tight">{u.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="annot mt-5 text-faint">{dex.currentGroup.belt.volume}</p>
        </div>

        <p className="mt-4 max-w-[80ch] text-[13px] leading-relaxed text-faint">
          Programme relevé sur les planches de la{' '}
          <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            progression française de l'enseignement du judo
          </a>{' '}
          publiée par la fédération. Les {dex.offProgramme.length} autres fiches du catalogue appartiennent au répertoire sans figurer sur
          une planche de passage de grade.
        </p>
      </section>

      {/* ── Les cinq familles ── */}
      <section className="py-14">
        <SectionHead title="Familles" aside={`${stats.mastered} sur ${stats.total} acquises`} />
        {/* Cinq familles : une rangée sur grand écran, et la dernière case
            prend toute la largeur sur deux colonnes plutôt que d'en laisser
            une vide. */}
        <div className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-5">
          {GROUPS.map((g, i) => {
            const s = stats.byGroup[g]
            const meta = GROUP_META[g]
            const pct = s.total ? (s.mastered / s.total) * 100 : 0
            return (
              <Link
                key={g}
                to={{ name: 'browse' }}
                hash={g}
                style={{ '--fam': meta.color, '--fam-hi': meta.colorHi } as React.CSSProperties}
                className={`group relative flex flex-col border-b border-r border-rule p-5 transition-colors hover:bg-plate ${i === GROUPS.length - 1 && GROUPS.length % 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <span
                    lang="ja"
                    className="font-jp whitespace-nowrap leading-none text-(--fam)"
                    style={{ fontSize: kanjiSize(meta.kanji, 'family') }}
                  >
                    {meta.kanji}
                  </span>
                  <span className="text-[13px] tabular-nums text-faint">
                    {s.mastered} sur {s.total}
                  </span>
                </div>
                <h3 className="font-jp mt-4 text-[1.25rem] font-bold leading-tight underline-offset-4 group-hover:underline">{meta.name}</h3>
                <p className="mt-1 text-[13px] leading-snug text-faint">{meta.principle}</p>
                {/* La jauge se pose au pied de la case, quelle que soit la
                    longueur du principe, pour que les cinq restent alignées. */}
                <div className="mt-auto pt-4">
                  <div className="h-[3px] bg-rule">
                    <fm.span className="block h-full bg-(--fam)" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Tokui-waza ── */}
      {dex.tokuiList.length > 0 && (
        <section className="pb-14">
          <SectionHead
            title="Tokui-waza"
            aside={<Link to={{ name: 'profil' }} className="transition-colors hover:text-signal">Construire mon judo →</Link>}
          />
          <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-soft">
            Ton tokui-waza, c'est la technique dont tu fais ton arme : celle que tu cherches, que tu places, et
            autour de laquelle le reste s'organise. Marque-la sur sa fiche.
          </p>
          <div className="flex flex-wrap gap-2">
            {dex.tokuiList.map((t) => (
              <Link
                key={t.slug}
                to={{ name: 'technique', slug: t.slug }}
                style={familyVars(t.family)}
                className="flex items-center gap-2.5 border border-edge px-3 py-2 transition hover:border-ink"
              >
                <span lang="ja" className="font-jp text-lg leading-none text-(--fam)">{t.kanji}</span>
                <span className="text-[14px] font-medium">{t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
