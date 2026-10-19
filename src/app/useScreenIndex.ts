import { useCallback, useSyncExternalStore } from 'react'
import { flow } from '../flow'
import { useStore } from './store'

// The current screen lives in the URL hash (#/today), so a reload keeps your place.
function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function readIndex() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return Math.max(0, flow.findIndex((screen) => screen.id === id))
}

export function useScreenIndex() {
  const rawIndex = useSyncExternalStore(subscribe, readIndex)
  const { onboardingPhotoAccess } = useStore()
  const index = !onboardingPhotoAccess && flow[rawIndex].id === 'photos'
    ? flow.findIndex((screen) => screen.id === 'welcome')
    : rawIndex

  const goTo = useCallback((next: number) => {
    let clamped = Math.min(flow.length - 1, Math.max(0, next))
    if (!onboardingPhotoAccess && flow[clamped].id === 'photos') {
      clamped += next < index ? -1 : 1
    }
    window.location.hash = `/${flow[clamped].id}`
  }, [index, onboardingPhotoAccess])

  return [index, goTo] as const
}
