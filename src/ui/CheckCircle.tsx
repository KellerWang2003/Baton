import { cx } from './cx'
import { CheckIcon } from './icons'

// iOS selection circle: empty ring, or a filled tint circle with a checkmark.
// Used as the leading element of selectable or completable list rows.
export function CheckCircle({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition',
        checked ? 'border-brand bg-brand text-on-brand' : 'border-line',
        className,
      )}
    >
      {checked && <CheckIcon />}
    </span>
  )
}
