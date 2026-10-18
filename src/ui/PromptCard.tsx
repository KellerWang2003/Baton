import type { ReactNode } from 'react'
import { Card } from './Card'
import { cx } from './cx'
import { ArrowRightIcon, MapPinIcon } from './icons'

type PromptCardProps = {
  question: string
  meta?: string
  // Why this prompt showed up (usually where she is), small with a pin under the question
  reason?: string
  // Image area above the question (gray placeholder until real photos exist)
  image?: boolean
  // Round arrow at the bottom right, for a card that opens something when tapped
  arrow?: boolean
  children?: ReactNode
  className?: string
}

// A gentle question the app asks, e.g. "Why do you keep coming back here?"
export function PromptCard({ question, meta, reason, image = false, arrow = false, children, className }: PromptCardProps) {
  return (
    <Card tone="stage" className={cx('flex flex-col gap-3', className)}>
      {image && <div aria-hidden className="aspect-[16/9] rounded-tile bg-placeholder" />}
      {meta && <p className="text-footnote font-semibold uppercase text-stage">{meta}</p>}
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="font-display text-title-3 font-semibold text-ink">{question}</p>
          {reason && (
            <p className="flex items-center gap-1 text-footnote text-ink-muted">
              <MapPinIcon className="size-4 shrink-0" />
              {reason}
            </p>
          )}
        </div>
        {arrow && (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-stage text-on-stage">
            <ArrowRightIcon />
          </span>
        )}
      </div>
      {children}
    </Card>
  )
}
