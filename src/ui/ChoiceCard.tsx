import type { ReactNode } from 'react'
import { CheckCircle } from './CheckCircle'
import { cx } from './cx'

type ChoiceCardProps = {
  title: string
  subtitle?: string
  leading?: ReactNode
  selected: boolean
  onSelect: () => void
}

// A large single-choice option, e.g. picking a status. The selected card gets
// a tint ring and a check.
export function ChoiceCard({ title, subtitle, leading, selected, onSelect }: ChoiceCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        'flex w-full items-center gap-3 rounded-card bg-surface p-4 text-left ring-2 transition active:opacity-80',
        selected ? 'ring-brand' : 'ring-transparent',
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="text-headline font-semibold text-ink">{title}</p>
        {subtitle && <p className="text-subhead text-ink-muted">{subtitle}</p>}
      </div>
      <CheckCircle checked={selected} />
    </button>
  )
}
