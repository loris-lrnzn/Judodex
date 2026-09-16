import { AnimatePresence, m as fm } from 'framer-motion'

/** Retour discret en bas d'écran, qui disparaît de lui-même. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <fm.div
            key={message}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-ink text-field border-l-[3px] border-signal px-4 py-2.5 text-[12px] uppercase tracking-[0.14em] font-mono shadow-[0_16px_40px_-20px_rgba(0,0,0,.6)]"
          >
            {message}
          </fm.div>
        )}
      </AnimatePresence>
    </div>
  )
}
