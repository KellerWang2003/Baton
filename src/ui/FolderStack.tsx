import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from 'react'
import { cx } from './cx'

export type ArchiveFolder = {
  id: string
  city: string
  dates: string
  tabAlign: 'left' | 'center' | 'right'
  dateAlign: 'left' | 'right'
  tone: 'olive' | 'blue' | 'cream'
}

type FolderStackProps = {
  folders: ArchiveFolder[]
  onSelect?: (id: string) => void
  // Extra content under the dates of the open folder (the lifestyle summary)
  renderActive?: (folder: ArchiveFolder, mutedClass: string, isActive: boolean) => ReactNode
  className?: string
}

// Brand colors from the Figma Archive frame (LA28 Palms, 256:196).
// body is the text color for content inside the open folder.
const toneStyles: Record<
  ArchiveFolder['tone'],
  { fill: string; fillText: string; title: string; dates: string; body: string }
> = {
  olive: {
    fill: 'bg-baton-olive',
    fillText: 'text-baton-olive',
    title: 'text-baton-yellow',
    dates: 'text-on-baton-olive-muted',
    body: 'text-baton-cream',
  },
  blue: {
    fill: 'bg-baton-blue',
    fillText: 'text-baton-blue',
    title: 'text-baton-cream',
    dates: 'text-on-baton-blue-muted',
    body: 'text-baton-cream',
  },
  cream: {
    fill: 'bg-baton-cream',
    fillText: 'text-baton-cream',
    title: 'text-baton-navy',
    dates: 'text-on-baton-cream-muted',
    body: 'text-baton-navy',
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

// Deliberate scroll distance (in px) required to step from one active folder to the next:
const SCROLL_TRAVEL_PER_FOLDER = 180

function rubberBand(distance: number, max = 64) {
  const sign = Math.sign(distance)
  const abs = Math.abs(distance)
  return sign * max * (1 - Math.exp(-abs / (max * 1.8)))
}

// Stacked, scrollable city folders for the Archive screen.
// - Each folder keeps its own fixed color tone.
// - The viewport frames 3 folders at a time (1 expanded active folder + 2 compact folders).
// - Scrolling or dragging steps the expanded active footprint through the
//   stack (180px of travel per folder) and glides the stack upward.
export function FolderStack({ folders, onSelect, renderActive, className }: FolderStackProps) {
  const releaseTimerRef = useRef<number | null>(null)
  const scrollPosRef = useRef(0)
  const overscrollRef = useRef(0)
  const dragStateRef = useRef<{
    active: boolean
    startY: number
    startScrollPos: number
    moved: boolean
  }>({ active: false, startY: 0, startScrollPos: 0, moved: false })

  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  // Signed squeeze offset in px:
  // > 0 means user is pulling DOWN (folders shift downward and compress against the bottom)
  // < 0 means user is pulling UP (folders shift upward and compress against the top)
  const [pullOffset, setPullOffset] = useState(0)

  const lastIdx = Math.max(1, folders.length - 1)
  const maxScroll = lastIdx * SCROLL_TRAVEL_PER_FOLDER

  useEffect(() => {
    return () => {
      if (releaseTimerRef.current !== null) {
        window.clearTimeout(releaseTimerRef.current)
      }
    }
  }, [])

  const scheduleRelease = (delay = 160) => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current)
    }
    releaseTimerRef.current = window.setTimeout(() => {
      if (!dragStateRef.current.active) {
        overscrollRef.current = 0
        setPullOffset(0)
      }
    }, delay)
  }

  const applyScrollPosition = (nextPos: number, delta: number) => {
    if (nextPos < 0) {
      scrollPosRef.current = 0
      overscrollRef.current = -nextPos
      setPullOffset(rubberBand(overscrollRef.current, 64))
    } else if (nextPos > maxScroll) {
      scrollPosRef.current = maxScroll
      overscrollRef.current = nextPos - maxScroll
      setPullOffset(-rubberBand(overscrollRef.current, 64))
    } else {
      scrollPosRef.current = nextPos
      overscrollRef.current = 0
      const impulse = Math.max(-24, Math.min(24, -delta * 0.45))
      setPullOffset(impulse)
    }

    const progress = maxScroll > 0 ? scrollPosRef.current / maxScroll : 0
    setScrollProgress(progress)

    const rawTarget = scrollPosRef.current / SCROLL_TRAVEL_PER_FOLDER
    setActiveIndex((prev) => {
      const distance = rawTarget - prev
      if (Math.abs(distance) < 0.55) return prev
      return Math.min(lastIdx, Math.max(0, Math.round(rawTarget)))
    })
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const nextPos = scrollPosRef.current + event.deltaY
    applyScrollPosition(nextPos, event.deltaY)
    scheduleRelease(150)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current)
    }
    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      startScrollPos: scrollPosRef.current,
      moved: false,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current
    if (!drag.active) return

    const deltaY = event.clientY - drag.startY
    if (Math.abs(deltaY) > 5) {
      drag.moved = true
    }
    if (!drag.moved) return

    const nextPos = drag.startScrollPos - deltaY * 1.25
    applyScrollPosition(nextPos, -deltaY)
  }

  const endPointerDrag = () => {
    if (!dragStateRef.current.active) return
    dragStateRef.current.active = false
    overscrollRef.current = 0
    setPullOffset(0)
  }

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
      onPointerLeave={endPointerDrag}
      className={cx(
        'isolate flex flex-1 flex-col justify-start overflow-hidden pt-7 select-none touch-none cursor-grab active:cursor-grabbing',
        className,
      )}
    >
      <div
        style={{ transform: `translateY(${stackShiftY.toFixed(1)}px)` }}
        className="flex w-full flex-col transition-transform duration-200 ease-out"
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
                    {renderActive(folder, styles.dates, isActive)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
