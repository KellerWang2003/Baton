import { navigate } from '../app/navigate'
import { photos } from '../data/onboarding'
import { Button, Card, PhotosIcon } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Ask for photo and location access. The places found seed the private archive.
export function PhotoAccess() {
  return (
    <OnboardingLayout
      step="photos"
      title={photos.title}
      body={photos.body}
      footer={
        <>
          <Button block onClick={() => navigate('places')}>
            {photos.allow}
          </Button>
          <Button block variant="ghost" onClick={() => navigate('status')}>
            {photos.later}
          </Button>
        </>
      }
    >
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-ink">
          <PhotosIcon />
        </span>
        <p className="px-4 text-subhead text-ink-muted">{photos.privacy}</p>
      </Card>
    </OnboardingLayout>
  )
}
