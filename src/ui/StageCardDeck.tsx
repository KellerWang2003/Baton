import { useEffect, useRef } from 'react'
import { about } from '../data/onboarding'
import type { Stage } from '../flow'

const artwork: Record<Stage, string> = {
  moving: '/onboarding/moving-truck.png',
  newcomer: '/onboarding/just-arrived.png',
  local: '/onboarding/settled-in.png',
}
const stages: Stage[] = ['moving', 'newcomer', 'local']

// Mouse and pen drags move the top card with the pointer, then throw it to the back of the deck.
const DRAG_START = 4
const THROW_DISTANCE = 90
const THROW_SPEED = 0.45 // px per ms
const THROW_MS = 170

// The phone frame can be scaled down, so pointer distances are divided by its scale to keep the card under the pointer.
type Drag = { x: number; y: number; scale: number; dx: number; samples: { x: number; t: number }[]; moved: boolean }

export function StageCardDeck({ value, onChange }: { value: Stage; onChange: (stage: Stage) => void }) {
  const deck = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<number | null>(null)
  const drag = useRef<Drag | null>(null)
  const swiped = useRef(false)
  const throwing = useRef(false)
  const selected = stages.indexOf(value)
  const advance = (direction: number) => onChange(stages[(selected + direction + stages.length) % stages.length])
  const focusCard = (index: number) => deck.current?.querySelectorAll<HTMLButtonElement>('button')[index]?.focus({ preventScroll: true })

  const setDrag = (x: number, y: number) => {
    const style = deck.current?.style
    if (!style) return
    style.setProperty('--drag-x', `${x}px`)
    style.setProperty('--drag-y', `${y}px`)
    style.setProperty('--drag-tilt', `${Math.max(-12, Math.min(12, x * 0.05))}deg`)
  }
  const clearDrag = () => {
    const el = deck.current
    if (!el) return
    delete el.dataset.dragging
    delete el.dataset.throwing
    el.style.removeProperty('--drag-x')
    el.style.removeProperty('--drag-y')
    el.style.removeProperty('--drag-tilt')
  }
  const throwCard = (sign: number) => {
    const el = deck.current
    if (!el) return
    throwing.current = true
    delete el.dataset.dragging
    el.dataset.throwing = ''
    setDrag(sign * 340, 0)
    window.setTimeout(() => {
      clearDrag()
      throwing.current = false
      const next = (selected + (sign < 0 ? 1 : -1) + stages.length) % stages.length
      onChange(stages[next])
      focusCard(next)
    }, THROW_MS)
  }

  // Two-finger trackpad swipes: one card per gesture, and no browser back swipe.
  const wheel = useRef({ sum: 0, locked: false, timer: 0 })
  const advanceRef = useRef(advance)
  useEffect(() => { advanceRef.current = advance })
  useEffect(() => {
    const el = deck.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const state = wheel.current
      window.clearTimeout(state.timer)
      state.timer = window.setTimeout(() => { state.sum = 0; state.locked = false }, 180)
      if (state.locked) return
      state.sum += event.deltaX
      if (Math.abs(state.sum) > 50) {
        state.locked = true
        advanceRef.current(state.sum > 0 ? 1 : -1)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={deck}
      className="onboarding-deck"
      role="radiogroup"
      aria-label="Where are you in your move?"
      onPointerDown={(event) => {
        swiped.current = false
        if (event.pointerType === 'touch') {
          pointerStart.current = event.clientX
          return
        }
        if (event.button !== 0 || throwing.current) return
        event.preventDefault()
        const scale = event.currentTarget.getBoundingClientRect().width / event.currentTarget.offsetWidth || 1
        drag.current = { x: event.clientX, y: event.clientY, scale, dx: 0, samples: [{ x: event.clientX, t: event.timeStamp }], moved: false }
      }}
      onPointerMove={(event) => {
        const d = drag.current
        if (!d) return
        d.dx = (event.clientX - d.x) / d.scale
        const dy = (event.clientY - d.y) / d.scale
        if (!d.moved) {
          if (Math.hypot(d.dx, dy) < DRAG_START) return
          d.moved = true
          swiped.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          event.currentTarget.dataset.dragging = ''
        }
        d.samples = [...d.samples.filter((s) => event.timeStamp - s.t < 80), { x: event.clientX, t: event.timeStamp }]
        setDrag(d.dx, dy * 0.15)
      }}
      onPointerUp={(event) => {
        if (event.pointerType === 'touch') {
          if (pointerStart.current !== null && Math.abs(event.clientX - pointerStart.current) > 35) {
            swiped.current = true
            advance(event.clientX < pointerStart.current ? 1 : -1)
          }
          pointerStart.current = null
          return
        }
        const d = drag.current
        drag.current = null
        if (!d) return
        d.dx = (event.clientX - d.x) / d.scale
        if (!d.moved) {
          if (Math.abs(d.dx) < DRAG_START) return
          swiped.current = true
        }
        const first = d.samples[0]
        const velocity = event.timeStamp > first.t ? (event.clientX - first.x) / d.scale / (event.timeStamp - first.t) : 0
        const flung = Math.abs(velocity) > THROW_SPEED && Math.sign(velocity) === Math.sign(d.dx) && Math.abs(d.dx) > 12
        if (Math.abs(d.dx) > THROW_DISTANCE || flung) throwCard(Math.sign(d.dx))
        else clearDrag()
      }}
      onPointerCancel={() => {
        pointerStart.current = null
        drag.current = null
        clearDrag()
      }}
      onKeyDown={(event) => {
        swiped.current = false
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          event.preventDefault()
          event.stopPropagation()
          const next = (selected + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + stages.length) % stages.length
          onChange(stages[next])
          focusCard(next)
        }
      }}
    >
      {about.moveOptions.map((option, index) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          aria-label={option.label}
          tabIndex={option.id === value ? 0 : -1}
          data-stage-card={option.id}
          data-position={(index - selected + stages.length) % stages.length}
          className="onboarding-stage-card"
          onClick={(event) => {
            // A swipe already selected the next card on pointer-up.
            if (swiped.current) return
            onChange(option.id)
            // Keep focus in the deck after a mouse click so the arrow keys keep flipping cards.
            if (event.detail > 0) focusCard(index)
          }}
        >
          <span className="onboarding-stage-art"><img src={artwork[option.id]} alt="" draggable={false} /></span>
          <span className="onboarding-stage-label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
