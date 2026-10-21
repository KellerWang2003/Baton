import { goBack } from '../app/navigate'
import { completeSetup, setState, useStore } from '../app/store'
import { leave } from '../data/today'
import { ArrowRightIcon, Button, SegmentedControl, TextField } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Setup page opened from Today (or Profile): when she leaves LA, as her flight or just a
// date she imagines. Her last week before it brings the legacy card to Today.
export function LeaveDate() {
  const { leaveMode, flight, leaveDate } = useStore()
  const done = () => {
    setState({ expectedLeaveMonth: leaveDate.slice(0, 7) })
    completeSetup('leave')
    // Back where she opened it from, Today or Profile
    goBack()
  }

  return (
    <OnboardingLayout
      title={leave.title}
      body={leave.body}
      footer={
        <Button block variant="glow" size="cta" disabled={!leaveDate || (leaveMode === 'flight' && !flight.trim())} onClick={done}>
          {leave.save}
          <ArrowRightIcon />
        </Button>
      }
    >
      <SegmentedControl segments={leave.modes} value={leaveMode} onChange={(mode) => setState({ leaveMode: mode })} />

      {leaveMode === 'flight' && (
        <TextField
          label={leave.flightLabel}
          placeholder={leave.flightPlaceholder}
          hint={leave.flightHint}
          value={flight}
          onChange={(event) => setState({ flight: event.target.value.toUpperCase() })}
          autoCapitalize="characters"
          autoCorrect="off"
        />
      )}

      <TextField
        type="date"
        label={leave.dateLabel[leaveMode]}
        hint={leaveMode === 'date' ? leave.dateHint : undefined}
        value={leaveDate}
        onChange={(event) => setState({ leaveDate: event.target.value })}
      />
    </OnboardingLayout>
  )
}
