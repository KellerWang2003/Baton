import { useState } from 'react'
import { navigate } from '../app/navigate'
import { features, type FeatureStage } from '../data/onboarding'
import { archiveFolders } from '../data/stages'
import { ArrowRightIcon, BatonMark, Button, FolderStack, Steps } from '../ui'
import { cx } from '../ui/cx'

// Feature overview before sign up: Baton as a journey through the three
// stages, then the tagline. Stage slides sit on their stage color with a
// Moving > Newcomer > Local marker; one slide can carry a second layer of
// points under its title.
const stageBg: Record<FeatureStage, string> = {
  moving: 'bg-baton-pink',
  newcomer: 'bg-baton-yellow',
  local: 'bg-baton-olive',
}
const scrapTilt = ['-rotate-6', 'rotate-3']

export function Features() {
  const [index, setIndex] = useState(0)
  const slide = features.slides[index]
  const last = index === features.slides.length - 1
  const next = () => (last ? navigate('signup') : setIndex(index + 1))
  const onStage = slide.stage === 'local'

  return (
    <div className="relative h-full overflow-hidden bg-canvas">
      {slide.stage && (
        <div key={`art-${index}`} className={cx('absolute inset-x-0 top-0 h-[44%] rounded-b-[48px]', stageBg[slide.stage])}>
          <div className="flex justify-center gap-2 pt-6">
            {features.journey.map((s) => (
              <span
                key={s.id}
                className={cx(
                  'rounded-full px-3 py-1 text-footnote font-medium',
                  s.id === slide.stage ? (onStage ? 'bg-baton-cream text-baton-olive' : 'bg-baton-navy text-baton-cream') : onStage ? 'text-baton-cream/60' : 'text-baton-navy/50',
                )}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="relative mx-auto mt-4 h-40 w-56">
            {slide.photos?.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={cx(
                  'absolute size-32 rounded-2xl border-4 border-baton-cream object-cover shadow-lg',
                  scrapTilt[i],
                  i === 0 ? 'left-0 top-1' : 'right-0 top-9',
                )}
              />
            ))}
          </div>
        </div>
      )}
      {index === 0 && (
        // The real Archive folder stack, just to look at
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[56%] overflow-hidden">
          <div className="h-[161%] w-[161%] origin-top-left scale-[0.62]">
            <FolderStack className="bg-baton-paper" folders={archiveFolders()} initialId="la" onSelect={() => {}} />
          </div>
        </div>
      )}
      {last && (
        <div className="absolute inset-x-0 top-0 flex h-[44%] items-center justify-center">
          <BatonMark className="size-28 text-brand" />
        </div>
      )}

      <div className="relative flex h-full flex-col justify-end px-6 pb-8">
        <div key={index} className="flex flex-col gap-2 pb-8">
          <p className="text-footnote font-medium text-ink-muted">{slide.eyebrow}</p>
          <p className="font-display text-title-1 font-normal text-ink">{slide.title}</p>
          {slide.body && <p className="text-body text-ink-muted">{slide.body}</p>}
          {slide.points && (
            <div className="mt-2 flex flex-col gap-3">
              {slide.points.map((p) => (
                <div key={p.title} className="rounded-card bg-card p-4 shadow-card">
                  <p className="text-headline font-medium text-ink">{p.title}</p>
                  <p className="text-subhead text-ink-muted">{p.body}</p>
                </div>
              ))}
            </div>
          )}
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
