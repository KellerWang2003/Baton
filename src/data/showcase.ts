import type { Stage } from '../flow'

// Screens that count as onboarding beside the phone (journey selector, Things to try)
export const onboardingScreens = new Set(['features', 'signup', 'about', 'about-leave', 'about-tags', 'photos', 'welcome'])

// Key screens beside the phone on desktop (KeyScreens), grouped under the three
// stages. Clicking one sets her stage (plus any `state` the screen reads) and
// opens `screen`. A screen counts as seen once reached in its stage this session.
export type KeyScreen = {
  label: string
  screen: string
  state?: { selectedFolder?: string }
  // One level down, inside the screen above it (the LA folder and the opened photo
  // inside Archive; Rolling Paper and LA Wrapped under Welcome
  // to New York)
  depth?: 1
}

export const keyScreens: Record<Stage, KeyScreen[]> = {
  moving: [
    { label: 'Today', screen: 'today' },
    { label: 'Archive', screen: 'archive' },
    { label: 'Inside her LA folder', screen: 'archive-detail', state: { selectedFolder: 'la' }, depth: 1 },
    { label: 'A photo opened', screen: 'archive-selected', state: { selectedFolder: 'la' }, depth: 1 },
    { label: 'Setting intentions for New York', screen: 'intentions' },
  ],
  newcomer: [
    { label: 'Welcome to New York', screen: 'arrived' },
    { label: 'Rolling Paper', screen: 'rolling-paper', depth: 1 },
    { label: 'LA Wrapped', screen: 'la-wrapped', depth: 1 },
    { label: 'Relay', screen: 'community' },
  ],
  local: [
    { label: 'You’re a Local', screen: 'local-splash' },
    { label: 'Lifestyle comparison', screen: 'local-insight' },
  ],
}
