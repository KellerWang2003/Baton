import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { about } from '../data/onboarding'
import { Chip } from '../ui'
import { OnboardingStep } from '../ui/OnboardingStep'
import { StageCardDeck } from '../ui/StageCardDeck'

export function AboutYou() {
  const { status } = useStore()
  const selected = status ?? 'moving'

  return (
    <OnboardingStep title={about.title} body={about.body} onContinue={() => {
      setState({ status: selected })
      navigate(selected === 'moving' ? 'about-leave' : 'about-tags')
    }}>
      <StageCardDeck value={selected} onChange={(next) => setState({ status: next })} />
      <p className="onboarding-stage-detail" aria-live="polite">
        {about.moveOptions.find((option) => option.id === selected)?.detail}
      </p>
    </OnboardingStep>
  )
}

export function AboutYouTags() {
  const { tags, onboardingPhotoAccess } = useStore()

  return (
    <OnboardingStep title={about.title} className="onboarding-tags-step" continueDisabled={tags.length === 0} onContinue={() => navigate(onboardingPhotoAccess ? 'photos' : 'welcome')}>
      <div className="onboarding-tag-groups">
        {about.tagGroups.map((group) => (
          <fieldset key={group.title} className="onboarding-tag-group">
            <legend>{group.title}</legend>
            <div className="onboarding-tags">
              {group.tags.map((tag) => (
                <Chip key={tag} variant="onboarding" selected={tags.includes(tag)} onClick={() => setState((state) => ({ tags: toggleIn(state.tags, tag) }))}>
                  {tag}
                </Chip>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </OnboardingStep>
  )
}
