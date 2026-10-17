import type { ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { chloe } from '../data/people'
import { tabs } from '../data/pages'
import { Avatar, Screen, TabBar } from '../ui'

type MainLayoutProps = {
  title: string
  activeTab?: string
  onBack?: () => void
  children: ReactNode
}

// Shell for the main app pages: header with the profile avatar, bottom tab bar.
export function MainLayout({ title, activeTab, onBack, children }: MainLayoutProps) {
  const avatar = (
    <button type="button" onClick={() => navigate('profile')} aria-label="Profile">
      <Avatar name={chloe.name} />
    </button>
  )

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Screen title={title} onBack={onBack} action={onBack ? undefined : avatar}>
          {children}
        </Screen>
      </div>
      <TabBar tabs={tabs} active={activeTab} onSelect={navigate} onCapture={() => {}} />
    </div>
  )
}
