// Choosing her intentions for New York (Figma "choosing intentions", 322:8877):
// before her last night in LA she pans around a field of glass bubbles and
// taps as many goals as she wants. Opened from Profile for the prototype. The
// three in the demo are the ones the Local insight page follows up on.
import { localInsight } from './localInsight'

export const intentions = {
  title: ['What do you want', 'New York to be for you?'],
  cta: 'Set my intentions',
  // The Profile row that opens it
  row: 'Intentions for New York',
  rowEmpty: 'Set before you leave LA',
}

// Bubble centers in canvas points (status bar included). A hand-spaced cloud:
// uneven offsets with the 142pt circles nestled close together, continuing
// around every edge of the first view so panning reveals a connected field.
export const goalBubbles: { goal: string; x: number; y: number }[] = [
  { goal: 'Learn the subway without Maps', x: 127, y: 295 },
  { goal: 'Say yes to more invites', x: 273, y: 321 },
  { goal: 'Go to a museum or show monthly', x: 412, y: 281 },
  { goal: 'Pick up a new skill', x: -1, y: 337 },
  { goal: 'Work out 3× a week', x: 85, y: 443 },
  { goal: 'Cook at home more', x: 233, y: 458 },
  { goal: 'Find a mentor', x: 371, y: 420 },
  { goal: 'Read a book a month', x: 30, y: 578 },
  { goal: 'Find people who share my hobby', x: 175, y: 591 },
  { goal: 'Spend less time on my phone', x: 317, y: 568 },
  { goal: 'Draw or make something weekly', x: 456, y: 525 },
  { goal: 'Start a side project', x: 100, y: 717 },
  { goal: 'Join a club or community', x: 242, y: 730 },
  { goal: 'Stick to a budget', x: 385, y: 692 },
  { goal: 'Sleep before midnight', x: -47, y: 725 },
  { goal: 'Take a class just for fun', x: 175, y: 862 },
  { goal: 'Build a morning routine', x: 320, y: 848 },
  { goal: 'Call home every Sunday', x: -141, y: 280 },
  { goal: 'Journal before bed', x: -78, y: 502 },
  { goal: 'Volunteer once a month', x: -190, y: 600 },
  { goal: 'Host dinner for friends', x: 29, y: 863 },
  { goal: 'Explore a new neighborhood weekly', x: 465, y: 817 },
  { goal: 'Learn a new language', x: 611, y: 808 },
  { goal: 'Save for a big trip', x: 530, y: 670 },
  { goal: 'Run a 10K', x: 595, y: 486 },
  { goal: 'Go dancing more', x: 525, y: 355 },
  { goal: 'Spend weekends in parks', x: 561, y: 216 },
  { goal: 'Take more photos', x: -115, y: 856 },
  { goal: 'See a Broadway show', x: -189, y: 422 },
  { goal: 'Keep a plant alive', x: 461, y: 967 },
]

// The three she picks in the demo, the ones the Local insight page follows up on
export const chloeGoals = localInsight.goals.map((goal) => goal.goal)
