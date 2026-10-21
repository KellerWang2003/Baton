import { goBack } from '../app/navigate'
import { cx } from './cx'
import { ArrowLeftIcon } from './icons'

type BackButtonProps = {
  // Defaults to going up to this screen's parent (`goBack()`); pass your own to
  // play an exit first (the opened Archive photo shrinks back onto the cloud)
  onClick?: () => void
  label?: string
  // Positions it on pages without a `Screen` nav, e.g. 'absolute top-2 left-5 z-10'
  className?: string
}

// The one back button (Keller, Oct 21): Figma's arrow.left, in navy and a little
// bigger than Figma's gray one so it reads (Keller: more visible, more room), in
// a 48pt round target 20pt in and 8pt down. It goes up to the screen's parent.
export function BackButton({ onClick = () => goBack(), label = 'Back', className }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cx(
        'flex size-12 shrink-0 items-center justify-center rounded-full text-ink active:opacity-50',
        className,
      )}
    >
      <ArrowLeftIcon className="h-[17px] w-[21px]" />
    </button>
  )
}
