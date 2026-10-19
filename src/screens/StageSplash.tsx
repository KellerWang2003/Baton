import { useEffect, useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { stageSplash } from '../data/stageSplash'
import type { Stage } from '../flow'
import { ArrowRightIcon, Button, Confetti, cx } from '../ui'

// Congrats splash for a stage change (Figma Banner 266:3309 / 266:3704, offsets less the 54pt status bar): the
// greeting, a round photo with a soft gray rim, one line and the glow button.
// Pops up over the app when her stage moves forward; also in the flow as its
// own screen so the debug panel and arrow keys can reach it. Both stage
// changes get confetti (style picked in the debug panel, Welcome confetti).
// Each stage's splash in its own brand color, full-bleed up under the status
// bar like the app's Welcome to Baton splash (Figma Splash_Blue 337:1181;
// Keller, Oct 19): Newcomer yellow with olive text, Local olive with cream.
// rim is the photo's soft edge, fading into the page color.
const splashTones: Partial<Record<Stage, { page: string; rim: string; dark?: boolean }>> = {
  newcomer: { page: 'bg-baton-yellow text-baton-olive', rim: 'var(--color-baton-yellow)' },
  local: { page: 'bg-baton-olive text-baton-cream', rim: 'var(--color-baton-olive)', dark: true },
}

// Reaches up under the status bar, so the color fills the whole screen
const fullBleed = {
  top: 'calc(-1 * var(--status-bar, 0px))',
  paddingTop: 'var(--status-bar, 0px)',
}

export function StageSplashView({ stage, onDone }: { stage: Stage; onDone: () => void }) {
  const [readyStage, setReadyStage] = useState<Stage | null>(null)
  useEffect(() => {
    const timer = window.setTimeout(() => setReadyStage(stage), 1500)
    return () => window.clearTimeout(timer)
  }, [stage])

  // A light status bar over the dark (olive) splash, back to dark when it closes
  const dark = Boolean(splashTones[stage]?.dark)
  useEffect(() => {
    setState({ lightStatusBar: dark })
    return () => setState({ lightStatusBar: false })
  }, [dark])

  // Keep an opaque blank page beneath the entrance, so the previous screen
  // never shows through the fade. Mount confetti only when the entrance starts.
  return (
    <div className={cx('absolute inset-0 z-50', splashTones[stage]?.page)} style={fullBleed}>
      {readyStage === stage && <StageSplashAnimation key={stage} stage={stage} onDone={onDone} />}
    </div>
  )
}

function StageSplashAnimation({ stage, onDone }: { stage: Stage; onDone: () => void }) {
  const content = stageSplash[stage]
  const { confetti, confettiRun } = useStore()
  const photoRef = useRef<HTMLDivElement>(null)
  const tone = splashTones[stage]
  if (!content || !tone) return null

  return (
    <div className={cx('absolute inset-0 z-50 flex animate-fade-in flex-col items-center', tone.page)} style={fullBleed}>
      <h1 className="mt-[100px] animate-splash-rise text-center text-section leading-[1.36]">
        {content.title.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      <div ref={photoRef} className="relative mt-[42px] size-[328px] shrink-0 animate-splash-photo">
        <img src={content.photo} alt={content.photoAlt} className="size-full rounded-full" />
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(closest-side, transparent 80%, ${tone.rim})` }}
        />
      </div>
      <p
        className="mt-[60px] w-[286px] animate-splash-rise text-center text-[18px] leading-[1.4] tracking-[-0.011em]"
        style={{ animationDelay: '450ms' }}
      >
        {content.message}
      </p>
      <Button
        variant="glow"
        size="cta"
        onClick={() => {
          onDone()
          navigate(content.next)
        }}
        className="absolute bottom-[36px] w-[309px] animate-splash-rise"
        style={{ animationDelay: '650ms' }}
      >
        {content.cta}
        <ArrowRightIcon />
      </Button>
      <Confetti key={`${confetti}-${confettiRun}`} variant={confetti} around={photoRef} />
    </div>
  )
}

// The pop-up, shown while the store holds a stage to celebrate
export function StageSplashOverlay({ stage }: { stage: Stage }) {
  return <StageSplashView stage={stage} onDone={() => setState({ stageSplash: null })} />
}

// Flow screens: arriving in New York, and becoming a Local
export function ArrivedSplash() {
  return <FlowSplash stage="newcomer" />
}

export function LocalSplash() {
  return <FlowSplash stage="local" />
}

function FlowSplash({ stage }: { stage: Stage }) {
  const status = useStatus()
  // Opening the screen directly puts her in that stage, so the app behind it matches
  useEffect(() => {
    if (status !== stage) setState({ status: stage })
  }, [status, stage])
  return <StageSplashView stage={stage} onDone={() => {}} />
}
