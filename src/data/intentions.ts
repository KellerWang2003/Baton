// Choosing her intentions for New York (Figma "choosing intentions", 322:8877):
// before her last night in LA she taps the goals she wants from a field of
// glass bubbles. Opened from Profile for the prototype. Her three are the ones
// the Local insight page follows up on.
import { localInsight } from './localInsight'

export const intentions = {
  title: ['What do you want', 'New York to be for you?'],
  subtitle: 'Pick a few. Baton will help you notice when you’re getting there.',
  max: 3,
  cta: 'Set my intentions',
  // The Profile row that opens it
  row: 'Intentions for New York',
  rowEmpty: 'Set before you leave LA',
}

// Every bubble, where Figma puts it: its center on the 402pt-wide screen,
// measured from the top of the Figma frame (status bar included). Some run
// off the edges on purpose.
export const goalBubbles: { goal: string; x: number; y: number }[] = [
  { goal: 'Learn the subway without Maps', x: 139, y: 295 },
  { goal: 'Say yes to more invites', x: 278, y: 324 },
  { goal: 'Go to a museum or show monthly', x: 413, y: 280 },
  { goal: 'Pick up a new skill', x: 4, y: 339 },
  { goal: 'Work out 3× a week', x: 110, y: 433 },
  { goal: 'Cook at home more', x: 249, y: 462 },
  { goal: 'Find a mentor', x: 384, y: 418 },
  { goal: 'Read a book a month', x: 39, y: 555 },
  { goal: 'Find people who share my hobby', x: 178, y: 584 },
  { goal: 'Spend less time on my phone', x: 320, y: 584 },
  { goal: 'Draw or make something weekly', x: 456, y: 541 },
  { goal: 'Start a side project', x: 83, y: 689 },
  { goal: 'Join a club or community', x: 222, y: 718 },
  { goal: 'Stick to a budget', x: 364, y: 718 },
  { goal: 'Sleep before midnight', x: -12, y: 794 },
  { goal: 'Take a class just for fun', x: 127, y: 823 },
  { goal: 'Build a morning routine', x: 293, y: 840 },
]

// The three she picks in the demo, the ones the Local insight page follows up on
export const chloeGoals = localInsight.goals.map((goal) => goal.goal)
