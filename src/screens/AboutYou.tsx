import type { ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { about } from '../data/onboarding'
import type { Stage } from '../flow'
import { ArrivalGraphic, BoxesGraphic, Button, CardFan, Chip, HomeGraphic } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

const graphics: Record<Stage, ReactNode> = {
  moving: <BoxesGraphic />,
  newcomer: <ArrivalGraphic />,
  local: <HomeGraphic />,
}

// Tell us about yourself: three tilted cards for where you are in your move
// (sets the status, which decides the features you see), then smaller tags.
// Chloe: Moving soon, Student, International.
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
      <CardFan
        options={about.moveOptions.map((option) => ({ ...option, graphic: graphics[option.id] }))}
        value={status}
        onChange={(id) => setState({ status: id })}
      />

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-headline font-semibold text-ink">{about.youHeader}</h2>
        <div className="flex flex-wrap gap-2">
          {about.tags.map((tag) => (
            <Chip key={tag} selected={tags.includes(tag)} onClick={() => setState((s) => ({ tags: toggleIn(s.tags, tag) }))}>
              {tag}
            </Chip>
          ))}
        </div>
      </section>
    </OnboardingLayout>
  )
}
