import { navigate } from '../app/navigate'
import { completeSetup, setState, toggleIn, useStatus, useStore } from '../app/store'
import { todoGroups, todos as copy } from '../data/onboarding'
import type { TodoGroup } from '../data/onboarding'
import { ArrowRightIcon, Button, PickCard, Screen, TodoKindIcon } from '../ui'

// Setup page opened from Today's "Pick your moving to-dos" card: the to-dos
// for leaving (Moving) or arriving (Newcomer), by category, in Today's card
// style: Home, Belongings, Accounts and Goodbyes when leaving. Tap to pick;
// "Add all" picks a whole category. The button at the bottom saves the picks,
// which then get their own "Moving to-dos" section on Today.
export function Todos() {
  const status = useStatus()
  const stage = status === 'newcomer' ? 'newcomer' : 'moving'
  const todos = useStore().todos ?? []
  const save = () => {
    completeSetup('todos')
    navigate('today')
  }

  return (
    <Screen
      onBack={() => navigate('today')}
      backLabel="Today"
      background="bg-baton-paper"
      footer={
        <Button block variant="glow" size="cta" disabled={todos.length === 0} onClick={save}>
          {copy.cta(todos.length)}
          <ArrowRightIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-10 px-3.5 pb-4 pt-2">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance font-display text-greeting font-normal text-ink">{copy.title[stage]}</h1>
          <p className="text-callout text-today-muted">{copy.body}</p>
        </header>

        {todoGroups[stage].map((group) => (
          <Category key={group.header} group={group} picked={todos} />
        ))}
      </div>
    </Screen>
  )
}

function Category({ group, picked }: { group: TodoGroup; picked: string[] }) {
  const ids = group.items.map((item) => item.id)
  const all = ids.every((id) => picked.includes(id))

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <TodoKindIcon kind={group.kind} size="lg" />
        <h2 className="flex-1 text-section font-normal text-ink">{group.header}</h2>
        <button
          type="button"
          onClick={() =>
            setState((s) => {
              const current = s.todos ?? []
              return { todos: all ? current.filter((id) => !ids.includes(id)) : [...current, ...ids.filter((id) => !current.includes(id))] }
            })
          }
          className="rounded-full px-1 text-subhead font-medium text-today-muted active:opacity-50"
        >
          {all ? copy.clear : copy.selectAll}
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {group.items.map((item) => (
          <PickCard
            key={item.id}
            title={item.title}
            detail={item.detail}
            picked={picked.includes(item.id)}
            onToggle={() => setState((s) => ({ todos: toggleIn(s.todos ?? [], item.id) }))}
          />
        ))}
      </div>
    </section>
  )
}
