import { useEffect, useRef, useState, type ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { localInsight, type Goal, type GoalTone } from '../data/localInsight'
import { ArrowRightIcon, BatonMark, Button, cx } from '../ui'

const { goals, bookend, close } = localInsight

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

// Local insight: what "You're a Local now!" opens. A scrolling page on the
// paper color: a card for each of the three goals she set on her last night
// in LA (how far she got, proof, and LA then), the café-seat prompt from both
// cities, then the hand-off line.
export function LocalInsight() {
  return (
    <div className="h-full overflow-y-auto bg-baton-paper font-display text-baton-navy">
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

        <Goals />
        <Bookend />
        <Close />
      </div>
    </div>
  )
}

const toneCard: Record<GoalTone, string> = {
  blue: 'bg-baton-blue text-white',
  yellow: 'bg-baton-yellow text-baton-navy',
  pink: 'bg-baton-pink text-baton-navy',
}
const toneMuted: Record<GoalTone, string> = {
  blue: 'text-on-baton-blue-muted',
  yellow: 'text-on-baton-yellow-muted',
  pink: 'text-on-baton-pink-muted',
}
const toneDot: Record<GoalTone, string> = {
  blue: 'bg-white',
  yellow: 'bg-baton-navy',
  pink: 'bg-baton-navy',
}

function Goals() {
  return (
    <section className="flex flex-col gap-4">
      <p className="animate-splash-rise text-card-body text-wrap-faint" style={{ animationDelay: '200ms' }}>
        {localInsight.goalsLabel}
      </p>
      {goals.map((goal, index) => (
        <GoalCard key={goal.goal} goal={goal} index={index} />
      ))}
    </section>
  )
}

// One goal: how it went, the number, a dot per week (or day) filling in for
// the ones she did it, proof from her archive and how it was in LA
function GoalCard({ goal, index }: { goal: Goal; index: number }) {
  const [ref, inView] = useInView<HTMLElement>()
  const filled = new Set(goal.dots.filled)
  const columns = goal.dots.total / 2
  return (
    <article
      ref={ref}
      className={cx('rounded-[32px] px-6 pt-5 pb-6 transition-[opacity,transform] duration-500 ease-out', toneCard[goal.tone])}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(24px)',
        transitionDelay: `${index === 0 ? 300 : 0}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-card-title font-medium">“{goal.goal}”</p>
        <span className="mt-0.5 shrink-0 rounded-full bg-white/40 px-2.5 py-1 text-caption font-medium">{goal.status}</span>
      </div>

      <div className="mt-5 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[44px] leading-none font-medium tracking-[-0.02em]">{goal.stat}</p>
          <p className={cx('mt-1 text-callout', toneMuted[goal.tone])}>{goal.statLabel}</p>
        </div>
        <div className="flex shrink-0">
          {goal.photos.map((photo, i) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              className={cx('size-[64px] rounded-[16px] border-2 border-white object-cover shadow-card', i > 0 && '-ml-5 rotate-[8deg]')}
            />
          ))}
        </div>
      </div>

      <div
        className="mt-5 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length: goal.dots.total }, (_, i) => (
          <span key={i} className="aspect-square rounded-full border border-current/25">
            {filled.has(i) && (
              <span
                className={cx('block size-full rounded-full transition-transform duration-300', toneDot[goal.tone], inView ? 'scale-100' : 'scale-0')}
                style={{ transitionDelay: `${500 + i * 40}ms`, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            )}
          </span>
        ))}
      </div>
      <p className={cx('mt-2 text-card-body', toneMuted[goal.tone])}>{goal.dots.label}</p>
      <p className="mt-4 border-t border-current/15 pt-3 text-callout">{goal.la}</p>
    </article>
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
