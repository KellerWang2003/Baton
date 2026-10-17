import { navigate } from '../app/navigate'
import { completeSetup, setState, useStore } from '../app/store'
import { instagram } from '../data/onboarding'
import { chloe } from '../data/people'
import { Avatar, Button, Card, TextField } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

const firstName = chloe.name.split(' ')[0]

// Setup page opened from Today: a Baton tag for her Instagram bio, so friends
// can leave notes she opens after landing.
export function InstagramTag() {
  const { instagram: handle } = useStore()
  const done = () => {
    completeSetup('instagram')
    navigate('today')
  }

  return (
    <OnboardingLayout
      title={instagram.title}
      body={`${instagram.body} ${instagram.sealed}`}
      onBack={() => navigate('today')}
      backLabel="Today"
      footer={
        <Button block disabled={!handle.trim()} onClick={done}>
          {instagram.add}
        </Button>
      }
    >
      <TextField
        label={instagram.handleLabel}
        placeholder={instagram.handlePlaceholder}
        value={handle ? `@${handle}` : ''}
        onChange={(event) => setState({ instagram: event.target.value.replace(/^@+/, '').trim() })}
        autoCapitalize="none"
        autoCorrect="off"
      />

      <div className="flex flex-col gap-1.5">
        <h2 className="px-4 text-footnote uppercase text-ink-muted">{instagram.previewHeader}</h2>
        <Card className="flex items-center gap-3">
          <Avatar name={chloe.name} />
          <div className="min-w-0 flex-1">
            <p className="text-headline font-semibold text-ink">{instagram.previewTitle(firstName, chloe.from)}</p>
            <p className="truncate text-subhead text-ink-muted">{instagram.link(handle)}</p>
          </div>
        </Card>
      </div>
    </OnboardingLayout>
  )
}
