import type { ReactNode } from 'react'
import { cx } from './cx'
import { ChevronLeftIcon } from './icons'

type ScreenProps = {
  title?: string
  eyebrow?: string
  onBack?: () => void
  backLabel?: string
  // false for modal-style pages, where the left button reads Cancel
  backChevron?: boolean
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  // Page background class, e.g. bg-stage-bg for a stage-themed page
  background?: string
  // Full-bleed body without horizontal or bottom padding
  bleed?: boolean
}

// Layout for one app screen in the iOS style: a navigation bar (back button and
// trailing action), a large title, a scrolling body and an optional pinned footer.
// Fills its container, so it works inside the phone frame and full-screen.
export function Screen({ title, eyebrow, onBack, backLabel = 'Back', backChevron = true, action, footer, children, className, background = 'bg-canvas', bleed = false }: ScreenProps) {
  return (
    <div className={cx('flex h-full flex-col transition-colors duration-500', background)}>
      {onBack && (
        <nav className="flex h-11 shrink-0 items-center justify-between px-2">
          <button
            type="button"
            onClick={onBack}
            className={cx(
              'inline-flex items-center gap-0.5 rounded-full py-1 pr-2 text-body text-brand active:opacity-50',
              !backChevron && 'pl-2',
            )}
          >
            {backChevron && <ChevronLeftIcon />}
            {backLabel}
          </button>
          {action}
        </nav>
      )}
      {(title || eyebrow) && (
        <header className={cx('flex items-end gap-2 px-4 pb-2', onBack ? 'pt-0' : 'pt-3')}>
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="text-footnote font-semibold uppercase text-stage">{eyebrow}</p>}
            {title && <h1 className="truncate font-display text-large-title font-bold text-ink">{title}</h1>}
          </div>
          {!onBack && action && <div className="pb-1">{action}</div>}
        </header>
      )}
      <main className={cx('flex-1', bleed ? 'flex flex-col overflow-hidden' : 'overflow-y-auto px-4 pb-6', className)}>{children}</main>
      {footer && <footer className="px-4 pb-6 pt-3">{footer}</footer>}
    </div>
  )
}
