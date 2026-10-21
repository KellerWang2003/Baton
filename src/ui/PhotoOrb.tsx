import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { cx } from './cx'
import { GLASS_RIM, drawCover, filterColor, filterGlassColor, filterGlow } from './filterColor'
import FluidGlass from './FluidGlass'
import { GlassRim } from './GlassRim'
import { defaultGlassTuning, photoGlass } from './promptGlass'
import type { GlassTuning } from './promptGlass'
import { useScrollNudge } from './useScrollNudge'
import type { CloudCategory } from './PhotoCloud'

// Built like the Archive's opened photos (ArchiveSelected, Figma 236:234), at
// any size: Fluid Glass draws its lens a bit wider than the size it's given
// and fills 72% of its canvas, so a lens of 305/342 of the circle lands on it
const LENS = 305 / 342
// The whole photo shows through the lens (it magnifies the middle), with a
// full-bleed copy behind it for the glass to bend at the rim
const PHOTO = 0.5
// The glass stops a few points inside the rim, so its edge can't darken it
const INSET = 3
// How long the color takes to come in (the glass's rim tint and the glow)
const COLOR_IN_MS = 1000
// How long the glass and rim take to fade when it's leaving (Reflection
// shrinks the orb over the same time)
export const DISSOLVE_MS = 900

// A photo as an orb (Real-life's reflection page): the photo under liquid
// glass in a fixed glass rim. Once `category` is set, its filter color comes
// in the same way as on the Archive's opened photos (shared in filterColor):
// the glass tints its rim and the color glows in from the edge, easing in.
// `dissolve` gently fades the glass and the rim, leaving the photo and its glow.
// `moves` makes it Today's moving orb (Keller, Oct 21), with the same `tuning`:
// it gives when dragged and springs back, breathes, wobbles, spins and is
// nudged by scrolling, and the glass itself is the photo's only mask (no rim):
// the photo stays put on the page and the glass moves over it like a spotlight.
export function PhotoOrb({
  src,
  size,
  category,
  dissolve = false,
  moves = false,
  tuning = defaultGlassTuning,
  style,
  className,
}: {
  src: string
  size: number
  category: CloudCategory | null
  dissolve?: boolean
  moves?: boolean
  tuning?: GlassTuning
  style?: CSSProperties
  className?: string
}) {
  const box = Math.ceil((size + 4) / 0.72)
  const mask = `radial-gradient(circle at 50% 50%, black ${size / 2 - INSET - 1}px, transparent ${size / 2 - INSET}px)`
  const picture = usePicture(src, box, moves)
  const [glassReady, setGlassReady] = useState(false)
  const rim = useEased(category ? GLASS_RIM : 0, COLOR_IN_MS)
  // The color stays once it's in, so it can ease out instead of vanishing
  const [shown, setShown] = useState<CloudCategory | null>(category)
  if (category && category !== shown) setShown(category)
  const color = shown ? filterColor(shown) : null
  // The color fills a circle up to where the rim starts (Figma: 329 of 342)
  const glow = size - 13
  const root = useRef<HTMLDivElement>(null)
  const push = useScrollNudge(root, moves)

  return (
    <div ref={root} className={cx('relative shrink-0', className)} style={{ width: size, height: size, ...style }}>
      {/* The plain photo until the glass is drawn, and after it dissolves */}
      <div
        aria-hidden
        className={cx('absolute overflow-hidden rounded-full transition-opacity duration-500', moves && glassReady && !dissolve && 'opacity-0')}
        style={{ inset: INSET }}
      >
        {/* As a spotlight, cropped the way the glass shows the photo at rest */}
        <img src={src} alt="" draggable={false} className="size-full object-cover" style={{ scale: moves ? 1 / PHOTO : undefined }} />
      </div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ease-out"
        style={{ width: box, height: box, ...(moves ? {} : { maskImage: mask, WebkitMaskImage: mask }), opacity: glassReady && !dissolve ? 1 : 0, transitionDuration: `${dissolve ? DISSOLVE_MS : 500}ms` }}
      >
        {picture && (
          <FluidGlass
            // Set up again when switching, so the new motion takes hold
            key={moves ? 'moves' : 'still'}
            canvas={picture}
            text=""
            {...photoGlass(tuning, moves)}
            clipToGlass={moves}
            shape="lens"
            size={size * LENS}
            color={shown ? filterGlassColor(shown) : '#ffffff'}
            rim={rim}
            intro={false}
            pushRef={push}
            onReady={() => setGlassReady(true)}
          />
        )}
      </div>
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity ease-out"
        // As a spotlight the glass's rim carries the color; the glow comes back
        // with the plain photo as it dissolves
        style={{ width: glow, height: glow, opacity: category && (!moves || dissolve) ? 1 : 0, background: color ? filterGlow(color) : undefined, transitionDuration: `${COLOR_IN_MS}ms` }}
      />
      <span
        aria-hidden
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{ opacity: dissolve ? 0 : 1, transitionDuration: `${DISSOLVE_MS}ms` }}
      >
        {!moves && <GlassRim size={size} />}
      </span>
    </div>
  )
}

// A number that eases to its target over `ms` instead of jumping (the glass
// takes its props as they are, so its rim tint would otherwise snap in)
function useEased(target: number, ms: number) {
  const [value, setValue] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    let frame = requestAnimationFrame(function step(now) {
      const k = Math.min(1, (now - start) / ms)
      const next = begin + (target - begin) * (1 - (1 - k) ** 3)
      from.current = next
      setValue(next)
      if (k < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, ms])
  return value
}

// The photo laid out for the glass, cropped square like object-cover: across
// the whole canvas, then again at PHOTO size in the middle. As a spotlight it's
// just the one photo across the canvas, so it reads as a single picture
function usePicture(src: string, box: number, spotlight: boolean) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useEffect(() => {
    let alive = true
    const image = new Image()
    // Saved captures come from Supabase storage: without this the photo taints
    // the canvas and the glass can't use it, so it never shows
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (!alive) return
      const size = box * 2
      const picture = document.createElement('canvas')
      picture.width = size
      picture.height = size
      const context = picture.getContext('2d')
      if (!context) return
      drawCover(context, image, 0, 0, size)
      const inner = size * PHOTO
      if (!spotlight) drawCover(context, image, (size - inner) / 2, (size - inner) / 2, inner)
      setCanvas(picture)
    }
    image.src = src
    return () => {
      alive = false
    }
  }, [src, box, spotlight])
  return canvas
}
