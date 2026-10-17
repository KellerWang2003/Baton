import type { ReactNode } from 'react'
import { navigate } from '../app/navigate'
import { chloe } from '../data/people'
import { tabs } from '../data/pages'
import { ArchiveIcon, Avatar, CommunityIcon, Screen, TabBar, TodayIcon } from '../ui'

type MainLayoutProps = {
  title: string
  activeTab: string
  children: ReactNode
}

const tabIcons: Record<string, ReactNode> = {
  today: <TodayIcon />,
  archive: <ArchiveIcon />,
  community: <CommunityIcon />,
}

// Shell for the three tab pages: large title with the profile avatar, and the
// floating tab bar over the bottom of the page. Pushed pages (Profile, Capture)
// use Screen directly, without the tab bar.
export function MainLayout({ title, activeTab, children }: MainLayoutProps) {
  const avatar = (
    <button type="button" onClick={() => navigate('profile')} aria-label="Profile">
      <Avatar name={chloe.name} size="sm" />
    </button>
  )

  return (
    <div className="relative h-full">
      <Screen title={title} action={avatar}>
        {/* Room so the last content can scroll above the floating tab bar */}
        <div className="pb-24">{children}</div>
      </Screen>
      <div className="absolute inset-x-0 bottom-0">
        <TabBar
          tabs={tabs.map((tab) => ({ ...tab, icon: tabIcons[tab.id] }))}
          active={activeTab}
          onSelect={navigate}
          onCapture={() => navigate('capture')}
        />
      </div>
    </div>
  )
}
