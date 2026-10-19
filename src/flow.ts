import type { ComponentType } from 'react'
import { AboutYou, AboutYouTags } from './screens/AboutYou'
import { Archive } from './screens/Archive'
import { ArchiveDetail } from './screens/ArchiveDetail'
import { Capture } from './screens/Capture'
import { Community } from './screens/Community'
import { Features } from './screens/Features'
import { InstagramTag } from './screens/InstagramTag'
import { LaWrapped } from './screens/LaWrapped'
import { FriendNote } from './screens/FriendNote'
import { LeaveDate } from './screens/LeaveDate'
import { PhotoAccess } from './screens/PhotoAccess'
import { Places } from './screens/Places'
import { Profile } from './screens/Profile'
import { RelayDetail } from './screens/RelayDetail'
import { RollingPaper } from './screens/RollingPaper'
import { ArrivedSplash, LocalSplash } from './screens/StageSplash'
import { SignUp } from './screens/SignUp'
import { Splash } from './screens/Splash'
import { Today, TodayLastWeek } from './screens/Today'
import { Todos } from './screens/Todos'

export type Stage = 'moving' | 'newcomer' | 'local'

export type FlowScreen = {
  id: string
  title: string
  stage: Stage
  component: ComponentType
  // Tab this screen shows under, when it isn't a tab itself (a Today variant)
  tab?: string
}

// The hero flow, in order. Add screens here as they are built; the debug panel,
// arrow keys and URL hash all follow this list.
export const flow: FlowScreen[] = [
  // 1. Onboarding
  { id: 'features', title: 'Onboarding: feature overview', stage: 'moving', component: Features },
  { id: 'signup', title: 'Onboarding: sign up / log in', stage: 'moving', component: SignUp },
  { id: 'about', title: 'Onboarding: about you', stage: 'moving', component: AboutYou },
  { id: 'about-tags', title: 'Onboarding: about you tags', stage: 'moving', component: AboutYouTags },
  { id: 'photos', title: 'Onboarding: photo access', stage: 'moving', component: PhotoAccess },
  { id: 'welcome', title: 'Onboarding: welcome splash', stage: 'moving', component: Splash },
  // 2. Today, Moving, with the setup list (each item opens a setup page)
  { id: 'today', title: 'Today', stage: 'moving', component: Today },
  { id: 'setup-archive', title: 'Setup: organize archive', stage: 'moving', component: Places },
  { id: 'setup-todos', title: 'Setup: logistics to-dos', stage: 'moving', component: Todos },
  { id: 'setup-leave', title: 'Setup: leave date', stage: 'moving', component: LeaveDate },
  { id: 'setup-instagram', title: 'Setup: Instagram tag', stage: 'moving', component: InstagramTag },
  { id: 'archive', title: 'Archive', stage: 'moving', component: Archive },
  { id: 'archive-detail', title: 'Archive: city detail', stage: 'moving', component: ArchiveDetail },
  { id: 'community', title: 'Relay', stage: 'moving', component: Community },
  { id: 'capture', title: 'Capture (+)', stage: 'moving', component: Capture },
  { id: 'profile', title: 'Profile', stage: 'moving', component: Profile },
  // 5. Friend follows Chloe's Instagram link to the public note form.
  { id: 'friend-note', title: 'Friend: leave Chloe a note', stage: 'moving', component: FriendNote },
  // 6. Last week in LA: Today shows the legacy card
  { id: 'today-last-week', title: 'Today: last week in LA', stage: 'moving', component: TodayLastWeek, tab: 'today' },
  // 7. Landing: the congrats splash pops up as she becomes a Newcomer...
  { id: 'arrived', title: 'Stage change: welcome to New York', stage: 'newcomer', component: ArrivedSplash },
  // ...then the Rolling Paper of friends' notes prints out of the Dynamic Island
  { id: 'rolling-paper', title: 'Rolling Paper', stage: 'newcomer', component: RollingPaper },
  // ...and its button opens LA Wrapped (dots zoom open into the timeline)
  { id: 'la-wrapped', title: 'LA Wrapped', stage: 'newcomer', component: LaWrapped },
  // 9. Recommendation detail: a Relay pick or tip, with notes on it
  { id: 'relay-detail', title: 'Relay: recommendation detail', stage: 'newcomer', component: RelayDetail },
  // 10. Local: the congrats splash as she becomes a Local
  { id: 'local-splash', title: "Stage change: you're a Local", stage: 'local', component: LocalSplash },
]

export const stageLabels: Record<Stage, string> = {
  moving: 'Moving · LA',
  newcomer: 'Newcomer · New York',
  local: 'Local · New York',
}
