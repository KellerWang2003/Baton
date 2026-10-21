import type { Stage } from '../flow'
import type { DailyPrompt } from './pages'

// Today's prompt rotates through the day. Each stage has its own list, and
// each prompt says which times of day it can show up in. Today shows one of
// the prompts for the current time slot, and a different one each day when a
// slot has several. Edit freely: the wording follows docs/daily-prompts.md
// (plain and verb-first), and the seed is the mocked context that brought it
// up (where she is, what time it is).
//
// Where she is depends on her stage: Moving is in LA (Lake Ave Café in the
// morning, the ArtCenter studio later), Newcomer and Local are in New York.

export type TimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night'

// Each slot starts at this hour (24h clock) and runs until the next one starts
export const timeSlots: { id: TimeSlot; label: string; from: number }[] = [
  { id: 'morning', label: 'Morning (5–11)', from: 5 },
  { id: 'midday', label: 'Midday (11–2)', from: 11 },
  { id: 'afternoon', label: 'Afternoon (2–6)', from: 14 },
  { id: 'evening', label: 'Evening (6–10)', from: 18 },
  { id: 'night', label: 'Night (10–5)', from: 22 },
]

export type TimedPrompt = DailyPrompt & { when: TimeSlot[] }

export const dailyPrompts: Record<Stage, TimedPrompt[]> = {
  moving: [
    {
      when: ['morning'],
      seed: "You're at Lake Ave Café again",
      question: 'Take a photo of the view from the café seat you always sit in.',
    },
    {
      when: ['morning'],
      seed: 'On your way out the door',
      question: 'Take a photo of the door you walk through every day.',
    },
    {
      when: ['midday'],
      seed: 'Lunch at Lake Ave Café',
      question: 'Write one tip about this place that took you months to learn.',
    },
    {
      when: ['midday'],
      seed: "You're at Lake Ave Café again",
      question: 'Write down the name of someone you see here all the time.',
    },
    {
      when: ['afternoon'],
      seed: 'About 200 afternoons at Lake Ave Café',
      question: 'Tell us one thing you finished at this table.',
    },
    {
      when: ['afternoon', 'night'],
      seed: 'One of your last weeks at ArtCenter',
      question: 'Take a photo of your last class, crit or late night at school.',
    },
    {
      when: ['evening'],
      seed: 'Evening at the ArtCenter studio',
      question: 'Take a photo of your desk right now, without tidying it.',
    },
    {
      when: ['evening'],
      seed: 'Stuck on the 210 again',
      question: "Say one thing about LA you won't miss.",
    },
  ],
  newcomer: [
    {
      when: ['morning'],
      seed: 'Your first coffee in New York',
      question: 'Take a photo of your coffee order here and say how it’s different from LA.',
    },
    {
      when: ['midday'],
      seed: 'A recommended spot in New York',
      question: 'Take a photo from the seat someone recommended.',
    },
    {
      when: ['afternoon'],
      seed: 'Your first week in New York',
      question: "Take a photo of something you'd never see in LA.",
    },
    {
      when: ['afternoon'],
      seed: 'The same route three days in a row',
      question: 'Write the first route you took without Maps.',
    },
    {
      when: ['evening'],
      seed: 'End of a day in New York',
      question: 'Write one thing that confused you today.',
    },
    {
      when: ['evening'],
      seed: 'Your second week in New York',
      question: 'Write the name of the first person who recognized you.',
    },
    {
      when: ['night'],
      seed: 'A night in New York',
      question: 'Say one thing you missed about LA today.',
    },
  ],
  local: [
    {
      when: ['morning'],
      seed: "You're at your usual café again",
      question: 'Take a photo of the view from the café seat you always sit in.',
    },
    {
      when: ['morning'],
      seed: "You're at your usual café again",
      question: 'Write or capture your go to order.',
    },
    {
      when: ['midday'],
      seed: "You're at your usual café again",
      question: 'Write one tip about this place that took you months to learn.',
    },
    {
      when: ['midday', 'afternoon'],
      seed: 'Your 30th visit here',
      question: 'Write down the name of someone you see here all the time.',
    },
    {
      when: ['afternoon'],
      seed: 'Your 30th visit here',
      question: 'Write when this place stopped feeling new.',
    },
    {
      when: ['evening', 'night'],
      seed: 'A year in New York',
      question: 'Tell your month-one self one thing you know now.',
    },
  ],
}

export function slotAt(date: Date): TimeSlot {
  const hour = date.getHours()
  // The last slot that has started by this hour; before 5am is still night
  return [...timeSlots].reverse().find((slot) => hour >= slot.from)?.id ?? 'night'
}

// Her stage's prompts for a time slot, falling back to the whole list if a
// slot has none
export function promptsFor(stage: Stage, slot: TimeSlot): TimedPrompt[] {
  const matching = dailyPrompts[stage].filter((prompt) => prompt.when.includes(slot))
  return matching.length ? matching : dailyPrompts[stage]
}

// One of the slot's prompts, a different one each day
export function rotatingPrompt(prompts: TimedPrompt[], date: Date): TimedPrompt {
  const day = Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000)
  return prompts[day % prompts.length]
}
