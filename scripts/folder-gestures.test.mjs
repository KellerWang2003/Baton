import assert from 'node:assert/strict'
import test from 'node:test'
import { advanceWheelGesture, createWheelGesture, dragFeedback, FLICK_MS, folderOpenness } from '../src/ui/folderGestures.ts'

test('a trackpad flick turns one folder through a long momentum tail', () => {
  const state = createWheelGesture()
  const deltas = [4, 14, 36, 55, 48, 32, 24, 18, 12, 8, 4, 2, 1]
  const turns = deltas.map((delta, i) => advanceWheelGesture(state, delta, i * 16).step)
  assert.equal(turns.reduce((sum, step) => sum + step, 0), 1)
})

test('gentle scrolling previews, then advances at each full threshold', () => {
  const state = createWheelGesture()
  for (let i = 0; i < 39; i++) {
    const result = advanceWheelGesture(state, 2, i * 20)
    assert.equal(result.step, 0)
    assert.ok(result.progress > 0 && result.progress < 1)
  }
  assert.equal(advanceWheelGesture(state, 2, 780).step, 1)
  let turns = 0
  for (let i = 0; i < 40; i++) turns += advanceWheelGesture(state, 2, 800 + i * 20).step
  assert.equal(turns, 1)
})

test('a reversal or a fresh gesture can interrupt a flick lock', () => {
  const state = createWheelGesture()
  assert.equal(advanceWheelGesture(state, 40, 0).step, 1)
  assert.equal(advanceWheelGesture(state, 30, 16).step, 0)
  assert.equal(advanceWheelGesture(state, -40, 32).step, -1)
  assert.equal(advanceWheelGesture(state, -40, 400).step, -1)
})

test('partial scrolling is discarded after idle instead of carrying into another gesture', () => {
  const state = createWheelGesture()
  advanceWheelGesture(state, 6, 0)
  const next = advanceWheelGesture(state, 6, 500)
  assert.equal(next.step, 0)
  assert.equal(next.progress, 6 / 80)
})

test('overscrolling an end folder builds resistance without repeated threshold resets', () => {
  for (const direction of [-1, 1]) {
    const state = createWheelGesture()
    let previous = 0
    for (let i = 0; i < 30; i++) {
      const result = advanceWheelGesture(state, direction * 20, i * 16, false)
      assert.equal(result.step, 0)
      assert.ok(Math.abs(result.progress) > previous)
      previous = Math.abs(result.progress)
    }
    // Reversing away from the edge should still allow an immediate turn.
    assert.equal(advanceWheelGesture(state, direction * -40, 480, true).step, -direction)
  }
})

test('a fast drag cannot turn multiple folders before release', () => {
  assert.deepEqual(dragFeedback(400, FLICK_MS - 1), { step: 0, progress: 1 })
  assert.deepEqual(dragFeedback(-400, FLICK_MS - 1), { step: 0, progress: -1 })
})

test('a slow partial drag previews, and a full drag snaps one step in either direction', () => {
  assert.deepEqual(dragFeedback(45, 500), { step: 0, progress: 0.45 })
  assert.deepEqual(dragFeedback(100, 500), { step: 1, progress: 0 })
  assert.deepEqual(dragFeedback(-100, 500), { step: -1, progress: 0 })
})

test('preview redistributes the opening between neighbors without changing stack height', () => {
  for (const focus of [0, 0.2, 0.65, 1, 1.4, 2]) {
    const openings = [0, 1, 2].map((index) => folderOpenness(index, focus))
    assert.ok(Math.abs(openings.reduce((sum, value) => sum + value, 0) - 1) < 1e-10)
  }
})
