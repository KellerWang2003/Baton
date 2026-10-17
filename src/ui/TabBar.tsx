import type { ReactNode } from 'react'
import { cx } from './cx'
import { PlusIcon } from './icons'

export type TabItem = {
  id: string
  label: string
  icon?: ReactNode
}

type TabBarProps = {
  tabs: TabItem[]
  active?: string
  onSelect: (id: string) => void
  onCapture: () => void
}

const glass = 'border border-line/70 bg-surface/75 shadow-float backdrop-blur-xl'

// iOS-style floating tab bar: the tabs sit in one capsule, and capture is its
// own round button beside it.
export function TabBar({ tabs, active, onSelect, onCapture }: TabBarProps) {
  return (
    <nav className="pointer-events-none flex items-center gap-3 px-4 pb-6">
      <div className={cx('pointer-events-auto flex flex-1 items-center rounded-full p-1', glass)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-current={tab.id === active ? 'page' : undefined}
            className={cx(
              'flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-semibold',
              tab.id === active ? 'bg-surface-muted text-ink' : 'text-ink-muted',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onCapture}
        aria-label="Capture"
        className={cx('pointer-events-auto inline-flex size-[62px] shrink-0 items-center justify-center rounded-full text-ink', glass)}
      >
        <PlusIcon />
      </button>
    </nav>
  )
}
