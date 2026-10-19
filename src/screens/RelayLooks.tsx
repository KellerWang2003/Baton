import { setState, useStatus, useStore } from '../app/store'
import { leavers, leaverTips, relayCategories, relayCopy, relayHeaders, relayPicks } from '../data/relay'
import { CategoryChip, SearchIcon, cx, relayChipIdle, relayLooks, relayPage } from '../ui'
import { RelayFeed } from './RelayFeed'

// Team-only page (from the debug panel, or ?relay-looks in the URL): Relay in
// each candidate look side by side, phone-sized and scrollable. "Use in Relay"
// makes that look the real Relay page's, so it can be tried in the app.
export function RelayLooks({ onClose }: { onClose: () => void }) {
  const status = useStatus()
  const { relayLook } = useStore()
  const picks = relayPicks(status)
  const people = leavers.map((leaver) => ({ leaver, tips: leaverTips(leaver.id) })).filter((row) => row.tips.length > 0)

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-paper font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 bg-baton-paper/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-medium">Relay looks</h1>
          <p className="text-subhead text-ink-muted">Scroll each phone up and down and sideways. “Use in Relay” puts that look on the real page.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-baton-navy px-4 py-2 text-subhead font-medium text-on-brand hover:opacity-90"
        >
          Close
        </button>
      </header>

      <div className="flex flex-wrap justify-center gap-8 px-6 pb-10 pt-2">
        {relayLooks.map((look, i) => {
          const inUse = relayLook === look.id
          return (
            <section key={look.id} className="flex w-[390px] flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-title-3 font-medium">
                    {i + 1}. {look.name}
                  </h2>
                  <p className="min-h-[40px] text-footnote text-ink-muted">{look.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setState({ relayLook: look.id })}
                  className={cx(
                    'shrink-0 rounded-full px-3 py-1.5 text-footnote font-medium',
                    inUse ? 'bg-baton-blue text-on-brand' : 'bg-baton-chip text-ink hover:bg-surface-muted',
                  )}
                >
                  {inUse ? 'In Relay' : 'Use in Relay'}
                </button>
              </div>
              <div className={cx('@container h-[760px] overflow-hidden rounded-[48px] shadow-float', relayPage[look.id])}>
                <div className="flex h-full flex-col gap-10 overflow-y-auto px-6 pb-16 pt-6 [scrollbar-width:none]">
                  <div className="-mx-6 -mb-4 flex items-center gap-3 pr-6">
                    <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pl-6 [scrollbar-width:none]">
                      <CategoryChip look={look.id} selected>
                        {relayCopy.all}
                      </CategoryChip>
                      {relayCategories.map((category) => (
                        <CategoryChip key={category.id} look={look.id} tone={category.tone}>
                          {category.label}
                        </CategoryChip>
                      ))}
                    </div>
                    <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full', relayChipIdle[look.id])}>
                      <SearchIcon className="size-[18px]" />
                    </span>
                  </div>
                  <RelayFeed look={look.id} headers={relayHeaders[status]} picks={picks} people={people} onOpen={() => {}} />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
