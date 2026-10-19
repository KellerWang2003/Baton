import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { localInsight } from '../data/localInsight'
import { ArrowRightIcon, BatonMark, Button, cx, TypedSummary } from '../ui'

const { la, ny, intentions, bookend, close } = localInsight

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
    <div className="relative h-full bg-baton-paper font-display text-baton-navy" style={paperOutline}>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex max-w-[402px] flex-col gap-12 px-gutter pt-10 pb-[140px]">
          {/* Same title and muted line as Today and its to-do page */}
          <header className="flex animate-splash-rise flex-col gap-2">
            <h1 className="text-greeting font-normal">
              {localInsight.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-callout text-today-muted">{localInsight.eyebrow}</p>
          </header>

          <ThenAndNow />
          <div className="flex flex-col gap-4">
            {intentions.map((intention) => (
              <Intention key={intention.quote} intention={intention} />
            ))}
          </div>
          <Bookend />
          <Close />
        </div>
      </div>

      {/* Continue stays pinned to the bottom of the screen, over a fade of the page (Keller, Oct 19) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-baton-paper from-55% to-transparent pt-12 pb-[36px]">
        <Button
          variant="glow"
          size="cta"
          onClick={() => navigate('today')}
          className="pointer-events-auto w-[309px] animate-splash-rise"
          style={{ animationDelay: '600ms' }}
        >
          {close.cta}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}

// The small line above each part (a city, "Your intention", the prompt), in
// the muted 16pt of the lines under Today's titles
function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-callout text-today-muted', className)}>{children}</p>
}

function CityLabel({ dot, label, when }: { dot: string; label: string; when: string }) {
  return (
    <Label className="flex items-center gap-2">
      <span className={cx('size-2.5 shrink-0 rounded-full', dot)} />
      <span className="text-baton-navy">{label}</span>
      <span>· {when}</span>
    </Label>
  )
}

function ThenAndNow() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref} className="flex flex-col gap-7">
      <div className="animate-splash-rise" style={{ animationDelay: '200ms' }}>
        <CityLabel dot="bg-baton-blue" label={la.label} when={la.when} />
        <TypedSummary parts={la.parts} play={false} className="mt-2 text-section leading-[1.25] text-wrap-faint" />
      </div>
      <div>
        <CityLabel dot="bg-baton-olive" label={ny.label} when={ny.when} />
        {inView && <TypedSummary parts={ny.parts} play className="mt-2 text-section leading-[1.25]" />}
      </div>
      <div className={cx('flex flex-col gap-4 transition-opacity duration-500', inView ? 'opacity-100 delay-[2400ms]' : 'opacity-0')}>
        <TagRow label="Stayed" tags={localInsight.stayed} tone="bg-baton-chip" />
        <TagRow label="New" tags={localInsight.fresh} tone="bg-baton-yellow" />
      </div>
    </section>
  )
}

// Pills at the size of the app's Chip (32pt tall, 15pt medium)
function TagRow({ label, tags, tone }: { label: string; tags: string[]; tone: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={cx('inline-flex h-8 items-center rounded-full px-3.5 text-subhead font-medium', tone)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

const intentionTone = {
  yellow: { card: 'bg-baton-yellow', muted: 'text-on-baton-yellow-muted' },
  pink: { card: 'bg-baton-pink', muted: 'text-on-baton-pink-muted' },
}

// One of her intentions, with a dot per week since she landed: they fill in,
// one by one, for the weeks she did it
function Intention({ intention }: { intention: (typeof intentions)[number] }) {
  const [ref, inView] = useInView<HTMLElement>()
  const done = new Set(intention.done)
  const tone = intentionTone[intention.tone]
  return (
    <section ref={ref} className={cx('rounded-card px-5 pt-5 pb-6', tone.card)}>
      <p className={cx('text-callout', tone.muted)}>{intention.label}</p>
      <p className="mt-1 text-section font-normal">“{intention.quote}”</p>
      <div className="mt-6 grid grid-cols-[repeat(13,1fr)] gap-1.5" aria-hidden>
        {Array.from({ length: intention.weeks }, (_, week) => (
          <span key={week} className="aspect-square rounded-full border border-baton-navy/20">
            {done.has(week) && (
              <span
                className={cx('block size-full rounded-full bg-baton-navy transition-transform duration-300', inView ? 'scale-100' : 'scale-0')}
                style={{ transitionDelay: `${300 + week * 60}ms`, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            )}
          </span>
        ))}
      </div>
      <p className="mt-6 text-today-card font-medium">{intention.headline}</p>
      <p className={cx('mt-0.5 text-today-detail', tone.muted)}>{intention.detail}</p>
    </section>
  )
}

// The demo bookend: the same prompt in her LA café and her New York one,
// dropped side by side like two prints
function Bookend() {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <section ref={ref}>
      <Label>{bookend.label}</Label>
      <p className="mt-1 text-section font-normal">“{bookend.prompt}”</p>
      <div className="mt-8 grid grid-cols-2 gap-4 px-1">
        <Print shot={bookend.then} tone="bg-baton-blue text-on-brand" tilt={-1.6} shown={inView} delay={150} />
        <Print shot={bookend.now} tone="bg-baton-yellow text-baton-navy" tilt={1.2} shown={inView} delay={450} />
      </div>
      <p className="mt-6 text-center text-today-detail text-today-muted">{bookend.note}</p>
    </section>
  )
}

type Shot = { src: string; alt: string; place: string; when: string }

// In Relay's scrapbook look (Keller, Oct 19): a tilted paper scrap in its
// city's color, held on with cream tape
function Print({ shot, tone, tilt, shown, delay }: { shot: Shot; tone: string; tilt: number; shown: boolean; delay: number }) {
  return (
    <figure
      className={cx('grain relative rounded-card p-2 pb-3 shadow-rec transition-[opacity,transform] duration-500', tone)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? `rotate(${tilt}deg)` : `translateY(24px) rotate(${tilt * 2}deg)`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      }}
    >
      <span aria-hidden className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-baton-cream shadow-paper" />
      {/* Square, like the photo the prompt asked for */}
      <img src={shot.src} alt={shot.alt} className="aspect-square w-full rounded-tile object-cover" />
      <figcaption className="mt-2.5 px-1">
        <span className="block text-today-card font-medium">{shot.place}</span>
        <span className="block text-today-detail opacity-70">{shot.when}</span>
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
        <p className="mt-5 text-section font-normal">{close.title}</p>
      </Reveal>
      <Reveal shown={inView} delay={400}>
        <p className="mt-2 w-[290px] text-callout text-today-muted">{close.body}</p>
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
