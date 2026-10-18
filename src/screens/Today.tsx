import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { openComposer } from '../app/composer'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useDailyPrompt, useStatus, useStore } from '../app/store'
import type { SetupItem } from '../app/store'
import { setup } from '../data/onboarding'
import { pages, promptActions } from '../data/pages'
import {
  allTodos,
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
  todoList,
} from '../data/today'
import {
  AtIcon,
  BottomSheet,
  Button,
  Card,
  CardRow,
  CheckCircle,
  ListIcon,
  ListRow,
  ListSection,
  PlaneIcon,
  PromptCard,
  SetupCard,
  StackIcon,
} from '../ui'
import { MainLayout } from './MainLayout'

type TodayProps = {
  // Prototype: jump ahead to her last week in LA so the legacy card shows
  lastWeek?: boolean
}

// Today, top to bottom: the setup cards (until done), the legacy card in her
// last week in LA, the daily prompt, suggested to-dos for her stage, and her
// to-dos with tips at the very end.
export function Today({ lastWeek = false }: TodayProps) {
  const { todos, doneTodos, setupDone, keptPlaces, promptSkipped, ...store } = useStore()
  const leaveDate = store.leaveDate || leave.defaultDate
  const status = useStatus()
  const prompt = useDailyPrompt()
  const [openTodo, setOpenTodo] = useState<string | null>(null)

  const daysLeft = daysUntil(lastWeek ? mockToday.lastWeek : mockToday.normal, leaveDate)
  const leaving = shortDate(leaveDate)

  // Setup cards. Locals have no logistics to pick; only Moving has a leave date.
  const setupItems: { id: SetupItem; title: string; subtitle: string; icon: ReactNode }[] = [
    { id: 'archive', ...setup.items.archive, icon: <StackIcon /> },
    ...(status === 'local' ? [] : [{ id: 'todos' as const, ...setup.items.todos[status], icon: <ListIcon /> }]),
    ...(status === 'moving'
      ? [
          {
            id: 'leave' as const,
            title: setupCards.leave.title,
            subtitle: setupDone.includes('leave') ? setupCards.leave.done(leaving) : setupCards.leave.subtitle,
            icon: <PlaneIcon />,
          },
        ]
      : []),
    { id: 'instagram', ...setup.items.instagram, icon: <AtIcon /> },
  ]
  const setupCount = setupItems.filter((item) => setupDone.includes(item.id)).length

  const picked = todos ?? []
  const pickedTodos = picked.flatMap((id) => allTodos.find((todo) => todo.id === id) ?? [])
  const suggested = suggestions.items[status].filter(
    (item) => !picked.includes(item.id) && (!item.place || keptPlaces.includes(item.place)),
  )
  const sheetTodo = allTodos.find((todo) => todo.id === openTodo)
  const sheetDone = openTodo ? doneTodos.includes(openTodo) : false

  const anotherPrompt = (event: MouseEvent) => {
    event.stopPropagation()
    setState((s) => ({ promptIndex: s.promptIndex + 1 }))
  }
  const skipPrompt = (event: MouseEvent) => {
    event.stopPropagation()
    setState({ promptSkipped: true })
  }

  return (
    <MainLayout title={pages.today.title}>
      <div className="flex flex-col gap-6 pt-2">
        {setupCount < setupItems.length && (
          <CardRow header={setup.header} detail={setupCards.progress(setupCount, setupItems.length)}>
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

        {status === 'moving' && daysLeft <= lastWeekDays && (
          <Card tone="stage" className="flex flex-col gap-3">
            <p className="text-footnote font-semibold uppercase text-stage">{legacyCard.eyebrow(daysLeft)}</p>
            <p className="font-display text-title-3 font-semibold text-ink">{legacyCard.title}</p>
            <p className="text-subhead text-ink-muted">{legacyCard.body}</p>
            <Button
              variant="stage"
              size="sm"
              className="self-start"
              onClick={() => {
                setState({ archiveSegment: 'legacy' })
                navigate('archive')
              }}
            >
              {legacyCard.cta}
            </Button>
          </Card>
        )}

        {promptSkipped ? (
          <p className="px-4 text-subhead text-ink-muted">{promptActions.skipped}</p>
        ) : (
          // The whole card opens the + field in the tab bar, like tapping a widget
          <div role="button" tabIndex={0} onClick={openComposer} className="text-left active:opacity-80">
            <PromptCard meta={prompt.seed} question={prompt.question}>
              <p className="text-subhead text-ink-muted">{prompt.detail}</p>
              <div className="flex items-center gap-1">
                <Button variant="stage" size="sm">
                  {promptActions.answer}
                </Button>
                <Button variant="ghost" size="sm" onClick={anotherPrompt}>
                  {promptActions.another}
                </Button>
                <Button variant="ghost" size="sm" onClick={skipPrompt}>
                  {promptActions.skip}
                </Button>
              </div>
            </PromptCard>
          </div>
        )}

        {suggested.length > 0 && (
          <ListSection header={suggestions.header[status]} footer={suggestions.footer}>
            {suggested.map((item) => (
              <ListRow
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                trailing={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setState((s) => ({ todos: [...(s.todos ?? []), item.id] }))}
                  >
                    Add
                  </Button>
                }
              />
            ))}
          </ListSection>
        )}

        {pickedTodos.length > 0 && (
          <ListSection header={todoList.header(status === 'moving' ? 'moving' : 'newcomer', leaving)} footer={todoList.footer}>
            {pickedTodos.map((item) => {
              const count = tips[item.id]?.length ?? 0
              return (
                <ListRow
                  key={item.id}
                  title={item.title}
                  done={doneTodos.includes(item.id)}
                  leading={<CheckCircle checked={doneTodos.includes(item.id)} />}
                  value={count ? `${count} ${count === 1 ? 'tip' : 'tips'}` : undefined}
                  chevron
                  onClick={() => setOpenTodo(item.id)}
                />
              )
            })}
          </ListSection>
        )}
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
