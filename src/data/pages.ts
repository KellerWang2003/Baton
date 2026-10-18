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
        id: 'ny',
        city: 'NYC',
        dates: '02.2027-present',
        tabAlign: 'left' as const,
        dateAlign: 'right' as const,
        tone: 'navy' as const,
      },
      {
        id: 'la',
        city: 'LA',
        dates: '09.2023-01.2027',
        tabAlign: 'right' as const,
        dateAlign: 'left' as const,
        tone: 'olive' as const,
      },
      {
        id: 'seoul',
        city: 'Seoul',
        dates: '07.2022-08.2023',
        tabAlign: 'center' as const,
        dateAlign: 'left' as const,
        tone: 'blue' as const,
      },
      {
        id: 'chicago',
        city: 'Chicago',
        dates: '09.2021-06.2022',
        tabAlign: 'left' as const,
        dateAlign: 'right' as const,
        tone: 'cream' as const,
      },
      {
        id: 'taipei',
        city: 'Taipei',
        dates: '01.2020-08.2021',
        tabAlign: 'right' as const,
        dateAlign: 'left' as const,
        tone: 'pink' as const,
      },
      {
        id: 'busan',
        city: 'Busan',
        dates: '03.2018-12.2019',
        tabAlign: 'center' as const,
        dateAlign: 'left' as const,
        tone: 'yellow' as const,
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
  },
  capture: {
    title: 'New reflection',
    photosLabel: 'Photos',
    addPhotos: 'Add photos',
    reflectionLabel: 'Reflection',
    reflectionPlaceholder: 'Write a few lines, or just one.',
    privacyNote: 'Saved to your private archive. Only you can see it.',
    saved: 'Saved to your private archive',
  },
}

// seed: why the prompt showed up (usually where she is), shown small under it
export type DailyPrompt = { seed: string; question: string }

// Today's light prompts per stage, in the plain verb-first wording from
// docs/daily-prompts.md. Today shows the first; the rest are for later days.
// Moving and Local open with the café bookend.
export const dailyPrompts: Record<'moving' | 'newcomer' | 'local', DailyPrompt[]> = {
  moving: [
    {
      seed: "You're at Lake Ave Café again",
      question: 'Take a photo of the view from the café seat you always sit in.',
    },
    {
      seed: 'Lake Ave Café, your most-visited place',
      question: 'Write one tip about this place that took you months to learn.',
    },
    {
      seed: 'Evening at the ArtCenter studio',
      question: 'Take a photo of your desk right now, without tidying it.',
    },
  ],
  newcomer: [
    {
      seed: 'Your first week in New York',
      question: 'Write one thing that confused you today.',
    },
    {
      seed: 'Your first week in New York',
      question: 'Take a photo of your coffee order here and say how it’s different from LA.',
    },
  ],
  local: [
    {
      seed: "You're at your usual café again",
      question: 'Take a photo of the view from the café seat you always sit in.',
    },
    {
      seed: 'Your 30th visit here',
      question: 'Write when this place stopped feeling new.',
    },
  ],
}
