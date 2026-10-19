import type { ReactNode } from 'react'
import { Button } from './Button'
import { ArrowRightIcon } from './icons'

// The two About You steps share the exact type and pinned action from Figma.
export function OnboardingStep({ title, body, children, onContinue, continueLabel = 'Continue', footer, className = '' }: {
  title: string
  body?: string
  children: ReactNode
  onContinue: () => void
  continueLabel?: string
  footer?: ReactNode
  className?: string
}) {
  return (
    <div className={`onboarding-step ${className}`}>
      <main className="onboarding-content">
        <header className="onboarding-heading">
          <h1>{title}</h1>
          {body && <p>{body}</p>}
        </header>
        {children}
      </main>
      <footer className="onboarding-footer">
        <Button block variant="glow" size="cta" onClick={onContinue}>
          <span>{continueLabel}</span>
          <ArrowRightIcon />
        </Button>
        {footer}
      </footer>
    </div>
  )
}
