import type { ReactNode } from 'react'
import { Screen } from '../ui'

type OnboardingLayoutProps = {
  title: string
  body?: string
  action?: ReactNode
  footer: ReactNode
  children?: ReactNode
  background?: string
}

// Shared page for the setup pages opened from Today: the back button (up to
// Today), a wrapping title and intro, the content and pinned buttons at the bottom.
export function OnboardingLayout({ title, body, action, footer, children, background }: OnboardingLayoutProps) {
  return (
    <Screen onBack action={action} background={background} footer={<div className="flex flex-col gap-2">{footer}</div>}>
      <div className="flex flex-col gap-6 pt-1">
        <div className="flex flex-col gap-3 px-1">
          <h1 className="font-display text-large-title font-normal text-ink">{title}</h1>
          {body && <p className="text-body text-ink-muted">{body}</p>}
        </div>
        {children}
      </div>
    </Screen>
  )
}
