import { useEffect, useState } from 'react'
import { navigate } from '../app/navigate'
import { features, type FeatureSlide } from '../data/onboarding'
import { localInsight } from '../data/localInsight'
import { relayItems } from '../data/relay'
import { ArrowRightIcon, BatonMark, Button, PhotoOrb, RecCard, Steps } from '../ui'
import { cx } from '../ui/cx'
import { Intention } from './LocalInsight'

// Feature overview before sign up, five slides laid out as the Figma onboarding
// frames (LA28 Palms, section 594:2498), minus the 54pt status bar the frames
// include: one picture area on top, the title and a muted line at y 577, the
// dots and Next near the bottom. The pictures
// use the app's own pieces: photo orbs, Relay's scrapbook cards and the Local
// insight's goal cards.

// Splash_Blue: the mark, the name and the tagline, centered
function Splash() {
  return (
    <>
      <BatonMark className="absolute top-[172.95px] left-1/2 size-[112.56px]! -translate-x-1/2 text-baton-blue!" />
      <div className="absolute inset-x-0 top-[329.43px] flex flex-col items-center gap-2 text-center">
        <p className="font-display text-[48px] leading-normal font-medium tracking-[-0.528px] text-baton-blue">Baton</p>
        <p className="font-display text-[24.12px] leading-[28.944px] tracking-[-0.2653px] text-baton-navy opacity-60">{features.tagline}</p>
      </div>
    </>
  )
}

// The Archive's folders, NYC at the back and Seoul in front (the shapes are
// exported from Figma; the city names sit on the tabs)
const folderLabel = 'absolute font-display text-[30.648px] leading-normal font-medium tracking-[-0.3371px] whitespace-nowrap -translate-x-1/2'
function Folders() {
  return (
    <div className="absolute top-[62.83px] left-[30.88px] h-[412.05px] w-[342.24px]">
      <img src="/onboarding/folder-nyc.svg" alt="" className="absolute top-0 left-0" />
      <p className={cx(folderLabel, 'top-[10.22px] left-[119.74px] text-baton-yellow')}>NYC</p>
      <img src="/onboarding/folder-la.svg" alt="" className="absolute top-[61.3px] left-0" />
      <p className={cx(folderLabel, 'top-[71.51px] left-[241.9px] text-baton-cream')}>LA</p>
      <img src="/onboarding/folder-seoul.svg" alt="" className="absolute top-[123.45px] left-0" />
      <p className={cx(folderLabel, 'top-[133.66px] left-[119.43px] text-baton-navy')}>Seoul</p>
    </div>
  )
}

// The prompt flashes up, then the photo orbs fill in one after another
const orbs = [
  { src: '/archive/moments/seoul-karaoke.jpg', category: 'people', pos: 'left-[25.56px] top-[13.77px]', delay: 1400 },
  { src: '/archive/moments/itaewon-sunset.jpg', category: 'feeling', pos: 'left-[188.75px] top-[156.42px]', delay: 1900 },
  { src: '/archive/moments/goseong-lunch.jpg', category: 'places', pos: 'left-[36.9px] top-[299.65px]', delay: 2400 },
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
    <>
      <p
        className={cx(
          'absolute inset-x-8 top-[196px] z-10 rounded-full bg-baton-cream px-5 py-3 text-center text-subhead font-medium text-ink shadow-md transition-opacity duration-500',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      >
        {features.prompt}
      </p>
      {orbs.map((o) => (
        <div key={o.src} className={cx('absolute animate-photo-pop', o.pos)} style={{ animationDelay: `${o.delay}ms` }}>
          <PhotoOrb src={o.src} size={193.74} category={o.category} />
        </div>
      ))}
    </>
  )
}

// Two of Baton's picks as Relay's scrapbook cards
const picks = [
  { id: 'gym', tone: 'olive', label: 'Exercise', pos: 'left-[28.23px] top-[41.42px]' },
  { id: 'cafe', tone: 'cream', label: 'Food', pos: 'left-[104.46px] top-[162.54px]' },
] as const
function Recs() {
  return (
    <>
      {picks.map((p, i) => {
        const r = relayItems.find((item) => item.id === p.id)!
        return (
          <div key={p.id} className={cx('pointer-events-none absolute', p.pos)}>
            <RecCard
              look="scrapbook"
              index={i}
              size="lg"
              title={r.title}
              text={r.source.kind === 'baton' ? r.source.why : ''}
              tone={p.tone}
              label={p.label}
              photo={r.photo ?? ''}
            />
          </div>
        )
      })}
    </>
  )
}

// The goal cards from the Local insight, with their dots
function Growth() {
  return (
    <div className="pointer-events-none absolute top-[31.42px] left-1/2 flex w-[340.93px] -translate-x-1/2 flex-col gap-4">
      {localInsight.intentions.map((intention) => (
        <Intention key={intention.quote} intention={{ ...intention, label: 'Your goal for NY', detail: undefined }} />
      ))}
    </div>
  )
}

function Visual({ visual }: { visual: FeatureSlide['visual'] }) {
  if (visual === 'splash') return <Splash />
  if (visual === 'folders') return <Folders />
  if (visual === 'moments') return <Moments />
  if (visual === 'recs') return <Recs />
  return <Growth />
}

export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))

  return (
    <div className="relative h-full overflow-hidden bg-canvas">
      <div key={`visual-${index}`} className="absolute inset-0">
        <Visual visual={slide.visual} />
      </div>

      {slide.visual !== 'splash' && (
        <div key={`copy-${index}`} className="absolute top-[577.42px] left-1/2 flex w-[340px] -translate-x-1/2 flex-col gap-2">
          <p className="font-display text-[24px] leading-[28.944px] font-normal tracking-[-0.2653px] text-baton-navy">{slide.title}</p>
          {slide.body && <p className="font-display text-[18px] leading-[22.512px] font-normal tracking-[-0.1769px] text-ink-muted">{slide.body}</p>}
        </div>
      )}

      <div className="absolute bottom-[44px] left-1/2 flex w-[355.77px] -translate-x-1/2 flex-col items-center gap-4">
        <Steps count={features.slides.length} current={index} />
        <Button block variant="glow" size="cta" onClick={next}>
          {last ? features.start : features.next}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}
