import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../ui/cx'
import { StatusBar } from './StatusBar'
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
  framed: boolean
  // iPhone bezel, or a plain bordered box of any size (custom)
  frame: FrameSettings
  // Keep the phone's proportions on short windows by scaling it down whole,
  // instead of squashing its height (which made it look fat)
  lockRatio: boolean
  backgroundColor: string | null
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

export function DeviceFrame({ framed, frame, lockRatio, backgroundColor, onboardingStatus, children }: DeviceFrameProps) {
  const isPhone = useIsPhone()
  const page = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const custom = frame.preset === 'custom'
  const outer = custom ? { width: frame.width + 2, height: frame.height + 2 } : iphoneSize

  // Fit the whole phone inside the page, never larger than real size
  useLayoutEffect(() => {
    const element = page.current
    if (!element || !lockRatio) return
    const fit = () => {
      const pad = 32
      setScale(Math.min(1, (element.clientWidth - pad) / outer.width, (element.clientHeight - pad) / outer.height))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [lockRatio, framed, isPhone, outer.width, outer.height])

  if (!framed || isPhone) {
    return <div data-app-root className="@container h-full w-full bg-canvas">{children}</div>
  }

  if (custom) {
    // A plain border: any size, scaled down whole to fit the page when locked
    return (
      <div ref={page} data-device-page style={{ backgroundColor: backgroundColor ?? undefined }} className={cx('flex h-full w-full items-center justify-center', lockRatio ? 'overflow-hidden' : 'p-4')}>
        <div
          data-app-root
          className="relative flex shrink-0 flex-col overflow-hidden rounded-[24px] border border-ink/30 bg-canvas"
          style={lockRatio ? { ...outer, transform: `scale(${scale})` } : { width: outer.width, height: outer.height, maxWidth: '100%', maxHeight: '100%' }}
        >
          <StatusBar onboarding={onboardingStatus} showIsland={false} />
          <div className="@container min-h-0 flex-1" style={{ '--status-bar': '54px' } as CSSProperties}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={page} data-device-page style={{ backgroundColor: backgroundColor ?? undefined }} className={cx('flex h-full w-full items-center justify-center', lockRatio ? 'overflow-hidden' : 'p-4')}>
      <div
        style={lockRatio ? { ...iphoneSize, flexShrink: 0, transform: `scale(${scale})` } : undefined}
        className={cx(
          'relative shrink-0',
          !lockRatio && 'h-[940.667px] max-h-full w-[468.667px]',
        )}
      >
        <div
          className="absolute flex flex-col overflow-hidden rounded-[64px] bg-canvas"
          style={{ left: `${102 / 1406 * 100}%`, top: `${100 / 2822 * 100}%`, width: `${1206 / 1406 * 100}%`, height: `${2622 / 2822 * 100}%` }}
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
  )
}
