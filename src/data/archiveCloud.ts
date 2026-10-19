import type { CloudCategory, CloudPhoto } from '../ui'

// Photo cloud on a city's detail page: every photo in that city's archive as
// a small circle, scattered. Positions and sizes are from Figma
// ARCHIVE_detail default (LA28 Palms, 267:5273) on its 402pt-wide canvas,
// measured from below the status bar. Photos in public/archive/la-cloud/ are
// cropped to the circles in that frame.
//
// Each photo belongs to one filter on the orb. Feeling and People are the sharp
// photos in Figma ARCHIVE_detail feeling (267:5758) and people (312:8183);
// Figma's places frame (312:8306) still repeats People, so Places is the rest.
const la = (file: string, category: CloudCategory, x: number, figmaY: number, size: 40 | 60 = 40): CloudPhoto => ({
  src: `/archive/la-cloud/${file}.jpg`,
  category,
  x,
  y: figmaY - 54,
  size,
})

// Listed in Figma's layer order, so later photos sit on top
const laCloud: CloudPhoto[] = [
  la('2657', 'people', 144, 721),
  la('16', 'places', 104, 340, 60),
  la('18', 'feeling', 221, 456),
  la('19', 'people', 155, 446, 60),
  la('20', 'people', 221, 370),
  la('20', 'places', 165, 512),
  la('21', 'places', 221, 411),
  la('21', 'people', 195, 593),
  la('22', 'places', 50, 456),
  la('23', 'people', 124, 497),
  la('24', 'people', 311, 380),
  la('24', 'places', 276, 596),
  la('25', 'places', 261, 406),
  la('25', 'feeling', 134, 543),
  la('9479', 'feeling', 175, 360),
  la('9479', 'feeling', 271, 249),
  la('layer1', 'feeling', 175, 405.5),
  la('5efc', 'feeling', 276, 300, 60),
  la('5127', 'places', 129.5, 405.5),
  la('5127', 'people', 84, 537),
  la('3061', 'feeling', 205, 497),
  la('4747', 'feeling', 201, 305, 60),
  la('8937', 'people', 84, 405.5),
  la('8937', 'people', 135, 602),
  la('6293', 'places', 109, 451),
  la('6293', 'places', 30, 642),
  la('6635', 'feeling', 241, 525, 60),
  la('6235', 'feeling', 211, 214),
  la('2603', 'feeling', 154, 280),
  la('3686', 'places', 327, 491),
  la('4338', 'feeling', 231, 636),
  la('4056', 'people', 266, 360),
  la('b444', 'people', 271, 249),
  la('5306', 'places', 70, 240),
  la('6016', 'feeling', 129, 114),
]

export const archiveClouds: Record<string, CloudPhoto[]> = {
  la: laCloud,
}

// The orb's three filters, in the order a tap steps through them. Each takes
// one brand color (Figma: Feeling pink, People yellow, Places blue).
export const cloudFilters: { id: CloudCategory; label: string; color: 'pink' | 'yellow' | 'blue' }[] = [
  { id: 'feeling', label: 'Feeling', color: 'pink' },
  { id: 'people', label: 'People', color: 'yellow' },
  { id: 'places', label: 'Places', color: 'blue' },
]
