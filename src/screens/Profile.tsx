import { goBack, navigate } from '../app/navigate'
import { useStatus, useStore } from '../app/store'
import { chloeGoals, intentions } from '../data/intentions'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { profileRows, stageCity, stageNames, stageTags } from '../data/stages'
import { Avatar, ListRow, ListSection, Screen, StageTag } from '../ui'

// Pushed page (no tab bar), opened from the avatar on the tab pages.
export function Profile() {
  const status = useStatus()
  const rows = profileRows[status]
  // Her picks; once she's in New York the demo shows the three she set in LA
  const picked = useStore().goals
  const goals = picked.length ? picked : status === 'moving' ? [] : chloeGoals

  return (
    <Screen title={pages.profile.title} onBack={() => goBack()}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar name={chloe.name} src={chloe.avatar} size="lg" />
            <StageTag stage={status} label={stageTags[status]} size="md" className="absolute -bottom-2.5 left-1/2 -translate-x-1/2" />
          </div>
          <p className="text-title-3 font-medium text-ink">{chloe.name}</p>
        </div>
        <ListSection footer={pages.profile.purpose}>
          <ListRow title="Status" value={stageNames[status]} chevron />
          <ListRow title="City" value={stageCity[status]} chevron />
          <ListRow title="Lifestyle" value={rows.lifestyle} chevron />
          <ListRow
            title={intentions.row}
            subtitle={goals.length ? goals.join(' · ') : intentions.rowEmpty}
            chevron
            onClick={() => navigate('intentions')}
          />
        </ListSection>
        <ListSection>
          <ListRow title={pages.profile.wrappedRow} subtitle={pages.profile.wrappedDetail} chevron onClick={() => navigate('la-wrapped')} />
          <ListRow title={pages.profile.paperRow} subtitle={pages.profile.paperDetail} chevron onClick={() => navigate('rolling-paper')} />
        </ListSection>
      </div>
    </Screen>
  )
}
