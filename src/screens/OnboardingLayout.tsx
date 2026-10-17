import type { ReactNode } from 'react'
import { goBack } from '../app/navigate'
import { Screen, Steps } from '../ui'

// Steps after the welcome screen, for the page dots.
const onboardingSteps = ['photos', 'places', 'status', 'todos', 'instagram'] as const

type OnboardingLayoutProps = {
  step: (typeof onboardingSteps)[number]
  title: string
  body?: string
  action?: ReactNode
  footer: ReactNode
  children?: ReactNode
}

// Shared page for the onboarding steps: back button, page dots, a wrapping
// title and intro, the step's content and pinned buttons at the bottom.
export function OnboardingLayout({ step, title, body, action, footer, children }: OnboardingLayoutProps) {
  return (
    <Screen onBack={() => goBack('welcome')} action={action} footer={<div className="flex flex-col gap-2">{footer}</div>}>
      <div className="flex flex-col gap-6 pt-1">
        <div className="flex flex-col gap-3 px-1">
          <Steps count={onboardingSteps.length} current={onboardingSteps.indexOf(step)} />
          <h1 className="font-display text-title-1 font-bold text-ink">{title}</h1>
          {body && <p className="text-body text-ink-muted">{body}</p>}
        </div>
        {children}
      </div>
    </Screen>
  )
}
