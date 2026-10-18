import { cx } from './cx'
import type { RecTone } from './RecCard'

export type MapPin = {
  id: string
  // Position on the map drawing (whole city is 390x760)
  x: number
  y: number
  tone: RecTone
}

type CityMapProps = {
  pins: MapPin[]
  selected?: string | null
  onSelect?: (id: string | null) => void
  // Her own position, a blue dot
  you?: { x: number; y: number }
  className?: string
}

const pinFill: Record<RecTone, string> = {
  blue: 'fill-baton-blue',
  yellow: 'fill-baton-yellow',
  pink: 'fill-baton-pink',
  olive: 'fill-baton-olive',
  cream: 'fill-baton-cream',
  navy: 'fill-baton-navy',
}

// Land shapes of a stylized New York (not to scale): New Jersey, Manhattan,
// the Bronx and Queens, Brooklyn, with Central Park and a hint of the grid.
const land = {
  jersey: 'M0 0H168L160 110 146 260 130 410 116 540 96 760H0Z',
  manhattan:
    'M206 26 234 58 231 140 218 250 205 340 194 420 182 482 163 528 147 512 150 440 160 350 173 250 186 140 196 62Z',
  queens: 'M252 0H390V430L306 418 256 336 244 204 248 80Z',
  brooklyn: 'M196 560 232 478 262 440 312 430 390 440V760H150L166 640Z',
}
const park = 'M206 150 222 153 211 252 195 249Z'

// A sideways stack of lines across Manhattan, clipped to it, for the grid.
const grid = Array.from({ length: 70 }, (_, i) => 40 + i * 7.5)

// A flat, brand-colored map for the Relay map view: tinted water, paper land,
// pins in each recommendation's category color. Fills its container (cropped
// to cover), so pins are drawn in the same SVG and stay put.
export function CityMap({ pins, selected, onSelect, you, className }: CityMapProps) {
  return (
    <svg
      // Framed on downtown Manhattan and north Brooklyn, where her picks are
      viewBox="96 336 220 380"
      preserveAspectRatio="xMidYMid slice"
      className={cx('size-full bg-baton-blue/25', className)}
      onClick={() => onSelect?.(null)}
    >
      <defs>
        <clipPath id="city-map-manhattan">
          <path d={land.manhattan} />
        </clipPath>
      </defs>
      {Object.values(land).map((d) => (
        <path key={d} d={d} className="fill-baton-paper stroke-baton-cream" strokeWidth={1} />
      ))}
      <g clipPath="url(#city-map-manhattan)" className="stroke-baton-cream" strokeWidth={0.8}>
        {grid.map((y) => (
          <line key={y} x1={120} y1={y} x2={260} y2={y - 34} />
        ))}
      </g>
      <path d={park} className="fill-baton-olive/25" />

      <g className="fill-ink-muted text-[5px] font-semibold tracking-[0.14em]" style={{ fontFamily: 'var(--font-body)' }}>
        <text x={100} y={420}>NEW JERSEY</text>
        <text x={282} y={398}>QUEENS</text>
        <text x={262} y={600}>BROOKLYN</text>
        <text x={158} y={528} transform="rotate(-80 158 528)">MANHATTAN</text>
      </g>

      {you && (
        <g>
          <circle cx={you.x} cy={you.y} r={8} className="fill-baton-blue/30" />
          <circle cx={you.x} cy={you.y} r={3.5} className="fill-baton-blue stroke-surface" strokeWidth={1.5} />
        </g>
      )}

      {pins.map((pin) => {
        const active = pin.id === selected
        return (
          <g
            key={pin.id}
            role="button"
            aria-label={pin.id}
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(pin.id)
            }}
          >
            {/* Bigger invisible target for fingers */}
            <circle cx={pin.x} cy={pin.y} r={9} className="fill-transparent" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r={active ? 7.5 : 5}
              className={cx(pinFill[pin.tone], 'stroke-baton-navy transition-all duration-200')}
              strokeWidth={active ? 2 : 1.4}
            />
          </g>
        )
      })}
    </svg>
  )
}
