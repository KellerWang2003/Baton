import { navigate } from '../app/navigate'
import { completeSetup, setState, useStore } from '../app/store'
import { leave } from '../data/today'
import { Button, SegmentedControl, TextField } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Setup page opened from Today: when she leaves LA, as her flight or just a
// date she imagines. Her last week before it brings the legacy card to Today.
export function LeaveDate() {
  const { leaveMode, flight, leaveDate } = useStore()
  const done = () => {
    completeSetup('leave')
    navigate('today')
  }

  return (
    <OnboardingLayout
      title={leave.title}
      body={leave.body}
      onBack={() => navigate('today')}
      backLabel="Today"
      footer={
        <Button block disabled={!leaveDate || (leaveMode === 'flight' && !flight.trim())} onClick={done}>
          {leave.save}
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
