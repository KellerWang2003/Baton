import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { paperDoodles, paperNotes, paperSheet, paperSlotY, rollingPaper, type PaperNote, type PaperNoteColor } from '../data/rollingPaper'
import { navigate } from '../app/navigate'
import { ArrowRightIcon, Button, cx } from '../ui'

// The Figma frames include the 54pt status bar; the app starts under it
const TOP = 54
const NOTE = 104
const BIG_NOTE = 282
// The big note sits in the middle of the 874pt screen
const bigNoteCenterY = 437 - TOP

// Timeline, in ms from opening the page: the Dynamic Island widens, the
// sheet prints out of it (last notes first, tilted toward you), then it
// lies flat, the island shrinks back and the doodles are scribbled on.
const EXPAND_AT = 250
const PRINT_AT = 800
const PRINT = 3600
const SETTLE = 800
const SETTLE_AT = PRINT_AT + PRINT + 150
const DONE_AT = SETTLE_AT + SETTLE

// Perspective while printing (Figma coming out: 302pt wide at the slot,
// 341pt at the leading edge 624pt below)
const TILT = 12
const PRINT_SCALE = 302 / paperSheet.width
const DEPTH = 1000

type Phase = 'start' | 'expand' | 'print' | 'settle' | 'done'

const noteFill: Record<PaperNoteColor, string> = {
  pink: 'bg-baton-pink text-baton-navy',
  yellow: 'bg-note-yellow text-baton-navy',
  blue: 'bg-baton-blue text-white',
  olive: 'bg-baton-olive text-white',
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Selected = { note: PaperNote; from: string; closing: boolean }

// Rolling Paper (Figma ROLLING PAPER_coming out1/2, complete, select): the
// notes friends left Chloe, opened from the Newcomer splash or Profile. The sheet prints out of the
// expanded Dynamic Island, then settles on the page with hand-drawn hearts
// and stars; tap a note to read it bigger.
export function RollingPaper() {
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? 'done' : 'start'))
  const [selected, setSelected] = useState<Selected | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Runs once on open; each step only moves the phase forward
  useEffect(() => {
    if (prefersReducedMotion()) return
    const steps: [Phase, number][] = [
      ['expand', EXPAND_AT],
      ['print', PRINT_AT],
      ['settle', SETTLE_AT],
      ['done', DONE_AT],
    ]
    const timers = steps.map(([next, at]) => window.setTimeout(() => setPhase(next), at))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const printing = phase === 'start' || phase === 'expand' || phase === 'print'
  const islandOpen = phase === 'expand' || phase === 'print'
  // How far the sheet has come out of the slot, along its own length
  const pulled = phase === 'start' || phase === 'expand' ? -paperSheet.height : 0
  const sheetTop = paperSheet.top - paperSlotY

  const open = (note: PaperNote, element: HTMLElement) => {
    const root = rootRef.current?.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    if (!root) return
    const dx = rect.left + rect.width / 2 - (root.left + root.width / 2)
    const dy = rect.top + rect.height / 2 - (root.top + bigNoteCenterY)
    setSelected({ note, closing: false, from: `translate(${dx}px, ${dy}px) rotate(${note.rotate}deg) scale(${NOTE / BIG_NOTE})` })
  }

  return (
    <div ref={rootRef} className="relative h-full bg-baton-paper font-display text-baton-navy">
      {/* The sheet comes out from just under the top of the island */}
      <div
        className={cx('absolute inset-x-0 bottom-0', phase === 'done' ? 'overflow-y-auto' : 'overflow-hidden')}
        style={{ top: paperSlotY - TOP }}
      >
        {/* Room under the sheet so the button doesn't cover the last notes */}
        <div className="relative mx-auto w-[402px]" style={{ height: sheetTop + paperSheet.height + 120 }}>
          <div
            className="absolute overflow-hidden rounded-[10px] bg-baton-cream shadow-paper-sheet motion-reduce:transition-none"
            style={{
              left: paperSheet.left,
              top: sheetTop,
              width: paperSheet.width,
              height: paperSheet.height,
              transformOrigin: 'top center',
              transform: printing
                ? `translateY(${-sheetTop}px) perspective(${DEPTH}px) rotateX(${TILT}deg) scale(${PRINT_SCALE}) translateY(${pulled}px)`
                : `translateY(0px) perspective(${DEPTH}px) rotateX(0deg) scale(1) translateY(0px)`,
              transition:
                phase === 'print'
                  ? `transform ${PRINT}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`
                  : `transform ${SETTLE}ms cubic-bezier(0.34, 1.2, 0.64, 1)`,
            }}
          >
            <Sheet phase={phase} onOpen={open} />
            {/* Shade where the sheet leaves the slot; it stays at the slot
                while the sheet slides under it */}
            <img
              src="/rolling-paper/slot-shade.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 h-[150px] w-[340px] max-w-none mix-blend-multiply"
              style={{
                top: 0,
                translate: `-50% ${-pulled}px`,
                opacity: printing ? 1 : 0,
                transition:
                  phase === 'print' ? `translate ${PRINT}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)` : 'opacity 400ms ease-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Island, widened while it prints (drawn over the status bar's) */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-device motion-reduce:transition-none"
        style={{
          top: 11 - TOP,
          width: islandOpen ? 342 : 127,
          height: islandOpen ? 62.6 : 37,
          transition: 'width 500ms cubic-bezier(0.34, 1.3, 0.64, 1), height 500ms cubic-bezier(0.34, 1.3, 0.64, 1)',
        }}
      />

      {/* Once the sheet has settled: on to her LA Wrapped */}
      {phase === 'done' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[36px] z-10 flex justify-center">
          <Button
            variant="glow"
            size="cta"
            onClick={() => navigate('la-wrapped')}
            className="pointer-events-auto w-[309px] animate-splash-rise"
          >
            {rollingPaper.cta}
            <ArrowRightIcon />
          </Button>
        </div>
      )}

      {selected && (
        <BigNote
          selected={selected}
          onClose={() => setSelected({ ...selected, closing: true })}
          onClosed={() => setSelected(null)}
        />
      )}
    </div>
  )
}

// The printed sheet: heading, notes and doodles, in sheet coordinates
function Sheet({ phase, onOpen }: { phase: Phase; onOpen: (note: PaperNote, element: HTMLElement) => void }) {
  const done = phase === 'done'
  return (
    <>
      <div className="absolute inset-x-0 text-center" style={{ top: 100 - paperSheet.top }}>
        {rollingPaper.title.map((line) => (
          <p key={line} className="text-wrap-date leading-[30px] font-medium">
            {line}
          </p>
        ))}
        <p className="mt-1 text-callout text-wrap-faint">{rollingPaper.completed}</p>
      </div>

      {paperNotes.map((note) => (
        <button
          key={note.name}
          type="button"
          disabled={!done}
          aria-label={`Note from ${note.name}`}
          onClick={(event) => onOpen(note, event.currentTarget)}
          className={cx(
            'absolute rounded-[4px] text-left transition-transform active:scale-95 disabled:cursor-default',
            noteFill[note.color],
          )}
          style={{
            left: note.cx - paperSheet.left - NOTE / 2,
            top: note.cy - paperSheet.top - NOTE / 2,
            width: NOTE,
            height: NOTE,
            rotate: `${note.rotate}deg`,
          }}
        >
          <span className="absolute top-3 left-3 w-20 text-note">{note.text}</span>
          <span className="absolute right-3 bottom-3 text-note">{note.name}</span>
        </button>
      ))}

      {/* Scribbled on once the sheet has landed, top to bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 overflow-hidden motion-reduce:transition-none"
        style={{
          width: paperDoodles.width,
          height: paperDoodles.height,
          clipPath: done ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
          opacity: done ? 1 : 0,
          transition: 'clip-path 1400ms cubic-bezier(0.33, 1, 0.68, 1) 150ms, opacity 300ms ease-out 150ms',
        }}
      >
        <img
          src={paperDoodles.src}
          alt=""
          className="absolute max-w-none"
          style={{
            width: `${paperDoodles.crop.w}%`,
            height: `${paperDoodles.crop.h}%`,
            left: `${paperDoodles.crop.left}%`,
            top: `${paperDoodles.crop.top}%`,
          }}
        />
      </div>
    </>
  )
}

// Big note in the middle of the screen (Figma select: 282pt over a dimmed
// page). It grows out of the tapped note and shrinks back into it.
function BigNote({ selected, onClose, onClosed }: { selected: Selected; onClose: () => void; onClosed: () => void }) {
  const { note, from, closing } = selected
  return (
    <div className="absolute inset-x-0 bottom-0 z-20" style={{ top: -TOP }}>
      <button
        type="button"
        aria-label="Close note"
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-scrim transition-opacity duration-300 starting:opacity-0',
          closing ? 'opacity-0' : 'opacity-100',
        )}
      />
      <div
        role="dialog"
        aria-label={`Note from ${note.name}`}
        onClick={onClose}
        onTransitionEnd={(event) => {
          if (closing && event.propertyName === 'transform') onClosed()
        }}
        className={cx(
          'absolute left-1/2 cursor-pointer rounded-[10px] shadow-note transition-transform duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] starting:[transform:var(--from)]',
          noteFill[note.color],
        )}
        style={
          {
            '--from': from,
            width: BIG_NOTE,
            height: BIG_NOTE,
            marginLeft: -BIG_NOTE / 2,
            top: bigNoteCenterY + TOP - BIG_NOTE / 2,
            transform: closing ? from : 'none',
          } as CSSProperties
        }
      >
        <p className="absolute inset-x-5 top-5 text-note-lg">{note.text}</p>
        <p className="absolute right-5 bottom-5 text-note-lg">{note.name}</p>
      </div>
    </div>
  )
}
