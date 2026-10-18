import type { ReactNode } from 'react'
import { cx } from './cx'

type ItemCardProps = {
  title: string
  subtitle?: string
  // Small caps label above the title, e.g. "Suggested"
  eyebrow?: string
  // Thumbnail on the left: a gray placeholder until real photos exist
  thumbnail?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  done?: boolean
  // stage: tinted with the stage color, for the one card that needs attention
  tone?: 'default' | 'stage'
  onClick?: () => void
}

// A content card in a vertical list (e.g. "Before you leave" on Today): an
// optional thumbnail or leading control, title and detail, and a trailing control.
export function ItemCard({ title, subtitle, eyebrow, thumbnail = false, leading, trailing, done = false, tone = 'default', onClick }: ItemCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cx('flex items-center gap-3 rounded-card p-3', tone === 'stage' ? 'bg-stage/12' : 'bg-surface shadow-card', onClick && 'active:opacity-80')}
    >
      {leading}
      {thumbnail && <div aria-hidden className="size-16 shrink-0 rounded-tile bg-placeholder" />}
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-caption font-semibold uppercase text-ink-muted">{eyebrow}</p>}
        <p className={cx('text-headline font-semibold', done ? 'text-ink-muted line-through' : 'text-ink')}>{title}</p>
        {subtitle && <p className="text-subhead text-ink-muted">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  )
}
