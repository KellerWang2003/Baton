import { Fragment } from 'react'
import { goBack, navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { findLeaver, leavers, leaverTips, relayCategories, relayCategory, relayCopy, relayPicks, relayPlaceholderPhoto, relaySearchSuggestions } from '../data/relay'
import type { RelayCategory, RelayItem } from '../data/relay'
import { BackButton, CategoryChip, SearchIcon, ToneTile, cx, relayChipIdle, relayPage } from '../ui'

const words = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean)

// Every word she typed shows up somewhere on the pick: its name, words, place,
// category or the person who left it
function matches(item: RelayItem, query: string) {
  const leaver = item.source.kind === 'leaver' ? findLeaver(item.source.leaver)?.name : undefined
  const why = item.source.kind === 'baton' ? item.source.why : undefined
  const text = [item.title, item.quote, item.place, item.body, why, leaver, relayCategory(item.category).label]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return words(query).every((word) => text.includes(word))
}

// The typed words in the title, in the brand blue
function Highlight({ text, query }: { text: string; query: string }) {
  const found = words(query).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!found.length) return text
  const parts = text.split(new RegExp(`(${found.join('|')})`, 'gi'))
  return parts.map((part, i) => (i % 2 ? <mark key={i} className="bg-transparent text-brand">{part}</mark> : <Fragment key={i}>{part}</Fragment>))
}

// Relay's search, on its own page like search in iOS apps: the field is focused
// as it opens, recent and suggested searches wait under it, and results come in
// live as she types. Back goes to Relay; a result opens its detail page, whose
// back returns here with the search as she left it.
export function RelaySearch() {
  const status = useStatus()
  const { relayQuery: query, relaySearches, relayLook } = useStore()
  const setQuery = (relayQuery: string) => setState({ relayQuery })
  const remember = (text: string) => {
    const q = text.trim()
    if (q) setState((s) => ({ relaySearches: [q, ...s.relaySearches.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5) }))
  }
  const open = (item: RelayItem) => {
    remember(query)
    setState({ selectedRec: item.id })
    navigate('relay-detail')
  }
  const browse = (id: RelayCategory) => {
    setState({ relayFilter: id, relayQuery: '' })
    goBack()
  }

  const everything = [...relayPicks(status), ...leavers.flatMap((leaver) => leaverTips(leaver.id))]
  const results = query.trim() ? everything.filter((item) => matches(item, query)) : []

  return (
    <div className={cx('flex h-full flex-col', relayPage[relayLook])}>
      {/* The field, with the one back arrow beside it */}
      <div className="flex shrink-0 items-center gap-1 pt-2 pr-gutter pl-2">
        <BackButton
          onClick={() => {
            setQuery('')
            goBack()
          }}
        />
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            remember(query)
            ;(document.activeElement as HTMLElement | null)?.blur()
          }}
          className={cx('flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full pr-1.5 pl-4', relayChipIdle[relayLook])}
        >
          <SearchIcon className="size-[18px] shrink-0 text-ink-muted" />
          <input
            autoFocus
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={relayCopy.searchPlaceholder}
            aria-label={relayCopy.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear"
              onClick={(event) => {
                setQuery('')
                event.currentTarget.form?.querySelector('input')?.focus()
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full active:opacity-50"
            >
              <span className="flex size-[18px] items-center justify-center rounded-full bg-ink-faint text-[11px] leading-none text-baton-paper">✕</span>
            </button>
          )}
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-gutter pt-5 pb-12">
        {!query.trim() ? (
          <div key="start" className="flex flex-col gap-8 animate-fade-in">
            {relaySearches.length > 0 && (
              <section className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-card-title font-medium text-ink">{relayCopy.searchRecent}</h2>
                  <button type="button" onClick={() => setState({ relaySearches: [] })} className="text-subhead text-brand active:opacity-50">
                    {relayCopy.searchClear}
                  </button>
                </div>
                <ul className="flex flex-col">
                    {relaySearches.map((text) => (
                      <li key={text} className="border-b border-ink/10 last:border-0">
                        <button type="button" onClick={() => setQuery(text)} className="flex w-full items-center gap-3 py-3 text-left text-body text-ink active:opacity-50">
                          <SearchIcon className="size-4 shrink-0 text-ink-faint" />
                          {text}
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="font-display text-card-title font-medium text-ink">{relayCopy.searchSuggested}</h2>
              <div className="flex flex-wrap gap-2">
                {relaySearchSuggestions.map((text) => (
                  <CategoryChip key={text} look={relayLook} onClick={() => setQuery(text)} className="px-5">
                    {text}
                  </CategoryChip>
                ))}
              </div>
            </section>

            {/* A category goes back to Relay with that filter on */}
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-card-title font-medium text-ink">{relayCopy.searchBrowse}</h2>
              <div className="flex flex-wrap gap-2">
                {relayCategories.map((item) => (
                  <CategoryChip key={item.id} tone={item.tone} selected look={relayLook} onClick={() => browse(item.id)} className="px-5">
                    {item.label}
                  </CategoryChip>
                ))}
              </div>
            </section>
          </div>
        ) : results.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-footnote text-ink-muted">{relayCopy.searchResults(results.length)}</p>
            <ul className="flex flex-col gap-3">
              {results.map((item) => {
                const category = relayCategory(item.category)
                const leaver = item.source.kind === 'leaver' ? findLeaver(item.source.leaver) : undefined
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className="flex w-full items-center gap-3 rounded-card bg-card p-2 pr-4 text-left shadow-card transition active:scale-[0.98]"
                    >
                      <ToneTile tone={category.tone} src={item.photo ?? relayPlaceholderPhoto} alt="" className="size-16 shrink-0 rounded-tile" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-headline font-medium text-ink">
                          <Highlight text={item.title} query={query} />
                        </p>
                        <p className="truncate text-footnote text-ink-muted">
                          {category.label} · {leaver ? relayCopy.legacy(leaver.name) : relayCopy.pickedBy}
                        </p>
                        {item.place && <p className="truncate text-footnote text-ink-muted">{item.place}</p>}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <p className="pt-2 text-subhead text-ink-muted">{relayCopy.searchNone(query.trim())}</p>
        )}
      </div>
    </div>
  )
}
