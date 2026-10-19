import type { ReactNode } from 'react'
import { Button } from './Button'

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
        <Button block variant="onboarding" onClick={onContinue}>
          <span>{continueLabel}</span>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        {footer}
      </footer>
    </div>
  )
}
