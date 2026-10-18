import { useState } from 'react'
import { homeSpot, mapNeighborhoods, relaySpots } from '../data/mapSpots'
import { relayCategory, relayItems } from '../data/relay'
import { SegmentedControl, cx } from '../ui'
import { LiveMap } from '../ui/LiveMap'
import type { Camera, LivePin } from '../ui/LiveMap'
import { mapLooks } from '../ui/mapStyles'
import type { PinDesign } from '../ui/mapStyles'

// Every Relay pick that has a real place gets a pin, in its category color
const pins: LivePin[] = relayItems.flatMap((item) => {
  const spot = relaySpots[item.id]
  return spot ? [{ id: item.id, ...spot, tone: relayCategory(item.category).tone, title: item.title }] : []
})

const pinChoices: { id: PinDesign | 'own'; label: string }[] = [
  { id: 'own', label: 'Look’s own' },
  { id: 'dot', label: 'Dot' },
  { id: 'drop', label: 'Drop' },
  { id: 'badge', label: 'Badge' },
  { id: 'label', label: 'Label' },
  { id: 'sticky', label: 'Sticky' },
]

// Team-only page (from the debug panel, or ?maps in the URL): the candidate
// looks for the Relay map side by side, each a real New York you can drag,
// pinch and scroll to zoom, with its own pin design. Pick one, then it goes
// into Relay's map view.
export function MapPlayground({ onClose }: { onClose: () => void }) {
  const [pinDesign, setPinDesign] = useState<PinDesign | 'own'>('own')
  const [together, setTogether] = useState(true)
  // The last map moved by hand, and where it is; the others follow it
  const [camera, setCamera] = useState<(Camera & { from: string }) | null>(null)
  const [selected, setSelected] = useState<Record<string, string | null>>({})

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-baton-paper font-body text-baton-navy">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 bg-baton-paper/90 px-6 py-4 backdrop-blur">
        <div className="mr-auto">
          <h1 className="font-display text-title-2 font-bold">Relay map looks</h1>
          <p className="text-subhead text-ink-muted">Drag, pinch or scroll on any map. Tap a pin.</p>
        </div>
        <label className="flex items-center gap-2 text-subhead">
          <span className="text-ink-muted">Pins</span>
          <SegmentedControl segments={pinChoices} value={pinDesign} onChange={setPinDesign} className="w-[460px]" />
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={together}
          onClick={() => setTogether((on) => !on)}
          className="flex items-center gap-2 text-subhead"
        >
          <span className={cx('flex h-5 w-9 items-center rounded-full p-0.5', together ? 'justify-end bg-baton-navy' : 'justify-start bg-line')}>
            <span className="size-4 rounded-full bg-surface" />
          </span>
          Move together
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-baton-navy px-4 py-2 text-subhead font-semibold text-on-brand hover:opacity-90"
        >
          Close
        </button>
      </header>

      <div className="flex flex-wrap justify-center gap-6 px-6 pb-10 pt-2">
        {mapLooks.map((look, i) => {
          const picked = pins.find((pin) => pin.id === selected[look.id])
          const item = relayItems.find((entry) => entry.id === picked?.id)
          return (
            <section key={look.id} className="flex w-[300px] flex-col gap-3">
              <div>
                <h2 className="font-display text-title-3 font-bold">
                  {i + 1}. {look.name}
                </h2>
                <p className="min-h-[60px] text-footnote text-ink-muted">{look.blurb}</p>
              </div>
              <div className="relative h-[540px] overflow-hidden rounded-[40px] shadow-float">
                <LiveMap
                  look={look.id}
                  pins={pins}
                  pinDesign={pinDesign === 'own' ? undefined : pinDesign}
                  selected={selected[look.id] ?? null}
                  onSelect={(id) => setSelected((all) => ({ ...all, [look.id]: id }))}
                  you={homeSpot}
                  labels={mapNeighborhoods}
                  camera={together && camera?.from !== look.id ? camera : null}
                  onCamera={together ? (next) => setCamera({ ...next, from: look.id }) : undefined}
                  className="size-full"
                />
                {item && (
                  <div className="absolute inset-x-3 bottom-3 rounded-card bg-surface p-4 shadow-float">
                    <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      {relayCategory(item.category).label}
                    </p>
                    <p className="font-display text-headline font-bold">{item.title}</p>
                    {item.place && <p className="text-footnote text-ink-muted">{item.place}</p>}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
