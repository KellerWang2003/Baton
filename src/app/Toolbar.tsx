import { useEffect, useState } from 'react'
import { flow, stageLabels } from '../flow'
import type { Stage } from '../flow'

type ToolbarProps = {
  index: number
  goTo: (index: number) => void
  framed: boolean
  toggleFrame: () => void
}

const stages: Stage[] = ['moving', 'newcomer', 'local']

// Prototype controls, not part of the app. Keys: ← → move between screens,
// F toggles the phone frame, M opens the screen list, H hides this bar.
export function Toolbar({ index, goTo, framed, toggleFrame }: ToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'ArrowRight') goTo(index + 1)
      else if (event.key === 'ArrowLeft') goTo(index - 1)
      else if (event.key === 'f') toggleFrame()
      else if (event.key === 'm') setMenuOpen((open) => !open)
      else if (event.key === 'h') setHidden((value) => !value)
      else if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo, toggleFrame])

  if (hidden) return null

  const current = flow[index]

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2 font-body text-sm">
      {menuOpen && (
        <nav className="max-h-[60vh] w-72 overflow-y-auto rounded-card bg-surface p-2 shadow-float">
          {stages.map((stage) => {
            const screens = flow.map((screen, i) => ({ screen, i })).filter(({ screen }) => screen.stage === stage)
            if (screens.length === 0) return null
            return (
              <div key={stage} data-stage={stage} className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-stage">
                  {stageLabels[stage]}
                </p>
                {screens.map(({ screen, i }) => (
                  <button
                    key={screen.id}
                    type="button"
                    onClick={() => {
                      goTo(i)
                      setMenuOpen(false)
                    }}
                    className={`block w-full rounded-control px-2 py-1.5 text-left hover:bg-surface-muted ${i === index ? 'font-semibold text-ink' : 'text-ink-muted'}`}
                  >
                    {String(i + 1).padStart(2, '0')} {screen.title}
                  </button>
                ))}
              </div>
            )
          })}
        </nav>
      )}
      <div className="flex items-center gap-1 rounded-full bg-ink p-1 text-surface shadow-float">
        <ToolbarButton label="Previous screen (←)" onClick={() => goTo(index - 1)} disabled={index === 0}>
          ‹
        </ToolbarButton>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          title="Screen list (M)"
          className="max-w-56 truncate rounded-full px-3 py-1.5 hover:bg-surface/10"
        >
          {index + 1}/{flow.length} · {current.title}
        </button>
        <ToolbarButton
          label="Next screen (→)"
          onClick={() => goTo(index + 1)}
          disabled={index === flow.length - 1}
        >
          ›
        </ToolbarButton>
        <button
          type="button"
          onClick={toggleFrame}
          title="Toggle phone frame (F)"
          className="rounded-full px-3 py-1.5 hover:bg-surface/10"
        >
          {framed ? 'Frame on' : 'Frame off'}
        </button>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-8 items-center justify-center rounded-full text-lg hover:bg-surface/10 disabled:opacity-30"
    >
      {children}
    </button>
  )
}
