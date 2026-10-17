import { navigate } from '../app/navigate'
import { photos } from '../data/onboarding'
import { Button, Card, PhotosIcon } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Last onboarding step: photo access. The places found seed the private
// archive, which she organizes later from the setup list on Today.
export function PhotoAccess() {
  return (
    <OnboardingLayout
      title={photos.title}
      body={photos.body}
      footer={
        <>
          <Button block onClick={() => navigate('today')}>
            {photos.allow}
          </Button>
          <Button block variant="ghost" onClick={() => navigate('today')}>
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
