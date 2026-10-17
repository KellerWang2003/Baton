import type { ReactNode } from 'react'
import { cx } from './cx'
import { ChevronRightIcon } from './icons'

type ListSectionProps = {
  header?: string
  footer?: string
  children: ReactNode
  className?: string
}

// iOS inset grouped list: a rounded white group of rows on the gray background,
// with an optional small caps header and a footnote below.
export function ListSection({ header, footer, children, className }: ListSectionProps) {
  return (
    <section className={cx('flex flex-col gap-1.5', className)}>
      {header && <h2 className="px-4 text-footnote uppercase text-ink-muted">{header}</h2>}
      <div className="overflow-hidden rounded-card bg-surface [&>*:first-child_[data-row-body]]:border-t-0">
        {children}
      </div>
      {footer && <p className="px-4 text-footnote text-ink-muted">{footer}</p>}
    </section>
  )
}

type ListRowProps = {
  title: string
  subtitle?: string
  value?: string
  leading?: ReactNode
  chevron?: boolean
  onClick?: () => void
}

// One row in a ListSection. Rows after the first get an inset hairline on top
// (the section removes it from the first row).
export function ListRow({ title, subtitle, value, leading, chevron = false, onClick }: ListRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 pl-4 text-left active:bg-surface-muted"
    >
      {leading}
      <div data-row-body className="flex min-h-11 flex-1 items-center gap-2 border-t border-line/70 py-2.5 pr-4">
        <div className="min-w-0 flex-1">
          <p className="text-body text-ink">{title}</p>
          {subtitle && <p className="text-subhead text-ink-muted">{subtitle}</p>}
        </div>
        {value && <span className="text-body text-ink-muted">{value}</span>}
        {chevron && (
          <span className="text-line">
            <ChevronRightIcon />
          </span>
        )}
      </div>
    </Tag>
  )
}
