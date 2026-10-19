import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

export const relayEntrances = [
  { id: 'rise', name: 'Soft rise', blurb: 'A gentle lift, with each piece following the last.', duration: 600, stagger: 65 },
  { id: 'fade', name: 'Quiet fade', blurb: 'A calm dissolve. Everything stays right where it belongs.', duration: 700, stagger: 45 },
  { id: 'pop', name: 'Paper pop', blurb: 'Scraps land with a small, playful bounce.', duration: 650, stagger: 85 },
  { id: 'sweep', name: 'Side sweep', blurb: 'Content glides in from the side, like a handoff.', duration: 650, stagger: 75 },
] as const

export type RelayEntrance = typeof relayEntrances[number]['id']

function frames(style: RelayEntrance): Keyframe[] {
  switch (style) {
    case 'fade': return [{ opacity: 0 }, { opacity: 1 }]
    case 'pop': return [
      { opacity: 0, transform: 'translate3d(0, 24px, 0) scale(0.92)', offset: 0 },
      { opacity: 1, transform: 'translate3d(0, -4px, 0) scale(1.015)', offset: 0.72 },
      { opacity: 1, transform: 'none', offset: 1 },
    ]
    case 'sweep': return [{ opacity: 0, transform: 'translate3d(28px, 0, 0)' }, { opacity: 1, transform: 'none' }]
    case 'rise': return [{ opacity: 0, transform: 'translate3d(0, 22px, 0)' }, { opacity: 1, transform: 'none' }]
  }
}

// Observe individual pieces, including horizontally scrolled cards. Animate once
// per visit/replay. Card surfaces animate inside fixed scroll-snap anchors,
// with their scrapbook tilts preserved on the nested card. The final transform
// matches the underlying style so removing the effect cannot change position.
export function useRelayEntrance(ref: RefObject<HTMLDivElement | null>, style: RelayEntrance, speed = 1, run: string | number = 0) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>(
      '[data-relay-enter], [data-relay-feed] h2, [data-relay-person]',
    ))
    const preset = relayEntrances.find((option) => option.id === style)!
    const animations: Animation[] = []
    const originalOpacity = new Map(targets.map((target) => [target, target.style.opacity]))
    targets.forEach((target) => { target.style.opacity = '0' })
    const observer = new IntersectionObserver((entries) => {
      let order = 0
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        observer.unobserve(target)
        target.style.opacity = originalOpacity.get(target) ?? ''
        animations.push(target.animate(frames(style), {
          duration: preset.duration / speed,
          delay: Math.min(order++, 5) * preset.stagger / speed,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        }))
      })
    }, { threshold: 0.04 })
    targets.forEach((target) => observer.observe(target))
    const reveal = () => {
      if (!motion.matches) return
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      targets.forEach((target) => { target.style.opacity = originalOpacity.get(target) ?? '' })
    }
    motion.addEventListener('change', reveal)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', reveal)
      animations.forEach((animation) => animation.cancel())
      targets.forEach((target) => { target.style.opacity = originalOpacity.get(target) ?? '' })
    }
  }, [ref, style, speed, run])
}
