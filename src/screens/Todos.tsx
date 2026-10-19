import { navigate } from '../app/navigate'
import { completeSetup, setState, toggleIn, useStatus, useStore } from '../app/store'
import { todoGroups, todos as copy } from '../data/onboarding'
import { ArrowRightIcon, Button, CheckCircle, ListRow, ListSection } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Setup page opened from Today: pick logistics to-dos for leaving (Moving) or
// arriving (Newcomer). The picks show on Today.
export function Todos() {
  const status = useStatus()
  const stage = status === 'newcomer' ? 'newcomer' : 'moving'
  const todos = useStore().todos ?? []
  const done = () => {
    completeSetup('todos')
    navigate('today')
  }

  return (
    <OnboardingLayout
      title={copy.title[stage]}
      body={copy.body}
      onBack={() => navigate('today')}
      backLabel="Today"
      footer={
        <Button block variant="glow" size="cta" disabled={todos.length === 0} onClick={done}>
          {copy.cta(todos.length)}
          <ArrowRightIcon />
        </Button>
      }
    >
      {todoGroups[stage].map((group) => (
        <ListSection key={group.header} header={group.header}>
          {group.items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              leading={<CheckCircle checked={todos.includes(item.id)} />}
              onClick={() => setState((s) => ({ todos: toggleIn(s.todos ?? [], item.id) }))}
            />
          ))}
        </ListSection>
      ))}
    </OnboardingLayout>
  )
}
