import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { openComposer, registerComposerField } from '../app/composer'
import { navigate } from '../app/navigate'
import { setState, useDailyPrompt, useStore } from '../app/store'
import { useKeyboardInset } from '../app/useKeyboardInset'
import { pages, tabs } from '../data/pages'
import { chloe } from '../data/people'
import { recentPhotos } from '../data/photos'
import { ArchiveIcon, Avatar, MapPinIcon, RelayIcon, Screen, TabBar, TodayIcon } from '../ui'

type MainLayoutProps = {
  // Tabs have no page title; Today shows its greeting here
  title?: string
  subtitle?: string
  children: ReactNode
  // Full-bleed body that stretches to the bottom edge (e.g. Archive folders)
  bleed?: boolean
  // Floating profile button (Today only; Archive and Relay are just content)
  profile?: boolean
}

type TabShellProps = {
  activeTab: string
  children: ReactNode
}

const tabIcons: Record<string, ReactNode> = {
  today: <TodayIcon />,
  archive: <ArchiveIcon />,
  community: <RelayIcon />,
}

// Page layout for the three tab pages. No top bar: on Today the greeting
// scrolls with the page and the profile avatar floats at top right over it.
// Pushed pages (Profile) use Screen directly, without the tab bar.
export function MainLayout({ title, subtitle, children, bleed = false, profile = false }: MainLayoutProps) {
  const greeting = title && (
    <header className="pr-12 pb-2 pt-3">
      <h1 className="text-balance font-display text-large-title font-bold text-ink">{title}</h1>
      {subtitle && <p className="font-display text-title-3 text-ink-muted">{subtitle}</p>}
    </header>
  )

  return (
    <div className="relative h-full">
      <Screen bleed={bleed}>
        {bleed ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          // Room so the last content can scroll above the floating tab bar
          <div className="pb-24">
            {greeting || <div className="h-3" />}
            {children}
          </div>
        )}
      </Screen>
      {profile && (
        <button
          type="button"
          onClick={() => navigate('profile')}
          aria-label="Profile"
          className="absolute right-4 top-3 z-10 rounded-full shadow-float active:opacity-80"
        >
          <Avatar name={chloe.name} size="sm" />
        </button>
      )}
    </div>
  )
}

// The floating tab bar over the tab pages. App renders it once around whichever
// tab is showing, so switching tabs only swaps the page and the bar stays put
// (remounting it with each page made every tab switch look like a reload).
// Tapping + turns it into a text field for today's prompt, right in the tab bar.
export function TabShell({ activeTab, children }: TabShellProps) {
  const { composing } = useStore()
  const dailyPrompt = useDailyPrompt()
  const [toast, setToast] = useState(false)
  const { inset: keyboard, pan } = useKeyboardInset()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(false), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div className="relative h-full">
      {/* The page stays where it was while the keyboard is up: Safari pans
          the view to show the field, so the page moves back down by as much */}
      <div style={pan ? { transform: `translateY(${pan}px)` } : undefined} className="h-full">
        {children}
      </div>

      {/* While typing: dim the page and show what she's answering */}
      <div
        onClick={() => setState({ composing: false })}
        style={pan ? { transform: `translateY(${pan}px)` } : undefined}
        className={`absolute inset-0 z-20 bg-canvas/85 backdrop-blur-md transition-opacity duration-300 ${composing ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* Rides on top of the keyboard on phones */}
      <div
        style={{ transform: `translateY(-${keyboard}px)` }}
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col transition-[transform,padding] duration-300 ease-out ${keyboard ? 'pb-2' : 'pb-6'}`}
      >
        <div
          className={`mx-4 mb-3 flex flex-col gap-1 px-1 transition duration-300 ${composing ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
        >
          <p className="font-display text-title-3 font-semibold text-ink">{dailyPrompt.question}</p>
          <p className="flex items-center gap-1 text-footnote text-ink-muted">
            <MapPinIcon className="size-4 shrink-0" />
            {dailyPrompt.seed}
          </p>
        </div>
        <p
          role="status"
          className={`mx-auto mb-3 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-subhead text-canvas transition duration-300 ${toast ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden p-0 opacity-0'}`}
        >
          {pages.capture.saved}
        </p>
        <TabBar
          tabs={tabs.map((tab) => ({ ...tab, icon: tabIcons[tab.id] }))}
          active={activeTab}
          onSelect={navigate}
          composing={composing}
          onOpen={openComposer}
          onClose={() => setState({ composing: false })}
          recentPhotos={recentPhotos}
          fieldRef={registerComposerField}
          placeholder={pages.capture.reflectionPlaceholder}
          onSubmit={(text, photos) => {
            setState((s) => ({ reflections: [...s.reflections, { text, photos }] }))
            setToast(true)
          }}
        />
      </div>
    </div>
  )
}
