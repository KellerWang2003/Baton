// Relay > For you: Baton's own picks from her past routine, and tips from the
// public legacies of people who lived like her and left New York. Every pick
// and tip opens the same detail page, where people leave notes on it.
import type { Stage } from '../flow'
import type { RecTone } from '../ui'
import { intention } from './stages'

export type RelayNote = { from: string; detail: string; text: string }

export type RelayLeaver = {
  id: string
  name: string
  // When they left, and what they share with her lifestyle
  left: string
  match: string
}

export type RelayItem = {
  id: string
  // Baton's pick from her routine, or a tip from a leaver's legacy
  source: { kind: 'baton'; why: string; forIntention?: boolean } | { kind: 'leaver'; leaver: string }
  title: string
  // Their own words, shown in quotes on the card (tips from people)
  quote?: string
  // Gym, Café, Logistics, Mindset ...
  label: string
  place?: string
  body: string
  tone: RecTone
  // Missing src shows a colored tile
  photo?: string
  notes: RelayNote[]
}

export const leavers: RelayLeaver[] = [
  { id: 'maya', name: 'Maya', left: 'Left NYC in 2025', match: 'Gym before work, cooks at home' },
  { id: 'ana', name: 'Ana', left: 'Left NYC in 2024', match: 'Illustrator, worked from cafés' },
  { id: 'sam', name: 'Sam', left: 'Left NYC in 2025', match: 'Moved from abroad, like you' },
]

export const relayItems: RelayItem[] = [
  // Baton's picks, based on her routine
  {
    id: 'gym',
    source: { kind: 'baton', why: "Like your gym in Pasadena: open at 6, with a Trader Joe's next door." },
    title: 'Crunch, 14th St',
    label: 'Gym',
    place: 'Union Square · 6 min from you',
    body: "You went to the gym four mornings a week in LA and shopped on the way home. This one is the closest match: early hours, quiet after 8 pm, and Trader Joe's is in the same block.",
    tone: 'blue',
    notes: [
      { from: 'Jess', detail: 'Arrived in August', text: 'Went at 8:30 like Maya said. Had the squat rack to myself.' },
      { from: 'Kai', detail: 'Arrived in September', text: 'The Trader Joe’s line is shorter right after it opens at 8.' },
    ],
  },
  {
    id: 'cafe',
    source: { kind: 'baton', why: 'Big tables and window light, like your usual café seat in LA.' },
    title: 'Devoción, Williamsburg',
    label: 'Café',
    place: 'Williamsburg · 25 min by L',
    body: 'You spent most Sunday afternoons drawing at the same café table. Devoción has long tables under a skylight, and nobody rushes you out.',
    tone: 'yellow',
    notes: [{ from: 'Priya', detail: 'Arrived in March', text: 'Get there before 11 on weekends or every table is taken.' }],
  },
  {
    id: 'studio',
    source: { kind: 'baton', why: `For your intention: "${intention}".`, forIntention: true },
    title: 'Spring Studio',
    label: 'Drawing',
    place: 'SoHo · Thursdays at 7',
    body: 'Figure drawing every Thursday at 7, $25 drop-in. The same faces come back each week, so it is an easy place to find people to draw with.',
    tone: 'pink',
    notes: [{ from: 'Leo', detail: 'Local since 2023', text: 'Bring your own board. They run out fast.' }],
  },
  {
    id: 'market',
    source: { kind: 'baton', why: 'Saturday mornings at the market, like you did in South Pasadena.' },
    title: 'Union Square Greenmarket',
    label: 'Market',
    place: 'Union Square · Saturdays',
    body: 'Open Monday, Wednesday, Friday and Saturday. Saturday is the big one, and the bread stalls sell out by noon.',
    tone: 'olive',
    notes: [],
  },

  // From people who lived like her: in their own words, titled by their place
  {
    id: 'potatoes',
    source: { kind: 'leaver', leaver: 'maya' },
    title: "Maya's market",
    quote: "Potatoes and eggs are a dollar cheaper here than at Trader Joe's.",
    label: 'Groceries',
    place: 'Key Food, 3rd Ave',
    body: "Trader Joe's is great for most things, but potatoes, onions, eggs and rice cost about a dollar less at the Key Food on 3rd Ave. I split my shop between the two every week.",
    tone: 'yellow',
    notes: [
      { from: 'Kai', detail: 'Arrived in September', text: 'Still true. Rice is cheaper there too.' },
      { from: 'Jess', detail: 'Arrived in August', text: 'This saved me about $15 a week.' },
    ],
  },
  {
    id: 'gym-late',
    source: { kind: 'leaver', leaver: 'maya' },
    title: "Maya's gym",
    quote: 'Totally empty after 8 pm. I had the squat rack to myself.',
    label: 'Gym',
    place: 'Crunch, 14th St',
    body: "Mornings are packed with the before-work crowd. After 8 pm it's quiet, and you can shop at Trader Joe's next door on the way home.",
    tone: 'blue',
    notes: [{ from: 'Jess', detail: 'Arrived in August', text: 'Went at 8:30 like Maya said. Same, nobody there.' }],
  },
  {
    id: 'month-two',
    source: { kind: 'leaver', leaver: 'maya' },
    title: "Maya's first winter",
    quote: 'Month two was the hardest. I booked something every weekend.',
    label: 'Mindset',
    body: 'The first month is all new things. The second is when it gets quiet and you miss home. I planned something for every weekend that month, even something small, and it got me through.',
    tone: 'pink',
    notes: [{ from: 'Marco', detail: 'Arrived in October', text: 'Reading this in week six. Booked a class for every Saturday.' }],
  },
  {
    id: 'library',
    source: { kind: 'leaver', leaver: 'ana' },
    title: "Ana's drawing spot",
    quote: 'Free, big tables, and nobody minds a sketchbook.',
    label: 'Drawing',
    place: 'Brooklyn Public Library, Grand Army Plaza',
    body: 'Good light and long tables. I drew there three afternoons a week instead of buying three coffees.',
    tone: 'olive',
    notes: [],
  },
  {
    id: 'ana-cafe',
    source: { kind: 'leaver', leaver: 'ana' },
    title: "Ana's café",
    quote: "Get the window bar before 11. After that it's laptops everywhere.",
    label: 'Café',
    place: 'Devoción, Williamsburg',
    body: 'The window bar has the best light in Williamsburg for drawing. Weekends fill up fast, so I went early and stayed through lunch.',
    tone: 'yellow',
    notes: [{ from: 'Priya', detail: 'Arrived in March', text: 'Went at 10:30 on a Sunday and got the last seat.' }],
  },
  {
    id: 'omny',
    source: { kind: 'leaver', leaver: 'ana' },
    title: "Ana's commute",
    quote: 'Tap your phone. After 12 rides the rest of the week is free.',
    label: 'Logistics',
    body: "Skip the MetroCard. Tap your phone or card at the turnstile, and after 12 rides in a week the rest are free. No pass needed.",
    tone: 'blue',
    notes: [{ from: 'Priya', detail: 'Arrived in March', text: 'Use the same card every time or the cap doesn’t count.' }],
  },
  {
    id: 'laundry',
    source: { kind: 'leaver', leaver: 'sam' },
    title: "Sam's laundromat",
    quote: 'Wash-and-fold is worth it. I got my Sundays back.',
    label: 'Logistics',
    place: 'Bubbles, E 13th St',
    body: 'No machine in my building, and carrying bags in the snow was miserable. Drop it off in the morning, pick it up folded at night.',
    tone: 'pink',
    notes: [],
  },
  {
    id: 'bank',
    source: { kind: 'leaver', leaver: 'sam' },
    title: "Sam's bank",
    quote: 'Go in person with your passport and offer letter. Online kept failing.',
    label: 'Logistics',
    body: 'Landlords and phone plans kept asking for a US account. Without a credit history the online forms kept rejecting me, so go to a branch in your first week.',
    tone: 'olive',
    notes: [],
  },
  {
    id: 'lease',
    source: { kind: 'leaver', leaver: 'sam' },
    title: "Sam's lease",
    quote: 'Ask for 13 months. They gave me one month free.',
    label: 'Logistics',
    body: 'Landlords often offer one free month on a 13-month lease. If they don’t mention it, ask. It worked for me twice.',
    tone: 'blue',
    notes: [{ from: 'Marco', detail: 'Arrived in October', text: 'Asked and got it. Thank you Sam.' }],
  },
]

export const relayHeaders: Record<Stage, { picks: string; people: string }> = {
  moving: { picks: 'Based on your routine in LA', people: 'From people who lived like you' },
  newcomer: { picks: 'Based on your past routine in LA', people: 'From people who lived like you' },
  local: { picks: 'Based on your routine in New York', people: 'From people who lived like you' },
}

// Baton's picks for her stage: intention picks once she has set one (last night in LA)
export function relayPicks(stage: Stage) {
  return relayItems.filter(
    (item) => item.source.kind === 'baton' && (stage !== 'moving' || !item.source.forIntention),
  )
}

export function leaverTips(leaverId: string) {
  return relayItems.filter((item) => item.source.kind === 'leaver' && item.source.leaver === leaverId)
}

export function findLeaver(id: string) {
  return leavers.find((leaver) => leaver.id === id)
}

export const relayCopy = {
  searchPlaceholder: 'Search places and tips',
  noResults: 'Nothing matches yet. Ask in Q&A instead.',
  pickedBy: 'Picked by Baton',
  notesHeader: 'Notes',
  noNotes: 'No notes yet. Be the first to say how it went.',
  leaveNote: 'Leave a note',
  noteSheetTitle: 'Leave a note',
  notePost: 'Post',
  notePlaceholder: 'How did it go? Did it help?',
  noteStarters: ['It helped me', 'Still true', 'Changed since'],
  you: 'You',
  youDetail: 'Just now',
}
