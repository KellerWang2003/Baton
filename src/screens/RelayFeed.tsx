import { relayCategory, relayCopy, relayAvatar, relayPlaceholderPhoto } from '../data/relay'
import type { ReactNode } from 'react'
import type { RelayItem, RelayLeaver } from '../data/relay'
import { Avatar, CardRow, RecCard, cx, relaySection } from '../ui'
import type { RelayLook } from '../ui'

type RelayFeedProps = {
  look: RelayLook
  headers: { picks: string; people: string }
  picks: RelayItem[]
  people: { leaver: RelayLeaver; tips: RelayItem[] }[]
  onOpen: (id: string) => void
}

// Relay's two sections under the filters: Baton's picks from her life, then
// rows of tips from the legacies of people with a similar lifestyle. Shared by
// the Relay page and the Relay looks playground.
export function RelayFeed({ look, headers, picks, people, onOpen }: RelayFeedProps) {
  const pickStyle = relaySection(look, 'picks')
  const peopleStyle = relaySection(look, 'people')
  return (
    <>
      {picks.length > 0 && (
        <section data-relay-feed className={cx('flex flex-col gap-4', pickStyle.section)}>
          <h2 className={cx('whitespace-nowrap font-display text-section font-medium', pickStyle.heading)}>{headers.picks}</h2>
          <CardRow gutter="lg">
            {picks.map((item, i) => (
              <RelayCardEntrance key={item.id}>
                <RecCard
                  look={look}
                  index={i}
                  title={item.title}
                  text={item.source.kind === 'baton' ? item.source.why : item.body}
                  tone={relayCategory(item.category).tone}
                  label={relayCategory(item.category).label}
                  photo={item.photo ?? relayPlaceholderPhoto}
                  from={relayCopy.pickedBy}
                  onClick={() => onOpen(item.id)}
                />
              </RelayCardEntrance>
            ))}
          </CardRow>
        </section>
      )}

      {people.length > 0 && (
        <section data-relay-feed className={cx('flex flex-col gap-4', peopleStyle.section)}>
          <h2 className={cx('whitespace-nowrap font-display text-section font-medium', peopleStyle.heading)}>{headers.people}</h2>
          {people.map(({ leaver, tips }) => (
            <div key={leaver.id} className="flex flex-col gap-4 not-first-of-type:mt-4">
              <div data-relay-person className="flex items-center gap-3">
                <Avatar name={leaver.name} src={relayAvatar(leaver.name)} size="sm" />
                <div className="min-w-0">
                  <p className="text-card-body text-ink">{relayCopy.legacy(leaver.name)}</p>
                  <p className="truncate text-[11px] leading-[1.2] text-ink/60">
                    {leaver.left} · {leaver.match}
                  </p>
                </div>
              </div>
              <CardRow gutter="lg">
                {tips.map((item, i) => (
                  <RelayCardEntrance key={item.id}>
                    <RecCard
                      look={look}
                      index={i + 1}
                      size="sm"
                      title={item.title}
                      text={`“${item.quote ?? item.body}”`}
                      tone={relayCategory(item.category).tone}
                      label={relayCategory(item.category).label}
                      photo={item.photo ?? relayPlaceholderPhoto}
                      from={relayCopy.legacy(leaver.name)}
                      onClick={() => onOpen(item.id)}
                    />
                  </RelayCardEntrance>
                ))}
              </CardRow>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

// Keep the snap anchor in layout; only its inner surface moves. Animating the
// anchor itself makes the browser follow it, then re-snap as the effect ends.
function RelayCardEntrance({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 snap-start [&_.snap-start]:[scroll-snap-align:none]">
      <div data-relay-enter>{children}</div>
    </div>
  )
}
