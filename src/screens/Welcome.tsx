import { navigate } from '../app/navigate'
import { welcome } from '../data/onboarding'
import { Button } from '../ui'

// First screen of onboarding: what Baton is, then sign up.
export function Welcome() {
  return (
    <div className="flex h-full flex-col bg-canvas px-6 pb-8 pt-24">
      <div className="flex flex-1 flex-col gap-4">
        <p className="font-display text-large-title font-bold text-ink">{welcome.name}</p>
        <p className="font-display text-title-2 font-semibold text-ink">{welcome.pitch}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button block onClick={() => navigate('photos')}>
          {welcome.apple}
        </Button>
        <Button block variant="secondary" onClick={() => navigate('photos')}>
          {welcome.email}
        </Button>
        <p className="px-4 pt-2 text-center text-footnote text-ink-muted">{welcome.terms}</p>
      </div>
    </div>
  )
}
