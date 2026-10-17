import { useState } from 'react'
import { DebugPanel } from './app/DebugPanel'
import { DeviceFrame } from './app/DeviceFrame'
import { usePersistentToggle } from './app/usePersistentToggle'
import { useScreenIndex } from './app/useScreenIndex'
import { flow } from './flow'
import { UiKit } from './screens/UiKit'

function App() {
  const [index, goTo] = useScreenIndex()
  const [framed, toggleFrame] = usePersistentToggle('baton:framed', true)
  const [kitOpen, setKitOpen] = useState(false)
  const { component: CurrentScreen, stage } = flow[index]

  // Picking a screen from the debug panel closes the design system view.
  const goToScreen = (next: number) => {
    setKitOpen(false)
    goTo(next)
  }

  return (
    <>
      <DeviceFrame framed={framed}>
        <div data-stage={stage} className="h-full">
          {kitOpen ? <UiKit /> : <CurrentScreen />}
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
