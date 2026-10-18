// Copy for the main app pages. Placeholder until each page is designed.
export const tabs = [
  { id: 'today', label: 'Today' },
  { id: 'archive', label: 'Archive' },
  { id: 'community', label: 'Community' },
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
        city: 'New York',
        dates: '02.2027-',
        tabAlign: 'left' as const,
        dateAlign: 'right' as const,
        active: true,
        tone: 'active' as const,
      },
      {
        id: 'la',
        city: 'LA',
        dates: '09.2023-01.2027',
        tabAlign: 'right' as const,
        dateAlign: 'left' as const,
        active: false,
        tone: 'mid' as const,
      },
      {
        id: 'seoul',
        city: 'Seoul',
        dates: '07.2022-08.2023',
        tabAlign: 'center' as const,
        dateAlign: 'left' as const,
        active: false,
        tone: 'light' as const,
      },
    ],
  },
  community: {
    title: 'Community',
    segments: [
      { id: 'recs', label: 'Recommendations', purpose: 'Places, logistics and mindset tips from people who lived here before you.' },
      { id: 'qa', label: 'Q&A', purpose: 'Newcomers ask, locals answer.' },
    ],
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

export type DailyPrompt = { seed: string; question: string; detail: string }

// Today's light prompts per stage, in the plain verb-first wording from
// docs/daily-prompts.md. Today shows the first; the rest are for later days.
// Moving and Local open with the café bookend.
export const dailyPrompts: Record<'moving' | 'newcomer' | 'local', DailyPrompt[]> = {
  moving: [
    {
      seed: "You're at Lake Ave Café again.",
      question: 'Take a photo of the view from the café seat you always sit in.',
      detail: 'From your usual seat, not your best angle.',
    },
    {
      seed: 'Your most-visited place.',
      question: 'Write one tip about this place that took you months to learn.',
      detail: 'Like when it gets quiet, or which outlet works.',
    },
    {
      seed: 'Evening at the studio.',
      question: 'Take a photo of your desk right now, without tidying it.',
      detail: 'Top-down is fine.',
    },
  ],
  newcomer: [
    {
      seed: 'Your first week in New York.',
      question: 'Write one thing that confused you today.',
      detail: 'One line is enough.',
    },
    {
      seed: 'Your first week in New York.',
      question: 'Take a photo of your coffee order here and say how it’s different from LA.',
      detail: 'A photo and one line.',
    },
  ],
  local: [
    {
      seed: "You're at your usual café again.",
      question: 'Take a photo of the view from the café seat you always sit in.',
      detail: "You took this one in LA too. We'll show them side by side.",
    },
    {
      seed: 'Your 30th visit here.',
      question: 'Write when this place stopped feeling new.',
      detail: 'One line is enough.',
    },
  ],
}
