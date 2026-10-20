import { useEffect, useState } from 'react'
import { flow, stageLabels } from '../flow'
import type { Stage } from '../flow'
import { stageNames } from '../data/stages'
import { confettiVariants, cx, defaultGlassTuning, glassInteractions, glassShapes, glassSliders } from '../ui'
import type { GlassTuning } from '../ui'
import { archiveDirections } from '../data/archiveSketches'
import { dailyPrompts } from '../data/pages'
import { frameLimits } from './useFrameSize'
import type { FrameSettings } from './useFrameSize'
import { changeStage, setState, useStatus, useStore } from './store'

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

// Team-only controls, not part of the app. Closed by default: open it from the
// Debug button (framed) or the left-edge tab (responsive), press ` (backtick),
// or add ?debug to the URL. ← → move between screens, 1 2 3 set Chloe's stage
// and F toggles the phone frame even while the panel is closed.
export function DebugPanel({ index, goTo, framed, toggleFrame, frame, updateFrame, joystick, toggleJoystick, lockRatio, toggleLockRatio, backgroundColor, setBackgroundColor, kitOpen, toggleKit, mapsOpen, toggleMaps, motionOpen, toggleMotion, looksOpen, toggleLooks, todayLooksOpen, toggleTodayLooks, archiveIdeasOpen, toggleArchiveIdeas, collageOpen, toggleCollage, archiveMockOpen, toggleArchiveMock, sketchesOpen, toggleSketches }: DebugPanelProps) {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).has('debug'))
  const status = useStatus()
  const { onboardingPhotoAccess, hideNav, hideStatusBar, fewBubbles, orbMoves } = useStore()

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
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo, toggleFrame])

  if (!open) {
    // Framed: a round button in the corner of the page, outside the phone.
    // Responsive: a small tab on the left edge so it stays out of the app.
    // On a real phone the frame isn't drawn, so it always uses the edge tab.
    return (
      <>
        {framed && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Open debug panel (`)"
            className="fixed bottom-4 left-4 z-50 rounded-full bg-ink px-4 py-2 font-body text-sm font-semibold text-surface shadow-float hover:opacity-90 max-[500px]:hidden"
          >
            Debug
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open debug panel"
          title="Open debug panel (`)"
          className={cx(
            'fixed left-0 top-1/2 z-50 h-12 w-3 -translate-y-1/2 rounded-r-control bg-ink/30 hover:w-4 hover:bg-ink/60',
            framed && 'min-[501px]:hidden',
          )}
        />
      </>
    )
  }

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

      {/* Chloe's stage: Today, Archive, Community and Profile follow it */}
      <div className="flex flex-col gap-1.5">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Chloe's stage</p>
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
      </div>

      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <DebugToggle label="Phone frame" on={framed} onClick={toggleFrame} hint="F" />
        {framed && (
          <div className="flex flex-col gap-1.5 px-2 py-1">
            <div role="radiogroup" aria-label="Frame preset" className="flex gap-1 rounded-full bg-surface-muted p-0.5">
              {(['iphone', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  role="radio"
                  aria-checked={frame.preset === preset}
                  onClick={() => updateFrame({ preset })}
                  className={cx('flex-1 rounded-full px-2 py-1 text-xs font-semibold transition', frame.preset === preset ? 'bg-ink text-surface' : 'text-ink hover:bg-surface')}
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
                  <button type="button" aria-label="Swap width and height" onClick={() => updateFrame({ width: frame.height, height: frame.width })} className="rounded-control bg-surface-muted px-2 py-1 font-semibold hover:bg-line">⇄</button>
                </div>
                <div className="flex gap-1">
                  {[['Phone', 402, 874], ['Tablet', 820, 1180], ['Wide', 1280, 800]].map(([name, width, height]) => (
                    <button key={name} type="button" onClick={() => updateFrame({ width: Number(width), height: Number(height) })} className="flex-1 rounded-control bg-surface-muted px-1 py-1 text-xs font-semibold hover:bg-line">{name}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <DebugToggle label="Lock aspect ratio" on={lockRatio} onClick={toggleLockRatio} />
        <DebugToggle label="Scroll joystick" on={joystick} onClick={toggleJoystick} />
        <DebugToggle label="Hide navigation" on={hideNav} onClick={() => setState({ hideNav: !hideNav })} />
        <DebugToggle label="Only 8 intention bubbles" on={fewBubbles} onClick={() => setState({ fewBubbles: !fewBubbles })} />
        <DebugToggle label="Hide status bar" on={hideStatusBar} onClick={() => setState({ hideStatusBar: !hideStatusBar })} />
        <DebugToggle label="Onboarding photo access" on={onboardingPhotoAccess} onClick={() => setState({ onboardingPhotoAccess: !onboardingPhotoAccess })} />
        <DebugToggle label="Design system" on={kitOpen} onClick={toggleKit} />
        <DebugToggle label="Map looks" on={mapsOpen} onClick={toggleMaps} />
        <DebugToggle label="Relay entrances" on={motionOpen} onClick={toggleMotion} />
        <DebugToggle label="Relay looks" on={looksOpen} onClick={toggleLooks} />
        <DebugToggle label="Today looks" on={todayLooksOpen} onClick={toggleTodayLooks} />
        <DebugToggle label="Today orb moves" on={orbMoves} onClick={() => setState({ orbMoves: !orbMoves })} />
        <DebugToggle label="3D proto" on={archiveMockOpen} onClick={toggleArchiveMock} />
        <DebugToggle label="Archive sketches" on={sketchesOpen} onClick={toggleSketches} />
        <DebugToggle label="Archive ideas" on={archiveIdeasOpen} onClick={toggleArchiveIdeas} />

        <DebugToggle label="Brand collage" on={collageOpen} onClick={toggleCollage} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-line px-2 pt-3">
        <label className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Background color
          <input
            type="color"
            value={backgroundColor ?? getComputedStyle(document.documentElement).getPropertyValue('--color-backdrop').trim()}
            onChange={(event) => setBackgroundColor(event.target.value)}
            className="h-7 w-10 cursor-pointer rounded-control bg-transparent"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBackgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--color-recording-green').trim())}
            className="flex-1 rounded-control bg-surface-muted px-2 py-1.5 text-xs font-semibold hover:bg-line"
          >
            Green screen
          </button>
          <button
            type="button"
            onClick={() => setBackgroundColor(null)}
            className="rounded-control bg-surface-muted px-2 py-1.5 text-xs font-semibold hover:bg-line"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-ink-muted">Outside the phone frame. Close Debug with ` before recording.</p>
      </div>

      <div className="border-t border-line pt-3">
        <button
          type="button"
          onClick={() => {
            setState((s) => ({ intentionsVideoRun: s.intentionsVideoRun + 1, goals: [], stageSplash: null, composing: false }))
            goTo(flow.findIndex((screen) => screen.id === 'intentions-video'))
            setOpen(false)
          }}
          className="w-full rounded-control bg-surface-muted px-2 py-2 text-left text-xs font-semibold hover:bg-line"
        >
          Video: open intentions from blank
        </button>
        <p className="px-2 pt-1 text-xs text-ink-muted">1.5 seconds blank, then the intentions entrance. Resets picks.</p>
      </div>

      <RealLife goToToday={() => goTo(flow.findIndex((screen) => screen.id === 'today'))} />
      <PromptPicker />
      <ArchiveDirectionPicker goToArchive={() => goTo(flow.findIndex((screen) => screen.id === 'archive'))} />
      <ConfettiPicker goToArrived={() => goTo(flow.findIndex((screen) => screen.id === 'arrived'))} />
      <GlassControls />

      <nav className="flex flex-col gap-2 border-t border-line pt-3">
        {stages.map((stage) => {
          const screens = flow.map((screen, i) => ({ screen, i })).filter(({ screen }) => screen.stage === stage && screen.id !== 'intentions-video' && (onboardingPhotoAccess || screen.id !== 'photos'))
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

      <p className="border-t border-line pt-2 text-xs text-ink-muted">` panel · ← → screens · 1 2 3 stage · F frame</p>
    </aside>
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

// Live Fluid Glass settings for Today's prompt circle, the controls React Bits
// shows for the component. They reset on reload like everything else.
function GlassControls() {
  const { glassTuning: tuning } = useStore()
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<GlassTuning>) => setState((s) => ({ glassTuning: { ...s.glassTuning, ...patch } }))
  const select = 'rounded-full bg-surface-muted px-2 py-1 text-xs'

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-ink-muted"
      >
        Today glass
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 px-2">
          <label className="flex items-center justify-between gap-2">
            Shape
            <select value={tuning.shape} onChange={(event) => set({ shape: event.target.value as GlassTuning['shape'] })} className={select}>
              {glassShapes.map((shape) => (
                <option key={shape}>{shape}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            Interaction
            <select
              value={tuning.interaction}
              onChange={(event) => set({ interaction: event.target.value as GlassTuning['interaction'] })}
              className={select}
            >
              {glassInteractions.map((interaction) => (
                <option key={interaction}>{interaction}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            Color
            <input
              type="color"
              value={tuning.color || getComputedStyle(document.documentElement).getPropertyValue('--color-baton-blue').trim()}
              onChange={(event) => set({ color: event.target.value })}
              className="h-6 w-10 cursor-pointer rounded-full bg-transparent"
            />
          </label>
          {glassSliders.map((slider) => {
            const value = tuning[slider.key] as number
            return (
              <label key={slider.key} className="flex flex-col gap-0.5">
                <span className="flex justify-between text-xs">
                  {slider.label}
                  <span className="tabular-nums text-ink-muted">{value}</span>
                </span>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={value}
                  onChange={(event) => set({ [slider.key]: Number(event.target.value) })}
                  className="accent-baton-blue"
                />
              </label>
            )
          })}
          <div className="-mx-2 flex flex-col">
            <DebugToggle label="Idle drift" on={tuning.idle} onClick={() => set({ idle: !tuning.idle })} />
            <DebugToggle label="Morph on click" on={tuning.morphOnClick} onClick={() => set({ morphOnClick: !tuning.morphOnClick })} />
            <DebugToggle label="Intro" on={tuning.intro} onClick={() => set({ intro: !tuning.intro })} />
          </div>
          <button
            type="button"
            onClick={() => setState({ glassTuning: defaultGlassTuning })}
            className="self-start rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold hover:bg-line"
          >
            Reset
          </button>
        </div>
      )}
    </div>
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
    <div className="flex flex-col gap-1.5 border-t border-line px-2 pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Real-life</span>
      <DebugToggle
        label="Today: photo of your school"
        on={realLife}
        onClick={() => {
          setState({ realLife: !realLife, camera: null })
          if (!realLife) goToToday()
        }}
      />
      <p className="px-2 text-xs text-ink-muted">
        Live camera, then write a line about it. The camera needs https (the Vercel link) or localhost. On a phone, open the link with ?real-life#/today.
      </p>
    </div>
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
    <div className="flex flex-col gap-1.5 border-t border-line px-2 pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Archive direction</span>
      <div role="radiogroup" aria-label="Archive direction" className="flex flex-wrap gap-1 rounded-[14px] bg-surface-muted p-0.5">
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
                on ? 'bg-ink text-surface' : 'text-ink hover:bg-surface',
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

// Confetti on the Welcome to New York splash: pick a style to see it play
// there (picking jumps to the splash and replays it)
function ConfettiPicker({ goToArrived }: { goToArrived: () => void }) {
  const { confetti, confettiRun } = useStore()
  return (
    <div className="flex flex-col gap-1.5 border-t border-line px-2 pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Welcome confetti</span>
      <div role="radiogroup" aria-label="Welcome confetti" className="flex gap-1 rounded-full bg-surface-muted p-0.5">
        {confettiVariants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={confetti === variant.id}
            onClick={() => {
              setState({ confetti: variant.id, confettiRun: confettiRun + 1 })
              goToArrived()
            }}
            className={cx(
              'flex-1 rounded-full px-2 py-1 text-xs font-semibold transition',
              confetti === variant.id ? 'bg-ink text-surface' : 'text-ink hover:bg-surface',
            )}
          >
            {variant.label}
          </button>
        ))}
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
    <label className="flex flex-col gap-1.5 border-t border-line px-2 pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Today's prompt</span>
      <select
        value={promptIndex % prompts.length}
        onChange={(event) => setState({ promptIndex: Number(event.target.value) })}
        className="w-full truncate rounded-control bg-surface-muted px-2 py-1.5 text-xs"
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
