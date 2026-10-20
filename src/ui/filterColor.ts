import type { CloudCategory } from './PhotoCloud'

// The filter colors on a photo orb (the Archive's opened photos and
// Real-life's reflection page), shared so they always match: each category's
// brand color, softened toward white for a pastel look, glowing in from the
// edge as a CSS gradient and as the Fluid Glass lens's own rim tint.
export const FILTER_TINT = { feeling: 'pink', people: 'yellow', places: 'blue' } as const

// How far each color is softened toward white (Oct 20: halfway read too
// light, a quarter too pastel; pink a little stronger)
export const PASTEL: Record<CloudCategory, number> = { feeling: 0.15, people: 0.18, places: 0.18 }

// How strongly the glass tints its rim with the color
export const GLASS_RIM = 0.65

// The softened color as CSS
export const filterColor = (category: CloudCategory) =>
  `color-mix(in srgb, var(--color-baton-${FILTER_TINT[category]}) ${100 - PASTEL[category] * 100}%, var(--color-surface))`

// The softened color for the WebGL glass, which takes a plain #rrggbb
export function filterGlassColor(category: CloudCategory) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(`--color-baton-${FILTER_TINT[category]}`).trim()
  const value = parseInt(hex.replace('#', ''), 16)
  if (Number.isNaN(value)) return hex
  const channel = (shift: number) => Math.round(((value >> shift) & 255) + (255 - ((value >> shift) & 255)) * PASTEL[category])
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`
}

// The color glowing in from the edge, on a circle up to where the rim starts
export const filterGlow = (color: string) =>
  `radial-gradient(circle closest-side, transparent 72%, color-mix(in srgb, ${color} 13%, transparent) 88%, color-mix(in srgb, ${color} 30%, transparent) 100%)`

// Draws an image into a square like object-cover: the biggest centered square
// of it, so portrait camera photos aren't squeezed (the glass's picture)
export function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  const side = Math.min(image.naturalWidth, image.naturalHeight)
  const sx = (image.naturalWidth - side) / 2
  const sy = (image.naturalHeight - side) / 2
  context.drawImage(image, sx, sy, side, side, x, y, size, size)
}
