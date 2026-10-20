import { useRef, useState } from 'react'
import { cx } from '../ui'

// Team-only page (from the debug panel, or ?archive-ideas in the URL): other ways
// the Archive page itself could be built, instead of the stack of city folders.
// Each is a small phone-sized sketch with the same mock cities and photos.
const ph = (f: string) => `/archive/${f}.jpg`

type City = {
  id: string
  name: string
  years: string
  bg: string // folder color
  fg: string
  line: string
  photos: string[]
}

const cities: City[] = [
  {
    id: 'la',
    name: 'Los Angeles',
    years: '2022 – 2026',
    bg: 'bg-baton-blue',
    fg: 'text-baton-navy',
    line: 'You chase beautiful sunsets and late night street tacos. Once an introvert, now the life of every party.',
    photos: [ph('la-sunset'), ph('la-tacos-1'), ph('la-selfie'), ph('la-party-1'), ph('la-party-2'), ph('la-tacos-2')],
  },
  {
    id: 'chicago',
    name: 'Chicago',
    years: '2021',
    bg: 'bg-baton-olive',
    fg: 'text-baton-cream',
    line: 'You know the L by heart and every skyline rooftop. Brutal winters, perfect lake summers.',
    photos: [ph('chicago-l-train'), ph('chicago-rooftop-1'), ph('chicago-lake-1'), ph('chicago-rooftop-2'), ph('chicago-lake-2')],
  },
  {
    id: 'seoul',
    name: 'Seoul',
    years: 'Home',
    bg: 'bg-baton-cream',
    fg: 'text-baton-navy',
    line: 'Han River picnics, karaoke until 2am and every café in Seongsu.',
    photos: [ph('seoul-han-1'), ph('seoul-karaoke-1'), ph('seoul-cafe'), ph('seoul-han-2'), ph('seoul-karaoke-2')],
  },
]

const phone = 'relative h-[640px] w-[360px] shrink-0 overflow-hidden rounded-[36px] bg-baton-paper shadow-lg'
const title = (t: string, sub: string) => (
  <div className="px-[30px] pt-14">
    <p className="text-footnote text-ink-muted">{sub}</p>
    <h3 className="font-display text-greeting font-normal">{t}</h3>
  </div>
)

// 1. Full-bleed pages: one city per screen, swipe up for the next
function Pages() {
  return (
    <div className={cx(phone, 'snap-y snap-mandatory overflow-y-auto [scrollbar-width:none]')}>
      {cities.map((c) => (
        <div key={c.id} className={cx('relative flex h-full snap-start flex-col justify-end gap-4 p-[30px] pb-10', c.bg, c.fg)}>
          <img src={c.photos[0]} alt="" className="absolute inset-x-0 top-0 h-[55%] w-full object-cover" />
          <div className="relative">
            <p className="text-footnote opacity-70">{c.years}</p>
            <h3 className="font-display text-title-1">{c.name}</h3>
            <p className="mt-2 text-body">{c.line}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// 2. Route map: the cities as stops on a line she has traveled
const stops = [
  { id: 'seoul', x: 292, y: 150 },
  { id: 'chicago', x: 120, y: 260 },
  { id: 'la', x: 52, y: 360 },
]

function RouteMap() {
  const [id, setId] = useState('la')
  const c = cities.find((x) => x.id === id)!
  return (
    <div className={phone}>
      {title('Where you’ve lived', 'Tap a stop')}
      <svg viewBox="0 0 360 480" className="absolute inset-x-0 top-[100px] h-[420px] w-full">
        <path d="M292 150 Q 190 150 120 260 T 52 360" fill="none" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" className="stroke-baton-navy/40" />
        {stops.map((s) => {
          const city = cities.find((x) => x.id === s.id)!
          return (
            <g key={s.id} onClick={() => setId(s.id)} className="cursor-pointer">
              <circle cx={s.x} cy={s.y} r={id === s.id ? 26 : 16} className={cx('transition-all', city.bg.replace('bg-', 'fill-'))} />
              <text x={s.x} y={s.y + 46} textAnchor="middle" className="fill-baton-navy text-[14px]">{city.name}</text>
            </g>
          )
        })}
      </svg>
      <div className={cx('absolute inset-x-5 bottom-6 rounded-card p-4 shadow-md', c.bg, c.fg)}>
        <div className="flex gap-2">
          {c.photos.slice(0, 3).map((s) => (
            <img key={s} src={s} alt="" className="h-14 w-14 rounded-tile object-cover" />
          ))}
        </div>
        <p className="mt-2 text-subhead">{c.line}</p>
      </div>
    </div>
  )
}

// 3. Passport: a stamp per city, tap to open its page
function Passport() {
  const [open, setOpen] = useState<string | null>(null)
  const c = cities.find((x) => x.id === open)
  return (
    <div className={phone}>
      {title('Your passport', 'Every city you’ve carried')}
      <div className="mt-8 grid grid-cols-2 gap-6 px-[30px]">
        {cities.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setOpen(x.id)}
            className={cx(
              'flex aspect-square flex-col items-center justify-center rounded-full border-4 border-dashed border-baton-navy/40 text-center shadow-sm',
              x.bg,
              x.fg,
            )}
            style={{ transform: `rotate(${[-8, 6, -3][i]}deg)` }}
          >
            <span className="font-display text-title-3">{x.name}</span>
            <span className="text-caption opacity-70">{x.years}</span>
          </button>
        ))}
        <div className="flex aspect-square items-center justify-center rounded-full border-4 border-dashed border-baton-navy/20 text-center text-caption text-ink-faint">
          Next stop
        </div>
      </div>
      {c && (
        <div className="absolute inset-0 animate-note-stick bg-baton-paper/95 p-[30px] pt-14" onClick={() => setOpen(null)}>
          <h3 className="font-display text-title-1">{c.name}</h3>
          <p className="mt-2 text-body">{c.line}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {c.photos.map((s) => (
              <img key={s} src={s} alt="" className="aspect-square rounded-tile object-cover" />
            ))}
          </div>
          <p className="mt-6 text-center text-caption text-ink-muted">Tap anywhere to close</p>
        </div>
      )}
    </div>
  )
}

// 4. Wall: every photo pinned up at once; pick a city to pull its photos forward
const wall = cities.flatMap((c) => c.photos.slice(0, 4).map((src) => ({ src, city: c.id })))
const spots = wall.map((_, k) => ({
  x: (k * 97) % 230 + 10,
  y: (k * 61) % 330 + 10,
  r: ((k * 37) % 17) - 8,
}))

function Wall() {
  const [on, setOn] = useState<string | null>(null)
  return (
    <div className={phone}>
      {title('Everything on the wall', 'Pick a city')}
      <div className="relative mx-[20px] mt-3 h-[400px]">
        {wall.map((w, k) => (
          <img
            key={w.src}
            src={w.src}
            alt=""
            className="absolute h-[110px] w-[110px] rounded-tile border-4 border-baton-cream object-cover shadow-md transition-all duration-500"
            style={{
              left: spots[k].x,
              top: spots[k].y,
              transform: `rotate(${spots[k].r}deg) scale(${on === w.city ? 1.15 : 1})`,
              opacity: on && on !== w.city ? 0.25 : 1,
              zIndex: on === w.city ? 2 : 1,
              filter: on && on !== w.city ? 'blur(2px)' : 'none',
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-5 bottom-8 flex justify-center gap-2">
        {cities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOn(on === c.id ? null : c.id)}
            className={cx('rounded-full px-4 py-2 text-subhead font-medium shadow-sm', c.bg, c.fg, on === c.id && 'ring-2 ring-baton-navy')}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// 5. Timeline: one long river down the years, each city a colored band
function Timeline() {
  return (
    <div className={cx(phone, 'overflow-y-auto [scrollbar-width:none]')}>
      {title('Your years', 'Scroll down through time')}
      <div className="relative mt-6 px-[30px] pb-16">
        <div className="absolute bottom-0 left-[44px] top-0 w-1 rounded-full bg-baton-navy/15" />
        {[...cities].reverse().map((c) => (
          <div key={c.id} className="relative mb-6 pl-10">
            <span className={cx('absolute left-[-6px] top-1 size-6 rounded-full border-4 border-baton-paper', c.bg)} />
            <p className="text-footnote text-ink-muted">{c.years}</p>
            <h4 className="font-display text-title-3">{c.name}</h4>
            <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {c.photos.map((s) => (
                <img key={s} src={s} alt="" className="h-24 w-24 shrink-0 rounded-tile object-cover" />
              ))}
            </div>
            <p className="mt-2 text-subhead">{c.line}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 6. Cover flow: swipe sideways through big city cards
function CoverFlow() {
  return (
    <div className={phone}>
      {title('Swipe through your cities', 'Newest first')}
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[50px] pb-6 [scrollbar-width:none]">
        {cities.map((c) => (
          <div key={c.id} className={cx('w-[260px] shrink-0 snap-center rounded-[28px] p-4 shadow-lg', c.bg, c.fg)}>
            <img src={c.photos[0]} alt="" className="h-[260px] w-full rounded-card object-cover" />
            <h4 className="mt-3 font-display text-title-2">{c.name}</h4>
            <p className="text-footnote opacity-70">{c.years}</p>
            <p className="mt-2 text-subhead">{c.line}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 7. Mosaic: all photos in one tight grid, tinted by city; tap a color to filter
const mosaic = cities.flatMap((c) => c.photos.map((src) => ({ src, city: c })))
const sizes = ['col-span-2 row-span-2', '', '', 'row-span-2', '', 'col-span-2']

function Mosaic() {
  const [on, setOn] = useState<string | null>(null)
  return (
    <div className={phone}>
      {title('Everything at once', 'Tap a color to isolate a city')}
      <div className="mt-4 grid auto-rows-[78px] grid-cols-4 gap-1 px-[16px]">
        {mosaic.map((m, k) => (
          <div
            key={m.src}
            className={cx('relative overflow-hidden rounded-tile transition-opacity', sizes[k % sizes.length], on && on !== m.city.id && 'opacity-15')}
          >
            <img src={m.src} alt="" className="h-full w-full object-cover" />
            <span className={cx('absolute inset-x-0 bottom-0 h-1.5', m.city.bg)} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-5 bottom-6 flex justify-center gap-3">
        {cities.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.name}
            onClick={() => setOn(on === c.id ? null : c.id)}
            className={cx('size-10 rounded-full shadow-md', c.bg, on === c.id && 'ring-2 ring-baton-navy')}
          />
        ))}
      </div>
    </div>
  )
}

// 8. Deck: city cards stacked like postcards; flick the top one away
function Deck() {
  const [n, setN] = useState(0)
  return (
    <div className={phone}>
      {title('Your postcards', 'Tap the top card')}
      <div className="relative mx-auto mt-8 h-[380px] w-[290px]">
        {cities.map((c, k) => {
          const pos = (k - n + cities.length) % cities.length
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pos === 0 && setN((x) => x + 1)}
              className={cx('absolute inset-0 rounded-[24px] p-4 text-left shadow-lg transition-all duration-500', c.bg, c.fg)}
              style={{
                transform: `translateY(${pos * 16}px) scale(${1 - pos * 0.05}) rotate(${pos * 2 - 2}deg)`,
                zIndex: cities.length - pos,
              }}
            >
              <img src={c.photos[0]} alt="" className="h-[200px] w-full rounded-card object-cover" />
              <h4 className="mt-3 font-display text-title-2">{c.name}</h4>
              <p className="text-subhead">{c.line}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// 9. Scrubber wall: one huge horizontal wall of captures, oldest at the left. A
// gray timeline along the bottom (a shade per city) scrubs it, and tapping a
// capture opens its details. Barebone on purpose: gray boxes only.
const wallCities = [...cities].reverse()
const shade = { seoul: 'bg-neutral-200', chicago: 'bg-neutral-400', la: 'bg-neutral-600' } as Record<string, string>
const tile = { seoul: 'bg-neutral-300', chicago: 'bg-neutral-400', la: 'bg-neutral-500' } as Record<string, string>
const slots = wallCities.flatMap((c) => c.photos.concat(c.photos, c.photos, c.photos).map((_, k) => ({ city: c, k })))
const dims = [[96, 120], [130, 96], [80, 80], [110, 150], [150, 110]]
const wallItems = slots.map((sl, i) => {
  const [w, h] = dims[(i * 3) % dims.length]
  return { ...sl, i, w, h, x: 30 + i * 46, yf: (i * 0.618) % 1 }
})
const wallW = wallItems[wallItems.length - 1].x + 200

type WallItem = (typeof wallItems)[number]
// `fill` is the real Archive page (debug panel > Archive layout): fills its parent instead of a phone-sized sketch
export function ScrubberWall({ fill }: { fill?: boolean }) {
  const phoneEl = useRef<HTMLDivElement>(null)
  const wall = useRef<HTMLDivElement>(null)
    const [frac, setFrac] = useState(0)
  const [open, setOpen] = useState<{ item: WallItem; from: { x: number; y: number; w: number; h: number }; up: boolean } | null>(null)
  const wallRange = () => (wall.current ? wall.current.scrollWidth - wall.current.clientWidth : 1)
  const jump = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    // The frame's center follows the finger
    const f = Math.min(1, Math.max(0, ((e.clientX - r.left) / r.width - 0.13) / 0.74))
    if (wall.current) wall.current.scrollLeft = f * wallRange()
  }
  const here = wallItems[Math.round(frac * (wallItems.length - 1))].city

  const show = (item: WallItem, target: HTMLElement) => {
    const r = target.getBoundingClientRect()
    const p = phoneEl.current!.getBoundingClientRect()
    setOpen({ item, from: { x: r.left - p.left, y: r.top - p.top, w: r.width, h: r.height }, up: false })
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen((o) => o && { ...o, up: true })))
  }
  const hide = () => {
    setOpen((o) => o && { ...o, up: false })
    setTimeout(() => setOpen(null), 450)
  }
  const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

  return (
    <div className={fill ? 'relative h-full w-full overflow-hidden bg-baton-paper' : phone} ref={phoneEl}>
      {title(here.name, here.years)}
      <div ref={wall} className={cx('mt-4 overflow-x-auto overflow-y-hidden [scrollbar-width:none]', fill ? 'h-[calc(100%-270px)]' : 'h-[400px]')} onScroll={() => setFrac(wall.current ? wall.current.scrollLeft / wallRange() : 0)}>
        <div className="relative h-full" style={{ width: wallW }}>
          {wallItems.map((m) => (
            <button
              key={m.i}
              type="button"
              onClick={(e) => show(m, e.currentTarget)}
              className={cx('absolute border-2 border-white shadow-sm', tile[m.city.id])}
              style={{ left: m.x, top: 12 + m.yf * ((fill ? 600 : 400) - m.h - 36), width: m.w, height: m.h, transform: `rotate(${((m.i * 7) % 9) - 4}deg)`, opacity: open?.item.i === m.i ? 0 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Timeline: a slim strip, a shade per city; the frame shows what is on screen */}
      <div className={cx('absolute inset-x-[30px]', fill ? 'bottom-[108px]' : 'bottom-9')}>
        <div
          className="relative h-9 touch-none select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            jump(e)
          }}
          onPointerMove={(e) => e.buttons && jump(e)}
        >
          <div className="absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 gap-0.5 overflow-hidden rounded-full">
            {wallCities.map((c) => (
              <div key={c.id} className={shade[c.id]} style={{ flex: c.photos.length }} />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 rounded-full bg-white/40 shadow-md ring-1 ring-neutral-900/70 backdrop-blur-[1px]"
            style={{ width: '26%', left: `${frac * 74}%` }}
          />
        </div>
        <div className="mt-1.5 flex gap-0.5 text-caption text-ink-muted">
          {wallCities.map((c) => (
            <span key={c.id} style={{ flex: c.photos.length }} className="truncate text-center">
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <>
          <div className="absolute inset-0 bg-white transition-opacity duration-500" style={{ opacity: open.up ? 1 : 0 }} onClick={hide} />
          <div
            className={cx('pointer-events-none absolute rounded-card shadow-md', tile[open.item.city.id])}
            style={{
              left: open.up ? 30 : open.from.x,
              top: open.up ? 100 : open.from.y,
              width: open.up ? 300 : open.from.w,
              height: open.up ? 300 : open.from.h,
              transition: `all 450ms ${ease}`,
            }}
          />
          <div className="pointer-events-none absolute inset-x-[30px] top-[424px] transition-all duration-500" style={{ opacity: open.up ? 1 : 0, transform: open.up ? 'none' : 'translateY(12px)', transitionDelay: open.up ? '200ms' : '0ms' }}>
            <p className="text-footnote text-ink-muted">{open.item.city.name} · {open.item.city.years}</p>
            <h4 className="font-display text-title-2">Capture #{open.item.i + 1}</h4>
            <p className="mt-2 text-body text-ink-muted">Place, time and your note would sit here.</p>
          </div>
          <button
            type="button"
            onClick={hide}
            className="absolute right-5 top-14 rounded-full bg-neutral-200 px-4 py-2 text-subhead transition-opacity duration-300"
            style={{ opacity: open.up ? 1 : 0 }}
          >
            Close
          </button>
        </>
      )}
    </div>
  )
}

const ideas = [
  { name: 'Scrubber wall', blurb: 'One huge horizontal wall of captures, oldest at the left. Drag along the slim gray timeline (a shade per city) to move the wall, or just drag the wall. Tap a capture and it grows open. Gray boxes only.', node: <ScrubberWall /> },
  { name: 'Full-bleed pages', blurb: 'One city per screen, snapping as you swipe up. Big photo, one sentence, the city’s color.', node: <Pages /> },
  { name: 'Route map', blurb: 'The cities as stops on the line she has traveled. Tap a stop for its photos and sentence.', node: <RouteMap /> },
  { name: 'Passport', blurb: 'A stamp per city, with a blank one for the next. Tap a stamp to open that city.', node: <Passport /> },
  { name: 'The wall', blurb: 'Every photo pinned up at once. Pick a city and its photos come forward while the rest fade.', node: <Wall /> },
  { name: 'Timeline', blurb: 'One long river down the years. Each city is a colored stop with its photos in a row.', node: <Timeline /> },
  { name: 'Cover flow', blurb: 'Big city cards you swipe sideways through, newest first.', node: <CoverFlow /> },
  { name: 'Mosaic', blurb: 'All photos in one tight grid, tagged by city color. Tap a color to isolate that city.', node: <Mosaic /> },
  { name: 'Postcards', blurb: 'City cards stacked like postcards. Tap the top one and it goes to the back.', node: <Deck /> },
]

export function ArchiveIdeas({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-cream font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-baton-cream/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-medium">Archive ideas</h1>
          <p className="text-subhead text-ink-muted">Other ways the Archive page itself could work, instead of the folder stack. Mock data.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-baton-navy px-4 py-2 text-subhead font-medium text-on-brand hover:opacity-90"
        >
          Close
        </button>
      </header>
      <div className="flex flex-wrap justify-center gap-10 px-6 pb-12 pt-2">
        {ideas.map((idea, i) => (
          <section key={idea.name} className="flex w-[360px] flex-col gap-3">
            <div>
              <h2 className="font-display text-title-3 font-medium">
                {i + 1}. {idea.name}
              </h2>
              <p className="min-h-[40px] text-footnote text-ink-muted">{idea.blurb}</p>
            </div>
            {idea.node}
          </section>
        ))}
      </div>
    </div>
  )
}
