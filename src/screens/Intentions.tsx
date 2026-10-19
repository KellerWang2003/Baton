import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { goBack } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { goalBubbles, intentions } from '../data/intentions'
import { ArrowRightIcon, Button, FluidGlass } from '../ui'
import { cx } from '../ui/cx'
import { defaultGlassTuning } from '../ui/promptGlass'

// Bubble diameter in points (Figma 322:8877)
const SIZE = 142
// Fluid Glass draws a bit wider than the size it's given and fills 72% of its
// own canvas (as on Today), so its canvas is bigger than the bubble
const GLASS = SIZE * (330 / 370)
const BOX = Math.ceil(SIZE / 0.72)
// Figma measures from the top of the frame; our page starts under the status
// bar, and the bubbles sit a little higher since the subtitle is gone
const TOP = 54 + 30
// The canvas: every bubble's edge, plus a margin to pan past
const EDGE = SIZE / 2 + 24
const bounds = {
  left: Math.min(...goalBubbles.map((bubble) => bubble.x)) - EDGE,
  right: Math.max(...goalBubbles.map((bubble) => bubble.x)) + EDGE,
  top: Math.min(...goalBubbles.map((bubble) => bubble.y)) - TOP - EDGE,
  bottom: Math.max(...goalBubbles.map((bubble) => bubble.y)) - TOP + EDGE,
}
// Room the pinned title and button take over the canvas
const HEADER = 130
const FOOTER = 110

// Choosing her intentions for New York (Figma "choosing intentions", 322:8877),
// before her last night in LA; opened from Profile. A canvas of glass bubbles
// in loose, overlapping spots that she pans around in any direction, tapping as
// many as she wants (Keller, Oct 19: free, no limits). The bubbles themselves
// don't move: one Fluid Glass lens is rendered once and its still image is
// every bubble's glass, with the blue fill and the goal on it.
export function Intentions() {
  const [picked, setPicked] = useState(useStore().goals)
  const shell = useGlassShell()
  const done = () => {
    setState({ goals: picked })
    goBack('profile')
  }

  return (
    <div className="relative h-full overflow-hidden bg-baton-paper font-display text-baton-navy">
      {shell.node}
      <PanCanvas>
          {goalBubbles.map((bubble, i) => (
            <Bubble
              key={bubble.goal}
              label={bubble.goal}
              glass={shell.url}
              picked={picked.includes(bubble.goal)}
              x={bubble.x}
              y={bubble.y - TOP}
              delay={i * 25}
              onTap={() => setPicked(toggleIn(picked, bubble.goal))}
            />
          ))}
      </PanCanvas>

      {/* Pinned over the canvas, which slides under them and fades out */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-baton-paper from-70% to-baton-paper/0 pb-8">
        <h1 className="animate-splash-rise pt-9 text-center text-[30px] font-medium leading-[30px] tracking-[-0.011em]">
          {intentions.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
      </header>
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-linear-to-t from-baton-paper from-55% to-baton-paper/0 px-6 pb-9 pt-14">
        <Button block variant="glow" size="cta" onClick={done} className="pointer-events-auto">
          {intentions.cta}
          <ArrowRightIcon />
        </Button>
      </footer>
    </div>
  )
}

// Drag (or scroll a trackpad or wheel) to pan the canvas any way, with a glide
// after letting go. It stops at the canvas's edges, with the pinned title and
// button counted, and starts on Figma's view.
function PanCanvas({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, raf: 0, down: null as null | { x: number; y: number; px: number; py: number; t: number }, travel: 0 })

  const clamp = (x: number, y: number) => {
    const box = viewport.current
    const width = box?.clientWidth ?? 402
    const height = box?.clientHeight ?? 820
    const minX = Math.min(0, width - bounds.right)
    const maxX = Math.max(0, -bounds.left)
    const minY = Math.min(0, height - FOOTER - bounds.bottom)
    const maxY = Math.max(0, HEADER - bounds.top)
    return [Math.min(maxX, Math.max(minX, x)), Math.min(maxY, Math.max(minY, y))]
  }
  const place = (x: number, y: number) => {
    const s = state.current
    ;[s.x, s.y] = clamp(x, y)
    if (layer.current) layer.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`
  }
  const glide = () => {
    const s = state.current
    cancelAnimationFrame(s.raf)
    const step = () => {
      s.vx *= 0.94
      s.vy *= 0.94
      place(s.x + s.vx, s.y + s.vy)
      if (Math.hypot(s.vx, s.vy) > 0.2) s.raf = requestAnimationFrame(step)
    }
    s.raf = requestAnimationFrame(step)
  }
  useEffect(() => {
    const s = state.current
    place(s.x, s.y)
    const box = viewport.current
    // Wheel and trackpad scrolling pan too (not passive, so the page doesn't scroll)
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      cancelAnimationFrame(s.raf)
      place(s.x - event.deltaX, s.y - event.deltaY)
    }
    box?.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      box?.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(s.raf)
    }
  })

  const handlers = {
    onPointerDown: (event: ReactPointerEvent) => {
      const s = state.current
      cancelAnimationFrame(s.raf)
      s.down = { x: event.clientX - s.x, y: event.clientY - s.y, px: event.clientX, py: event.clientY, t: performance.now() }
      s.vx = 0
      s.vy = 0
      s.travel = 0
    },
    onPointerMove: (event: ReactPointerEvent) => {
      const s = state.current
      if (!s.down) return
      const now = performance.now()
      const dt = Math.max(now - s.down.t, 1)
      // Velocity in px per frame, for the glide
      s.vx = ((event.clientX - s.down.px) / dt) * 16
      s.vy = ((event.clientY - s.down.py) / dt) * 16
      s.travel += Math.hypot(event.clientX - s.down.px, event.clientY - s.down.py)
      s.down.px = event.clientX
      s.down.py = event.clientY
      s.down.t = now
      // Only grab the pointer once it's a drag, so a tap still clicks its bubble
      if (s.travel > 6 && !(event.target as Element).hasPointerCapture?.(event.pointerId)) {
        viewport.current?.setPointerCapture(event.pointerId)
      }
      place(event.clientX - s.down.x, event.clientY - s.down.y)
    },
    onPointerUp: () => {
      const s = state.current
      if (!s.down) return
      s.down = null
      if (Math.hypot(s.vx, s.vy) > 1) glide()
    },
    onPointerCancel: () => {
      state.current.down = null
    },
  }

  return (
    <div
      ref={viewport}
      {...handlers}
      // A drag that ends on a bubble doesn't pick it
      onClickCapture={(event) => {
        if (state.current.travel > 6) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
    >
      <div ref={layer} className="absolute left-0 top-0 will-change-transform">
        {children}
      </div>
    </div>
  )
}

// One Fluid Glass lens over plain paper (the blue rim and edge band from
// Today's glass), drawn once and read back as an image, so the
// page holds one WebGL canvas for a moment instead of one per bubble.
function useGlassShell() {
  const { color, edge, ...glass } = defaultGlassTuning
  const [url, setUrl] = useState<string | null>(null)
  const holder = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (url) return
    let alive = true
    let tries = 0
    // Wait until the lens has compiled and drawn, then read it back
    const timer = window.setInterval(() => {
      const canvas = holder.current?.querySelector('canvas')
      tries += 1
      const still = canvas && copy(canvas)
      if (!alive || !still || (!drawn(still) && tries < 200)) return
      window.clearInterval(timer)
      setUrl(centered(still).toDataURL('image/png'))
    }, 150)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [url])

  const node = url ? null : (
    // In the middle of the screen: Fluid Glass trims its canvas to what's on
    // screen, so a lens near an edge would come out off-center
    <div
      ref={holder}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
      style={{ width: BOX, height: BOX }}
    >
      <FluidGlass
        text=""
        color={color || token('--color-baton-blue')}
        // Paper inside, as on Today, so the rim reads blue
        background={token('--color-baton-paper')}
        transparentOutside
        {...glass}
        // A clearer blue rim than Today's, and no shadow ring (Figma 322:8877)
        rim={Math.min(edge * 1.6, 1)}
        shadow={0}
        size={GLASS}
        interaction="static"
        idle={false}
        breathe={0}
        intro={false}
        morphOnClick={false}
        preserve
      />
    </div>
  )
  return { url, node }
}

type BubbleProps = {
  label: string
  // The still glass, once it's drawn (it fades in over the words)
  glass: string | null
  picked: boolean
  x: number
  y: number
  delay: number
  onTap: () => void
}

// One goal: the still glass, then the blue fill (grows from the middle once
// picked) and the words on it. A tap squishes it a little.
function Bubble({ label, glass, picked, x, y, delay, onTap }: BubbleProps) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onTap}
      style={{ left: x - SIZE / 2, top: y - SIZE / 2, width: SIZE, height: SIZE, animationDelay: `${delay}ms` }}
      className="absolute animate-fade-in rounded-full outline-none transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95"
    >
      {/* The glass, faded out once picked so the blue reads clean, with no
          rim or border around it (Figma 322:8877, Keller Oct 19) */}
      <span
        aria-hidden
        className={cx('pointer-events-none absolute inset-0 transition-opacity duration-300', picked ? 'opacity-0' : 'opacity-100')}
      >
        {glass && (
          <img
            src={glass}
            alt=""
            draggable={false}
            className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 animate-fade-in select-none"
            style={{ width: BOX, height: BOX }}
          />
        )}
      </span>
      <span
        aria-hidden
        className={cx(
          'absolute inset-0 rounded-full transition-[scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]',
          picked ? 'scale-100 opacity-100' : 'scale-60 opacity-0',
        )}
        // Brand blue in the middle, softening to a pale blue at the edge
        style={{
          background:
            'radial-gradient(circle closest-side, var(--color-baton-blue) 0%, color-mix(in srgb, var(--color-baton-blue) 68%, white) 45%, color-mix(in srgb, var(--color-baton-blue) 38%, white) 85%, color-mix(in srgb, var(--color-baton-blue) 30%, white) 100%)',
        }}
      />
      <span className="relative mx-auto block w-[93px] text-center text-[18px] leading-[21px] tracking-[-0.011em] text-baton-navy">
        {label}
      </span>
    </button>
  )
}

// A 2D copy of the glass as it is on screen right now
function copy(canvas: HTMLCanvasElement) {
  if (!canvas.width) return null
  const still = document.createElement('canvas')
  still.width = canvas.width
  still.height = canvas.height
  still.getContext('2d')?.drawImage(canvas, 0, 0)
  return still
}

// Whether the copy has the glass on it yet (enough of it isn't clear)
function drawn(still: HTMLCanvasElement) {
  const pixels = still.getContext('2d')?.getImageData(0, 0, still.width, still.height).data
  if (!pixels) return false
  let alpha = 0
  for (let i = 3; i < pixels.length; i += 16) alpha += pixels[i]
  return alpha > (pixels.length / 16) * 255 * 0.2
}

// The lens cut out square around its own middle, as big as the glass's box.
// Inside the scaled phone frame Fluid Glass can draw the lens off its canvas's
// center, so find it by its solid pixels rather than trusting the layout.
function centered(still: HTMLCanvasElement) {
  const ctx = still.getContext('2d')
  const pixels = ctx?.getImageData(0, 0, still.width, still.height).data
  if (!pixels) return still
  let left = still.width
  let right = 0
  let top = still.height
  let bottom = 0
  for (let y = 0; y < still.height; y++) {
    for (let x = 0; x < still.width; x++) {
      if (pixels[(y * still.width + x) * 4 + 3] < 200) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  if (right <= left) return still
  // The lens fills 72% of its box, as Fluid Glass draws it
  const side = Math.round((right - left) / 0.72)
  const out = document.createElement('canvas')
  out.width = side
  out.height = side
  out.getContext('2d')?.drawImage(still, (left + right) / 2 - side / 2, (top + bottom) / 2 - side / 2, side, side, 0, 0, side, side)
  return out
}

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
