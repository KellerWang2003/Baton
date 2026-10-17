import type { HTMLAttributes } from 'react'
import { cx } from './cx'

const tones = {
  default: 'bg-surface shadow-card',
  muted: 'bg-surface-muted',
  outline: 'bg-surface border border-line',
  stage: 'bg-stage/10',
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof tones
}

export function Card({ tone = 'default', className, ...props }: CardProps) {
  return <div className={cx('rounded-card p-4', tones[tone], className)} {...props} />
}
