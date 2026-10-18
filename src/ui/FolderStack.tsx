import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from 'react'
import { cx } from './cx'

export type ArchiveFolder = {
  id: string
  city: string
  dates: string
  tabAlign: 'left' | 'center' | 'right'
  dateAlign: 'left' | 'right'
  tone: 'olive' | 'blue' | 'cream' | 'pink' | 'yellow' | 'navy'
}

type FolderStackProps = {
  folders: ArchiveFolder[]
  onSelect?: (id: string) => void
  // Extra content under the dates of the open folder (the lifestyle summary)
  renderActive?: (folder: ArchiveFolder, isActive: boolean) => ReactNode
  // Shown once, centered at the bottom of the last folder just above the tab
  // bar, in that folder's quiet text color, when the last folder is open
  footer?: ReactNode
  className?: string
}

// Brand colors from the Figma Archive frame (LA28 Palms, 256:196).
// body is the text color for content inside the open folder.
const toneStyles: Record<
  ArchiveFolder['tone'],
  { fill: string; fillText: string; title: string; dates: string; body: string }
> = {
  olive: {
    // --folder-fill lets content inside (inline photo outlines) match the folder
    fill: 'bg-baton-olive [--folder-fill:var(--color-baton-olive)]',
    fillText: 'text-baton-olive',
    title: 'text-baton-yellow',
    dates: 'text-on-baton-olive-muted',
    body: 'text-baton-cream',
  },
  blue: {
    fill: 'bg-baton-blue [--folder-fill:var(--color-baton-blue)]',
    fillText: 'text-baton-blue',
    title: 'text-baton-cream',
    dates: 'text-on-baton-blue-muted',
    body: 'text-baton-cream',
  },
  cream: {
    fill: 'bg-baton-cream [--folder-fill:var(--color-baton-cream)]',
    fillText: 'text-baton-cream',
    title: 'text-baton-navy',
    dates: 'text-on-baton-cream-muted',
    body: 'text-baton-navy',
  },
  // The rest of the brand palette (Figma brand frame, 223:175), so folders vary
  pink: {
    fill: 'bg-baton-pink [--folder-fill:var(--color-baton-pink)]',
    fillText: 'text-baton-pink',
    title: 'text-baton-navy',
    dates: 'text-baton-navy/60',
    body: 'text-baton-navy',
  },
  yellow: {
    fill: 'bg-baton-yellow [--folder-fill:var(--color-baton-yellow)]',
    fillText: 'text-baton-yellow',
    title: 'text-baton-navy',
    dates: 'text-baton-navy/60',
    body: 'text-baton-navy',
  },
  navy: {
    fill: 'bg-baton-navy [--folder-fill:var(--color-baton-navy)]',
    fillText: 'text-baton-navy',
    title: 'text-baton-pink',
    dates: 'text-baton-cream/60',
    body: 'text-baton-cream',
  },
}

// Folder tab outline, traced from the Union shapes in the Figma Archive frame
// (LA28 Palms, 256:196): a long sloped left side, a nearly vertical right side,
// both with soft rounded turns. The right-aligned tab runs straight into the
// folder's right edge, so its outline also draws that corner.
const TAB_PATH =
  'M0 52C6.2252 52 11.8852 48.3893 14.5092 42.7441L30.0751 9.2559C32.6991 3.6108 38.3587 0 44.5839 0H180.786C189.336 0 196.376 6.7238 196.769 15.2656L197.756 36.7347C198.148 45.2765 205.188 52 213.739 52V53H0Z'
const TAB_WIDTH = 214
const EDGE_TAB_PATH =
  'M0 52C6.2256 52 11.886 48.3893 14.51 42.7441L30.0756 9.2559C32.6996 3.6108 38.3586 0 44.584 0H180.787C189.337 0 196.377 6.7238 196.77 15.2656L197.807 37.8199C198.171 45.7545 204.71 52 212.653 52C220.862 52 227.516 58.6542 227.516 66.8625V68H0Z'
const EDGE_TAB_WIDTH = 227.516

const tabPositionStyles: Record<ArchiveFolder['tabAlign'], string> = {
  left: 'ml-[30px] mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
}

// Each folder body extends 96px underneath the folder in front of it so the
// lower folder's 16px rounded top corners always sit over the solid body of
// the folder behind it (never exposing the canvas background or a sharp seam).
const TAB_HEIGHT = 52
const UNDERLAP_SKIRT = 96
const BASE_OVERLAP = TAB_HEIGHT + UNDERLAP_SKIRT // 148px

// Shoulder-to-shoulder height of the active folder vs compact folders.
// At any scroll position, the viewport frames 3 folders: 1 active folder (480px)
// + 2 compact folders (2 * 96px).
const ACTIVE_STEP_HEIGHT = 480
const COMPACT_STEP_HEIGHT = 96
const VISIBLE_FOLDERS = 3

// Scroll position (in px) of one folder step. Snapped positions are
// index * SCROLL_TRAVEL_PER_FOLDER; only a scrub sits between them.
const SCROLL_TRAVEL_PER_FOLDER = 180

// Gestures (Keller, Oct 18):
// - A quick swipe (or any plain drag past SWIPE_DISTANCE) pages exactly one
//   folder, like flicking through cards. While the finger is down the stack
//   only stretches toward the next folder, so it never skips ahead.
// - Press and hold (LONG_PRESS_MS without moving) lifts the stack, then
//   dragging scrubs through every folder continuously, about
//   SCRUB_PX_PER_FOLDER of finger travel each, with a tick per folder. On
//   release it settles on the nearest one.
// - Trackpad and mouse wheel page one folder per gesture.
const LONG_PRESS_MS = 320
const MOVE_SLOP = 8
const SWIPE_DISTANCE = 36
const SWIPE_VELOCITY = 0.35 // px per ms
const SCRUB_PX_PER_FOLDER = 64
const WHEEL_STEP = 40
const WHEEL_QUIET_MS = 200

function rubberBand(distance: number, max = 64) {
  const sign = Math.sign(distance)
  const abs = Math.abs(distance)
  return sign * max * (1 - Math.exp(-abs / (max * 1.8)))
}

function tick(ms = 8) {
  navigator.vibrate?.(ms)
}

// Stacked city folders for the Archive screen.
// - Each folder keeps its own fixed color tone.
// - The viewport frames 3 folders at a time (1 expanded active folder + 2 compact folders).
// - Swipe to page one folder, press and hold then drag to scrub (see above).
export function FolderStack({ folders, onSelect, renderActive, footer, className }: FolderStackProps) {
  const longPressTimerRef = useRef<number | null>(null)
  const wheelTimerRef = useRef<number | null>(null)
  const wheelRef = useRef({ accum: 0, locked: false })
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number
    startY: number
    startIndex: number
    moved: boolean
    scrubbing: boolean
    samples: { y: number; t: number }[]
  }>({ active: false, pointerId: -1, startY: 0, startIndex: 0, moved: false, scrubbing: false, samples: [] })

  const [activeIndex, setActiveIndex] = useState(0)
  // Continuous position while scrubbing, null when resting on activeIndex
  const [scrubPos, setScrubPos] = useState<number | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  // Signed squeeze offset in px:
  // > 0 means user is pulling DOWN (folders shift downward and compress against the bottom)
  // < 0 means user is pulling UP (folders shift upward and compress against the top)
  const [pullOffset, setPullOffset] = useState(0)

  const lastIdx = Math.max(1, folders.length - 1)
  const maxIndex = Math.max(0, folders.length - 1)
  const maxScroll = lastIdx * SCROLL_TRAVEL_PER_FOLDER
  const clampIndex = (i: number) => Math.min(maxIndex, Math.max(0, i))

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) window.clearTimeout(longPressTimerRef.current)
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    }
  }, [])

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Page one folder (dir = +1 next, -1 previous). Past either end the stack
  // just bounces back.
  const step = (from: number, dir: number) => {
    const next = clampIndex(from + dir)
    setActiveIndex(next)
    setPullOffset(0)
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const wheel = wheelRef.current
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    wheelTimerRef.current = window.setTimeout(() => {
      wheel.accum = 0
      wheel.locked = false
      setPullOffset(0)
    }, WHEEL_QUIET_MS)
    if (wheel.locked) return

    wheel.accum += event.deltaY
    if (Math.abs(wheel.accum) >= WHEEL_STEP) {
      // One folder per gesture; trackpad momentum is ignored until it settles
      wheel.locked = true
      step(activeIndex, Math.sign(wheel.accum))
    } else {
      setPullOffset(rubberBand(-wheel.accum, 40))
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    clearLongPress()
    const now = performance.now()
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startIndex: activeIndex,
      moved: false,
      scrubbing: false,
      samples: [{ y: event.clientY, t: now }],
    }
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null
      const drag = dragStateRef.current
      if (!drag.active || drag.moved) return
      // Lift: the stack shrinks back a little and follows the finger 1:1
      drag.scrubbing = true
      drag.moved = true // so releasing doesn't open the folder
      setScrubbing(true)
      setScrubPos(drag.startIndex * SCROLL_TRAVEL_PER_FOLDER)
      tick(12)
    }, LONG_PRESS_MS)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return

    const now = performance.now()
    drag.samples.push({ y: event.clientY, t: now })
    while (drag.samples.length > 2 && now - drag.samples[0].t > 100) drag.samples.shift()

    const deltaY = event.clientY - drag.startY

    if (drag.scrubbing) {
      const raw = drag.startIndex * SCROLL_TRAVEL_PER_FOLDER - (deltaY * SCROLL_TRAVEL_PER_FOLDER) / SCRUB_PX_PER_FOLDER
      const pos = Math.min(maxScroll, Math.max(0, raw))
      setScrubPos(pos)
      // Stretch past either end
      setPullOffset(raw < 0 ? rubberBand(-raw / 3, 48) : raw > maxScroll ? -rubberBand((raw - maxScroll) / 3, 48) : 0)
      const index = clampIndex(Math.round(pos / SCROLL_TRAVEL_PER_FOLDER))
      if (index !== activeIndex) {
        setActiveIndex(index)
        tick()
      }
      return
    }

    if (!drag.moved && Math.abs(deltaY) > MOVE_SLOP) {
      drag.moved = true
      clearLongPress()
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    if (!drag.moved) return

    // Plain swipe: the stack stretches toward the next folder, then pages on release
    setPullOffset(rubberBand(deltaY, 56))
  }

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    drag.active = false
    clearLongPress()

    if (drag.scrubbing) {
      drag.scrubbing = false
      setScrubbing(false)
      setScrubPos(null)
      setPullOffset(0)
      return
    }

    if (drag.moved && event.type === 'pointerup') {
      const deltaY = event.clientY - drag.startY
      const first = drag.samples[0]
      const last = drag.samples[drag.samples.length - 1]
      const dt = last.t - first.t
      const velocity = dt > 0 ? (last.y - first.y) / dt : 0
      const flicked = Math.abs(velocity) > SWIPE_VELOCITY && Math.abs(deltaY) > MOVE_SLOP
      if (Math.abs(deltaY) > SWIPE_DISTANCE || flicked) {
        // Finger up = next folder
        const dir = flicked ? -Math.sign(velocity) : -Math.sign(deltaY)
        step(drag.startIndex, dir)
        return
      }
    }
    setPullOffset(0)
  }

  const scrollPos = scrubPos ?? activeIndex * SCROLL_TRAVEL_PER_FOLDER
  const scrollProgress = maxScroll > 0 ? scrollPos / maxScroll : 0

  // Since 3 folders fit in the viewport at any time (1 active + 2 compact),
  // scrolling from top to bottom shifts the stack up by (N - 3) compact steps
  // so at scrollProgress = 1 the last folder (Busan) is framed with the 2
  // folders above it and bleeds cleanly to the bottom edge.
  const maxStackShift = Math.max(0, folders.length - VISIBLE_FOLDERS) * COMPACT_STEP_HEIGHT
  const stackShiftY = -scrollProgress * maxStackShift

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerDrag}
      onPointerCancel={endPointerDrag}
      onContextMenu={(event) => event.preventDefault()}
      className={cx(
        'relative isolate flex flex-1 flex-col justify-start overflow-hidden pt-7 select-none touch-none cursor-grab active:cursor-grabbing [-webkit-touch-callout:none]',
        className,
      )}
    >
      <div
        style={{
          transform: `translateY(${stackShiftY.toFixed(1)}px)${scrubbing ? ' scale(0.96)' : ''}`,
        }}
        className={cx(
          'flex w-full origin-top flex-col transition-transform ease-[cubic-bezier(0.22,1,0.36,1)]',
          scrubbing ? 'duration-150' : 'duration-[420ms]',
        )}
      >
        {folders.map((folder, index) => {
          const isLast = index === folders.length - 1
          const isActive = index === activeIndex
          const styles = toneStyles[folder.tone]
          const isEdgeTab = folder.tabAlign === 'right'

          const stepHeight = isActive ? ACTIVE_STEP_HEIGHT : COMPACT_STEP_HEIGHT
          // Each non-last folder has height = stepHeight + UNDERLAP_SKIRT (96px),
          // and the next folder pulls up by -(TAB_HEIGHT + UNDERLAP_SKIRT) = -148px.
          // The last folder includes an extra 220px bottom skirt so it always bleeds
          // past the bottom edge of the screen even during upward overscroll.
          const bodyHeight = isLast
            ? stepHeight + UNDERLAP_SKIRT + 220
            : stepHeight + UNDERLAP_SKIRT

          // Directional displacement:
          // - When pulling DOWN (pullOffset > 0): top folder moves down the most
          //   ((1 - index / lastIdx) * pullOffset), squeezing folders downward
          //   while the bottom folder stays anchored at 0.
          // - When pulling UP (pullOffset < 0): bottom folder moves up the most
          //   ((index / lastIdx) * pullOffset), squeezing folders upward while
          //   the top folder stays anchored at 0.
          const translateY =
            pullOffset >= 0
              ? pullOffset * (1 - index / lastIdx)
              : pullOffset * (index / lastIdx)

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                if (dragStateRef.current.moved) return
                onSelect?.(folder.id)
              }}
              style={{
                zIndex: index + 1,
                marginTop: index === 0 ? undefined : `-${BASE_OVERLAP}px`,
                transform: translateY !== 0 ? `translateY(${translateY.toFixed(1)}px)` : undefined,
              }}
              className={cx(
                'group relative flex w-full shrink-0 flex-col text-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                index > 0 && 'drop-shadow-[0_-8px_18px_rgb(0_0_0/0.12)]',
              )}
            >
              {/* Protruding folder tab, same outline as the Figma frame */}
              <div
                style={{ width: `${isEdgeTab ? EDGE_TAB_WIDTH : TAB_WIDTH}px` }}
                className={cx('relative z-10 -mb-px h-[52px] shrink-0', tabPositionStyles[folder.tabAlign])}
              >
                <svg
                  width={isEdgeTab ? EDGE_TAB_WIDTH : TAB_WIDTH}
                  height={isEdgeTab ? 68 : 53}
                  viewBox={`0 0 ${isEdgeTab ? EDGE_TAB_WIDTH : TAB_WIDTH} ${isEdgeTab ? 68 : 53}`}
                  aria-hidden="true"
                  className={cx('absolute top-0 left-0 overflow-visible fill-current', styles.fillText)}
                >
                  <path d={isEdgeTab ? EDGE_TAB_PATH : TAB_PATH} />
                </svg>
                <span
                  className={cx(
                    'absolute top-0 left-0 flex h-[52px] w-[220px] items-center justify-center pt-1.5 font-display text-large-title font-medium tracking-tight',
                    styles.title,
                  )}
                >
                  {folder.city}
                </span>
              </div>

              {/* Folder body with deep bottom skirt so rounded corners of the next folder never reveal a gap */}
              <div
                style={{ height: `${bodyHeight}px` }}
                className={cx(
                  'flex w-full flex-col overflow-hidden rounded-t-tile px-7 pt-4 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  styles.fill,
                  isEdgeTab && 'rounded-tr-none',
                  isLast && '-mb-[220px]',
                )}
              >
                <span
                  className={cx(
                    'font-body text-title-3 font-normal tracking-tight',
                    styles.dates,
                    folder.dateAlign === 'right' ? 'self-end text-right' : 'self-start text-left',
                  )}
                >
                  {folder.dates}
                </span>
                {renderActive && (
                  <div
                    className={cx(
                      'transition-opacity duration-300',
                      styles.body,
                      isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
                    )}
                  >
                    {renderActive(folder, isActive)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {footer && folders.length > 0 && (
        <div
          className={cx(
            'pointer-events-none absolute inset-x-0 bottom-[100px] z-[100] flex justify-center transition-opacity duration-300',
            toneStyles[folders[folders.length - 1].tone].dates,
            activeIndex === folders.length - 1 ? 'opacity-100' : 'opacity-0',
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
