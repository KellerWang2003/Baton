import type { ReactNode } from 'react'
import { CheckCircle } from './CheckCircle'
import { cx } from './cx'

export type FanOption<T extends string> = {
  id: T
  label: string
  graphic: ReactNode
}

type CardFanProps<T extends string> = {
  options: FanOption<T>[]
  value: T | null
  onChange: (id: T) => void
  className?: string
}

// Tilt and overlap for up to three cards, left to right.
const tilts = ['z-0 -rotate-10 translate-y-4', 'z-10 rotate-0', 'z-0 rotate-10 translate-y-4']

// A big single choice shown as overlapping, tilted cards with a graphic on
// each. The picked card straightens, lifts to the front and gets a check.
export function CardFan<T extends string>({ options, value, onChange, className }: CardFanProps<T>) {
  return (
    <div role="radiogroup" className={cx('flex justify-center px-6 py-6', className)}>
      {options.map((option, i) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cx(
              'relative -mx-3 flex aspect-[3/4] w-[42%] shrink-0 flex-col rounded-card bg-surface p-2.5 text-left shadow-float transition duration-300 ease-out',
              selected ? 'z-20 -translate-y-2 scale-105 rotate-0 ring-2 ring-brand' : tilts[i],
              !selected && value !== null && 'opacity-80',
            )}
          >
            <span className="relative flex flex-1 items-center justify-center rounded-[8px] bg-surface-muted text-ink-muted">
              {option.graphic}
              {selected && <CheckCircle checked className="absolute right-1.5 top-1.5" />}
            </span>
            <span
              className={cx(
                'pt-2 text-subhead font-semibold text-ink',
                // Side labels hug the outer edge so the overlap never covers them
                i === 0 ? 'text-left' : i === options.length - 1 ? 'text-right' : 'text-center',
              )}
            >{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
