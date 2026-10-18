import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { InlinePhoto } from './InlinePhoto'
import type { InlinePhotoItem } from './InlinePhoto'
import { cx } from './cx'

// A sentence made of text and inline photos
export type SummaryPart = string | InlinePhotoItem[]

type TypedSummaryProps = {
  parts: SummaryPart[]
  // Types the sentence out when true. Remount (change key) to type it again.
  play: boolean
  className?: string
  // Shown under the sentence once it has finished typing
  children?: ReactNode
}

const CHAR_MS = 24
// A photo takes as long as a few letters, so it has a beat to pop in
const PHOTO_STEPS = 8

function stepsFor(part: SummaryPart) {
  return typeof part === 'string' ? part.length + 1 : PHOTO_STEPS
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Big sentence that types itself out, photos popping in as the cursor reaches
// them. Letters not typed yet are invisible but keep their place, so lines
// never re-wrap while it types.
export function TypedSummary({ parts, play, className, children }: TypedSummaryProps) {
  const total = parts.reduce((sum, part) => sum + stepsFor(part), 0)
  const [typed, setTyped] = useState(() => (play && !prefersReducedMotion() ? 0 : total))
  const done = typed >= total

  useEffect(() => {
    if (done) return
    const timer = window.setInterval(() => setTyped((count) => Math.min(total, count + 1)), CHAR_MS)
    return () => window.clearInterval(timer)
  }, [done, total])

  // Step at which each part starts typing
  const starts = parts.map((_, index) => parts.slice(0, index).reduce((sum, part) => sum + stepsFor(part), 0))

  return (
    <>
      <p className={className}>
        {parts.map((part, index) => {
          const shown = Math.max(0, typed - starts[index])
          const typing = !done && shown > 0 && shown < stepsFor(part)

          if (typeof part !== 'string') {
            return <InlinePhoto key={index} photos={part} appear={shown === 0 ? 'hidden' : done && !play ? 'shown' : 'pop'} />
          }

          const text = `${part} `
          return (
            <span key={index}>
              {text.slice(0, shown)}
              {typing && <Caret />}
              {shown < text.length && <span className="opacity-0">{text.slice(shown)}</span>}
            </span>
          )
        })}
      </p>
      {children && <div className={cx(done ? 'animate-fade-in' : 'opacity-0')}>{children}</div>}
    </>
  )
}

function Caret() {
  return (
    <span
      aria-hidden
      className="relative -mr-[2px] inline-block h-[0.8em] w-[2px] animate-caret bg-current align-[-0.08em]"
    />
  )
}
