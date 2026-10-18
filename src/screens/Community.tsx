import { useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
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
  relayYou,
} from '../data/relay'
import type { RelayCategory, RelayItem } from '../data/relay'
import { Avatar, CardRow, CategoryChip, CityMap, ListIcon, MapIcon, RecCard, SearchIcon, cx } from '../ui'
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

// Relay (Figma 265:2550): category filters, Baton's picks from her life, then
// tips from the legacies of people with a similar lifestyle; each card takes
// its category's color. The Map button slides the whole list down like a sheet
// (the AllTrails list/map pattern) to show the same picks as pins on a map.
export function Community() {
  const status = useStatus()
  const { relayMap: mapOpen, relayFilter } = useStore()
  const category = relayFilter as RelayCategory | null
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [pinned, setPinned] = useState<string | null>(null)
  const dragFrom = useRef<number | null>(null)
  const shown = (item: RelayItem) => (!category || item.category === category) && matches(item, query)
  const setCategory = (id: RelayCategory | null) => {
    setState({ relayFilter: id })
    setPinned(null)
  }
  const showMap = (on: boolean) => {
    setState({ relayMap: on })
    setPinned(null)
  }

  const picks = relayPicks(status).filter(shown)
  const people = leavers
    .map((leaver) => ({ leaver, tips: leaverTips(leaver.id).filter(shown) }))
    .filter((row) => row.tips.length > 0)
  const onMap = [...picks, ...people.flatMap((row) => row.tips)].filter((item) => item.map)
  const pinnedItem = onMap.find((item) => item.id === pinned)
  const headers = relayHeaders[status]

  return (
    <MainLayout bleed background="bg-baton-paper">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* The map, behind everything; the list slides down to show it */}
        <div className="absolute inset-0" inert={!mapOpen}>
          <CityMap
            you={relayYou}
            selected={pinned}
            onSelect={setPinned}
            pins={onMap.map((item) => ({ id: item.id, ...item.map!, tone: relayCategory(item.category).tone }))}
          />
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col">
          {/* Category filters, with search at the end */}
          <header
            className={cx(
              'pointer-events-auto flex shrink-0 flex-col gap-3 px-6 pb-3 pt-4 transition-colors duration-300',
              mapOpen ? 'bg-transparent' : 'bg-baton-paper',
            )}
          >
            <div className="-mx-6 flex items-center gap-[26px] pr-6">
              <div className="-my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 pl-6 pr-1 [scrollbar-width:none]">
                <CategoryChip selected={!category} onClick={() => setCategory(null)} className={mapOpen ? 'shadow-card' : undefined}>
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
          </header>

          {/* The list, as a sheet: slid down to a peek above the tab bar while the map shows */}
          <div className="relative min-h-0 flex-1">
            <div
              style={{ transform: mapOpen ? 'translateY(calc(100% - 200px))' : 'translateY(0)' }}
              className={cx(
                'pointer-events-auto absolute inset-0 bg-baton-paper transition-[transform,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                mapOpen && 'rounded-t-sheet shadow-float',
              )}
            >
              {mapOpen && (
                // Peek: tap or drag up to bring the list back
                <button
                  type="button"
                  onClick={() => showMap(false)}
                  onPointerDown={(event) => (dragFrom.current = event.clientY)}
                  onPointerUp={(event) => {
                    if (dragFrom.current !== null && dragFrom.current - event.clientY > 24) showMap(false)
                    dragFrom.current = null
                  }}
                  className="absolute inset-x-0 top-0 z-10 flex h-16 touch-none flex-col items-center gap-2.5 rounded-t-sheet bg-baton-paper pt-2"
                >
                  <span className="h-[5px] w-9 rounded-full bg-line" />
                  <span className="text-subhead font-semibold text-baton-navy">{relayCopy.onMap(onMap.length)}</span>
                </button>
              )}
              <div className={cx('flex h-full flex-col gap-10 px-6 pb-44 pt-6', mapOpen ? 'overflow-hidden' : 'overflow-y-auto')}>
                {picks.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className="whitespace-nowrap font-display text-section font-medium text-baton-navy">{headers.picks}</h2>
                    <CardRow gutter="lg">
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
                    <h2 className="whitespace-nowrap font-display text-section font-medium text-baton-navy">{headers.people}</h2>
                    {people.map(({ leaver, tips }) => (
                      <div key={leaver.id} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={leaver.name} src={relayPlaceholderAvatar} size="sm" />
                          <div className="min-w-0">
                            <p className="text-card-body text-ink">{relayCopy.legacy(leaver.name)}</p>
                            <p className="truncate text-[11px] leading-[1.2] text-ink/60">
                              {leaver.left} · {leaver.match}
                            </p>
                          </div>
                        </div>
                        <CardRow gutter="lg">
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
                  <p className="text-subhead text-ink-muted">{relayCopy.noResults}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* A tapped pin: a small card that opens the recommendation */}
        {mapOpen && pinnedItem && (
          <button
            type="button"
            onClick={() => open(pinnedItem.id)}
            className="absolute inset-x-6 bottom-[212px] z-20 flex items-center gap-3 rounded-card bg-surface p-2 pr-4 text-left shadow-float animate-fade-in"
          >
            <img src={pinnedItem.photo ?? relayPlaceholderPhoto} alt="" className="size-16 shrink-0 rounded-tile object-cover" />
            <div className="min-w-0">
              <p className="truncate font-display text-headline font-bold text-baton-navy">{pinnedItem.title}</p>
              <p className="line-clamp-2 text-footnote text-ink-muted">
                {pinnedItem.quote ? `“${pinnedItem.quote}”` : pinnedItem.source.kind === 'baton' ? pinnedItem.source.why : pinnedItem.body}
              </p>
            </div>
          </button>
        )}

        {/* Map / List, floating just above the tab bar */}
        <button
          type="button"
          onClick={() => showMap(!mapOpen)}
          className="absolute bottom-[103px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-baton-blue px-4 py-3 text-callout font-medium leading-[1.1] text-on-brand transition-transform active:scale-95"
        >
          {mapOpen ? <ListIcon /> : <MapIcon />}
          {mapOpen ? relayCopy.list : relayCopy.map}
        </button>
      </div>
    </MainLayout>
  )
}
