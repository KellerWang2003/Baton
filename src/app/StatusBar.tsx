import { useEffect, useState } from 'react'
import { useStore } from './store'

// "9:41" style: 12-hour, no AM/PM, like the iPhone status bar
function clock(date: Date) {
  const hours = date.getHours() % 12 || 12
  return `${hours}:${String(date.getMinutes()).padStart(2, '0')}`
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // Tick on the minute, then every minute after
    let interval = 0
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])
  return clock(now)
}

// iPhone status bar from the Figma frames (LA28 Palms, e.g. 256:222): the
// live time at left, the Dynamic Island, then signal, wifi and battery
// (public/status/icons-right.svg, exported from Figma) at right. 54pt tall,
// with no fill of its own: it sits over the page (the frame is paper behind
// it), so screens that run up under it (--status-bar) show through.
export function StatusBar({ onboarding = false, showIsland = true }: { onboarding?: boolean; showIsland?: boolean }) {
  const time = useClock()
  const { lightStatusBar, hideStatusBar, statusBarCovered } = useStore()
  if (onboarding) {
    return (
      <div className={`onboarding-status flex h-[54px] shrink-0 items-center justify-between px-9 text-sm font-semibold text-ink ${hideStatusBar ? 'invisible' : ''}`}>
        <span>{time}</span>
        {showIsland && <span aria-hidden className="absolute left-1/2 top-[11px] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-ink" />}
        <img src="/onboarding/status-icons.svg" alt="" width="75.401" height="13" />
      </div>
    )
  }
  return (
    // Above everything in the app, so full-bleed pages (the stage splashes) run under it
    <div
      className={`pointer-events-none relative z-[60] h-[54px] shrink-0 text-device transition-opacity duration-300 ${lightStatusBar ? 'invert' : ''} ${hideStatusBar ? 'invisible' : ''} ${statusBarCovered ? 'opacity-0' : ''}`}
    >
      <span className="absolute top-[18px] left-[57.5px] -translate-x-1/2 font-system text-status font-semibold whitespace-nowrap tabular-nums">
        {time}
      </span>
      {showIsland && <span aria-hidden className="absolute top-[11px] left-1/2 h-[37px] w-[127px] -translate-x-1/2 rounded-full bg-device" />}
      <img
        src="/status/icons-right.svg"
        alt=""
        aria-hidden
        width={75.4}
        height={13}
        className="absolute top-[22px] left-[287px] h-[13px] w-[75.4px] max-w-none"
      />
    </div>
  )
}
