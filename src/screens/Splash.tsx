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
        {splash.video ? (
          <video className="onboarding-welcome-video" src={splash.video} poster={splash.poster} autoPlay muted playsInline aria-hidden />
        ) : (
          <img className="onboarding-welcome-video" src={splash.poster} alt="" />
        )}
        <h1 className="onboarding-welcome-title">{splash.welcome}</h1>
      </div>
    </button>
  )
}
