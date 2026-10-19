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
// the Bronx and Queens, Brooklyn.
const land = {
  jersey: 'M0 0H168L160 110 146 260 130 410 116 540 96 760H0Z',
  manhattan:
    'M206 26 234 58 231 140 218 250 205 340 194 420 182 482 163 528 147 512 150 440 160 350 173 250 186 140 196 62Z',
  queens: 'M252 0H390V430L306 418 256 336 244 204 248 80Z',
  brooklyn: 'M196 560 232 478 262 440 312 430 390 440V760H150L166 640Z',
}
// Parks: Tompkins Square, Washington Square, McCarren, Prospect
const parks = [
  'M186 426 194 427 193 436 185 435Z',
  'M168 440 176 441 175 448 167 447Z',
  'M262 444 276 446 273 458 260 456Z',
  'M246 548 274 552 270 590 242 584Z',
]

// Big roads: FDR Drive down the east side, the BQE, the West Side Highway
const highways = [
  'M232 120 220 250 207 340 196 420 186 480 168 524',
  'M150 520 156 440 166 350 178 250 190 140',
  'M190 600 214 540 240 490 270 452 320 438 390 446',
]
const roads = ['M146 470 L196 452', 'M150 430 L200 412', 'M162 380 L212 362', 'M230 470 L300 520 L330 600', 'M200 560 L300 580 L390 600']

// A flat street map in the style of the Figma map view (268:3798), drawn by
// hand for New York: light land, white street grid, blue water, green parks,
// and pins in each recommendation's category color. Fills its container
// (cropped to cover), so pins are drawn in the same SVG and stay put.
export function CityMap({ pins, selected, onSelect, you, className }: CityMapProps) {
  return (
    <svg
      // Framed on downtown Manhattan and north Brooklyn, where her picks are
      viewBox="96 360 220 380"
      preserveAspectRatio="xMidYMid slice"
      className={cx('size-full bg-map-water', className)}
      onClick={() => onSelect?.(null)}
    >
      <defs>
        <pattern id="city-map-grid" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
          <path d="M0 0H9M0 0V9" className="stroke-map-street" strokeWidth={1.6} fill="none" />
        </pattern>
        <pattern id="city-map-grid-bk" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M0 0H11M0 0V11" className="stroke-map-street" strokeWidth={1.4} fill="none" />
        </pattern>
      </defs>
      {Object.entries(land).map(([name, d]) => (
        <g key={name}>
          <path d={d} className="fill-map-land" />
          <path d={d} fill={`url(#${name === 'manhattan' ? 'city-map-grid' : 'city-map-grid-bk'})`} />
        </g>
      ))}
      {parks.map((d) => (
        <path key={d} d={d} className="fill-map-park" />
      ))}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {roads.map((d) => (
          <path key={d} d={d} className="stroke-map-road" strokeWidth={2.2} />
        ))}
        {highways.map((d) => (
          <path key={d} d={d} className="stroke-map-highway" strokeWidth={3} />
        ))}
      </g>

      <g className="fill-ink-muted text-[6px] font-medium tracking-[0.08em]" style={{ fontFamily: 'var(--font-body)' }}>
        <text x={104} y={430}>JERSEY CITY</text>
        <text x={262} y={480}>WILLIAMSBURG</text>
        <text x={226} y={612}>PARK SLOPE</text>
        <text x={290} y={400}>QUEENS</text>
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
