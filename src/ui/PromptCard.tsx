import type { ReactNode } from 'react'
import { Card } from './Card'
import { cx } from './cx'
import { ArrowRightIcon } from './icons'

type PromptCardProps = {
  question: string
  meta?: string
  // Image area above the question (gray placeholder until real photos exist)
  image?: boolean
  // Round arrow at the bottom right, for a card that opens something when tapped
  arrow?: boolean
  children?: ReactNode
  className?: string
}

// A gentle question the app asks, e.g. "Why do you keep coming back here?"
export function PromptCard({ question, meta, image = false, arrow = false, children, className }: PromptCardProps) {
  return (
    <Card tone="stage" className={cx('flex flex-col gap-3', className)}>
      {image && <div aria-hidden className="aspect-[16/9] rounded-tile bg-placeholder" />}
      {meta && <p className="text-footnote font-semibold uppercase text-stage">{meta}</p>}
      <div className="flex items-end gap-3">
        <p className="flex-1 font-display text-title-3 font-semibold text-ink">{question}</p>
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
