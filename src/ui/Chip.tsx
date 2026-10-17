import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
}

// Selectable pill, e.g. status choices or lifestyle tags.
export function Chip({ selected = false, className, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition',
        selected
          ? 'border-stage bg-stage text-on-stage'
          : 'border-line bg-surface text-ink hover:bg-surface-muted',
        className,
      )}
      {...props}
    />
  )
}
