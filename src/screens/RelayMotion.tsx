import { useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { leavers, leaverTips, relayCategories, relayCopy, relayHeaders, relayPicks } from '../data/relay'
import type { Stage } from '../flow'
import { CategoryChip, MapIcon, SearchIcon, cx, relayChipIdle, relayPage } from '../ui'
import { relayEntrances, useRelayEntrance } from '../ui/relayEntrance'
import type { RelayEntrance } from '../ui/relayEntrance'
import { RelayFeed } from './RelayFeed'

export function RelayMotion({ onClose }: { onClose: () => void }) {
  const currentStage = useStatus()
  const [stage, setStage] = useState<Stage>(currentStage)
  const { relayEntrance, relayEntranceSpeed } = useStore()
  const [speed, setSpeed] = useState(relayEntranceSpeed)
  const [run, setRun] = useState(0)
  const button = 'rounded-full bg-baton-chip px-4 py-2 text-subhead font-medium hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand'

  return (
    <div role="dialog" aria-modal="true" aria-label="Relay entrance playground" className="fixed inset-0 z-40 overflow-y-auto bg-baton-paper font-body text-ink">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-baton-paper/95 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2">Relay entrances</h1>
          <p className="text-subhead text-ink-muted">Compare the motion. Scroll down and sideways to reveal more.</p>
        </div>
        <label className="flex items-center gap-2 text-footnote">
          Stage
          <select value={stage} onChange={(event) => setStage(event.target.value as Stage)} className={button}>
            <option value="moving">Moving</option><option value="newcomer">Newcomer</option><option value="local">Local</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-footnote">
          Speed
          <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className={button}>
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option>
          </select>
        </label>
        <button type="button" onClick={() => setRun((value) => value + 1)} className={button}>Replay all</button>
        <button type="button" onClick={onClose} className="rounded-full bg-ink px-4 py-2 text-subhead font-medium text-surface">Close</button>
      </header>
      <p className="px-6 pt-4 text-footnote text-ink-muted">Filters → headings → cards → people. Each piece appears once as it comes into view. Reduced motion follows your device settings.</p>
      <div className="flex flex-wrap justify-center gap-8 px-6 pb-12 pt-6">
        {relayEntrances.map((option, index) => (
          <section key={option.id} className="flex w-full max-w-[390px] flex-col gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-title-3">{index + 1}. {option.name}</h2>
                <span className="text-caption text-ink-muted">{Math.round(option.duration / speed)} ms · {Math.round(option.stagger / speed)} ms stagger</span>
              </div>
              <p className="mt-1 min-h-10 text-footnote text-ink-muted">{option.blurb}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => {
                  setState({ relayEntrance: option.id, relayEntranceSpeed: speed, status: stage, stageSplash: null, relayMap: false })
                  navigate('community')
                }} aria-pressed={relayEntrance === option.id && relayEntranceSpeed === speed} className={cx(button, relayEntrance === option.id && relayEntranceSpeed === speed && 'bg-ink text-surface hover:bg-ink/90')}>
                  {relayEntrance === option.id && relayEntranceSpeed === speed ? 'In Relay' : 'Use in Relay'}
                </button>
                <button type="button" onClick={() => {
                  setState({ relayEntrance: option.id, relayEntranceSpeed: speed, status: stage, stageSplash: null, relayMap: false })
                  navigate('community')
                  onClose()
                }} className={button}>Try in app ↗</button>
              </div>
            </div>
            <MotionPhone style={option.id} stage={stage} speed={speed} run={run} />
          </section>
        ))}
      </div>
    </div>
  )
}

function MotionPhone({ style, stage, speed, run }: { style: RelayEntrance; stage: Stage; speed: number; run: number }) {
  const { relayLook } = useStore()
  const root = useRef<HTMLDivElement>(null)
  const [replay, setReplay] = useState(0)
  useRelayEntrance(root, style, speed, `${stage}:${run}:${replay}:${relayLook}`)
  const reset = () => {
    root.current?.scrollTo({ top: 0 })
    root.current?.querySelectorAll('.snap-x').forEach((row) => row.scrollTo({ left: 0 }))
    setReplay((value) => value + 1)
  }
  // Remount on Replay all to reset both scroll directions as well as animation.
  return (
    <div>
      <button type="button" onClick={reset} className="mb-3 text-footnote font-medium text-brand">↻ Replay this phone</button>
      <div className={cx('@container relative h-[760px] overflow-hidden rounded-[48px] border border-line shadow-float', relayPage[relayLook])}>
        <div key={`${stage}:${run}`} ref={root} className="flex h-full flex-col gap-10 overflow-y-auto px-gutter pb-24 pt-6">
          <div data-relay-enter className="-mx-gutter -mb-4 flex items-center gap-3 pr-gutter">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pl-gutter">
              <CategoryChip look={relayLook} selected>{relayCopy.all}</CategoryChip>
              {relayCategories.map((category) => <CategoryChip key={category.id} look={relayLook} tone={category.tone}>{category.label}</CategoryChip>)}
            </div>
            <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full', relayChipIdle[relayLook])}><SearchIcon className="size-[18px]" /></span>
          </div>
          <RelayFeed look={relayLook} headers={relayHeaders[stage]} picks={relayPicks(stage)} people={leavers.map((leaver) => ({ leaver, tips: leaverTips(leaver.id) })).filter((row) => row.tips.length)} onOpen={() => {}} />
          <div className="pointer-events-none sticky bottom-2 z-10 -mt-20 flex justify-center">
            <span className="flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-on-brand shadow-float"><MapIcon />{relayCopy.map}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
