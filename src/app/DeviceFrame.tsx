import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { StatusBar } from './StatusBar'
import { JourneySelector } from './JourneySelector'
import { TryList } from './TryList'
import type { FrameSettings } from './useFrameSize'

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
  // Team-only recording settings from the debug panel; the defaults are the showcase.
  framed?: boolean
  // iPhone bezel, or a plain bordered box of any size (custom)
  frame?: FrameSettings
  // Scale the phone down whole on short windows instead of squashing it
  lockRatio?: boolean
  backgroundColor?: string | null
  onboardingStatus?: boolean
  children: ReactNode
}

// Framed: an iPhone 16 Pro with a 402x874 pt screen matching the Figma frames.
// Unframed: the app fills the window and responds to its width.
// Both are size containers, so screens should use container variants
// (@md:, @lg:) rather than viewport ones (md:, lg:).
// The transparent bezel asset is 1406x2822 at 3x. Its screen starts at
// (102, 100) and is 1206x2622; keep these aligned with the live app below.
const iphoneSize = { width: 1406 / 3, height: 2822 / 3 }

export function DeviceFrame({ framed = true, frame, lockRatio = true, backgroundColor = null, onboardingStatus, children }: DeviceFrameProps) {
  const isPhone = useIsPhone()
  const page = useRef<HTMLDivElement>(null)
  const [fitScale, setScale] = useState(1)
  const custom = frame?.preset === 'custom'
  const outer = custom && frame ? { width: frame.width, height: frame.height } : iphoneSize
  // Unlocked, the phone stays at real size
  const scale = lockRatio ? fitScale : 1

  // Fit the whole phone inside the page, never larger than real size
  useLayoutEffect(() => {
    const element = page.current
    if (!element) return
    const fit = () => {
      const pad = 32
      setScale(Math.max(0.01, Math.min(1, (element.clientWidth - pad) / outer.width, (element.clientHeight - pad) / outer.height)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [isPhone, framed, outer.width, outer.height])

  if (isPhone || !framed) {
    return <div data-app-root className="@container h-full w-full bg-canvas">{children}</div>
  }

  const screen = (
    <>
      <StatusBar onboarding={onboardingStatus} showIsland={false} />
      {/* Screens can extend their backgrounds under the status bar. */}
      <div data-app-root className="@container min-h-0 flex-1" style={{ '--status-bar': '54px' } as CSSProperties}>
        {children}
      </div>
    </>
  )

  return (
    <div data-device-page className="showcase-layout" style={{ backgroundColor: backgroundColor ?? undefined }}>
      <JourneySelector />
      <div className="showcase-preview">
        <div ref={page} className="flex min-h-0 w-full flex-1 items-center justify-center">
          <div className="relative shrink-0" style={{ width: outer.width * scale, height: outer.height * scale }}>
            {custom ? (
              // A plain border of any size (debug panel > Custom)
              <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-canvas" style={{ ...outer, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {screen}
              </div>
            ) : (
              <div className="relative" style={{ ...iphoneSize, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <div
                  className="absolute isolate z-0 flex flex-col overflow-hidden rounded-[52px] bg-canvas"
                  style={{ left: `${102 / 1406 * 100}%`, top: `${100 / 2822 * 100}%`, width: `${1206 / 1406 * 100}%`, height: `${2622 / 2822 * 100}%`, transform: 'scale(1.005)' }}
                >
                  {screen}
                </div>
                <img
                  src="/device/iphone-16-pro-black.png"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="pointer-events-none absolute inset-0 z-30 h-full w-full select-none"
                />
              </div>
            )}
          </div>
        </div>
        <p className="max-w-lg shrink-0 px-4 text-center text-sm leading-relaxed text-ink-muted">
          Interactive prototype — some features are still in development.
        </p>
      </div>
      <TryList />
    </div>
  )
}
