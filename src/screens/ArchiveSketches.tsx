import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ComponentType, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { albumCities, albumLayouts, clusterMoments, dayCaptions, traceMonths, tracePlaces, traceVisits } from '../data/archiveSketches'
import type { AlbumPage, ArchiveSketchId, SketchCategory } from '../data/archiveSketches'
import { cx } from '../ui'
import { StaticTabBar } from './MainLayout'

// Team-only page (Debug > Archive sketches, or ?archive-sketches): the
// directions explored for the Archive tab before the photo cloud and orb,
// as clickable grayscale wireframes for the process part of the video: gray
// photos with white borders on an off-white page, no color. Each sits in a
// phone (402×874 pt, like the prototype) and works with a mouse or a finger. Pick one at the top to see it alone and large for recording.

const W = 402
const H = 874

// A pointer position in the phone's own points, whatever it's scaled to
function local(e: { clientX: number; clientY: number }, element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) * element.offsetWidth) / rect.width,
    y: ((e.clientY - rect.top) * element.offsetHeight) / rect.height,
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// Same numbers every load, so the wireframes look the same in every take
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Wireframe parts

// A photo that isn't there yet: gray, with a white border and a soft shadow
function XBox({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cx('relative rounded-[3px] border-[3px] border-surface bg-wire-photo shadow-sm', className)} style={style} />
}

// Text that isn't written yet
function Lines({ widths = [92, 80, 64], className }: { widths?: number[]; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      {widths.map((width, i) => (
        <span key={i} className="h-[6px] rounded-full bg-wire-line" style={{ width: `${width}%` }} />
      ))}
    </div>
  )
}

// The app's own tab bar, in gray and not tappable (in the app the real one shows)
function TabBarSketch() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col pb-6 grayscale">
      <StaticTabBar active="archive" />
    </div>
  )
}

// In the app (live) the real phone frame, status bar and tab bar show instead
function Phone({ children, live }: { children: ReactNode; live?: boolean }) {
  return (
    <div
      className={cx(
        'relative h-[874px] w-[402px] touch-none select-none overflow-hidden bg-wire-canvas font-body text-wire-ink',
        !live && 'rounded-[60px] outline outline-[8px] outline-wire-ink',
      )}
    >
      {!live && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[54px] items-center justify-between px-10 text-headline font-medium">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-[11px] w-[17px] rounded-[3px] bg-wire-ink" />
              <span className="h-[11px] w-[24px] rounded-[3px] bg-wire-ink" />
            </span>
          </div>
          <span className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-wire-ink" />
        </>
      )}
      {children}
      {!live && <TabBarSketch />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 1. Photo album: open a city's album and leaf through a collage per place

type Flip = {
  leaf: 'cover' | number
  base: number
  dir: 1 | -1
  done: () => void
}

function AlbumCover({ city }: { city: (typeof albumCities)[number] }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-l-[6px] rounded-r-[20px] bg-wire-dark text-surface shadow-lg">
      <span className="absolute inset-y-0 left-3 w-[3px] rounded-full bg-wire-mid" />
      <XBox className="size-[190px] -rotate-2" />
      <div className="text-center">
        <p className="font-display text-title-1">{city.name}</p>
        <p className="text-footnote text-wire-photo">{city.years}</p>
      </div>
    </div>
  )
}

function AlbumLeaf({ page, number, total }: { page: AlbumPage; number: number; total: number }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-l-[6px] rounded-r-[20px] bg-surface pt-6 shadow-lg">
      <span className="absolute inset-y-0 left-3 w-[2px] bg-wire-line" />
      <span className="absolute right-5 top-5 text-caption text-ink-muted">
        {number} / {total}
      </span>
      <p className="ml-9 mr-12 origin-left -rotate-3 font-display text-[32px] leading-[1.05]">{page.place}</p>
      <div className="relative mx-auto mt-4 aspect-[5/6] w-[80%]">
        {albumLayouts[page.layout].map(([x, y, w, h], i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
              rotate: `${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg`,
            }}
          >
            <XBox className="size-full" />
          </div>
        ))}
      </div>
      <div className="mx-4 mt-auto rounded-t-[28px] bg-wire-canvas px-6 pb-7 pt-4">
        <p className="mb-3 text-title-2">{page.visits}</p>
        <Lines />
      </div>
    </div>
  )
}

function AlbumSketch() {
  const [open, setOpen] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [flip, setFlip] = useState<Flip | null>(null)
  const leaf = useRef<HTMLDivElement>(null)
  const press = useRef(0)

  // The leaf (or the cover) turns on the book's spine
  useLayoutEffect(() => {
    const element = leaf.current
    if (!flip || !element) return
    const frames = [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }]
    const animation = element.animate(flip.dir === 1 ? frames : [...frames].reverse(), {
      duration: flip.leaf === 'cover' ? 760 : 620,
      easing: 'cubic-bezier(.45,.05,.25,1)',
      fill: 'forwards',
    })
    animation.onfinish = () => {
      flip.done()
      setFlip(null)
    }
    return () => {
      animation.onfinish = null
      animation.cancel()
    }
  }, [flip])

  const city = open === null ? null : albumCities[open]

  const openAlbum = (i: number) => {
    setOpen(i)
    setPage(0)
    setFlip({ leaf: 'cover', base: 0, dir: 1, done: () => {} })
  }
  const closeAlbum = () => {
    if (flip) return
    setFlip({ leaf: 'cover', base: page, dir: -1, done: () => setOpen(null) })
  }
  const turn = (dir: 1 | -1) => {
    if (flip || !city) return
    const to = page + dir
    if (to < 0 || to >= city.pages.length) return
    setFlip(dir === 1 ? { leaf: page, base: to, dir: 1, done: () => setPage(to) } : { leaf: to, base: page, dir: -1, done: () => setPage(to) })
  }

  if (!city) {
    return (
      <div className="absolute inset-x-0 top-[74px] px-8">
        <p className="font-display text-title-1">Archive</p>
        <p className="text-subhead text-ink-muted">3 albums · tap one to open it</p>
        <div className="mt-7 flex flex-col gap-5">
          {albumCities.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onClick={() => openAlbum(i)}
              className="relative flex h-[150px] items-center gap-5 overflow-hidden rounded-l-[4px] rounded-r-[18px] bg-surface pl-9 pr-5 text-left shadow-md active:scale-[0.98]"
              style={{ rotate: `${[-1, 0.8, -0.5][i]}deg` }}
            >
              <span className="absolute inset-y-0 left-0 w-4 bg-wire-mid" />
              <XBox className="size-[96px] shrink-0 -rotate-2" />
              <span>
                <span className="block text-title-2">{c.name}</span>
                <span className="text-footnote text-ink-muted">
                  {c.years} · {c.pages.length} pages
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const base = flip ? flip.base : page
  return (
    <>
      <div className="absolute inset-x-6 top-[62px] flex items-center justify-between">
        <button type="button" onClick={closeAlbum} className="py-2 text-subhead">
          ‹ Albums
        </button>
        <span className="text-subhead text-ink-muted">{city.name}</span>
      </div>
      <div
        className="absolute inset-x-6 bottom-[124px] top-[112px] [perspective:1800px]"
        onPointerDown={(e) => {
          press.current = e.clientX
        }}
        onPointerUp={(e) => {
          const dx = e.clientX - press.current
          if (Math.abs(dx) > 30) turn(dx < 0 ? 1 : -1)
          else turn(local(e, e.currentTarget).x > e.currentTarget.offsetWidth / 2 ? 1 : -1)
        }}
      >
        <AlbumLeaf page={city.pages[base]} number={base + 1} total={city.pages.length} />
        {flip && (
          <div ref={leaf} className="absolute inset-0 origin-left [backface-visibility:hidden]">
            {flip.leaf === 'cover' ? <AlbumCover city={city} /> : <AlbumLeaf page={city.pages[flip.leaf]} number={flip.leaf + 1} total={city.pages.length} />}
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// 2. Photo cluster + orb: drag around the circles, turn the orb to filter

const categories = ['all', 'feelings', 'people', 'places'] as const
const categoryNames = {
  all: 'All',
  feelings: 'Feelings',
  people: 'People',
  places: 'Places',
}

const CLUSTER_X = W / 2
const CLUSTER_Y = 350
const cluster = (() => {
  const random = seeded(11)
  const dots = Array.from({ length: 44 }, () => {
    const r = 168 * Math.pow(random(), 1.05)
    const a = random() * Math.PI * 2
    return {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r * 1.2,
      size: Math.max(9, 60 - r * 0.3 + (random() - 0.5) * 28),
      category: (['feelings', 'people', 'places'] as SketchCategory[])[Math.floor(random() * 3)],
    }
  })
  // Push overlapping circles apart a little, keeping them close like the sketch
  for (let pass = 0; pass < 60; pass++) {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i]
        const b = dots[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.hypot(dx, dy) || 1
        const min = (a.size + b.size) / 2 + 10
        if (d < min) {
          const push = (min - d) / 2
          a.x -= (dx / d) * push
          a.y -= (dy / d) * push
          b.x += (dx / d) * push
          b.y += (dy / d) * push
        }
      }
    }
  }
  return dots
})()

// The orb: its center sits low and right, mostly off the phone like the sketch
const ORB_X = 318
const ORB_Y = 735
const ORB_R = 172
const NOTCH = -110 // where the picked filter's label sits on the rim, in degrees
const SPACING = 30
// Where an opened circle lands
const BIG = 250
const BIG_Y = 300

type Gesture = {
  kind: 'pan' | 'orb'
  dot: number | null
  x: number
  y: number
  panX: number
  panY: number
  moved: boolean
  angle: number
  rot: number
}

function ClusterSketch() {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rot, setRot] = useState(0)
  const [picked, setPicked] = useState<{ index: number; from: string } | null>(null)
  const gesture = useRef<Gesture | null>(null)
  const tween = useRef(0)
  const closing = useRef(false)
  const bubble = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLDivElement>(null)

  const active = categories[Math.round(rot)]

  useEffect(() => () => cancelAnimationFrame(tween.current), [])

  // An opened circle grows from where it sat into the middle
  useLayoutEffect(() => {
    if (!picked) return
    const options = {
      duration: 460,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'both' as const,
    }
    bubble.current?.animate([{ transform: picked.from }, { transform: 'none' }], options)
    scrim.current?.animate([{ opacity: 0 }, { opacity: 1 }], options)
    caption.current?.animate(
      [
        { opacity: 0, transform: 'translateY(28px)' },
        { opacity: 1, transform: 'none' },
      ],
      { ...options, delay: 160 },
    )
  }, [picked])

  const close = () => {
    if (!picked || closing.current) return
    closing.current = true
    const options = {
      duration: 360,
      easing: 'cubic-bezier(.4,0,.2,1)',
      fill: 'forwards' as const,
    }
    caption.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      ...options,
      duration: 160,
    })
    scrim.current?.animate([{ opacity: 1 }, { opacity: 0 }], options)
    const shrink = bubble.current?.animate([{ transform: 'none' }, { transform: picked.from }], options)
    const done = () => {
      closing.current = false
      setPicked(null)
    }
    if (shrink) shrink.onfinish = done
    else done()
  }

  const settle = (from: number) => {
    const to = Math.round(from)
    const start = performance.now()
    cancelAnimationFrame(tween.current)
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 240)
      setRot(from + (to - from) * (1 - (1 - k) ** 3))
      if (k < 1) tween.current = requestAnimationFrame(step)
    }
    tween.current = requestAnimationFrame(step)
  }

  const angleAt = (p: { x: number; y: number }) => (Math.atan2(p.y - ORB_Y, p.x - ORB_X) * 180) / Math.PI

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (picked) return
    const p = local(e, e.currentTarget)
    const onOrb = !!(e.target as HTMLElement).closest('[data-orb]')
    // Read before capturing the pointer, which makes the phone the target of what follows
    const dot = (e.target as HTMLElement).closest<HTMLElement>('[data-dot]')
    e.currentTarget.setPointerCapture(e.pointerId)
    cancelAnimationFrame(tween.current)
    gesture.current = {
      kind: onOrb ? 'orb' : 'pan',
      dot: dot ? Number(dot.dataset.dot) : null,
      x: p.x,
      y: p.y,
      panX: pan.x,
      panY: pan.y,
      moved: false,
      angle: angleAt(p),
      rot,
    }
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g) return
    const p = local(e, e.currentTarget)
    if (Math.hypot(p.x - g.x, p.y - g.y) > 6) g.moved = true
    if (g.kind === 'pan') {
      setPan({ x: g.panX + p.x - g.x, y: g.panY + p.y - g.y })
    } else {
      const angle = angleAt(p)
      let delta = angle - g.angle
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      g.angle = angle
      g.rot = clamp(g.rot - delta / SPACING, 0, categories.length - 1)
      setRot(g.rot)
    }
  }
  const onUp = () => {
    const g = gesture.current
    gesture.current = null
    if (!g) return
    if (g.kind === 'orb') {
      settle(g.rot)
      return
    }
    // A tap on a circle opens it
    if (!g.moved && g.dot !== null) {
      const index = g.dot
      const d = cluster[index]
      const x = CLUSTER_X + pan.x + d.x * zoom
      const y = CLUSTER_Y + pan.y + d.y * zoom
      setPicked({
        index,
        from: `translate(${x - W / 2}px, ${y - BIG_Y}px) scale(${(d.size * zoom) / BIG})`,
      })
    }
  }

  const moment = picked ? clusterMoments[cluster[picked.index].category][picked.index % 3] : null

  return (
    <div
      className="absolute inset-0"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => (gesture.current = null)}
      onWheel={(e) => setZoom((z) => clamp(z * Math.exp(-e.deltaY * 0.002), 0.6, 2.4))}
    >
      <div className="pointer-events-none absolute inset-x-8 top-[66px]">
        <p className="text-subhead text-ink-muted">Los Angeles · {cluster.length} moments</p>
      </div>

      <div
        className="absolute"
        style={{
          left: CLUSTER_X,
          top: CLUSTER_Y,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {cluster.map((d, i) => {
          const match = active === 'all' || d.category === active
          return (
            <div
              key={i}
              data-dot={i}
              className={cx(
                'absolute cursor-pointer rounded-full border-2 border-surface shadow-sm transition-[opacity,background-color] duration-300',
                match && active !== 'all' ? 'bg-wire-mid' : 'bg-wire-photo',
                !match && 'opacity-25',
              )}
              style={{
                left: d.x - d.size / 2,
                top: d.y - d.size / 2,
                width: d.size,
                height: d.size,
              }}
            />
          )
        })}
      </div>

      {/* The orb: turn it along its rim to filter */}
      <div
        data-orb
        className="absolute z-20 cursor-grab rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--color-surface)_40%,var(--color-wire-line))] shadow-float active:cursor-grabbing"
        style={{
          left: ORB_X - ORB_R,
          top: ORB_Y - ORB_R,
          width: ORB_R * 2,
          height: ORB_R * 2,
        }}
      >
        <span className="absolute inset-[28px] rounded-full border border-wire-line" />
        {categories.map((c, i) => {
          const angle = NOTCH + (i - rot) * SPACING
          const a = (angle * Math.PI) / 180
          const r = ORB_R - 14
          return (
            <span
              key={c}
              className={cx('pointer-events-none absolute whitespace-nowrap text-caption', c === active ? 'font-medium text-wire-ink' : 'text-ink-muted')}
              style={{
                left: ORB_R + Math.cos(a) * r,
                top: ORB_R + Math.sin(a) * r,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                opacity: clamp(1 - Math.abs(i - rot) * 0.3, 0, 1),
              }}
            >
              {categoryNames[c]}
            </span>
          )
        })}
        <span
          className="pointer-events-none absolute size-2 rounded-full bg-wire-dark"
          style={{
            left: ORB_R + Math.cos((NOTCH * Math.PI) / 180) * (ORB_R + 9) - 4,
            top: ORB_R + Math.sin((NOTCH * Math.PI) / 180) * (ORB_R + 9) - 4,
          }}
        />
        <span className="pointer-events-none absolute left-[62px] top-[66px] font-display text-title-2">{categoryNames[active]}</span>
        <span className="pointer-events-none absolute left-[62px] top-[96px] text-caption text-ink-muted">turn to filter</span>
      </div>

      {picked && moment && (
        <div className="absolute inset-0 z-40" onPointerUp={close}>
          <div ref={scrim} className="absolute inset-0 bg-wire-canvas/95" />
          <div
            ref={bubble}
            className="absolute rounded-full border-[5px] border-surface bg-wire-photo shadow-float"
            style={{
              left: W / 2 - BIG / 2,
              top: BIG_Y - BIG / 2,
              width: BIG,
              height: BIG,
            }}
          />
          <div ref={caption} className="absolute inset-x-8 top-[460px]">
            <span className="rounded-full bg-wire-line px-3 py-1 text-caption">{categoryNames[cluster[picked.index].category]}</span>
            <p className="mt-4 font-display text-title-1">{moment.title}</p>
            <p className="mb-5 text-footnote text-ink-muted">{moment.when}</p>
            <Lines />
            <p className="mt-8 text-caption text-ink-faint">Tap anywhere to put it back</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Contact sheet of days: every day of her last year as one cell

const DAYS = 364
const COLS = 14
const CELL = 20
const STEP = 24
const GRID_X = (W - (COLS * STEP - (STEP - CELL))) / 2 + 8
const GRID_Y = 136
// Her last year in LA, up to the night before she leaves
const FIRST_DAY = Date.UTC(2025, 11, 20)

type DayKind = 'photo' | 'note' | 'none'
const days: DayKind[] = (() => {
  const random = seeded(4)
  return Array.from({ length: DAYS }, () => {
    const r = random()
    return r < 0.38 ? 'none' : r < 0.84 ? 'photo' : 'note'
  })
})()
const keptCount = days.filter((d) => d !== 'none').length
const dayDate = (i: number) => new Date(FIRST_DAY + i * 86400000)
const dayLabel = (i: number) =>
  dayDate(i).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
const monthStarts = Array.from({ length: DAYS }, (_, i) => i).filter((i) => i === 0 || dayDate(i).getUTCDate() === 1)

function DayPreview({ index, large }: { index: number; large?: boolean }) {
  const kind = days[index]
  return (
    <>
      {kind === 'photo' && <XBox className={large ? 'h-[180px] w-full' : 'h-[92px] w-full'} />}
      {kind === 'note' && (
        <div className={cx('flex w-full flex-col justify-center rounded-[6px] bg-wire-canvas px-4', large ? 'h-[180px]' : 'h-[92px]')}>
          <Lines widths={[90, 70, 84]} />
        </div>
      )}
      {kind === 'none' && (
        <div className={cx('flex w-full items-center justify-center rounded-[6px] bg-wire-canvas text-caption text-ink-faint', large ? 'h-[180px]' : 'h-[92px]')}>
          Nothing kept
        </div>
      )}
      <p className={cx('mt-2 font-medium', large ? 'text-title-3' : 'text-footnote')}>{dayLabel(index)}</p>
      {kind !== 'none' && <p className={cx('text-ink-muted', large ? 'text-subhead' : 'text-caption')}>{dayCaptions[index % dayCaptions.length]}</p>}
    </>
  )
}

function DaysSketch() {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
  const [sheet, setSheet] = useState<{ index: number; open: boolean } | null>(null)

  const hovered = pointer
    ? clamp(Math.round((pointer.y - GRID_Y - CELL / 2) / STEP), 0, Math.ceil(DAYS / COLS) - 1) * COLS + clamp(Math.round((pointer.x - GRID_X - CELL / 2) / STEP), 0, COLS - 1)
    : null
  const day = hovered !== null && hovered < DAYS ? hovered : null

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointer) setPointer(local(e, e.currentTarget.parentElement as HTMLElement))
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-8 top-[66px]">
        <p className="font-display text-title-2">Your last year in LA</p>
        <p className="text-subhead text-ink-muted">
          {keptCount} of {DAYS} days kept · drag across to look into one
        </p>
      </div>

      {monthStarts.map((i) => (
        <span key={i} className="pointer-events-none absolute text-[10px] text-ink-muted" style={{ left: 10, top: GRID_Y + Math.floor(i / COLS) * STEP + 4 }}>
          {dayDate(i).toLocaleDateString('en-US', {
            month: 'short',
            timeZone: 'UTC',
          })}
        </span>
      ))}

      <div
        className="absolute inset-0"
        onPointerDown={(e) => {
          if (sheet?.open) {
            setSheet({ ...sheet, open: false })
            return
          }
          e.currentTarget.setPointerCapture(e.pointerId)
          setPointer(local(e, e.currentTarget.parentElement as HTMLElement))
        }}
        onPointerMove={move}
        onPointerUp={() => {
          if (day !== null && days[day] !== 'none') setSheet({ index: day, open: true })
          setPointer(null)
        }}
        onPointerCancel={() => setPointer(null)}
      >
        {days.map((kind, i) => {
          const x = GRID_X + (i % COLS) * STEP
          const y = GRID_Y + Math.floor(i / COLS) * STEP
          const distance = pointer ? Math.hypot(x + CELL / 2 - pointer.x, y + CELL / 2 - pointer.y) : Infinity
          const grow = 1 + 1.5 * Math.max(0, 1 - distance / 70) ** 2
          const last = i === DAYS - 1
          return (
            <span
              key={i}
              className={cx(
                'absolute flex items-center justify-center rounded-[5px]',
                last || i === day ? 'bg-wire-dark' : kind === 'photo' ? 'bg-wire-photo' : kind === 'note' ? 'bg-wire-line' : 'bg-surface',
              )}
              style={{
                left: x,
                top: y,
                width: CELL,
                height: CELL,
                transform: `scale(${grow})`,
                zIndex: Math.round(grow * 10),
              }}
            >
              {kind === 'note' && <span className="h-[2px] w-[56%] rounded-full bg-wire-mid" />}
            </span>
          )
        })}
      </div>

      {/* The loupe over the finger */}
      {pointer && day !== null && (
        <div
          className="pointer-events-none absolute z-20 w-[160px] rounded-[18px] bg-surface p-3 shadow-float"
          style={{
            left: clamp(pointer.x - 80, 12, W - 172),
            top: pointer.y - 230 < 60 ? pointer.y + 44 : pointer.y - 230,
          }}
        >
          <DayPreview index={day} />
        </div>
      )}

      {/* Letting go on a kept day opens it */}
      <div
        className={cx(
          'absolute inset-x-0 bottom-0 z-40 h-[420px] rounded-t-[36px] bg-surface px-8 pt-4 shadow-sheet transition-transform duration-300 ease-out',
          sheet?.open ? 'translate-y-0' : 'translate-y-full',
        )}
        onPointerDown={() => sheet && setSheet({ ...sheet, open: false })}
      >
        <span className="mx-auto mb-5 block h-[5px] w-[44px] rounded-full bg-wire-photo" />
        {sheet && (
          <>
            <DayPreview index={sheet.index} large />
            <Lines className="mt-5" widths={[94, 76]} />
          </>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// 4. Traced city: her moments as one line drawn across LA over four years

const VISITS = traceVisits.length
const TRACK_X = 96
const TRACK_W = 270
const TRACK_Y = 682
const PLAY_SECONDS = 9

const monthLabel = (t: number) =>
  new Date(Date.UTC(2022, 8 + Math.round((t / (VISITS - 1)) * traceMonths), 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function TraceSketch() {
  const [t, setT] = useState(VISITS - 1)
  const [playing, setPlaying] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const time = useRef(VISITS - 1)

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      const next = Math.min(VISITS - 1, time.current + (((now - last) / 1000) * (VISITS - 1)) / PLAY_SECONDS)
      last = now
      time.current = next
      setT(next)
      if (next >= VISITS - 1) setPlaying(false)
      else frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const scrub = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = local(e, e.currentTarget.parentElement as HTMLElement)
    const next = clamp(((p.x - TRACK_X) / TRACK_W) * (VISITS - 1), 0, VISITS - 1)
    time.current = next
    setT(next)
    setPicked(null)
    setPlaying(false)
  }

  const k = Math.floor(t)
  const f = t - k
  const points = traceVisits.map((p) => tracePlaces[p])
  const pen =
    k + 1 < VISITS
      ? {
          x: points[k].x + (points[k + 1].x - points[k].x) * f,
          y: points[k].y + (points[k + 1].y - points[k].y) * f,
        }
      : points[k]
  const counts = tracePlaces.map((_, i) => traceVisits.slice(0, k + 1).filter((v) => v === i).length)
  const current = picked ?? traceVisits[Math.round(t)]

  return (
    <>
      {/* A wireframe LA: streets, the 101 and the coast */}
      <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden>
        <rect x="0" y="112" width={W} height="540" className="fill-wire-land" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={140 + i * 52} x2={W} y2={118 + i * 52} className="stroke-surface" strokeWidth="4" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`v${i}`} x1={40 + i * 52} y1="112" x2={60 + i * 52} y2="652" className="stroke-surface" strokeWidth="4" />
        ))}
        <path d="M0 420 C 40 450, 60 500, 92 560 S 134 630, 146 652 L 0 652 Z" className="fill-wire-photo" />
        <path d="M0 620 C 120 540, 170 470, 230 425 S 330 290, 402 250" fill="none" className="stroke-wire-mid" strokeWidth="7" />
        {[
          ['Pasadena', 300, 150],
          ['Silver Lake', 112, 330],
          ['Downtown', 196, 488],
          ['Pacific', 8, 520],
        ].map(([name, x, y]) => (
          <text key={name} x={x} y={y} className="fill-ink-muted text-[11px]">
            {name}
          </text>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-8 top-[66px]">
        <p className="font-display text-title-2">Your LA, traced</p>
        <p className="text-subhead text-ink-muted">Every moment, in the order you kept it</p>
      </div>

      {/* The trace: each leg is faint, so the ways she went often get darker */}
      <svg className="absolute inset-0" width={W} height={H}>
        {points.slice(0, k).map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={points[i + 1].x} y2={points[i + 1].y} className="stroke-wire-dark" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
        ))}
        <line x1={points[k].x} y1={points[k].y} x2={pen.x} y2={pen.y} className="stroke-wire-ink" strokeWidth="2" strokeLinecap="round" />
        {tracePlaces.map((place, i) =>
          counts[i] ? (
            <g key={place.name} className="cursor-pointer" onClick={() => setPicked(i)}>
              <circle cx={place.x} cy={place.y} r={18} className="fill-transparent" />
              <circle
                cx={place.x}
                cy={place.y}
                r={4 + Math.min(12, counts[i] * 1.4)}
                className={cx('stroke-surface', i === current ? 'fill-wire-dark' : 'fill-wire-mid')}
                strokeWidth={2.5}
              />
              <text x={place.x + 10 + Math.min(12, counts[i] * 1.4)} y={place.y + 4} className="fill-wire-ink text-[11px]">
                {place.name}
              </text>
            </g>
          ) : null,
        )}
        <circle cx={pen.x} cy={pen.y} r={4.5} className="fill-wire-ink" />
      </svg>

      {/* What's there: the place the line is at, or the one tapped */}
      <div className="pointer-events-none absolute inset-x-6 top-[532px] z-10 flex gap-4 rounded-[22px] bg-surface p-3 shadow-float">
        <XBox className="size-[72px] shrink-0 rounded-[12px] shadow-none" />
        <div className="min-w-0 flex-1 pt-1">
          <p className="truncate text-headline font-medium">{tracePlaces[current].name}</p>
          <p className="mb-2 text-caption text-ink-muted">Been {counts[current] || traceVisits.filter((v) => v === current).length} times</p>
          <Lines widths={[88, 60]} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (time.current >= VISITS - 1) {
            time.current = 0
            setT(0)
          }
          setPicked(null)
          setPlaying((on) => !on)
        }}
        className="absolute flex size-[46px] items-center justify-center rounded-full bg-surface text-footnote text-wire-dark shadow-md"
        style={{ left: 30, top: TRACK_Y - 23 }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <div
        className="absolute cursor-pointer"
        style={{
          left: TRACK_X - 12,
          top: TRACK_Y - 30,
          width: TRACK_W + 24,
          height: 60,
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          scrub(e)
        }}
        onPointerMove={(e) => e.buttons && scrub(e)}
      />
      {/* Like a segmented timeline: gray where it's drawn, light ahead, a white pill as the handle */}
      <span className="pointer-events-none absolute h-[8px] rounded-full bg-wire-line" style={{ left: TRACK_X, top: TRACK_Y - 4, width: TRACK_W }} />
      <span className="pointer-events-none absolute h-[8px] rounded-full bg-wire-mid" style={{ left: TRACK_X, top: TRACK_Y - 4, width: (t / (VISITS - 1)) * TRACK_W }} />
      <span
        className="pointer-events-none absolute h-[28px] w-[48px] rounded-full border border-wire-mid bg-surface shadow-sm"
        style={{
          left: TRACK_X + (t / (VISITS - 1)) * TRACK_W - 24,
          top: TRACK_Y - 14,
        }}
      />
      <span
        className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-caption font-medium"
        style={{
          left: TRACK_X + (t / (VISITS - 1)) * TRACK_W,
          top: TRACK_Y - 38,
        }}
      >
        {monthLabel(t)}
      </span>
      <span className="pointer-events-none absolute text-[10px] text-ink-muted" style={{ left: TRACK_X, top: TRACK_Y + 16 }}>
        Sep 2022
      </span>
      <span className="pointer-events-none absolute text-[10px] text-ink-muted" style={{ left: TRACK_X + TRACK_W - 44, top: TRACK_Y + 16 }}>
        Dec 2026
      </span>
    </>
  )
}

// ---------------------------------------------------------------------------
// The page

const sketches: {
  id: ArchiveSketchId | 'days'
  name: string
  status: string
  blurb: string
  Component: ComponentType
}[] = [
  {
    id: 'album',
    name: 'Photo album',
    status: 'Dropped',
    blurb: 'Each city is an album. Open it and leaf through a collage per place. Too literal.',
    Component: AlbumSketch,
  },
  {
    id: 'cluster',
    name: 'Photo cluster + orb',
    status: 'Went with',
    blurb: 'Moments as a cloud of circles to drag through. Turn the orb to filter, tap a circle to open it.',
    Component: ClusterSketch,
  },
  {
    id: 'days',
    name: 'Contact sheet of days',
    status: 'Explored',
    blurb: 'Every day of her last year as one cell. Drag across to look into a day, let go to open it.',
    Component: DaysSketch,
  },
  {
    id: 'trace',
    name: 'Traced city',
    status: 'Explored',
    blurb: 'Her moments as one line drawn across LA. Play or scrub the years to watch it draw itself.',
    Component: TraceSketch,
  },
]

const CAPTION = 96
const GAP = 32

export function ArchiveSketches({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<string>('all')
  const [labels, setLabels] = useState(true)
  const main = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: 1400, height: 900 })

  useLayoutEffect(() => {
    const element = main.current
    if (!element) return
    const measure = () => setBox({ width: element.clientWidth, height: element.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const caption = labels ? CAPTION : 0
  const shown = view === 'all' ? sketches : sketches.filter((s) => s.id === view)
  let scale: number
  if (view === 'all') {
    const four = Math.min((box.width - 48 - 3 * GAP) / (4 * W), (box.height - 40 - caption) / H)
    scale = four >= 0.42 ? Math.min(1, four) : Math.min(1, (box.width - 48 - GAP) / (2 * W))
  } else {
    scale = Math.min(1.2, (box.height - 40 - caption) / H, (box.width - 48) / W)
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-surface font-body text-wire-ink">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-6 py-4">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-medium">Archive sketches</h1>
          <p className="text-subhead text-ink-muted">Directions explored for the Archive tab, as clickable wireframes.</p>
        </div>
        <div className="flex rounded-full bg-surface-muted p-1">
          {[{ id: 'all', name: 'All' }, ...sketches].map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setView(s.id)}
              className={cx('rounded-full px-3 py-1.5 text-footnote', view === s.id ? 'bg-surface font-medium shadow-sm' : 'text-ink-muted')}
            >
              {s.id === 'all' ? s.name : `${i}. ${s.name}`}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setLabels((on) => !on)} className="rounded-full bg-surface-muted px-4 py-2 text-subhead">
          {labels ? 'Hide labels' : 'Show labels'}
        </button>
        <button type="button" onClick={onClose} className="rounded-full bg-baton-navy px-4 py-2 text-subhead font-medium text-on-brand hover:opacity-90">
          Close
        </button>
      </header>

      <div ref={main} className="min-h-0 flex-1 overflow-auto">
        <div className="flex min-h-full flex-wrap items-center justify-center px-6 py-5" style={{ gap: GAP }}>
          {shown.map(({ id, name, status, blurb, Component }) => (
            <section key={id} style={{ width: W * scale }}>
              <div style={{ width: W * scale, height: H * scale }}>
                <div
                  style={{
                    width: W,
                    height: H,
                    transform: `scale(${scale})`,
                    transformOrigin: '0 0',
                  }}
                >
                  <Phone>
                    <Component />
                  </Phone>
                </div>
              </div>
              {labels && (
                <div className="pt-3" style={{ minHeight: CAPTION }}>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-title-3 font-medium">
                      {sketches.findIndex((s) => s.id === id) + 1}. {name}
                    </h2>
                    <span
                      className={cx(
                        'shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-caption',
                        status === 'Went with' ? 'border-ink font-medium' : 'border-line text-ink-muted',
                      )}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-footnote text-ink-muted">{blurb}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

// A direction in place of the real Archive tab (Debug > Archive direction):
// the whole screen, under the status bar too. App.tsx puts the real tab bar
// over it, in gray. Without the phone frame it's scaled to fit the window.
export function ArchiveSketchScreen({ id }: { id: ArchiveSketchId }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const Component = sketches.find((s) => s.id === id)?.Component ?? ClusterSketch

  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const fit = () => setScale(Math.min(element.clientWidth / W, element.clientHeight / H))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={box} className="flex h-[calc(100%+var(--status-bar,0px))] -mt-[var(--status-bar,0px)] items-center justify-center overflow-hidden bg-wire-canvas">
      <div style={{ width: W * scale, height: H * scale }} className="shrink-0">
        <div
          style={{
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <Phone live>
            <Component key={id} />
          </Phone>
        </div>
      </div>
    </div>
  )
}
