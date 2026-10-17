import { useSyncExternalStore } from 'react'
import { foundPlaces } from '../data/onboarding'
import type { Stage } from '../flow'

// Tiny in-memory store for choices that carry across screens (onboarding picks
// that show up on Today). Nothing persists; a reload starts fresh.
type State = {
  status: Stage | null
  keptPlaces: string[]
  // null until picked in onboarding; Today then shows defaultTodos
  todos: string[] | null
  doneTodos: string[]
  instagram: string
}

let state: State = {
  status: null,
  keptPlaces: foundPlaces.map((place) => place.id),
  todos: null,
  doneTodos: [],
  instagram: '',
}

const listeners = new Set<() => void>()

export function setState(update: Partial<State> | ((current: State) => Partial<State>)) {
  const patch = typeof update === 'function' ? update(state) : update
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => state)
}

// Add or remove an id in a list field.
export function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}
