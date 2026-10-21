import { onboardingScreens, thingsToTry } from '../data/showcase'
import { flow } from '../flow'
import { useStatus } from './store'
import { useScreenIndex } from './useScreenIndex'

// Beside the phone on desktop: what to try at the moment of the journey that's
// showing, so reviewers know where to tap. Hidden on narrower windows and phones.
export function TryList() {
  const status = useStatus()
  const [index] = useScreenIndex()
  const { id } = flow[index]
  // No list during onboarding (Keller, Oct 21)
  if (onboardingScreens.has(id)) return null
  const items = thingsToTry[status]

  return (
    <aside className="try-list" aria-label="Things to try">
      <h2 className="text-base font-medium text-ink-muted">Things to try</h2>
      <ol key={status} className="try-items">
        {items.map((item, i) => (
          <li key={item.text} className="try-item">
            <span className="try-number" aria-hidden="true">{i + 1}</span>
            <span>
              {item.text}
              <span className="try-area">{item.area}</span>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
