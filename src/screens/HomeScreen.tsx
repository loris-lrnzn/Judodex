import { m as fm } from 'framer-motion'
import type { Judodex } from '../hooks/useJudodex'
import { GROUPS, GROUP_META, familyVars, kanjiSize } from '../lib/families'
import { PROGRESSION_SOURCE, situationsFor } from '../lib/belts'
import { StudyList } from '../components/StudyList'
import { Protractor } from '../components/Protractor'
import { SectionHead } from '../components/SectionHead'
import { Seal } from '../components/Seal'
import { Link } from '../components/Link'
import { BeltMark } from '../components/BeltMark'
import type { Technique } from '../types/judodex'

/** Entrée de relevé : repère, spécimen, désignation. */
function Row({ t, dex }: { t: Technique; dex: Judodex }) {
  const p = dex.getProgress(t.slug)
  const n = dex.numberOf.get(t.slug) ?? 0
  return (
    <Link
      to={{ name: 'technique', slug: t.slug }}
      style={familyVars(t.family)}
      className="group -mx-3 flex min-w-0 items-center gap-3 border-b border-rule px-3 py-2.5 transition-colors hover:bg-ink hover:text-field sm:gap-4"
    >
      <span className="annot hidden w-8 shrink-0 text-faint transition-colors group-hover:text-field/55 sm:block">{String(n).padStart(3, '0')}</span>
      <span
        className="font-jp w-[3.4rem] shrink-0 whitespace-nowrap text-center leading-none text-(--fam) transition-colors group-hover:text-(--fam-hi) sm:w-[4.6rem]"
        style={{ fontSize: kanjiSize(t.kanji, 'row') }}
      >
        {t.kanji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold leading-tight">{t.name}</span>
        <span className="block truncate text-[11px] text-faint transition-colors group-hover:text-field/55">{t.translation}</span>
      </span>
      {p.mastery === 'mastered' && <Seal size={20} />}
      <BeltMark belt={dex.beltOfTechnique(t.slug)} />
    </Link>
  )
}

/** Une colonne de la planche : les techniques imposées, avec leur état. */
function PlateList({ title, jp, list, dex }: { title: string; jp: string; list: Technique[]; dex: Judodex }) {
  if (list.length === 0) return null
  const done = list.filter((t) => dex.getProgress(t.slug).mastery === 'mastered').length
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-2.5 border-b border-ink pb-2">
        <span className="annot">{title}</span>
        <span className="font-jp text-[12px] text-faint">{jp}</span>
        <span className="annot ml-auto text-faint">
          {done}/{list.length}
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
                className="group flex min-w-0 items-start gap-3.5 py-2.5 transition-colors hover:text-signal"
              >
                {/* À découvrir : un carré vide mais tracé, jamais un carré fantôme. */}
                <span
                  className="mt-[7px] size-2 shrink-0"
                  style={{
                    background: m === 'mastered' ? 'var(--c-ink)' : m === 'learning' ? 'var(--c-signal)' : 'transparent',
                    boxShadow: m === 'unknown' ? 'inset 0 0 0 1px var(--c-faint)' : undefined,
                  }}
                />
                <span className="font-jp mt-[3px] w-[5rem] shrink-0 whitespace-nowrap text-[16px] leading-none text-(--fam)">{t.kanji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium leading-snug">{t.name}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-faint">{t.translation}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HomeScreen({ dex }: { dex: Judodex }) {
  const { stats } = dex
  const fresh = stats.mastered === 0 && stats.learning === 0

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-7">
      {/* ── Planche d'ouverture ── */}
      <section className="grid-paper plate mt-8 grid min-w-0 gap-8 p-5 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="annot border border-ink px-1.5 py-1 leading-none">Carnet de pratique</span>
          </div>

          <h1 className="display mt-5">
            {fresh ? (
              <>
                Apprendre
                <br />
                le judo,
                <br />
                geste par geste.
              </>
            ) : (
              <>
                Reprenons
                <br />
                le travail.
              </>
            )}
          </h1>

          {/* Cote sous le titre */}
          <div className="mt-5 flex items-center gap-3">
            <span className="dimension w-28" />
            <span className="annot text-faint">柔道技図鑑 · JUDODEX</span>
          </div>

          <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-soft">
            {fresh
              ? "Chaque technique est décomposée en kuzushi, tsukuri et kake, démonstration à l'appui. Le carnet retient ce que vous travaillez et vous rappelle au bon moment ce qu'il faut revoir."
              : `${stats.learning} technique${stats.learning > 1 ? 's sont' : ' est'} en cours de travail. Le dojo sait lesquelles doivent revenir aujourd'hui.`}
          </p>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {stats.due > 0 ? (
              <Link to={{ name: 'train' }} className="tap annot inline-flex items-center justify-center bg-signal px-5 py-3 text-center text-field transition hover:brightness-110">
                Réviser {stats.due} technique{stats.due > 1 ? 's' : ''} →
              </Link>
            ) : (
              <Link to={{ name: 'browse' }} className="tap annot inline-flex items-center justify-center bg-ink px-5 py-3 text-center text-field transition hover:bg-blue">
                Ouvrir le catalogue →
              </Link>
            )}
            <Link to={{ name: 'train' }} className="tap annot inline-flex items-center justify-center border border-ink px-5 py-3 text-center transition hover:bg-ink hover:text-field">
              Séance au dojo
            </Link>
          </div>
        </div>

        {/* Rapporteur */}
        <fm.div initial={{ opacity: 0, rotate: -8 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-[260px] justify-self-center">
          <Protractor value={stats.mastered} total={stats.total} />
          <div className="mt-2 grid grid-cols-3 border border-rule">
            {[
              { n: stats.learning, l: 'en cours' },
              { n: stats.tokui, l: 'préférées' },
              { n: stats.due, l: 'à revoir' },
            ].map((k, i) => (
              <div key={k.l} className={`min-w-0 px-2 py-2 text-center ${i < 2 ? 'border-r border-rule' : ''}`}>
                <div className="font-mono text-lg font-semibold leading-none">{k.n}</div>
                <div className="annot mt-1 text-faint">{k.l}</div>
              </div>
            ))}
          </div>
        </fm.div>
      </section>

      {/* ── Passage de grade ── */}
      <section className="pb-14 pt-14">
        <SectionHead
          title="Passage de grade"
          jp="昇段"
          aside={dex.currentGroup.techniques.length ? `${dex.currentGroup.mastered}/${dex.currentGroup.techniques.length}` : undefined}
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
                    <span className="opacity-60">
                      {g.mastered}/{g.techniques.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* La planche */}
        <div className="plate grid-paper p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <BeltMark belt={dex.currentGroup.belt.id} width={54} height={12} />
                <h3 className="text-[19px] font-semibold tracking-[-0.01em]">{dex.currentGroup.belt.plate}</h3>
                <span className="annot text-faint">{dex.currentGroup.belt.kyu}</span>
              </div>
              <p className="annot mt-2 text-faint">{dex.currentGroup.belt.phase}</p>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-soft">{dex.currentGroup.belt.focus}</p>
              <p className="annot mt-3 text-faint">
                Valeurs · <span className="text-ink">{dex.currentGroup.belt.values}</span>
              </p>
            </div>
            {dex.currentGroup.techniques.length > 0 && (
              <div className="text-right">
                <div className="font-mono text-3xl font-semibold leading-none">{Math.round(dex.currentGroup.ratio * 100)}%</div>
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
                  <span className="bg-ink" style={{ width: `${dex.currentGroup.belt.nagePart}%` }} />
                  <span className="bg-rule" style={{ width: `${100 - dex.currentGroup.belt.nagePart}%` }} />
                </div>
                <div className="annot mt-1.5 flex justify-between text-faint">
                  <span>{dex.currentGroup.belt.nagePart}% debout · nage-waza</span>
                  <span>{100 - dex.currentGroup.belt.nagePart}% sol · katame-waza</span>
                </div>
                <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-faint">
                  Part accordée à chaque domaine par la planche. Elle ne suit pas le nombre de techniques imposées : au sol, le programme
                  tient surtout dans les situations d'étude, listées plus bas.
                </p>
              </div>

              <div className="mt-8 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                <PlateList title="Debout · nage-waza" jp="投技" list={dex.currentGroup.nage} dex={dex} />
                <PlateList title="Au sol · katame-waza" jp="固技" list={dex.currentGroup.katame} dex={dex} />
              </div>

              {situationsFor(dex.currentGroup.belt.id).length > 0 && (
                <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                  <StudyList
                    title="Situations d'étude debout"
                    jp="立技"
                    items={situationsFor(dex.currentGroup.belt.id).filter((x) => x.domain === 'nage')}
                  />
                  <StudyList
                    title="Situations d'étude au sol"
                    jp="寝技"
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
                  <h4 className="annot">{r.title}</h4>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-soft">{r.body}</p>
                </div>
              ))}
              <div className="bg-field p-4 sm:col-span-3">
                <Link to={{ name: 'profil' }} className="annot text-signal transition-colors hover:underline">
                  Relever vos secteurs de chute →
                </Link>
              </div>
            </div>
          )}

          {dex.currentGroup.belt.exam && (
            <div className="mt-6 border border-ink">
              <div className="flex flex-wrap items-baseline gap-3 border-b border-ink bg-ink px-3 py-2 text-field">
                <span className="annot">{dex.currentGroup.belt.exam.name}</span>
                <span className="text-[11.5px] opacity-70">{dex.currentGroup.belt.exam.note}</span>
              </div>
              <div className="grid gap-px bg-rule sm:grid-cols-4">
                {dex.currentGroup.belt.exam.units.map((u) => (
                  <div key={u.code} className="bg-field px-3 py-4">
                    <div className="font-mono text-[11px] text-signal">{u.code}</div>
                    <div className="mt-1.5 text-[14px] font-semibold leading-tight">{u.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="annot mt-5 text-faint">{dex.currentGroup.belt.volume}</p>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-faint">
          Programme relevé sur les planches de la{' '}
          <a href={PROGRESSION_SOURCE} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            progression française de l'enseignement du judo
          </a>{' '}
          publiée par la fédération. Les {dex.offProgramme.length} autres fiches du catalogue appartiennent au répertoire sans figurer sur
          une planche de passage de grade.
        </p>
      </section>

      {/* ── En cours ── */}
      {dex.inProgress.length > 0 && (
        <section className="pb-14">
          <SectionHead title="En cours de travail" jp="稽古中" aside={`${dex.inProgress.length} fiches`} />
          <div className="grid gap-x-10 md:grid-cols-2">
            {dex.inProgress.slice(0, 8).map((t) => (
              <Row key={t.slug} t={t} dex={dex} />
            ))}
          </div>
        </section>
      )}

      {/* ── Les cinq familles ── */}
      <section className="py-14">
        <SectionHead title="Familles" jp="五技" aside={`${stats.mastered}/${stats.total}`} />
        <div className="grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => {
            const s = stats.byGroup[g]
            const meta = GROUP_META[g]
            const pct = s.total ? (s.mastered / s.total) * 100 : 0
            return (
              <Link
                key={g}
                to={{ name: 'browse' }}
                style={{ '--fam': meta.color, '--fam-hi': meta.colorHi } as React.CSSProperties}
                className="group relative border-b border-r border-rule bg-plate p-5 transition-colors hover:bg-ink hover:text-field"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="font-jp vector-push whitespace-nowrap leading-none text-(--fam) transition-colors group-hover:text-(--fam-hi)"
                    style={{ fontSize: kanjiSize(meta.kanji, 'family') }}
                  >
                    {meta.kanji}
                  </span>
                  <span className="annot text-faint transition-colors group-hover:text-field/55">
                    {s.mastered}/{s.total}
                  </span>
                </div>
                <h3 className="mt-4 flex items-baseline gap-2 text-[16px] font-semibold">
                  {meta.name}
                  <span className="font-jp text-[13px] text-faint transition-colors group-hover:text-field/55">{meta.jp}</span>
                </h3>
                <p className="mt-1 text-[11.5px] leading-snug text-faint transition-colors group-hover:text-field/60">{meta.principle}</p>
                <div className="dimension mt-4">
                  <fm.span className="absolute left-0 top-0 h-px bg-signal" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
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
            jp="得意技"
            aside={<Link to={{ name: 'profil' }} className="transition-colors hover:text-signal">Voir le bilan →</Link>}
          />
          <p className="mb-4 max-w-xl text-[13px] leading-relaxed text-soft">
            Votre tokui-waza, c'est la technique dont vous faites votre arme : celle que vous cherchez, que vous placez, et
            autour de laquelle le reste s'organise. Marquez-la sur sa fiche.
          </p>
          <div className="flex flex-wrap gap-2">
            {dex.tokuiList.map((t) => (
              <Link
                key={t.slug}
                to={{ name: 'technique', slug: t.slug }}
                style={familyVars(t.family)}
                className="group flex items-center gap-2.5 border border-signal px-3 py-2 transition hover:bg-signal hover:text-field"
              >
                <span className="font-jp text-lg leading-none text-(--fam) transition-colors group-hover:text-field">{t.kanji}</span>
                <span className="text-[13px] font-medium">{t.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
