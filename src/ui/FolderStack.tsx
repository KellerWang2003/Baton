import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from 'react'
import { cx } from './cx'
import { folderTones, TAB_PATH, TAB_WIDTH } from './folderStyles'
import { advanceWheelGesture, createWheelGesture, dragFeedback, DRAG_THRESHOLD, FLICK_HOLD_MS, FLICK_MAX_TRAVEL, FLICK_MS, FLING_VELOCITY, folderOpenness, MOVE_SLOP, WHEEL_IDLE_MS } from './folderGestures'
import { useFolderFocus } from './useFolderFocus'

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

// A flick turns one folder. A sustained scroll/drag previews the neighboring
// folder, then snaps at the threshold. Partial gestures spring back on release.
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
  const wheelGestureRef = useRef(createWheelGesture())
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number
    startY: number
    startTime: number
    anchorY: number
    scale: number
    moved: boolean
    lastY: number
    lastTime: number
    velocity: number
    stepped: boolean
  }>({ active: false, pointerId: -1, startY: 0, startTime: 0, anchorY: 0, scale: 1, moved: false, lastY: 0, lastTime: 0, velocity: 0, stepped: false })

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, folders.findIndex((folder) => folder.id === initialId)),
  )
  const activeIndexRef = useRef(activeIndex)
  const [preview, setPreview] = useState(0)
  const [tracking, setTracking] = useState(false)
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

  const settle = () => {
    setTracking(false)
    setPreview(0)
    setPullOffset(0)
  }

  const goTo = (target: number) => {
    const next = clampIndex(target)
    settle()
    if (next !== activeIndexRef.current) {
      activeIndexRef.current = next
      setActiveIndex(next)
      tick()
    }
  }

  const showProgress = (progress: number) => {
    const target = activeIndexRef.current + Math.sign(progress)
    setTracking(true)
    if (target < 0 || target > maxIndex) {
      setPreview(0)
      setPullOffset(-24 * progress / (1 + Math.abs(progress)))
    } else {
      setPullOffset(0)
      setPreview(progress * 0.65)
    }
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.deltaY || event.ctrlKey || dragStateRef.current.active) return
    // Wheel deltas may be pixels, lines (mouse wheels), or pages.
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? frameHeight : 1)
    const target = activeIndexRef.current + Math.sign(delta)
    const { step, progress } = advanceWheelGesture(wheelGestureRef.current, delta, event.timeStamp, target >= 0 && target <= maxIndex)
    if (step) goTo(activeIndexRef.current + step)
    else if (!wheelGestureRef.current.locked) showProgress(progress)

    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    wheelTimerRef.current = window.setTimeout(() => {
      wheelGestureRef.current = createWheelGesture()
      settle()
    }, WHEEL_IDLE_MS)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    wheelGestureRef.current = createWheelGesture()
    settle()
    // The desktop phone frame can be scaled. Thresholds use app pixels so
    // the gesture has the same feel in the frame and on an actual phone.
    const node = event.currentTarget
    const scale = node.offsetHeight ? node.getBoundingClientRect().height / node.offsetHeight : 1
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startTime: event.timeStamp,
      anchorY: event.clientY,
      scale: scale || 1,
      moved: false,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      stepped: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    // Release velocity (app px/ms, finger up > 0), smoothed over recent moves
    const dt = event.timeStamp - drag.lastTime
    if (dt > 0) {
      const v = (drag.lastY - event.clientY) / drag.scale / dt
      drag.velocity = dt > 100 ? v : drag.velocity * 0.4 + v * 0.6
      drag.lastY = event.clientY
      drag.lastTime = event.timeStamp
    }
    const deltaY = (event.clientY - drag.startY) / drag.scale
    if (!drag.moved && Math.abs(deltaY) > MOVE_SLOP) {
      drag.moved = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    if (!drag.moved) return
    const distance = (drag.anchorY - event.clientY) / drag.scale
    const target = activeIndexRef.current + Math.sign(distance)
    // At an edge there is no next snap. Keep the same drag anchor and let
    // resistance build continuously instead of resetting every threshold.
    if (target < 0 || target > maxIndex) {
      showProgress(distance / DRAG_THRESHOLD)
      return
    }
    const elapsed = event.timeStamp - drag.startTime
    const { progress } = dragFeedback(distance, elapsed)
    let { step } = dragFeedback(distance, elapsed)
    // A flick is short and quick: a fast swipe in its first moments holds its
    // turn for release, so it turns exactly one folder. Down past
    // FLICK_HOLD_MS or traveling past FLICK_MAX_TRAVEL, it's a scroll and
    // steps through folders at any speed.
    const scrolling = elapsed >= FLICK_HOLD_MS || Math.abs(event.clientY - drag.startY) / drag.scale >= FLICK_MAX_TRAVEL
    if (scrolling && Math.abs(distance) >= DRAG_THRESHOLD) step = Math.sign(distance)
    if (step && !scrolling && Math.abs(drag.velocity) > FLING_VELOCITY) showProgress(Math.sign(distance))
    else if (step) {
      goTo(activeIndexRef.current + step)
      drag.anchorY = event.clientY
      drag.stepped = true
    } else showProgress(progress)
  }

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active || event.pointerId !== drag.pointerId) return
    // Touch starts with the pointer implicitly captured by the folder under
    // the finger; moving capture to the stack fires lostpointercapture on
    // that folder, which bubbles here. Only the stack's own loss ends a drag.
    if (event.type === 'lostpointercapture' && event.target !== event.currentTarget) return
    drag.active = false
    const distance = (drag.startY - event.clientY) / drag.scale
    const sinceAnchor = (drag.anchorY - event.clientY) / drag.scale
    // A finger still moving fast on release (a touch flick) also turns one
    const stale = event.timeStamp - drag.lastTime > 80
    const flung = !drag.stepped && !stale && Math.abs(drag.velocity) > FLING_VELOCITY && Math.sign(drag.velocity) === Math.sign(sinceAnchor) && Math.abs(sinceAnchor) > MOVE_SLOP
    if (drag.moved && event.type === 'pointerup') {
      if (!drag.stepped && event.timeStamp - drag.startTime < FLICK_MS && Math.abs(distance) > MOVE_SLOP) {
        goTo(activeIndexRef.current + Math.sign(distance))
      } else if (flung) {
        goTo(activeIndexRef.current + Math.sign(drag.velocity))
      } else {
        const { step } = dragFeedback((drag.anchorY - event.clientY) / drag.scale, event.timeStamp - drag.startTime)
        if (step) goTo(activeIndexRef.current + step)
      }
    }
    settle()
  }

  // Fixed for every focus: the last tab sits the same distance down either way
  const lastTabOffset = (folders.length - 2) * COMPACT_STEP_HEIGHT + ACTIVE_STEP_HEIGHT
  // Never above the top edge: on a short screen the last strip shrinks instead
  const stackShiftY = Math.max(0, Math.min(STACK_TOP, frameHeight - lastTabOffset - COMPACT_STEP_HEIGHT))
  const focus = useFolderFocus(activeIndex + preview, tracking)
  const pullPosition = useFolderFocus(pullOffset, tracking)
  const tabTop = (index: number) => stackShiftY + index * COMPACT_STEP_HEIGHT +
    Array.from({ length: index }, (_, i) => folderOpenness(i, focus) * (ACTIVE_STEP_HEIGHT - COMPACT_STEP_HEIGHT)).reduce((sum, h) => sum + h, 0)
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
      onLostPointerCapture={endPointerDrag}
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

          const stepHeight = COMPACT_STEP_HEIGHT + folderOpenness(index, focus) * (ACTIVE_STEP_HEIGHT - COMPACT_STEP_HEIGHT)
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
            pullPosition >= 0
              ? pullPosition * (1 - index / lastIdx)
              : pullPosition * (index / lastIdx)

          return (
            <button
              key={folder.id}
              type="button"
              data-folder={folder.id}
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
                'group relative flex w-full shrink-0 flex-col text-left',
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
                  'flex w-full flex-col overflow-hidden rounded-t-tile px-7 pt-4',
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
// page (Figma ARCHIVE_detail default 334:12257 and ARCHIVE_detail Seoul
// 472:1452). Tapping it goes back to the stack. Outline traced from those
// frames, drawn lying down 65 tall, then turned upright. The tab grows with
// its city name, the way Figma's do (LA 90, Seoul 120): the name starts 22pt
// from its top, and the straight middle of the outline stretches to fit.
const SIDE_TAB_MIN = 90
// Room the tab leaves around the name: 22pt above it, the rest below
const SIDE_TAB_TEXT_TOP = 22
const SIDE_TAB_EXTRA = 64
// The lengths the Figma frames give (the browser sets Mundial a touch shorter
// than Figma, so measuring alone lands a point or two off); other cities are
// measured
const SIDE_TAB_LENGTH: Record<string, number> = { la: 90, seoul: 120 }
function sideTabPath(length: number) {
  const d = length - SIDE_TAB_MIN
  return `M23.7052 9.69648C26.2266 3.81398 32.011 0 38.4111 0L${71.3784 + d} 0C${79.8856 + d} 0 ${86.9053 + d} 6.65722 ${87.3559 + d} 15.1525L${90 + d} 65H0L23.7052 9.69648Z`
}

type FolderSideTabProps = {
  folder: ArchiveFolder
  onClick: () => void
  // Positions the tab (absolute or relative); it has no position of its own
  className: string
}

export function FolderSideTab({ folder, onClick, className }: FolderSideTabProps) {
  const styles = folderTones[folder.tone]
  const nameRef = useRef<HTMLSpanElement>(null)
  const fixedLength = SIDE_TAB_LENGTH[folder.id]
  const [measured, setMeasured] = useState(SIDE_TAB_MIN)
  const length = fixedLength ?? measured

  // Measure the name (it can change size once the web font loads)
  useEffect(() => {
    const name = nameRef.current
    if (!name) return
    const fit = () => setMeasured(Math.max(SIDE_TAB_MIN, Math.round(name.offsetHeight + SIDE_TAB_EXTRA)))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(name)
    return () => observer.disconnect()
  }, [])

  // The outline lies down `length` wide and 65 tall; turned upright about its
  // middle, it needs nudging so its corner sits at the button's corner
  const shift = (length - 65) / 2
  return (
    <button
      type="button"
      onClick={onClick}
      data-side-tab
      aria-label={`Back to ${folder.city} in your archive`}
      style={{ height: length }}
      className={cx('w-[65px] active:opacity-70', className)}
    >
      <svg
        width={length}
        height="65"
        viewBox={`0 0 ${length} 65`}
        aria-hidden="true"
        style={{ top: shift, left: -shift }}
        className={cx('absolute -scale-y-100 -rotate-90 fill-current', styles.fillText)}
      >
        <path d={sideTabPath(length)} />
      </svg>
      {/* Set sideways, reading top to bottom, starting 22pt down and 38pt in */}
      <span
        ref={nameRef}
        style={{ top: SIDE_TAB_TEXT_TOP }}
        className={cx(
          'absolute left-[38px] -translate-x-1/2 font-display text-side-tab font-medium tracking-tight whitespace-nowrap [writing-mode:vertical-rl]',
          styles.title,
        )}
      >
        {folder.city}
      </span>
    </button>
  )
}
