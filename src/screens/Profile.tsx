import { useEffect, useRef, useState } from 'react'
import { goBack, navigate } from '../app/navigate'
import { changeStage, setState, toggleIn, useStatus, useStore } from '../app/store'
import { chloeGoals, intentions } from '../data/intentions'
import { about } from '../data/onboarding'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { profile } from '../data/profile'
import { stageCity, stageTags } from '../data/stages'
import { ArrowRightIcon, Avatar, BottomSheet, Button, Card, ChoiceCard, Chip, ListRow, ListSection, Screen, StageTag } from '../ui'

export function Profile() {
  const status = useStatus()
  const { goals: picked, tags, leaveDate } = useStore()
  const goals = picked.length ? picked : status === 'moving' ? [] : chloeGoals
  const [editor, setEditor] = useState<'stage' | 'tags' | null>(null)
  const [draftStage, setDraftStage] = useState(status)
  const [draftTags, setDraftTags] = useState(tags)
  const sheetRef = useRef<HTMLDivElement>(null)
  const tagsEditRef = useRef<HTMLButtonElement>(null)
  const departure = /^\d{4}-\d{2}-\d{2}$/.test(leaveDate)
    ? new Date(`${leaveDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  useEffect(() => {
    if (!editor) return
    const previous = document.activeElement as HTMLElement | null
    const fallback = tagsEditRef.current
    const sheet = sheetRef.current
    const controls = () => Array.from(sheet?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input, [tabindex="0"]') ?? [])
    controls()[0]?.focus({ preventScroll: true })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditor(null)
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
  }, [editor])

  const editStage = () => { setDraftStage(status); setEditor('stage') }
  const editTags = () => { setDraftTags(tags); setEditor('tags') }
  const save = () => {
    setEditor(null)
    if (editor === 'tags') setState({ tags: draftTags })
    else if (draftStage !== status) changeStage(draftStage)
  }

  return (
    <div className="relative h-full">
      <div className="h-full" inert={editor !== null}>
        <Screen title={pages.profile.title} onBack={() => goBack()}>
          <div className="mx-auto flex w-full max-w-xl flex-col gap-8 pb-6 pt-5">
            <header className="flex items-center gap-4">
              <Avatar name={chloe.name} src={chloe.avatar} size="lg" className="size-20" />
              <div className="min-w-0">
                <h2 className="text-title-1 text-ink">{chloe.name}</h2>
                <p className="mt-1 text-body text-ink-muted">{stageCity[status]}</p>
                <StageTag stage={status} label={stageTags[status]} size="lg" className="mt-2 font-display" />
              </div>
            </header>

            <section aria-labelledby="profile-journey">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="profile-journey" className="text-title-1 text-ink">{profile.journey}</h2>
                <button type="button" onClick={editStage} className="min-h-11 text-body text-brand">{profile.update}</button>
              </div>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-muted">{profile.from}</p>
                    <p className="mt-1 text-title-2 text-ink">{chloe.from}</p>
                  </div>
                  <span className="shrink-0 text-brand"><ArrowRightIcon /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-ink-muted">{status === 'moving' ? profile.to : profile.arrived}</p>
                    <p className="mt-1 text-title-2 text-ink">{chloe.to}</p>
                  </div>
                </div>
                <p className="mt-5 border-t border-line/70 pt-4 text-body text-ink-muted">{profile.stages[status]}</p>
                {status === 'moving' && (
                  <button type="button" onClick={() => navigate('setup-leave')} className="mt-2 flex min-h-11 w-full items-center justify-between gap-3 text-body text-brand">
                    <span>{profile.departure}{departure ? ` ${departure}` : ''}</span>
                    <span>{profile.edit}</span>
                  </button>
                )}
              </Card>
            </section>

            <section aria-labelledby="profile-intentions">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="profile-intentions" className="text-title-1 text-ink">{intentions.row}</h2>
                {goals.length > 0 && <button type="button" aria-label={profile.editIntentions} onClick={() => navigate('intentions')} className="min-h-11 text-body text-brand">{profile.edit}</button>}
              </div>
              {goals.length ? (
                <ul className="flex flex-col gap-3">
                  {goals.map((goal) => <li key={goal} className="flex items-start gap-3 text-headline text-ink"><span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-brand" />{goal}</li>)}
                </ul>
              ) : (
                <Card className="p-5">
                  <p className="text-title-2 text-ink">{profile.intentions}</p>
                  <p className="mt-2 text-body text-ink-muted">{profile.intentionsDetail}</p>
                  <Button variant="tinted" block className="mt-5" onClick={() => navigate('intentions')}>{profile.intentionsAction}<ArrowRightIcon /></Button>
                </Card>
              )}
            </section>

            <section aria-labelledby="profile-about">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 id="profile-about" className="text-title-1 text-ink">{profile.about}</h2>
                <button type="button" ref={tagsEditRef} onClick={editTags} className="min-h-11 text-body text-brand">{profile.edit}</button>
              </div>
              <p className="text-body text-ink-muted">{profile.aboutDetail}</p>
              {tags.length ? <ul className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <li key={tag} className="rounded-full bg-card px-3.5 py-2 text-subhead text-ink">{tag}</li>)}</ul>
                : <button type="button" onClick={editTags} className="mt-2 min-h-11 text-body text-brand">{profile.addTags} +</button>}
              {status === 'local' && <button type="button" onClick={() => navigate('local-insight')} className="mt-4 flex min-h-11 items-center gap-2 text-body text-brand">{profile.lifestyle}<ArrowRightIcon /></button>}
            </section>

            <section aria-labelledby="profile-keepsakes" className="border-t border-line/70 pt-6">
              <h2 id="profile-keepsakes" className="text-title-1 text-ink">{profile.keepsakes}</h2>
              <p className="mb-4 mt-2 text-body text-ink-muted">{profile.keepsakesDetail}</p>
              <ListSection>
                <ListRow title={pages.profile.wrappedRow} subtitle={pages.profile.wrappedDetail} chevron onClick={() => navigate('la-wrapped')} />
                <ListRow title={pages.profile.paperRow} subtitle={pages.profile.paperDetail} chevron onClick={() => navigate('rolling-paper')} />
              </ListSection>
            </section>
          </div>
        </Screen>
      </div>
      <div ref={sheetRef}>
        <BottomSheet open={editor !== null} onClose={() => setEditor(null)} title={editor === 'stage' ? profile.stageTitle : profile.tagsTitle} detent="large">
          <div className="mx-auto flex max-w-xl flex-col gap-5 pt-4">
            {editor === 'stage' ? <>
              <p className="text-body text-ink-muted">{profile.stageDetail}</p>
              <div role="group" aria-label={profile.stageTitle} className="flex flex-col gap-3">
                {about.moveOptions.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    title={option.label}
                    subtitle={option.detail}
                    selected={draftStage === option.id}
                    onSelect={() => setDraftStage(option.id)}
                  />
                ))}
              </div>
            </> : about.tagGroups.map((group) => <fieldset key={group.title}>
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
