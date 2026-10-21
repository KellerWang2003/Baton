import { useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { auth } from '../data/onboarding'
import { ArrowRightIcon, Button } from '../ui'

// These entry points continue the prototype; no external authentication runs.
export function SignUp() {
  const [email, setEmail] = useState('')
  const emailInput = useRef<HTMLInputElement>(null)
  const next = () => navigate('about')

  return (
    <main className="onboarding-step account-page">
      <header className="account-header" style={{ paddingTop: 115 }}>
        <img src="/onboarding/account-mark.svg" width="79" height="79" alt="Baton" />
        <h1>{auth.title}</h1>
      </header>
      <section className="account-options" aria-label="Sign-in options">
        <form noValidate onSubmit={(event) => { event.preventDefault(); next() }}>
          <div className="account-email-field">
            <input
              ref={emailInput}
              type="email"
              name="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-label={auth.emailPlaceholder}
              placeholder={auth.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {email && (
              <button type="button" className="account-clear" aria-label="Clear email address" onClick={() => { setEmail(''); emailInput.current?.focus() }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="9" fill="currentColor" opacity="0.45" />
                  <path d="m6 6 6 6m0-6-6 6" stroke="var(--color-baton-paper)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <Button type="submit" block variant="glow" size="cta" className="mt-3">
            {auth.continue}
            <ArrowRightIcon />
          </Button>
        </form>
        <p className="account-divider">{auth.divider}</p>
        <div className="account-providers">
          <Button block variant="secondary" className="account-provider" onClick={next}>
            <img src="/onboarding/google-logo.png" width="22" height="22" alt="" />
            <span>{auth.google}</span>
          </Button>
          <Button block variant="secondary" className="account-provider" onClick={next}>
            <img src="/onboarding/apple-logo.svg" width="22" height="22" alt="" />
            <span>{auth.apple}</span>
          </Button>
        </div>
      </section>
    </main>
  )
}
