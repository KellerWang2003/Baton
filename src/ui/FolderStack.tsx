import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from 'react'
import { cx } from './cx'
import { folderTones, TAB_PATH, TAB_WIDTH } from './folderStyles'

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
  // Folder in focus when the stack opens (the first one if missing)
  initialId?: string
  // Extra content under the dates of the open folder (the lifestyle summary)
  renderActive?: (folder: ArchiveFolder, isActive: boolean) => ReactNode
  // Shown once, centered at the bottom of the last folder just above the tab
  // bar, in that folder's quiet text color, when the last folder is open
  footer?: ReactNode
  className?: string
}

// Folder tab outline, traced from the Union shapes in the Figma Archive frame
// (LA28 Palms, 256:196): a long sloped left side, a nearly vertical right side,
// both with soft rounded turns. The right-aligned tab runs straight into the
// folder's right edge, so its outline also draws that corner.
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

// Figma ARCHIVE_default (256:196): the folder in focus is open, 401px from
// its tab to the next tab; every other folder is collapsed to a 119px strip.
// All folders stay on screen: the stack doesn't move, only the focus changes.
// It starts STACK_TOP down (96 in Figma), or higher (down to the top edge)
// when that's needed for the last folder to still show a full strip. The bottom fades into the color of
// the folder there.
const STACK_TOP = 96
const ACTIVE_STEP_HEIGHT = 401
const COMPACT_STEP_HEIGHT = 119
const FADE_HEIGHT = 81

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
// - Scrolling vertically moves the focus one folder at a time: the folder in
//   focus expands and the others collapse, all of them staying on screen.
// - Flick to turn one folder, drag to step through them (see above).
// - Tap a peeking folder to bring it into focus, tap the open one to select it.
export function FolderStack({ folders, onSelect, initialId, renderActive, footer, className }: FolderStackProps) {
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

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, folders.findIndex((folder) => folder.id === initialId)),
  )
  // Height of the stack's frame, to tell which folder sits at the bottom
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
  const clampIndex = (i: number) => Math.min(maxIndex, Math.max(0, i))

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    }
  }, [])

  // Snap to a folder; asking for one past either end gives a small bounce
  const goTo = (target: number) => {
    const next = clampIndex(target)
    setPullOffset(target < 0 ? 24 : target > maxIndex ? -24 : 0)
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

  // Fixed for every focus: the last tab sits the same distance down either way
  const lastTabOffset = (folders.length - 2) * COMPACT_STEP_HEIGHT + ACTIVE_STEP_HEIGHT
  // Never above the top edge: on a short screen the last strip shrinks instead
  const stackShiftY = Math.max(0, Math.min(STACK_TOP, frameHeight - lastTabOffset - COMPACT_STEP_HEIGHT))
  const tabTop = (index: number) =>
    stackShiftY + index * COMPACT_STEP_HEIGHT + (index > activeIndex ? ACTIVE_STEP_HEIGHT - COMPACT_STEP_HEIGHT : 0)
  // The folder whose body reaches the bottom edge sets the fade's color
  const bottomIndex = folders.reduce((found, _, index) => (tabTop(index) < frameHeight ? index : found), activeIndex)

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
        'relative isolate flex flex-1 flex-col justify-start overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing [-webkit-touch-callout:none]',
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
          const styles = folderTones[folder.tone]
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
                  <div className={styles.body}>
                    {renderActive(folder, isActive)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {folders.length > 0 && (
        <div
          aria-hidden
          style={{ height: `${FADE_HEIGHT}px` }}
          className={cx(
            'pointer-events-none absolute inset-x-0 bottom-0 z-[99] bg-linear-to-b to-70%',
            folderTones[folders[bottomIndex].tone].fade,
          )}
        />
      )}
      {footer && folders.length > 0 && (
        <div
          className={cx(
            'pointer-events-none absolute inset-x-0 bottom-[100px] z-[100] flex justify-center transition-opacity duration-300',
            folderTones[folders[folders.length - 1].tone].dates,
            activeIndex === folders.length - 1 ? 'opacity-100' : 'opacity-0',
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

// The folder's tab turned on its side at the left edge of a city's detail
// page (Figma ARCHIVE_detail default, 267:5273). Tapping it goes back to the
// stack. Outline traced from that frame, drawn 90 wide and 65 tall, then
// turned upright.
const SIDE_TAB_PATH =
  'M23.7052 9.69648C26.2266 3.81398 32.011 0 38.4111 0L71.3784 0C79.8856 0 86.9053 6.65722 87.3559 15.1525L90 65H0L23.7052 9.69648Z'

type FolderSideTabProps = {
  folder: ArchiveFolder
  onClick: () => void
  // Positions the tab (absolute or relative); it has no position of its own
  className: string
}

export function FolderSideTab({ folder, onClick, className }: FolderSideTabProps) {
  const styles = folderTones[folder.tone]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Back to ${folder.city} in your archive`}
      className={cx('h-[90px] w-[65px] active:opacity-70', className)}
    >
      <svg
        width="90"
        height="65"
        viewBox="0 0 90 65"
        aria-hidden="true"
        className={cx('absolute top-[12.5px] -left-[12.5px] -scale-y-100 -rotate-90 fill-current', styles.fillText)}
      >
        <path d={SIDE_TAB_PATH} />
      </svg>
      <span
        className={cx(
          'absolute top-1/2 left-[38px] -translate-x-1/2 -translate-y-1/2 rotate-90 font-display text-side-tab font-medium tracking-tight whitespace-nowrap',
          styles.title,
        )}
      >
        {folder.city}
      </span>
    </button>
  )
}
