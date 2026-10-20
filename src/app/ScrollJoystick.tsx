import { useEffect, useRef, useState } from 'react'

// Debug tool for recording: a joystick in the viewport's bottom-right corner.
// Push the knob up or down to scroll the app smoothly; the further you push,
// the faster it goes, and the speed eases in and out so there are no jerks.
const track = 132 // joystick travel in px (knob center can move +-travel)
const maxSpeed = 1400 // px/s at full deflection

// The scrollable element under the center of the app, or null when the page
// scrolls some other way (those get synthetic wheel events instead).
function findScroller(): { element: HTMLElement | null; x: number; y: number } {
  const page = document.querySelector('[data-app-root]') ?? document.querySelector('[data-device-page]')
  const rect = page?.getBoundingClientRect() ?? document.body.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  let node = document.elementFromPoint(x, y) as HTMLElement | null
  while (node && node !== document.documentElement) {
    const overflow = getComputedStyle(node).overflowY
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight + 1) return { element: node, x, y }
    node = node.parentElement
  }
  return { element: null, x, y }
}

export function ScrollJoystick() {
  const [offset, setOffset] = useState(0) // -1 (up) .. 1 (down)
  const target = useRef(0)
  const [dragging, setDragging] = useState(false)
  const base = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let last = performance.now()
    let velocity = 0
    let carry = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // Ease the speed toward what the knob asks for
      const wanted = Math.sign(target.current) * Math.pow(Math.abs(target.current), 2) * maxSpeed
      velocity += (wanted - velocity) * (1 - Math.exp(-dt * 6))
      if (Math.abs(velocity) < 0.5 && wanted === 0) velocity = 0
      if (velocity !== 0) {
        const { element, x, y } = findScroller()
        const delta = velocity * dt + carry
        if (element) {
          // scrollTop rounds on some browsers, so keep the fraction for next frame
          const before = element.scrollTop
          element.scrollTop = before + delta
          carry = delta - (element.scrollTop - before)
          if (Math.abs(carry) > 4) carry = 0
        } else {
          document.elementFromPoint(x, y)?.dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true, clientX: x, clientY: y }))
          carry = 0
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    // Never stay pushed if the window loses focus or the tab is hidden mid-drag
    const stop = () => {
      target.current = 0
      setOffset(0)
      setDragging(false)
    }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', stop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', stop)
    }
  }, [])

  const move = (event: React.PointerEvent) => {
    if (!dragging || !base.current) return
    const rect = base.current.getBoundingClientRect()
    const value = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (track / 2)))
    target.current = value
    setOffset(value)
  }
  const release = () => {
    setDragging(false)
    target.current = 0
    setOffset(0)
  }

  return (
    <div
      ref={base}
      data-scroll-joystick
      aria-label="Scroll joystick"
      className="fixed bottom-6 right-6 z-50 flex w-16 touch-none select-none items-center justify-center rounded-full bg-ink/15 shadow-float backdrop-blur"
      style={{ height: track + 64 }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
        target.current = Math.max(-1, Math.min(1, (event.clientY - (event.currentTarget.getBoundingClientRect().top + event.currentTarget.getBoundingClientRect().height / 2)) / (track / 2)))
        setOffset(target.current)
      }}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      <span className="pointer-events-none absolute top-3 text-xs text-ink-muted">▲</span>
      <span className="pointer-events-none absolute bottom-3 text-xs text-ink-muted">▼</span>
      <div
        className="size-12 rounded-full bg-ink shadow-float"
        style={{ transform: `translateY(${offset * (track / 2)}px)`, transition: dragging ? 'none' : 'transform 180ms ease-out' }}
      />
    </div>
  )
}
