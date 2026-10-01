/** Interface minimale du lecteur YouTube, limitée à ce que le dojo utilise. */
export interface YtPlayer {
  playVideo(): void
  pauseVideo(): void
  mute(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  destroy(): void
  getPlayerState(): number
  getCurrentTime(): number
  loadVideoById(options: { videoId: string; startSeconds?: number }): void
  getVideoData(): { video_id?: string }
}

interface YtNamespace {
  Player: new (el: HTMLElement, options: unknown) => YtPlayer
  PlayerState: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number }
}

declare global {
  interface Window {
    YT?: YtNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let pending: Promise<YtNamespace> | null = null

/** Charge l'API du lecteur une seule fois, et la partage. */
export function loadYouTubeApi(): Promise<YtNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending
  pending = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT as YtNamespace)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return pending
}

let prechauffe = false

/**
 * Ouvre la connexion vers le lecteur au moment où l'on s'approche d'une
 * vidéo, pas avant : une préconnexion écrite dans la page révélerait l'adresse
 * du visiteur à Google dès l'ouverture, qu'il regarde une vidéo ou non.
 */
export function prechauffer() {
  if (prechauffe) return
  prechauffe = true
  const lien = document.createElement('link')
  lien.rel = 'preconnect'
  lien.href = 'https://www.youtube-nocookie.com'
  document.head.appendChild(lien)
}
