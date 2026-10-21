import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

// Scrolling the page nudges a moving glass a little with the scroll's speed,
// as if it had weight, then it springs back (Keller, Oct 19). Pass the result
// to FluidGlass's `pushRef`; `from` is any element inside the scrolling page.
export function useScrollNudge(from: RefObject<HTMLElement | null>, on: boolean) {
  const push = useRef<((vx: number, vy: number) => void) | null>(null)
  useEffect(() => {
    if (!on) return
    let scroller = from.current?.parentElement ?? null
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement
    if (!scroller) return
    const page = scroller
    let lastTop = page.scrollTop
    let lastTime = performance.now()
    const onScroll = () => {
      const now = performance.now()
      const speed = (page.scrollTop - lastTop) / Math.max((now - lastTime) / 1000, 0.008)
      lastTop = page.scrollTop
      lastTime = now
      // The content moves up as she scrolls down, so the glass lags behind it,
      // at most ~5.5px since the glass's spring is soft (Keller, Oct 21: a
      // little more than the first 0.008 and 16)
      push.current?.(0, Math.max(-22, Math.min(22, speed * 0.011)))
    }
    page.addEventListener('scroll', onScroll, { passive: true })
    return () => page.removeEventListener('scroll', onScroll)
  }, [from, on])
  return push
}
