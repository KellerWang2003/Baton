import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { InlinePhoto } from './InlinePhoto'
import type { InlinePhotoItem } from './InlinePhoto'
import { cx } from './cx'

// A sentence made of text and inline photos
export type SummaryPart = string | InlinePhotoItem[]

type TypedSummaryProps = {
  parts: SummaryPart[]
  // Reveals the sentence when true. Remount (change key) to play it again.
  play: boolean
  className?: string
  // Shown under the sentence once it has finished
  children?: ReactNode
}

const WORD_MS = 90
// A photo takes as long as a couple of words, so it has a beat to pop in
const PHOTO_STEPS = 2

function stepsFor(part: SummaryPart) {
  return typeof part === 'string' ? part.split(' ').length : PHOTO_STEPS
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Big sentence that appears word by word, photos popping in as it reaches
// them. Words not shown yet are invisible but keep their place, so lines
// never re-wrap while it plays.
export function TypedSummary({ parts, play, className, children }: TypedSummaryProps) {
  const total = parts.reduce((sum, part) => sum + stepsFor(part), 0)
  const [shownSteps, setShownSteps] = useState(() => (play && !prefersReducedMotion() ? 0 : total))
  const done = shownSteps >= total
  const animate = play && !prefersReducedMotion()

  useEffect(() => {
    if (done) return
    const timer = window.setInterval(() => setShownSteps((count) => Math.min(total, count + 1)), WORD_MS)
    return () => window.clearInterval(timer)
  }, [done, total])

  // Step at which each part starts
  const starts = parts.map((_, index) => parts.slice(0, index).reduce((sum, part) => sum + stepsFor(part), 0))

  return (
    <>
      <p className={className}>
        {parts.map((part, index) => {
          const shown = Math.max(0, shownSteps - starts[index])

          if (typeof part !== 'string') {
            return <InlinePhoto key={index} photos={part} appear={shown === 0 ? 'hidden' : animate ? 'pop' : 'shown'} />
          }

          return (
            <span key={index}>
              {part.split(' ').map((word, wordIndex) => (
                <span key={wordIndex}>
                  <span className={cx('inline-block', wordIndex >= shown ? 'opacity-0' : animate && 'animate-word-in')}>
                    {word}
                  </span>{' '}
                </span>
              ))}
            </span>
          )
        })}
      </p>
      {children && <div className={cx(done ? 'animate-fade-in' : 'opacity-0')}>{children}</div>}
    </>
  )
}
