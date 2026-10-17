import { useState } from 'react'
import { navigate } from '../app/navigate'
import { features } from '../data/onboarding'
import { Button, Steps } from '../ui'

// Feature overview before sign up: what Baton does, one idea per slide.
export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))

  return (
    <div className="flex h-full flex-col bg-canvas px-6 pb-8 pt-4">
      <div className="flex h-11 items-center justify-end">
        {!last && (
          <button type="button" onClick={() => navigate('signup')} className="px-2 py-1 text-body text-brand active:opacity-50">
            {features.skip}
          </button>
        )}
      </div>

      {/* Placeholder for each slide's illustration */}
      <div className="mt-2 aspect-square w-full rounded-card bg-surface-muted" />

      <div key={index} className="flex flex-1 flex-col gap-2 pt-8">
        <p className="text-footnote font-semibold uppercase text-ink-muted">{slide.eyebrow}</p>
        <p className="font-display text-title-1 font-bold text-ink">{slide.title}</p>
        <p className="text-body text-ink-muted">{slide.body}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Steps count={features.slides.length} current={index} />
        <Button block onClick={next}>
          {last ? features.start : features.next}
        </Button>
      </div>
    </div>
  )
}
