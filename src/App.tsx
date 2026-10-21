import { DemoNote } from './app/DemoNote'
import { DeviceFrame } from './app/DeviceFrame'
import { useStore } from './app/store'
import { useScreenIndex } from './app/useScreenIndex'
import { about } from './data/onboarding'
import { tabs } from './data/pages'
import { flow } from './flow'
import { TabShell } from './screens/MainLayout'
import { StageSplashOverlay } from './screens/StageSplash'

// Submission entry: presentation settings are fixed and team tools are not mounted.
function App() {
  const [index] = useScreenIndex()
  const { id, component: CurrentScreen, stage, tab } = flow[index]
  const { status, stageSplash } = useStore()
  const activeTab = tab ?? (tabs.some((t) => t.id === id) ? id : null)

  return (
    <DeviceFrame onboardingStatus={['signup', 'about', 'about-leave', 'about-tags', 'photos', 'welcome'].includes(id)}>
      <div data-stage={status ?? stage} className="relative h-full">
        {activeTab ? (
          <TabShell activeTab={activeTab}>
            <CurrentScreen />
          </TabShell>
        ) : (
          <CurrentScreen />
        )}
        {stageSplash && <StageSplashOverlay key={stageSplash} stage={stageSplash} />}
      </div>
      {id === 'about' && <DemoNote>{about.demoNote}</DemoNote>}
    </DeviceFrame>
  )
}

export default App
