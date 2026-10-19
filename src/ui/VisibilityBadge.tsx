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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium',
        visibility === 'private'
          ? 'bg-surface-muted text-ink-muted'
          : 'bg-brand/15 text-brand',
        className,
      )}
    >
      {visibility === 'private' ? 'Private archive' : 'Community'}
    </span>
  )
}
