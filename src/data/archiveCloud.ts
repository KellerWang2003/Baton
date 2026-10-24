import type { CloudCategory, CloudPhoto } from '../ui'

// The archive's photo clouds (every city's photos and where they sit on the
// 402pt-wide canvas) and the moments they open live in Supabase, table
// `captures` (see docs/supabase.sql); edit them there. Photos in
// public/archive/ are the files the seeded rows point at.

// The orb's three filters, in the order a tap steps through them. Each takes
// one brand color (Figma: Feeling pink, People yellow, Places blue).
export const cloudFilters: { id: CloudCategory; label: string; color: 'pink' | 'yellow' | 'blue' }[] = [
  { id: 'feeling', label: 'Feeling', color: 'pink' },
  { id: 'people', label: 'People', color: 'yellow' },
  { id: 'places', label: 'Places', color: 'blue' },
]

// The canvas edges a placed photo keeps inside, and the space it keeps from
// its neighbors (about what the Figma layout leaves between its circles)
const EDGE_LEFT = 12
const EDGE_RIGHT = 390
const GAP = 3
// The folder's side tab at the top-left corner, which a photo shouldn't hide under
const TAB_RIGHT = 64
const TAB_BOTTOM = 70
// How finely free spots are searched, in pt
const SEARCH_STEP = 3
// The sizes a capture may take, largest first: it shrinks to fit a hole near
// the middle rather than going to the far end of the cloud, but only when the
// smaller spot is this much closer (pt per size step)
const CAPTURE_SIZES = [60, 50, 40]
const SHRINK_COST = 30

type Spot = { x: number; y: number; size: number }

const middleOf = (photo: Spot) => ({ x: photo.x + photo.size / 2, y: photo.y + photo.size / 2 })

// Every spot a photo of one of `sizes` could take, nearest the middle of
// `around` first (distance measured on the cluster's own oval, so a tall
// cloud fills in evenly instead of only growing at its ends; a smaller size
// counts as SHRINK_COST further per step)
function candidateSpots(around: Spot[], sizes: number[]): (Spot & { score: number })[] {
  const left = around.length ? Math.min(...around.map((photo) => photo.x)) : 101
  const right = around.length ? Math.max(...around.map((photo) => photo.x + photo.size)) : 301
  const top = around.length ? Math.min(...around.map((photo) => photo.y)) : 200
  const bottom = around.length ? Math.max(...around.map((photo) => photo.y + photo.size)) : 400
  const cx = (left + right) / 2
  const cy = (top + bottom) / 2
  const rx = Math.max(60, (right - left) / 2)
  const ry = Math.max(60, (bottom - top) / 2)
  const scale = Math.min(rx, ry)
  const spots: (Spot & { score: number })[] = []
  sizes.forEach((size, step) => {
    const r = size / 2
    const reach = Math.max(rx, ry) + size * 4
    for (let y = cy - reach; y <= cy + reach; y += SEARCH_STEP) {
      for (let x = EDGE_LEFT + r; x <= EDGE_RIGHT - r; x += SEARCH_STEP) {
        if (x - r < TAB_RIGHT && y - r < TAB_BOTTOM) continue
        const score = Math.hypot(((x - cx) / rx) * scale, ((y - cy) / ry) * scale) + step * SHRINK_COST
        spots.push({ x: x - r, y: y - r, size, score })
      }
    }
  })
  return spots.sort((a, b) => a.score - b.score)
}

// The first of `spots` clear of every photo in `placed` by GAP
function firstClear(spots: Spot[], placed: Spot[]): Spot {
  const centers = placed.map((photo) => ({ ...middleOf(photo), r: photo.size / 2 }))
  const clear = spots.find((spot) => {
    const { x, y } = middleOf(spot)
    return centers.every((other) => Math.hypot(other.x - x, other.y - y) >= other.r + spot.size / 2 + GAP)
  })
  return clear ?? spots[spots.length - 1]
}

// Where a photo added to a cloud goes (Real-life, from the reflection page):
// the free spot nearest the middle of the cluster, so it lands among the
// others without covering any. The cloud settles captures again when it's
// drawn (settleCloud), so this is only where it's saved.
export function freeSpot(photos: CloudPhoto[], size: number): { x: number; y: number } {
  const { x, y } = firstClear(candidateSpots(photos, [size]), photos)
  return { x, y }
}

// The photo each settled copy was made from, so a long-press Delete can find
// the row it came from
const settledFrom = new WeakMap<CloudPhoto, CloudPhoto>()
export const unsettled = (photo: CloudPhoto) => settledFrom.get(photo) ?? photo

// A city's cloud as it's drawn. The photos laid out in Figma (files in the
// app's public folder) stay exactly where they are; her own captures don't
// keep the spot saved with them, since that was picked against whatever the
// cloud held at the time (an archive still loading put one on top of the
// middle, and a full middle sent later ones to the far ends, leaving bands of
// empty paper). Instead each, oldest first, takes the free spot nearest the
// middle of the cluster, filling the holes deleted photos leave and never
// covering another photo.
export function settleCloud(photos: CloudPhoto[], isCapture: (photo: CloudPhoto) => boolean): CloudPhoto[] {
  const fixed = photos.filter((photo) => !isCapture(photo))
  if (fixed.length === photos.length) return photos
  const placed: Spot[] = [...fixed]
  // The spots worked out once per largest size (captures are all 60pt so far)
  const spotsFor = new Map<number, Spot[]>()
  return photos.map((photo) => {
    if (!isCapture(photo)) return photo
    if (!spotsFor.has(photo.size)) {
      const sizes = CAPTURE_SIZES.filter((size) => size <= photo.size)
      spotsFor.set(photo.size, candidateSpots(fixed, sizes.length ? sizes : [photo.size]))
    }
    const { x, y, size } = firstClear(spotsFor.get(photo.size)!, placed)
    const spot = { x, y, size }
    placed.push(spot)
    const settled = { ...photo, ...spot }
    settledFrom.set(settled, photo)
    return settled
  })
}

// New York has no captures in Supabase yet, so its folder (Newcomer, Local)
// opens a cloud of the New York placeholder photos from public/relay/: three
// from her first weeks as a Newcomer, a full cloud once she's a Local.
const newYorkPhotos: [string, CloudCategory][] = [
  ['cafe', 'places'], ['citibike', 'feeling'], ['hmart', 'places'], ['bridge', 'feeling'],
  ['laundry', 'places'], ['falafel', 'people'], ['omny', 'feeling'], ['greenpoint', 'places'],
  ['gym', 'places'], ['library', 'places'], ['market', 'people'], ['diner', 'people'],
  ['greenway', 'feeling'], ['studio', 'people'], ['climbing', 'people'], ['domino', 'feeling'],
  ['potatoes', 'people'], ['month-two', 'feeling'], ['say-yes', 'people'], ['library-tables', 'places'],
  ['gym-late', 'feeling'], ['blick', 'places'], ['ana-cafe', 'people'], ['ana-drawing-spot', 'feeling'],
]
const newYorkSizes = [104, 72, 88, 60, 96, 66, 80, 54, 92, 70, 62, 84]

function layoutCloud(files: [string, CloudCategory][], folder: string): CloudPhoto[] {
  const photos = files.reduce<CloudPhoto[]>((placed, [file, category], index) => {
    const size = newYorkSizes[index % newYorkSizes.length]
    return [...placed, { src: `/${folder}/${file}.jpg`, category, size, ...freeSpot(placed, size) }]
  }, [])
  // Start below the status bar and the folder's side tab, like LA's
  const shift = 140 - Math.min(...photos.map((photo) => photo.y))
  return photos.map((photo) => ({ ...photo, y: photo.y + shift }))
}

// Keller, Oct 21: just landed, her New York archive is still empty
export const newYorkCloud = { newcomer: [] as CloudPhoto[], local: layoutCloud(newYorkPhotos, 'relay') }

// Chicago has no captures in Supabase either: a mock cloud of the photos its
// folder summary already shows, from public/archive/
export const chicagoCloud = layoutCloud(
  [
    ['chicago-rooftop-1', 'feeling'], ['chicago-l-train', 'places'], ['chicago-lake-1', 'places'],
    ['chicago-rooftop-2', 'people'], ['chicago-lake-2', 'feeling'],
  ],
  'archive',
)

// In the middle of a city's page while it has no photos yet
export const emptyCloudPrompt = (city: string) => `Capture a moment to start\nyour ${city} archive.`
