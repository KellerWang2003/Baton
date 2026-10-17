import { cx } from './cx'

export type TabItem = {
  id: string
  label: string
}

type TabBarProps = {
  tabs: TabItem[]
  active?: string
  onSelect: (id: string) => void
  onCapture: () => void
}

// Bottom navigation: the main tabs with the capture button in the middle.
export function TabBar({ tabs, active, onSelect, onCapture }: TabBarProps) {
  const middle = Math.ceil(tabs.length / 2)

  const renderTab = (tab: TabItem) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => onSelect(tab.id)}
      aria-current={tab.id === active ? 'page' : undefined}
      className={cx(
        'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold',
        tab.id === active ? 'text-ink' : 'text-ink-muted',
      )}
    >
      <span
        aria-hidden
        className={cx('size-6 rounded-control', tab.id === active ? 'bg-ink' : 'bg-surface-muted')}
      />
      {tab.label}
    </button>
  )

  return (
    <nav className="flex items-center border-t border-line bg-surface px-2 pb-6 pt-1">
      {tabs.slice(0, middle).map(renderTab)}
      <div className="flex flex-1 justify-center">
        <button
          type="button"
          onClick={onCapture}
          aria-label="Capture"
          className="inline-flex size-14 items-center justify-center rounded-full bg-brand text-3xl text-on-brand shadow-card"
        >
          +
        </button>
      </div>
      {tabs.slice(middle).map(renderTab)}
    </nav>
  )
}
