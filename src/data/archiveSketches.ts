// Mock content for the Archive wireframe explorations (Debug > Archive
// sketches, or ?archive-sketches): the directions sketched before the
// photo cloud and orb won, rebuilt as clickable wireframes for the video.

// The directions that can stand in for the real Archive tab (Debug > Archive direction)
export type ArchiveSketchId = 'album' | 'cluster' | 'trace'
export const archiveDirections: { id: ArchiveSketchId; label: string }[] = [
  { id: 'album', label: 'Album' },
  { id: 'cluster', label: 'Cluster + orb' },
  { id: 'trace', label: 'Traced city' },
]

export type SketchCategory = 'feelings' | 'people' | 'places'

// 1. Photo album: one album per city, one page per place.
// A page's collage is a list of boxes in % of its frame: [left, top, width, height]
export const albumLayouts: [number, number, number, number][][] = [
  [[3, 3, 45, 30], [52, 3, 45, 45], [3, 36, 45, 38], [3, 77, 45, 20], [52, 51, 45, 46]],
  [[3, 3, 94, 40], [3, 46, 45, 51], [52, 46, 45, 24], [52, 73, 45, 24]],
  [[3, 3, 60, 55], [66, 3, 31, 26], [66, 32, 31, 26], [3, 61, 31, 36], [37, 61, 60, 36]],
  [[3, 3, 45, 94], [52, 3, 45, 45], [52, 52, 45, 45]],
]

export type AlbumPage = { place: string; visits: string; layout: number }

export const albumCities: { name: string; years: string; pages: AlbumPage[] }[] = [
  {
    name: 'Los Angeles',
    years: '2022–2026',
    pages: [
      { place: 'Enchanted Café', visits: 'Been 3 times', layout: 0 },
      { place: 'Silver Lake rooftop', visits: 'Been 5 times', layout: 1 },
      { place: 'Trader Joe’s, Hillhurst', visits: 'Been 12 times', layout: 2 },
      { place: 'Echo Park lake', visits: 'Been 2 times', layout: 3 },
    ],
  },
  {
    name: 'Seoul',
    years: '2004–2022',
    pages: [
      { place: 'Mangwon market', visits: 'Been 40 times', layout: 2 },
      { place: 'Han river, Yeouido', visits: 'Been 9 times', layout: 0 },
    ],
  },
  {
    name: 'Chicago',
    years: 'Summer 2021',
    pages: [
      { place: 'Lake Shore path', visits: 'Been 6 times', layout: 1 },
      { place: 'The Bean at 6 AM', visits: 'Been once', layout: 3 },
    ],
  },
]

// 2. Photo cluster + orb: what an opened circle says, per category
export const clusterMoments: Record<SketchCategory, { title: string; when: string }[]> = {
  feelings: [
    { title: 'Granite Falls hike', when: 'Mar 9 · 8:12 AM' },
    { title: 'Last night in the studio', when: 'Nov 30 · 1:48 AM' },
    { title: 'Rain on Fountain Ave', when: 'Feb 2 · 5:20 PM' },
  ],
  people: [
    { title: 'Jenna and the moving truck', when: 'Aug 21 · 10:05 AM' },
    { title: 'Hillside contest shoot', when: 'Apr 17 · 3:30 PM' },
    { title: 'Boba with Keller', when: 'Oct 4 · 9:40 PM' },
  ],
  places: [
    { title: 'Silver Lake rooftop', when: 'Jun 14 · 7:42 PM' },
    { title: 'Palm Springs', when: 'Jan 12 · 4:15 PM' },
    { title: 'Enchanted Café', when: 'Sep 28 · 11:02 AM' },
  ],
}

// 3. Contact sheet of days: the little things kept, cycled through her last year
export const dayCaptions = [
  'Oat latte, window seat',
  'Laundry, Sunday 9 PM',
  'Jenna’s couch',
  'Sunset from the 2 bus',
  'Trader Joe’s flowers',
  'Studio until 2 AM',
  'Echo Park, the ducks',
  'Philz, mint mojito',
  'Walked home the long way',
  'Rooftop, nobody else up there',
]

// 4. Traced city: her places on a wireframe LA (phone points), and every
// moment in order, as the place it happened
export const tracePlaces = [
  { name: 'Home', x: 265, y: 300 },
  { name: 'Enchanted Café', x: 212, y: 342 },
  { name: 'Trader Joe’s', x: 250, y: 395 },
  { name: 'ArtCenter', x: 322, y: 188 },
  { name: 'Silver Lake rooftop', x: 140, y: 300 },
  { name: 'Echo Park', x: 122, y: 378 },
  { name: 'Jenna’s', x: 86, y: 250 },
  { name: 'Malibu', x: 30, y: 440 },
  { name: 'Santa Monica', x: 100, y: 498 },
]

export const traceVisits = [0, 3, 0, 1, 2, 0, 3, 3, 4, 1, 0, 6, 2, 3, 1, 5, 0, 7, 3, 1, 2, 0, 4, 6, 3, 1, 8, 0, 2, 3, 1, 5, 4, 0, 1, 2, 6, 3, 1, 0]

// Sep 2022 to Dec 2026
export const traceMonths = 51
