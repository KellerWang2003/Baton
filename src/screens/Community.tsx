import { useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import {
  leavers,
  leaverTips,
  relayCategories,
  relayCategory,
  relayCopy,
  relayHeaders,
  relayPicks,
  relayPlaceholderAvatar,
  relayPlaceholderPhoto,
} from '../data/relay'
import type { RelayCategory, RelayItem } from '../data/relay'
import { Avatar, CardRow, CategoryChip, RecCard, SearchIcon } from '../ui'
import { MainLayout } from './MainLayout'

function open(id: string) {
  setState({ selectedRec: id })
  navigate('relay-detail')
}

function matches(item: RelayItem, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [item.title, item.quote, relayCategory(item.category).label, item.place, item.body].some((text) => text?.toLowerCase().includes(q))
}

// Relay (Figma 265:2550): For you has category filters, Baton's picks from her
// life, then tips from the legacies of people with a similar lifestyle; each
// card takes its category's color.
export function Community() {
  const status = useStatus()
  const [category, setCategory] = useState<RelayCategory | null>(null)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const shown = (item: RelayItem) => (!category || item.category === category) && matches(item, query)

  const picks = relayPicks(status).filter(shown)
  const people = leavers
    .map((leaver) => ({ leaver, tips: leaverTips(leaver.id).filter(shown) }))
    .filter((row) => row.tips.length > 0)
  const headers = relayHeaders[status]

  return (
    <MainLayout background="bg-baton-paper">
      <div className="flex flex-col gap-6 pt-1">
        {/* Category filters, with search at the end */}
        <div className="flex flex-col gap-3">
          <div className="-mx-4 flex items-center gap-2 pr-4">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pl-4 [scrollbar-width:none]">
              <CategoryChip selected={!category} onClick={() => setCategory(null)}>
                {relayCopy.all}
              </CategoryChip>
              {relayCategories.map((item) => (
                <CategoryChip
                  key={item.id}
                  tone={item.tone}
                  selected={category === item.id}
                  onClick={() => setCategory(category === item.id ? null : item.id)}
                >
                  {item.label}
                </CategoryChip>
              ))}
            </div>
            <button
              type="button"
              aria-label="Search"
              aria-pressed={searching}
              onClick={() => {
                setSearching((on) => !on)
                setQuery('')
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-baton-chip text-ink active:opacity-60"
            >
              <SearchIcon className="size-[18px]" />
            </button>
          </div>
          {searching && (
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={relayCopy.searchPlaceholder}
              className="w-full rounded-full bg-baton-chip px-5 py-2.5 text-body text-ink outline-none placeholder:text-ink-muted"
            />
          )}
        </div>

        {picks.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-title-2 font-medium text-baton-navy">{headers.picks}</h2>
            <CardRow>
              {picks.map((item) => (
                <RecCard
                  key={item.id}
                  title={item.title}
                  text={item.source.kind === 'baton' ? item.source.why : item.body}
                  tone={relayCategory(item.category).tone}
                  photo={item.photo ?? relayPlaceholderPhoto}
                  onClick={() => open(item.id)}
                />
              ))}
            </CardRow>
          </section>
        )}

        {people.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-title-2 font-medium text-baton-navy">{headers.people}</h2>
            {people.map(({ leaver, tips }) => (
              <div key={leaver.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={leaver.name} src={relayPlaceholderAvatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-subhead text-ink">{relayCopy.legacy(leaver.name)}</p>
                    <p className="truncate text-caption text-ink/60">
                      {leaver.left} · {leaver.match}
                    </p>
                  </div>
                </div>
                <CardRow>
                  {tips.map((item) => (
                    <RecCard
                      key={item.id}
                      size="sm"
                      title={item.title}
                      text={`“${item.quote ?? item.body}”`}
                      tone={relayCategory(item.category).tone}
                      photo={item.photo ?? relayPlaceholderPhoto}
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
      </div>
    </MainLayout>
  )
}
