import { useState } from 'react'
import type { TodoKind } from '../data/onboarding'
import type { Tip } from '../data/today'
import { cx } from './cx'
import { CheckIcon, ChevronDownIcon } from './icons'
import { TodoKindIcon } from './TodoKindIcon'

type TodoCardProps = {
  kind: TodoKind
  title: string
  // e.g. "2 tips"
  subtitle?: string
  tips: Tip[]
  done: boolean
  onToggleDone: () => void
  copy: { markDone: string; markUndone: string; noTips: string }
}

// One of her picked to-dos on Today, in Today's card style: the category's
// round icon leading, the title, and a chevron that opens the card to show
// tips from people who did it before her, with a button to mark it done.
export function TodoCard({ kind, title, subtitle, tips, done, onToggleDone, copy }: TodoCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-[16px] bg-today-panel shadow-today-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <span className="relative">
          <TodoKindIcon kind={kind} size="lg" className={cx(done && 'opacity-40')} />
          {done && (
            <span className="absolute -right-1 -bottom-1 inline-flex size-[18px] items-center justify-center rounded-full bg-baton-blue text-white ring-2 ring-today-panel">
              <CheckIcon />
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className={cx('text-today-card font-medium', done ? 'text-ink-muted line-through' : 'text-ink')}>{title}</span>
          {subtitle && <span className="text-today-detail text-today-muted">{subtitle}</span>}
        </span>
        <span className={cx('text-today-muted transition-transform duration-300', open && 'rotate-180')}>
          <ChevronDownIcon />
        </span>
      </button>

      {/* Opens smoothly to its content's height */}
      <div className={cx('grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="min-h-0" inert={!open}>
          <div className="flex flex-col gap-2 px-4 pb-4">
            {tips.map((tip) => (
              <figure key={tip.text} className="flex flex-col gap-1 rounded-[12px] bg-surface/70 px-3.5 py-3">
                <blockquote className="text-callout text-ink">{tip.text}</blockquote>
                <figcaption className="text-today-detail text-today-muted">{tip.from}</figcaption>
              </figure>
            ))}
            {!tips.length && <p className="px-1 text-today-detail text-today-muted">{copy.noTips}</p>}
            <button
              type="button"
              onClick={onToggleDone}
              className="self-start rounded-full px-1 pt-1 text-subhead font-medium text-highlight active:opacity-50"
            >
              {done ? copy.markUndone : copy.markDone}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
