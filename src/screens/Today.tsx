import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { openComposer } from '../app/composer'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useDailyPrompt, useStatus, useStore } from '../app/store'
import type { SetupItem } from '../app/store'
import { setup } from '../data/onboarding'
import { greeting, timeOfDay } from '../data/greetings'
import { promptMedium, promptMediumLabel } from '../data/pages'
import { todayCards } from '../data/stages'
import {
  allTodos,
  beforeYouLeave,
  daysUntil,
  lastWeekDays,
  leave,
  legacyCard,
  mockToday,
  setupCards,
  shortDate,
  suggestions,
  tips,
  tipSheet,
} from '../data/today'
import {
  ArrowRightIcon,
  BottomSheet,
  Button,
  Card,
  CardRow,
  CheckCircle,
  ChevronRightIcon,
  ItemCard,
  PromptWindow,
  SetupCard,
} from '../ui'
import { MainLayout } from './MainLayout'

type TodayProps = {
  // Prototype: jump ahead to her last week in LA so the legacy card shows
  lastWeek?: boolean
}

// Today, top to bottom (Figma TODAY 236:1282): the daily prompt in a glass
// circle with its medium above (tap opens the + field), then on a cream panel the setup
// cards in a dashed outline until they're done, then "Before you leave" as a
// list of cards: the legacy card in her last week in LA, her to-dos (tap for
// tips) and suggestions for her stage.
export function Today({ lastWeek = false }: TodayProps) {
  const { todos, doneTodos, setupDone, keptPlaces, promptGlass, glassTuning, ...store } = useStore()
  const leaveDate = store.leaveDate || leave.defaultDate
  const status = useStatus()
  const prompt = useDailyPrompt()
  const medium = promptMedium(prompt.question)
  const camera = useRef<HTMLInputElement>(null)
  const [openTodo, setOpenTodo] = useState<string | null>(null)

  const daysLeft = daysUntil(lastWeek ? mockToday.lastWeek : mockToday.normal, leaveDate)
  const leaving = shortDate(leaveDate)
  const hello = greeting(status, timeOfDay(), daysLeft)

  // Figma's setup row starts with Instagram. Locals have no logistics to pick;
  // only Moving has a leave date. Archive organization remains its own flow.
  const setupItems: { id: SetupItem; title: string; subtitle: string; icon: ReactNode }[] = [
    { id: 'instagram', ...setup.items.instagram, icon: <img src="/today/setup-instagram.svg" alt="" /> },
    ...(status === 'moving'
      ? [
          {
            id: 'leave' as const,
            title: setupCards.leave.title,
            subtitle: setupDone.includes('leave') ? setupCards.leave.done(leaving) : setupCards.leave.subtitle,
            icon: <img src="/today/setup-leave.svg" alt="" />,
          },
        ]
      : []),
    ...(status === 'local' ? [] : [{ id: 'todos' as const, ...setup.items.todos[status], icon: <img src="/today/setup-todos.svg" alt="" /> }]),
  ]
  const setupCount = setupItems.filter((item) => setupDone.includes(item.id)).length

  const picked = todos ?? []
  const pickedTodos = picked.flatMap((id) => allTodos.find((todo) => todo.id === id) ?? [])
  const suggested = suggestions.items[status].filter(
    (item) => !picked.includes(item.id) && (!item.place || keptPlaces.includes(item.place)),
  )
  const sheetTodo = allTodos.find((todo) => todo.id === openTodo)
  const sheetDone = openTodo ? doneTodos.includes(openTodo) : false

  return (
    <MainLayout title={hello.title} subtitle={hello.subtitle} profile background="bg-baton-paper">
      {/* Photo prompts launch the camera; writing prompts open the + field. */}
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Take a photo for today's prompt"
        className="hidden"
        onChange={(event) => {
          const photo = event.target.files?.[0]
          event.target.value = ''
          if (!photo || !photo.type.startsWith('image/')) return
          setState({ capturePhoto: photo, composing: false })
          navigate('capture')
        }}
      />
      <PromptWindow
        className="pb-8 pt-6"
        question={prompt.question}
        seed={prompt.seed}
        medium={medium}
        mediumLabel={promptMediumLabel[medium]}
        glass={promptGlass}
        tuning={glassTuning}
        onClick={medium === 'photo' ? () => camera.current?.click() : openComposer}
      />

      {/* Everything else sits on a cream panel that runs to the bottom of the
          page, under the floating tab bar */}
      <div className="-mx-4 -mb-30 flex min-h-[420px] flex-col gap-6 rounded-t-panel bg-today-panel px-4 pb-36 pt-8">
        {setupCount < setupItems.length && (
          <CardRow className="today-setup" header={setup.header} detail={setupCards.progress(setupCount, setupItems.length)}>
            {setupItems.map((item) => (
              <SetupCard
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                done={setupDone.includes(item.id)}
                onClick={() => navigate(`setup-${item.id}`)}
              />
            ))}
          </CardRow>
        )}

        <section className="flex flex-col gap-1.5">
          <h2 className="px-4 text-footnote uppercase text-ink-muted">{beforeYouLeave.header[status]}</h2>
          <div className="flex flex-col gap-2.5">
            {status === 'moving' && daysLeft <= lastWeekDays && (
              <ItemCard
                tone="stage"
                eyebrow={legacyCard.eyebrow(daysLeft)}
                title={legacyCard.title}
                subtitle={legacyCard.body}
                trailing={
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-stage text-on-stage">
                    <ArrowRightIcon />
                  </span>
                }
                onClick={() => {
                  setState({ archiveSegment: 'legacy' })
                  navigate('archive')
                }}
              />
            )}

            {/* Placeholder cards for her stage until those flows are built */}
            {todayCards[status].map((card) => {
              const to = card.to
              return (
                <ItemCard
                  key={card.id}
                  tone={card.tone}
                  thumbnail={!card.tone}
                  eyebrow={card.eyebrow}
                  title={card.title}
                  subtitle={card.subtitle}
                  trailing={
                    to && (
                      <span className="text-line">
                        <ChevronRightIcon />
                      </span>
                    )
                  }
                  onClick={
                    to &&
                    (() => navigate(to.screen))
                  }
                />
              )
            })}

            {pickedTodos.map((item) => {
              const count = tips[item.id]?.length ?? 0
              const done = doneTodos.includes(item.id)
              return (
                <ItemCard
                  key={item.id}
                  title={item.title}
                  subtitle={count ? beforeYouLeave.tipCount(count) : undefined}
                  done={done}
                  leading={<CheckCircle checked={done} />}
                  trailing={
                    <span className="text-line">
                      <ChevronRightIcon />
                    </span>
                  }
                  onClick={() => setOpenTodo(item.id)}
                />
              )
            })}

            {suggested.map((item) => (
              <ItemCard
                key={item.id}
                thumbnail
                eyebrow={beforeYouLeave.suggested}
                title={item.title}
                subtitle={item.subtitle}
                trailing={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setState((s) => ({ todos: [...(s.todos ?? []), item.id] }))}
                  >
                    {beforeYouLeave.add}
                  </Button>
                }
              />
            ))}
          </div>
        </section>
      </div>

      <BottomSheet
        open={!!sheetTodo}
        onClose={() => setOpenTodo(null)}
        title={tipSheet.title}
        action={
          sheetTodo && (
            <button
              type="button"
              onClick={() => {
                setState((s) => ({ doneTodos: toggleIn(s.doneTodos, sheetTodo.id) }))
                setOpenTodo(null)
              }}
              className="text-body font-semibold text-brand active:opacity-50"
            >
              {sheetDone ? tipSheet.markUndone : tipSheet.markDone}
            </button>
          )
        }
      >
        {sheetTodo && (
          <div className="flex flex-col gap-4 pt-2">
            <h3 className="px-1 font-display text-title-2 font-bold text-ink">{sheetTodo.title}</h3>
            {(tips[sheetTodo.id] ?? []).map((tip) => (
              <Card key={tip.text} className="flex flex-col gap-1.5">
                <p className="text-body text-ink">{tip.text}</p>
                <p className="text-footnote text-ink-muted">{tip.from}</p>
              </Card>
            ))}
            {!tips[sheetTodo.id]?.length && <p className="px-1 text-subhead text-ink-muted">{tipSheet.empty}</p>}
          </div>
        )}
      </BottomSheet>
    </MainLayout>
  )
}

// Flow screen: Today a few days before she leaves LA.
export function TodayLastWeek() {
  return <Today lastWeek />
}
