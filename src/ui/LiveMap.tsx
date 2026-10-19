import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// Vite moves the library, so point it at its worker file explicitly
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import type { LngLat } from '../data/mapSpots'
import { cx } from './cx'
import { buildMapStyle, mapLook } from './mapStyles'
import type { MapPalette, PinDesign } from './mapStyles'
import type { RecTone } from './RecCard'

export type LivePin = LngLat & { id: string; tone: RecTone; title?: string }

type LiveMapProps = {
  // A look from mapLooks (mapStyles.ts)
  look: string
  pins: LivePin[]
  // Overrides the look's own pin design
  pinDesign?: PinDesign
  selected?: string | null
  onSelect?: (id: string | null) => void
  // Her own place, a blue dot
  you?: LngLat
  // Neighborhood names drawn on top in Mundial Narrow
  labels?: (LngLat & { name: string })[]
  // Reports the camera after every move (to keep several maps in step)
  onCamera?: (camera: Camera) => void
  // Moves the map to this camera when it changes
  camera?: Camera | null
  // Space covered by things on top (like a sheet), kept clear when framing
  coverBottom?: number
  className?: string
}

export type Camera = { center: [number, number]; zoom: number }

// New York, with a margin so you can't wander off to Ohio
const nycBounds: [[number, number], [number, number]] = [
  [-74.3, 40.5],
  [-73.65, 40.95],
]

maplibregl.setWorkerUrl(workerUrl)

type Point = { x: number; y: number }

// A New York map in the given colors, framed on downtown and north Brooklyn
function createMap(
  element: HTMLDivElement,
  palette: MapPalette,
  coverBottom: number,
  onLoad: (map: maplibregl.Map) => void,
  onFail: () => void,
) {
  const instance = new maplibregl.Map({
    container: element,
    style: buildMapStyle(palette),
    // Opens on the East Village and Union Square, where most pins are, zoomed in far enough that the pins show
    // their names (Keller, Oct 18); the sheet's peek is kept out of the middle
    center: [-73.9895, 40.7295],
    zoom: 13.55,
    maxBounds: nycBounds,
    minZoom: 10.5,
    maxZoom: 18,
    dragRotate: false,
    pitchWithRotate: false,
    attributionControl: false,
  })
  // Map credits as a small (i), moved to the top when a sheet covers the bottom
  instance.addControl(new maplibregl.AttributionControl({ compact: true }), coverBottom ? 'top-right' : 'bottom-right')
  instance.touchZoomRotate.disableRotation()
  if (coverBottom) instance.setPadding({ top: 0, left: 0, right: 0, bottom: coverBottom })
  instance.on('load', () => {
    // Credits start folded into the small (i)
    element.querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show')
    onLoad(instance)
  })
  instance.on('error', (event: { error?: { message?: string } }) => {
    // Tiles unreachable (offline, blocked): say so instead of a blank map
    if (!instance.loaded() && /fetch|tile|source/i.test(String(event.error?.message))) onFail()
  })
  return instance
}

const noLabels: (LngLat & { name: string })[] = []

// A real New York you can drag, pinch and scroll to zoom (MapLibre on free
// OpenStreetMap tiles), drawn in one of Baton's looks. Pins and neighborhood
// names are ordinary React elements laid over the map, so they use the app's
// font and tokens and stay crisp at every zoom.
export function LiveMap({
  look,
  pins,
  pinDesign,
  selected,
  onSelect,
  you,
  labels = noLabels,
  onCamera,
  camera,
  coverBottom = 0,
  className,
}: LiveMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [points, setPoints] = useState<Record<string, Point>>({})
  const [zoom, setZoom] = useState(0)
  const [failed, setFailed] = useState(false)
  // True while the map is being moved to a camera handed in from outside
  const following = useRef(false)
  const theLook = mapLook(look)
  const design = pinDesign ?? theLook.pin

  // Create the map once
  useEffect(() => {
    const element = container.current
    if (!element) return
    let instance: maplibregl.Map | null = null
    // A tick later, so React's dev double mount doesn't start and tear down a
    // map at once (that leaves MapLibre's workers stuck for seconds)
    const timer = setTimeout(() => {
      instance = createMap(element, theLook.palette(), coverBottom, setMap, () => setFailed(true))
    })
    return () => {
      clearTimeout(timer)
      instance?.remove()
    }
    // The look is swapped below without rebuilding the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Swap the look in place
  useEffect(() => {
    map?.setStyle(buildMapStyle(mapLook(look).palette()))
  }, [map, look])

  // Follow a camera handed in from outside
  useEffect(() => {
    if (!map || !camera) return
    const center = map.getCenter()
    if (Math.abs(center.lng - camera.center[0]) < 1e-6 && Math.abs(center.lat - camera.center[1]) < 1e-6 && Math.abs(map.getZoom() - camera.zoom) < 1e-4) return
    following.current = true
    map.jumpTo(camera)
    following.current = false
  }, [map, camera])

  // Keep the overlay (pins, labels, her dot) on the map as it moves
  useEffect(() => {
    if (!map) return
    const spots: Record<string, LngLat> = {}
    for (const pin of pins) spots[`pin:${pin.id}`] = pin
    for (const label of labels) spots[`label:${label.name}`] = label
    if (you) spots.you = you

    const place = () => {
      const next: Record<string, Point> = {}
      for (const [key, spot] of Object.entries(spots)) {
        const { x, y } = map.project([spot.lng, spot.lat])
        next[key] = { x, y }
      }
      setPoints(next)
      setZoom(map.getZoom())
    }
    const report = () => {
      // Not moves copied from another map, so maps kept in step don't echo
      if (following.current || !onCamera) return
      const { lng, lat } = map.getCenter()
      onCamera({ center: [lng, lat], zoom: map.getZoom() })
    }
    map.on('move', place)
    map.on('resize', place)
    map.on('move', report)
    map.once('idle', place)
    map.triggerRepaint()
    return () => {
      map.off('move', place)
      map.off('resize', place)
      map.off('move', report)
    }
  }, [map, pins, labels, you, onCamera])

  const dark = theLook.dark

  return (
    <div className={cx('relative isolate overflow-hidden', className)}>
      <div ref={container} style={{ position: 'absolute', inset: 0 }} onClick={() => onSelect?.(null)} />

      {/* Overlay: never blocks dragging except right on a pin */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {labels.map((label) => {
          const point = points[`label:${label.name}`]
          if (!point) return null
          return (
            <span
              key={label.name}
              className={cx(
                'absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-body text-[10px] font-medium uppercase tracking-[0.12em]',
                dark ? 'text-baton-cream/60' : 'text-baton-navy/45',
              )}
              style={{ left: point.x, top: point.y }}
            >
              {label.name}
            </span>
          )
        })}

        {you && points.you && (
          <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: points.you.x, top: points.you.y }}>
            <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-baton-blue/30" />
            <span className="relative block size-4 rounded-full border-[3px] border-surface bg-baton-blue shadow-float" />
          </span>
        )}

        {pins.map((pin, index) => {
          const point = points[`pin:${pin.id}`]
          if (!point) return null
          const active = pin.id === selected
          return (
            <button
              key={pin.id}
              type="button"
              aria-label={pin.title ?? pin.id}
              onClick={(event) => {
                event.stopPropagation()
                onSelect?.(active ? null : pin.id)
              }}
              // A finger-sized target centered on the spot; the pin draws from its center
              className={cx('pointer-events-auto absolute size-11 -translate-x-1/2 -translate-y-1/2', active ? 'z-20' : 'z-10')}
              style={{ left: point.x, top: point.y }}
            >
              <span className="absolute left-1/2 top-1/2">
                <PinMark
                  design={design}
                  tone={pin.tone}
                  active={active}
                  // Names only once zoomed into a neighborhood, so they don't pile up
                  title={active || zoom >= 13.5 ? pin.title : undefined}
                  dark={dark}
                  index={index}
                />
              </span>
            </button>
          )
        })}
      </div>

      {failed && (
        <p className="absolute inset-x-4 top-4 rounded-card bg-surface p-3 text-center text-footnote text-ink-muted shadow-float">
          The map tiles couldn’t load. Check the connection.
        </p>
      )}
    </div>
  )
}

const toneBg: Record<RecTone, string> = {
  // Type on brand blue is white (Keller, Oct 19)
  blue: 'bg-baton-blue text-on-brand',
  yellow: 'bg-baton-yellow text-baton-navy',
  pink: 'bg-baton-pink text-baton-navy',
  olive: 'bg-baton-olive text-on-brand',
  cream: 'bg-baton-cream text-baton-navy',
  navy: 'bg-baton-navy text-on-brand',
}

type PinMarkProps = { design: PinDesign; tone: RecTone; active: boolean; title?: string; dark?: boolean; index?: number }

const stickyTilts = ['-rotate-[6deg]', 'rotate-[4deg]', '-rotate-[2deg]', 'rotate-[7deg]']

// The pin designs to choose from. Each is centered on (or points at) the spot.
export function PinMark({ design, tone, active, title, dark, index = 0 }: PinMarkProps) {
  if (design === 'sticky') {
    // A small sticky note in the category color, held on with cream tape like
    // the Scrapbook cards; it grows to show the name once zoomed in or picked
    return (
      <span
        className={cx(
          'grain absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[3px] font-display font-medium shadow-paper transition-all duration-200',
          toneBg[tone],
          stickyTilts[index % stickyTilts.length],
          !title ? 'size-6' : 'max-w-44 whitespace-nowrap px-2.5 pb-1.5 pt-2 text-caption leading-tight',
          active && 'scale-125',
        )}
      >
        <span aria-hidden className="absolute -top-1.5 left-1/2 h-2.5 w-5 -translate-x-1/2 -rotate-6 bg-baton-cream/90 shadow-paper" />
        {title && <span className="truncate">{title}</span>}
      </span>
    )
  }

  if (design === 'drop') {
    // A classic map drop, tip on the spot
    return (
      <span
        className={cx(
          'absolute bottom-0 left-0 flex -translate-x-1/2 items-center justify-center transition-transform duration-200',
          active ? 'scale-125' : 'scale-100',
        )}
        style={{ transformOrigin: '50% 100%' }}
      >
        <span
          className={cx(
            'flex size-7 -rotate-45 items-center justify-center rounded-full rounded-bl-none border-[2.5px] border-surface shadow-float',
            toneBg[tone],
          )}
          style={{ marginBottom: 4 }}
        >
          <span className="size-2 rounded-full bg-surface" />
        </span>
      </span>
    )
  }

  if (design === 'badge') {
    // A round sticker with a thick white ring
    return (
      <span
        className={cx(
          'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface p-1 shadow-float transition-all duration-200',
          active ? 'size-10' : 'size-7',
        )}
      >
        <span className={cx('size-full rounded-full', toneBg[tone])} />
      </span>
    )
  }

  if (design === 'label') {
    // A pill with the place's name, a small tail on the spot
    return (
      <span className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
        <span
          className={cx(
            'whitespace-nowrap rounded-full font-body font-medium shadow-float transition-all duration-200',
            toneBg[tone],
            !title ? 'size-3.5' : active ? 'px-3 py-1.5 text-subhead' : 'px-3 py-1.5 text-caption',
            dark && 'ring-2 ring-baton-cream/80',
          )}
        >
          {title}
        </span>
        <span className={cx('-mt-1 size-2.5 rotate-45 rounded-[2px]', toneBg[tone])} />
      </span>
    )
  }

  // dot: a flat category-colored dot with a navy edge, like the Figma map
  return (
    <span
      className={cx(
        'absolute block -translate-x-1/2 -translate-y-1/2 rounded-full border-baton-navy transition-all duration-200',
        toneBg[tone],
        active ? 'size-6 border-[3px]' : 'size-4 border-2',
      )}
    />
  )
}
