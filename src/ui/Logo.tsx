import { cx } from './cx'

// Placeholder Baton logo: the baton mark (a tilted capsule made of segments)
// and the lowercase wordmark. Grayscale until the real logo file lands.
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-3 text-ink', className)}>
      <BatonMark />
      <span className="font-display text-[44px] font-bold leading-none tracking-tight">baton</span>
    </div>
  )
}

export function BatonMark({ className }: { className?: string }) {
  // A capsule cut into three segments, tilted like a baton mid-handoff
  return (
    <svg viewBox="0 0 56 56" aria-hidden className={cx('size-14', className)}>
      <defs>
        <clipPath id="baton-capsule">
          <rect x="4" y="21" width="48" height="14" rx="7" />
        </clipPath>
      </defs>
      <g transform="rotate(-35 28 28)" clipPath="url(#baton-capsule)" fill="currentColor">
        <rect x="4" y="21" width="15" height="14" />
        <rect x="20.5" y="21" width="15" height="14" opacity="0.45" />
        <rect x="37" y="21" width="15" height="14" />
      </g>
    </svg>
  )
}
