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

// Today's light prompt (from prompts/daily-prompts.md, Moving stage).
export const dailyPrompt = {
  seed: "You're at your usual café again.",
  question: 'The view from where you always stand.',
  detail: 'Take it from your usual seat, not your best angle.',
}
