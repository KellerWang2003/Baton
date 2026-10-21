import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

// A note for viewers beside the phone frame, outside the app. Hidden on a real phone or when there's no room.
export function DemoNote({ children }: { children: ReactNode }) {
  const [spot, setSpot] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    const place = () => {
      const screen = document.querySelector('[data-device-page] [data-app-root]')
      const rect = screen?.parentElement?.getBoundingClientRect()
      const left = rect ? rect.right + 40 : 0
      setSpot(rect && left + 200 < window.innerWidth ? { left, top: rect.top + rect.height / 2 } : null)
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(document.body)
    window.addEventListener('resize', place)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [])

  if (!spot) return null
  // Portaled out of the scaled phone so it sits on the page.
  return createPortal(
    <p
      className="pointer-events-none fixed z-50 w-48 -translate-y-1/2 text-sm leading-relaxed text-ink-muted"
      style={{ left: spot.left, top: spot.top }}
    >
      {children}
    </p>,
    document.body,
  )
}
