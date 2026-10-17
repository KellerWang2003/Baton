import { useState } from 'react'
import { DebugPanel } from './app/DebugPanel'
import { DeviceFrame } from './app/DeviceFrame'
import { usePersistentToggle } from './app/usePersistentToggle'
import { useScreenIndex } from './app/useScreenIndex'
import { tabs } from './data/pages'
import { flow } from './flow'
import { TabShell } from './screens/MainLayout'
import { UiKit } from './screens/UiKit'

function App() {
  const [index, goTo] = useScreenIndex()
  const [framed, toggleFrame] = usePersistentToggle('baton:framed', true)
  const [kitOpen, setKitOpen] = useState(false)
  const { id, component: CurrentScreen, stage } = flow[index]
  const isTab = tabs.some((tab) => tab.id === id)

  // Picking a screen from the debug panel closes the design system view.
  const goToScreen = (next: number) => {
    setKitOpen(false)
    goTo(next)
  }

  return (
    <>
      <DeviceFrame framed={framed}>
        <div data-stage={stage} className="relative h-full">
          {kitOpen ? (
            <UiKit />
          ) : isTab ? (
            // One tab bar for all tab pages, so switching tabs doesn't remount it
            <TabShell activeTab={id}>
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
        kitOpen={kitOpen}
        toggleKit={() => setKitOpen((open) => !open)}
      />
    </>
  )
}

export default App
