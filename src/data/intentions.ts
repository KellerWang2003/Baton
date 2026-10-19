// Choosing her intentions for New York (Figma "What do you want New York to be
// for you?", under Choosing the legacy): before her last night in LA she picks
// three of the goals as glass bubbles. Opened from Profile for the prototype.
// The goals are the same list the Local insight page reports on.
import { goalOptions, localInsight } from './localInsight'

export const intentions = {
  title: ['What do you want', 'New York to be for you?'],
  subtitle: 'Pick three. Baton will help you notice when you’re getting there.',
  max: 3,
  cta: 'Set my intentions',
  // The Profile row that opens it
  row: 'Intentions for New York',
  rowEmpty: 'Set before you leave LA',
  goals: goalOptions,
}

// The three she picks in the demo, the ones the Local insight page follows up on
export const chloeGoals = localInsight.goals.map((goal) => goal.goal)
