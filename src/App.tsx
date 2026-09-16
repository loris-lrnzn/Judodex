import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { LazyMotion, MotionConfig, m as fm } from 'framer-motion'
import rawData from './data/techniques.json'
import type { JudodexData } from './types/judodex'
import { useJudodex } from './hooks/useJudodex'
import { useRoute, type Route } from './hooks/useRoute'
import { AppShell } from './components/AppShell'
import { NavProvider } from './components/Link'
import { CommandPalette } from './components/CommandPalette'
import { Toast } from './components/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { BrowseScreen } from './screens/BrowseScreen'
import { IntrouvableScreen } from './screens/IntrouvableScreen'
import { Garde } from './components/Garde'
import { useHead } from './hooks/useHead'

// Les écrans secondaires sortent du chargement initial.
const TechniqueScreen = lazy(() => import('./screens/TechniqueScreen').then((m) => ({ default: m.TechniqueScreen })))
const TrainScreen = lazy(() => import('./screens/TrainScreen').then((m) => ({ default: m.TrainScreen })))
const ProfilScreen = lazy(() => import('./screens/ProfilScreen').then((m) => ({ default: m.ProfilScreen })))
const DanScreen = lazy(() => import('./screens/DanScreen').then((m) => ({ default: m.DanScreen })))
const ReglagesScreen = lazy(() => import('./screens/ReglagesScreen').then((m) => ({ default: m.ReglagesScreen })))

const data = rawData as unknown as JudodexData

export default function App() {
  const dex = useJudodex(data)
  const { route, navigate } = useRoute()
  const annonce = useHead(route, route.name === 'technique' ? dex.bySlug.get(route.slug) : null, dex.techniques.length)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // « / » ou Ctrl+K ouvrent la recherche, où que l'on soit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = useCallback((r: Route) => navigate(r), [navigate])

  return (
    <NavProvider value={go}>
    <LazyMotion features={() => import('./lib/motionFeatures').then((m) => m.default)} strict>
      <MotionConfig reducedMotion="user">
        <AppShell route={route} dex={dex} annonce={annonce} onSearch={() => setPaletteOpen(true)}>
          {/* Pas d'animation de sortie : l'écran suivant ne doit jamais attendre. */}
          <fm.div key={route.name + ('slug' in route ? route.slug : '')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Garde key={route.name + ('slug' in route ? route.slug : '')}>
            <Suspense fallback={<div className="annot py-32 text-center text-faint">Chargement…</div>}>
                {route.name === 'home' && <HomeScreen dex={dex} />}
                {route.name === 'browse' && <BrowseScreen dex={dex} />}
                {route.name === 'technique' && <TechniqueScreen slug={route.slug} dex={dex} onNavigate={go} />}
                {route.name === 'profil' && <ProfilScreen dex={dex} />}
                {route.name === 'train' && <TrainScreen dex={dex} onNavigate={go} />}
                {route.name === 'dan' && <DanScreen dan={route.dan} dex={dex} />}
                {route.name === 'reglages' && <ReglagesScreen dex={dex} onNotify={notify} />}
                {route.name === 'notFound' && <IntrouvableScreen path={route.path} />}
            </Suspense>
            </Garde>
          </fm.div>
        </AppShell>

        <CommandPalette open={paletteOpen} dex={dex} onClose={() => setPaletteOpen(false)} onSelect={(slug) => go({ name: 'technique', slug })} />
        <Toast message={toast} />
      </MotionConfig>
    </LazyMotion>
    </NavProvider>
  )
}
