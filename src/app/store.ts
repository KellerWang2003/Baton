import { useSyncExternalStore } from 'react'
import { foundPlaces } from '../data/onboarding'
import { dailyPrompts } from '../data/pages'
import { leave } from '../data/today'
import type { Stage } from '../flow'

// Tiny in-memory store for choices that carry across screens (onboarding picks
// that show up on Today). Nothing persists; a reload starts fresh.
export type SetupItem = 'archive' | 'todos' | 'leave' | 'instagram'

type State = {
  status: Stage | null
  tags: string[]
  keptPlaces: string[]
  // null until picked from the setup list on Today
  todos: string[] | null
  doneTodos: string[]
  instagram: string
  // When she leaves LA: her flight, or just a date she imagines (ISO date)
  leaveMode: 'flight' | 'date'
  flight: string
  leaveDate: string
  // Today's prompt: which one is showing, and whether she skipped it
  promptIndex: number
  promptSkipped: boolean
  // Which Archive segment opens (the legacy card on Today opens Legacy)
  archiveSegment: 'mine' | 'legacy'
  setupDone: SetupItem[]
  // The + button is open as a text field in the tab bar
  composing: boolean
  // photos are ids of the photos she picked
  reflections: { text: string; photos: string[] }[]
}

let state: State = {
  status: null,
  tags: [],
  keptPlaces: foundPlaces.map((place) => place.id),
  todos: null,
  doneTodos: [],
  instagram: '',
  leaveMode: 'flight',
  flight: '',
  leaveDate: leave.defaultDate,
  promptIndex: 0,
  promptSkipped: false,
  archiveSegment: 'mine',
  setupDone: [],
  composing: false,
  reflections: [],
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

// Mark a setup item on Today as done.
export function completeSetup(item: SetupItem) {
  setState((s) => ({ setupDone: s.setupDone.includes(item) ? s.setupDone : [...s.setupDone, item] }))
}

// Status for screens opened directly (debug panel): Chloe starts as Moving.
export function useStatus(): Stage {
  return useStore().status ?? 'moving'
}

// Today's prompt for her stage (also shown above the + field while typing).
export function useDailyPrompt() {
  const { promptIndex } = useStore()
  const prompts = dailyPrompts[useStatus()]
  return prompts[promptIndex % prompts.length]
}
