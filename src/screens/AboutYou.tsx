import type { ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { about } from '../data/onboarding'
import { chloe } from '../data/people'
import type { Stage } from '../flow'
import { Button, Chip, ListRow, ListSection } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Tell us about yourself: where you are in your move (sets the status, which
// decides the features you see) plus a few tags. Chloe: Moving soon, Student,
// International.
export function AboutYou() {
  const { status, tags } = useStore()

  return (
    <OnboardingLayout
      title={about.title}
      body={about.body}
      footer={
        <Button block disabled={!status} onClick={() => navigate('photos')}>
          Continue
        </Button>
      }
    >
      <TagGroup header={about.moveHeader}>
        {about.moveOptions.map((option) => (
          <Chip key={option.id} selected={status === option.id} onClick={() => setState({ status: option.id as Stage })}>
            {option.label}
          </Chip>
        ))}
      </TagGroup>

      {status === 'moving' && (
        <ListSection header={about.detailsHeader}>
          <ListRow title={about.leaving} value={chloe.from} chevron />
          <ListRow title={about.movingTo} value={chloe.to} chevron />
          <ListRow title={about.date} value={chloe.leavingOn} chevron />
        </ListSection>
      )}

      <TagGroup header={about.youHeader}>
        {about.tags.map((tag) => (
          <Chip key={tag} selected={tags.includes(tag)} onClick={() => setState((s) => ({ tags: toggleIn(s.tags, tag) }))}>
            {tag}
          </Chip>
        ))}
      </TagGroup>
    </OnboardingLayout>
  )
}

function TagGroup({ header, children }: { header: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-headline font-semibold text-ink">{header}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}
