import { useRef } from 'react'
import { about } from '../data/onboarding'
import type { Stage } from '../flow'

const artwork: Record<Stage, string> = {
  moving: '/onboarding/moving-truck.png',
  newcomer: '/onboarding/just-arrived.png',
  local: '/onboarding/settled-in.png',
}
const stages: Stage[] = ['moving', 'newcomer', 'local']

export function StageCardDeck({ value, onChange }: { value: Stage; onChange: (stage: Stage) => void }) {
  const pointerStart = useRef<number | null>(null)
  const swiped = useRef(false)
  const selected = stages.indexOf(value)
  const advance = (direction: number) => onChange(stages[(selected + direction + stages.length) % stages.length])

  return (
    <div
      className="onboarding-deck"
      role="radiogroup"
      aria-label="Where are you in your move?"
      onPointerDown={(event) => { pointerStart.current = event.clientX; swiped.current = false }}
      onPointerUp={(event) => {
        if (pointerStart.current !== null && Math.abs(event.clientX - pointerStart.current) > 35) {
          swiped.current = true
          advance(event.clientX < pointerStart.current ? 1 : -1)
        }
        pointerStart.current = null
      }}
      onPointerCancel={() => { pointerStart.current = null }}
      onKeyDown={(event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          event.preventDefault()
          event.stopPropagation()
          const next = (selected + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + stages.length) % stages.length
          onChange(stages[next])
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
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
          onClick={() => {
            // A swipe already selected the next card on pointer-up.
            if (swiped.current) return
            onChange(option.id)
          }}
        >
          <span className="onboarding-stage-art"><img src={artwork[option.id]} alt="" draggable={false} /></span>
          <span className="onboarding-stage-label">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
