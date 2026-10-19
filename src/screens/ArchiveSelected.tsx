import { useEffect, useState } from 'react'
import { goBack } from '../app/navigate'
import { useStore } from '../app/store'
import { archiveMoments } from '../data/archiveMoments'
import { ChevronLeftIcon, FluidGlass, MapPinIcon } from '../ui'

// The glass circle (Figma ARCHIVE_selected, 236:234): a 342pt circle with a
// hairline. Fluid Glass draws its lens a bit wider than the size it's given
// and fills only 72% of its canvas (as on Today), so a 305pt lens lands on the
// 342pt circle and the canvas is masked to it.
const CIRCLE = 342
const LENS = 305
const BOX = Math.ceil((CIRCLE + 4) / 0.72)
const MASK = `radial-gradient(circle at 50% 50%, black ${CIRCLE / 2 - 1}px, transparent ${CIRCLE / 2 + 1}px)`
// The photo fills this much of the canvas, so the lens shows about the same
// part of it as Figma's 300pt crop; the full-bleed copy behind it is only
// there for the glass to bend in at the rim
const PHOTO = 0.82
const FILTER_TINT = { feeling: 'pink', people: 'yellow', places: 'blue' } as const

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
      context.drawImage(image, 0, 0, size, size)
      const inner = size * PHOTO
      context.drawImage(image, (size - inner) / 2, (size - inner) / 2, inner, inner)
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
// page scrolls.
export function ArchiveSelected() {
  const { selectedPhoto } = useStore()
  // Opened straight from the debug panel or arrow keys, it shows the hike
  const moment = archiveMoments[selectedPhoto ?? ''] ?? Object.values(archiveMoments)[0]
  const picture = usePicture(moment.photo)
  const tint = token(`--color-baton-${FILTER_TINT[moment.category]}`)

  return (
    <div className="relative h-full overflow-y-auto bg-baton-paper font-display text-baton-navy">
      <button
        type="button"
        onClick={() => goBack('archive-detail')}
        aria-label="Back to the photos"
        className="absolute top-2 left-2 z-10 flex size-11 items-center justify-center rounded-full text-wrap-faint active:opacity-50"
      >
        <ChevronLeftIcon />
      </button>

      <div className="flex flex-col items-center pb-16">
        <p className="mt-[62px] text-moment-meta text-wrap-faint">Prompt #{moment.prompt}</p>
        <h1 className="mt-2 w-[232px] text-center text-moment-question font-medium">{moment.question}</h1>

        {/* The photo under liquid glass, tinted at the rim, with a hairline */}
        <div className="relative mt-[38px] shrink-0" style={{ width: CIRCLE, height: CIRCLE }}>
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: BOX, height: BOX, maskImage: MASK, WebkitMaskImage: MASK }}
          >
            {picture && (
              <FluidGlass
                canvas={picture}
                text=""
                shape="lens"
                size={LENS}
                color={tint}
                rim={0.7}
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
              />
            )}
          </div>
          {/* The filter color glowing in from the edge (Figma's 329pt pink gradient) */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[329px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `radial-gradient(circle closest-side, transparent 80%, var(--color-baton-${FILTER_TINT[moment.category]}) 100%)` }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border border-moment-ring" />
        </div>

        <p className="mt-6 flex items-center gap-0.5 text-moment-meta text-wrap-faint">
          <MapPinIcon className="size-4" />
          {moment.place}
        </p>
        <p className="mt-1 text-moment-meta text-wrap-faint">{moment.time}</p>

        <div className="mt-10 w-[327px] -rotate-[4.41deg] rounded-[10px] bg-note-yellow p-[30px] shadow-moment-note">
          <p className="text-moment-note">{moment.note}</p>
        </div>
      </div>
    </div>
  )
}

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
