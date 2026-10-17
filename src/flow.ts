import type { ComponentType } from 'react'
import { Archive } from './screens/Archive'
import { Community } from './screens/Community'
import { Profile } from './screens/Profile'
import { Today } from './screens/Today'

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
  { id: 'today', title: 'Today', stage: 'moving', component: Today },
  { id: 'archive', title: 'Archive', stage: 'moving', component: Archive },
  { id: 'community', title: 'Community', stage: 'moving', component: Community },
  { id: 'profile', title: 'Profile', stage: 'moving', component: Profile },
]

export const stageLabels: Record<Stage, string> = {
  moving: 'Moving · LA',
  newcomer: 'Newcomer · New York',
  local: 'Local · New York',
}
