import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { StatusBar } from './StatusBar'

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

export function DeviceFrame({ onboardingStatus, children }: DeviceFrameProps) {
  const isPhone = useIsPhone()
  const page = useRef<HTMLDivElement>(null)
  const note = useRef<HTMLParagraphElement>(null)
  const [scale, setScale] = useState(1)

  // Fit the whole phone inside the page, never larger than real size
  useLayoutEffect(() => {
    const element = page.current
    if (!element) return
    const fit = () => {
      const pad = 32
      const noteHeight = note.current?.getBoundingClientRect().height ?? 0
      setScale(Math.max(0.01, Math.min(1, (element.clientWidth - pad) / iphoneSize.width, (element.clientHeight - pad - noteHeight - 16) / iphoneSize.height)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    if (note.current) observer.observe(note.current)
    return () => observer.disconnect()
  }, [isPhone])

  if (isPhone) {
    return <div data-app-root className="@container h-full w-full bg-canvas">{children}</div>
  }

  return (
    <div ref={page} data-device-page className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden p-4">
      <div className="relative shrink-0" style={{ width: iphoneSize.width * scale, height: iphoneSize.height * scale }}>
        <div className="relative" style={{ ...iphoneSize, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div
            className="absolute isolate z-0 flex flex-col overflow-hidden rounded-[52px] bg-canvas"
            style={{ left: `${102 / 1406 * 100}%`, top: `${100 / 2822 * 100}%`, width: `${1206 / 1406 * 100}%`, height: `${2622 / 2822 * 100}%`, transform: 'scale(1.005)' }}
          >
            <StatusBar onboarding={onboardingStatus} showIsland={false} />
            {/* Screens can extend their backgrounds under the status bar. */}
            <div data-app-root className="@container min-h-0 flex-1" style={{ '--status-bar': '54px' } as CSSProperties}>
              {children}
            </div>
          </div>
          <img
            src="/device/iphone-16-pro-black.png"
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute inset-0 z-30 h-full w-full select-none"
          />
        </div>
      </div>
      <p ref={note} className="max-w-lg shrink-0 text-center text-sm leading-relaxed text-ink-muted">
        Interactive prototype — some features are still in development.
      </p>
    </div>
  )
}
