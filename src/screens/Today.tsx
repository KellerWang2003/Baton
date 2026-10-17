import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { defaultTodos, todayTodos, todoGroups } from '../data/onboarding'
import { dailyPrompt, pages } from '../data/pages'
import { chloe } from '../data/people'
import { Button, CheckCircle, ListRow, ListSection, PromptCard } from '../ui'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

const allTodos = todoGroups.flatMap((group) => group.items)

export function Today() {
  const { todos, doneTodos } = useStore()
  const picked = allTodos.filter((item) => (todos ?? defaultTodos).includes(item.id))

  return (
    <MainLayout title={pages.today.title} activeTab="today">
      <div className="flex flex-col gap-6 pt-2">
        {/* The whole card opens Capture, like tapping a widget */}
        <div role="button" tabIndex={0} onClick={() => navigate('capture')} className="text-left active:opacity-80">
          <PromptCard meta={dailyPrompt.seed} question={dailyPrompt.question}>
            <p className="text-subhead text-ink-muted">{dailyPrompt.detail}</p>
            <Button variant="stage" size="sm" className="self-start">
              Answer
            </Button>
          </PromptCard>
        </div>

        {picked.length > 0 && (
          <ListSection header={todayTodos.header(chloe.leavingOn)} footer={todayTodos.footer}>
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
