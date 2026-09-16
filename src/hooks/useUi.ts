import { useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { BestScores } from '../types/judodex'

/** Records personnels des séances du dojo. */
export function useBestScores() {
  return useLocalStorage<BestScores>('judodex:quiz-best:v1', {})
}

/** Piège le focus dans un conteneur ouvert et le restitue à la fermeture. */
export function useFocusTrap<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null)
  const restore = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restore.current = document.activeElement as HTMLElement
    const node = ref.current
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((el) => el.offsetParent !== null)

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const [first, last] = [list[0], list[list.length - 1]]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    node?.addEventListener('keydown', onKey)
    return () => {
      node?.removeEventListener('keydown', onKey)
      restore.current?.focus?.()
    }
  }, [open])

  return ref
}

/** Verrouille le défilement du fond sans provoquer de saut de mise en page. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow, paddingRight } = document.body.style
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [active])
}
