import type { ComponentType } from 'react'
import { Archive } from './screens/Archive'
import { Capture } from './screens/Capture'
import { Community } from './screens/Community'
import { InstagramTag } from './screens/InstagramTag'
import { PhotoAccess } from './screens/PhotoAccess'
import { Places } from './screens/Places'
import { Profile } from './screens/Profile'
import { Status } from './screens/Status'
import { Today } from './screens/Today'
import { Todos } from './screens/Todos'
import { Welcome } from './screens/Welcome'

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
  { id: 'welcome', title: 'Onboarding: sign up', stage: 'moving', component: Welcome },
  { id: 'photos', title: 'Onboarding: photo access', stage: 'moving', component: PhotoAccess },
  { id: 'places', title: 'Onboarding: your places', stage: 'moving', component: Places },
  { id: 'status', title: 'Onboarding: status', stage: 'moving', component: Status },
  { id: 'todos', title: 'Onboarding: to-dos', stage: 'moving', component: Todos },
  { id: 'instagram', title: 'Onboarding: Instagram tag', stage: 'moving', component: InstagramTag },
  // 2. Today, Moving
  { id: 'today', title: 'Today', stage: 'moving', component: Today },
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
