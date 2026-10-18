import type { StyleSpecification } from 'maplibre-gl'

// Basemap looks for LiveMap. Every color comes from the tokens in
// src/theme/tokens.css (read at runtime), mixed lighter or darker here, so the
// brand palette stays the one place to restyle. Tiles are OpenFreeMap's free
// vector tiles of OpenStreetMap (no key). Labels aren't in the tiles' style:
// LiveMap draws its own neighborhood names in Mundial Narrow.

export type PinDesign = 'dot' | 'drop' | 'badge' | 'label' | 'sticky'

export type MapLook = {
  id: string
  name: string
  blurb: string
  pin: PinDesign
  dark?: boolean
  palette: () => MapPalette
}

export type MapPalette = {
  land: string
  water: string
  park: string
  street: string
  road: string
  building?: string
  label: string
}

function token(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()
  return value || fallback
}

// Mix a hex color toward another (amount 0 = a, 1 = b)
function mix(a: string, b: string, amount: number) {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  }
  const [ca, cb] = [parse(a), parse(b)]
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * amount).toString(16).padStart(2, '0')).join('')}`
}

const white = '#ffffff'
// Fallbacks match tokens.css, only used if a token can't be read
const brand = () => ({
  blue: token('baton-blue', '#59a1ff'),
  cream: token('baton-cream', '#efe6e2'),
  pink: token('baton-pink', '#f3beeb'),
  yellow: token('baton-yellow', '#ede783'),
  olive: token('baton-olive', '#3f4017'),
  navy: token('baton-navy', '#222430'),
  paper: token('baton-paper', '#faf9f6'),
})

export const mapLooks: MapLook[] = [
  {
    id: 'paper',
    name: 'Paper',
    blurb: 'Off-white paper, soft blue water, butter-yellow parks. Calm, lets the pins do the talking.',
    // Small taped sticky notes, like the Scrapbook cards in the list (Keller, Oct 18)
    pin: 'sticky',
    palette: () => {
      const b = brand()
      return {
        land: b.paper,
        water: mix(b.blue, white, 0.55),
        park: mix(b.yellow, white, 0.45),
        street: white,
        road: mix(b.cream, b.navy, 0.08),
        building: mix(b.paper, b.navy, 0.04),
        label: mix(b.navy, white, 0.35),
      }
    },
  },
  {
    id: 'sunny',
    name: 'Sunny',
    blurb: 'Cream land, full Baton-blue water, yellow parks, pink avenues. The most "Baton" of the set.',
    pin: 'drop',
    palette: () => {
      const b = brand()
      return {
        land: b.cream,
        water: b.blue,
        park: b.yellow,
        street: mix(b.cream, white, 0.6),
        road: b.pink,
        label: b.navy,
      }
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    blurb: 'A pale pink city with soft blue water. Warm and a little playful; white-ringed badge pins.',
    pin: 'badge',
    palette: () => {
      const b = brand()
      return {
        land: mix(b.pink, white, 0.72),
        water: mix(b.blue, white, 0.45),
        park: mix(b.yellow, white, 0.3),
        street: white,
        road: mix(b.pink, white, 0.25),
        label: mix(b.navy, b.pink, 0.25),
      }
    },
  },
  {
    id: 'night',
    name: 'Night',
    blurb: 'Navy land, olive parks, quiet roads. Colored label pins glow on it. Good for a dramatic shot.',
    pin: 'label',
    dark: true,
    palette: () => {
      const b = brand()
      return {
        land: b.navy,
        water: mix(b.navy, b.blue, 0.35),
        park: mix(b.olive, b.navy, 0.2),
        street: mix(b.navy, white, 0.1),
        road: mix(b.navy, white, 0.2),
        label: mix(b.cream, b.navy, 0.3),
      }
    },
  },
  {
    id: 'street',
    name: 'Street map',
    blurb: 'Today’s Figma map colors (268:3798) on real streets: light gray land, white streets, green parks.',
    pin: 'dot',
    palette: () => ({
      land: token('map-land', '#f3f2f5'),
      water: token('map-water', '#a9c9f5'),
      park: token('map-park', '#c9ecd2'),
      street: token('map-street', '#ffffff'),
      road: token('map-road', '#d9dbe2'),
      label: mix(brand().navy, white, 0.4),
    }),
  },
]

export function mapLook(id: string) {
  return mapLooks.find((look) => look.id === id) ?? mapLooks[0]
}

const omt = 'omt'
const byClass = (classes: string[]) => ['in', ['get', 'class'], ['literal', classes]] as const

// A deliberately simple style: land, parks, water, streets, a hint of
// buildings when zoomed in. No labels, icons, rail or borders.
export function buildMapStyle(p: MapPalette): StyleSpecification {
  const width = (base: number) =>
    ['interpolate', ['exponential', 1.6], ['zoom'], 11, base * 0.25, 14, base, 17, base * 5] as never

  return {
    version: 8,
    sources: { [omt]: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': p.land } },
      {
        id: 'park',
        type: 'fill',
        source: omt,
        'source-layer': 'landcover',
        filter: byClass(['grass', 'wood']) as never,
        paint: { 'fill-color': p.park },
      },
      {
        id: 'park-landuse',
        type: 'fill',
        source: omt,
        'source-layer': 'landuse',
        filter: byClass(['park', 'cemetery', 'pitch', 'playground', 'garden']) as never,
        paint: { 'fill-color': p.park },
      },
      { id: 'park-area', type: 'fill', source: omt, 'source-layer': 'park', paint: { 'fill-color': p.park } },
      { id: 'water', type: 'fill', source: omt, 'source-layer': 'water', paint: { 'fill-color': p.water } },
      ...(p.building
        ? [
            {
              id: 'building',
              type: 'fill' as const,
              source: omt,
              'source-layer': 'building',
              minzoom: 14,
              paint: { 'fill-color': p.building },
            },
          ]
        : []),
      {
        id: 'street',
        type: 'line',
        source: omt,
        'source-layer': 'transportation',
        // Side streets only once you zoom into a neighborhood
        minzoom: 12.5,
        filter: byClass(['minor', 'tertiary']) as never,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.street, 'line-width': width(1.8) },
      },
      {
        id: 'road',
        type: 'line',
        source: omt,
        'source-layer': 'transportation',
        filter: byClass(['primary', 'secondary', 'trunk', 'motorway']) as never,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.road, 'line-width': width(3.2) },
      },
    ],
  }
}
