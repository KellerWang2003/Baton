// Choosing her intentions for New York (Figma "choosing intentions", 322:8877):
// before her last night in LA she pans around a field of glass bubbles and
// taps as many goals as she wants. Opened from Profile for the prototype. The
// three in the demo are the ones the Local insight page follows up on.
import { localInsight } from './localInsight'

export const intentions = {
  title: ['What do you want', 'New York to be for you?'],
  cta: 'Set my intentions',
  // The button until she has picked enough (it's disabled till then)
  ctaNeedMore: 'Select at least three',
  minPicks: 3,
  // The Profile row that opens it
  row: 'Intentions for New York',
  rowEmpty: 'Set before you leave LA',
  confirmation: {
    title: 'Your goals for New York are set.',
    cta: 'Let’s make it happen',
  },
}

// Bubble centers in canvas points (status bar included). A loose cloud of the
// 142pt circles, continuing around every edge of the first view so panning
// reveals a connected field. No two ever overlap: every pair is at least one
// diameter apart, so neighbors only touch at their edges.
export const goalBubbles: { goal: string; x: number; y: number }[] = [
  { goal: 'Learn the subway without Maps', x: 127, y: 292 },
  { goal: 'Say yes to more invites', x: 268, y: 321 },
  { goal: 'Go to a museum or show monthly', x: 406, y: 284 },
  { goal: 'Pick up a new skill', x: -7, y: 341 },
  { goal: 'Work out 3× a week', x: 88, y: 447 },
  { goal: 'Cook at home more', x: 231, y: 459 },
  { goal: 'Find a mentor', x: 369, y: 422 },
  { goal: 'Read a book a month', x: 39, y: 581 },
  { goal: 'Find people who share my hobby', x: 182, y: 594 },
  { goal: 'Spend less time on my phone', x: 322, y: 569 },
  { goal: 'Draw or make something weekly', x: 461, y: 532 },
  { goal: 'Start a side project', x: 99, y: 711 },
  { goal: 'Join a club or community', x: 241, y: 724 },
  { goal: 'Stick to a budget', x: 382, y: 699 },
  { goal: 'Sleep before midnight', x: -43, y: 727 },
  { goal: 'Take a class just for fun', x: 177, y: 852 },
  { goal: 'Build a morning routine', x: 320, y: 844 },
  { goal: 'Call home every Sunday', x: -138, y: 284 },
  { goal: 'Journal before bed', x: -81, y: 504 },
  { goal: 'Volunteer once a month', x: -188, y: 598 },
  { goal: 'Host dinner for friends', x: 34, y: 862 },
  { goal: 'Explore a new neighborhood weekly', x: 460, y: 818 },
  { goal: 'Learn a new language', x: 603, y: 809 },
  { goal: 'Save for a big trip', x: 522, y: 672 },
  { goal: 'Run a 10K', x: 595, y: 483 },
  { goal: 'Go dancing more', x: 528, y: 357 },
  { goal: 'Spend weekends in parks', x: 561, y: 218 },
  { goal: 'Take more photos', x: -108, y: 854 },
  { goal: 'See a Broadway show', x: -194, y: 416 },
  { goal: 'Keep a plant alive', x: 461, y: 961 },
]

// The three she picks in the demo, the ones the Local insight page follows up on
export const chloeGoals = localInsight.goals.map((goal) => goal.goal)
