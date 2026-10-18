// Copy and mock data for onboarding (flow 1) and the setup to-dos on Today.
// Chloe is in her last term in Pasadena and leaves LA for New York on Dec 19.

export const features = {
  slides: [
    {
      eyebrow: 'Baton',
      title: 'Every city has a story.',
      body: 'We let the last person who lived there tell it to the next.',
    },
    {
      eyebrow: 'While you live there',
      title: 'Keep the small stuff',
      body: 'A few seconds a day for the places, people and feelings your camera roll misses. Only you can see it.',
    },
    {
      eyebrow: 'When you leave',
      title: 'Pass it on',
      body: 'Choose what to make public. It becomes your legacy for whoever arrives next.',
    },
    {
      eyebrow: 'When you arrive',
      title: 'Start with a head start',
      body: 'Tips from people with your lifestyle who lived there before you, and places picked from your own routine.',
    },
  ],
  next: 'Next',
  start: 'Get started',
}

export const auth = {
  title: 'Create your account',
  body: 'Communities are by city, not by school. Anyone moving can join.',
  apple: 'Continue with Apple',
  email: 'Sign up with email',
  login: 'Already have an account?',
  loginAction: 'Log in',
}

export const about = {
  title: 'Tell us about yourself',
  body: 'This decides what Baton shows you. You can change it any time in Profile.',
  moveOptions: [
    { id: 'moving', label: 'Moving soon' },
    { id: 'newcomer', label: 'Just arrived' },
    { id: 'local', label: 'Settled in' },
  ] as { id: 'moving' | 'newcomer' | 'local'; label: string }[],
  youHeader: 'You are…',
  tags: ['Student', 'New grad', 'International', 'Working', 'Moving alone', 'First time in a big city'],
}

export const photos = {
  title: 'Start with the photos you already have',
  body: 'Baton looks at where your photos were taken to find the places your life keeps returning to.',
  privacy: 'Your photos never leave your phone. Everything starts in your private archive, and only you can see it.',
  allow: 'Allow photo access',
  later: 'Not now',
}

export const splash = {
  welcome: 'Welcome to',
  tagline: 'Leave a story. Start another.',
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
  { id: 'vegas', name: 'Las Vegas Strip', area: 'Las Vegas · one weekend', photos: 64 },
  { id: 'dmv', name: 'DMV Pasadena', area: 'Pasadena', photos: 3 },
]

export const organize = {
  title: 'Organize your archive',
  body: "Here's what we found in 1,284 photos. Remove anything that isn't really part of your life here, like a weekend trip or a one-off errand.",
  stats: [
    { value: '1,284', label: 'photos' },
    { value: '8', label: 'places' },
    { value: '4 yrs', label: 'in LA' },
  ],
  header: 'Your places',
  footer: 'Only you can see these. They come back later as small prompts, one at a time.',
  photosLabel: (n: number) => `${n} photos`,
  done: (n: number) => (n === 1 ? 'Keep 1 place' : `Keep ${n} places`),
}

export type Todo = { id: string; title: string }
type TodoGroup = { header: string; items: Todo[] }

// Logistics to-dos for leaving (Moving) and for arriving (Newcomer).
export const todoGroups: Record<'moving' | 'newcomer', TodoGroup[]> = {
  moving: [
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
  ],
  newcomer: [
    {
      header: 'Home',
      items: [
        { id: 'insurance', title: "Get renter's insurance" },
        { id: 'internet', title: 'Set up internet' },
      ],
    },
    {
      header: 'Getting around',
      items: [
        { id: 'omny', title: 'Set up OMNY for the subway' },
        { id: 'grocery', title: 'Find a grocery store nearby' },
      ],
    },
    {
      header: 'Accounts',
      items: [
        { id: 'address', title: 'Update your address everywhere' },
        { id: 'doctor', title: 'Find a doctor in network' },
      ],
    },
  ],
}

export const todos = {
  title: { moving: 'Before you leave LA', newcomer: 'Settling into New York' },
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
}

// The "finish setting up" list on Today, right after onboarding.
export const setup = {
  header: 'Finish setting up',
  footer: 'A few minutes, whenever you have them.',
  items: {
    archive: { title: 'Organize your archive', subtitle: 'Check the places we found in your photos' },
    todos: {
      moving: { title: 'Pick your moving to-dos', subtitle: 'Lease, boxes, accounts' },
      newcomer: { title: 'Pick your arrival to-dos', subtitle: 'Home, transit, accounts' },
    },
    instagram: { title: 'Add your Instagram tag', subtitle: 'So friends can leave you notes' },
  },
}
