// Congrats splash that pops up whenever Chloe's stage moves forward (Figma
// "Banner" frames on the NEW YORK page: 266:3309 arriving, 266:3704 Local).
// Photos are pre-cropped to the circle, exported from those frames.
import type { Stage } from '../flow'
import { paperNotes } from './rollingPaper'

export type StageSplashContent = {
  title: string[]
  photo: string
  photoAlt: string
  message: string
  cta: string
  // Screen the button opens
  next: string
}

export const stageSplash: Partial<Record<Stage, StageSplashContent>> = {
  newcomer: {
    title: ['Welcome to', 'New York, Chloe!'],
    photo: '/stage-splash/newcomer.png',
    photoAlt: 'Chloe with an iced drink at a café table in New York',
    // Same count as the Rolling Paper it opens (Figma says 18)
    message: `Your LA friends left you ${paperNotes.length} notes`,
    cta: 'Check it out',
    next: 'rolling-paper',
  },
  local: {
    title: ['You’re a Local now!', '180 days in New York'],
    photo: '/stage-splash/local.png',
    photoAlt: 'Chloe in a knit beanie, smiling over dinner',
    message: 'Continue to document your journey, and help fellow newcomers!',
    cta: 'Let’s go',
    next: 'local-insight',
  },
}
