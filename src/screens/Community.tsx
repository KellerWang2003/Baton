import { useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { pages } from '../data/pages'
import { leavers, leaverTips, relayCopy, relayHeaders, relayPicks } from '../data/relay'
import type { RelayItem } from '../data/relay'
import { qa } from '../data/stages'
import type { CommunitySegment } from '../data/stages'
import { Avatar, Button, Card, CardRow, PickCard, SearchIcon, SegmentedControl, TipCard } from '../ui'
import { MainLayout } from './MainLayout'

const { segments } = pages.community

function open(id: string) {
  setState({ selectedRec: id })
  navigate('relay-detail')
}

function matches(item: RelayItem, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.title, item.quote, item.label, item.place, item.body].some((text) => text?.toLowerCase().includes(q))
}

// Relay: For you (Baton's picks from her routine, then tips from the legacies
// of people who lived like her) and Q&A, where Locals only answer.
export function Community() {
  const { communitySegment } = useStore()
  const status = useStatus()
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  const picks = relayPicks(status).filter((item) => matches(item, query))
  const people = leavers
    .map((leaver) => ({ leaver, tips: leaverTips(leaver.id).filter((item) => matches(item, query)) }))
    .filter((row) => row.tips.length > 0)
  const headers = relayHeaders[status]
  const questions = qa[status]

  return (
    <MainLayout background="bg-baton-paper">
      <div className="flex flex-col gap-6 pt-1">
        <div className="flex items-center gap-2">
          <SegmentedControl
            className="flex-1"
            segments={segments as { id: CommunitySegment; label: string }[]}
            value={communitySegment}
            onChange={(id) => setState({ communitySegment: id })}
          />
          {communitySegment === 'recs' && (
            <button
              type="button"
              aria-label="Search"
              aria-pressed={searching}
              onClick={() => {
                setSearching((on) => !on)
                setQuery('')
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink active:opacity-60"
            >
              <SearchIcon className="size-[18px]" />
            </button>
          )}
        </div>

        {communitySegment === 'recs' ? (
          <>
            {searching && (
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={relayCopy.searchPlaceholder}
                className="-mt-3 w-full rounded-full bg-surface px-4 py-2.5 text-body text-ink outline-none placeholder:text-ink-muted"
              />
            )}

            {picks.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="px-1 font-display text-title-2 font-bold text-baton-navy">{headers.picks}</h2>
                <CardRow>
                  {picks.map((item) => (
                    <PickCard
                      key={item.id}
                      title={item.title}
                      why={item.source.kind === 'baton' ? item.source.why : item.body}
                      label={item.label}
                      tone={item.tone}
                      photo={item.photo}
                      onClick={() => open(item.id)}
                    />
                  ))}
                </CardRow>
              </section>
            )}

            {people.length > 0 && (
              <section className="flex flex-col gap-5">
                <h2 className="px-1 font-display text-title-2 font-bold text-baton-navy">{headers.people}</h2>
                {people.map(({ leaver, tips }) => (
                  <div key={leaver.id} className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 px-1">
                      <Avatar name={leaver.name} size="sm" className="bg-baton-navy!" />
                      <div className="min-w-0">
                        <p className="text-headline font-semibold text-baton-navy">From {leaver.name}</p>
                        <p className="truncate text-footnote text-ink-muted">
                          {leaver.left} · {leaver.match}
                        </p>
                      </div>
                    </div>
                    <CardRow>
                      {tips.map((item) => (
                        <TipCard
                          key={item.id}
                          title={item.title}
                          quote={item.quote ?? item.body}
                          tone={item.tone}
                          photo={item.photo}
                          onClick={() => open(item.id)}
                        />
                      ))}
                    </CardRow>
                  </div>
                ))}
              </section>
            )}

            {picks.length === 0 && people.length === 0 && (
              <p className="px-1 text-subhead text-ink-muted">{relayCopy.noResults}</p>
            )}
          </>
        ) : (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-footnote uppercase text-ink-muted">{questions.header}</p>
              {questions.action === 'ask' && (
                <Button variant="tinted" size="sm">
                  Ask
                </Button>
              )}
            </div>
            {questions.questions.map((q) => (
              <Card key={q.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-headline font-semibold text-ink">{q.question}</p>
                  <p className="text-footnote text-ink-muted">{q.asker}</p>
                </div>
                {q.answer ? (
                  <div className="flex flex-col gap-0.5 rounded-tile bg-surface-muted p-3">
                    <p className="text-body text-ink">{q.answer.text}</p>
                    <p className="text-footnote text-ink-muted">{q.answer.from}</p>
                  </div>
                ) : questions.action === 'answer' ? (
                  <Button variant="stage" size="sm" className="self-start">
                    Answer
                  </Button>
                ) : (
                  <p className="text-footnote text-ink-muted">No answer yet</p>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </MainLayout>
  )
}
