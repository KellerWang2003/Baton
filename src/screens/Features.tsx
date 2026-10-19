import { useState } from 'react'
import { navigate } from '../app/navigate'
import { features } from '../data/onboarding'
import { ArrowRightIcon, Button, Steps } from '../ui'

// Feature overview before sign up: what Baton does, one idea per slide. Each
// slide's image fills the whole screen, with the copy over it at the bottom.
export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))

  return (
    <div className="relative h-full overflow-hidden bg-canvas">
      {/* Placeholder for each slide's full-bleed image */}
      <div key={`image-${index}`} className="absolute inset-0 bg-surface-muted" />
      {/* Fades the image into the page so the copy stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-canvas via-canvas/90 to-transparent" />

      <div className="relative flex h-full flex-col justify-end px-6 pb-8">
        <div key={index} className="flex flex-col gap-2 pb-8">
          <p className="text-footnote font-medium text-ink-muted">{slide.eyebrow}</p>
          <p className="font-display text-title-1 font-normal text-ink">{slide.title}</p>
          <p className="text-body text-ink-muted">{slide.body}</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Steps count={features.slides.length} current={index} />
          <Button block variant="glow" size="cta" onClick={next}>
            {last ? features.start : features.next}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
