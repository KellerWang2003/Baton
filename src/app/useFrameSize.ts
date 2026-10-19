import { useState } from 'react'

// The phone frame: the iPhone bezel, or a plain bordered box of any size.
export type FrameSettings = { preset: 'iphone' | 'custom'; width: number; height: number }

const key = 'baton:frame-size'
const fallback: FrameSettings = { preset: 'iphone', width: 402, height: 874 }
export const frameLimits = { min: 240, max: 2400 }

function load(): FrameSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (stored && (stored.preset === 'iphone' || stored.preset === 'custom') && stored.width > 0 && stored.height > 0) return stored
  } catch {
    // Storage unavailable or unreadable: use the default.
  }
  return fallback
}

// Remembered across reloads, like the other debug toggles.
export function useFrameSize() {
  const [settings, setSettings] = useState(load)
  const update = (patch: Partial<FrameSettings>) =>
    setSettings((current) => {
      const next = { ...current, ...patch }
      next.width = Math.min(frameLimits.max, Math.max(frameLimits.min, Math.round(next.width) || fallback.width))
      next.height = Math.min(frameLimits.max, Math.max(frameLimits.min, Math.round(next.height) || fallback.height))
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Keep the in-memory value.
      }
      return next
    })
  return [settings, update] as const
}
