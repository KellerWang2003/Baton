import type { ReactNode } from 'react'
import { cx } from './cx'

type CardRowProps = {
  header?: string
  // Small trailing text next to the header, e.g. "1 of 4"
  detail?: string
  children: ReactNode
  className?: string
}

// A titled row of cards that scrolls sideways and snaps, running to the screen
// edges (cancels the Screen's side padding) so the next card peeks in.
export function CardRow({ header, detail, children, className }: CardRowProps) {
  return (
    <section className={cx('flex flex-col gap-1.5', className)}>
      {header && (
        <div className="flex items-baseline justify-between px-4">
          <h2 className="text-footnote uppercase text-ink-muted">{header}</h2>
          {detail && <span className="text-footnote text-ink-muted">{detail}</span>}
        </div>
      )}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none]">
        {children}
      </div>
    </section>
  )
}
