import { useEffect, useRef } from 'react'
import { keyScreens, onboardingScreens } from '../data/showcase'
import type { KeyScreen } from '../data/showcase'
import type { Stage } from '../flow'
import { flow } from '../flow'
import { ArrowRightIcon, CheckIcon } from '../ui'
import { playFolderExit } from './folderTransition'
import { navigate } from './navigate'
import { setState, useArchive, useStatus, useStore } from './store'
import { markTried, useTried } from './tried'
import { useScreenIndex } from './useScreenIndex'

const stageNames: Record<Stage, string> = { moving: 'Moving', newcomer: 'Newcomer', local: 'Local' }
const stages = Object.keys(keyScreens) as Stage[]
const openedPlace = 'ArtCenter Hillside'

// Beside the phone on desktop: shortcuts to the key screens of Chloe's
// journey, grouped under the three stages, each group tinted with its stage's
// color. The screen showing is filled in, it and screens seen this session
// get a check, and a click jumps there. Hidden on narrower windows and phones.
export function KeyScreens() {
  const status = useStatus()
  const [index] = useScreenIndex()
  const { id } = flow[index]
  const { selectedFolder } = useStore()
  const tried = useTried()
  const { clouds, moments } = useArchive()
  const onboarding = onboardingScreens.has(id)
  useEffect(() => { if (!onboarding) markTried(`${status}/screen:${id}`) }, [onboarding, status, id])

  const isCurrent = (stage: Stage, item: KeyScreen) =>
    !onboarding && stage === status && item.screen === id &&
    (!item.state?.selectedFolder || item.state.selectedFolder === (selectedFolder ?? 'la'))
  const isSeen = (stage: Stage, item: KeyScreen) => tried.has(`${stage}/screen:${item.screen}`)

  // Her current stage's card sits in the middle of the column (Moving's
  // during onboarding)
  const list = useRef<HTMLDivElement>(null)
  const activeStage = onboarding ? null : status
  const placed = useRef(false)
  useEffect(() => {
    const scroller = list.current
    if (!scroller) return
    const center = (behavior: ScrollBehavior) => {
      const card = scroller.querySelector<HTMLElement>('[data-active="true"]') ?? scroller.querySelector<HTMLElement>('.key-stage')
      if (card) scroller.scrollTo({ top: card.offsetTop - (scroller.clientHeight - card.offsetHeight) / 2, behavior })
    }
    // Glide between stages; on first load, and whenever the column is resized,
    // straight there
    const gliding = placed.current
    if (gliding) center('smooth')
    placed.current = true
    // The observer reports once on start; let a glide play out
    let skip = gliding
    const observer = new ResizeObserver(() => {
      if (skip) skip = false
      else center('instant')
    })
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [activeStage])

  async function open(stage: Stage, item: KeyScreen) {
    // The opened photo is the ArtCenter Hillside contest shoot (Keller, Oct 22)
    const photo = item.screen === 'archive-selected'
      ? clouds.la?.find(({ src }) => moments[src]?.place.includes(openedPlace))?.src ?? null
      : undefined
    const sameStage = stage === status
    setState({ status: stage, stageSplash: null, composing: false, camera: null, capturePhoto: null, promptIndex: null, ...item.state, ...(photo !== undefined && { selectedPhoto: photo }) })
    // When it's the next step from the screen showing, play the same
    // transition as tapping through in the phone
    if (sameStage && id === 'archive' && item.screen === 'archive-detail' && item.state?.selectedFolder) {
      await playFolderExit(item.state.selectedFolder)
    }
    if (sameStage && id === 'archive-detail' && photo) {
      const shown = document.querySelector(`[data-cloud-photo] img[src="${photo}"]`)
      if (shown) {
        const rect = shown.getBoundingClientRect()
        setState({ selectedPhotoFrom: { x: rect.left, y: rect.top, size: rect.width } })
      }
    }
    navigate(item.screen)
  }

  return (
    <aside className="key-screens" aria-label="Key screens">
      <div ref={list} className="key-screens-scroll">
        {/* Sits right above Moving and scrolls with the cards */}
        <h2 className="key-screens-title">Key screens</h2>
        {stages.map((stage) => (
          <section key={stage} className="key-stage" data-journey={stage} data-active={!onboarding && stage === status}>
            <h3 className="key-stage-tag">{stageNames[stage]}</h3>
            <ul className="key-stage-list">
              {keyScreens[stage].map((item) => {
                const current = isCurrent(stage, item)
                return (
                  <li key={item.label} className={item.depth ? 'key-screen-sub' : undefined} data-depth={item.depth}>
                    <button type="button" className="key-screen" aria-current={current ? 'page' : undefined} onClick={() => open(stage, item)}>
                      <span className="key-screen-label">{item.label}</span>
                      <span className="key-screen-mark" aria-hidden="true">
                        {current || isSeen(stage, item) ? <CheckIcon /> : <ArrowRightIcon />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
