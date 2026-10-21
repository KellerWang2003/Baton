import { goBack } from '../app/navigate'
import { cx } from './cx'
import { ArrowLeftIcon } from './icons'

type BackButtonProps = {
  // Defaults to going up to this screen's parent (`goBack()`); pass your own to
  // play an exit first (the opened Archive photo shrinks back onto the cloud)
  onClick?: () => void
  label?: string
  // Positions it on pages without a `Screen` nav, e.g. 'absolute top-1 left-4 z-10'
  className?: string
}

// The one back button (Keller, Oct 21): Figma's gray arrow.left in a 44pt round
// target, the same on every page. It goes up to the screen's parent in the IA.
export function BackButton({ onClick = () => goBack(), label = 'Back', className }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cx('flex size-11 shrink-0 items-center justify-center rounded-full text-wrap-faint active:opacity-50', className)}
    >
      <ArrowLeftIcon />
    </button>
  )
}
