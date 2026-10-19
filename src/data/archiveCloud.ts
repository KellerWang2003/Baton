import type { CloudCategory, CloudPhoto } from '../ui'

// Photo cloud on a city's detail page: every photo in that city's archive as
// a circle, scattered on the 402pt-wide canvas of Figma ARCHIVE_detail
// default (LA28 Palms, 334:12257), y measured from the top of that frame.
// Photos in public/archive/la-cloud/ are the circle crops from Figma (that
// frame, plus "more photos" 334:11949).
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

// Laid out exactly as Figma ARCHIVE_detail default (334:12257), in its layer
// order so later photos sit on top. The frame shows five photos twice (21, 25,
// 5127, 8937, 6293), and so does this.
const laCloud: CloudPhoto[] = [
  la('2657', 'people', 138, 722),
  la('16', 'places', 161, 326),
  la('18', 'feeling', 218, 455),
  la('19', 'people', 155, 446, 60),
  la('20', 'people', 161, 507),
  la('21', 'places', 218, 411),
  la('21', 'places', 252, 569),
  la('22', 'places', 50, 470),
  la('23', 'people', 30, 400),
  la('24', 'people', 191, 294),
  la('25', 'places', 261, 406),
  la('25', 'places', 134, 543),
  la('9479', 'feeling', 146, 366),
  la('layer1', 'feeling', 175.0, 405.5),
  la('5efc', 'feeling', 261, 447, 60),
  la('5127', 'places', 129.5, 405.5),
  la('5127', 'places', 90, 549),
  la('3061', 'feeling', 219, 511, 60),
  la('4747', 'feeling', 191, 350, 60),
  la('8937', 'people', 84, 405.5),
  la('8937', 'people', 135, 602),
  la('6293', 'places', 114, 446),
  la('6293', 'places', 30, 642),
  la('6635', 'feeling', 178, 547),
  la('2603', 'feeling', 80, 360),
  la('3686', 'places', 283, 521),
  la('4338', 'feeling', 202, 596),
  la('4056', 'people', 254, 365),
  la('b444', 'people', 221, 264),
  la('5306', 'places', 222, 181),
  la('6016', 'feeling', 106, 240),
  la('6330', 'people', 97, 489, 60),
  la('5706', 'places', 232, 304, 60),
  la('4754', 'places', 292, 108),
  la('5021', 'places', 118, 326),
  la('6123', 'places', 295, 565),
  la('4707', 'people', 355, 507),
  la('4743', 'feeling', 170, 244),
  la('11951', 'people', 297, 386),
  la('4830', 'places', 302, 336),
  la('4708', 'people', 54, 311),
  la('11960', 'feeling', 315, 426),
  la('4721', 'feeling', 276, 648),
  la('6314', 'places', 326, 266),
  la('6329', 'places', 131, 140),
  la('4959', 'feeling', 306, 738),
  la('4885', 'people', 278, 48),
  la('4713', 'feeling', 25, 254),
  la('6270', 'people', 171, 652),
  la('6264', 'feeling', 373, 340),
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
