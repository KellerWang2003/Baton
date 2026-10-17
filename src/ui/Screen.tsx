import type { ReactNode } from 'react'
import { cx } from './cx'

type ScreenProps = {
  title?: string
  eyebrow?: string
  onBack?: () => void
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

// Layout for one app screen: header, scrolling body, optional pinned footer.
// Fills its container, so it works inside the phone frame and full-screen.
export function Screen({ title, eyebrow, onBack, action, footer, children, className }: ScreenProps) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      {(title || onBack || action) && (
        <header className="flex items-center gap-2 px-4 pb-2 pt-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="-ml-2 inline-flex size-10 items-center justify-center rounded-full text-2xl text-ink hover:bg-surface-muted"
            >
              ‹
            </button>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-stage">{eyebrow}</p>}
            {title && <h1 className="truncate font-display text-2xl font-bold text-ink">{title}</h1>}
          </div>
          {action}
        </header>
      )}
      <main className={cx('flex-1 overflow-y-auto px-4 pb-6', className)}>{children}</main>
      {footer && <footer className="border-t border-line bg-surface px-4 pb-6 pt-3">{footer}</footer>}
    </div>
  )
}
