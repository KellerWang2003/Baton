import { Suspense, lazy, useState } from 'react'
import { DebugPanel } from './app/DebugPanel'
import { DeviceFrame } from './app/DeviceFrame'
import { useStore } from './app/store'
import { usePersistentToggle } from './app/usePersistentToggle'
import { useScreenIndex } from './app/useScreenIndex'
import { tabs } from './data/pages'
import { flow } from './flow'
import { TabShell } from './screens/MainLayout'
import { RelayLooks } from './screens/RelayLooks'
import { TodayLooks } from './screens/TodayLooks'
import { UiKit } from './screens/UiKit'

// The map library is big, so it only loads when the playground opens
const MapPlayground = lazy(() => import('./screens/MapPlayground').then((m) => ({ default: m.MapPlayground })))

function App() {
  const [index, goTo] = useScreenIndex()
  const [framed, toggleFrame] = usePersistentToggle('baton:framed', true)
  const [lockRatio, toggleLockRatio] = usePersistentToggle('baton:lock-ratio', true)
  const [kitOpen, setKitOpen] = useState(false)
  // Map looks playground (team only): debug panel, or ?maps in the URL
  const [mapsOpen, setMapsOpen] = useState(() => new URLSearchParams(window.location.search).has('maps'))
  // Relay looks playground (team only): debug panel, or ?relay-looks in the URL
  const [looksOpen, setLooksOpen] = useState(() => new URLSearchParams(window.location.search).has('relay-looks'))
  // Today looks playground (team only): debug panel, or ?today-looks in the URL
  const [todayLooksOpen, setTodayLooksOpen] = useState(() => new URLSearchParams(window.location.search).has('today-looks'))
  const { id, component: CurrentScreen, stage, tab } = flow[index]
  // Her stage (onboarding or the debug panel) themes every screen once it's set
  const { status } = useStore()
  const activeTab = tab ?? (tabs.some((t) => t.id === id) ? id : null)

  // Picking a screen from the debug panel closes the design system view.
  const goToScreen = (next: number) => {
    setKitOpen(false)
    goTo(next)
  }

  return (
    <>
      <DeviceFrame framed={framed} lockRatio={lockRatio} onboardingStatus={['signup', 'about', 'about-tags', 'photos', 'welcome'].includes(id)}>
        <div data-stage={status ?? stage} className="relative h-full">
          {kitOpen ? (
            <UiKit />
          ) : activeTab ? (
            // One tab bar for all tab pages, so switching tabs doesn't remount it
            <TabShell activeTab={activeTab}>
              <CurrentScreen />
            </TabShell>
          ) : (
            <CurrentScreen />
          )}
        </div>
      </DeviceFrame>
      <DebugPanel
        index={index}
        goTo={goToScreen}
        framed={framed}
        toggleFrame={toggleFrame}
        lockRatio={lockRatio}
        toggleLockRatio={toggleLockRatio}
        kitOpen={kitOpen}
        toggleKit={() => setKitOpen((open) => !open)}
        mapsOpen={mapsOpen}
        toggleMaps={() => setMapsOpen((open) => !open)}
        looksOpen={looksOpen}
        toggleLooks={() => setLooksOpen((open) => !open)}
        todayLooksOpen={todayLooksOpen}
        toggleTodayLooks={() => setTodayLooksOpen((open) => !open)}
      />
      {mapsOpen && (
        <Suspense>
          <MapPlayground onClose={() => setMapsOpen(false)} />
        </Suspense>
      )}
      {looksOpen && <RelayLooks onClose={() => setLooksOpen(false)} />}
      {todayLooksOpen && <TodayLooks onClose={() => setTodayLooksOpen(false)} />}
    </>
  )
}

export default App
