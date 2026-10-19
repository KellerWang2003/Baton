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
// Resolution of the orb picture the glass refracts
const PICTURE = 360
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

function rgba(hex: string, alpha: number) {
  const value = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

// The orb's picture: three soft color blobs, turned by `rotation`. With
// `focus` at 0 they share the orb evenly; at 1 the color on top swells to fill
// most of it and the other two shrink into the bottom corners (Figma
// ARCHIVE_detail feeling / people / places). Colors come from the brand tokens.
function drawPicture(canvas: HTMLCanvasElement, rotation: number, focus: number) {
  const context = canvas.getContext('2d')
  if (!context) return
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string) => styles.getPropertyValue(`--color-${name}`).trim()
  const size = canvas.width
  const center = size / 2
  const radius = (size / 2) * (ORB_SIZE / GLASS_SIZE)
  // Only the orb's circle is painted; the rest stays clear, because the glass
  // shows this picture outside its lens too (over the photos)
  context.clearRect(0, 0, size, size)
  context.save()
  context.beginPath()
  context.arc(center, center, radius, 0, Math.PI * 2)
  context.clip()
  context.fillStyle = token('baton-paper')
  context.fillRect(0, 0, size, size)

  const blobs = (['blue', 'pink', 'yellow'] as const).map((color) => {
    const top = topness(color, rotation)
    const grow = focus * top ** 3
    const shrink = focus * (1 - top)
    const distance = radius * (0.42 * (1 - grow) + 0.1 * grow + 0.35 * shrink)
    const angle = toRadians(BLOB_ANGLE[color] + rotation)
    return {
      color,
      grow,
      x: center + Math.cos(angle) * distance,
      // In filter mode only the top half shows, so the other two rise to its bottom corners
      y: center + Math.sin(angle) * distance - radius * 0.45 * shrink,
      size: radius * (0.8 + 0.75 * grow) * (1 - 0.35 * shrink),
    }
  })
  // The swelling color goes down first so the other two still peek over its edges
  blobs.sort((a, b) => b.grow - a.grow)
  for (const blob of blobs) {
    const hex = token(`baton-${blob.color}`)
    const gradient = context.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.size)
    gradient.addColorStop(0, rgba(hex, 1))
    gradient.addColorStop(0.5, rgba(hex, 1))
    gradient.addColorStop(1, rgba(hex, 0))
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  context.restore()
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
    drawPicture(canvas, startRotation, startFocus)
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

  function redraw() {
    drawPicture(picture, rotation.current, focus.current)
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
        {/* The glass canvas spills past the orb (uncropped) so its rim shows */}
        <div
          style={{ width: GLASS_SIZE, height: GLASS_SIZE }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <FluidGlass
            canvas={picture}
            canvasFrame={frame}
            text=""
            shape="lens"
            size={ORB_SIZE}
            // Outside the lens the canvas is clear, so only the glass shows
            transparentOutside
            background={token('--color-baton-paper')}
            // Today's glass, lighter on the blue: a clear edge band and line,
            // a touch of blue at the rim, and a slow small morph while it rests
            color={token('--color-baton-blue')}
            rim={0.2}
            ring={1}
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
              'pointer-events-none absolute inset-x-0 top-[40px] animate-fade-in text-center text-body',
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
