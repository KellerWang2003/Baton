import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { goBack, navigate } from '../app/navigate'
import { setState, toggleIn, useStatus, useStore } from '../app/store'
import type { Stage } from '../flow'
import { chloeGoals, intentions } from '../data/intentions'
import { localInsight } from '../data/localInsight'
import { about } from '../data/onboarding'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { profile } from '../data/profile'
import { archiveSummary, stageCity, stageTags } from '../data/stages'
import { ArrowRightIcon, Avatar, BottomSheet, Button, Card, Chip, cx, pickedGoalFill, RecCard, Screen, StageTag, TypedSummary } from '../ui'
import { Intention } from './LocalInsight'

// Her header takes her stage's color, as on the stage splash and StageTag
const stageHeader: Record<Stage, string> = {
  moving: 'bg-baton-blue text-on-brand',
  newcomer: 'bg-baton-yellow text-baton-olive',
  local: 'bg-baton-olive text-baton-cream',
}

// Inline photos are outlined in the color behind them
const paperOutline = { '--folder-fill': 'var(--color-baton-paper)' } as CSSProperties

export function Profile() {
  const status = useStatus()
  const { goals: picked, tags: savedTags, leaveDate } = useStore()
  const goals = picked.length ? picked : status === 'moving' ? [] : chloeGoals
  const tags = savedTags.length ? savedTags : chloe.tags
  const lifestyle = archiveSummary('la', status)
  const [editing, setEditing] = useState(false)
  const [draftTags, setDraftTags] = useState(tags)
  const sheetRef = useRef<HTMLDivElement>(null)
  const tagsEditRef = useRef<HTMLButtonElement>(null)
  const departure = /^\d{4}-\d{2}-\d{2}$/.test(leaveDate)
    ? new Date(`${leaveDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : chloe.leavingOn

  useEffect(() => {
    if (!editing) return
    const previous = document.activeElement as HTMLElement | null
    const fallback = tagsEditRef.current
    const sheet = sheetRef.current
    const controls = () => Array.from(sheet?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input, [tabindex="0"]') ?? [])
    controls()[0]?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditing(false)
      if (event.key !== 'Tab') return
      const items = controls()
      const target = event.shiftKey ? items.at(-1) : items[0]
      if (document.activeElement === (event.shiftKey ? items[0] : items.at(-1))) {
        event.preventDefault()
        target?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const target = previous?.isConnected ? previous : fallback
      target?.focus({ preventScroll: true })
    }
  }, [editing])

  const editTags = () => { setDraftTags(tags); setEditing(true) }
  const save = () => {
    setEditing(false)
    setState({ tags: draftTags })
  }

  return (
    <div className="relative h-full">
      <div className="h-full" inert={editing}>
        <Screen title={pages.profile.title} onBack={() => goBack()}>
          <div className="mx-auto flex w-full max-w-xl flex-col gap-10 pb-10 pt-5" style={paperOutline}>
            <header className={cx('rounded-card p-5 shadow-card', stageHeader[status])}>
              <div className="flex items-center gap-4">
                <Avatar name={chloe.name} src={chloe.avatar} size="lg" className="size-20" />
                <div className="min-w-0">
                  <h2 className="text-title-1">{chloe.name}</h2>
                  <p className="mt-1 text-body opacity-75">{stageCity[status]}</p>
                  <StageTag stage={status} label={stageTags[status]} tone="light" size="lg" className="mt-2 font-display" />
                </div>
              </div>
              <p className="mt-5 flex items-center gap-2 text-title-2">
                {chloe.from}<ArrowRightIcon />{chloe.to}
              </p>
              <p className="mt-1 text-body opacity-75">{profile.stages[status]}</p>
              {status === 'moving' && (
                <button type="button" onClick={() => navigate('setup-leave')} className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 border-t border-current/20 pt-2 text-body">
                  <span>{profile.departure} {departure}</span>
                  <span className="font-medium">{profile.edit}</span>
                </button>
              )}
            </header>

            {lifestyle && (
              <section aria-labelledby="profile-lifestyle">
                <h2 id="profile-lifestyle" className="mb-3 text-title-1 text-ink">{profile.lifestyleTitle}</h2>
                <p className="text-callout text-ink-muted">{profile.lifestyleWhen[status]}</p>
                <TypedSummary parts={lifestyle.parts} play={status !== 'local'} className={cx('mt-2 text-section leading-[1.25]', status === 'local' ? 'text-wrap-faint' : 'text-ink')} />
                {status === 'local' && <>
                  <p className="mt-6 text-callout text-ink-muted">{profile.nowWhen}</p>
                  <TypedSummary parts={localInsight.ny.parts} play={false} className="mt-2 text-section leading-[1.25] text-ink" />
                  <button type="button" onClick={() => navigate('local-insight')} className="mt-4 flex min-h-11 items-center gap-2 text-body text-brand">{profile.lifestyle}<ArrowRightIcon /></button>
                </>}
              </section>
            )}

            <section aria-labelledby="profile-intentions">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="profile-intentions" className="text-title-1 text-ink">{intentions.row}</h2>
                {goals.length > 0 && <button type="button" aria-label={profile.editIntentions} onClick={() => navigate('intentions')} className="min-h-11 text-body text-brand">{profile.edit}</button>}
              </div>
              {goals.length ? <>
                {/* Her picks, as they look on the intentions canvas */}
                <ul className="flex flex-wrap pl-2">
                  {goals.map((goal, index) => (
                    <li
                      key={goal}
                      className={cx('-ml-2 flex size-28 items-center justify-center rounded-full p-4 text-center text-subhead text-baton-navy', index % 2 === 1 && 'translate-y-3')}
                      style={{ background: pickedGoalFill }}
                    >
                      {goal}
                    </li>
                  ))}
                </ul>
                {status === 'local' && (
                  <div className="mt-8 flex flex-col gap-4">
                    {localInsight.intentions.map((intention) => <Intention key={intention.quote} intention={intention} />)}
                  </div>
                )}
              </> : (
                <Card className="p-5">
                  <p className="text-title-2 text-ink">{profile.intentions}</p>
                  <p className="mt-2 text-body text-ink-muted">{profile.intentionsDetail}</p>
                  <Button block className="mt-5" onClick={() => navigate('intentions')}>{profile.intentionsAction}<ArrowRightIcon /></Button>
                </Card>
              )}
            </section>

            <section aria-labelledby="profile-about">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 id="profile-about" className="text-title-1 text-ink">{profile.about}</h2>
                <button type="button" ref={tagsEditRef} onClick={editTags} className="min-h-11 text-body text-brand">{profile.edit}</button>
              </div>
              <p className="text-body text-ink-muted">{profile.aboutDetail}</p>
              <ul className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <li key={tag} className="rounded-full bg-card px-3.5 py-2 text-subhead text-ink">{tag}</li>)}</ul>
            </section>

            {/* LA Wrapped and the Rolling Paper happen after landing */}
            {status !== 'moving' && (
              <section aria-labelledby="profile-keepsakes">
                <h2 id="profile-keepsakes" className="text-title-1 text-ink">{profile.keepsakes}</h2>
                <p className="mt-2 text-body text-ink-muted">{profile.keepsakesDetail}</p>
                <div className="-mx-gutter mt-2 flex snap-x scroll-px-gutter gap-3 overflow-x-auto px-gutter">
                  <RecCard look="scrapbook" size="sm" index={0} tone="blue" photo={profile.wrappedPhoto} title={pages.profile.wrappedRow} text={pages.profile.wrappedDetail} onClick={() => navigate('la-wrapped')} />
                  <RecCard look="scrapbook" size="sm" index={1} tone="yellow" photo={profile.paperPhoto} title={pages.profile.paperRow} text={pages.profile.paperDetail} onClick={() => navigate('rolling-paper')} />
                </div>
              </section>
            )}
          </div>
        </Screen>
      </div>
      <div ref={sheetRef}>
        <BottomSheet open={editing} onClose={() => setEditing(false)} title={profile.tagsTitle} detent="large">
          <div className="mx-auto flex max-w-xl flex-col gap-5 pt-4">
            {about.tagGroups.map((group) => <fieldset key={group.title}>
              <legend className="mb-3 text-headline text-ink">{group.title}</legend>
              <div className="flex flex-wrap gap-2">{group.tags.map((tag) => <Chip key={tag} selected={draftTags.includes(tag)} onClick={() => setDraftTags(toggleIn(draftTags, tag))}>{tag}</Chip>)}</div>
            </fieldset>)}
            <Button block onClick={save}>{profile.save}</Button>
          </div>
        </BottomSheet>
      </div>
    </div>
  )
}
