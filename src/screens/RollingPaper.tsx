import { useEffect, useRef, useState } from 'react'
import { paperDoodles, paperNotes, paperSheet, paperSlotY, rollingPaper, type PaperNote, type PaperNoteColor } from '../data/rollingPaper'
import { navigate } from '../app/navigate'
import { setState } from '../app/store'
import { ArrowRightIcon, Button, cx, SaveButton } from '../ui'

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
const PRINT = 2400
const SETTLE = 650
const SETTLE_AT = PRINT_AT + PRINT + 150
const DONE_AT = SETTLE_AT + SETTLE
// Gap between one doodle starting and the next
const DOODLE_STEP = 190

// Perspective while printing (Figma coming out: 302pt wide at the slot,
// 341pt at the leading edge 624pt below)
const TILT = 12
const PRINT_SCALE = 302 / paperSheet.width
const DEPTH = 1000
// The island, opened: wide enough to cover the time (from 35pt) and the icons
// (to 362pt) on the 402pt screen
const ISLAND_OPEN = 356

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

// Where the tapped note sits on screen, as an offset from the big note's spot
type Selected = { note: PaperNote; dx: number; dy: number; closing: boolean }

// The flight and the peel are separate motions that overlap, so nothing
// stops halfway: the note starts moving while its corner is still lifting,
// and the paper relaxes flat on the way, with a small flutter as it lands.
// Peeling tilts the note about this axis, lifting its bottom corner.
const PEEL_AXIS = '1, -0.6, 0'
const OPEN_MS = 900
const CLOSE_MS = 760
// The note on the sheet as a share of the big note
const SMALL = NOTE / BIG_NOTE

// Where the note is: on the sheet (x, y, its tilt, its size) or in the middle
function place(x: number, y: number, rotate: number, scale: number) {
  return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
}

// How far the paper is peeled up, in degrees, and lifted toward you
function curl(angle: number, lift = 0) {
  return `perspective(900px) translateZ(${lift}px) rotate3d(${PEEL_AXIS}, ${angle}deg)`
}

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
  // The drawn island only shows while it grows, prints and shrinks back; at
  // rest the phone frame's own island is the one you see
  const islandShown = islandOpen || phase === 'settle'
  const done = phase === 'done'

  // The widened island covers the status bar's time and icons
  useEffect(() => {
    setState({ statusBarCovered: islandOpen })
  }, [islandOpen])
  useEffect(() => () => setState({ statusBarCovered: false }), [])
  // How far the sheet has come out of the slot, along its own length
  const pulled = phase === 'start' || phase === 'expand' ? -paperSheet.height : 0
  const sheetTop = paperSheet.top - paperSlotY

  const open = (note: PaperNote, element: HTMLElement) => {
    const root = rootRef.current?.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    if (!root) return
    // The phone frame may be scaled to fit the window; work in its own points
    const ratio = rootRef.current!.offsetWidth / root.width || 1
    const dx = (rect.left + rect.width / 2 - (root.left + root.width / 2)) * ratio
    const dy = (rect.top + rect.height / 2 - root.top) * ratio - bigNoteCenterY
    setSelected({ note, dx, dy, closing: false })
  }

  return (
    <div ref={rootRef} className="relative h-full bg-baton-paper font-display text-baton-navy">
      {/* The sheet exits below the physical frame's camera cutout. */}
      <div
        className={cx(
          'absolute inset-x-0 bottom-0',
          // Over the island while printing, so the sheet covers its lower half
          // and seems to come out of it; under it once it has landed
          printing ? 'z-10' : 'z-0',
          done ? 'overflow-y-auto' : 'overflow-hidden',
        )}
        // While printing it starts at the island's slot, so the sheet seems to
        // come out of it; once landed it reaches the top of the screen, so the
        // sheet scrolls up under the status bar (the content shifts down to
        // stay put)
        style={{ top: done ? 'calc(-1 * var(--status-bar, 0px))' : paperSlotY - TOP }}
      >
        {/* Room under the sheet so the button doesn't cover the last notes */}
        <div
          className="relative mx-auto w-[402px]"
          style={{ height: sheetTop + paperSheet.height + 120, marginTop: done ? `calc(${paperSlotY - TOP}px + var(--status-bar, 0px))` : 0 }}
        >
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
            <Sheet phase={phase} peeled={selected?.note.name ?? null} onOpen={open} />
            {/* Shade where the sheet leaves the slot; it stays at the slot
                while the sheet slides under it. A plain band the sheet's full
                width, so the sheet's own perspective tilts it the same way */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-[158px] bg-linear-to-b from-slot-shade from-[5%] to-transparent"
              style={{
                // Starts a little above the slot, so a sliver of bare sheet
                // never shows between the island and the shade
                top: -8,
                translate: `0 ${-pulled}px`,
                opacity: printing ? 1 : 0,
                transition:
                  phase === 'print' ? `translate ${PRINT}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)` : 'opacity 400ms ease-out',
              }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Island, widened over the whole status bar while it prints */}
      <div
        aria-hidden
        className={cx('absolute left-1/2 -translate-x-1/2 rounded-full bg-device motion-reduce:transition-none', !islandShown && 'invisible')}
        style={{
          top: 11 - TOP,
          width: islandOpen ? ISLAND_OPEN : 127,
          // Keep the paper exit at the middle of the thicker expanded slot.
          height: islandOpen ? (paperSlotY - 11) * 2 : 37,
          transition: 'width 500ms cubic-bezier(0.34, 1.3, 0.64, 1), height 500ms cubic-bezier(0.34, 1.3, 0.64, 1)',
        }}
      />

      {/* Once the sheet has settled: save it, or on to her LA Wrapped */}
      {phase === 'done' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[36px] z-10 flex animate-splash-rise justify-center gap-2.5">
          <SaveButton label={rollingPaper.save} />
          <Button
            variant="glow"
            size="cta"
            onClick={() => navigate('la-wrapped')}
            className="pointer-events-auto w-[309px]"
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
function Sheet({
  phase,
  peeled,
  onOpen,
}: {
  phase: Phase
  // The note that's peeled off and showing big; its spot stays empty
  peeled: string | null
  onOpen: (note: PaperNote, element: HTMLElement) => void
}) {
  const done = phase === 'done'
  return (
    <>
      <div className="absolute inset-x-0 text-center" style={{ top: 100 - paperSheet.top }}>
        {rollingPaper.title.map((line) => (
          <p key={line} className="text-wrap-date leading-[30px] font-medium">
            {line}
          </p>
        ))}
        <p className="mt-1 text-callout text-baton-navy/60">{rollingPaper.completed}</p>
      </div>

      {paperNotes.map((note) => (
        <button
          key={note.name}
          type="button"
          disabled={!done || peeled !== null}
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
            visibility: peeled === note.name ? 'hidden' : undefined,
          }}
        >
          <span className="absolute top-3 left-3 w-20 text-note">{note.text}</span>
          <span className="absolute right-3 bottom-3 text-note">{note.name}</span>
        </button>
      ))}

      {/* Scribbled on one at a time once the sheet has landed. The mark on a
          peeled note steps aside while it's off the sheet */}
      {done &&
        paperDoodles.map((doodle, index) => (
          <div
            key={doodle.src}
            className={cx(
              'pointer-events-none absolute transition-opacity duration-300 ease-out',
              doodle.on && doodle.on === peeled ? 'opacity-0' : 'opacity-100',
            )}
            style={{ left: doodle.left, top: doodle.top, width: doodle.width, height: doodle.height }}
          >
            <img
              src={doodle.src}
              alt=""
              aria-hidden
              className={cx(
                'size-full max-w-none motion-reduce:animate-none',
                doodle.kind === 'line' ? 'animate-doodle-line' : 'animate-doodle-mark',
              )}
              style={{ animationDelay: `${150 + index * DOODLE_STEP}ms` }}
            />
          </div>
        ))}
    </>
  )
}

// The note's face as it is on the sheet, drawn into the big note at the big
// note's size. The writing is the same all the way, so it just grows with the
// note instead of swapping layouts (which flickered) partway through.
function SmallFace({ note }: { note: PaperNote }) {
  return (
    <div className="absolute top-0 left-0 origin-top-left" style={{ width: NOTE, height: NOTE, scale: 1 / SMALL }}>
      <span className="absolute top-3 left-3 w-20 text-note">{note.text}</span>
      <span className="absolute right-3 bottom-3 text-note">{note.name}</span>
    </div>
  )
}

// Big note in the middle of the screen (Figma select: 282pt over a dimmed
// page). Tapping a note peels it off the sheet: its corner curls up, and as
// it comes away it glides to the middle, straightening and growing. Tapping the empty space around it
// sticks it back: it glides home, its corner dipping down last, and it
// settles flat on its spot.
function BigNote({ selected, onClose, onClosed }: { selected: Selected; onClose: () => void; onClosed: () => void }) {
  const { note, dx, dy, closing } = selected
  const flightRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const glintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const flight = flightRef.current
    const paper = paperRef.current
    const glint = glintRef.current
    if (!flight || !paper || !glint) return
    const reduced = prefersReducedMotion()
    const onSheet = place(dx, dy, note.rotate, SMALL)
    const middle = place(0, 0, 0, 1)
    const run = (element: HTMLElement, frames: Keyframe[], duration: number, options: KeyframeAnimationOptions = {}) =>
      element.animate(frames, { duration: reduced ? 0 : duration, fill: 'both', ...options })

    const animations = closing
      ? [
          // Home in one smooth glide
          run(flight, [{ transform: middle }, { transform: onSheet }], CLOSE_MS * 0.82, {
            easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
          }),
          // The corner tips up as it comes in, then lays down last and settles
          run(
            paper,
            [
              { transform: curl(0), boxShadow: 'var(--shadow-note)', easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
              { offset: 0.5, transform: curl(-20, 10), boxShadow: 'var(--shadow-note-peeled)', easing: 'cubic-bezier(0.5, 0, 0.75, 0.6)' },
              { offset: 0.84, transform: curl(3, 0), boxShadow: 'var(--shadow-note-stuck)', easing: 'ease-out' },
              { transform: curl(0), boxShadow: 'var(--shadow-note-stuck)' },
            ],
            CLOSE_MS,
          ),
          run(glint, [{ opacity: 0 }, { offset: 0.5, opacity: 0.45 }, { offset: 0.84, opacity: 0 }, { opacity: 0 }], CLOSE_MS),
        ]
      : [
          // Starts gliding a beat after the corner begins to lift
          run(flight, [{ transform: onSheet }, { transform: middle }], OPEN_MS * 0.86, {
            delay: reduced ? 0 : OPEN_MS * 0.14,
            easing: 'cubic-bezier(0.5, 0, 0.2, 1)',
          }),
          // The corner curls up, then the paper relaxes flat in the air with
          // a small flutter
          run(
            paper,
            [
              { transform: curl(0), boxShadow: 'var(--shadow-note-stuck)', easing: 'cubic-bezier(0.25, 0.6, 0.4, 1)' },
              { offset: 0.32, transform: curl(-30, 12), boxShadow: 'var(--shadow-note-peeled)', easing: 'cubic-bezier(0.45, 0, 0.4, 1)' },
              { offset: 0.78, transform: curl(4, 4), boxShadow: 'var(--shadow-note-peeled)', easing: 'cubic-bezier(0.4, 0, 0.4, 1)' },
              { transform: curl(0), boxShadow: 'var(--shadow-note)' },
            ],
            OPEN_MS,
          ),
          // Light catching the curled corner
          run(glint, [{ opacity: 0 }, { offset: 0.32, opacity: 0.5 }, { offset: 0.7, opacity: 0 }, { opacity: 0 }], OPEN_MS),
        ]

    let cancelled = false
    if (closing) {
      Promise.all(animations.map((animation) => animation.finished)).then(
        () => !cancelled && onClosed(),
        () => {},
      )
    }
    return () => {
      cancelled = true
      animations.forEach((animation) => animation.cancel())
    }
    // Runs once to peel and once more to stick back
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  return (
    <div className="absolute inset-x-0 bottom-0 z-20" style={{ top: -TOP }}>
      <button
        type="button"
        aria-label="Stick the note back"
        onClick={() => !closing && onClose()}
        className={cx(
          'absolute inset-0 bg-scrim transition-opacity duration-300 starting:opacity-0',
          closing ? 'opacity-0' : 'opacity-100',
        )}
      />
      {/* Moves and scales the note; the paper inside does the peeling */}
      <div
        ref={flightRef}
        className="absolute left-1/2"
        style={{
          width: BIG_NOTE,
          height: BIG_NOTE,
          marginLeft: -BIG_NOTE / 2,
          top: bigNoteCenterY + TOP - BIG_NOTE / 2,
          // Starts exactly over the note on the sheet, before the first frame
          transform: place(dx, dy, note.rotate, SMALL),
        }}
      >
        <div
          ref={paperRef}
          role="dialog"
          aria-label={`Note from ${note.name}`}
          className={cx('absolute inset-0 overflow-hidden rounded-[10px]', noteFill[note.color])}
          style={{ boxShadow: 'var(--shadow-note-stuck)' }}
        >
          <SmallFace note={note} />
          <div
            ref={glintRef}
            aria-hidden
            className="absolute inset-0 bg-linear-to-tl from-white/70 via-white/0 via-40% to-transparent opacity-0"
          />
        </div>
      </div>
    </div>
  )
}
