// The hello at the top of Today, per stage and time of day. Plain wording, no
// streaks. The countdown to New York only shows in her last week in LA.
import type { Stage } from '../flow'
import { chloe } from './people'
import { lastWeekDays } from './today'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export type Greeting = { title: string; subtitle?: string }

const hello: Record<TimeOfDay, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' }

// Mock days in New York for the prototype (Newcomer counts up from arrival)
export const mockDaysInNewYork = { newcomer: 3, local: 214 }

export function timeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

// daysLeft: days until she leaves LA (Moving only)
export function greeting(stage: Stage, time: TimeOfDay, daysLeft: number): Greeting {
  const name = chloe.name.split(' ')[0]
  const title = `${hello[time]}, ${name}.`

  if (stage === 'moving') {
    if (daysLeft <= 1) return { title: `Last day in LA, ${name}.`, subtitle: 'Ready?' }
    if (daysLeft <= lastWeekDays) return { title, subtitle: `${daysLeft} days until NY. Ready?` }
    const lines: Record<TimeOfDay, string> = {
      morning: 'Another day in LA.',
      afternoon: "What's today look like?",
      evening: 'How was LA today?',
    }
    return { title, subtitle: lines[time] }
  }

  if (stage === 'newcomer') {
    const day = mockDaysInNewYork.newcomer
    if (day === 1) return { title: `Welcome to New York, ${name}.` }
    const lines: Record<TimeOfDay, string> = {
      morning: `Day ${day} in New York.`,
      afternoon: 'Finding your way?',
      evening: 'How was New York today?',
    }
    return { title, subtitle: lines[time] }
  }

  if (mockDaysInNewYork.local === 365) return { title: `A year in New York, ${name}.` }
  const lines: Record<TimeOfDay, string> = {
    morning: 'Usual spot today?',
    afternoon: 'Usual spot today?',
    evening: 'Anything new around you?',
  }
  return { title, subtitle: lines[time] }
}
