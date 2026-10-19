// Local insight page: what "You're a Local now!" opens. On her last night in
// LA Chloe picked three goals for New York (from the list below); 180 days
// later each one gets a card with how far she got, proof from her archive and
// how it compares with her LA snapshot. Then the café-seat prompt from both
// cities side by side. Written by hand, standing in for what Baton would
// generate.

// Goals she can pick from on her last night in LA (Keller, Oct 19)
export const goalOptions = [
  'Say yes to more invites',
  'Work out 3× a week',
  'Cook at home more',
  'Read a book a month',
  'Find people who share my hobby',
  'Draw or make something weekly',
  'Build a morning routine',
]

export type GoalTone = 'blue' | 'yellow' | 'pink'

export type Goal = {
  goal: string
  tone: GoalTone
  // How it went, in a word or two
  status: string
  // The big number and what it counts
  stat: string
  statLabel: string
  // One dot per week (or day) since she landed; filled = she did it
  dots: { total: number; filled: number[]; label: string }
  la: string
  photos: { src: string; alt: string }[]
}

export const localInsight = {
  eyebrow: '180 days in New York',
  title: ['How your life', 'changed since LA'],
  goalsLabel: 'The 3 goals you set on your last night in LA',

  goals: [
    {
      goal: 'Work out 3× a week',
      tone: 'blue',
      status: 'Kept it',
      stat: '2.8×',
      statLabel: 'a week, on average',
      dots: { total: 26, filled: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], label: '24 of 26 weeks' },
      la: 'In LA: about once a week.',
      photos: [
        { src: '/relay/gym.jpg', alt: 'Crunch on 14th St, with the Trader Joe’s next door' },
        { src: '/relay/gym-late.jpg', alt: 'The gym late at night' },
      ],
    },
    {
      goal: 'Find people who share my hobby',
      tone: 'yellow',
      status: 'Found them',
      stat: '3 friends',
      statLabel: 'you draw with every Thursday',
      dots: { total: 26, filled: [3, 5, 6, 8, 11, 12, 14, 17, 19, 20, 23, 25], label: '12 Thursdays at Spring Studio' },
      la: 'In LA: you mostly drew alone.',
      photos: [
        { src: '/relay/studio.jpg', alt: 'Figure drawing at Spring Studio' },
        { src: '/relay/blick.jpg', alt: 'Picking up supplies at Blick' },
      ],
    },
    {
      goal: 'Build a morning routine',
      tone: 'pink',
      status: 'On its way',
      stat: '9 mornings',
      statLabel: 'out walking in the last 30 days',
      dots: { total: 30, filled: [4, 9, 13, 16, 19, 21, 24, 27, 29], label: 'More of them lately' },
      la: 'In LA: you were never up before 9.',
      photos: [{ src: '/relay/greenway.jpg', alt: 'Morning on the Hudson River Greenway' }],
    },
  ] satisfies Goal[],

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
