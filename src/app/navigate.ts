import { flow } from '../flow'

// Back always goes up to the screen's parent in the IA (`parent` in flow.ts),
// never just to whatever was open before (Keller, Oct 21). Each history entry
// remembers the screen before it (`from`), so Back can step back in history
// when that is the parent, and the browser's own back (swipe back) lands there too.

type Entry = { from: string | null }

const idOf = (url: string) => url.replace(/^[^#]*#?\/?/, '')
const current = () => idOf(window.location.hash)

export function parentOf(id: string) {
  return flow.find((screen) => screen.id === id)?.parent
}

// The screen's parent, its parent's parent and so on, top first
function ancestors(id: string) {
  const chain: string[] = []
  for (let up = parentOf(id); up && !chain.includes(up); up = parentOf(up)) chain.unshift(up)
  return chain
}

// Entries made some other way (the debug panel's arrow keys, a typed URL)
// still get to know where they came from
window.addEventListener('hashchange', (event) => {
  if (window.history.state == null) window.history.replaceState({ from: idOf(event.oldURL) || null } satisfies Entry, '')
})

function announce() {
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

// Jump to a screen in the flow by id (same URL hash the debug panel uses). When
// it is opened from outside its parent (Real-life's Add to archive opening LA's
// cloud), its parents go into history first, so swipe back still goes up the IA.
// `replace` swaps out the current screen, for a page that's done (the reflection
// once it's saved).
export function navigate(id: string, { replace = false } = {}) {
  const here = current()
  if (id === here) return
  const chain = ancestors(id)
  const below = chain.includes(here) ? chain.slice(chain.indexOf(here) + 1) : chain
  let from: string | null = here
  const steps = [...below, id]
  if (replace) {
    const first = steps.shift()!
    from = (window.history.state as Entry | null)?.from ?? null
    window.history.replaceState({ from } satisfies Entry, '', `#/${first}`)
    from = first
  }
  for (const step of steps) {
    window.history.pushState({ from } satisfies Entry, '', `#/${step}`)
    from = step
  }
  announce()
}

// Back: up to the screen's parent (or `to`). Steps back in history when the
// parent is the entry before, otherwise swaps this screen for its parent, so
// Back never leaves the prototype even on a page opened straight from its URL.
export function goBack(to = parentOf(current()) ?? 'today') {
  const entry = window.history.state as Entry | null
  if (entry?.from === to) return window.history.back()
  window.history.replaceState({ from: entry?.from ?? null } satisfies Entry, '', `#/${to}`)
  announce()
}
