import { useSyncExternalStore } from 'react'
import { foundPlaces } from '../data/onboarding'
import { dailyPrompts } from '../data/pages'
import { leave } from '../data/today'
import type { ArchiveSketchId } from '../data/archiveSketches'
import type { Stage } from '../flow'
import { defaultGlassTuning } from '../ui/promptGlass'
import type { GlassTuning, PromptGlass } from '../ui/promptGlass'
import type { ConfettiVariant } from '../ui/confettiVariants'
import type { RelayEntrance } from '../ui/relayEntrance'
import type { RelayLook } from '../ui/relayLooks'
import type { CloudCategory, CloudView } from '../ui/PhotoCloud'

// Tiny in-memory store for choices that carry across screens (onboarding picks
// that show up on Today). Nothing persists; a reload starts fresh.
export type SetupItem = 'archive' | 'todos' | 'leave' | 'instagram'

type State = {
  status: Stage | null
  // Optional onboarding step, enabled from the debug panel for demos.
  onboardingPhotoAccess: boolean
  intentionsVideoRun: number
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
  expectedLeaveMonth: string
  // Which Archive segment opens (the legacy card on Today opens Legacy)
  archiveSegment: 'mine' | 'legacy'
  // Which city folder in Archive was tapped (opens the detail page next)
  selectedFolder: string | null
  // Which photo in a city's photo cloud was tapped (its cloud image src), and
  // where it sat on screen, so the opened page can grow it from there
  selectedPhoto: string | null
  selectedPhotoFrom: { x: number; y: number; size: number } | null
  // The photo cloud as it was when a photo was opened (canvas position and
  // orb filter), so going back shows it the same; null opens it fresh
  cloudView: CloudView | null
  cloudFilter: CloudCategory | null
  // Which Relay pick or tip was tapped (opens its detail page)
  selectedRec: string | null
  // Notes she left on Relay picks and tips, by item id
  relayNotes: Record<string, string[]>
  // Relay shows the map (list slid down), and the picked category filter
  relayMap: boolean
  relayFilter: string | null
  // Visual treatment for Relay, picked in the team-only Relay looks playground
  relayEntrance: RelayEntrance
  relayEntranceSpeed: number
  relayLook: RelayLook
  // Archive page layout: the city folder stack, or the scrubbable photo wall (Photo wall in the debug panel's Archive direction, from the Archive ideas)
  archiveWall: boolean
  // Debug: hide the tab bar and + field, for clean recordings
  hideNav: boolean
  // Debug: hide the iOS status bar (time, signal, battery)
  hideStatusBar: boolean
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
  // The camera open inside Today's bubble: where the circle sits (screen
  // pixels, center) and how big it is (points); null while it's closed
  camera: { cx: number; cy: number; size: number } | null
  // photos are ids of the photos she picked
  reflections: { text: string; photos: string[] }[]
  // Stage whose congrats splash is showing over the app (after her stage moves forward)
  stageSplash: Stage | null
  // Status bar drawn light, over a dark full-bleed page (the Local splash)
  lightStatusBar: boolean
  // Confetti on the Welcome to New York splash, picked in the debug panel; bump
  // confettiRun to play it again
  confetti: ConfettiVariant
  confettiRun: number
  // Her intentions for New York, picked from Profile before her last night in LA
  goals: string[]
  // A wireframe direction shown in place of the Archive tab (Debug > Archive direction), or the real one
  archiveSketch: ArchiveSketchId | null
}

let state: State = {
  status: null,
  onboardingPhotoAccess: false,
  intentionsVideoRun: 0,
  tags: [],
  keptPlaces: foundPlaces.map((place) => place.id),
  todos: null,
  doneTodos: [],
  instagram: '',
  friendNotes: [],
  leaveMode: 'flight',
  flight: '',
  leaveDate: leave.defaultDate,
  expectedLeaveMonth: '',
  archiveSegment: 'mine',
  selectedFolder: null,
  selectedPhoto: null,
  selectedPhotoFrom: null,
  cloudView: null,
  cloudFilter: null,
  selectedRec: null,
  relayNotes: {},
  relayMap: false,
  relayFilter: null,
  // Keller picked Scrapbook (Oct 18)
  relayLook: 'scrapbook',
  archiveWall: false,
  hideNav: false,
  hideStatusBar: false,
  // Keller picked Side sweep (Oct 19).
  relayEntrance: 'sweep',
  relayEntranceSpeed: 1,
  // Keller, Oct 18: the whole circle is one big blob of blue-tinted liquid glass
  // Prompt and pill sit together under the glass, so moving it bends them (Keller, Oct 19)
  promptGlass: 'glass',
  glassTuning: defaultGlassTuning,
  promptIndex: 0,
  setupDone: [],
  composing: false,
  capturePhoto: null,
  camera: null,
  reflections: [],
  stageSplash: null,
  lightStatusBar: false,
  // Picked Oct 19 (the other styles stay in the debug panel)
  confetti: 'pop',
  confettiRun: 0,
  goals: [],
  archiveSketch: null,
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
