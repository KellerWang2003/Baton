import { cx } from './cx'
import { CheckIcon } from './icons'

type PickCardProps = {
  title: string
  detail?: string
  picked: boolean
  onToggle: () => void
}

// A to-do she can pick, in Today's card style (Figma TODAY 334:11284): title
// and a line of detail, with a round check at the right that fills blue when
// picked, like the done check on Today's to-do cards. The card itself stays
// the same.
export function PickCard({ title, detail, picked, onToggle }: PickCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={picked}
      onClick={onToggle}
      className="flex min-h-[68px] w-full items-center gap-3 rounded-[16px] bg-today-panel px-4 py-3 text-left shadow-today-card transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-today-card font-medium text-ink">{title}</span>
        {detail && <span className="text-today-detail text-today-muted">{detail}</span>}
      </span>
      <span
        aria-hidden
        className={cx(
          'inline-flex size-[26px] shrink-0 items-center justify-center rounded-full transition',
          picked ? 'bg-baton-blue text-white' : 'border-[1.5px] border-baton-navy/25',
        )}
      >
        {picked && <CheckIcon />}
      </span>
    </button>
  )
}
