// Copy for the main app pages. Placeholder until each page is designed.
export const tabs = [
  { id: 'today', label: 'Today' },
  { id: 'archive', label: 'Archive' },
  { id: 'community', label: 'Relay' },
]

export const pages = {
  today: {
    title: 'Today',
    purpose: "Today's prompt and what's happening around you right now.",
  },
  archive: {
    title: 'Archive',
    segments: [
      { id: 'mine', label: 'My archive', purpose: 'Your private archive of places, people and reflections. Only you can see it.' },
      { id: 'legacy', label: 'Legacy', purpose: 'What you chose to pass on when you left, and the notes people left on it.' },
    ],
    folders: [
      {
        id: 'la',
        city: 'LA',
        dates: '09.2023-01.2027',
        tabAlign: 'right' as const,
        dateAlign: 'left' as const,
        tone: 'blue' as const,
      },
      {
        id: 'seoul',
        city: 'Seoul',
        dates: '07.2022-08.2023',
        tabAlign: 'left' as const,
        dateAlign: 'right' as const,
        tone: 'cream' as const,
      },
      {
        id: 'chicago',
        city: 'Chicago',
        dates: '11.2020-06.2022',
        tabAlign: 'right' as const,
        dateAlign: 'left' as const,
        tone: 'olive' as const,
      },
    ],
  },
  community: {
    title: 'Relay',
    purpose: 'Picks from your life, and tips from people with a similar lifestyle who lived there before you.',
  },
  profile: {
    title: 'Profile',
    purpose: 'Your status decides which features you see. Change it when you move.',
    wrappedRow: 'LA Wrapped',
    wrappedDetail: '24 moments, Aug 2023 to Dec 2026',
    paperRow: 'Rolling Paper',
    paperDetail: 'Notes from 18 friends',
  },
  capture: {
    title: 'New reflection',
    photosLabel: 'Photos',
    addPhotos: 'Add photos',
    reflectionLabel: 'Reflection',
    reflectionPlaceholder: 'Write a few lines, or just one.',
    // Shorter, so it fits beside the voice and Save buttons in the + field
    composerPlaceholder: 'Write a line or two.',
    save: 'Save',
    privacyNote: 'Saved to your private archive. Only you can see it.',
    saved: 'Saved to your private archive',
  },
}

// seed: why the prompt showed up (usually where she is), shown small under it
export type DailyPrompt = { seed: string; question: string }

// Debug > Real-life: for filming someone answering a prompt for real, on a
// phone, with the live camera; then they write a line on the reflection page
export const realLifePrompt: DailyPrompt = { seed: 'On campus today', question: 'Take a photo of your school building.' }
export const reflectionCopy = {
  label: 'Today’s prompt',
  placeholder: 'Write a line about it…',
  save: 'Add to archive',
  // While Claude reads what she wrote
  reading: 'Reading your note…',
}

// What a prompt asks for, shown as a small label above it on Today. Read from
// the verb-first wording ("Take a photo of..." vs "Write...").
export type PromptMedium = 'photo' | 'write'
export function promptMedium(question: string): PromptMedium {
  return /photo/i.test(question) ? 'photo' : 'write'
}
export const promptMediumLabel: Record<PromptMedium, string> = { photo: 'Photo', write: 'Write' }

// Prototype prompts per stage. The debug panel offers each stage's list,
// and Today shows the selected prompt (the first by default).
export const dailyPrompts: Record<'moving' | 'newcomer' | 'local', DailyPrompt[]> = {
  moving: [
    {
      seed: "You're at Lake Ave Café again",
      question: 'Take a photo of the view from the café seat you always sit in.',
    },
    {
      seed: 'Before you leave LA',
      question: "Say one thing about LA you won't miss.",
    },
    {
      seed: 'Evening at the ArtCenter studio',
      question: 'Take a photo of your desk right now, without tidying it.',
    },
  ],
  newcomer: [
    {
      seed: 'A recommended spot in New York',
      question: 'Take a photo from the seat someone recommended.',
    },
    {
      seed: 'Your first week in New York',
      question: "Take a photo of something you'd never see in LA.",
    },
    {
      seed: 'Your first week in New York',
      question: "Take a photo of something you'd never see in LA.",
    },
  ],
  local: [
    {
      seed: "You're at your usual café again",
      question: 'Write one tip about this place that took you months to learn.',
    },
    {
      seed: 'Your 30th visit here',
      question: 'Write down the name of someone you see here all the time.',
    },
    {
      seed: "You're at your usual café again",
      question: 'Write or capture your go to order.',
    },
  ],
}
