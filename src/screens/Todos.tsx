import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { todoGroups, todos as copy } from '../data/onboarding'
import { chloe } from '../data/people'
import { Button, CheckCircle, ListRow, ListSection } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

const cityShort: Record<string, string> = { 'Los Angeles': 'LA' }

// Pick the logistics to-dos for the move. The picks show on Today.
export function Todos() {
  const todos = useStore().todos ?? []

  return (
    <OnboardingLayout
      step="todos"
      title={copy.title(cityShort[chloe.from] ?? chloe.from)}
      body={copy.body}
      footer={
        <Button block disabled={todos.length === 0} onClick={() => navigate('instagram')}>
          {copy.cta(todos.length)}
        </Button>
      }
    >
      {todoGroups.map((group) => (
        <ListSection key={group.header} header={group.header}>
          {group.items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              leading={<CheckCircle checked={todos.includes(item.id)} />}
              onClick={() => setState({ todos: toggleIn(todos, item.id) })}
            />
          ))}
        </ListSection>
      ))}
    </OnboardingLayout>
  )
}
