// Copy and mock data for onboarding (flow 1). Chloe is in her last term in
// Pasadena and leaves LA for New York on Dec 19.

export const welcome = {
  name: 'Baton',
  pitch: 'Every city has a story. We let the last person who lived there tell it to the next.',
  apple: 'Continue with Apple',
  email: 'Sign up with email',
  terms: 'Communities are by city, not by school. Anyone moving can join.',
}

export const photos = {
  title: 'Start with the photos you already have',
  body: 'Baton looks at where your photos were taken to find the places your life here keeps returning to.',
  privacy: 'Your photos never leave your phone. Everything starts in your private archive, and only you can see it.',
  allow: 'Allow photo access',
  later: 'Not now',
}

export type FoundPlace = {
  id: string
  name: string
  area: string
  photos: number
}

// Most-visited first; these seed the first daily prompts.
export const foundPlaces: FoundPlace[] = [
  { id: 'cafe', name: 'Lake Ave Café', area: 'Pasadena', photos: 214 },
  { id: 'studio', name: 'ArtCenter Hillside studio', area: 'Pasadena', photos: 187 },
  { id: 'gym', name: 'Lake Ave Fitness', area: 'Pasadena', photos: 46 },
  { id: 'trail', name: 'Eaton Canyon trail', area: 'Altadena', photos: 38 },
  { id: 'market', name: 'Grand Central Market', area: 'Downtown LA', photos: 31 },
  { id: 'lake', name: 'Echo Park Lake', area: 'Echo Park', photos: 22 },
  { id: 'dmv', name: 'DMV Pasadena', area: 'Pasadena', photos: 3 },
]

export const places = {
  scanning: 'Finding your places…',
  scanningDetail: 'Looking through 1,284 photos',
  title: 'Your places in LA',
  body: 'These are the places you kept coming back to. Keep the ones worth a thought before you leave.',
  footer: 'Only you can see these. They show up later as small prompts, one at a time.',
  photosLabel: (n: number) => `${n} photos`,
  cta: (n: number) => (n === 1 ? 'Keep 1 place' : `Keep ${n} places`),
}

export const status = {
  title: 'Where are you in your move?',
  body: 'Your status decides what Baton shows you. You can change it when you move.',
  options: [
    { id: 'moving', title: 'Moving', subtitle: "I'm leaving a city soon" },
    { id: 'newcomer', title: 'Newcomer', subtitle: 'I just arrived somewhere new' },
    { id: 'local', title: 'Local', subtitle: "I'm settled where I live" },
  ],
  detailsHeader: 'Your move',
  leaving: 'Leaving',
  movingTo: 'Moving to',
  date: 'Leaving on',
}

export type Todo = { id: string; title: string }

export const todoGroups: { header: string; items: Todo[] }[] = [
  {
    header: 'Home',
    items: [
      { id: 'lease', title: 'End lease or find a subletter' },
      { id: 'furniture', title: 'Sell or give away furniture' },
      { id: 'deposit', title: 'Get the security deposit back' },
    ],
  },
  {
    header: 'Stuff',
    items: [
      { id: 'ship', title: 'Ship boxes to New York' },
      { id: 'mail', title: 'Forward mail with USPS' },
    ],
  },
  {
    header: 'Accounts',
    items: [
      { id: 'utilities', title: 'Cancel internet and utilities' },
      { id: 'gym', title: 'Cancel gym membership' },
      { id: 'bank', title: 'Update address with the bank' },
    ],
  },
]

// Shown on Today when onboarding was skipped (e.g. opened straight on #/today).
export const defaultTodos = ['lease', 'furniture', 'ship', 'gym']

export const todos = {
  title: (city: string) => `Before you leave ${city}`,
  body: "Pick what you still need to sort out. They'll sit on Today until they're done.",
  cta: (n: number) => (n === 0 ? 'Pick at least one' : `Add ${n} to Today`),
}

export const instagram = {
  title: 'Let friends leave you a note',
  body: 'Add your Baton tag to your Instagram bio. Friends who tap it can write you a note before you go.',
  sealed: "You'll open them after you land.",
  handleLabel: 'Instagram',
  handlePlaceholder: 'your.handle',
  previewHeader: 'What friends see',
  previewTitle: (name: string, city: string) => `Leave ${name} a note before she leaves ${city}`,
  link: (handle: string) => `baton.city/${handle || 'you'}`,
  add: 'Add tag to my bio',
  skip: 'Skip for now',
}

export const todayTodos = {
  header: (date: string) => `Before ${date}`,
  footer: "Tap one when it's done.",
}
