import { useEffect, useState } from 'react'
import { flow, stageLabels } from '../flow'
import type { Stage } from '../flow'

type DebugPanelProps = {
  index: number
  goTo: (index: number) => void
  framed: boolean
  toggleFrame: () => void
  kitOpen: boolean
  toggleKit: () => void
}

const stages: Stage[] = ['moving', 'newcomer', 'local']

// Team-only controls, not part of the app. Hidden by default: press ` (backtick)
// or add ?debug to the URL to open it. ← → move between screens and F toggles
// the phone frame even while the panel is closed.
export function DebugPanel({ index, goTo, framed, toggleFrame, kitOpen, toggleKit }: DebugPanelProps) {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).has('debug'))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '`') setOpen((value) => !value)
      else if (event.key === 'Escape') setOpen(false)
      else if (event.key === 'ArrowRight') goTo(index + 1)
      else if (event.key === 'ArrowLeft') goTo(index - 1)
      else if (event.key === 'f') toggleFrame()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo, toggleFrame])

  if (!open) return null

  return (
    <aside className="fixed bottom-4 left-4 z-50 flex max-h-[80vh] w-72 flex-col gap-3 overflow-y-auto rounded-card bg-surface p-3 font-body text-sm text-ink shadow-float">
      <header className="flex items-center justify-between">
        <p className="font-display font-bold">Debug</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close debug panel"
          className="inline-flex size-7 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
        >
          ×
        </button>
      </header>

      <div className="flex flex-col gap-1">
        <DebugToggle label="Phone frame" on={framed} onClick={toggleFrame} hint="F" />
        <DebugToggle label="Design system" on={kitOpen} onClick={toggleKit} />
      </div>

      <nav className="flex flex-col gap-2 border-t border-line pt-3">
        {stages.map((stage) => {
          const screens = flow.map((screen, i) => ({ screen, i })).filter(({ screen }) => screen.stage === stage)
          if (screens.length === 0) return null
          return (
            <div key={stage} data-stage={stage}>
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stage">{stageLabels[stage]}</p>
              {screens.map(({ screen, i }) => (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`block w-full rounded-control px-2 py-1.5 text-left hover:bg-surface-muted ${i === index && !kitOpen ? 'font-semibold text-ink' : 'text-ink-muted'}`}
                >
                  {String(i + 1).padStart(2, '0')} {screen.title}
                </button>
              ))}
            </div>
          )
        })}
      </nav>

      <p className="border-t border-line pt-2 text-xs text-ink-muted">` panel · ← → screens · F frame</p>
    </aside>
  )
}

function DebugToggle({ label, on, onClick, hint }: { label: string; on: boolean; onClick: () => void; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex items-center justify-between rounded-control px-2 py-1.5 hover:bg-surface-muted"
    >
      <span>
        {label}
        {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      </span>
      <span className={`flex h-5 w-9 items-center rounded-full p-0.5 ${on ? 'justify-end bg-ink' : 'justify-start bg-line'}`}>
        <span className="size-4 rounded-full bg-surface" />
      </span>
    </button>
  )
}
