import { onboardingScreens, thingsToTry } from '../data/showcase'
import { flow } from '../flow'
import { useEffect } from 'react'
import { useStatus, useStore } from './store'
import { markTried, useTried } from './tried'
import { useScreenIndex } from './useScreenIndex'

// Beside the phone on desktop: what to try at the moment of the journey that's
// showing, so reviewers know where to tap. Hidden on narrower windows and phones.
export function TryList() {
  const status = useStatus()
  const [index] = useScreenIndex()
  const { id } = flow[index]
  const { todos, goals, addedPhotos, relayNotes } = useStore()
  const tried = useTried()
  useEffect(() => markTried(`${status}/screen:${id}`), [status, id])
  // No list during onboarding (Keller, Oct 21)
  if (onboardingScreens.has(id)) return null
  // Crossed out once she has done it this session
  const isDone = (done: string) => {
    if (done === 'todos') return (todos?.length ?? 0) > 0
    if (done === 'goals') return goals.length > 0
    if (done === 'added-photo') return addedPhotos.length > 0
    if (done === 'relay-note') return Object.values(relayNotes).some((notes) => notes.length > 0)
    return tried.has(done.startsWith('screen:') ? `${status}/${done}` : done)
  }
  // Items are in nav order, so neighbours with the same area share one pill
  const groups: { area: string; items: { text: string; done: boolean }[] }[] = []
  for (const { area, text, done } of thingsToTry[status]) {
    const item = { text, done: isDone(done) }
    const last = groups[groups.length - 1]
    if (last?.area === area) last.items.push(item)
    else groups.push({ area, items: [item] })
  }

  return (
    <aside className="try-list" aria-label="Things to try">
      <h2 className="text-base font-medium text-ink-muted">Things to try</h2>
      <div key={status} className="try-groups">
        {groups.map(group => (
          <section key={group.area + group.items[0].text} className="try-group">
            <h3 className="try-area">{group.area}</h3>
            <ul className="try-items">
              {group.items.map(({ text, done }) => (
                <li key={text} className={done ? 'try-done' : undefined}>
                  {done ? <s>{text}</s> : text}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
