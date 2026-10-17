import { useEffect } from 'react'
import { navigate } from '../app/navigate'
import { splash } from '../data/onboarding'
import { Logo } from '../ui'

// "Welcome to Baton" after onboarding. Moves on to Today by itself, or on tap.
export function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => navigate('today'), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button
      type="button"
      onClick={() => navigate('today')}
      className="flex h-full w-full flex-col items-center justify-center gap-5 bg-canvas px-8 text-center"
    >
      <p className="text-title-3 font-semibold text-ink-muted">{splash.welcome}</p>
      <Logo />
      <p className="text-body text-ink-muted">{splash.tagline}</p>
    </button>
  )
}
