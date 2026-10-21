import { useEffect, useRef, useState } from 'react'
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
      <BatonMark className="absolute top-[193px] left-1/2 size-[112.56px]! -translate-x-1/2 text-baton-blue!" />
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
const folderShapes = [
  { src: '/onboarding/folder-nyc.svg', city: 'NYC', top: 0, labelLeft: 119.74, text: 'text-baton-yellow' },
  { src: '/onboarding/folder-la.svg', city: 'LA', top: 61.3, labelLeft: 241.9, text: 'text-baton-cream' },
  { src: '/onboarding/folder-seoul.svg', city: 'Seoul', top: 123.45, labelLeft: 119.43, text: 'text-baton-navy' },
]
// They rise into place from the back one: NYC, then LA, then Seoul
function Folders() {
  return (
    <div className="absolute top-[62.83px] left-[30.88px] h-[412.05px] w-[342.24px]">
      {folderShapes.map((f, i) => (
        <div key={f.city} className="absolute left-0 animate-folder-rise" style={{ top: f.top, animationDelay: `${150 + i * 250}ms` }}>
          <img src={f.src} alt="" />
          <p className={cx(folderLabel, 'top-[10.22px]', f.text)} style={{ left: f.labelLeft }}>
            {f.city}
          </p>
        </div>
      ))}
    </div>
  )
}

// The photo orbs fill in one after another
const orbs = [
  { src: '/archive/moments/seoul-karaoke.jpg', category: 'people', pos: 'left-[25.56px] top-[48.9px]', delay: 300 },
  { src: '/archive/moments/itaewon-sunset.jpg', category: 'feeling', pos: 'left-[188.75px] top-[191.5px]', delay: 800 },
  { src: '/archive/moments/goseong-lunch.jpg', category: 'places', pos: 'left-[36.9px] top-[334.8px]', delay: 1300 },
] as const
function Moments() {
  return (
    <>
      {orbs.map((o) => (
        <div key={o.src} className={cx('absolute animate-orb-in', o.pos)} style={{ animationDelay: `${o.delay}ms` }}>
          <PhotoOrb src={o.src} size={193.74} category={o.category} />
        </div>
      ))}
    </>
  )
}

// Two of Baton's picks as Relay's scrapbook cards
const picks = [
  { id: 'gym', tone: 'olive', label: 'Exercise', pos: 'left-[28.23px] top-[67.4px]' },
  { id: 'cafe', tone: 'cream', label: 'Food', pos: 'left-[104.46px] top-[188.5px]' },
] as const
function Recs() {
  return (
    <>
      {picks.map((p, i) => {
        const r = relayItems.find((item) => item.id === p.id)!
        return (
          <div key={p.id} className={cx('pointer-events-none absolute animate-card-stick', p.pos)} style={{ animationDelay: `${200 + i * 450}ms` }}>
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
    <div className="pointer-events-none absolute top-[56.4px] left-1/2 flex w-[340.93px] -translate-x-1/2 flex-col gap-4">
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

// The slides are drawn on the frame's 402 x 820 canvas (the screen under the
// status bar). On a phone or window of another size the whole canvas scales
// down to fit (never up), so nothing is cut off or overlaps.
const CANVAS_W = 402
const CANVAS_H = 820

export function Features() {
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const node = frame.current
    if (!node) return
    const fit = () => setScale(Math.min(1, node.clientWidth / CANVAS_W, node.clientHeight / CANVAS_H))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))

  return (
    <div ref={frame} className="relative h-full overflow-hidden bg-canvas">
      <div
        className="absolute top-1/2 left-1/2"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div key={`visual-${index}`} className="absolute inset-0">
          <Visual visual={slide.visual} />
        </div>

        {slide.visual !== 'splash' && (
          <div key={`copy-${index}`} className="absolute top-[577.42px] left-1/2 flex w-[340px] -translate-x-1/2 flex-col gap-2">
            <p className="font-display text-[24px] leading-[28.944px] font-medium tracking-[-0.2653px] text-baton-navy">{slide.title}</p>
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
    </div>
  )
}
