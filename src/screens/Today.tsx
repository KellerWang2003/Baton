import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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
  leave,
  mockToday,
  setupCards,
  shortDate,
  suggestions,
  tips,
  tipSheet,
} from '../data/today'
import {
  BottomSheet,
  Card,
  MomentCard,
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
  const { todos, doneTodos, setupDone, keptPlaces, promptGlass, glassTuning, orbMoves, ...store } = useStore()
  const leaveDate = store.leaveDate || leave.defaultDate
  const status = useStatus()
  const prompt = useDailyPrompt()
  const medium = promptMedium(prompt.question)
  const [openTodo, setOpenTodo] = useState<string | null>(null)
  const todoList = useRef<HTMLDivElement>(null)
  const todoPositions = useRef(new Map<string, number>())

  // Capture before reordering, then animate each card from its previous slot.
  const toggleTodo = (id: string) => {
    const list = todoList.current
    todoPositions.current.clear()
    if (list && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const card of Array.from(list.children) as HTMLElement[]) {
        card.getAnimations().forEach((animation) => animation.cancel())
        todoPositions.current.set(card.dataset.todoId!, card.offsetTop)
      }
    }
    setState((s) => ({ doneTodos: toggleIn(s.doneTodos, id) }))
  }

  useLayoutEffect(() => {
    const list = todoList.current
    if (!list || !todoPositions.current.size) return
    for (const card of Array.from(list.children) as HTMLElement[]) {
      const previous = todoPositions.current.get(card.dataset.todoId!)
      if (previous === undefined) continue
      const distance = previous - card.offsetTop
      if (!distance) continue
      card.animate(
        [
          { transform: `translateY(${distance}px)`, zIndex: 1 },
          { transform: 'translateY(0)', zIndex: 1 },
        ],
        { duration: 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }
    todoPositions.current.clear()
  }, [doneTodos])

  const daysLeft = !lastWeek && !store.leaveDate && store.expectedLeaveMonth ? Infinity : daysUntil(lastWeek ? mockToday.lastWeek : mockToday.normal, leaveDate)
  const leaving = shortDate(leaveDate)
  const hello = greeting(status, timeOfDay(), daysLeft)

  // Showcase setup row: to-dos first, then Instagram and leave date, with
  // Figma's SF Symbol glyphs (public/today/setup-*.svg). Locals
  // have no logistics to pick; only Moving has a leave date. Archive
  // organization remains its own flow.
  const setupItems: { id: SetupItem; title: string; subtitle: string; icon: ReactNode; tone: 'blue' | 'pink' | 'olive' }[] = [
    ...(status === 'local' ? [] : [{ id: 'todos' as const, ...setup.items.todos[status], icon: <img src="/today/setup-todos.svg" alt="" width={21} height={15} />, tone: 'pink' as const }]),
    { id: 'instagram', ...setup.items.instagram, icon: <img src="/today/setup-instagram.svg" alt="" width={21} height={21} />, tone: 'blue' },
    ...(status === 'moving'
      ? [
          {
            id: 'leave' as const,
            title: setupCards.leave.title,
            subtitle: setupDone.includes('leave') ? setupCards.leave.done(leaving) : store.expectedLeaveMonth ? `Around ${new Date(`${store.expectedLeaveMonth}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long' })} · Add a date` : setupCards.leave.subtitle,
            icon: <img src="/today/setup-leave.svg" alt="" width={21} height={21} />,
            tone: 'olive' as const,
          },
        ]
      : []),
  ]
  const setupCount = setupItems.filter((item) => setupDone.includes(item.id)).length

  const picked = todos ?? []
  // Keep the original order within each group, with completed to-dos last.
  const pickedTodos = picked
    .flatMap((id) => allTodos.find((todo) => todo.id === id) ?? [])
    .sort((a, b) => Number(doneTodos.includes(a.id)) - Number(doneTodos.includes(b.id)))
  const suggested = suggestions.items[status].filter(
    (item) => !picked.includes(item.id) && (!item.place || keptPlaces.includes(item.place)),
  )
  const stageMoment = todayCards[status].find((card) => card.tone === 'stage')
  // No key-moment card while Moving (Keller, Oct 21)
  const moment = status !== 'moving' && stageMoment && { ...stageMoment, onClick: stageMoment.to && (() => navigate(stageMoment.to!.screen)) }
  const sheetTodo = allTodos.find((todo) => todo.id === openTodo)
  const sheetDone = openTodo ? doneTodos.includes(openTodo) : false

  return (
    <MainLayout title={hello.title} subtitle={hello.subtitle} profile background="bg-baton-paper">
      {/* Tapping the circle always opens the camera inside it (Keller, Oct 21) */}
      <PromptWindow
        className="pb-8 pt-6"
        question={prompt.question}
        medium={medium}
        mediumLabel={promptMediumLabel[medium]}
        glass={promptGlass}
        tuning={glassTuning}
        moves={orbMoves}
        onClick={(circle) => setState({ camera: circle, composing: false })}
      />

      {/* Below the prompt, straight on the paper (Figma TODAY 334:10047): the
          setup row, then "Before you leave" */}
      <div className="flex flex-col gap-10 pt-4">
        {/* Her stage's key moment, right under the prompt, above every section (Keller, Oct 21) */}
        {moment && (
          <MomentCard
            stage={status}
            eyebrow={moment.eyebrow}
            title={moment.title}
            subtitle={moment.subtitle}
            photo={moment.photo}
            onClick={moment.onClick}
          />
        )}
        {status === 'moving' && setupCount < setupItems.length && (
          <section className="flex flex-col gap-4">
            <h2 className="text-section font-normal text-ink">{setup.header}</h2>
            {/* Runs to the screen edges so the next card peeks in */}
            <div className="-mx-gutter -my-3 flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter py-3 [scrollbar-width:none]">
              {setupItems.map((item) => (
                <SetupCard
                  key={item.id}
                  icon={item.icon}
                  tone={item.tone}
                  title={item.title}
                  subtitle={item.subtitle}
                  done={setupDone.includes(item.id)}
                  onClick={item.id === 'todos' ? () => navigate('setup-todos') : undefined}
                />
              ))}
            </div>
          </section>
        )}

        {/* The to-dos she picked; open one for tips from people who did it */}
        {pickedTodos.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-section font-normal text-ink">{beforeYouLeave.todosHeader[status]}</h2>
            <div ref={todoList} className="relative flex flex-col gap-3">
              {pickedTodos.map((item) => {
                const itemTips = tips[item.id] ?? []
                return (
                  <div key={item.id} data-todo-id={item.id} className="relative">
                    <TodoCard
                      kind={todoKind[item.id] ?? 'home'}
                      title={item.title}
                      subtitle={itemTips.length ? beforeYouLeave.tipCount(itemTips.length) : undefined}
                      tips={itemTips}
                      done={doneTodos.includes(item.id)}
                      onToggleDone={() => toggleTodo(item.id)}
                      copy={beforeYouLeave}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-section font-normal text-ink">{beforeYouLeave.header[status]}</h2>
          <div className="flex flex-col gap-3">
            {/* Cards for her stage, like the suggestions */}
            {status !== 'moving' &&
              todayCards[status].filter((card) => card.tone !== 'stage').map((card) => {
                const to = card.to
                const open = to && (() => navigate(to.screen))
                return <TodayCard key={card.id} title={card.title} subtitle={card.subtitle} photo={card.photo} onClick={open} />
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
              className="text-body font-medium text-brand active:opacity-50"
            >
              {sheetDone ? tipSheet.markUndone : tipSheet.markDone}
            </button>
          )
        }
      >
        {sheetTodo && (
          <div className="flex flex-col gap-4 pt-2">
            <h3 className="px-1 font-display text-title-2 font-medium text-ink">{sheetTodo.title}</h3>
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
