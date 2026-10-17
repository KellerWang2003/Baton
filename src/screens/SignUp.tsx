import { navigate } from '../app/navigate'
import { auth } from '../data/onboarding'
import { Button, Screen } from '../ui'

// Sign up or log in. No back button: the feature overview is behind you.
// Every option continues to the next step in the prototype.
export function SignUp() {
  const next = () => navigate('about')

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-2">
          <Button block onClick={next}>
            {auth.apple}
          </Button>
          <Button block variant="secondary" onClick={next}>
            {auth.email}
          </Button>
          <p className="pt-2 text-center text-subhead text-ink-muted">
            {auth.login}{' '}
            <button type="button" onClick={next} className="font-semibold text-brand active:opacity-50">
              {auth.loginAction}
            </button>
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-3 px-1 pt-14">
        <h1 className="font-display text-title-1 font-bold text-ink">{auth.title}</h1>
        <p className="text-body text-ink-muted">{auth.body}</p>
      </div>
    </Screen>
  )
}
