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
  // Items are in nav order, so neighbours with the same area share one pill
  const groups: { area: string; texts: string[] }[] = []
  for (const { area, text } of thingsToTry[status]) {
    const last = groups[groups.length - 1]
    if (last?.area === area) last.texts.push(text)
    else groups.push({ area, texts: [text] })
  }

  return (
    <aside className="try-list" aria-label="Things to try">
      <h2 className="text-base font-medium text-ink-muted">Things to try</h2>
      <div key={status} className="try-groups">
        {groups.map(group => (
          <section key={group.area + group.texts[0]} className="try-group">
            <h3 className="try-area">{group.area}</h3>
            <ul className="try-items">
              {group.texts.map(text => <li key={text}>{text}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
