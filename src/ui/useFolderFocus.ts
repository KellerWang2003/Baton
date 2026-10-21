import { useEffect, useRef, useState } from 'react'

// Keep position and velocity through the threshold. Switching from a preview
// to a committed folder changes only the spring's destination, so the snap
// continues the movement instead of restarting a CSS height transition.
export function useFolderFocus(target: number, tracking: boolean) {
  const [position, setPosition] = useState(target)
  const motion = useRef({ position: target, velocity: 0, target, tracking, frame: 0, last: 0 })

  useEffect(() => {
    const state = motion.current
    state.target = target
    state.tracking = tracking
    if (state.frame || (state.position === target && state.velocity === 0)) return
    state.last = performance.now()
    const animate = (now: number) => {
      const elapsed = Math.min((now - state.last) / 1000, 0.032)
      state.last = now
      // Small integration steps keep the spring stable on slower phones.
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
      const dt = elapsed / steps
      const stiffness = state.tracking ? 700 : 280
      const damping = state.tracking ? 50 : 32
      for (let i = 0; i < steps; i++) {
        state.velocity += ((state.target - state.position) * stiffness - state.velocity * damping) * dt
        state.position += state.velocity * dt
      }
      if (Math.abs(state.target - state.position) < 0.0005 && Math.abs(state.velocity) < 0.005) {
        state.position = state.target
        state.velocity = 0
        state.frame = 0
      } else state.frame = requestAnimationFrame(animate)
      setPosition(state.position)
    }
    state.frame = requestAnimationFrame(animate)
  }, [target, tracking])

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), [])
  return position
}
