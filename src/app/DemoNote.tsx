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
      const left = rect ? rect.right + 28 : 0
      setSpot(rect && left + 240 < window.innerWidth ? { left, top: rect.top + rect.height / 2 } : null)
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
      className="pointer-events-none fixed z-50 w-56 -translate-y-1/2 rounded-card bg-brand px-5 py-4 text-base font-medium leading-snug text-baton-paper shadow-float"
      style={{ left: spot.left, top: spot.top }}
    >
      {/* A small point toward the phone. */}
      <span aria-hidden className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rotate-45 bg-brand" />
      {children}
    </p>,
    document.body,
  )
}
