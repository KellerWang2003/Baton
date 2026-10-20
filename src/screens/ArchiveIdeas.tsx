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

// 5. A day in LA: scrub through a typical day by the hour
const day = [
  { hour: '8 am', photo: p('4707'), place: 'Verve Coffee', line: 'Oat latte, same seat. The only quiet part of my day.' },
  { hour: '1 pm', photo: p('4743'), place: 'ArtCenter Hillside', line: 'Critique ran long. Lunch was a granola bar on the steps.' },
  { hour: '6 pm', photo: p('4885'), place: 'Silver Lake rooftop', line: 'Golden hour. Everyone drifts up here around now.' },
  { hour: '10 pm', photo: p('5021'), place: 'Trader Joe’s next door', line: 'Late snack run, always the same three things.' },
]
const sky = ['bg-baton-yellow', 'bg-baton-blue', 'bg-baton-pink', 'bg-baton-navy']

function DayInLA() {
  const [i, setI] = useState(0)
  const d = day[i]
  return (
    <div className={cx(phone, 'transition-colors duration-500')}>
      <div className={cx('absolute inset-x-0 top-0 h-[230px] opacity-60 transition-colors duration-500', sky[i])} />
      <div className="relative px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">A normal Tuesday</p>
        <h3 className="font-display text-title-2">{d.hour} in LA</h3>
      </div>
      <img src={d.photo} alt="" className="relative mx-auto mt-4 h-[200px] w-[300px] rounded-card object-cover shadow-md" />
      <div className="relative px-[30px] pt-4">
        <p className="text-subhead font-medium">{d.place}</p>
        <p className="mt-1 min-h-[60px] text-body">{d.line}</p>
      </div>
      <div className="absolute inset-x-[30px] bottom-8 flex justify-between">
        {day.map((x, k) => (
          <button
            key={x.hour}
            type="button"
            onClick={() => setI(k)}
            className={cx(
              'rounded-full px-3 py-2 text-subhead shadow-sm transition-colors',
              k === i ? 'bg-baton-navy text-on-brand' : 'bg-card text-ink-muted',
            )}
          >
            {x.hour}
          </button>
        ))}
      </div>
    </div>
  )
}

// 6. Time capsule: seal a moment until a future date
const dates = ['In 3 months', 'In 1 year', 'In 5 years']

function TimeCapsule() {
  const [when, setWhen] = useState(1)
  const [sealed, setSealed] = useState(false)
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Granite Falls · July 25, 2026</p>
        <h3 className="font-display text-title-2">{sealed ? 'Sealed.' : 'Save this one for later'}</h3>
      </div>
      <div className="relative mx-auto mt-5 h-[220px] w-[220px]">
        <img
          src={p('3061')}
          alt=""
          className="h-full w-full rounded-full object-cover shadow-md transition-[filter] duration-700"
          style={{ filter: sealed ? 'blur(22px) grayscale(0.6)' : 'none' }}
        />
        {sealed && (
          <div className="absolute inset-0 flex animate-note-stick items-center justify-center">
            <span className="rounded-full bg-baton-navy px-5 py-2 text-subhead font-medium text-on-brand">
              Opens {dates[when].replace('In ', 'in ')}
            </span>
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 px-[30px]">
        {!sealed ? (
          <>
            <div className="flex gap-2">
              {dates.map((d, k) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setWhen(k)}
                  className={cx('rounded-full px-3 py-2 text-subhead shadow-sm', k === when ? 'bg-baton-blue text-baton-navy' : 'bg-card')}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSealed(true)}
              className="rounded-full bg-baton-navy px-6 py-3 text-body font-medium text-on-brand"
            >
              Seal it
            </button>
            <p className="text-center text-caption text-ink-muted">It stays hidden, even from you, until then.</p>
          </>
        ) : (
          <button type="button" onClick={() => setSealed(false)} className="text-subhead text-brand">
            Undo
          </button>
        )}
      </div>
    </div>
  )
}

// 7. Pass it on: turn a moment into a tip for the next person
const tipMoments = [
  { photo: p('4707'), title: 'Verve Coffee', prefill: 'Sit by the window before 9. Nobody comes until later.' },
  { photo: p('4885'), title: 'Rooftop sunset', prefill: 'Bring a jacket. It gets cold fast once the sun is down.' },
  { photo: p('5021'), title: 'The moving truck', prefill: 'Book the truck two weeks ahead. Prices double at the end of the month.' },
]

function PassItOn() {
  const [k, setK] = useState(0)
  const [text, setText] = useState(tipMoments[0].prefill)
  const [sent, setSent] = useState(false)
  const m = tipMoments[k]
  const pickMoment = (n: number) => {
    setK(n)
    setText(tipMoments[n].prefill)
    setSent(false)
  }
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">Pick a moment, then pass it on</p>
        <h3 className="font-display text-title-2">What should the next person know?</h3>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {tipMoments.map((t, n) => (
          <img
            key={t.title}
            src={t.photo}
            alt=""
            onClick={() => pickMoment(n)}
            className={cx(
              'h-[64px] w-[64px] cursor-pointer rounded-full object-cover transition-transform',
              n === k ? 'scale-110 shadow-md ring-2 ring-baton-blue' : 'opacity-70',
            )}
          />
        ))}
      </div>
      <div className="mt-5 px-[30px]">
        {sent ? (
          <div className="-rotate-1 animate-note-stick rounded-card bg-baton-yellow p-4 shadow-md">
            <p className="text-caption text-ink-muted">Now in Relay · {m.title}</p>
            <p className="mt-1 text-body">{text}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-[110px] resize-none rounded-tile bg-card p-3 text-body shadow-sm outline-none"
            />
            <button
              type="button"
              disabled={!text.trim()}
              onClick={() => setSent(true)}
              className="self-end rounded-full bg-baton-blue px-5 py-2 text-subhead font-medium text-baton-navy disabled:opacity-40"
            >
              Hand it off
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 8. Shuffle: pull one random moment, with a nudge to act on it
const nudges = ['Text someone who was there.', 'Find the same view in New York.', 'Write what you’d tell your first-week self.']

function Shuffle() {
  const [n, setN] = useState(0)
  const [spin, setSpin] = useState(0)
  const m = pile[n % pile.length]
  return (
    <div className={phone}>
      <div className="px-[30px] pt-14">
        <p className="text-footnote text-ink-muted">One at random</p>
        <h3 className="font-display text-title-2">Remember this?</h3>
      </div>
      <div
        key={n}
        className="mx-auto mt-6 w-[250px] animate-note-stick rounded-card bg-card p-3 shadow-lg"
        style={{ transform: `rotate(${spin}deg)` }}
      >
        <img src={m.photo} alt="" className="h-[220px] w-full rounded-tile object-cover" />
        <p className="mt-3 text-body font-medium">{m.title}</p>
        <p className="mt-1 text-subhead text-ink-muted">{nudges[n % nudges.length]}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setN((x) => x + 1)
          setSpin(Math.round((Math.random() - 0.5) * 8))
        }}
        className="absolute inset-x-0 bottom-10 mx-auto w-fit rounded-full bg-baton-navy px-6 py-3 text-body font-medium text-on-brand"
      >
        Another one
      </button>
    </div>
  )
}

const ideas = [
  { name: 'Same spot, many times', blurb: 'Pick a place and scrub through every capture there over the years, like a flipbook.', node: <SameSpot /> },
  { name: 'Rewrite a note', blurb: 'Open an old moment and add a second note from today. Then and now sit side by side.', node: <RewriteNote /> },
  { name: 'Suitcase', blurb: 'The last-night review as packing: drag each moment to keep, give to the next person, or let go.', node: <Suitcase /> },
  { name: 'Hold to reveal', blurb: 'Moments start blurred, like fading memory. Press and hold to bring one into focus.', node: <HoldReveal /> },
  { name: 'A day in LA', blurb: 'Scrub through a normal day by the hour, from the first coffee to the late snack run. The sky color follows.', node: <DayInLA /> },
  { name: 'Time capsule', blurb: 'Seal a moment until a date you pick. It stays blurred and hidden, then returns when you have changed.', node: <TimeCapsule /> },
  { name: 'Pass it on', blurb: 'Turn a moment into a tip and hand it off. It lands in Relay as a card for the next person.', node: <PassItOn /> },
  { name: 'Shuffle', blurb: 'One random moment at a time, each with a small nudge to do something with it.', node: <Shuffle /> },
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
