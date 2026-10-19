import { goBack, navigate } from '../app/navigate'
import { useStatus } from '../app/store'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { profileRows, stageCity, stageNames } from '../data/stages'
import { Avatar, ListRow, ListSection, Screen } from '../ui'

// Pushed page (no tab bar), opened from the avatar on the tab pages.
export function Profile() {
  const status = useStatus()
  const rows = profileRows[status]

  return (
    <Screen title={pages.profile.title} onBack={() => goBack()}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col items-center gap-2">
          <Avatar name={chloe.name} size="lg" />
          <p className="text-title-3 font-semibold text-ink">{chloe.name}</p>
        </div>
        <ListSection footer={pages.profile.purpose}>
          <ListRow title="Status" value={stageNames[status]} chevron />
          <ListRow title="City" value={stageCity[status]} chevron />
          <ListRow title="Lifestyle" value={rows.lifestyle} chevron />
          {rows.intention && <ListRow title="Intention" subtitle={rows.intention} chevron />}
        </ListSection>
        <ListSection>
          <ListRow title={pages.profile.wrappedRow} subtitle={pages.profile.wrappedDetail} chevron onClick={() => navigate('la-wrapped')} />
          <ListRow title={pages.profile.paperRow} subtitle={pages.profile.paperDetail} chevron onClick={() => navigate('rolling-paper')} />
        </ListSection>
      </div>
    </Screen>
  )
}
