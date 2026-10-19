import type { ReactNode } from 'react'
import { CheckCircle } from './CheckCircle'
import { cx } from './cx'

// Colors of the round icon (Figma TODAY 334:10047: Instagram blue, to-dos
// pink, leave date olive)
const tones = {
  blue: 'bg-baton-blue text-white',
  pink: 'bg-baton-pink text-baton-navy',
  olive: 'bg-baton-olive text-white',
}

type SetupCardProps = {
  icon: ReactNode
  tone?: keyof typeof tones
  title: string
  subtitle: string
  done?: boolean
  onClick?: () => void
}

// One step in the "Finish setting up" row on Today (Figma TODAY 334:11111): a
// 163pt square card with a round icon, a title and a line of detail. Done
// cards stay in the row, checked and dimmed.
export function SetupCard({ icon, tone = 'blue', title, subtitle, done = false, onClick }: SetupCardProps) {
  return (
    <button
      type="button"
      onClick={done ? undefined : onClick}
      disabled={done}
      aria-label={`${title}${done ? ', completed' : ''}`}
      className={cx(
        'flex size-[163px] shrink-0 snap-start flex-col gap-[13px] rounded-tile bg-today-panel p-4 text-left shadow-setup-card transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        done && 'opacity-60',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cx('inline-flex size-10 items-center justify-center rounded-full', tones[tone])}>{icon}</span>
        {done && <CheckCircle checked />}
      </div>
      <div className="flex flex-col gap-1">
        <p className={cx('text-today-card font-medium', done ? 'text-ink-muted line-through' : 'text-ink')}>{title}</p>
        <p className="text-today-detail text-today-muted">{subtitle}</p>
      </div>
    </button>
  )
}
