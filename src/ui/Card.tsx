import type { HTMLAttributes } from 'react'
import { cx } from './cx'

const tones = {
  default: 'bg-card shadow-card',
  muted: 'bg-surface-muted',
  outline: 'bg-card border border-line',
  stage: 'bg-stage/12',
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof tones
}

// A cream card on the paper page, like Today's cards (Figma TODAY 334:10047).
export function Card({ tone = 'default', className, ...props }: CardProps) {
  return <div className={cx('rounded-card p-4', tones[tone], className)} {...props} />
}
