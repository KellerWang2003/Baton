import type { ReactNode } from 'react'
import { Card } from './Card'
import { cx } from './cx'

type PromptCardProps = {
  question: string
  meta?: string
  children?: ReactNode
  className?: string
}

// A gentle question the app asks, e.g. "Why do you keep coming back here?"
export function PromptCard({ question, meta, children, className }: PromptCardProps) {
  return (
    <Card tone="stage" className={cx('flex flex-col gap-3', className)}>
      {meta && <p className="text-xs font-semibold uppercase tracking-wide text-stage">{meta}</p>}
      <p className="font-display text-xl font-semibold leading-snug text-ink">{question}</p>
      {children}
    </Card>
  )
}
