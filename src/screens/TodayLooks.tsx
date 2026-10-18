import { setState, useStatus, useStore } from '../app/store'
import { greeting, timeOfDay } from '../data/greetings'
import { setup } from '../data/onboarding'
import { dailyPrompts, promptMedium, promptMediumLabel } from '../data/pages'
import { chloe } from '../data/people'
import { daysUntil, leave, mockToday } from '../data/today'
import { Avatar, PromptWindow, cx, promptGlasses } from '../ui'

// Team-only page (from the debug panel, or ?today-looks in the URL): the top
// of Today with each way of drawing the prompt circle side by side, for her
// current stage (switch it in the debug panel). "Use in Today" puts that one
// on the real Today page.
export function TodayLooks({ onClose }: { onClose: () => void }) {
  const status = useStatus()
  const { promptGlass } = useStore()
  const prompt = dailyPrompts[status][0]
  const medium = promptMedium(prompt.question)
  const hello = greeting(status, timeOfDay(), daysUntil(mockToday.normal, leave.defaultDate))

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-paper font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 bg-baton-paper/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-bold">Today looks</h1>
          <p className="text-subhead text-ink-muted">
            The prompt circle in React Bits Fluid Glass. Move the pointer over each circle. “Use in Today” puts that one on the real page.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-baton-navy px-4 py-2 text-subhead font-semibold text-on-brand hover:opacity-90"
        >
          Close
        </button>
      </header>

      <div className="flex flex-wrap justify-center gap-8 px-6 pb-10 pt-2">
        {promptGlasses.map((option, i) => {
          const inUse = promptGlass === option.id
          return (
            <section key={option.id} className="flex w-[390px] flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-title-3 font-bold">
                    {i + 1}. {option.name}
                  </h2>
                  <p className="min-h-[40px] text-footnote text-ink-muted">{option.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setState({ promptGlass: option.id })}
                  className={cx(
                    'shrink-0 rounded-full px-3 py-1.5 text-footnote font-semibold',
                    inUse ? 'bg-baton-blue text-baton-navy' : 'bg-baton-chip text-ink hover:bg-surface-muted',
                  )}
                >
                  {inUse ? 'In Today' : 'Use in Today'}
                </button>
              </div>

              {/* The top of Today, down to where the cream panel starts */}
              <div className="relative h-[700px] overflow-hidden rounded-[48px] bg-baton-paper shadow-float">
                <div className="px-4 pt-14">
                  <header className="flex items-start gap-3 pb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-large-title font-bold text-ink">{hello.title}</h3>
                      {hello.subtitle && <p className="font-display text-title-3 text-ink-muted">{hello.subtitle}</p>}
                    </div>
                    <span className="rounded-full shadow-float">
                      <Avatar name={chloe.name} size="sm" />
                    </span>
                  </header>
                  <PromptWindow
                    className="pb-10 pt-2"
                    question={prompt.question}
                    seed={prompt.seed}
                    medium={medium}
                    mediumLabel={promptMediumLabel[medium]}
                    glass={option.id}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-panel bg-baton-cream px-5 pt-7">
                  <p className="text-footnote uppercase text-ink-muted">{setup.header}</p>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
