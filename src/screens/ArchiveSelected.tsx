import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { toLocal } from '../app/localPoint'
import { goBack } from '../app/navigate'
import { setState, useStore } from '../app/store'
import { archiveMoments } from '../data/archiveMoments'
import { ArrowLeftIcon, FluidGlass, GlassRim, MapPinIcon } from '../ui'
import { GLASS_RIM, drawCover, filterColor, filterGlassColor, filterGlow } from '../ui/filterColor'

// The glass circle (Figma ARCHIVE_selected, 236:234): a 342pt circle with a
// hairline. Fluid Glass draws its lens a bit wider than the size it's given
// and fills only 72% of its canvas (as on Today), so a 305pt lens lands on the
// 342pt circle and the canvas is masked to it.
const CIRCLE = 342
const LENS = 305
const BOX = Math.ceil((CIRCLE + 4) / 0.72)
// The filter color fills this circle, up to where the glass rim starts
const GLOW = 329
// The photo layers stop a few points inside the circle's edge (they're under
// the rim there anyway), so their soft edge can't darken the hairline
const INSET = 3
const MASK = `radial-gradient(circle at 50% 50%, black ${CIRCLE / 2 - INSET - 1}px, transparent ${CIRCLE / 2 - INSET}px)`
// The photo fills this much of the canvas: small, because the lens magnifies
// its middle, so the whole photo shows through the circle as it did in the
// cloud; the full-bleed copy behind it is what the glass bends in at the rim
const PHOTO = 0.5
// The tapped cloud photo growing into the circle
const GROW = { duration: 560, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' }
// The words around the circle fade in once it's most of the way there, and
// the note sticks itself down after it lands
const SETTLE_DELAY = '260ms'
const NOTE_DELAY = '480ms'
// Going back: everything but the circle fades, then the circle shrinks back
// onto its photo in the cloud
const FADE_OUT = { duration: 200, easing: 'ease-out', fill: 'forwards' } as const
const SHRINK = { duration: 420, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' } as const

// The moment she captured, laid out for the glass: the photo across the
// whole canvas, then again at PHOTO size in the middle
function usePicture(src: string) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useEffect(() => {
    let alive = true
    const image = new Image()
    image.onload = () => {
      if (!alive) return
      const size = BOX * 2
      const picture = document.createElement('canvas')
      picture.width = size
      picture.height = size
      const context = picture.getContext('2d')
      if (!context) return
      drawCover(context, image, 0, 0, size)
      const inner = size * PHOTO
      drawCover(context, image, (size - inner) / 2, (size - inner) / 2, inner)
      setCanvas(picture)
    }
    image.src = src
    return () => {
      alive = false
    }
  }, [src])
  return canvas
}

// A photo opened from a city's photo cloud (Figma ARCHIVE_selected, 236:234):
// which daily prompt it answered, the photo in a liquid glass circle tinted
// with its filter's color (Feeling pink), where and when she took it, and what
// she wrote on a tilted yellow note. The note runs past the bottom, so the
// page scrolls. The photo tapped in the cloud grows from its spot into the
// circle as the page opens, the whole circle (photo, rim and hairline) as one,
// then the glass fades in over the photo and the note slaps down. Back
// reverses it: the circle shrinks onto its photo in the cloud.
export function ArchiveSelected() {
  const { selectedPhoto, selectedPhotoFrom, addedMoments } = useStore()
  // Opened straight from the debug panel or arrow keys, it shows the hike
  const moment = { ...archiveMoments, ...addedMoments }[selectedPhoto ?? ''] ?? Object.values(archiveMoments)[0]
  const picture = usePicture(moment.photo)
  // The filter color, softened a little toward white so it reads pastel
  // The filter color, softened to a pastel (shared with Real-life's orb)
  const tint = filterGlassColor(moment.category)
  const color = filterColor(moment.category)
  const circleRef = useRef<HTMLDivElement>(null)
  const growRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const leaving = useRef(false)
  // Where the tapped photo was, read once: arriving any other way it just fades in
  const [from] = useState(() => selectedPhotoFrom)
  const [landed, setLanded] = useState(!from)
  const [glassReady, setGlassReady] = useState(false)

  useEffect(() => {
    setState({ selectedPhotoFrom: null })
  }, [])

  // The circle as a transform onto the tapped photo's spot in the cloud
  function atPhoto() {
    const circle = circleRef.current
    const page = pageRef.current
    if (!from || !circle || !page) return null
    // Both rects are in window pixels; the phone frame may be scaled (or tilted,
    // in the Archive mock), so turn both centers back into the page's own points
    const to = circle.getBoundingClientRect()
    const local = toLocal(page)
    const a = local({ x: from.x + from.size / 2, y: from.y + from.size / 2 })
    const b = local({ x: to.left + to.width / 2, y: to.top + to.height / 2 })
    return `translate(${a.x - b.x}px, ${a.y - b.y}px) scale(${from.size / to.width})`
  }

  useLayoutEffect(() => {
    const grow = growRef.current
    const start = atPhoto()
    if (!grow || !start) return
    const animation = grow.animate([{ transform: start }, { transform: 'none' }], GROW)
    animation.finished.then(() => setLanded(true), () => {})
    return () => animation.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from])

  function close() {
    const grow = growRef.current
    const end = atPhoto()
    if (!grow || !end) return goBack('archive-detail')
    if (leaving.current) return
    leaving.current = true
    for (const part of pageRef.current?.querySelectorAll('[data-fade]') ?? []) {
      part.animate([{ opacity: 1 }, { opacity: 0 }], FADE_OUT)
    }
    const shrink = grow.animate([{ transform: 'none' }, { transform: end }], SHRINK)
    shrink.finished.then(() => goBack('archive-detail'), () => {})
  }

  return (
    // Reaches up under the status bar (--status-bar), so the page scrolls behind it
    <div
      ref={pageRef}
      className="relative overflow-y-auto bg-baton-paper font-display text-baton-navy"
      style={{
        marginTop: 'calc(-1 * var(--status-bar, 0px))',
        height: 'calc(100% + var(--status-bar, 0px))',
        paddingTop: 'var(--status-bar, 0px)',
      }}
    >
      <button
        type="button"
        data-fade
        onClick={close}
        aria-label="Back to the photos"
        // A 44pt target centered on Figma's arrow (30pt in, 68pt down the frame, under the status bar)
        style={{ top: 'calc(var(--status-bar, 0px) + 5px)' }}
        className="absolute left-4 z-10 flex size-11 items-center justify-center rounded-full text-wrap-faint active:opacity-50"
      >
        <ArrowLeftIcon />
      </button>

      <div className="flex flex-col items-center pb-16">
        <div data-fade className="flex animate-fade-in flex-col items-center" style={{ animationDelay: SETTLE_DELAY }}>
          <p className="mt-[62px] text-moment-meta text-wrap-faint">Prompt #{moment.prompt}</p>
          <h1 className={`mt-2 text-center text-moment-question font-medium ${moment.oneLine ? 'whitespace-nowrap' : 'w-[232px]'}`}>
            {moment.question}
          </h1>
        </div>

        {/* The photo under liquid glass, tinted at the rim, with a hairline */}
        <div ref={circleRef} className="relative mt-[38px] shrink-0" style={{ width: CIRCLE, height: CIRCLE }}>
          {/* Everything in the circle grows in from the cloud together */}
          <div ref={growRef} className="pointer-events-none absolute inset-0">
            {/* The plain photo, cropped like the glass shows it (PHOTO of the
                canvas, seen through the circle), until the glass is drawn */}
            <div aria-hidden className="absolute overflow-hidden rounded-full" style={{ inset: INSET }}>
              <img src={moment.photo} alt="" draggable={false} className="size-full object-cover" style={{ scale: Math.max(1, (BOX * PHOTO) / CIRCLE) }} />
            </div>
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-out ${glassReady ? '' : 'opacity-0'}`}
              style={{ width: BOX, height: BOX, maskImage: MASK, WebkitMaskImage: MASK }}
            >
              {/* Mounted once the circle has landed: the glass sizes its
                  canvas from its size on screen, which is tiny mid-grow */}
              {picture && landed && (
                <FluidGlass
                  canvas={picture}
                  text=""
                  shape="lens"
                  size={LENS}
                  color={tint}
                  rim={GLASS_RIM}
                  ring={0}
                  breathe={0.1}
                  refraction={0.5}
                  dispersion={1}
                  reflection={1}
                  shadow={0}
                  interaction="static"
                  idle={false}
                  intro={false}
                  morphOnClick={false}
                  spin={0}
                  wobble={0}
                  onReady={() => setGlassReady(true)}
                />
              )}
            </div>
            {/* The filter color glowing in from the edge (Figma's 329pt gradient),
                stopping where the glass rim starts */}
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: GLOW,
                height: GLOW,
                background: filterGlow(color),
              }}
            />
            <GlassRim size={CIRCLE} />
          </div>
        </div>

        <div data-fade className="flex animate-fade-in flex-col items-center" style={{ animationDelay: SETTLE_DELAY }}>
          <p className="mt-6 flex items-center gap-0.5 text-moment-meta text-wrap-faint">
            <MapPinIcon className="size-4" />
            {moment.place}
          </p>
          <p className="mt-1 text-moment-meta text-wrap-faint">{moment.time}</p>

          {/* Slapped down like a post-it: drops in tilted, squashes flat and wobbles to rest */}
          <div
            // A square post-it (Figma 236:418): its 287pt text runs into the side padding
            className="mt-10 size-[327px] origin-top animate-note-stick rounded-[10px] bg-note-yellow px-5 pt-[30px] shadow-moment-note"
            style={{ animationDelay: NOTE_DELAY, '--note-tilt': `${moment.tilt ?? -4.41}deg` } as CSSProperties}
          >
            <p className="text-moment-note">{moment.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
