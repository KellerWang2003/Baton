import { useEffect, useRef, useState } from 'react'
import { cx } from './cx'
import FluidGlass from './FluidGlass'

type OrbColor = 'pink' | 'yellow' | 'blue'

export type OrbFilter<Id extends string> = { id: Id; label: string; color: OrbColor }

type FilterOrbProps<Id extends string> = {
  // Exactly three filters, one per color
  filters: OrbFilter<Id>[]
  value: Id | null
  onChange: (value: Id | null) => void
  className?: string
}

const ORB_SIZE = 250
// Same setup as Today's glass circle (PromptWindow): Fluid Glass draws its rim
// a little past the size it's given and fills only 72% of its canvas, so the
// canvas is bigger than the orb and isn't cropped, letting the rim show.
const RIM_RATIO = 370 / 330
const GLASS_SIZE = Math.ceil((ORB_SIZE * RIM_RATIO) / 0.72)
// The glass paints its picture around the lens too, so the canvas is masked
// to a circle just past the lens edge (the rim), feathered by a few points
const LENS_RADIUS = (ORB_SIZE * RIM_RATIO) / 2
const LENS_MASK = `radial-gradient(circle at 50% 50%, black ${LENS_RADIUS + 1}px, transparent ${LENS_RADIUS + 4}px)`
// Resolution of the orb picture the glass refracts
const PICTURE = 512
// Where each color's blob sits at rest, in degrees (0 = right, -90 = top)
const BLOB_ANGLE: Record<OrbColor, number> = { blue: -90, pink: 30, yellow: 150 }
// A drag shorter than this is a tap (and does nothing)
const SLOP = 6
// How far up a swipe must go to leave filter mode
const SWIPE_OUT = 36

const wash: Record<OrbColor, string> = {
  pink: 'to-baton-pink',
  yellow: 'to-baton-yellow',
  blue: 'to-baton-blue',
}

const labelColor: Record<OrbColor, string> = {
  pink: 'text-on-baton-pink-muted',
  yellow: 'text-on-baton-yellow-muted',
  blue: 'text-white',
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// How close a color's blob is to the top of the orb at this rotation: 1 on
// top, 0 at the sides and below
function topness(color: OrbColor, rotation: number) {
  return Math.max(0, Math.cos(toRadians(BLOB_ANGLE[color] + rotation + 90)))
}

// Rotation that turns a color to the top, picked to be the closest turn to
// `from` so the orb never spins the long way round
function turnTo(color: OrbColor, from: number) {
  const target = -90 - BLOB_ANGLE[color]
  return target + Math.round((from - target) / 360) * 360
}

function closestToTop<T extends { color: OrbColor }>(filters: T[], rotation: number) {
  return filters.reduce((best, filter) => (topness(filter.color, rotation) > topness(best.color, rotation) ? filter : best))
}

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// The color field is worked out on a small grid, then scaled up smoothly over
// the whole picture, which keeps it fast enough to redraw every frame
const FIELD = 170
const field = typeof document !== 'undefined' ? document.createElement('canvas') : null
if (field) {
  field.width = FIELD
  field.height = FIELD
}
// The picture spans the glass canvas, which is wider than the orb
const SPAN = GLASS_SIZE / ORB_SIZE

function rgbOf(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

// The orb's picture: three colors flowing into each other like ink in water,
// turned by `rotation` and always drifting with `time` (seconds). Each color
// pulls on the points near its center (plus a smaller second lobe that drifts
// on its own); the points are first swirled and pushed through three layers of
// moving waves (domain warping), so the borders
// curl into uneven, living shapes that keep folding into each other, and
// where colors meet they mix softly. Toward the edge all three haze together.
// With `focus` at 0 the colors share the orb evenly; at 1 the color on top
// swells to fill most of it and the other two shrink into the bottom corners
// (Figma ARCHIVE_detail feeling / people / places). Colors come from the brand
// tokens. The colors run past the orb's edge on purpose: the glass bends what
// is just outside its rim in, so a hard stop there shows as a broken edge.
function drawPicture(canvas: HTMLCanvasElement, rotation: number, focus: number, time: number) {
  const context = canvas.getContext('2d')
  const fieldContext = field?.getContext('2d')
  if (!context || !field || !fieldContext) return
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(`--color-${name}`).trim()
  const t = time * 0.35

  // Blob centers and reach, in orb units (-1..1 across the orb), each
  // wandering a little on its own
  const blobs = (['blue', 'pink', 'yellow'] as const).map((color, index) => {
    const top = topness(color, rotation)
    const grow = focus * top ** 3
    const shrink = focus * (1 - top)
    const distance = 0.42 * (1 - grow) + 0.1 * grow + 0.35 * shrink
    const angle = toRadians(BLOB_ANGLE[color] + rotation)
    const reach = (0.8 + 0.75 * grow) * (1 - 0.35 * shrink)
    const wander = 0.09 * (1 - 0.6 * grow)
    return {
      rgb: rgbOf(token(`baton-${color}`)),
      x: Math.cos(angle) * distance + wander * Math.sin(t * 0.9 + index * 2.1),
      // In filter mode only the top half shows, so the other two rise to its bottom corners
      y: Math.sin(angle) * distance - 0.45 * shrink + wander * Math.cos(t * 0.7 + index * 1.3),
      pull: 1 / (reach * reach),
    }
  })
  // Each color also has a smaller second lobe that drifts around the orb on
  // its own, so colors break into each other's areas instead of keeping
  // three tidy slices. They fade out as a filter takes over the orb.
  const lobes = (['blue', 'pink', 'yellow'] as const).map((color, index) => {
    const angle = toRadians(BLOB_ANGLE[color] + rotation + 140 + 45 * Math.sin(t * 0.45 + index * 2.4))
    const distance = 0.58 + 0.12 * Math.sin(t * 0.8 + index)
    const reach = 0.42 * (1 - 0.8 * focus)
    return {
      rgb: blobs[index].rgb,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      pull: 1 / Math.max(0.01, reach * reach),
    }
  })
  const sources = [...blobs, ...lobes]
  // The three mixed together, a soft lavender-gray, hazes in toward the edge
  const mist = [0, 1, 2].map((channel) => blobs.reduce((sum, blob) => sum + blob.rgb[channel], 0) / blobs.length)
  // Turning the orb stirs the colors too
  const stir = toRadians(rotation) * 0.6
  const swirlAmount = 1.5 + 0.35 * Math.sin(t * 0.6)

  const image = fieldContext.createImageData(FIELD, FIELD)
  const data = image.data
  for (let row = 0; row < FIELD; row++) {
    for (let column = 0; column < FIELD; column++) {
      let x = (((column + 0.5) / FIELD) * 2 - 1) * SPAN
      let y = (((row + 0.5) / FIELD) * 2 - 1) * SPAN
      const r = Math.hypot(x, y)
      // Swirl: points turn more toward the middle, curling the borders
      const swirl = swirlAmount * Math.max(0, 1 - r) ** 1.3
      const cos = Math.cos(swirl)
      const sin = Math.sin(swirl)
      ;[x, y] = [x * cos - y * sin, x * sin + y * cos]
      // Two layers of moving waves, the second riding on the first
      const ax = x + 0.3 * Math.sin(1.7 * y + t * 1.1 + stir + Math.sin(2.3 * x - t * 0.7))
      const ay = y + 0.3 * Math.sin(1.9 * x - t * 0.9 - stir + Math.sin(2.1 * y + t * 0.5))
      const bx = ax + 0.13 * Math.sin(3.4 * ay - t * 1.4)
      const by = ay + 0.13 * Math.sin(3.1 * ax + t * 1.2)
      // A finer third layer so the borders ripple at small scale too
      const wx = bx + 0.05 * Math.sin(7.3 * by + t * 1.9)
      const wy = by + 0.05 * Math.sin(6.7 * bx - t * 1.7)
      // Each color's share falls off with distance; sharpness keeps the
      // regions bold with soft, mixed edges between them
      let total = 0
      let red = 0
      let green = 0
      let blue = 0
      for (const blob of sources) {
        const d2 = ((wx - blob.x) ** 2 + (wy - blob.y) ** 2) * blob.pull
        const share = Math.exp(-12 * d2)
        total += share
        red += share * blob.rgb[0]
        green += share * blob.rgb[1]
        blue += share * blob.rgb[2]
      }
      const haze = 0.35 * Math.min(1, Math.max(0, (r - 0.68) / 0.32)) ** 2
      const index = (row * FIELD + column) * 4
      data[index] = (red / total) * (1 - haze) + mist[0] * haze
      data[index + 1] = (green / total) * (1 - haze) + mist[1] * haze
      data[index + 2] = (blue / total) * (1 - haze) + mist[2] * haze
      data[index + 3] = 255
    }
  }
  fieldContext.putImageData(image, 0, 0)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(field, 0, 0, canvas.width, canvas.height)
}

type Gesture = {
  id: number
  x: number
  y: number
  angle: number
  mode: 'pending' | 'turn' | 'swipe'
}

// The tricolor orb at the bottom of a city's photo cloud: a lens of liquid
// glass (Fluid Glass, set up like Today's circle) over three color blobs. Start turning it to enter filter mode: whichever
// color comes to the top swells to fill the orb and focuses its filter, and
// letting go settles on the nearest one. Swipe it up to leave filter mode and
// go back to all three colors evenly. The page gets a wash of the focused
// color along the bottom, and its name sits on the orb.
export function FilterOrb<Id extends string>({ filters, value, onChange, className }: FilterOrbProps<Id>) {
  const active = filters.find((filter) => filter.id === value) ?? null
  const startRotation = active ? turnTo(active.color, 0) : 0
  const startFocus = active ? 1 : 0
  const [picture] = useState(() => {
    const canvas = document.createElement('canvas')
    canvas.width = PICTURE
    canvas.height = PICTURE
    drawPicture(canvas, startRotation, startFocus, 0)
    return canvas
  })
  const [frame, setFrame] = useState(0)
  const [lift, setLift] = useState(0)
  const orbRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  // Animated state lives in refs and is drawn into the picture each frame
  const rotation = useRef(startRotation)
  const focus = useRef(startFocus)
  const target = useRef<{ rotation: number | null; focus: number }>({ rotation: null, focus: startFocus })
  const loop = useRef(0)

  // Seconds the colors have been drifting (frozen with reduced motion)
  const time = useRef(0)

  function redraw() {
    drawPicture(picture, rotation.current, focus.current, time.current)
    setFrame((count) => count + 1)
  }

  // Ease rotation and focus toward their targets, redrawing as they go
  function animate() {
    cancelAnimationFrame(loop.current)
    function step() {
      const goal = target.current
      let moving = false
      if (goal.rotation !== null) {
        const gap = goal.rotation - rotation.current
        rotation.current += gap * 0.2
        if (Math.abs(gap) < 0.1) {
          rotation.current = goal.rotation
          goal.rotation = null
        } else moving = true
      }
      const gap = goal.focus - focus.current
      focus.current += gap * 0.14
      if (Math.abs(gap) < 0.002) focus.current = goal.focus
      else moving = true
      redraw()
      loop.current = moving ? requestAnimationFrame(step) : 0
    }
    loop.current = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(loop.current), [])

  // The colors keep slowly swirling on their own, redrawn about 30 times a
  // second (not at all with reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last = performance.now()
    let drawn = 0
    const tick = (now: number) => {
      time.current += (now - last) / 1000
      last = now
      if (now - drawn > 33) {
        drawn = now
        redraw()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // redraw only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function angleOf(event: React.PointerEvent) {
    const rect = orbRef.current!.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    return (Math.atan2(event.clientY - y, event.clientX - x) * 180) / Math.PI
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: angleOf(event), mode: 'pending' }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y

    if (current.mode === 'pending') {
      if (Math.hypot(dx, dy) < SLOP) return
      // Moving away from the orb's center (and up) is a swipe out, only in
      // filter mode; moving around it turns, wherever on the orb you start
      const out = toRadians(current.angle)
      const away = dx * Math.cos(out) + dy * Math.sin(out)
      const around = -dx * Math.sin(out) + dy * Math.cos(out)
      current.mode = value && dy < 0 && away > Math.abs(around) * 1.2 ? 'swipe' : 'turn'
      current.angle = angleOf(event)
      if (current.mode === 'turn') {
        target.current = { rotation: null, focus: 1 }
        animate()
      }
    }

    if (current.mode === 'swipe') {
      // The orb follows the finger up a little, with resistance
      setLift(Math.min(0, dy) * 0.4)
      return
    }

    const angle = angleOf(event)
    // Crossing the ±180° seam shouldn't jump a whole turn
    const delta = ((((angle - current.angle + 180) % 360) + 360) % 360) - 180
    current.angle = angle
    rotation.current += delta
    if (!loop.current) redraw()
    const top = closestToTop(filters, rotation.current)
    if (top.id !== value) onChange(top.id)
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    gesture.current = null
    setLift(0)

    if (current.mode === 'turn') {
      // Settle on whichever color ended up closest to the top
      const top = closestToTop(filters, rotation.current)
      target.current = { rotation: turnTo(top.color, rotation.current), focus: 1 }
      animate()
      if (top.id !== value) onChange(top.id)
    } else if (current.mode === 'swipe' && event.clientY - current.y < -SWIPE_OUT) {
      // Back to the even orb and every photo
      target.current = { rotation: null, focus: 0 }
      animate()
      onChange(null)
    }
  }

  return (
    <div className={cx('pointer-events-none absolute inset-x-0 bottom-0 h-[179px]', className)}>
      {/* Wash of the focused color along the bottom of the page */}
      {filters.map((filter) => (
        <div
          key={filter.id}
          aria-hidden
          className={cx(
            'absolute inset-0 bg-linear-to-b from-transparent transition-opacity duration-500',
            wash[filter.color],
            filter.id === value ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      <div
        ref={orbRef}
        style={{ width: ORB_SIZE, height: ORB_SIZE, translate: `-50% ${lift}px` }}
        className={cx(
          'absolute left-1/2 ease-out',
          lift === 0 && 'transition-[bottom,scale,translate] duration-500',
          // Resting low and large with no filter, then rising smaller so half shows (Figma)
          active ? '-bottom-[125px] scale-80' : '-bottom-[110px] scale-100',
        )}
      >
        {/* The glass canvas spills past the orb so its rim shows, masked
            just outside the rim */}
        <div
          style={{ width: GLASS_SIZE, height: GLASS_SIZE, maskImage: LENS_MASK, WebkitMaskImage: LENS_MASK }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <FluidGlass
            canvas={picture}
            canvasFrame={frame}
            text=""
            shape="lens"
            size={ORB_SIZE}
            // Today's glass without its edge line or blue rim, so the colors run
            // to the edge, and a slow small morph while it rests
            color={token('--color-baton-blue')}
            rim={0}
            ring={0}
            breathe={0.15}
            refraction={0.5}
            dispersion={1}
            reflection={1.15}
            shadow={0.1}
            interaction="static"
            morphOnClick={false}
            idle={false}
            intro={false}
            spin={0}
            wobble={0}
          />
        </div>
        {active && (
          <span
            key={active.id}
            className={cx(
              'pointer-events-none absolute inset-x-0 top-[40px] animate-fade-in text-center font-display text-orb-label',
              labelColor[active.color],
            )}
          >
            {active.label}
          </span>
        )}
        <div
          role="slider"
          aria-label="Filter photos: turn to pick, swipe up to show all"
          aria-valuetext={active?.label ?? 'All'}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="pointer-events-auto absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing"
        />
      </div>
    </div>
  )
}
