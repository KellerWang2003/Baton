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
  title: 'Log in or sign up',
  emailPlaceholder: 'Email address',
  continue: 'Continue',
  divider: 'or',
  google: 'Continue with Google',
  apple: 'Continue with Apple',
}

export const about = {
  title: 'Tell us about yourself!',
  body: 'Baton works differently if you’re leaving a city, just arrived somewhere new, or have settled in.',
  moveOptions: [
    { id: 'moving', label: 'Moving soon', detail: 'Save the places and people you’ll miss, then pass them on when you leave.' },
    { id: 'newcomer', label: 'Just arrived', detail: 'Get tips from people with your lifestyle who lived here before you.' },
    { id: 'local', label: 'Settled in', detail: "See how far you've come, and keep the small stuff for whoever's next." },
  ] as { id: 'moving' | 'newcomer' | 'local'; label: string; detail: string }[],
  pickHint: 'Tap a card to see what it means.',
  tagGroups: [
    {
      title: 'Life right now',
      tags: ['Student', 'New grad', 'Working', 'Freelancing', 'Between jobs'],
    },
    {
      title: 'Your move',
      tags: ['International', 'First time moving', 'New to city life', 'Moved cities before'],
    },
    {
      title: 'Who’s coming with you',
      tags: ['Moving alone', 'With a partner', 'With family', 'With friends', 'With a pet'],
    },
  ],
}

export const photos = {
  title: 'Start with the photos you already have',
  body: 'Baton looks at where your photos were taken to find the places your life keeps returning to.',
  privacy: 'Your photos never leave your phone. Everything starts in your private archive, and only you can see it.',
  allow: 'Allow photo access',
  later: 'Not now',
}

export const splash = {
  welcome: 'Welcome to Baton',
  // Figma Splash_Blue 337:1181: a 1.8s video of the mark, with its first
  // frame as the poster until it plays.
  video: '/onboarding/welcome-baton.mp4' as string | null,
  poster: '/onboarding/welcome-video-still.png',
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
  title: 'Share your Rolling Paper',
  body: 'Send your link to friends so they can add a note to your Rolling Paper.',
  sealed: 'Their notes stay sealed until you land in your new city.',
  done: 'Done',
  socials: [
    { name: 'Instagram', url: 'https://www.instagram.com/' },
    { name: 'WhatsApp', url: 'https://web.whatsapp.com/' },
    { name: 'TikTok', url: 'https://www.tiktok.com/' },
  ],
}

// The "finish setting up" list on Today, right after onboarding.
export const setup = {
  header: 'Finish setting up',
  footer: 'A few minutes, whenever you have them.',
  items: {
    archive: { title: 'Organize your archive', subtitle: 'Check the places we found in your photos' },
    todos: {
      moving: { title: 'Plan your move our tasks', subtitle: 'Lease, boxes, accounts' },
      newcomer: { title: 'Pick your arrival to-dos', subtitle: 'Home, transit, accounts' },
    },
    instagram: { title: 'Share your Rolling Paper', subtitle: 'Invite friends to leave you notes' },
  },
}
