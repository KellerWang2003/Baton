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

// Every bubble's center on the canvas, in points from the top left of the
// Figma frame (status bar included), so the first view matches Figma. The
// first 17 are Figma's; the rest continue the field past the screen's edges,
// where she pans to find them.
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
  { goal: 'Call home every Sunday', x: -140, y: 220 },
  { goal: 'Journal before bed', x: -140, y: 450 },
  { goal: 'Volunteer once a month', x: -140, y: 650 },
  { goal: 'Host dinner for friends', x: -90, y: 950 },
  { goal: 'Explore a new neighborhood weekly', x: 60, y: 965 },
  { goal: 'Learn a new language', x: 205, y: 975 },
  { goal: 'Save for a big trip', x: 365, y: 985 },
  { goal: 'Run a 10K', x: 500, y: 830 },
  { goal: 'Go dancing more', x: 545, y: 680 },
  { goal: 'Spend weekends in parks', x: 545, y: 400 },
  { goal: 'Take more photos', x: 545, y: 215 },
  { goal: 'See a Broadway show', x: 680, y: 300 },
  { goal: 'Keep a plant alive', x: 680, y: 545 },
]

// The three she picks in the demo, the ones the Local insight page follows up on
export const chloeGoals = localInsight.goals.map((goal) => goal.goal)
