import { useEffect, useRef, useState } from 'react'
import { goBack } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { intentions } from '../data/intentions'
import { ArrowRightIcon, Button, ChevronLeftIcon, FluidGlass } from '../ui'
import { cx } from '../ui/cx'
import { defaultGlassTuning } from '../ui/promptGlass'

// Bubble size in points, and the gap between neighbors
const SIZE = 118
const STEP = SIZE + 8
// Fluid Glass draws a bit wider than its size and fills 72% of its own canvas
// (as on Today), so each bubble's canvas is bigger than the bubble and the
// canvases overlap their neighbors
const DRAWN = SIZE * (370 / 330)
const BOX = Math.ceil(DRAWN / 0.72)
const ROW = STEP * Math.sin(Math.PI / 3)

// A honeycomb of seven: the hobby goal in the middle and the rest around it,
// in the order of intentions.goals
const spots: [number, number][] = [
  [-0.5, -1],
  [0.5, -1],
  [-1, 0],
  [1, 0],
  [0, 0],
  [-0.5, 1],
  [0.5, 1],
]

// Choosing her intentions for New York (Figma "What do you want New York to be
// for you?"), before her last night in LA; opened from Profile. Every goal is a
// bubble of real liquid glass like Today's prompt (Keller, Oct 19); tapping one
// fills it with blue from the middle. She picks three.
export function Intentions() {
  const [picked, setPicked] = useState(useStore().goals)
  const full = picked.length >= intentions.max
  const toggle = (goal: string) => {
    if (!picked.includes(goal) && full) return
    setPicked(toggleIn(picked, goal))
  }
  const done = () => {
    setState({ goals: picked })
    goBack('profile')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-baton-paper font-display text-baton-navy">
      <nav className="flex h-11 shrink-0 items-center px-2">
        <button
          type="button"
          onClick={() => goBack('profile')}
          className="inline-flex items-center gap-0.5 rounded-full py-1 pr-2 text-body text-brand active:opacity-50"
        >
          <ChevronLeftIcon />
          Profile
        </button>
      </nav>
      <header className="animate-splash-rise px-8 pt-2 text-center">
        <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.01em]">
          {intentions.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-2 max-w-[260px] text-subhead text-baton-navy/45">{intentions.subtitle}</p>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="absolute left-1/2 top-1/2 size-0">
          {intentions.goals.map((goal, i) => (
            <Bubble
              key={goal}
              label={goal}
              picked={picked.includes(goal)}
              dim={full && !picked.includes(goal)}
              x={spots[i][0] * STEP}
              y={spots[i][1] * ROW}
              delay={i * 70}
              onTap={() => toggle(goal)}
            />
          ))}
        </div>
      </div>

      <footer className="px-6 pb-9 pt-3">
        <Button block variant="glow" size="cta" disabled={!full} onClick={done}>
          {intentions.cta}
          <ArrowRightIcon />
        </Button>
      </footer>
    </div>
  )
}

type BubbleProps = {
  label: string
  picked: boolean
  dim: boolean
  x: number
  y: number
  delay: number
  onTap: () => void
}

// One goal in its own Fluid Glass lens. The label (and, once picked, a blue
// fill from the middle) is drawn on a canvas under the glass, so nudging the
// glass bends them, as on Today.
function Bubble({ label, picked, dim, x, y, delay, onTap }: BubbleProps) {
  const { give, color, edge, ...glass } = defaultGlassTuning
  const [art] = useState(() => document.createElement('canvas'))
  const [frame, setFrame] = useState(0)
  const [pressed, setPressed] = useState(false)
  const fill = useRef(picked ? 1 : 0)

  // Draw once the brand font is in, and animate the fill when it's picked or
  // let go
  useEffect(() => {
    let alive = true
    let raf = 0
    const target = picked ? 1 : 0
    document.fonts.ready.then(() => {
      if (!alive) return
      const from = fill.current
      const start = performance.now()
      const step = (now: number) => {
        if (!alive) return
        const t = Math.min((now - start) / 420, 1)
        fill.current = from + (target - from) * (1 - Math.pow(1 - t, 3))
        drawBubble(art, label, fill.current)
        setFrame((n) => n + 1)
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    })
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [art, label, picked])

  // Where a press started, so nudging the glass doesn't count as a tap
  const down = useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={picked}
      aria-label={label}
      onPointerDown={(event) => {
        down.current = { x: event.clientX, y: event.clientY }
        setPressed(true)
      }}
      onPointerUp={(event) => {
        const start = down.current
        down.current = null
        setPressed(false)
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) onTap()
      }}
      onPointerCancel={() => {
        down.current = null
        setPressed(false)
      }}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onTap()}
      style={{
        left: x - BOX / 2,
        top: y - BOX / 2,
        width: BOX,
        height: BOX,
        animationDelay: `${delay}ms`,
        // Each canvas is cut to its own glass (plus room to nudge), so the
        // corners don't paint over the neighbors
        clipPath: `circle(${DRAWN / 2 + 10}px)`,
      }}
      // The canvas covers its neighbors, so only the glass's own drag handle
      // takes the pointer
      className="pointer-events-none absolute animate-photo-pop outline-none"
    >
      <div
        className={cx(
          'size-full transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          pressed ? 'scale-[0.94]' : 'scale-100',
          dim && 'opacity-45',
        )}
      >
        <FluidGlass
          text=""
          canvas={art}
          canvasFrame={frame}
          color={color || token('--color-baton-blue')}
          background={token('--color-baton-paper')}
          transparentOutside
          rim={edge}
          {...glass}
          size={SIZE}
          intro={false}
          give={give}
        />
      </div>
    </div>
  )
}

// The label, wrapped to fit the bubble, and the blue fill (0..1) that grows
// from the middle once it's picked (Figma: blue, fading out toward the rim)
function drawBubble(canvas: HTMLCanvasElement, label: string, fill: number) {
  const ratio = 2
  canvas.width = BOX * ratio
  canvas.height = BOX * ratio
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(ratio, ratio)
  const mid = BOX / 2

  if (fill > 0.001) {
    const radius = (SIZE / 2) * (0.35 + 0.65 * fill)
    const blue = token('--color-baton-blue')
    const glow = ctx.createRadialGradient(mid, mid, 0, mid, mid, radius)
    glow.addColorStop(0, withAlpha(blue, fill))
    glow.addColorStop(0.55, withAlpha(blue, 0.85 * fill))
    glow.addColorStop(1, withAlpha(blue, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(mid, mid, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // A little smaller than it reads, since the glass magnifies it
  const fontSize = 14
  ctx.font = `500 ${fontSize}px ${token('--font-display')}`
  const lines: string[] = []
  let line = ''
  for (const word of label.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > SIZE * 0.66) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  const lineHeight = Math.round(fontSize * 1.15)
  const top = mid - (lines.length * lineHeight) / 2
  ctx.fillStyle = token('--color-baton-navy')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((text, i) => ctx.fillText(text, mid, top + lineHeight * (i + 0.5)))
}

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

// The WebGL glass and the canvas take plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
