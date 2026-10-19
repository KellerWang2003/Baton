import { useSyncExternalStore } from 'react'
import { foundPlaces } from '../data/onboarding'
import { dailyPrompts } from '../data/pages'
import { leave } from '../data/today'
import type { Stage } from '../flow'
import { defaultGlassTuning } from '../ui/promptGlass'
import type { GlassTuning, PromptGlass } from '../ui/promptGlass'
import type { RelayLook } from '../ui/relayLooks'

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
  friendNotes: { name: string; message: string }[]
  // When she leaves LA: her flight, or just a date she imagines (ISO date)
  leaveMode: 'flight' | 'date'
  flight: string
  leaveDate: string
  // Which Archive segment opens (the legacy card on Today opens Legacy)
  archiveSegment: 'mine' | 'legacy'
  // Which city folder in Archive was tapped (opens the detail page next)
  selectedFolder: string | null
  // Which Relay pick or tip was tapped (opens its detail page)
  selectedRec: string | null
  // Notes she left on Relay picks and tips, by item id
  relayNotes: Record<string, string[]>
  // Relay shows the map (list slid down), and the picked category filter
  relayMap: boolean
  relayFilter: string | null
  // Visual treatment for Relay, picked in the team-only Relay looks playground
  relayLook: RelayLook
  // How Today's prompt circle is drawn, picked in the team-only Today looks playground
  promptGlass: PromptGlass
  // Fluid Glass settings for that circle, tuned live in the debug panel
  glassTuning: GlassTuning
  // Which of her stage's daily prompts Today shows (switched in the debug panel)
  promptIndex: number
  setupDone: SetupItem[]
  // The + button is open as a text field in the tab bar
  composing: boolean
  // Photo taken directly from Today's photo prompt, ready for review in Capture.
  capturePhoto: File | null
  // photos are ids of the photos she picked
  reflections: { text: string; photos: string[] }[]
  // Stage whose congrats splash is showing over the app (after her stage moves forward)
  stageSplash: Stage | null
}

let state: State = {
  status: null,
  tags: [],
  keptPlaces: foundPlaces.map((place) => place.id),
  todos: null,
  doneTodos: [],
  instagram: '',
  friendNotes: [],
  leaveMode: 'flight',
  flight: '',
  leaveDate: leave.defaultDate,
  archiveSegment: 'mine',
  selectedFolder: null,
  selectedRec: null,
  relayNotes: {},
  relayMap: false,
  relayFilter: null,
  // Keller picked Scrapbook (Oct 18)
  relayLook: 'scrapbook',
  // Keller, Oct 18: the whole circle is one big blob of blue-tinted liquid glass
  // Prompt and pill sit together under the glass, so moving it bends them (Keller, Oct 19)
  promptGlass: 'glass',
  glassTuning: defaultGlassTuning,
  promptIndex: 0,
  setupDone: [],
  composing: false,
  capturePhoto: null,
  reflections: [],
  stageSplash: null,
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

const stageOrder: Stage[] = ['moving', 'newcomer', 'local']

// Change her stage. Moving forward (to Newcomer or Local) pops up the congrats
// splash; going back, or picking her stage in onboarding, doesn't.
export function changeStage(next: Stage) {
  setState((s) => {
    const forward = stageOrder.indexOf(next) > stageOrder.indexOf(s.status ?? 'moving')
    return { status: next, stageSplash: forward ? next : null }
  })
}

// Her stage: picked in onboarding, or set from the stage switcher in the debug
// panel. Screens opened directly start her as Moving.
export function useStatus(): Stage {
  return useStore().status ?? 'moving'
}

// Today's prompt for her stage (also shown above the + field while typing).
// The debug panel can pick another of the stage's prompts.
export function useDailyPrompt() {
  const prompts = dailyPrompts[useStatus()]
  return prompts[useStore().promptIndex % prompts.length]
}
