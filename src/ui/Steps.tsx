import { cx } from './cx'

// Page dots for a short multi-step flow like onboarding. The current step is a
// wider tint capsule.
export function Steps({ count, current, className }: { count: number; current: number; className?: string }) {
  return (
    <div className={cx('flex items-center gap-1.5', className)} aria-label={`Step ${current + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cx('h-1.5 rounded-full transition-all', i === current ? 'w-5 bg-brand' : 'w-1.5', i < current && 'bg-brand/40', i > current && 'bg-line')}
        />
      ))}
    </div>
  )
}
