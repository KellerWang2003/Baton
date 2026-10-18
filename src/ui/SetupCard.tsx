import type { ReactNode } from 'react'
import { CheckCircle } from './CheckCircle'
import { cx } from './cx'

type SetupCardProps = {
  icon: ReactNode
  title: string
  subtitle: string
  done?: boolean
  onClick?: () => void
}

// One step in the "Finish setting up" row on Today: a small card with an icon,
// a title and a line of detail. Done cards stay in the row, checked and dimmed.
export function SetupCard({ icon, title, subtitle, done = false, onClick }: SetupCardProps) {
  return (
    <button
      type="button"
      onClick={done ? undefined : onClick}
      disabled={done}
      className={cx(
        'flex w-[44%] min-w-36 shrink-0 snap-start flex-col gap-6 rounded-card bg-surface p-4 text-left shadow-card transition active:scale-[0.98]',
        done && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-stage/12 text-stage">{icon}</span>
        <CheckCircle checked={done} />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className={cx('text-headline font-semibold', done ? 'text-ink-muted line-through' : 'text-ink')}>{title}</p>
        <p className="text-footnote text-ink-muted">{subtitle}</p>
      </div>
    </button>
  )
}
