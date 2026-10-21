import type { Stage } from '../flow'

// Screens that count as onboarding beside the phone (journey selector, Things to try)
export const onboardingScreens = new Set(['features', 'signup', 'about', 'about-leave', 'about-tags', 'photos', 'welcome'])

// "Things to try" beside the phone on desktop (TryList), one list per stage
// (none during onboarding). Placeholder copy for Keller to rewrite.
// area: the tab or place in the app where it happens, shown as a small tag.
// done: what crosses it out once she's done it this session, a screen she
// reached in this stage ('screen:reflection') or a session mark from
// src/app/tried.ts or the store (see TryList)
export type TryItem = { text: string; area: string; done: string }

export const thingsToTry: Record<Stage, TryItem[]> = {
  moving: [
    { text: 'Tap the glass circle on Today to answer the daily prompt with a photo.', area: 'Today', done: 'screen:reflection' },
    { text: 'Write a line about it and add it to her archive.', area: 'Today', done: 'added-photo' },
    { text: 'Pick her moving to-dos under Finish setting up.', area: 'Today', done: 'todos' },
    { text: 'Open the LA folder in Archive and turn the orb to filter by feeling, people or places.', area: 'Archive', done: 'archive-filter' },
    { text: 'Set her intentions for New York from Profile.', area: 'Profile', done: 'goals' },
  ],
  newcomer: [
    { text: 'Tap Check it out to read the notes her LA friends left.', area: 'Today', done: 'screen:rolling-paper' },
    { text: 'Watch LA Wrapped, then start in New York.', area: 'Today', done: 'screen:newcomer-now' },
    { text: 'Browse Relay for picks from people with a lifestyle like hers.', area: 'Relay', done: 'screen:community' },
    { text: 'Open a pick and leave a note on it.', area: 'Relay', done: 'relay-note' },
    { text: 'See her new New York folder in Archive.', area: 'Archive', done: 'screen:archive-detail' },
  ],
  local: [
    { text: 'Tap Let’s go to see how her life changed since LA.', area: 'Today', done: 'screen:local-insight' },
    { text: 'Open Archive to see New York filled in.', area: 'Archive', done: 'screen:archive' },
  ],
}
