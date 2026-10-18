import { useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

// On a real phone (opened over wifi) the app fills the screen, frame or not.
const phoneQuery = '(max-width: 500px)'
function subscribe(onChange: () => void) {
  const media = window.matchMedia(phoneQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
function useIsPhone() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(phoneQuery).matches)
}

type DeviceFrameProps = {
  framed: boolean
  children: ReactNode
}

// Framed: an iPhone 18 Pro sized phone (402x874 pt screen, same as the 17 Pro
// and the Figma frames) centered on the page, for recording the demo.
// Unframed: the app fills the window and responds to its width.
// Both are size containers, so screens should use container variants
// (@md:, @lg:) rather than viewport ones (md:, lg:).
export function DeviceFrame({ framed, children }: DeviceFrameProps) {
  const isPhone = useIsPhone()
  if (!framed || isPhone) {
    return <div className="@container h-full w-full bg-canvas">{children}</div>
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="relative flex h-[894px] max-h-full w-[422px] flex-col overflow-hidden rounded-[72px] border-[10px] border-ink bg-canvas shadow-float">
        <div className="flex h-[54px] shrink-0 items-center justify-between px-9 text-sm font-semibold text-ink">
          <span>9:41</span>
          <span aria-hidden className="absolute left-1/2 top-[11px] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-ink" />
          <span aria-hidden>●●●</span>
        </div>
        <div className="@container min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
