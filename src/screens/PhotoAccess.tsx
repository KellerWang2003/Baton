import { navigate } from '../app/navigate'
import { photos } from '../data/onboarding'
import { PhotosIcon } from '../ui'
import { OnboardingStep } from '../ui/OnboardingStep'

export function PhotoAccess() {
  const next = () => navigate('welcome')

  return (
    <OnboardingStep
      title={photos.title}
      body={photos.body}
      className="onboarding-photos"
      continueLabel={photos.allow}
      onContinue={next}
      footer={<button type="button" className="onboarding-text-action" onClick={next}>{photos.later}</button>}
    >
      <div className="onboarding-photo-stack" aria-hidden="true">
        <div className="onboarding-photo-back" />
        <div className="onboarding-photo-card"><PhotosIcon /></div>
      </div>
      <p className="onboarding-privacy">{photos.privacy}</p>
    </OnboardingStep>
  )
}
