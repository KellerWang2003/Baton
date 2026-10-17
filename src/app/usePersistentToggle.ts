import { useState } from 'react'

// A boolean remembered in localStorage across reloads.
export function usePersistentToggle(key: string, initial: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? initial : stored === 'true'
    } catch {
      return initial
    }
  })

  const toggle = () =>
    setValue((current) => {
      try {
        localStorage.setItem(key, String(!current))
      } catch {
        // Storage unavailable: keep the in-memory value.
      }
      return !current
    })

  return [value, toggle] as const
}
