import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { openComposer } from '../app/composer'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useDailyPrompt, useStatus, useStore } from '../app/store'
import type { SetupItem } from '../app/store'
import { setup, todoKind } from '../data/onboarding'
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
  Card,
  ChevronRightIcon,
  ItemCard,
  PromptWindow,
  SetupCard,
  TodayCard,
  TodoCard,
} from '../ui'
import { MainLayout } from './MainLayout'

type TodayProps = {
  // Prototype: jump ahead to her last week in LA so the legacy card shows
  lastWeek?: boolean
}

// Today, top to bottom (Figma TODAY 334:10047): the daily prompt in a glass
// circle with an icon for its medium (tap opens the camera or the + field),
// then on the paper the setup cards until they're done, then "Before you
// leave" as a list of cards: the legacy card in her last week in LA and
// suggestions from her archive (tap for tips). The to-dos she picked get their
// own "Moving to-dos" section above it; each opens to show tips.
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

  // Figma's setup row (TODAY 334:11110): Instagram, to-dos, leave date, with
  // Figma's SF Symbol glyphs (public/today/setup-*.svg). Locals
  // have no logistics to pick; only Moving has a leave date. Archive
  // organization remains its own flow.
  const setupItems: { id: SetupItem; title: string; subtitle: string; icon: ReactNode; tone: 'blue' | 'pink' | 'olive' }[] = [
    { id: 'instagram', ...setup.items.instagram, icon: <img src="/today/setup-instagram.svg" alt="" width={21} height={21} />, tone: 'blue' },
    ...(status === 'local' ? [] : [{ id: 'todos' as const, ...setup.items.todos[status], icon: <img src="/today/setup-todos.svg" alt="" width={21} height={15} />, tone: 'pink' as const }]),
    ...(status === 'moving'
      ? [
          {
            id: 'leave' as const,
            title: setupCards.leave.title,
            subtitle: setupDone.includes('leave') ? setupCards.leave.done(leaving) : setupCards.leave.subtitle,
            icon: <img src="/today/setup-leave.svg" alt="" width={21} height={21} />,
            tone: 'olive' as const,
          },
        ]
      : []),
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
        medium={medium}
        mediumLabel={promptMediumLabel[medium]}
        glass={promptGlass}
        tuning={glassTuning}
        onClick={medium === 'photo' ? () => camera.current?.click() : openComposer}
      />

      {/* Below the prompt, straight on the paper (Figma TODAY 334:10047): the
          setup row, then "Before you leave" */}
      <div className="flex flex-col gap-10 px-3.5 pt-4">
        {setupCount < setupItems.length && (
          <section className="flex flex-col gap-4">
            <h2 className="text-section font-normal text-ink">{setup.header}</h2>
            {/* Runs to the screen edges so the next card peeks in */}
            <div className="-mx-[30px] -my-3 flex snap-x snap-mandatory scroll-px-[30px] gap-3 overflow-x-auto px-[30px] py-3 [scrollbar-width:none]">
              {setupItems.map((item) => (
                <SetupCard
                  key={item.id}
                  icon={item.icon}
                  tone={item.tone}
                  title={item.title}
                  subtitle={item.subtitle}
                  done={setupDone.includes(item.id)}
                  onClick={() => navigate(`setup-${item.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* The to-dos she picked; open one for tips from people who did it */}
        {pickedTodos.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-section font-normal text-ink">{beforeYouLeave.todosHeader[status]}</h2>
            <div className="flex flex-col gap-3">
              {pickedTodos.map((item) => {
                const itemTips = tips[item.id] ?? []
                return (
                  <TodoCard
                    key={item.id}
                    kind={todoKind[item.id] ?? 'home'}
                    title={item.title}
                    subtitle={itemTips.length ? beforeYouLeave.tipCount(itemTips.length) : undefined}
                    tips={itemTips}
                    done={doneTodos.includes(item.id)}
                    onToggleDone={() => setState((s) => ({ doneTodos: toggleIn(s.doneTodos, item.id) }))}
                    copy={beforeYouLeave}
                  />
                )
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-section font-normal text-ink">{beforeYouLeave.header[status]}</h2>
          <div className="flex flex-col gap-3">
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

            {/* Placeholder cards for the stages whose flows come later */}
            {status !== 'moving' &&
              todayCards[status].map((card) => {
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
                    onClick={to && (() => navigate(to.screen))}
                  />
                )
              })}

            {/* Suggestions from her archive; tap for tips from people who did it */}
            {suggested.map((item) => (
              <TodayCard
                key={item.id}
                title={item.title}
                highlight={item.highlight}
                subtitle={item.subtitle}
                photo={item.photo}
                photoPosition={item.photoPosition}
                done={doneTodos.includes(item.id)}
                onClick={() => setOpenTodo(item.id)}
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
