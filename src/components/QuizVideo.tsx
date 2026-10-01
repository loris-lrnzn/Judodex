import { useEffect, useRef, useState } from 'react'
import type { Technique } from '../types/judodex'
import { loadYouTubeApi, type YtPlayer } from '../lib/youtube'

export type VideoSource = 'kodokan' | 'ffjudo'

export interface QuizClip {
  source: VideoSource
  id: string
  /** Seconde à laquelle démarrer, après le générique. */
  start: number
  /** Durée totale, pour reboucler avant l'écran de fin. */
  duration: number
}

/**
 * Agrandissement du lecteur, réglé pour que le bandeau de titre de YouTube et
 * ses logos tombent hors cadre. On ne peut pas empêcher le lecteur de les
 * dessiner, on peut les placer en dehors de la fenêtre visible. Au-delà de
 * cette valeur, les plans serrés des démonstrations sont amputés.
 */
const ZOOM = 1.34

/**
 * Court sursis avant de découvrir l'image : le lecteur affiche brièvement une
 * icône de lecture au démarrage, qu'il vaut mieux laisser disparaître.
 */
const DELAI = 0.9

/**
 * Fin du générique, relevée sur les deux séries : la carte de titre annonce le
 * nom de la technique pendant environ cinq secondes, puis la démonstration
 * commence. Partir plus tard ampute le geste, partir plus tôt le dévoile.
 */
const GENERIQUE = 6

/**
 * Choisit l'extrait à montrer sans dévoiler la réponse. La série fédérale est
 * préférée : elle ne porte pas le nom de la technique pendant la démonstration.
 */
export function clipFor(t: Technique): QuizClip | null {
  const pick = (id: string, source: VideoSource, d?: number): QuizClip => ({
    source,
    id,
    duration: d ?? 60,
    // On démarre juste après le générique, pour ne rien perdre du geste.
    start: GENERIQUE,
  })
  if (t.ffjudoId) return pick(t.ffjudoId, 'ffjudo', t.ffjudoDuration)
  if (t.youtubeId) return pick(t.youtubeId, 'kodokan', t.youtubeDuration)
  return null
}

interface Props {
  clip: QuizClip
  /** Une fois la réponse donnée, on rend la vidéo entière et son habillage. */
  revealed: boolean
}

/**
 * Lecteur de quiz.
 *
 * Le lecteur est créé une seule fois et conservé d'une question à l'autre :
 * passer à la suivante ne demande qu'un changement de vidéo, pas une nouvelle
 * poignée de main avec YouTube. L'image n'est découverte qu'une fois la
 * lecture réellement engagée ; le reste du temps un volet opaque la couvre.
 */
export function QuizVideo({ clip, revealed }: Props) {
  const holder = useRef<HTMLDivElement>(null)
  const player = useRef<YtPlayer | null>(null)
  const clipRef = useRef(clip)
  clipRef.current = clip
  /** Vidéo actuellement chargée dans le lecteur, préchargement compris. */
  const chargee = useRef<string | null>(null)
  const [visible, setVisible] = useState(false)

  // Création unique du lecteur, puis surveillance de son état. Le lecteur
  // vit toute la séance : les questions suivantes ne font que changer de
  // vidéo, plus bas. Le recréer à chaque question coûtait la poignée de main
  // avec YouTube à chaque fois.
  useEffect(() => {
    let annule = false
    let poll: number | undefined
    /** Les méthodes du lecteur n'existent qu'une fois qu'il s'est déclaré prêt. */
    let pret = false

    loadYouTubeApi().then((YT) => {
      if (annule || !holder.current) return
      const c = clipRef.current
      player.current = new YT.Player(holder.current, {
        videoId: c.id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          // Le commentaire prononce le nom de la technique.
          cc_load_policy: 0,
          start: c.start,
        },
        events: {
          onReady: (e: { target: YtPlayer }) => {
            if (annule) return
            pret = true
            e.target.mute()
            // La question a pu changer pendant la poignée de main.
            const actuel = clipRef.current
            if (actuel.id !== c.id) e.target.loadVideoById({ videoId: actuel.id, startSeconds: actuel.start })
            else e.target.playVideo()
            chargee.current = actuel.id
          },
          onStateChange: (e: { data: number; target: YtPlayer }) => {
            if (annule) return
            // Fin de vidéo : on revient sur l'extrait, jamais sur le générique.
            if (e.data === YT.PlayerState.ENDED) {
              e.target.seekTo(clipRef.current.start, true)
              e.target.playVideo()
            }
            if (e.data !== YT.PlayerState.PLAYING) setVisible(false)
          },
        },
      })

      poll = window.setInterval(() => {
        const p = player.current
        if (!p || annule || !pret) return
        if (p.getPlayerState() !== YT.PlayerState.PLAYING) return setVisible(false)
        const t = p.getCurrentTime()
        const c2 = clipRef.current
        if (t >= c2.duration - 1.5) {
          p.seekTo(c2.start, true)
          return
        }
        setVisible(t >= c2.start + DELAI)
      }, 150)
    })

    return () => {
      annule = true
      window.clearInterval(poll)
      player.current?.destroy()
      player.current = null
      chargee.current = null
    }
  }, [])

  // Question suivante : on change de vidéo sans reconstruire le lecteur.
  // Précharger la suivante pendant la correction a été essayé et abandonné :
  // le second chargement concurrence la vidéo affichée et impose un saut de
  // plus, ce qui rallonge l'attente au lieu de la réduire.
  useEffect(() => {
    setVisible(false)
    const p = player.current
    // Tant que le lecteur ne s'est pas déclaré prêt, c'est lui qui prendra la
    // bonne vidéo à son réveil.
    if (!p || revealed || chargee.current === null) return
    if (chargee.current === clip.id) {
      p.seekTo(clip.start, true)
      p.playVideo()
      return
    }
    p.loadVideoById({ videoId: clip.id, startSeconds: clip.start })
    chargee.current = clip.id
  }, [clip.id, clip.start, revealed])


  const rejouer = () => {
    setVisible(false)
    player.current?.seekTo(clip.start, true)
    player.current?.playVideo()
  }

  const marge = ((ZOOM - 1) / 2) * 100

  return (
    <div className="relative aspect-video w-full overflow-hidden border border-rule bg-field">
      <div
        className="pointer-events-none absolute"
        style={{ top: `-${marge}%`, left: `-${marge}%`, width: `${ZOOM * 100}%`, height: `${ZOOM * 100}%` }}
      >
        <div ref={holder} className="size-full" />
      </div>

      {/* Les vidéos du Kodokan portent le nom incrusté en bas à gauche pendant
          toute leur durée : un cache d'angle suffit, le recadrage seul ne
          l'atteint pas sans amputer l'image. */}
      {!revealed && clip.source === 'kodokan' && (
        <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[16%] w-[26%] bg-field" />
      )}

      {/* Volet opaque : tant que l'image n'est pas en mouvement, rien ne filtre. */}
      {!visible && !revealed && (
        <div className="absolute inset-0 grid place-items-center bg-field">
          <span className="annot text-faint">Démonstration en cours…</span>
        </div>
      )}

      {visible && !revealed && (
        <button
          onClick={rejouer}
          className="tap annot absolute bottom-2 right-2 inline-flex items-center border border-field/50 bg-field/85 px-2 py-1 text-ink transition hover:bg-field"
        >
          Revoir
        </button>
      )}

      {/* Réponse donnée : la vidéo entière, avec son titre et ses commandes. */}
      {revealed && (
        <iframe
          className="absolute inset-0 size-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${clip.id}?rel=0&modestbranding=1`}
          title="Démonstration"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}
