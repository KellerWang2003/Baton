import { navigate } from '../app/navigate'
import { completeSetup, setState, toggleIn, useStore } from '../app/store'
import { foundPlaces, organize } from '../data/onboarding'
import { ArrowRightIcon, Button, Card, CheckCircle, ListRow, ListSection, MapPinIcon } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Setup page opened from Today: see what was imported from her photos and
// remove what isn't right. The kept places become the private list to reflect on.
export function Places() {
  const { keptPlaces } = useStore()
  const done = () => {
    completeSetup('archive')
    navigate('today')
  }

  return (
    <OnboardingLayout
      title={organize.title}
      body={organize.body}
      footer={
        <Button block variant="glow" size="cta" disabled={keptPlaces.length === 0} onClick={done}>
          {organize.done(keptPlaces.length)}
          <ArrowRightIcon />
        </Button>
      }
    >
      <Card className="grid grid-cols-3 divide-x divide-line/70 py-3 text-center">
        {organize.stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-title-2 font-medium text-ink">{stat.value}</p>
            <p className="text-footnote text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </Card>

      <ListSection header={organize.header} footer={organize.footer}>
        {foundPlaces.map((place) => (
          <ListRow
            key={place.id}
            title={place.name}
            subtitle={`${place.area} · ${organize.photosLabel(place.photos)}`}
            leading={
              <span className="flex items-center gap-3">
                <CheckCircle checked={keptPlaces.includes(place.id)} />
                <span className="inline-flex size-9 items-center justify-center rounded-tile bg-surface-muted text-ink-muted">
                  <MapPinIcon />
                </span>
              </span>
            }
            onClick={() => setState((s) => ({ keptPlaces: toggleIn(s.keptPlaces, place.id) }))}
          />
        ))}
      </ListSection>
    </OnboardingLayout>
  )
}
