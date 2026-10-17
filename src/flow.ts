import type { ComponentType } from 'react'
import { AboutYou } from './screens/AboutYou'
import { Archive } from './screens/Archive'
import { Capture } from './screens/Capture'
import { Community } from './screens/Community'
import { Features } from './screens/Features'
import { InstagramTag } from './screens/InstagramTag'
import { PhotoAccess } from './screens/PhotoAccess'
import { Places } from './screens/Places'
import { Profile } from './screens/Profile'
import { SignUp } from './screens/SignUp'
import { Today } from './screens/Today'
import { Todos } from './screens/Todos'

export type Stage = 'moving' | 'newcomer' | 'local'

export type FlowScreen = {
  id: string
  title: string
  stage: Stage
  component: ComponentType
}

// The hero flow, in order. Add screens here as they are built; the debug panel,
// arrow keys and URL hash all follow this list.
export const flow: FlowScreen[] = [
  // 1. Onboarding
  { id: 'features', title: 'Onboarding: feature overview', stage: 'moving', component: Features },
  { id: 'signup', title: 'Onboarding: sign up / log in', stage: 'moving', component: SignUp },
  { id: 'about', title: 'Onboarding: about you', stage: 'moving', component: AboutYou },
  { id: 'photos', title: 'Onboarding: photo access', stage: 'moving', component: PhotoAccess },
  // 2. Today, Moving, with the setup list (each item opens a setup page)
  { id: 'today', title: 'Today', stage: 'moving', component: Today },
  { id: 'setup-archive', title: 'Setup: organize archive', stage: 'moving', component: Places },
  { id: 'setup-todos', title: 'Setup: logistics to-dos', stage: 'moving', component: Todos },
  { id: 'setup-instagram', title: 'Setup: Instagram tag', stage: 'moving', component: InstagramTag },
  { id: 'archive', title: 'Archive', stage: 'moving', component: Archive },
  { id: 'community', title: 'Community', stage: 'moving', component: Community },
  { id: 'capture', title: 'Capture (+)', stage: 'moving', component: Capture },
  { id: 'profile', title: 'Profile', stage: 'moving', component: Profile },
]

export const stageLabels: Record<Stage, string> = {
  moving: 'Moving · LA',
  newcomer: 'Newcomer · New York',
  local: 'Local · New York',
}
