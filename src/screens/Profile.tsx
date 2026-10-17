import { goBack } from '../app/navigate'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { Avatar, ListRow, ListSection, Screen } from '../ui'
import { stageLabels } from '../flow'

// Pushed page (no tab bar), opened from the avatar on the tab pages.
export function Profile() {
  return (
    <Screen title={pages.profile.title} onBack={() => goBack()}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col items-center gap-2">
          <Avatar name={chloe.name} size="lg" />
          <p className="text-title-3 font-semibold text-ink">{chloe.name}</p>
        </div>
        <ListSection footer={pages.profile.purpose}>
          <ListRow title="Status" value={stageLabels.moving.split(' · ')[0]} chevron />
          <ListRow title="City" value={chloe.from} chevron />
          <ListRow title="Lifestyle" chevron />
        </ListSection>
      </div>
    </Screen>
  )
}
