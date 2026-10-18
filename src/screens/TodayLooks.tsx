import type { ReactNode } from 'react'
import { useStatus } from '../app/store'
import { greeting, timeOfDay } from '../data/greetings'
import { setup } from '../data/onboarding'
import { dailyPrompts, promptMedium, promptMediumLabel, tabs } from '../data/pages'
import { chloe } from '../data/people'
import { todayCards } from '../data/stages'
import { beforeYouLeave, daysUntil, leave, mockToday, setupCards, suggestions } from '../data/today'
import {
  ArchiveIcon,
  AtIcon,
  Avatar,
  ChevronRightIcon,
  ListIcon,
  PencilIcon,
  PlaneIcon,
  PlusIcon,
  RelayIcon,
  SmallCameraIcon,
  StackIcon,
  TodayIcon,
  cx,
  todayLooks,
} from '../ui'
import type { TodayLookStyle } from '../ui'

// Team-only page (from the debug panel, or ?today-looks in the URL): Today in
// each candidate look side by side, phone-sized and scrollable, for her
// current stage (switch it in the debug panel).
export function TodayLooks({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-paper font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 bg-baton-paper/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-bold">Today looks</h1>
          <p className="text-subhead text-ink-muted">
            Today’s prompt in a glass circle, the rest on a panel below. Scroll each phone; switch the stage in the debug panel.
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
        {todayLooks.map((look, i) => (
          <section key={look.id} className="flex w-[390px] flex-col gap-3">
            <div>
              <h2 className="font-display text-title-3 font-bold">
                {i + 1}. {look.name}
              </h2>
              <p className="min-h-[40px] text-footnote text-ink-muted">{look.blurb}</p>
            </div>
            <TodayMock look={look} />
          </section>
        ))}
      </div>
    </div>
  )
}

const tabIcons: Record<string, ReactNode> = {
  today: <TodayIcon />,
  archive: <ArchiveIcon />,
  community: <RelayIcon />,
}

function TodayMock({ look }: { look: TodayLookStyle }) {
  const status = useStatus()
  const prompt = dailyPrompts[status][0]
  const medium = promptMedium(prompt.question)
  const hello = greeting(status, timeOfDay(), daysUntil(mockToday.normal, leave.defaultDate))

  const dark = look.pageTone === 'dark'
  const glassDark = look.glassTone === 'dark'
  const panelDark = look.panelTone === 'dark'
  const muted = panelDark ? 'text-baton-cream/60' : 'text-baton-navy/55'

  const setupItems = [
    { ...setup.items.archive, icon: <StackIcon /> },
    ...(status === 'local' ? [] : [{ ...setup.items.todos[status], icon: <ListIcon /> }]),
    ...(status === 'moving' ? [{ title: setupCards.leave.title, subtitle: setupCards.leave.subtitle, icon: <PlaneIcon /> }] : []),
    { ...setup.items.instagram, icon: <AtIcon /> },
  ]
  const cards = [
    ...todayCards[status].map((card) => ({ id: card.id, eyebrow: card.eyebrow, title: card.title, subtitle: card.subtitle })),
    ...suggestions.items[status].map((item) => ({ id: item.id, eyebrow: beforeYouLeave.suggested, title: item.title, subtitle: item.subtitle })),
  ]

  return (
    <div className={cx('relative h-[780px] overflow-hidden rounded-[48px] shadow-float', look.page)}>
      <div className="h-full overflow-y-auto [scrollbar-width:none]">
        {/* Top: greeting and the glass circle */}
        <div className="relative isolate overflow-hidden px-6 pb-12 pt-14">
          <Backdrop kind={look.backdrop} />

          <header className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className={cx('font-display text-large-title font-medium', dark ? 'text-baton-cream' : 'text-baton-navy')}>{hello.title}</h1>
              {hello.subtitle && (
                <p className={cx('font-display text-title-2', dark ? 'text-baton-cream/70' : 'text-baton-navy/60')}>{hello.subtitle}</p>
              )}
            </div>
            <span className="rounded-full p-1 shadow-float">
              <Avatar name={chloe.name} size="sm" />
            </span>
          </header>

          <div className="mt-8 flex flex-col items-center gap-4">
            <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-subhead font-semibold', look.label)}>
              {medium === 'photo' ? <SmallCameraIcon /> : <PencilIcon />}
              {promptMediumLabel[medium]}
            </span>

            {/* The outer hairline ring around the glass disc (Figma: 342 around 328) */}
            <div className={cx('relative aspect-square w-full rounded-full p-2', look.ring)}>
              <div className={cx('relative flex size-full items-center justify-center overflow-hidden rounded-full', look.glass)}>
                {look.backdrop === 'photo' && (
                  <>
                    <img src="/archive/la-sunset.jpg" alt="" className="absolute inset-0 size-full scale-150 object-cover" />
                    <span aria-hidden className="absolute inset-0 bg-baton-navy/35" />
                    {/* The photo covers the disc's own inset rim, so draw it again on top */}
                    <span aria-hidden className={cx('absolute inset-0 rounded-full', look.glass)} />
                  </>
                )}
                {/* Specular highlight on the top left, like light on a bubble */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-[14%] top-[7%] h-[22%] w-[46%] -rotate-[24deg] rounded-[50%] bg-linear-to-b from-white/70 to-white/0 blur-[2px]"
                />
                <p
                  className={cx(
                    'relative px-10 text-center font-display text-[25px] leading-[1.15] font-medium tracking-[-0.01em] text-balance',
                    glassDark ? 'text-white' : 'text-baton-navy',
                  )}
                >
                  {prompt.question}
                </p>
              </div>
            </div>

            <p className={cx('text-subhead', dark ? 'text-baton-cream/70' : 'text-baton-navy/55')}>{prompt.seed}</p>
          </div>
        </div>

        {/* Bottom: everything else on a panel of another color */}
        <div className={cx('relative -mt-4 flex min-h-[420px] flex-col gap-7 rounded-t-[48px] px-5 pb-32 pt-8', look.panel)}>
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between px-1">
              <h2 className={cx('font-display text-title-3 font-semibold', panelDark ? 'text-baton-cream' : 'text-baton-navy')}>
                {setup.header}
              </h2>
              <span className={cx('text-footnote', muted)}>{setupCards.progress(0, setupItems.length)}</span>
            </div>
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 [scrollbar-width:none]">
              {setupItems.map((item) => (
                <div key={item.title} className={cx('flex w-40 shrink-0 flex-col gap-5 rounded-card p-4', look.setupCard)}>
                  <span
                    className={cx(
                      'inline-flex size-9 items-center justify-center rounded-full [&_svg]:size-5',
                      panelDark ? 'bg-baton-cream/15 text-baton-cream' : 'bg-white/80 text-baton-navy',
                    )}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className={cx('text-headline font-semibold', panelDark ? 'text-baton-cream' : 'text-baton-navy')}>{item.title}</p>
                    <p className={cx('text-footnote', muted)}>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={cx('px-1 font-display text-title-3 font-semibold', panelDark ? 'text-baton-cream' : 'text-baton-navy')}>
              {beforeYouLeave.header[status]}
            </h2>
            {cards.map((card) => (
              <div key={card.id} className={cx('flex items-center gap-3 rounded-card p-3', look.card)}>
                <div aria-hidden className={cx('size-14 shrink-0 rounded-tile', panelDark ? 'bg-baton-cream/15' : 'bg-baton-navy/8')} />
                <div className="min-w-0 flex-1">
                  {card.eyebrow && <p className={cx('text-caption font-semibold uppercase', muted)}>{card.eyebrow}</p>}
                  <p className={cx('text-headline font-semibold', panelDark ? 'text-baton-cream' : 'text-baton-navy')}>{card.title}</p>
                  {card.subtitle && <p className={cx('text-footnote', muted)}>{card.subtitle}</p>}
                </div>
                <span className={muted}>
                  <ChevronRightIcon />
                </span>
              </div>
            ))}
          </section>
        </div>
      </div>

      <StaticTabBar />
    </div>
  )
}

// What the glass sits on, behind the greeting and the circle
function Backdrop({ kind }: { kind: TodayLookStyle['backdrop'] }) {
  if (kind === 'blobs')
    return (
      <div aria-hidden className="absolute inset-0 -z-10">
        <span className="absolute left-[-10%] top-[34%] size-56 rounded-full bg-baton-pink blur-2xl" />
        <span className="absolute right-[-12%] top-[44%] size-60 rounded-full bg-baton-blue/80 blur-2xl" />
        <span className="absolute left-[30%] top-[66%] size-44 rounded-full bg-baton-yellow blur-2xl" />
      </div>
    )
  if (kind === 'sun')
    return (
      <div aria-hidden className="absolute inset-0 -z-10">
        <span className="absolute left-1/2 top-[50%] size-80 -translate-x-1/2 rounded-full bg-radial from-white from-10% via-baton-yellow to-baton-yellow/0 to-70%" />
      </div>
    )
  if (kind === 'photo')
    return (
      <div aria-hidden className="absolute inset-0 -z-10">
        <img src="/archive/la-sunset.jpg" alt="" className="size-full scale-110 object-cover blur-xl" />
        <span className="absolute inset-0 bg-baton-olive/40" />
        <span className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-baton-olive/0 to-baton-olive" />
      </div>
    )
  return null
}

// The nav as a picture (Figma 258:1523), so each phone looks complete
function StaticTabBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center gap-2.5">
      <div className="flex rounded-full bg-glass p-1 shadow-glass backdrop-blur-xl">
        {tabs.map((tab) => (
          <span
            key={tab.id}
            className={cx(
              'flex w-[65px] flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold [&_svg]:size-5',
              tab.id === 'today' ? 'bg-white text-baton-blue' : 'text-tab-idle',
            )}
          >
            {tabIcons[tab.id]}
            {tab.label}
          </span>
        ))}
      </div>
      <span className="flex size-[58px] items-center justify-center rounded-full bg-glass text-tab-idle shadow-glass backdrop-blur-xl">
        <PlusIcon />
      </span>
    </div>
  )
}
