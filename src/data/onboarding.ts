// Copy and mock data for onboarding (flow 1) and the setup to-dos on Today.
// Chloe is in her last term in Pasadena and leaves LA for New York on Dec 19.

export type FeatureSlide = {
  // What the top of the slide shows (Features.tsx draws each one)
  visual: 'splash' | 'folders' | 'moments' | 'recs' | 'growth'
  title: string
  body?: string
}

export const features = {
  tagline: 'Leave a story. Start another.',
  recommendation: {
    title: 'Your Sunday ritual',
    body: 'Coffee, a sketchbook, and nowhere else to be.',
  },
  slides: [
    { visual: 'splash', title: 'Baton' },
    {
      visual: 'folders',
      title: 'Every city you stayed has a story',
      body: 'Moving for school or a job? Baton is where you keep your stories.',
    },
    {
      visual: 'moments',
      title: 'Hold on to your last weeks',
      body: 'A quick daily prompt points you at the everyday things you stopped noticing.',
    },
    {
      visual: 'recs',
      title: 'Land with a head start',
      body: 'Find your places through people with routines like yours.',
    },
    {
      visual: 'growth',
      title: 'See how far you’ve come',
      body: 'Keep capturing in your new city and see how your life changes as the city becomes home.',
    },
  ] as FeatureSlide[],
  begin: 'Begin',
  next: 'Next',
  start: 'Get started',
}

export const auth = {
  title: 'Log in or sign up',
  emailPlaceholder: 'Email address',
  continue: 'Next',
  divider: 'or',
  google: 'Next with Google',
  apple: 'Next with Apple',
}

export const about = {
  title: 'Tell us about yourself!',
  demoNote: 'For the purpose of the demo, please choose Moving soon.',
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

export const departure = {
  title: 'When do you expect to leave?',
  body: 'Just the month is fine. You can add an exact date later.',
  label: 'Expected departure',
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

export type Todo = { id: string; title: string; detail?: string }
// Each category has its own icon and color on the picking page
export type TodoKind = 'home' | 'belongings' | 'accounts' | 'goodbyes' | 'transit'
export type TodoGroup = { header: string; kind: TodoKind; items: Todo[] }

// Logistics to-dos for leaving (Moving) and for arriving (Newcomer).
export const todoGroups: Record<'moving' | 'newcomer', TodoGroup[]> = {
  moving: [
    {
      header: 'Home',
      kind: 'home',
      items: [
        { id: 'lease', title: 'End your lease', detail: 'Most landlords want 30 days in writing' },
        { id: 'landlord', title: 'Tell your landlord your move-out date', detail: 'And book the walk-through' },
        { id: 'roommate', title: 'Sort things out with your roommate', detail: 'Rent, bills and who keeps what' },
        { id: 'deposit', title: 'Get your security deposit back', detail: 'Photos of every room help' },
      ],
    },
    {
      header: 'Belongings',
      kind: 'belongings',
      items: [
        { id: 'ship', title: 'Ship your boxes to New York', detail: 'Books and sketchbooks go cheapest' },
        { id: 'bedframe', title: 'Sell your bed frame', detail: 'Big pieces take the longest to go' },
        { id: 'furniture', title: 'Sell or give away the rest', detail: 'Desk, lamp, the plants' },
        { id: 'mail', title: 'Forward your mail with USPS', detail: 'Takes about a week to start' },
      ],
    },
    {
      header: 'Accounts',
      kind: 'accounts',
      items: [
        { id: 'utilities', title: 'Cancel Spectrum', detail: 'They want the router back' },
        { id: 'car-insurance', title: 'Call your car insurance', detail: 'Change your location to New York' },
        { id: 'gym', title: 'Cancel your gym membership', detail: 'Usually 30 days notice' },
        { id: 'bank', title: 'Update your address with the bank', detail: 'So your new card ships to NY' },
      ],
    },
    {
      header: 'Goodbyes',
      kind: 'goodbyes',
      items: [
        { id: 'gift-professors', title: 'Get thank-you gifts for your professors', detail: 'Something small from LA' },
        { id: 'studio-cards', title: 'Write cards for your studio friends', detail: 'They’ll keep them longer than you think' },
        { id: 'goodbye-dinner', title: 'Plan a goodbye dinner', detail: 'Pick the date before the last week fills up' },
        { id: 'roommate-gift', title: 'Leave something for your roommate', detail: 'A plant, a note, the good pan' },
      ],
    },
  ],
  newcomer: [
    {
      header: 'Home',
      kind: 'home',
      items: [
        { id: 'insurance', title: "Get renter's insurance", detail: 'Many landlords ask before move-in' },
        { id: 'internet', title: 'Set up internet', detail: 'Installs are booked two weeks out' },
      ],
    },
    {
      header: 'Getting around',
      kind: 'transit',
      items: [
        { id: 'omny', title: 'Set up OMNY for the subway', detail: 'Just tap your phone' },
        { id: 'grocery', title: 'Find a grocery store nearby', detail: 'One you can walk to' },
      ],
    },
    {
      header: 'Accounts',
      kind: 'accounts',
      items: [
        { id: 'address', title: 'Update your address everywhere', detail: 'USPS, bank, phone first' },
        { id: 'doctor', title: 'Find a doctor in network', detail: 'Filter by accepting new patients' },
      ],
    },
  ],
}

// Which category each to-do is in, for its icon on Today
export const todoKind: Record<string, TodoKind> = Object.fromEntries(
  Object.values(todoGroups).flatMap((groups) => groups.flatMap((group) => group.items.map((item) => [item.id, group.kind]))),
)

export const todos = {
  title: { moving: 'What’s left before you leave LA?', newcomer: 'What’s left to set up in New York?' },
  body: 'Pick what’s on your plate. Tips included!',
  cta: (n: number) => (n === 0 ? 'Pick at least one' : `Add ${n} to Today`),
  selectAll: 'Add all',
  clear: 'Clear',
  tips: (n: number) => (n === 1 ? '1 tip' : `${n} tips`),
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
      moving: { title: 'Pick your moving to-dos', subtitle: 'Lease, boxes, accounts' },
      newcomer: { title: 'Pick your arrival to-dos', subtitle: 'Home, transit, accounts' },
    },
    instagram: { title: 'Add your Instagram tag', subtitle: 'So friends can leave you notes' },
  },
}
