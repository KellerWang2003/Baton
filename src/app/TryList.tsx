import { onboardingScreens, thingsToTry } from '../data/showcase'
import { flow } from '../flow'
import { cx } from '../ui/cx'
import { useStatus } from './store'
import { useScreenIndex } from './useScreenIndex'

// Beside the phone on desktop: what to try at the moment of the journey that's
// showing, so reviewers know where to tap. Hidden on narrower windows and phones.
export function TryList() {
  const status = useStatus()
  const [index] = useScreenIndex()
  const { id } = flow[index]
  const items = thingsToTry[onboardingScreens.has(id) ? 'onboarding' : status]

  return (
    <aside className="try-list" aria-label="Things to try">
      <h2 className="text-2xl font-medium leading-tight">Things to try</h2>
      <ol key={onboardingScreens.has(id) ? 'onboarding' : status} className="try-items">
        {items.map((item, i) => (
          <li key={item.text} className={cx('try-item', item.screen === id && 'try-item-now')}>
            <span className="try-number" aria-hidden="true">{i + 1}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
