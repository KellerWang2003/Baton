import { navigate } from './navigate'
import { setState, useStatus } from './store'
import type { Stage } from '../flow'
import { flow } from '../flow'
import { useScreenIndex } from './useScreenIndex'
import { onboardingScreens } from '../data/showcase'
import { ArrowRightIcon, BoxIcon, CheckIcon, HomeIcon, PlaneIcon, PlusIcon } from '../ui'

const moments: { stage: Stage | null; label: string; screen: string; icon: typeof PlusIcon }[] = [
  { stage: null, label: 'Onboarding', screen: 'features', icon: PlusIcon },
  { stage: 'moving', label: 'Chloe is about to leave LA', screen: 'today-last-week', icon: BoxIcon },
  { stage: 'newcomer', label: 'Chloe just landed in NYC', screen: 'arrived', icon: PlaneIcon },
  { stage: 'local', label: 'Chloe has been in NYC for 180 days', screen: 'local-splash', icon: HomeIcon },
]

export function JourneySelector() {
  const status = useStatus()
  const [index] = useScreenIndex()
  const activeStage = onboardingScreens.has(flow[index].id) ? null : status

  return (
    <nav className="journey-selector" aria-label="Explore Chloe’s journey">
      <h1 className="text-2xl font-medium leading-tight">Explore Chloe’s journey</h1>
      <div className="journey-options">
        {moments.map(({ stage, label, screen, icon: Icon }) => (
          <button
            key={screen}
            type="button"
            className="journey-option"
            data-journey={stage ?? 'onboarding'}
            aria-pressed={activeStage === stage}
            onClick={() => {
              setState({ status: stage, stageSplash: null, composing: false, camera: null, capturePhoto: null, promptIndex: null })
              navigate(screen)
            }}
          >
            <span className="journey-icon" aria-hidden="true"><Icon /></span>
            <span className="journey-label">{label}</span>
            <span className="journey-indicator" aria-hidden="true">{activeStage === stage ? <CheckIcon /> : <ArrowRightIcon />}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
