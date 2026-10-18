import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { cx } from './cx'

export type ArchiveFolder = {
  id: string
  city: string
  dates: string
  tabAlign: 'left' | 'center' | 'right'
  dateAlign: 'left' | 'right'
  tone: 'dark' | 'mid' | 'light'
}

type FolderStackProps = {
  folders: ArchiveFolder[]
  onSelect?: (id: string) => void
  className?: string
}

const toneStyles: Record<
  ArchiveFolder['tone'],
  { fill: string; fillText: string; title: string; dates: string }
> = {
  dark: {
    fill: 'bg-brand',
    fillText: 'text-brand',
    title: 'text-on-brand',
    dates: 'text-on-brand/75',
  },
  mid: {
    fill: 'bg-placeholder',
    fillText: 'text-placeholder',
    title: 'text-ink',
    dates: 'text-ink/65',
  },
  light: {
    fill: 'bg-surface-muted',
    fillText: 'text-surface-muted',
    title: 'text-accent',
    dates: 'text-ink-muted',
  },
}

const tabPositionStyles: Record<ArchiveFolder['tabAlign'], string> = {
  left: 'ml-6 mr-auto',
  center: 'mx-auto',
  right: 'ml-auto mr-6',
}

// Each folder body extends 96px underneath the folder in front of it so the
// lower folder's 24px rounded top corners always sit over the solid body of
// the folder behind it (never exposing the canvas background or a sharp seam).
const TAB_HEIGHT = 52
const UNDERLAP_SKIRT = 96
const BASE_OVERLAP = TAB_HEIGHT + UNDERLAP_SKIRT // 148px

// Shoulder-to-shoulder height of the active folder vs compact folders.
// At any scroll position, the viewport frames 3 folders: 1 active folder (450px)
// + 2 compact folders (2 * 96px).
const ACTIVE_STEP_HEIGHT = 450
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
export function FolderStack({ folders, onSelect, className }: FolderStackProps) {
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
              {/* Protruding folder tab with sloped sides and concave shoulder fillets */}
              <div
                className={cx(
                  'relative -mb-px flex h-[52px] items-stretch',
                  tabPositionStyles[folder.tabAlign],
                )}
              >
                <svg
                  viewBox="0 0 28 52"
                  aria-hidden="true"
                  className={cx('h-[52px] w-7 shrink-0 fill-current', styles.fillText)}
                >
                  <path d="M 0 52 C 10 52, 12 46, 14 36 L 17 16 C 18.5 6, 22 0, 28 0 L 28 52 Z" />
                </svg>
                <div
                  className={cx(
                    '-mx-px flex min-w-[116px] items-center justify-center px-3 pt-1',
                    styles.fill,
                  )}
                >
                  <span className={cx('font-display text-large-title font-medium tracking-tight', styles.title)}>
                    {folder.city}
                  </span>
                </div>
                <svg
                  viewBox="0 0 28 52"
                  aria-hidden="true"
                  className={cx('h-[52px] w-7 shrink-0 fill-current', styles.fillText)}
                >
                  <path d="M 28 52 C 18 52, 16 46, 14 36 L 11 16 C 9.5 6, 6 0, 0 0 L 0 52 Z" />
                </svg>
              </div>

              {/* Folder body with deep bottom skirt so rounded corners of the next folder never reveal a gap */}
              <div
                style={{ height: `${bodyHeight}px` }}
                className={cx(
                  'flex w-full flex-col rounded-t-card px-7 pt-4 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  styles.fill,
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
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
