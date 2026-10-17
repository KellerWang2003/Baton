import { navigate } from '../app/navigate'
import { setState, useStore } from '../app/store'
import { status } from '../data/onboarding'
import { chloe } from '../data/people'
import type { Stage } from '../flow'
import { Button, ChoiceCard, ListRow, ListSection } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Set status. Each status unlocks different features; Chloe picks Moving.
export function Status() {
  const { status: current } = useStore()

  return (
    <OnboardingLayout
      step="status"
      title={status.title}
      body={status.body}
      footer={
        <Button block disabled={!current} onClick={() => navigate('todos')}>
          Continue
        </Button>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-3">
        {status.options.map((option) => (
          <ChoiceCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            selected={current === option.id}
            onSelect={() => setState({ status: option.id as Stage })}
          />
        ))}
      </div>

      {current === 'moving' && (
        <ListSection header={status.detailsHeader}>
          <ListRow title={status.leaving} value={chloe.from} chevron />
          <ListRow title={status.movingTo} value={chloe.to} chevron />
          <ListRow title={status.date} value={chloe.leavingOn} chevron />
        </ListSection>
      )}
    </OnboardingLayout>
  )
}
