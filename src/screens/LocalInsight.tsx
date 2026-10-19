import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { localInsight } from '../data/localInsight'
import { ArrowRightIcon, BatonMark, Button, cx, TypedSummary } from '../ui'

const { la, ny, intention, bookend, close } = localInsight

// True once the element has scrolled into view (stays true), so each part
// plays as she reaches it
function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [inView])
  return [ref, inView] as const
}

// Inline photos are outlined in the color behind them
const paperOutline = { '--folder-fill': 'var(--color-baton-paper)' } as CSSProperties

// Local insight: what "You're a Local now!" opens. A scrolling page on the
// paper color: her LA snapshot against New York now, her intention and how
// far she got, the café-seat prompt from both cities, then the hand-off line.
export function LocalInsight() {
  return (
    <div className="h-full overflow-y-auto bg-baton-paper font-display text-baton-navy" style={paperOutline}>
      <div className="mx-auto flex max-w-[402px] flex-col gap-14 px-6 pt-10 pb-12">
        <header className="animate-splash-rise">
          <p className="text-callout text-wrap-faint">{localInsight.eyebrow}</p>
          <h1 className="mt-1 text-wrap-date font-medium">
            {localInsight.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
        </header>

        <ThenAndNow />
        <Intention />
        <Bookend />
        <Close />
      </div>
    </div>
  )
}

function CityLabel({ dot, label, when }: { dot: string; label: string; when: string }) {
  return (
    <p className="flex items-center gap-2 text-card-body">
      <span className={cx('size-2.5 rounded-full', dot)} />
      <span className="font-medium">{label}</span>
      <span className="text-wrap-faint">{when}</span>
    </p>
  )
}

function ThenAndNow() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref} className="flex flex-col gap-5">
      <div className="animate-splash-rise" style={{ animationDelay: '200ms' }}>
        <CityLabel dot="bg-baton-blue" label={la.label} when={la.when} />
        <TypedSummary parts={la.parts} play={false} className="mt-2 text-[26px] leading-[1.15] text-wrap-faint" />
      </div>
      <div>
        <CityLabel dot="bg-baton-olive" label={ny.label} when={ny.when} />
        {inView && <TypedSummary parts={ny.parts} play className="mt-2 text-[26px] leading-[1.15]" />}
      </div>
      <div className={cx('flex flex-col gap-3 transition-opacity duration-500', inView ? 'opacity-100 delay-[2400ms]' : 'opacity-0')}>
        <TagRow label="Stayed" tags={localInsight.stayed} tone="bg-baton-chip" />
        <TagRow label="New" tags={localInsight.fresh} tone="bg-baton-yellow" />
      </div>
    </section>
  )
}

function TagRow({ label, tags, tone }: { label: string; tags: string[]; tone: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-12 shrink-0 pt-1.5 text-card-body text-wrap-faint">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={cx('rounded-full px-3 py-1.5 text-card-body', tone)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

// Her intention, and one dot per Thursday since she landed: they fill in,
// one by one, for the weeks she went drawing
function Intention() {
  const [ref, inView] = useInView<HTMLElement>()
  const went = new Set(intention.went)
  return (
    <section ref={ref} className="rounded-[32px] bg-baton-yellow px-6 pt-6 pb-7">
      <p className="text-card-body text-on-baton-yellow-muted">{intention.label}</p>
      <p className="mt-1 text-section font-medium">“{intention.quote}”</p>
      <div className="mt-6 grid grid-cols-[repeat(13,1fr)] gap-1.5" aria-hidden>
        {Array.from({ length: intention.thursdays }, (_, week) => (
          <span key={week} className="aspect-square rounded-full border border-baton-navy/20">
            {went.has(week) && (
              <span
                className={cx('block size-full rounded-full bg-baton-navy transition-transform duration-300', inView ? 'scale-100' : 'scale-0')}
                style={{ transitionDelay: `${300 + week * 60}ms`, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            )}
          </span>
        ))}
      </div>
      <p className="mt-6 text-card-title font-medium">{intention.headline}</p>
      <p className="mt-1 text-callout text-on-baton-yellow-muted">{intention.detail}</p>
    </section>
  )
}

// The demo bookend: the same prompt in her LA café and her New York one,
// dropped side by side like two prints
function Bookend() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref}>
      <p className="text-card-body text-wrap-faint">{bookend.label}</p>
      <p className="mt-1 text-card-title font-medium">“{bookend.prompt}”</p>
      <div className="mt-6 flex justify-center gap-3">
        <Print shot={bookend.then} tilt={-4} shown={inView} delay={150} />
        <Print shot={bookend.now} tilt={3} shown={inView} delay={450} />
      </div>
      <p className="mt-5 text-center text-callout text-wrap-faint">{bookend.note}</p>
    </section>
  )
}

type Shot = { src: string; alt: string; place: string; when: string }

function Print({ shot, tilt, shown, delay }: { shot: Shot; tilt: number; shown: boolean; delay: number }) {
  return (
    <figure
      className="w-[160px] rounded-[18px] bg-white p-2 pb-3 shadow-card transition-[opacity,transform] duration-500"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? `rotate(${tilt}deg)` : `translateY(24px) rotate(${tilt * 2}deg)`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      }}
    >
      <img src={shot.src} alt={shot.alt} className="aspect-[3/4] w-full rounded-[12px] object-cover" />
      <figcaption className="mt-2 px-1">
        <span className="block text-card-body font-medium">{shot.place}</span>
        <span className="block text-caption text-wrap-faint">{shot.when}</span>
      </figcaption>
    </figure>
  )
}

function Close() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref} className="flex flex-col items-center pt-4 text-center">
      <Reveal shown={inView} delay={0}>
        <BatonMark className="size-14 text-baton-blue!" />
      </Reveal>
      <Reveal shown={inView} delay={200}>
        <p className="mt-5 text-section font-medium">{close.title}</p>
      </Reveal>
      <Reveal shown={inView} delay={400}>
        <p className="mt-2 w-[290px] text-callout text-wrap-faint">{close.body}</p>
      </Reveal>
      <Reveal shown={inView} delay={600}>
        <Button variant="glow" size="cta" onClick={() => navigate('today')} className="mt-10 w-[309px]">
          {close.cta}
          <ArrowRightIcon />
        </Button>
      </Reveal>
    </section>
  )
}

function Reveal({ shown, delay, children }: { shown: boolean; delay: number; children: ReactNode }) {
  return (
    <div
      className="transition-[opacity,transform] duration-500 ease-out"
      style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(12px)', transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
