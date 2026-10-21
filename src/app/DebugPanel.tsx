import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { flow, stageLabels } from '../flow'
import type { Stage } from '../flow'
import { stageNames } from '../data/stages'
import { cx } from '../ui'
import { archiveDirections } from '../data/archiveSketches'
import { dailyPrompts } from '../data/pages'
import { frameLimits } from './useFrameSize'
import type { FrameSettings } from './useFrameSize'
import { changeStage, setState, useStatus, useStore } from './store'
import { clearSavedCaptures } from './supabase'

type DebugPanelProps = {
  index: number
  goTo: (index: number) => void
  framed: boolean
  toggleFrame: () => void
  frame: FrameSettings
  updateFrame: (patch: Partial<FrameSettings>) => void
  joystick: boolean
  toggleJoystick: () => void
  lockRatio: boolean
  toggleLockRatio: () => void
  backgroundColor: string | null
  setBackgroundColor: (color: string | null) => void
  kitOpen: boolean
  toggleKit: () => void
  mapsOpen: boolean
  toggleMaps: () => void
  motionOpen: boolean
  toggleMotion: () => void
  looksOpen: boolean
  toggleLooks: () => void
  todayLooksOpen: boolean
  toggleTodayLooks: () => void
  archiveMockOpen: boolean
  toggleArchiveMock: () => void
  sketchesOpen: boolean
  toggleSketches: () => void
  archiveIdeasOpen: boolean
  toggleArchiveIdeas: () => void
  collageOpen: boolean
  toggleCollage: () => void
}

const stages: Stage[] = ['moving', 'newcomer', 'local']
const debugTabs = ['Recording', 'Demo', 'Playgrounds'] as const
type DebugTab = (typeof debugTabs)[number]

type Position = { x: number; y: number }

// Drag something by a handle and remember where it lands (per key). A press
// that barely moves still counts as a click.
function useDraggable(key: string) {
  const [position, setPosition] = useState<Position | null>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? 'null')
      return typeof saved?.x === 'number' && typeof saved?.y === 'number' ? saved : null
    } catch {
      return null
    }
  })
  const drag = useRef<{ el: HTMLElement; dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null)
  const last = useRef(position)
  const moved = useRef(false)

  const handlers = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      const el = event.currentTarget.closest<HTMLElement>('[data-draggable]')
      if (!el || event.button !== 0) return
      // Inside the handle, other buttons (like close) keep working
      if (event.currentTarget !== event.target && (event.target as HTMLElement).closest('button') !== event.currentTarget.closest('button')) return
      const rect = el.getBoundingClientRect()
      drag.current = { el, dx: event.clientX - rect.left, dy: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false }
      moved.current = false
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const d = drag.current
      if (!d) return
      const el = d.el
      if (!d.moved && Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < 5) return
      d.moved = true
      const next = {
        x: Math.min(Math.max(0, event.clientX - d.dx), Math.max(0, window.innerWidth - el.offsetWidth)),
        y: Math.min(Math.max(0, event.clientY - d.dy), Math.max(0, window.innerHeight - el.offsetHeight)),
      }
      last.current = next
      setPosition(next)
    },
    onPointerUp: () => {
      if (!drag.current) return
      moved.current = drag.current.moved
      drag.current = null
      if (!moved.current) return
      try {
        localStorage.setItem(key, JSON.stringify(last.current))
      } catch {
        // not remembered
      }
    },
  }
  const style = position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined
  // Read in onClick: true when the press was a drag, not a tap
  const wasDragged = () => moved.current
  return { style, handlers: { ...handlers, onPointerCancel: handlers.onPointerUp }, wasDragged }
}

function readTab(): DebugTab {
  try {
    const saved = localStorage.getItem('debugTab')
    return debugTabs.find((name) => name === saved) ?? 'Recording'
  } catch {
    return 'Recording'
  }
}

// Team-only controls, not part of the app. Closed by default: open it from the
// Debug button (framed) or the left-edge tab (responsive), press ` (backtick),
// or add ?debug to the URL. ← → move between screens, 1 2 3 set Chloe's stage
// and F toggles the phone frame even while the panel is closed.
export function DebugPanel({ index, goTo, framed, toggleFrame, frame, updateFrame, joystick, toggleJoystick, lockRatio, toggleLockRatio, backgroundColor, setBackgroundColor, kitOpen, toggleKit, mapsOpen, toggleMaps, motionOpen, toggleMotion, looksOpen, toggleLooks, todayLooksOpen, toggleTodayLooks, archiveIdeasOpen, toggleArchiveIdeas, collageOpen, toggleCollage, archiveMockOpen, toggleArchiveMock, sketchesOpen, toggleSketches }: DebugPanelProps) {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).has('debug'))
  const [tab, setTab] = useState<DebugTab>(readTab)
  const panel = useDraggable('debugPosition')
  const launcher = useDraggable('debugLauncherPosition')
  const chooseTab = (next: DebugTab) => {
    setTab(next)
    try {
      localStorage.setItem('debugTab', next)
    } catch {
      // not remembered
    }
  }
  const status = useStatus()
  const { onboardingPhotoAccess, hideNav, hideStatusBar } = useStore()

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
      else if (['1', '2', '3'].includes(event.key)) changeStage(stages[Number(event.key) - 1])
    }
    // On a phone: swipe right from the left edge
    let swipe: { x: number; y: number } | null = null
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      swipe = touch.clientX < 24 ? { x: touch.clientX, y: touch.clientY } : null
    }
    const onTouchMove = (event: TouchEvent) => {
      if (!swipe) return
      const touch = event.touches[0]
      if (touch.clientX - swipe.x > 40 && Math.abs(touch.clientY - swipe.y) < 40) {
        swipe = null
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [index, goTo, toggleFrame])

  if (!open) {
    // A small black button you can drag anywhere (kept out of the app's way);
    // a tap opens the panel. On a phone, a swipe in from the left edge works too.
    return (
      <button
        data-draggable
        type="button"
        {...launcher.handlers}
        onClick={() => !launcher.wasDragged() && setOpen(true)}
        style={launcher.style}
        title="Open debug panel (`). Drag to move."
        className="fixed bottom-4 left-4 z-50 touch-none select-none rounded-full bg-ink px-4 py-2 font-body text-sm font-semibold text-surface shadow-float hover:opacity-90 max-[500px]:px-3 max-[500px]:py-3"
      >
        Debug
      </button>
    )
  }

  return (
    <aside
      data-draggable
      style={panel.style}
      className="fixed bottom-4 left-4 z-50 flex max-h-[85vh] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-card bg-surface font-body text-sm text-ink shadow-float"
    >
      <div className="flex flex-col gap-3 border-b border-line p-3">
        <header
          {...panel.handlers}
          title="Drag to move"
          className="-m-3 flex cursor-grab touch-none select-none items-center justify-between p-3 active:cursor-grabbing"
        >
          <p className="font-display text-base font-bold">
            Debug <span aria-hidden className="ml-1 text-ink-faint">⠿</span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close debug panel"
            className="inline-flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
          >
            ×
          </button>
        </header>

        {/* Chloe's stage: Today, Archive, Community and Profile follow it */}
        <div className="flex flex-col gap-2">
          <div role="radiogroup" aria-label="Chloe's stage" className="flex gap-1 rounded-full bg-surface-muted p-0.5">
            {stages.map((stage) => (
              <button
                key={stage}
                type="button"
                role="radio"
                aria-checked={status === stage}
                data-stage={stage}
                onClick={() => changeStage(stage)}
                className={cx(
                  'flex-1 rounded-full px-2 py-1 text-xs font-semibold transition',
                  status === stage ? 'bg-stage text-on-stage' : 'text-ink hover:bg-surface',
                )}
              >
                {stageNames[stage]}
              </button>
            ))}
          </div>
          <select
            aria-label="Go to screen"
            value={index}
            onChange={(event) => goTo(Number(event.target.value))}
            className="w-full truncate rounded-control bg-surface-muted px-2.5 py-2 text-xs font-semibold"
          >
            {stages.map((stage) => {
              const screens = flow.map((screen, i) => ({ screen, i })).filter(({ screen }) => screen.stage === stage && screen.id !== 'intentions-video' && (onboardingPhotoAccess || screen.id !== 'photos'))
              if (screens.length === 0) return null
              return (
                <optgroup key={stage} label={stageLabels[stage]}>
                  {screens.map(({ screen, i }) => (
                    <option key={screen.id} value={i}>
                      {String(i + 1).padStart(2, '0')} {screen.title}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </div>

        <div role="tablist" aria-label="Debug sections" className="-mb-3 flex gap-4">
          {debugTabs.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => chooseTab(name)}
              className={cx(
                'border-b-2 pb-2 text-xs font-semibold transition',
                tab === name ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
        {tab === 'Recording' && (
          <>
            <Group title="Phone">
              <DebugToggle label="Phone frame" on={framed} onClick={toggleFrame} hint="F" />
              <DebugToggle label="Lock aspect ratio" on={lockRatio} onClick={toggleLockRatio} />
              {framed && (
                <div className="flex flex-col gap-2 px-2 py-2">
                  <div role="radiogroup" aria-label="Frame preset" className="flex gap-1 rounded-full bg-surface p-0.5">
                    {(['iphone', 'custom'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        role="radio"
                        aria-checked={frame.preset === preset}
                        onClick={() => updateFrame({ preset })}
                        className={cx('flex-1 rounded-full px-2 py-1 text-xs font-semibold transition', frame.preset === preset ? 'bg-ink text-surface' : 'text-ink hover:bg-surface-muted')}
                      >
                        {preset === 'iphone' ? 'iPhone' : 'Custom'}
                      </button>
                    ))}
                  </div>
                  {frame.preset === 'custom' && (
                    <>
                      <div className="flex items-center gap-2 text-xs">
                        <SizeInput label="W" value={frame.width} onChange={(width) => updateFrame({ width })} />
                        <SizeInput label="H" value={frame.height} onChange={(height) => updateFrame({ height })} />
                        <button type="button" aria-label="Swap width and height" onClick={() => updateFrame({ width: frame.height, height: frame.width })} className="rounded-control bg-surface px-2 py-1 font-semibold hover:bg-line">⇄</button>
                      </div>
                      <div className="flex gap-1">
                        {[['Phone', 402, 874], ['Tablet', 820, 1180], ['Wide', 1280, 800]].map(([name, width, height]) => (
                          <button key={name} type="button" onClick={() => updateFrame({ width: Number(width), height: Number(height) })} className="flex-1 rounded-control bg-surface px-1 py-1 text-xs font-semibold hover:bg-line">{name}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Group>

            <Group title="While filming">
              <DebugToggle label="Scroll joystick" on={joystick} onClick={toggleJoystick} />
              <DebugToggle label="Hide navigation" on={hideNav} onClick={() => setState({ hideNav: !hideNav })} />
              <DebugToggle label="Hide status bar" on={hideStatusBar} onClick={() => setState({ hideStatusBar: !hideStatusBar })} />
            </Group>

            <Group title="Background" note="Outside the phone frame. Close Debug with ` before recording.">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <input
                  type="color"
                  aria-label="Background color"
                  value={backgroundColor ?? getComputedStyle(document.documentElement).getPropertyValue('--color-backdrop').trim()}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="h-7 w-10 cursor-pointer rounded-control bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--color-recording-green').trim())}
                  className="flex-1 rounded-control bg-surface px-2 py-1.5 text-xs font-semibold hover:bg-line"
                >
                  Green screen
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundColor(null)}
                  className="rounded-control bg-surface px-2 py-1.5 text-xs font-semibold hover:bg-line"
                >
                  Reset
                </button>
              </div>
            </Group>

        </>
        )}

        {tab === 'Demo' && (
          <>
            <Group title="Today">
              <PromptPicker />
            </Group>
            <Group title="Archive direction">
              <ArchiveDirectionPicker goToArchive={() => goTo(flow.findIndex((screen) => screen.id === 'archive'))} />
            </Group>
            <Group title="Real-life" note="Live camera, then write a line about it. The camera needs https (the Vercel link) or localhost. On a phone, open the link with ?real-life#/today.">
              <RealLife goToToday={() => goTo(flow.findIndex((screen) => screen.id === 'today'))} />
            </Group>
          </>
        )}

        {tab === 'Playgrounds' && (
          <Group title="Playgrounds" note="Each one opens over the app. Close it from here or with ×.">
            {[
              ['Design system', kitOpen, toggleKit],
              ['Brand collage', collageOpen, toggleCollage],
              ['Map looks', mapsOpen, toggleMaps],
              ['Relay looks', looksOpen, toggleLooks],
              ['Relay entrances', motionOpen, toggleMotion],
              ['Today looks', todayLooksOpen, toggleTodayLooks],
              ['Archive sketches', sketchesOpen, toggleSketches],
              ['Archive ideas', archiveIdeasOpen, toggleArchiveIdeas],
              ['3D proto', archiveMockOpen, toggleArchiveMock],
            ].map(([label, isOpen, toggle]) => (
              <PlaygroundLink key={label as string} label={label as string} open={isOpen as boolean} onClick={toggle as () => void} />
            ))}
          </Group>
        )}
      </div>

      <p className="border-t border-line px-3 py-2 text-xs text-ink-muted">` panel · ← → screens · 1 2 3 stage · F frame</p>
    </aside>
  )
}

// A titled card of related controls; rows inside are separated by hairlines.
function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-control bg-surface-muted">{children}</div>
      {note && <p className="px-1 text-xs text-ink-muted">{note}</p>}
    </section>
  )
}

function SizeInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-1 items-center gap-1 font-semibold text-ink-muted">
      {label}
      <input
        type="number"
        min={frameLimits.min}
        max={frameLimits.max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full min-w-0 rounded-control bg-surface-muted px-1.5 py-1 font-normal text-ink"
      />
    </label>
  )
}

function DebugToggle({ label, on, onClick, hint }: { label: string; on: boolean; onClick: () => void; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex items-center justify-between px-2 py-2 text-left hover:bg-line"
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

// An entrance to a playground: opens it over the app, or closes it if it's showing
function PlaygroundLink({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-between px-2 py-2 text-left hover:bg-line">
      <span className={cx(open && 'font-semibold')}>{label}</span>
      <span className="text-xs text-ink-muted">{open ? 'Close ×' : 'Open →'}</span>
    </button>
  )
}

// Another direction in place of the real Archive tab's folders, for the
// video's explorations part (picking one jumps there): the scrubbable photo
// wall (from the Archive ideas) or a wireframe direction from the Archive
// sketches
// Real-life: for filming someone using the app for real on a phone. Today
// asks for a photo of their school building, the orb opens the live camera
// (with a back arrow), and the photo goes on to a page to write a line about it
function RealLife({ goToToday }: { goToToday: () => void }) {
  const { realLife } = useStore()
  return (
    <>
      <DebugToggle
        label="Today: photo of your school"
        on={realLife}
        onClick={() => {
          setState({ realLife: !realLife, camera: null })
          if (!realLife) goToToday()
        }}
      />
      <button
        type="button"
        onClick={() => void clearSavedCaptures()}
        className="m-1.5 self-start rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold hover:bg-line"
      >
        Clear my saved captures
      </button>
    </>
  )
}

function ArchiveDirectionPicker({ goToArchive }: { goToArchive: () => void }) {
  const { archiveSketch, archiveWall } = useStore()
  const options = [
    { key: 'off', label: 'Off', sketch: null, wall: false },
    { key: 'wall', label: 'Photo wall', sketch: null, wall: true },
    ...archiveDirections.map((direction) => ({ key: direction.id, label: direction.label, sketch: direction.id, wall: false })),
  ]
  return (
    <div className="p-1.5">
      <div role="radiogroup" aria-label="Archive direction" className="flex flex-wrap gap-1 rounded-[14px] bg-surface p-0.5">
        {options.map((option) => {
          const on = archiveSketch === option.sketch && archiveWall === option.wall
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setState({ archiveSketch: option.sketch, archiveWall: option.wall })
                goToArchive()
              }}
              className={cx(
                'flex-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold transition',
                on ? 'bg-ink text-surface' : 'text-ink hover:bg-surface-muted',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Which of her stage's prototype prompts Today shows.
function PromptPicker() {
  const status = useStatus()
  const { promptIndex } = useStore()
  const prompts = dailyPrompts[status]
  return (
    <label className="flex flex-col gap-1 p-2">
      <span className="text-xs text-ink-muted">Prompt</span>
      <select
        value={promptIndex % prompts.length}
        onChange={(event) => setState({ promptIndex: Number(event.target.value) })}
        className="w-full truncate rounded-control bg-surface px-2 py-1.5 text-xs"
      >
        {prompts.map((prompt, i) => (
          <option key={`${status}-${i}`} value={i}>
            {prompt.question}
          </option>
        ))}
      </select>
    </label>
  )
}
