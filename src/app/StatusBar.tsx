import { useEffect, useState } from 'react'

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
// (public/status/icons-right.svg, exported from Figma) at right. 54pt tall on
// the paper color the screens sit on.
export function StatusBar() {
  const time = useClock()
  return (
    <div className="relative h-[54px] shrink-0 bg-baton-paper text-device">
      <span className="absolute top-[18px] left-[57.5px] -translate-x-1/2 font-system text-status font-semibold whitespace-nowrap tabular-nums">
        {time}
      </span>
      <span aria-hidden className="absolute top-[11px] left-1/2 h-[37px] w-[127px] -translate-x-1/2 rounded-full bg-device" />
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
