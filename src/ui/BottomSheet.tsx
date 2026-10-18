import type { ReactNode } from 'react'
import { cx } from './cx'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  // medium: about half the screen, large: almost full height (iOS detents)
  detent?: 'medium' | 'large'
  action?: ReactNode
  children: ReactNode
}

// iOS bottom sheet: slides up over a dimmed screen, with a grabber, a centered
// title, Close on the left and an optional action on the right. Tapping the
// dimmed area closes it. Covers the nearest positioned ancestor (the app screen).
export function BottomSheet({ open, onClose, title, detent = 'medium', action, children }: BottomSheetProps) {
  return (
    <div className={cx('absolute inset-0 z-40 flex flex-col justify-end overflow-hidden', !open && 'pointer-events-none')} inert={!open}>
      <div
        onClick={onClose}
        className={cx('absolute inset-0 bg-scrim transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative flex flex-col rounded-t-sheet bg-canvas shadow-float transition-transform duration-300 ease-out',
          detent === 'large' ? 'h-[92%]' : 'h-[50%]',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto mt-1.5 h-[5px] w-9 shrink-0 rounded-full bg-line" />
        <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center px-4 pb-2 pt-2">
          <button type="button" onClick={onClose} className="justify-self-start text-body text-brand active:opacity-50">
            Close
          </button>
          <h2 className="text-headline font-semibold text-ink">{title}</h2>
          <div className="justify-self-end">{action}</div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
      </div>
    </div>
  )
}
