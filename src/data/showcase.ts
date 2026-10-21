import type { Stage } from '../flow'

// Screens that count as onboarding beside the phone (journey selector, Things to try)
export const onboardingScreens = new Set(['features', 'signup', 'about', 'about-leave', 'about-tags', 'photos', 'welcome'])

// "Things to try" beside the phone on desktop (TryList), one list per stage
// (none during onboarding). Placeholder copy for Keller to rewrite.
// area: the tab or place in the app where it happens, shown as a small tag
export type TryItem = { text: string; area: string }

export const thingsToTry: Record<Stage, TryItem[]> = {
  moving: [
    { text: 'Tap the glass circle on Today to answer the daily prompt with a photo.', area: 'Today' },
    { text: 'Write a line about it and add it to her archive.', area: 'Today' },
    { text: 'Pick her moving to-dos under Finish setting up.', area: 'Today' },
    { text: 'Open the LA folder in Archive and turn the orb to filter by feeling, people or places.', area: 'Archive' },
    { text: 'Set her intentions for New York from Profile.', area: 'Profile' },
  ],
  newcomer: [
    { text: 'Tap Check it out to read the notes her LA friends left.', area: 'Today' },
    { text: 'Watch LA Wrapped, then start in New York.', area: 'Today' },
    { text: 'Browse Relay for picks from people with a lifestyle like hers.', area: 'Relay' },
    { text: 'Open a pick and leave a note on it.', area: 'Relay' },
    { text: 'See her new New York folder in Archive.', area: 'Archive' },
  ],
  local: [
    { text: 'Tap Let’s go to see how her life changed since LA.', area: 'Today' },
    { text: 'Open Archive to see New York filled in.', area: 'Archive' },
  ],
}
