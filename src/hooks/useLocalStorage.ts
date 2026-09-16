import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useState persistant. Lecture synchrone au montage (pas de valeur qui
 * clignote), écriture différée pour ne pas sérialiser à chaque frappe.
 */
export function useLocalStorage<T>(key: string, initial: T | (() => T), delay = 150) {
  const resolve = useCallback(() => (typeof initial === 'function' ? (initial as () => T)() : initial), [initial])

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : resolve()
    } catch {
      return resolve()
    }
  })
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* quota atteint ou navigation privée : on ignore */
      }
    }, delay)
    return () => window.clearTimeout(timer.current)
  }, [key, value, delay])

  const reset = useCallback(() => setValue(resolve()), [resolve])
  return [value, setValue, reset] as const
}

/** Valeur retardée : la saisie reste instantanée, le calcul suit. */
export function useDebounced<T>(value: T, delay = 120): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}
