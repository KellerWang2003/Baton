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
// a title and a line of detail. The dashed outline marks it as temporary, not
// part of the usual Today. Done cards stay in the row, checked and dimmed.
export function SetupCard({ icon, title, subtitle, done = false, onClick }: SetupCardProps) {
  return (
    <button
      type="button"
      onClick={done ? undefined : onClick}
      disabled={done}
      aria-label={`${title}${done ? ', completed' : ''}`}
      className={cx(
        'flex h-[177px] w-[163px] min-w-36 shrink-0 snap-start flex-col gap-6 rounded-card border-[1.5px] border-dashed border-line bg-surface/60 p-4 text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        done && 'opacity-60',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-baton-blue/20 text-stage">{icon}</span>
        <CheckCircle checked={done} />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className={cx('text-headline font-semibold', done ? 'text-ink-muted line-through' : 'text-ink')}>{title}</p>
        <p className="text-footnote text-ink-muted">{subtitle}</p>
      </div>
    </button>
  )
}
