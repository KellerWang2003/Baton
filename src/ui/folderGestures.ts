export const DRAG_THRESHOLD = 100
export const FLICK_MS = 120
// Release speed in px/ms that counts as a flick, however long the drag took
export const FLING_VELOCITY = 0.4
// A touch held longer than this is a scroll, not a flick
export const FLICK_HOLD_MS = 200
// A swipe traveling farther than this is a scroll, however fast
export const FLICK_MAX_TRAVEL = 160
export const MOVE_SLOP = 8
export const WHEEL_THRESHOLD = 80
export const WHEEL_IDLE_MS = 180

// Browsers expose trackpad momentum as ordinary wheel events. Lock a fast
// burst after one turn until it goes quiet, reverses, or clearly accelerates
// again. Gentle, sustained scrolling can keep crossing the threshold.
export function createWheelGesture() {
  return { distance: 0, delta: 0, startedAt: 0, lastAt: -Infinity, snappedAt: -Infinity, locked: false, fading: false }
}

export function advanceWheelGesture(state: ReturnType<typeof createWheelGesture>, delta: number, now: number, canStep = true) {
  const magnitude = Math.abs(delta)
  const previous = Math.abs(state.delta)
  const fresh = now - state.lastAt > WHEEL_IDLE_MS ||
    Math.sign(delta) !== Math.sign(state.delta) ||
    (state.fading && previous < 8 && magnitude >= Math.max(12, previous * 2) && now - state.snappedAt > 100)
  if (fresh) Object.assign(state, createWheelGesture(), { startedAt: now })
  if (!fresh && previous > 0 && magnitude < previous * 0.9) state.fading = true
  state.delta = delta
  state.lastAt = now
  if (state.locked) return { step: 0, progress: 0 }

  state.distance += delta
  const flick = now - state.startedAt <= FLICK_MS && magnitude >= 12
  if (canStep && Math.abs(state.distance) >= (flick ? 18 : WHEEL_THRESHOLD)) {
    const step = Math.sign(state.distance)
    state.distance = 0
    state.locked = flick
    state.snappedAt = now
    return { step, progress: 0 }
  }
  return { step: 0, progress: state.distance / WHEEL_THRESHOLD }
}

export function dragFeedback(distance: number, elapsed: number) {
  // Hold off committing during a quick flick, even if it covers several
  // thresholds. On release it will turn exactly one folder.
  const step = elapsed >= FLICK_MS && Math.abs(distance) >= DRAG_THRESHOLD ? Math.sign(distance) : 0
  return { step, progress: step ? 0 : Math.max(-1, Math.min(1, distance / DRAG_THRESHOLD)) }
}

// Only the two neighboring folders participate in a preview. Leave some of
// the opening for the snap so crossing the threshold feels decisive.
export function folderOpenness(index: number, focus: number) {
  return Math.max(0, 1 - Math.abs(index - focus))
}
