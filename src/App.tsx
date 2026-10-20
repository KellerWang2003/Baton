import { Suspense, lazy, useState } from 'react'
import { DebugPanel } from './app/DebugPanel'
import { DeviceFrame } from './app/DeviceFrame'
import { useStore } from './app/store'
import { ScrollJoystick } from './app/ScrollJoystick'
import { useFrameSize } from './app/useFrameSize'
import { usePersistentToggle } from './app/usePersistentToggle'
import { useScreenIndex } from './app/useScreenIndex'
import { tabs } from './data/pages'
import { flow } from './flow'
import { TabShell } from './screens/MainLayout'
import { StageSplashOverlay } from './screens/StageSplash'
import { Collage } from './screens/Collage'
import { RelayMotion } from './screens/RelayMotion'
import { ArchiveMock } from './screens/ArchiveMock'
import { ArchiveSketchScreen, ArchiveSketches } from './screens/ArchiveSketches'
import { RelayLooks } from './screens/RelayLooks'
import { TodayLooks } from './screens/TodayLooks'
import { ArchiveIdeas } from './screens/ArchiveIdeas'
import { UiKit } from './screens/UiKit'

// The map library is big, so it only loads when the playground opens
const MapPlayground = lazy(() => import('./screens/MapPlayground').then((m) => ({ default: m.MapPlayground })))

function App() {
  const [index, goTo] = useScreenIndex()
  const [framed, toggleFrame] = usePersistentToggle('baton:framed', true)
  const [frame, updateFrame] = useFrameSize()
  const [joystick, toggleJoystick] = usePersistentToggle('baton:joystick', false)
  const [lockRatio, toggleLockRatio] = usePersistentToggle('baton:lock-ratio', true)
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null)
  const [kitOpen, setKitOpen] = useState(false)
  // Map looks playground (team only): debug panel, or ?maps in the URL
  const [mapsOpen, setMapsOpen] = useState(() => new URLSearchParams(window.location.search).has('maps'))
  // Relay motion playground (team only): debug panel, or ?relay-motion in the URL
  const [motionOpen, setMotionOpen] = useState(() => new URLSearchParams(window.location.search).has('relay-motion'))
  // Relay looks playground (team only): debug panel, or ?relay-looks in the URL
  const [looksOpen, setLooksOpen] = useState(() => new URLSearchParams(window.location.search).has('relay-looks'))
  // Today looks playground (team only): debug panel, or ?today-looks in the URL
  const [todayLooksOpen, setTodayLooksOpen] = useState(() => new URLSearchParams(window.location.search).has('today-looks'))
  // Archive sketches (team only): the wireframe directions; debug panel, or ?archive-sketches in the URL
  const [sketchesOpen, setSketchesOpen] = useState(() => new URLSearchParams(window.location.search).has('archive-sketches'))
  // 3D proto (team only): Archive in a tilted phone; Debug > 3D proto, or ?3d-proto in the URL
  const [archiveMockOpen, setArchiveMockOpenState] = useState(() => new URLSearchParams(window.location.search).has('3d-proto'))
  // Kept in the URL too, so a refresh shows the same one (3D proto or the prototype)
  const setArchiveMockOpen = (open: boolean) => {
    setArchiveMockOpenState(open)
    const params = new URLSearchParams(window.location.search)
    if (open) params.set('3d-proto', '')
    else params.delete('3d-proto')
    // Flags stay bare (?debug&3d-proto, not ?debug=&3d-proto=)
    const search = [...params].map(([key, value]) => (value ? `${key}=${value}` : key)).join('&')
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
  }
  // Archive ideas playground (team only): debug panel, or ?archive-ideas in the URL
  const [archiveIdeasOpen, setArchiveIdeasOpen] = useState(() => new URLSearchParams(window.location.search).has('archive-ideas'))
  // Brand collage playground (team only): debug panel, or ?collage in the URL
  const [collageOpen, setCollageOpen] = useState(() => new URLSearchParams(window.location.search).has('collage'))
  const { id, component: CurrentScreen, stage, tab } = flow[index]
  // Her stage (onboarding or the debug panel) themes every screen once it's set
  const { status, stageSplash, archiveSketch } = useStore()
  const activeTab = tab ?? (tabs.some((t) => t.id === id) ? id : null)

  // Picking a screen from the debug panel closes the design system view.
  const goToScreen = (next: number) => {
    setKitOpen(false)
    goTo(next)
  }

  return (
    <>
      {/* The 3D proto runs its own Archive screens; hide the prototype meanwhile */}
      {!archiveMockOpen && (
        <DeviceFrame framed={framed} frame={frame} lockRatio={lockRatio} backgroundColor={backgroundColor} onboardingStatus={['signup', 'about', 'about-leave', 'about-tags', 'photos', 'welcome'].includes(id)}>
          <div data-stage={status ?? stage} className="relative h-full">
            {kitOpen ? (
              <UiKit />
            ) : archiveSketch && id === 'archive' ? (
              // A wireframe direction instead of the real Archive (Debug > Archive
              // direction), under the real tab bar, all in grayscale
              <div className="h-full grayscale">
                <TabShell activeTab="archive">
                  <ArchiveSketchScreen id={archiveSketch} />
                </TabShell>
              </div>
            ) : activeTab ? (
              // One tab bar for all tab pages, so switching tabs doesn't remount it
              <TabShell activeTab={activeTab}>
                <CurrentScreen />
              </TabShell>
            ) : (
              <CurrentScreen />
            )}
            {/* Congrats splash over whatever is showing when her stage moves forward */}
            {stageSplash && !kitOpen && <StageSplashOverlay key={stageSplash} stage={stageSplash} />}
          </div>
        </DeviceFrame>
      )}
      <DebugPanel
        index={index}
        goTo={goToScreen}
        framed={framed}
        toggleFrame={toggleFrame}
        frame={frame}
        updateFrame={updateFrame}
        joystick={joystick}
        toggleJoystick={toggleJoystick}
        lockRatio={lockRatio}
        toggleLockRatio={toggleLockRatio}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        kitOpen={kitOpen}
        toggleKit={() => setKitOpen((open) => !open)}
        mapsOpen={mapsOpen}
        toggleMaps={() => setMapsOpen((open) => !open)}
        motionOpen={motionOpen}
        toggleMotion={() => setMotionOpen((open) => !open)}
        looksOpen={looksOpen}
        toggleLooks={() => setLooksOpen((open) => !open)}
        todayLooksOpen={todayLooksOpen}
        toggleTodayLooks={() => setTodayLooksOpen((open) => !open)}
        archiveMockOpen={archiveMockOpen}
        toggleArchiveMock={() => setArchiveMockOpen(!archiveMockOpen)}
        sketchesOpen={sketchesOpen}
        toggleSketches={() => setSketchesOpen((open) => !open)}
        archiveIdeasOpen={archiveIdeasOpen}
        toggleArchiveIdeas={() => setArchiveIdeasOpen((open) => !open)}
        collageOpen={collageOpen}
        toggleCollage={() => setCollageOpen((open) => !open)}
      />
      {joystick && <ScrollJoystick />}
      {mapsOpen && (
        <Suspense>
          <MapPlayground onClose={() => setMapsOpen(false)} />
        </Suspense>
      )}
      {motionOpen && <RelayMotion onClose={() => setMotionOpen(false)} />}
      {looksOpen && <RelayLooks onClose={() => setLooksOpen(false)} />}
      {todayLooksOpen && <TodayLooks onClose={() => setTodayLooksOpen(false)} />}
      {sketchesOpen && <ArchiveSketches onClose={() => setSketchesOpen(false)} />}
      {archiveMockOpen && <ArchiveMock onClose={() => setArchiveMockOpen(false)} backgroundColor={backgroundColor} />}
      {collageOpen && <Collage onClose={() => setCollageOpen(false)} />}
      {archiveIdeasOpen && <ArchiveIdeas onClose={() => setArchiveIdeasOpen(false)} />}
    </>
  )
}

export default App
