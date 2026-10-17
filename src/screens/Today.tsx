import { navigate } from '../app/navigate'
import { setState, toggleIn, useStatus, useStore } from '../app/store'
import type { SetupItem } from '../app/store'
import { setup, todayTodos, todoGroups } from '../data/onboarding'
import { dailyPrompt, pages } from '../data/pages'
import { chloe } from '../data/people'
import { Button, CheckCircle, ListRow, ListSection, PromptCard } from '../ui'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Today() {
  const { todos, doneTodos, setupDone } = useStore()
  const status = useStatus()

  // Setup list right after onboarding. Locals have no logistics to pick.
  const setupItems: { id: SetupItem; title: string; subtitle: string }[] = [
    { id: 'archive', ...setup.items.archive },
    ...(status === 'local' ? [] : [{ id: 'todos' as const, ...setup.items.todos[status] }]),
    { id: 'instagram', ...setup.items.instagram },
  ]
  const setupLeft = setupItems.some((item) => !setupDone.includes(item.id))

  const picked =
    status === 'local' ? [] : todoGroups[status].flatMap((group) => group.items).filter((item) => todos?.includes(item.id))

  return (
    <MainLayout title={pages.today.title} activeTab="today">
      <div className="flex flex-col gap-6 pt-2">
        {setupLeft && (
          <ListSection header={setup.header} footer={setup.footer}>
            {setupItems.map((item) => {
              const done = setupDone.includes(item.id)
              return (
                <ListRow
                  key={item.id}
                  title={item.title}
                  subtitle={done ? undefined : item.subtitle}
                  done={done}
                  leading={<CheckCircle checked={done} />}
                  chevron={!done}
                  onClick={done ? undefined : () => navigate(`setup-${item.id}`)}
                />
              )
            })}
          </ListSection>
        )}

        {/* The whole card opens the + field in the tab bar, like tapping a widget */}
        <div role="button" tabIndex={0} onClick={() => setState({ composing: true })} className="text-left active:opacity-80">
          <PromptCard meta={dailyPrompt.seed} question={dailyPrompt.question}>
            <p className="text-subhead text-ink-muted">{dailyPrompt.detail}</p>
            <Button variant="stage" size="sm" className="self-start">
              Answer
            </Button>
          </PromptCard>
        </div>

        {picked.length > 0 && (
          <ListSection header={todayTodos.header(status === 'local' ? 'newcomer' : status, chloe.leavingOn)} footer={todayTodos.footer}>
            {picked.map((item) => {
              const done = doneTodos.includes(item.id)
              return (
                <ListRow
                  key={item.id}
                  title={item.title}
                  done={done}
                  leading={<CheckCircle checked={done} />}
                  onClick={() => setState((s) => ({ doneTodos: toggleIn(s.doneTodos, item.id) }))}
                />
              )
            })}
          </ListSection>
        )}

        <PagePurpose>{pages.today.purpose}</PagePurpose>
      </div>
    </MainLayout>
  )
}
