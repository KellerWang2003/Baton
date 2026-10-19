import { navigate } from '../app/navigate'
import { setState, useStore } from '../app/store'
import { departure } from '../data/onboarding'
import { DepartureMonthPicker } from '../ui/DepartureMonthPicker'
import { OnboardingStep } from '../ui/OnboardingStep'

export function ExpectedDeparture() {
  const { expectedLeaveMonth } = useStore()

  return (
    <OnboardingStep title={departure.title} body={departure.body} className="onboarding-departure" continueDisabled={!expectedLeaveMonth} onContinue={() => {
      navigate('about-tags')
    }}>
      <section className="departure-selection" aria-label={departure.label}>
        <DepartureMonthPicker value={expectedLeaveMonth} onChange={(month) => setState({ expectedLeaveMonth: month, leaveDate: '', leaveMode: 'date' })} />
        <p className="departure-selected" aria-live="polite">
          {expectedLeaveMonth && new Date(`${expectedLeaveMonth}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </section>
    </OnboardingStep>
  )
}
