import { useSyncExternalStore } from 'react'

// Things she has done this session that "Things to try" crosses out: screens
// visited per stage ("moving/archive-detail") and a few actions with no screen
// of their own ("archive-filter"). Nothing persists; a reload starts fresh.
let tried = new Set<string>()
const listeners = new Set<() => void>()

export function markTried(key: string) {
  if (tried.has(key)) return
  tried = new Set(tried).add(key)
  listeners.forEach((listener) => listener())
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

export function useTried() {
  return useSyncExternalStore(subscribe, () => tried)
}
