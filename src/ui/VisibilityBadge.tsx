import { cx } from './cx'

type VisibilityBadgeProps = {
  visibility: 'private' | 'community'
  className?: string
}

// Shows who can see a piece of content: only you, or the community.
export function VisibilityBadge({ visibility, className }: VisibilityBadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        visibility === 'private'
          ? 'border border-dashed border-line text-ink-muted'
          : 'bg-ink text-surface',
        className,
      )}
    >
      {visibility === 'private' ? 'Private archive' : 'Community'}
    </span>
  )
}
