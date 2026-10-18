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
  // Folder whose content shows through while the stack is closed
  peekId?: string
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

// Closed stack (Figma ARCHIVE_default, 236:1107): no folder open, tabs 189px
// apart, the stack resting on the bottom edge with the last folder showing
// 289px (tab plus 237px of body).
const CLOSED_STEP_HEIGHT = 189
const CLOSED_LAST_VISIBLE = 289
const CLOSED_LAST_STEP = CLOSED_LAST_VISIBLE - TAB_HEIGHT - UNDERLAP_SKIRT
const STACK_TOP_PADDING = 28 // pt-7
const VISIBLE_FOLDERS = 3

// Scroll position (in px) of one folder step. Snapped positions are
// index * SCROLL_TRAVEL_PER_FOLDER; only a scrub sits between them.
const SCROLL_TRAVEL_PER_FOLDER = 180

// Gestures (Keller, Oct 18): the stack never tracks the finger exactly, it
// only snaps between folders, so nothing flickers mid-drag.
// - A quick swipe (released within FLICK_MS) turns exactly one folder.
// - A longer drag steps through folders as the finger travels, one folder per
//   DRAG_PX_PER_FOLDER from where it started, so it keeps going while you
//   drag and can come back if you reverse. A tick fires on each folder where
//   vibration is supported.
// - Trackpad and mouse wheel step one folder per WHEEL_STEP of scrolling.
const MOVE_SLOP = 8
const FLICK_MS = 250
const DRAG_PX_PER_FOLDER = 100
const WHEEL_STEP = 80
const WHEEL_QUIET_MS = 160

function tick(ms = 8) {
  navigator.vibrate?.(ms)
}

// Stacked city folders for the Archive screen.
// - Each folder keeps its own fixed color tone.
// - The viewport frames 3 folders at a time (1 expanded active folder + 2 compact folders).
// - It opens closed (activeIndex -1, all folders the same height, resting on
//   the bottom). Tap a folder to open it, tap the open folder to select it.
// - Flick to turn one folder, drag to step through them (see above). Turning
//   back past the first folder closes the stack again.
export function FolderStack({ folders, onSelect, peekId, renderActive, footer, className }: FolderStackProps) {
  const wheelTimerRef = useRef<number | null>(null)
  const wheelAccumRef = useRef(0)
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number
    startY: number
    startTime: number
    startIndex: number
    moved: boolean
  }>({ active: false, pointerId: -1, startY: 0, startTime: 0, startIndex: 0, moved: false })

  const [activeIndex, setActiveIndex] = useState(-1)
  const isClosed = activeIndex < 0
  // Height of the stack's frame, so the closed stack can rest on its bottom
  const frameRef = useRef<HTMLDivElement>(null)
  const [frameHeight, setFrameHeight] = useState(0)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => setFrameHeight(entry.contentRect.height))
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])
  // Small stretch in px when pushing past the first or last folder:
  // > 0 pulls the folders DOWN (compress against the bottom),
  // < 0 pulls them UP (compress against the top)
  const [pullOffset, setPullOffset] = useState(0)

  const lastIdx = Math.max(1, folders.length - 1)
  const maxIndex = Math.max(0, folders.length - 1)
  const maxScroll = lastIdx * SCROLL_TRAVEL_PER_FOLDER
  const clampIndex = (i: number) => Math.min(maxIndex, Math.max(-1, i))

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    }
  }, [])

  // Snap to a folder; asking for one past either end gives a small bounce
  const goTo = (target: number) => {
    const next = clampIndex(target)
    setPullOffset(target < -1 ? 24 : target > maxIndex ? -24 : 0)
    if (next !== activeIndex) {
      setActiveIndex(next)
      tick()
    }
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    wheelAccumRef.current += event.deltaY
    if (Math.abs(wheelAccumRef.current) >= WHEEL_STEP) {
      const dir = Math.sign(wheelAccumRef.current)
      wheelAccumRef.current = 0
      goTo(activeIndex + dir)
    }
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    wheelTimerRef.current = window.setTimeout(() => {
      wheelAccumRef.current = 0
      setPullOffset(0)
    }, WHEEL_QUIET_MS)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startTime: performance.now(),
      startIndex: activeIndex,
      moved: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return

    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.abs(deltaY) > MOVE_SLOP) {
      drag.moved = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    // Within the flick window nothing moves yet; release decides
    if (!drag.moved || performance.now() - drag.startTime < FLICK_MS) return

    // Finger up = later folders
    const steps = Math.trunc(-deltaY / DRAG_PX_PER_FOLDER)
    goTo(drag.startIndex + steps)
  }

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    drag.active = false
    setPullOffset(0)
    if (!drag.moved || event.type !== 'pointerup') return

    const deltaY = event.clientY - drag.startY
    const quick = performance.now() - drag.startTime < FLICK_MS
    // A flick, or a slow drag that never reached a full step, turns one folder
    if (quick || (activeIndex === drag.startIndex && Math.abs(deltaY) > DRAG_PX_PER_FOLDER / 3)) {
      goTo(drag.startIndex - Math.sign(deltaY))
      setPullOffset(0)
    }
  }

  const scrollProgress = maxScroll > 0 ? (Math.max(0, activeIndex) * SCROLL_TRAVEL_PER_FOLDER) / maxScroll : 0

  // Since 3 folders fit in the viewport at any time (1 active + 2 compact),
  // scrolling from top to bottom shifts the stack up by (N - 3) compact steps
  // so at scrollProgress = 1 the last folder is framed with the 2
  // folders above it and bleeds cleanly to the bottom edge.
  const maxStackShift = Math.max(0, folders.length - VISIBLE_FOLDERS) * COMPACT_STEP_HEIGHT
  const closedStackHeight = STACK_TOP_PADDING + CLOSED_STEP_HEIGHT * (folders.length - 1) + CLOSED_LAST_VISIBLE
  const stackShiftY = isClosed
    ? Math.max(0, frameHeight - closedStackHeight)
    : -scrollProgress * maxStackShift

  return (
    <div
      ref={frameRef}
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
          transform: `translateY(${stackShiftY.toFixed(1)}px)`,
        }}
        className="flex w-full flex-col transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {folders.map((folder, index) => {
          const isLast = index === folders.length - 1
          const isActive = index === activeIndex
          const styles = toneStyles[folder.tone]
          const isEdgeTab = folder.tabAlign === 'right'

          const stepHeight = isClosed
            ? isLast
              ? CLOSED_LAST_STEP
              : CLOSED_STEP_HEIGHT
            : isActive
              ? ACTIVE_STEP_HEIGHT
              : COMPACT_STEP_HEIGHT
          // Closed, only the peek folder's content shows (still, not typed)
          const showContent = isActive || (isClosed && folder.id === peekId)
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
                if (isActive) onSelect?.(folder.id)
                else goTo(index)
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
                      showContent ? 'opacity-100' : 'pointer-events-none opacity-0',
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
