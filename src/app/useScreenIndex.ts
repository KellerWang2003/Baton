import { useCallback, useSyncExternalStore } from 'react'
import { flow } from '../flow'

// The current screen lives in the URL hash (#/ui-kit), so a reload keeps your place.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function readIndex() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return Math.max(0, flow.findIndex((screen) => screen.id === id))
}

export function useScreenIndex() {
  const index = useSyncExternalStore(subscribe, readIndex)

  const goTo = useCallback((next: number) => {
    const clamped = Math.min(flow.length - 1, Math.max(0, next))
    window.location.hash = `/${flow[clamped].id}`
  }, [])

  return [index, goTo] as const
}
