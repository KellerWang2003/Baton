// Local insight page: what "You're a Local now!" opens. It compares her LA
// lifestyle snapshot (captured on her last night in LA) with how she lives in
// New York now, shows her progress on the intention she set that night, and
// puts the café-seat prompt from both cities side by side. Written by hand,
// standing in for what Baton would generate.
import type { SummaryPart } from '../ui'
import { intention } from './stages'

const photo = (alt: string, src?: string) => ({ alt, src })

export const localInsight = {
  eyebrow: '180 days in New York',
  title: ['How your life', 'changed since LA'],

  // Then and now: the LA sentence is the Archive's, the New York one is hers now
  la: {
    label: 'Los Angeles',
    when: 'Your snapshot · Dec 18',
    parts: [
      'You chased sunsets',
      [photo('Sunset on the walk home', '/archive/la-sunset.jpg')],
      'and late night street tacos,',
      [photo('Tacos at Grand Central Market', '/archive/la-tacos-1.jpg'), photo('Tacos from the truck on Colorado', '/archive/la-tacos-2.jpg')],
      'and became the life of every',
      [photo('Studio party', '/archive/la-party-1.jpg')],
      'party.',
    ] satisfies SummaryPart[],
  },
  ny: {
    label: 'New York',
    when: 'You now · Jun 17',
    parts: [
      'You found a gym',
      [photo('Gym with the Trader Joe’s next door', '/relay/gym.jpg')],
      'with Trader Joe’s next door, a new window seat',
      [photo('Window seat at Devoción', '/relay/cafe.jpg')],
      'and Thursdays drawing with strangers who became friends.',
      [photo('Figure drawing at Spring Studio', '/relay/studio.jpg')],
    ] satisfies SummaryPart[],
  },
  stayed: ['A window seat', 'Gym by Trader Joe’s', 'Sunset walks'],
  fresh: ['Thursday drawing', 'The L train', 'Walking everywhere'],

  // Her intention from the last night in LA, and how far she got
  intention: {
    label: 'Your intention',
    quote: intention,
    // One dot per Thursday since she landed; the filled ones she went drawing
    thursdays: 26,
    went: [3, 5, 6, 8, 11, 12, 14, 17, 19, 20, 23, 25],
    headline: '12 Thursdays at Spring Studio',
    detail: 'And 3 people you draw with now: Ana, Theo and Min.',
  },

  // The demo bookend: the same daily prompt, asked in both cities.
  // Placeholder photos until the real café shots are in.
  bookend: {
    label: 'Same prompt, two cities',
    prompt: 'Take a photo of the view from the café seat you always sit in.',
    then: { src: '/relay/ana-cafe.jpg', alt: 'Notebook and candles on her table at Lake Ave Café', place: 'Lake Ave Café', when: 'LA · Dec 2026' },
    now: { src: '/relay/cafe.jpg', alt: 'The counter at Devoción from her window seat', place: 'Devoción', when: 'NY · Jun 2027' },
    note: 'Relay picked Devoción for you, from your LA seat.',
  },

  close: {
    title: 'You’re carrying the baton now.',
    body: 'When you leave New York, your legacy will be someone’s first week here.',
    cta: 'Continue',
  },
}
