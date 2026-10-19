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
// Match the Archive detail photo cloud's spring response.
const LAG_PER_SPEED = 0.8
const MAX_BUBBLE_LAG = 20
const FINGER_REACH = 110
const BUBBLE_SPRING = 0.07
const BUBBLE_DAMPING = 0.2

// Choosing her intentions for New York (Figma "choosing intentions", 322:8877),
// before her last night in LA; opened from Profile. A canvas of glass bubbles
// in a loosely spaced cloud that she pans around in any direction, tapping as
// many as she wants (Keller, Oct 19: free, no limits). The bubbles themselves
// trail the pan on individual springs. One Fluid Glass lens is rendered once
// and its still image is every bubble's glass, with the blue fill and goal.
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
          <div key={bubble.goal} data-intention-bubble className="absolute left-0 top-0">
            <Bubble
              label={bubble.goal}
              glass={shell.url}
              picked={picked.includes(bubble.goal)}
              x={bubble.x}
              y={bubble.y - TOP}
              delay={i * 25}
              onTap={() => setPicked(toggleIn(picked, bubble.goal))}
            />
          </div>
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
// button counted, and starts on the center of the intention cloud.
function PanCanvas({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, raf: 0, down: null as null | { x: number; y: number; px: number; py: number; t: number }, travel: 0 })

  // Convert screen coordinates to canvas points when the phone frame is scaled.
  const local = (event: ReactPointerEvent) => {
    const box = viewport.current!
    const rect = box.getBoundingClientRect()
    const scale = box.clientWidth / rect.width || 1
    return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * scale }
  }

  // Measure the actual canvas velocity, so dragging, wheel scrolling and the
  // release glide all feed the same springs. Nearby bubbles follow the finger
  // more closely; distant ones lag a little, with varied weights.
  useEffect(() => {
    const nodes = Array.from(layer.current?.querySelectorAll<HTMLElement>('[data-intention-bubble]') ?? [])
    const offsets = new Float32Array(nodes.length * 2)
    const speeds = new Float32Array(nodes.length * 2)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previousX = state.current.x
    let previousY = state.current.y
    let previousFinger: { x: number; y: number } | null = null
    let flowX = 0
    let flowY = 0
    let followX = 0
    let followY = 0
    let previousTime = performance.now()
    let settled = true
    let frame = 0

    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      const dt = Math.max(0.25, Math.min(3, (now - previousTime) / 16.67))
      previousTime = now
      const s = state.current
      const moveX = (s.x - previousX) / dt
      const moveY = (s.y - previousY) / dt
      previousX = s.x
      previousY = s.y
      const finger = s.down ? { x: s.down.px, y: s.down.py } : null
      const fingerX = finger && previousFinger ? (finger.x - previousFinger.x) / dt : 0
      const fingerY = finger && previousFinger ? (finger.y - previousFinger.y) / dt : 0
      previousFinger = finger
      // Filter event bursts into a continuous flow, including when the finger
      // lifts. This avoids a sudden change in each bubble's spring target.
      const blend = 1 - Math.exp(-dt / 2)
      flowX += (moveX - flowX) * blend
      flowY += (moveY - flowY) * blend
      followX += (fingerX - followX) * blend
      followY += (fingerY - followY) * blend
      if (reducedMotion.matches) {
        if (!settled) {
          offsets.fill(0)
          speeds.fill(0)
          nodes.forEach((node) => { node.style.transform = '' })
          settled = true
        }
        return
      }
      if (settled && moveX === 0 && moveY === 0 && fingerX === 0 && fingerY === 0) return

      let energy = Math.abs(moveX) + Math.abs(moveY) + Math.abs(flowX) + Math.abs(flowY) + Math.abs(followX) + Math.abs(followY)
      nodes.forEach((node, index) => {
        const bubble = goalBubbles[index]
        const distance = finger
          ? Math.hypot(s.x + bubble.x - finger.x, s.y + bubble.y - TOP - finger.y)
          : 0
        const influence = finger ? 1 / (1 + (distance / FINGER_REACH) ** 2) : 0
        const weight = 0.8 + ((index * 37) % 10) / 22
        for (let axis = 0; axis < 2; axis++) {
          const k = index * 2 + axis
          const move = axis === 0 ? flowX : flowY
          const follow = (axis === 0 ? followX : followY) * influence
          const pull = (follow - move) * LAG_PER_SPEED * weight
          const target = MAX_BUBBLE_LAG * Math.tanh(pull / MAX_BUBBLE_LAG)
          // Small integration steps keep the spring consistent on slower frames.
          const steps = Math.ceil(dt * 2)
          const h = dt / steps
          const stiffness = BUBBLE_SPRING / weight
          for (let step = 0; step < steps; step++) {
            speeds[k] += ((target - offsets[k]) * stiffness - speeds[k] * BUBBLE_DAMPING) * h
            offsets[k] += speeds[k] * h
          }
          energy += Math.abs(offsets[k]) + Math.abs(speeds[k])
        }
        node.style.transform = `translate3d(${offsets[index * 2]}px, ${offsets[index * 2 + 1]}px, 0)`
      })
      settled = energy < 0.05
      if (settled) {
        offsets.fill(0)
        speeds.fill(0)
        nodes.forEach((node) => { node.style.transform = '' })
      }
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

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
  const place = (x: number, y: number, mode: 'clamp' | 'drag' | 'glide' = 'clamp') => {
    const s = state.current
    const [boundedX, boundedY] = clamp(x, y)
    // Increasing resistance at the edge, followed by a soft spring return.
    const resist = (distance: number) => Math.sign(distance) * 42 * (1 - Math.exp(-Math.abs(distance) / 100))
    s.x = mode === 'drag' ? boundedX + resist(x - boundedX) : mode === 'glide' ? x : boundedX
    s.y = mode === 'drag' ? boundedY + resist(y - boundedY) : mode === 'glide' ? y : boundedY
    if (layer.current) layer.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`
  }
  const glide = () => {
    const s = state.current
    cancelAnimationFrame(s.raf)
    const speed = Math.hypot(s.vx, s.vy)
    const cap = speed ? (32 * Math.tanh(speed / 32)) / speed : 1
    s.vx *= cap
    s.vy *= cap
    let previousTime = performance.now()
    let edgeX: number | null = null
    let edgeY: number | null = null
    const step = (now: number) => {
      const dt = Math.max(0.1, Math.min(3, (now - previousTime) / 16.67))
      previousTime = now
      const steps = Math.ceil(dt * 2)
      const h = dt / steps
      for (let i = 0; i < steps; i++) {
        const [x, y] = clamp(s.x, s.y)
        if (x !== s.x) edgeX = x
        if (y !== s.y) edgeY = y
        const outsideX = edgeX === null ? 0 : edgeX - s.x
        const outsideY = edgeY === null ? 0 : edgeY - s.y
        s.vx = (s.vx + outsideX * 0.12 * h) * Math.pow(edgeX !== null ? 0.72 : 0.94, h)
        s.vy = (s.vy + outsideY * 0.12 * h) * Math.pow(edgeY !== null ? 0.72 : 0.94, h)
        place(s.x + s.vx * h, s.y + s.vy * h, 'glide')
      }
      const [x, y] = clamp(s.x, s.y)
      if (Math.hypot(s.vx, s.vy) < 0.04 && Math.hypot((edgeX ?? x) - s.x, (edgeY ?? y) - s.y) < 0.1) {
        place(edgeX ?? x, edgeY ?? y)
        return
      }
      s.raf = requestAnimationFrame(step)
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
      const point = local(event)
      cancelAnimationFrame(s.raf)
      s.down = { x: point.x - s.x, y: point.y - s.y, px: point.x, py: point.y, t: performance.now() }
      s.vx = 0
      s.vy = 0
      s.travel = 0
    },
    onPointerMove: (event: ReactPointerEvent) => {
      const s = state.current
      if (!s.down) return
      const point = local(event)
      const now = performance.now()
      const dt = Math.max(now - s.down.t, 1)
      // Time-based smoothing gives slow drags and quick flicks a consistent feel.
      const blend = 1 - Math.exp(-dt / 35)
      s.vx += (((point.x - s.down.px) / dt) * 16.67 - s.vx) * blend
      s.vy += (((point.y - s.down.py) / dt) * 16.67 - s.vy) * blend
      s.travel += Math.hypot(point.x - s.down.px, point.y - s.down.py)
      s.down.px = point.x
      s.down.py = point.y
      s.down.t = now
      // Only grab the pointer once it's a drag, so a tap still clicks its bubble
      if (s.travel > 6 && !(event.target as Element).hasPointerCapture?.(event.pointerId)) {
        viewport.current?.setPointerCapture(event.pointerId)
      }
      place(point.x - s.down.x, point.y - s.down.y, 'drag')
    },
    onPointerUp: () => {
      const s = state.current
      if (!s.down) return
      const decay = Math.exp(-Math.max(0, performance.now() - s.down.t - 30) / 45)
      s.vx *= decay
      s.vy *= decay
      s.down = null
      if (s.travel > 6) glide()
    },
    onPointerCancel: () => {
      state.current.down = null
      state.current.vx = 0
      state.current.vy = 0
      glide()
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
