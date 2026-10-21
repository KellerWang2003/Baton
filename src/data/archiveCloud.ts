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

// Where a photo added to a cloud goes (Real-life, from the reflection page):
// the first free spot spiraling out from the middle of the cluster, so it
// lands among the others without covering any
export function freeSpot(photos: CloudPhoto[], size: number): { x: number; y: number } {
  const center = (photo: CloudPhoto) => ({ x: photo.x + photo.size / 2, y: photo.y + photo.size / 2 })
  const middle = photos.reduce((sum, photo) => ({ x: sum.x + center(photo).x, y: sum.y + center(photo).y }), { x: 0, y: 0 })
  const cx = photos.length ? middle.x / photos.length : 201
  const cy = photos.length ? middle.y / photos.length : 300
  for (let step = 0; step < 4000; step++) {
    const angle = step * 0.35
    const radius = step * 0.6
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (x - size / 2 < 12 || x + size / 2 > 390) continue
    const clear = photos.every((photo) => {
      const other = center(photo)
      return Math.hypot(other.x - x, other.y - y) >= (photo.size + size) / 2 + 4
    })
    if (clear) return { x: x - size / 2, y: y - size / 2 }
  }
  return { x: cx - size / 2, y: cy - size / 2 }
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

function layoutCloud(count: number): CloudPhoto[] {
  const photos = newYorkPhotos.slice(0, count).reduce<CloudPhoto[]>((placed, [file, category], index) => {
    const size = newYorkSizes[index % newYorkSizes.length]
    return [...placed, { src: `/relay/${file}.jpg`, category, size, ...freeSpot(placed, size) }]
  }, [])
  // Start below the status bar and the folder's side tab, like LA's
  const shift = 140 - Math.min(...photos.map((photo) => photo.y))
  return photos.map((photo) => ({ ...photo, y: photo.y + shift }))
}

// Keller, Oct 21: just landed, her New York archive is still empty
export const newYorkCloud = { newcomer: [] as CloudPhoto[], local: layoutCloud(newYorkPhotos.length) }

// In the middle of a city's page while it has no photos yet
export const emptyCloudPrompt = (city: string) => `Capture a moment to start\nyour ${city} archive.`
