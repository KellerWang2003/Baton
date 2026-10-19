import { useEffect } from 'react'
import { navigate } from '../app/navigate'
import { splash } from '../data/onboarding'

export function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => navigate('today'), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button type="button" onClick={() => navigate('today')} className="onboarding-step onboarding-welcome" aria-label="Welcome to Baton. Continue to Today">
      <div className="onboarding-welcome-content">
        <img src="/onboarding/welcome-baton.svg" alt="" />
        <h1 className="onboarding-welcome-title">{splash.welcome}</h1>
      </div>
    </button>
  )
}
