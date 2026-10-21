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
