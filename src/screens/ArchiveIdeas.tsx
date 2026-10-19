import { useRef, useState } from 'react'
import { cx } from '../ui'

// Team-only page (from the debug panel, or ?archive-ideas in the URL): very
// early ways to interact with the Archive, each a small phone-sized sketch with
// mock data. Photos are stand-ins from the LA cloud.
const p = (n: string) => `/archive/la-cloud/${n}.jpg`

const phone = 'relative h-[640px] w-[360px] shrink-0 overflow-hidden rounded-[36px] bg-baton-paper shadow-lg'

// 1. Same spot, many times: the café seat across the years
const seat = [
  { year: 2022, photo: p('4707'), note: 'First week. I sat here because it was the only free seat.' },
  { year: 2023, photo: p('4713'), note: 'Finals. Same seat, third coffee.' },
  { year: 2024, photo: p('4743'), note: 'Jenna found me here without texting.' },
  { year: 2025, photo: p('4754'), note: 'Quiet. Everyone I knew had left or graduated.' },
  { year: 2026, photo: p('4830'), note: 'Last time. I took the same photo on purpose.' },
]

function SameSpot() {
  const [i, setI] = useState(0)
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Verve Coffee, Silver Lake</p>
        <h3 className="font-display text-title-2">The seat by the window</h3>
      </div>
      <div className="relative mx-auto mt-5 h-[300px] w-[300px]">
        {seat.map((s, k) => (
          <img
            key={s.year}
            src={s.photo}
            alt=""
            className="absolute inset-0 h-full w-full rounded-card object-cover shadow-md transition-opacity duration-300"
            style={{ opacity: k === i ? 1 : 0 }}
          />
        ))}
        <span className="absolute left-3 top-3 rounded-full bg-baton-paper/90 px-3 py-1 text-subhead font-medium">{seat[i].year}</span>
      </div>
      <p className="mx-[30px] mt-4 min-h-[48px] text-body">{seat[i].note}</p>
      <div className="mx-[30px] mt-3">
        <input
          type="range"
          min={0}
          max={seat.length - 1}
          step={0.01}
          value={i}
          onChange={(e) => setI(Math.round(Number(e.target.value)))}
          className="w-full accent-baton-blue"
          aria-label="Year"
        />
        <div className="flex justify-between text-caption text-ink-muted">
          {seat.map((s) => (
            <span key={s.year}>{s.year}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// 2. Rewrite a note: a second note from today next to the original
function RewriteNote() {
  const [draft, setDraft] = useState('')
  const [now, setNow] = useState<string | null>(null)
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Granite Falls · July 25, 2026</p>
        <h3 className="font-display text-title-2">Where did you go today that you’ll miss?</h3>
      </div>
      <img src={p('3061')} alt="" className="mx-auto mt-4 h-[170px] w-[170px] rounded-full object-cover shadow-md" />
      <div className="mt-5 flex flex-col gap-3 px-[30px]">
        <div className="-rotate-2 rounded-tile bg-baton-yellow p-4 text-subhead shadow-md">
          <p className="mb-1 text-caption text-ink-muted">Then · LA</p>
          The lake view was absolutely amazing and I thoroughly enjoyed my meat stick on this rock.
        </div>
        {now ? (
          <div className="rotate-1 animate-note-stick rounded-tile bg-baton-pink p-4 text-subhead shadow-md">
            <p className="mb-1 text-caption text-ink-muted">Now · New York</p>
            {now}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What do you think of this one now?"
              className="h-[84px] resize-none rounded-tile bg-card p-3 text-subhead shadow-sm outline-none"
            />
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => setNow(draft.trim())}
              className="self-end rounded-full bg-baton-blue px-4 py-2 text-subhead font-medium text-baton-navy disabled:opacity-40"
            >
              Add today’s note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 3. Suitcase: drag each moment to keep, give or let go
const bins = [
  { id: 'keep', name: 'Keep', hint: 'private', tone: 'bg-baton-blue' },
  { id: 'give', name: 'Give', hint: 'to the next', tone: 'bg-baton-yellow' },
  { id: 'go', name: 'Let go', hint: 'delete', tone: 'bg-baton-pink' },
] as const
type Bin = (typeof bins)[number]['id']
const pile = [
  { photo: p('3061'), title: 'Granite Falls hike' },
  { photo: p('19'), title: 'Echo Park, the dog walker' },
  { photo: p('4885'), title: 'Rooftop sunset' },
  { photo: p('5021'), title: 'The moving truck' },
]

function Suitcase() {
  const [sorted, setSorted] = useState<Bin[]>([])
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const card = pile[sorted.length]
  const pick = (dx: number, dy: number): Bin | null => {
    if (dy > 90 && Math.abs(dx) < 90) return 'go'
    if (dx > 90) return 'give'
    if (dx < -90) return 'keep'
    return null
  }
  const done = (b: Bin) => {
    setSorted((s) => [...s, b])
    setDrag(null)
  }
  const live = drag ? pick(drag.x, drag.y) : null
  const count = (b: Bin) => sorted.filter((x) => x === b).length
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Last night in LA</p>
        <h3 className="font-display text-title-2">Pack your suitcase</h3>
      </div>
      <div className="relative mx-auto mt-6 h-[300px] w-[240px]">
        {card ? (
          <div
            className="absolute inset-0 touch-none select-none rounded-card bg-card p-3 shadow-lg"
            style={{
              transform: drag ? `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 14}deg)` : undefined,
              transition: drag ? 'none' : 'transform 200ms',
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              start.current = { x: e.clientX, y: e.clientY }
              setDrag({ x: 0, y: 0 })
            }}
            onPointerMove={(e) => start.current && setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })}
            onPointerUp={() => {
              const b = drag ? pick(drag.x, drag.y) : null
              start.current = null
              if (b) done(b)
              else setDrag(null)
            }}
          >
            <img src={card.photo} alt="" draggable={false} className="h-[230px] w-full rounded-tile object-cover" />
            <p className="mt-3 text-body font-medium">{card.title}</p>
          </div>
        ) : (
          <p className="pt-24 text-center text-body text-ink-muted">All packed.</p>
        )}
      </div>
      <div className="absolute inset-x-[20px] bottom-8 flex gap-2">
        {bins.map((b) => (
          <button
            key={b.id}
            type="button"
            disabled={!card}
            onClick={() => card && done(b.id)}
            className={cx(
              'flex-1 rounded-card py-3 text-center shadow-sm transition-transform',
              b.tone,
              live === b.id && 'scale-110',
            )}
          >
            <span className="block text-subhead font-medium">{b.name}</span>
            <span className="block text-caption text-ink-muted">
              {b.hint} · {count(b.id)}
            </span>
          </button>
        ))}
      </div>
      <p className="absolute inset-x-0 bottom-[104px] text-center text-caption text-ink-muted">
        Drag left to keep, right to give, down to let go
      </p>
    </div>
  )
}

// 4. Hold to reveal: moments start blurred and come into focus while you press
const hold = ['4707', '4743', '4885', '5021', '3061', '19', '6016', '6123', '6235'].map(p)

function HoldReveal() {
  const [held, setHeld] = useState<number | null>(null)
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Memories fade. Press and hold.</p>
        <h3 className="font-display text-title-2">What do you still remember?</h3>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 px-[20px]">
        {hold.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            onPointerDown={() => setHeld(i)}
            onPointerUp={() => setHeld(null)}
            onPointerLeave={() => setHeld(null)}
            className="aspect-square w-full touch-none select-none rounded-tile object-cover"
            style={{
              filter: held === i ? 'blur(0px)' : 'blur(14px)',
              transform: held === i ? 'scale(1.06)' : 'scale(1)',
              transition: held === i ? 'filter 700ms ease-out, transform 700ms' : 'filter 300ms, transform 300ms',
            }}
          />
        ))}
      </div>
    </div>
  )
}

const ideas = [
  { name: 'Same spot, many times', blurb: 'Pick a place and scrub through every capture there over the years, like a flipbook.', node: <SameSpot /> },
  { name: 'Rewrite a note', blurb: 'Open an old moment and add a second note from today. Then and now sit side by side.', node: <RewriteNote /> },
  { name: 'Suitcase', blurb: 'The last-night review as packing: drag each moment to keep, give to the next person, or let go.', node: <Suitcase /> },
  { name: 'Hold to reveal', blurb: 'Moments start blurred, like fading memory. Press and hold to bring one into focus.', node: <HoldReveal /> },
]

export function ArchiveIdeas({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-cream font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex items-center gap-4 bg-baton-cream/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-medium">Archive ideas</h1>
          <p className="text-subhead text-ink-muted">Early sketches of other ways to interact with the Archive. Mock data, nothing saves.</p>
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
