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

  // The page takes on the picked stage's theme
  return (
    <div data-stage={status ?? undefined} className="h-full">
      <OnboardingLayout
        background={status ? 'bg-stage-bg' : 'bg-canvas'}
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
        {/* What the picked stage means for her */}
        <p className="-mt-2 min-h-[2lh] px-6 text-center text-subhead text-ink-muted">
          {about.moveOptions.find((option) => option.id === status)?.detail ?? about.pickHint}
        </p>

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
    </div>
  )
}
