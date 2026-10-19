import { navigate } from '../app/navigate'
import { setState, toggleIn, useStore } from '../app/store'
import { about } from '../data/onboarding'
import { Chip } from '../ui'
import { OnboardingStep } from '../ui/OnboardingStep'
import { StageCardDeck } from '../ui/StageCardDeck'

export function AboutYou() {
  const { status } = useStore()

  // Continue waits for a pick; until then the deck rests on Moving soon with nothing chosen.
  return (
    <OnboardingStep title={about.title} body={about.body} continueDisabled={!status} onContinue={() => navigate('about-tags')}>
      <StageCardDeck value={status} onChange={(next) => setState({ status: next })} />
      <p className="onboarding-stage-detail" aria-live="polite">
        {about.moveOptions.find((option) => option.id === status)?.detail}
      </p>
    </OnboardingStep>
  )
}

export function AboutYouTags() {
  const { tags } = useStore()

  return (
    <OnboardingStep title={about.title} className="onboarding-tags-step" onContinue={() => navigate('photos')}>
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
