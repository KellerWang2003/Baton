import { useEffect, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { foundPlaces, places } from '../data/onboarding'
import { Button, CheckCircle, ListRow, ListSection, MapPinIcon } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Places found in her photos, most-visited first. She keeps or removes each;
// the kept ones become the private list of places to reflect on later.
export function Places() {
  const { keptPlaces } = useStore()
  const [scanning, setScanning] = useState(true)

  // A short pretend scan so the import reads as real on video.
  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  if (scanning) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-canvas px-8 text-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-line border-t-ink" />
        <p className="text-headline font-semibold text-ink">{places.scanning}</p>
        <p className="text-subhead text-ink-muted">{places.scanningDetail}</p>
      </div>
    )
  }

  return (
    <OnboardingLayout
      step="places"
      title={places.title}
      body={places.body}
      footer={
        <Button block disabled={keptPlaces.length === 0} onClick={() => navigate('status')}>
          {places.cta(keptPlaces.length)}
        </Button>
      }
    >
      <ListSection footer={places.footer}>
        {foundPlaces.map((place) => {
          const kept = keptPlaces.includes(place.id)
          return (
            <ListRow
              key={place.id}
              title={place.name}
              subtitle={`${place.area} · ${places.photosLabel(place.photos)}`}
              leading={
                <span className="flex items-center gap-3">
                  <CheckCircle checked={kept} />
                  <span className="inline-flex size-9 items-center justify-center rounded-[8px] bg-surface-muted text-ink-muted">
                    <MapPinIcon />
                  </span>
                </span>
              }
              onClick={() => setState((s) => ({ keptPlaces: toggleIn(s.keptPlaces, place.id) }))}
            />
          )
        })}
      </ListSection>
    </OnboardingLayout>
  )
}
