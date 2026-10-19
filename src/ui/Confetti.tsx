import { useEffect, useRef, type RefObject } from 'react'
import { cx } from './cx'

import type { ConfettiVariant } from './confettiVariants'

type ConfettiProps = {
  variant: ConfettiVariant
  // The round photo Photo pop bursts from (laid out in the same box as the confetti)
  around?: RefObject<HTMLElement | null>
  className?: string
}

type Shape = 'rect' | 'circle' | 'strip' | 'squiggle' | 'star'

type Piece = {
  shape: Shape
  color: string
  x: number
  y: number
  vx: number
  vy: number
  // Seconds before it appears, and how long it lives once it has
  delay: number
  age: number
  life: number
  size: number
  rotation: number
  spin: number
  // Paper turning over: its width follows cos(flip)
  flip: number
  flipSpeed: number
  sway: number
  swayPhase: number
  swaySpeed: number
  gravity: number
  drag: number
  terminal: number
}

// A ring that spreads out from the photo (Photo pop)
type Ring = { delay: number; age: number; life: number; color: string }

const random = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

function piece(colors: string[], overrides: Partial<Piece>): Piece {
  return {
    shape: 'rect',
    color: pick(colors),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    delay: 0,
    age: 0,
    life: 6,
    size: random(6, 10),
    rotation: random(0, Math.PI * 2),
    spin: random(-6, 6),
    flip: random(0, Math.PI * 2),
    flipSpeed: random(6, 12),
    sway: random(10, 40),
    swayPhase: random(0, Math.PI * 2),
    swaySpeed: random(2, 4),
    gravity: 900,
    drag: 1.4,
    terminal: 220,
    ...overrides,
  }
}

// Two party poppers in the bottom corners fire up and in as the photo pops,
// then a smaller second pop; the paper flutters down over the page
function cannons(width: number, height: number, colors: string[]) {
  const pieces: Piece[] = []
  for (const [side, count, at] of [
    [1, 70, 0.35],
    [-1, 70, 0.35],
    [1, 35, 0.75],
    [-1, 35, 0.75],
  ] as const) {
    for (let index = 0; index < count; index++) {
      // Up and toward the middle: about 62° above the floor, ±14°
      const angle = (-62 + random(-14, 14)) * (Math.PI / 180)
      // Fast enough to reach the top third before the air slows it
      const speed = random(1400, 2300) * (at > 0.5 ? 0.8 : 1)
      pieces.push(
        piece(colors, {
          shape: pick(['rect', 'rect', 'circle', 'squiggle']),
          x: side === 1 ? -6 : width + 6,
          y: height * 0.92,
          vx: Math.cos(angle) * speed * side,
          vy: Math.sin(angle) * speed,
          delay: at + random(0, 0.06),
          gravity: 600,
          drag: 1.6,
          terminal: random(160, 240),
        }),
      )
    }
  }
  return { pieces, rings: [] as Ring[] }
}

// New York's ticker-tape parade: long paper strips and confetti drifting
// down from above the screen for a few seconds, turning as they fall
function tickertape(width: number, _height: number, colors: string[]) {
  const pieces: Piece[] = []
  for (let index = 0; index < 150; index++) {
    const strip = Math.random() < 0.55
    pieces.push(
      piece(colors, {
        shape: strip ? 'strip' : pick(['rect', 'rect', 'circle']),
        size: strip ? random(22, 34) : random(6, 9),
        x: random(-10, width + 10),
        y: random(-60, -10),
        vx: random(-20, 20),
        vy: random(40, 120),
        delay: random(0, 3.2),
        life: 9,
        gravity: 140,
        drag: 0.6,
        terminal: strip ? random(90, 140) : random(120, 170),
        spin: strip ? random(-2, 2) : random(-5, 5),
        flipSpeed: strip ? random(3, 6) : random(5, 10),
        sway: strip ? random(20, 45) : random(10, 30),
        swaySpeed: random(1.2, 2.4),
      }),
    )
  }
  return { pieces, rings: [] as Ring[] }
}

// Confetti bursts out from behind the photo the moment it pops in, with a soft
// ring, then hangs and drifts down; little stars twinkle around its rim
function pop(origin: { x: number; y: number; radius: number }, colors: string[]) {
  const pieces: Piece[] = []
  for (let index = 0; index < 130; index++) {
    const angle = random(0, Math.PI * 2)
    const start = origin.radius * random(0.75, 0.95)
    const speed = random(450, 1050)
    pieces.push(
      piece(colors, {
        shape: pick(['rect', 'rect', 'circle', 'squiggle']),
        x: origin.x + Math.cos(angle) * start,
        y: origin.y + Math.sin(angle) * start,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        delay: 0.42 + random(0, 0.05),
        gravity: 700,
        drag: 3.2,
        terminal: random(110, 170),
        life: 5,
      }),
    )
  }
  for (let index = 0; index < 14; index++) {
    const angle = (index / 14) * Math.PI * 2 + random(-0.15, 0.15)
    const distance = origin.radius + random(14, 40)
    pieces.push(
      piece(colors, {
        shape: 'star',
        x: origin.x + Math.cos(angle) * distance,
        y: origin.y + Math.sin(angle) * distance,
        size: random(7, 12),
        delay: 0.7 + random(0, 1.1),
        life: random(0.9, 1.4),
        gravity: 0,
        terminal: 0,
        spin: random(-1, 1),
        sway: 0,
      }),
    )
  }
  const rings: Ring[] = [
    { delay: 0.42, age: 0, life: 0.6, color: colors[0] },
    { delay: 0.52, age: 0, life: 0.7, color: colors[1] },
  ]
  return { pieces, rings }
}

function drawPiece(context: CanvasRenderingContext2D, p: Piece) {
  context.save()
  context.translate(p.x, p.y)
  context.rotate(p.rotation)
  context.fillStyle = p.color
  context.strokeStyle = p.color

  if (p.shape === 'star') {
    // Grows in, twinkles and fades
    const t = p.age / p.life
    const scale = Math.sin(Math.PI * Math.min(1, t)) ** 0.7
    context.globalAlpha = scale
    context.scale(scale, scale)
    const r = p.size
    context.beginPath()
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? r : r * 0.28
      const a = (i / 8) * Math.PI * 2
      context.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
    }
    context.closePath()
    context.fill()
    context.restore()
    return
  }

  // Paper turning over: thin when edge-on, a touch darker on its back
  const turn = Math.cos(p.flip)
  context.scale(1, Math.max(0.08, Math.abs(turn)))
  context.globalAlpha = turn < 0 ? 0.78 : 1
  const fadeOut = p.life - p.age
  if (fadeOut < 0.6) context.globalAlpha *= Math.max(0, fadeOut / 0.6)

  const s = p.size
  switch (p.shape) {
    case 'rect':
      context.fillRect(-s / 2, -s * 0.32, s, s * 0.64)
      break
    case 'circle':
      context.beginPath()
      context.arc(0, 0, s * 0.42, 0, Math.PI * 2)
      context.fill()
      break
    case 'strip': {
      // Long ticker tape, gently waved
      context.lineWidth = 3.2
      context.lineCap = 'round'
      context.beginPath()
      for (let i = 0; i <= 8; i++) {
        const y = -s / 2 + (s * i) / 8
        const x = Math.sin(i * 0.9 + p.swayPhase) * 2.4
        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.stroke()
      break
    }
    case 'squiggle': {
      context.lineWidth = 2.4
      context.lineCap = 'round'
      context.beginPath()
      for (let i = 0; i <= 6; i++) {
        const x = -s * 0.7 + (s * 1.4 * i) / 6
        const y = Math.sin(i * 1.6) * s * 0.28
        if (i === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.stroke()
      break
    }
  }
  context.restore()
}

// Celebration confetti over a screen, drawn on a canvas that fills its parent
// and plays once. Paper pieces, ticker tape and stars in the brand colors.
// Variants are compared in the debug panel (Welcome confetti).
export function Confetti({ variant, around, className }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Its own points, even when the phone frame is scaled to fit the window
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    const styles = getComputedStyle(document.documentElement)
    const colors = ['baton-blue', 'baton-pink', 'baton-yellow', 'baton-olive'].map((name) =>
      styles.getPropertyValue(`--color-${name}`).trim(),
    )
    // The photo's center and radius; its pop-in scale doesn't move its layout box
    const photo = around?.current
    const origin = photo
      ? { x: photo.offsetLeft + photo.offsetWidth / 2, y: photo.offsetTop + photo.offsetHeight / 2, radius: photo.offsetWidth / 2 }
      : { x: width / 2, y: height / 2, radius: 100 }
    const { pieces, rings } =
      variant === 'cannons'
        ? cannons(width, height, colors)
        : variant === 'tickertape'
          ? tickertape(width, height, colors)
          : pop(origin, colors)

    let frame = 0
    let last = performance.now()
    let clock = 0
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += dt
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      let alive = false
      for (const ring of rings) {
        if (clock < ring.delay) {
          alive = true
          continue
        }
        ring.age += dt
        const t = ring.age / ring.life
        if (t >= 1) continue
        alive = true
        const center = origin
        const eased = 1 - (1 - t) ** 3
        context.save()
        context.globalAlpha = (1 - t) * 0.7
        context.strokeStyle = ring.color
        context.lineWidth = 6 * (1 - t) + 1
        context.beginPath()
        context.arc(center.x, center.y, center.radius + eased * 70, 0, Math.PI * 2)
        context.stroke()
        context.restore()
      }

      for (const p of pieces) {
        if (clock < p.delay) {
          alive = true
          continue
        }
        p.age += dt
        if (p.age > p.life || p.y > height + 60) continue
        alive = true
        // Air slows it down; gravity pulls it to a gentle falling speed
        const slow = Math.exp(-p.drag * dt)
        p.vx *= slow
        p.vy = p.vy * slow + p.gravity * dt
        if (p.terminal > 0 && p.vy > p.terminal) p.vy += (p.terminal - p.vy) * Math.min(1, dt * 6)
        p.swayPhase += p.swaySpeed * dt
        p.x += (p.vx + Math.sin(p.swayPhase) * p.sway) * dt
        p.y += p.vy * dt
        p.rotation += p.spin * dt
        p.flip += p.flipSpeed * dt
        drawPiece(context, p)
      }

      if (alive) frame = requestAnimationFrame(step)
      else context.clearRect(0, 0, width, height)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // Plays once per mount; remount (a new key) to play again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={cx('pointer-events-none absolute inset-0 size-full', className)} />
}
