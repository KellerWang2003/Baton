import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../ui/cx'
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
  framed: boolean
  // Keep the phone's proportions on short windows by scaling it down whole,
  // instead of squashing its height (which made it look fat)
  lockRatio: boolean
  onboardingStatus?: boolean
  children: ReactNode
}

// Framed: an iPhone 18 Pro sized phone (402x874 pt screen, same as the 17 Pro
// and the Figma frames) centered on the page, for recording the demo.
// Unframed: the app fills the window and responds to its width.
// Both are size containers, so screens should use container variants
// (@md:, @lg:) rather than viewport ones (md:, lg:).
// The frame's outer size: the 402x874 screen plus the 10px border
const frameSize = { width: 422, height: 894 }

export function DeviceFrame({ framed, lockRatio, onboardingStatus, children }: DeviceFrameProps) {
  const isPhone = useIsPhone()
  const page = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Fit the whole phone inside the page, never larger than real size
  useLayoutEffect(() => {
    const element = page.current
    if (!element || !lockRatio) return
    const fit = () => {
      const pad = 32
      setScale(Math.min(1, (element.clientWidth - pad) / frameSize.width, (element.clientHeight - pad) / frameSize.height))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [lockRatio, framed, isPhone])

  if (!framed || isPhone) {
    return <div className="@container h-full w-full bg-canvas">{children}</div>
  }

  return (
    <div ref={page} className={cx('flex h-full w-full items-center justify-center', lockRatio ? 'overflow-hidden' : 'p-4')}>
      <div
        style={lockRatio ? { ...frameSize, flexShrink: 0, transform: `scale(${scale})` } : undefined}
        className={cx(
          'relative flex flex-col overflow-hidden rounded-[72px] border-[10px] border-ink bg-canvas shadow-float',
          !lockRatio && 'h-[894px] max-h-full w-[422px]',
        )}
      >
        <StatusBar onboarding={onboardingStatus} />
        {/* --status-bar: how far a screen can reach up under the status bar
            (0 without the frame, where there is none) */}
        <div className="@container min-h-0 flex-1" style={{ '--status-bar': '54px' } as CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  )
}
