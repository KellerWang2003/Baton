import { DeviceFrame } from './app/DeviceFrame'
import { Toolbar } from './app/Toolbar'
import { usePersistentToggle } from './app/usePersistentToggle'
import { useScreenIndex } from './app/useScreenIndex'
import { flow } from './flow'

function App() {
  const [index, goTo] = useScreenIndex()
  const [framed, toggleFrame] = usePersistentToggle('baton:framed', true)
  const { component: CurrentScreen, stage } = flow[index]

  return (
    <>
      <DeviceFrame framed={framed}>
        <div data-stage={stage} className="h-full">
          <CurrentScreen />
        </div>
      </DeviceFrame>
      <Toolbar index={index} goTo={goTo} framed={framed} toggleFrame={toggleFrame} />
    </>
  )
}

export default App
