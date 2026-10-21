import type { CloudPhoto } from './PhotoCloud'

const WIDTH = 402
const INSET = 12
const TOP = 140
const GAP = 8

function random(seed: number) {
  let value = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad)
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97)
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296
}

// A stable shuffle scatters captures through the whole cloud, independent of
// capture date. Rebuild from the current entries so additions and deletions
// reshape it, without reshuffling on every render or reopening the folder.
export function layoutCloud(photos: CloudPhoto[]): CloudPhoto[] {
  const occurrences = new Map<string, number>()
  const shuffled = photos.map((photo, index) => {
    const occurrence = occurrences.get(photo.src) ?? 0
    occurrences.set(photo.src, occurrence + 1)
    let seed = 2166136261
    for (const char of `${photo.src}:${occurrence}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619)
    return { photo, index, seed, order: random(seed) }
  }).sort((a, b) => a.order - b.order)
  const placed: CloudPhoto[] = []
  const result: CloudPhoto[] = new Array(photos.length)

  for (const [rank, { photo, index, seed }] of shuffled.entries()) {
    const radius = photo.size / 2
    const minX = INSET + radius
    const maxX = WIDTH - INSET - radius
    // Loose vertical drift and uneven gaps, rather than packing toward a
    // rectangular edge. Rank is shuffled, so new captures can land anywhere.
    const targetX = minX + random(seed + 1) * (maxX - minX)
    const targetY = TOP + radius + rank * 48 + random(seed + 2) * 90
    let spot = { x: targetX, y: targetY }
    for (let step = 0; ; step++) {
      if (step === 800) {
        // Guaranteed clear fallback below the cloud.
        spot = { x: targetX, y: Math.max(TOP, ...placed.map((item) => item.y + item.size)) + GAP + radius }
        break
      }
      const angle = step * 2.399963229728653
      const distance = 5 * Math.sqrt(step)
      spot = { x: targetX + Math.cos(angle) * distance, y: targetY + Math.sin(angle) * distance }
      if (spot.x < minX || spot.x > maxX || spot.y - radius < TOP) continue
      if (placed.every((other) =>
        Math.hypot(spot.x - other.x - other.size / 2, spot.y - other.y - other.size / 2) >= radius + other.size / 2 + GAP,
      )) break
    }
    const positioned = { ...photo, x: spot.x - radius, y: spot.y - radius }
    placed.push(positioned)
    result[index] = positioned
  }
  return result
}
