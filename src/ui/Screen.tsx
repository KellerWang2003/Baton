import type { ReactNode } from 'react'
import { cx } from './cx'
import { BackButton } from './BackButton'

type ScreenProps = {
  title?: string
  // Line under the large title, e.g. the rest of the greeting on Today
  subtitle?: string
  eyebrow?: string
  // Shows the shared BackButton; true goes up to the screen's parent
  onBack?: true | (() => void)
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
export function Screen({ title, subtitle, eyebrow, onBack, action, footer, children, className, background = 'bg-canvas', bleed = false }: ScreenProps) {
  return (
    <div className={cx('flex h-full flex-col transition-colors duration-500', background)}>
      {onBack && (
        // Lines the arrow up with the pages that float it (top-2 left-5)
        <nav className="flex h-14 shrink-0 items-center justify-between px-5 pt-2">
          <BackButton onClick={onBack === true ? undefined : onBack} />
          {action}
        </nav>
      )}
      {(title || eyebrow || (!onBack && action)) && (
        <header className={cx('flex items-end gap-2 px-gutter pb-2', onBack ? 'pt-0' : 'pt-3')}>
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="text-footnote font-medium text-stage">{eyebrow}</p>}
            {title && <h1 className="text-balance font-display text-large-title font-normal text-ink">{title}</h1>}
            {subtitle && <p className="font-display text-title-3 text-ink-muted">{subtitle}</p>}
          </div>
          {!onBack && action && <div className="pb-1">{action}</div>}
        </header>
      )}
      <main className={cx('min-w-0 flex-1', bleed ? 'flex flex-col overflow-hidden' : 'overflow-x-hidden overflow-y-auto px-gutter pb-6', className)}>{children}</main>
      {footer && <footer className="px-gutter pb-6 pt-3">{footer}</footer>}
    </div>
  )
}
