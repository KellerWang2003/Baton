import { useEffect, useRef } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { stageSplash } from '../data/stageSplash'
import type { Stage } from '../flow'
import { ArrowRightIcon, Button, Confetti } from '../ui'

// Congrats splash for a stage change (Figma Banner 266:3309 / 266:3704, offsets less the 54pt status bar): the
// greeting, a round photo with a soft gray rim, one line and the glow button.
// Pops up over the app when her stage moves forward; also in the flow as its
// own screen so the debug panel and arrow keys can reach it. Both stage
// changes get confetti (style picked in the debug panel, Welcome confetti).
export function StageSplashView({ stage, onDone }: { stage: Stage; onDone: () => void }) {
  const content = stageSplash[stage]
  const { confetti, confettiRun } = useStore()
  const photoRef = useRef<HTMLDivElement>(null)
  if (!content) return null

  return (
    <div className="absolute inset-0 z-50 flex animate-fade-in flex-col items-center bg-baton-paper text-baton-navy">
      <h1 className="mt-[100px] animate-splash-rise text-center text-section leading-[1.36]">
        {content.title.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      <div ref={photoRef} className="relative mt-[42px] size-[328px] shrink-0 animate-splash-photo">
        <img src={content.photo} alt={content.photoAlt} className="size-full rounded-full" />
        <img src="/stage-splash/vignette.svg" alt="" width={328} height={328} className="absolute inset-0" />
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
