// Copy and mock data for the Today tab: setup cards, the leave date, the
// last-week legacy card, suggested to-dos per stage and tips for each to-do.
import type { Stage } from '../flow'
import { todoGroups } from './onboarding'
import type { Todo } from './onboarding'

// Mock "today" for the prototype. The last-week screen jumps ahead so the
// legacy card shows.
export const mockToday = {
  normal: '2026-10-18',
  lastWeek: '2026-12-16',
}

// Days from the mock today until the leave date (ISO dates).
export function daysUntil(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
}

// "2026-12-19" -> "Dec 19"
export function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// How many days before leaving the legacy card starts showing on Today.
export const lastWeekDays = 7

export const leave = {
  title: 'When do you leave LA?',
  body: "Add your flight, or just pick the day you're imagining. In your last week, Today will ask you to look back at your archive.",
  modes: [
    { id: 'flight', label: 'My flight' },
    { id: 'date', label: 'Just a date' },
  ] as { id: 'flight' | 'date'; label: string }[],
  flightLabel: 'Flight',
  flightPlaceholder: 'e.g. B6 1124',
  flightHint: "We'll only use it for the date.",
  dateLabel: { flight: 'Date', date: 'The day you imagine leaving' },
  dateHint: 'Not sure yet? Pick a rough day. You can change it later.',
  save: 'Save',
  defaultDate: '2026-12-19',
}

export const setupCards = {
  header: 'Finish setting up',
  progress: (done: number, total: number) => `${done} of ${total}`,
  leave: {
    title: 'Add when you leave',
    subtitle: 'Your flight or a rough date',
    done: (date: string) => `Leaving ${date}`,
  },
}

export const legacyCard = {
  eyebrow: (days: number) => (days === 1 ? '1 day left in LA' : `${days} days left in LA`),
  title: 'Look back at your LA archive',
  body: 'See what you kept these four years, then choose what to pass on to whoever comes next.',
  cta: 'Open my archive',
}

export type Suggestion = Todo & {
  subtitle: string
  // Shown only if she kept this place when organizing her archive
  place?: string
}

// Suggested to-dos under the daily prompt, seeded by her places (Moving) or
// her stage. Adding one moves it into her to-do list.
export const suggestions: { header: Record<Stage, string>; footer: string; items: Record<Stage, Suggestion[]> } = {
  header: {
    moving: 'Before you go',
    newcomer: 'To try this week',
    local: 'For you',
  },
  footer: 'Add one to your to-dos.',
  items: {
    moving: [
      { id: 'last-cafe', title: 'Go to Lake Ave Café one last time', subtitle: 'Your most-visited place · 214 photos', place: 'cafe' },
      { id: 'last-trail', title: 'Hike Eaton Canyon before you go', subtitle: "You haven't been since August", place: 'trail' },
      { id: 'last-market', title: 'Get one more lunch at Grand Central Market', subtitle: '31 photos, mostly of food', place: 'market' },
      { id: 'studio-bye', title: 'Say bye to the people at the studio', subtitle: 'ArtCenter Hillside', place: 'studio' },
    ],
    newcomer: [
      { id: 'find-cafe', title: 'Find a café you could sit in every week', subtitle: 'Like Lake Ave Café in LA' },
      { id: 'walk-no-maps', title: 'Walk your neighborhood without Maps', subtitle: 'Twenty minutes is enough' },
      { id: 'try-gym', title: 'Try a gym near your place', subtitle: 'You went three times a week in LA' },
    ],
    local: [
      { id: 'answer-qa', title: "Answer a newcomer's question", subtitle: '3 new questions in Q&A' },
      { id: 'tip-cafe', title: 'Write one tip about your café', subtitle: 'It could help the next person' },
    ],
  },
}

export const todoList = {
  header: (stage: 'moving' | 'newcomer', date: string) => (stage === 'moving' ? `To-dos before ${date}` : 'To-dos for settling in'),
  footer: 'Tap one for tips from people who did it before you.',
}

export type Tip = { text: string; from: string }

// Tips and tricks for each to-do, from people who left or arrived before her.
export const tips: Record<string, Tip[]> = {
  lease: [
    { text: 'Give notice in writing 30 days out, even if your landlord says a text is fine.', from: 'Maya · left LA in June' },
    { text: 'Post the sublet in your school housing group first. It fills faster than Craigslist.', from: 'Daniel · left LA in May' },
  ],
  furniture: [
    { text: 'List on Facebook Marketplace three weeks out. The last week, everything goes for free.', from: 'Maya · left LA in June' },
    { text: 'The Pasadena Goodwill on Colorado picks up big pieces if you book a week ahead.', from: 'Jun · left LA in March' },
  ],
  deposit: [
    { text: 'Film every room on the day you move out, and send the video to your landlord.', from: 'Daniel · left LA in May' },
    { text: 'In California they have 21 days to return it or explain what they kept.', from: 'Priya · left LA in August' },
  ],
  ship: [
    { text: 'USPS Media Mail is the cheapest for books and sketchbooks. Clothes go in a duffel on the plane.', from: 'Jun · left LA in March' },
    { text: 'Ship to work if your NYC lease starts later. Most offices will hold a few boxes.', from: 'Priya · left LA in August' },
  ],
  mail: [{ text: 'Set forwarding to start the day before you fly. It takes a week to kick in.', from: 'Maya · left LA in June' }],
  utilities: [
    { text: 'Spectrum wants the router back. Drop it at the store, keep the receipt.', from: 'Daniel · left LA in May' },
    { text: 'Call Pasadena Water and Power a week out to set the final reading date.', from: 'Jun · left LA in March' },
  ],
  gym: [{ text: 'Most gyms need 30 days notice. Cancel in person and ask for it in writing.', from: 'Priya · left LA in August' }],
  bank: [{ text: 'Update your address before you go so your new card ships to New York.', from: 'Maya · left LA in June' }],
  insurance: [{ text: "Lemonade took five minutes and many NYC landlords ask for proof before you move in.", from: 'Sam · moved to NYC in 2025' }],
  internet: [
    { text: 'Book the install before you land. Spectrum and Verizon are booked two weeks out.', from: 'Ana · moved to NYC in 2024' },
    { text: 'Ask the building which providers are wired in before you pick one.', from: 'Sam · moved to NYC in 2025' },
  ],
  omny: [{ text: 'Just tap your phone. After 12 rides in a week, the rest are free.', from: 'Ana · moved to NYC in 2024' }],
  grocery: [{ text: "Trader Joe's lines are shortest on weekday mornings. Bring your own bags.", from: 'Leo · moved to NYC in 2023' }],
  address: [{ text: 'Do USPS, your bank, and your phone carrier on day one. The rest can wait.', from: 'Sam · moved to NYC in 2025' }],
  doctor: [{ text: 'Use your insurance app to filter by "accepting new patients". It saves a lot of calls.', from: 'Leo · moved to NYC in 2023' }],
  'last-cafe': [{ text: 'Go at your usual time and sit in your usual seat. Take the photo from there.', from: 'Baton' }],
  'last-trail': [{ text: 'Go early on a weekday. The parking lot fills by 9 on weekends.', from: 'Daniel · left LA in May' }],
  'last-market': [{ text: 'Eggslut has the line, but the pupusas at Sarita’s are what people miss.', from: 'Jun · left LA in March' }],
  'studio-bye': [{ text: 'Bring something small to leave behind. People remember it.', from: 'Priya · left LA in August' }],
  'find-cafe': [{ text: 'Try one place three times before you decide. The first visit is never the real one.', from: 'Ana · moved to NYC in 2024' }],
  'walk-no-maps': [{ text: 'Pick a direction and turn back after twenty minutes. That’s your first route.', from: 'Leo · moved to NYC in 2023' }],
  'try-gym': [{ text: 'Most gyms here give a free first week. Ask at the desk.', from: 'Sam · moved to NYC in 2025' }],
  'answer-qa': [{ text: 'Answer the way you wish someone had answered you in month one.', from: 'Baton' }],
  'tip-cafe': [{ text: 'The small stuff is the useful stuff: which outlet works, when it gets quiet.', from: 'Baton' }],
}

export const tipSheet = {
  title: 'Tips',
  empty: 'No tips yet. You could be the first to leave one.',
  markDone: 'Done',
  markUndone: 'Not done',
}

// Every to-do she can have on Today: picked in setup or added from suggestions.
export const allTodos: Todo[] = [
  ...todoGroups.moving.flatMap((group) => group.items),
  ...todoGroups.newcomer.flatMap((group) => group.items),
  ...Object.values(suggestions.items).flat(),
]
