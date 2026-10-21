import { useEffect, useState } from 'react'
import { navigate } from '../app/navigate'
import { features, type FeatureSlide } from '../data/onboarding'
import { ArrowRightIcon, BatonMark, Button, Steps } from '../ui'
import { cx } from '../ui/cx'

// Feature overview before sign up, five slides: the splash with the tagline,
// the Archive, noticing small moments, the Newcomer head start, and why to
// keep capturing. The top of each slide is its picture, the copy sits below.

function Splash() {
  return (
    <div className="flex flex-col items-center gap-3">
      <BatonMark className="size-20! text-brand!" />
      <p className="font-display text-large-title text-brand">Baton</p>
      <p className="text-body text-ink-muted">{features.tagline}</p>
    </div>
  )
}

// City folders as in the Archive: NYC at the back, LA, Seoul in front
function Folders() {
  const folder = (color: string, label: string, text: string, tab: string, z: number, top: number) => (
    <div className={cx('absolute inset-x-0 h-56 rounded-3xl', color)} style={{ top, zIndex: z }}>
      <span className={cx('absolute -top-8 h-9 rounded-t-2xl px-6 pt-1.5 font-display text-title-3', tab, text)}>{label}</span>
    </div>
  )
  return (
    <div className="relative mx-auto h-72 w-72">
      {folder('bg-baton-olive', 'NYC', 'text-baton-yellow', 'left-6 bg-baton-olive', 1, 0)}
      {folder('bg-baton-blue', 'LA', 'text-baton-paper', 'right-8 bg-baton-blue', 2, 36)}
      {folder('bg-baton-cream', 'Seoul', 'text-ink', 'left-10 bg-baton-cream', 3, 76)}
    </div>
  )
}

// The prompt appears, then the photos fill in one after another
const bubbles = [
  { src: '/archive/moments/granite-falls.jpg', glow: 'shadow-[0_0_24px_#ede783]', pos: 'left-0 top-0', delay: 1400 },
  { src: '/archive/moments/itaewon-sunset.jpg', glow: 'shadow-[0_0_24px_#f3beeb]', pos: 'right-0 top-24', delay: 1900 },
  { src: '/archive/moments/goseong-lunch.jpg', glow: 'shadow-[0_0_24px_#59a1ff]', pos: 'left-4 top-52', delay: 2400 },
]
function Moments() {
  // The prompt flashes up, then steps aside as the photos fill in
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const on = setTimeout(() => setShown(true), 200)
    const off = setTimeout(() => setShown(false), 1700)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [])
  return (
    <div className="relative mx-auto h-80 w-72">
      <p
        className={cx(
          'absolute inset-x-0 top-28 z-10 rounded-full bg-baton-cream px-5 py-3 text-center text-subhead font-medium text-ink shadow-md transition-opacity duration-500',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      >
        {features.prompt}
      </p>
      {bubbles.map((b) => (
        <img
          key={b.src}
          src={b.src}
          alt=""
          className={cx('absolute size-36 animate-photo-pop rounded-full object-cover', b.glow, b.pos)}
          style={{ animationDelay: `${b.delay}ms` }}
        />
      ))}
    </div>
  )
}

function Scraps({ photos }: { photos: string[] }) {
  return (
    <div className="relative mx-auto h-48 w-64">
      {photos.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cx(
            'absolute size-36 rounded-2xl border-4 border-baton-cream object-cover shadow-lg',
            i === 0 ? '-rotate-6 left-0 top-1' : 'rotate-3 right-0 top-9',
          )}
        />
      ))}
    </div>
  )
}

function Visual({ visual }: { visual: FeatureSlide['visual'] }) {
  if (visual === 'splash') return <Splash />
  if (visual === 'folders') return <Folders />
  if (visual === 'moments') return <Moments />
  if (visual === 'recs') return <Scraps photos={['/relay/gym.jpg', '/relay/cafe.jpg']} />
  // Growth: the same café seat in both cities, side by side
  return <Scraps photos={['/relay/ana-cafe.jpg', '/relay/cafe.jpg']} />
}

export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))
  const splash = slide.visual === 'splash'

  return (
    <div className="relative h-full overflow-hidden bg-canvas">
      <div key={`visual-${index}`} className={cx('absolute inset-x-0 top-12 flex items-center justify-center', splash ? 'bottom-24' : 'h-[52%]')}>
        <Visual visual={slide.visual} />
      </div>

      <div className="relative flex h-full flex-col justify-end px-6 pb-8">
        {!splash && (
          <div key={index} className="flex flex-col gap-2 pb-8">
            <p className="font-display text-title-1 font-normal text-ink">{slide.title}</p>
            {slide.body && <p className="text-body text-ink-muted">{slide.body}</p>}
            {slide.points && (
              <div className="mt-2 flex flex-col gap-3">
                {slide.points.map((p) => (
                  <div key={p.title} className="rounded-card bg-card p-4 shadow-card">
                    <p className="text-headline font-medium text-ink">{p.title}</p>
                    <p className="text-subhead text-ink-muted">{p.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <Steps count={features.slides.length} current={index} />
          <Button block variant="glow" size="cta" onClick={next}>
            {last ? features.start : features.next}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
