import { useEffect, useState } from 'react'
import { navigate } from '../app/navigate'
import { features, type FeatureSlide } from '../data/onboarding'
import { relayItems } from '../data/relay'
import { ArrowRightIcon, BatonMark, Button, FolderStack, PhotoOrb, RecCard, Steps } from '../ui'
import type { ArchiveFolder } from '../ui/FolderStack'
import { cx } from '../ui/cx'

// Feature overview before sign up, five slides: the splash with the tagline,
// the Archive, noticing small moments, the Newcomer head start, and why to
// keep capturing. The top of each slide shows the app's own components (the
// folder stack, photo orbs, Relay's cards); the copy sits below.

function Splash() {
  return (
    <div className="flex flex-col items-center gap-3">
      <BatonMark className="size-20! text-brand!" />
      <p className="font-display text-large-title text-brand">Baton</p>
      <p className="text-body text-ink-muted">{features.tagline}</p>
    </div>
  )
}

// The Archive's folders, with the front one open (Figma onboarding frame)
const folders: ArchiveFolder[] = [
  { id: 'nyc', city: 'NYC', dates: '', tabAlign: 'left', dateAlign: 'right', tone: 'olive' },
  { id: 'la', city: 'LA', dates: '', tabAlign: 'right', dateAlign: 'left', tone: 'blue' },
  { id: 'seoul', city: 'Seoul', dates: '', tabAlign: 'left', dateAlign: 'right', tone: 'cream' },
]
function Folders() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="h-[161%] w-[161%] origin-top-left scale-[0.62]">
        <FolderStack className="bg-baton-paper" folders={folders} initialId="seoul" />
      </div>
    </div>
  )
}

// The prompt flashes up, then the photo orbs fill in one after another
const orbs = [
  { src: '/archive/moments/granite-falls.jpg', category: 'people', pos: 'left-0 top-0', delay: 1400 },
  { src: '/archive/moments/itaewon-sunset.jpg', category: 'feeling', pos: 'right-0 top-24', delay: 1900 },
  { src: '/archive/moments/goseong-lunch.jpg', category: 'places', pos: 'left-4 top-52', delay: 2400 },
] as const
function Moments() {
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
      {orbs.map((o) => (
        <div key={o.src} className={cx('absolute animate-photo-pop', o.pos)} style={{ animationDelay: `${o.delay}ms` }}>
          <PhotoOrb src={o.src} size={150} category={o.category} />
        </div>
      ))}
    </div>
  )
}

// Two of Baton's picks as Relay's scrapbook cards
function Recs() {
  const picks = ['gym', 'cafe'].map((id) => relayItems.find((r) => r.id === id)!)
  const tones = { gym: 'olive', cafe: 'cream' } as const
  const labels = { gym: 'Exercise', cafe: 'Food' } as const
  return (
    <div className="pointer-events-none relative mx-auto h-80 w-80 origin-top scale-90">
      {picks.map((r, i) => (
        <div key={r.id} className={cx('absolute', i === 0 ? 'left-0 top-0' : 'right-0 top-28')}>
          <RecCard
            look="scrapbook"
            index={i}
            size="lg"
            title={r.title}
            text={r.source.kind === 'baton' ? r.source.why : ''}
            tone={tones[r.id as 'gym' | 'cafe']}
            label={labels[r.id as 'gym' | 'cafe']}
            photo={r.photo ?? ''}
          />
        </div>
      ))}
    </div>
  )
}

function Visual({ visual }: { visual: FeatureSlide['visual'] }) {
  if (visual === 'splash') return <Splash />
  if (visual === 'folders') return <Folders />
  if (visual === 'moments') return <Moments />
  if (visual === 'recs') return <Recs />
  // Growth: left empty as in the Figma frame until its picture is decided
  return null
}

export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))
  const splash = slide.visual === 'splash'

  return (
    <div className="relative h-full overflow-hidden bg-canvas">
      <div
        key={`visual-${index}`}
        className={cx('absolute inset-x-0 flex items-center justify-center', slide.visual === 'folders' ? 'top-10 h-[50%]' : 'top-12', splash ? 'bottom-24' : slide.visual !== 'folders' && 'h-[52%]')}
      >
        <Visual visual={slide.visual} />
      </div>

      <div className="relative flex h-full flex-col justify-end px-6 pb-8">
        {!splash && (
          <div key={index} className="flex flex-col gap-2 pb-8">
            <p className="font-display text-title-1 font-normal text-ink">{slide.title}</p>
            {slide.body && <p className="text-body text-ink-muted">{slide.body}</p>}
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
