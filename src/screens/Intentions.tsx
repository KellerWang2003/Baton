import { useEffect, useRef, useState } from 'react'
import { goBack } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { goalBubbles, intentions } from '../data/intentions'
import { ArrowRightIcon, Button, ChevronLeftIcon, FluidGlass } from '../ui'
import { cx } from '../ui/cx'
import { defaultGlassTuning } from '../ui/promptGlass'

// Bubble diameter in points (Figma 322:8877)
const SIZE = 142
// Fluid Glass draws a bit wider than the size it's given and fills 72% of its
// own canvas (as on Today), so its canvas is bigger than the bubble
const GLASS = SIZE * (330 / 370)
const BOX = Math.ceil(SIZE / 0.72)
// Figma measures from the top of the frame; our page starts under the status
// bar, minus a little room for the back button
const TOP = 54 - 12
const FIELD_HEIGHT = Math.max(...goalBubbles.map((bubble) => bubble.y)) + SIZE / 2 - TOP + 120

// Choosing her intentions for New York (Figma "choosing intentions", 322:8877),
// before her last night in LA; opened from Profile. A field of glass bubbles in
// loose, overlapping spots, some running off the screen. Tap only, nothing
// moves (Keller, Oct 19): one Fluid Glass lens is rendered once and its still
// image is every bubble's glass, with the blue fill and the goal on it.
export function Intentions() {
  const [picked, setPicked] = useState(useStore().goals)
  const full = picked.length >= intentions.max
  const shell = useGlassShell()
  const toggle = (goal: string) => {
    if (!picked.includes(goal) && full) return
    setPicked(toggleIn(picked, goal))
  }
  const done = () => {
    setState({ goals: picked })
    goBack('profile')
  }

  return (
    <div className="relative h-full overflow-hidden bg-baton-paper font-display text-baton-navy">
      <div className="h-full overflow-y-auto overflow-x-hidden">
        <div className="relative" style={{ height: FIELD_HEIGHT }}>
          <button
            type="button"
            onClick={() => goBack('profile')}
            className="absolute left-2 top-1 z-20 inline-flex items-center gap-0.5 rounded-full py-1 pr-2 text-body text-brand active:opacity-50"
          >
            <ChevronLeftIcon />
            Profile
          </button>
          <header className="absolute inset-x-0 animate-splash-rise text-center" style={{ top: 88 - TOP }}>
            <h1 className="text-[30px] font-medium leading-[30px] tracking-[-0.011em]">
              {intentions.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mx-auto mt-3.5 w-[321px] text-callout leading-[18px] text-baton-navy/35">{intentions.subtitle}</p>
          </header>

          {shell.node}
          {goalBubbles.map((bubble, i) => (
              <Bubble
                key={bubble.goal}
                label={bubble.goal}
                glass={shell.url}
                picked={picked.includes(bubble.goal)}
                dim={full && !picked.includes(bubble.goal)}
                x={bubble.x}
                y={bubble.y - TOP}
                delay={i * 35}
                onTap={() => toggle(bubble.goal)}
              />
            ))}
        </div>
      </div>

      {/* Pinned over the bottom of the field, which fades into the page */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-linear-to-t from-baton-paper from-55% to-baton-paper/0 px-6 pb-9 pt-14">
        <Button block variant="glow" size="cta" disabled={picked.length === 0} onClick={done} className="pointer-events-auto">
          {intentions.cta}
          <ArrowRightIcon />
        </Button>
      </footer>
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
      setUrl(still.toDataURL('image/png'))
    }, 150)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [url])

  const node = url ? null : (
    <div ref={holder} aria-hidden className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ width: BOX, height: BOX }}>
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
  dim: boolean
  x: number
  y: number
  delay: number
  onTap: () => void
}

// One goal: the still glass, then the blue fill (grows from the middle once
// picked) and the words on it. A tap squishes it a little.
function Bubble({ label, glass, picked, dim, x, y, delay, onTap }: BubbleProps) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onTap}
      style={{ left: x - SIZE / 2, top: y - SIZE / 2, width: SIZE, height: SIZE, animationDelay: `${delay}ms` }}
      className={cx(
        'absolute animate-fade-in rounded-full outline-none transition-[scale,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95',
        dim && 'opacity-45',
      )}
    >
      {glass && <img
        src={glass}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 animate-fade-in select-none"
        style={{ width: BOX, height: BOX }}
      />}
      <span
        aria-hidden
        className={cx(
          'absolute inset-0 rounded-full transition-[scale,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]',
          picked ? 'scale-100 opacity-100' : 'scale-40 opacity-0',
        )}
        style={{
          background:
            'radial-gradient(circle, var(--color-baton-blue) 0%, color-mix(in srgb, var(--color-baton-blue) 85%, transparent) 55%, color-mix(in srgb, var(--color-baton-blue) 15%, transparent) 70.7%)',
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

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
