import { cx } from './cx'

type Segment<T extends string> = {
  id: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[]
  value: T
  onChange: (id: T) => void
  className?: string
}

// iOS segmented control: a gray track with a raised white knob on the selected
// segment. Use it as the sub nav inside a tab (e.g. My archive / Legacy).
export function SegmentedControl<T extends string>({ segments, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className={cx('flex h-8 rounded-full bg-surface-muted p-0.5', className)}>
      {segments.map((segment) => (
        <button
          key={segment.id}
          type="button"
          role="tab"
          aria-selected={segment.id === value}
          onClick={() => onChange(segment.id)}
          className={cx(
            'flex-1 truncate rounded-full px-2 text-footnote transition',
            segment.id === value ? 'bg-surface font-medium text-ink shadow-thumb' : 'font-medium text-ink',
          )}
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
