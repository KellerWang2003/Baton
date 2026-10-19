import type { CSSProperties, ReactNode } from 'react'
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

type Pose = { x: number; rotate: number; scale: number; y: number; z: number; dim: boolean }

// Where each card sits. Nothing picked: an even fan of three. Picked: the cards
// keep their order. The picked one grows in its own slot and the other two
// squeeze together on the side that's left (one on each side for the middle).
function poseFor(i: number, count: number, selected: number): Pose {
  const fan = i - (count - 1) / 2 // -1, 0, 1
  if (selected < 0) return { x: fan * 104, rotate: fan * 9, scale: 1, y: Math.abs(fan) * 14, z: fan === 0 ? 10 : 0, dim: false }
  const side = selected - (count - 1) / 2 // where the picked card is: -1 left, 0 middle, 1 right
  if (i === selected) return { x: side * 88, rotate: 0, scale: 1.12, y: -6, z: 20, dim: false }
  if (side === 0) {
    const s = i < selected ? -1 : 1
    return { x: s * 100, rotate: s * 10, scale: 0.72, y: 24, z: 0, dim: true }
  }
  // Both others sit on the far side, stacked close, nearer one on top
  const others = [...Array(count).keys()].filter((j) => j !== selected)
  const rank = side < 0 ? others.indexOf(i) : others.length - 1 - others.indexOf(i) // 0 = next to the picked card
  const dir = side < 0 ? 1 : -1
  return { x: dir * (48 + rank * 60), rotate: dir * (6 + rank * 5), scale: 0.72, y: 24 + rank * 4, z: 10 - rank, dim: true }
}

// A big single choice shown as overlapping, tilted cards with a graphic on
// each. The picked card becomes the visual center with a check.
export function CardFan<T extends string>({ options, value, onChange, className }: CardFanProps<T>) {
  const selected = options.findIndex((option) => option.id === value)

  return (
    <div role="radiogroup" className={cx('relative h-[230px]', className)}>
      {options.map((option, i) => {
        const pose = poseFor(i, options.length, selected)
        const isSelected = i === selected
        const style: CSSProperties = {
          transform: `translateX(-50%) translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotate}deg) scale(${pose.scale})`,
          zIndex: pose.z,
        }
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.id)}
            style={style}
            className={cx(
              'absolute left-1/2 top-2 flex aspect-[3/4] w-[140px] flex-col rounded-card bg-surface p-2.5 text-left shadow-float transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
              isSelected && 'ring-2 ring-brand',
              pose.dim && 'opacity-70',
            )}
          >
            <span className="relative flex flex-1 items-center justify-center rounded-tile bg-surface-muted text-ink-muted">
              {option.graphic}
              {isSelected && <CheckCircle checked className="absolute right-1.5 top-1.5" />}
            </span>
            <span
              className={cx(
                'pt-2 text-footnote font-medium text-ink transition-all',
                // In the open fan, side labels hug the outer edge so the overlap never covers them
                selected < 0 && i === 0 ? 'text-left' : selected < 0 && i === options.length - 1 ? 'text-right' : 'text-center',
              )}
            >{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
