import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  variant?: 'default' | 'onboarding'
}

// Selectable capsule, e.g. status choices, filters or lifestyle tags.
export function Chip({ selected = false, variant = 'default', className, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        variant === 'onboarding'
          ? 'onboarding-chip'
          : 'inline-flex h-8 items-center rounded-full px-3.5 text-subhead font-medium transition',
        variant === 'default' && (selected ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink active:opacity-70'),
        className,
      )}
      {...props}
    />
  )
}
