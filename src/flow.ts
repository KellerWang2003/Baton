import type { ComponentType } from 'react'
import { AboutYou } from './screens/AboutYou'
import { Archive } from './screens/Archive'
import { ArchiveDetail } from './screens/ArchiveDetail'
import { Capture } from './screens/Capture'
import { Community } from './screens/Community'
import { Features } from './screens/Features'
import { InstagramTag } from './screens/InstagramTag'
import { LeaveDate } from './screens/LeaveDate'
import { PhotoAccess } from './screens/PhotoAccess'
import { Places } from './screens/Places'
import { Profile } from './screens/Profile'
import { RelayDetail } from './screens/RelayDetail'
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
  // 6. Last week in LA: Today shows the legacy card
  { id: 'today-last-week', title: 'Today: last week in LA', stage: 'moving', component: TodayLastWeek, tab: 'today' },
  // 9. Recommendation detail: a Relay pick or tip, with notes on it
  { id: 'relay-detail', title: 'Relay: recommendation detail', stage: 'newcomer', component: RelayDetail },
]

export const stageLabels: Record<Stage, string> = {
  moving: 'Moving · LA',
  newcomer: 'Newcomer · New York',
  local: 'Local · New York',
}
