// LA Wrapped (Figma LA WRAPPED 258:1420 and LA WRAPPED_2 236:1250, NEW YORK
// page): Chloe's 24 LA moments. The first screen shows each one as a dot, in
// order down the middle; tapping it opens the timeline where every dot
// becomes the photo or note it stands for. Positions are in the 402pt Figma
// frame (y from the top of the frame, status bar included). Photos are in
// public/wrapped/.

export type WrapColor = 'pink' | 'blue' | 'yellow'

// How a photo sits inside its 135pt circle, in % of the circle (from Figma)
type Crop = { w: number; h: number; left: number; top: number }

type MomentBase = {
  date: string
  // Year pill shown on the line above this moment
  year?: string
  color: WrapColor
}

export type WrapPhoto = MomentBase & {
  kind: 'photo'
  src: string
  // Top-left of the 135pt circle
  x: number
  y: number
  crop: Crop
}

export type WrapNote = MomentBase & {
  kind: 'note'
  text: string
  // Center of the 131pt note and its tilt
  cx: number
  cy: number
  rotate: number
}

export type WrapMoment = WrapPhoto | WrapNote

export const wrapped = {
  title: 'That’s a wrap!',
  from: 'August.22.2023',
  to: '~ December.19.2026',
  days: 'that’s 1,215 days',
  summaryTitle: '24 moments in LA',
  summaryStats: '16 photos · 8 notes · 1,215 days',
  cta: 'Continue',
  save: 'Save your LA Wrapped',
  // Hint at the bottom of the first screen (Keller, Oct 19)
  tapHint: 'Tap to see your LA chapter',
}

const full: Crop = { w: 100, h: 133.33, left: 0, top: 0 }

export const wrapMoments: WrapMoment[] = [
  { kind: 'photo', year: '2023', date: 'Sep.23', color: 'pink', src: '/wrapped/m01-sep23.jpg', x: 30, y: 279.5, crop: { ...full, top: -16.49 } },
  { kind: 'note', date: 'Nov.18', color: 'pink', text: 'Finally bought a car! Now I can go to places without worrying about the uber price.', cx: 306.5, cy: 462.4, rotate: 8.96 },
  { kind: 'photo', year: '2024', date: 'Jan.04', color: 'blue', src: '/wrapped/m03-jan04.jpg', x: 30, y: 569.5, crop: { w: 135.43, h: 101.57, left: -17.72, top: -1.57 } },
  { kind: 'photo', date: 'Mar.11', color: 'yellow', src: '/wrapped/m04-mar11.jpg', x: 237, y: 679.5, crop: { w: 100, h: 177.78, left: 0, top: -48.57 } },
  { kind: 'photo', date: 'May.03', color: 'pink', src: '/wrapped/m05-may03.jpg', x: 30, y: 789.5, crop: { w: 100, h: 177.78, left: 0, top: -77.78 } },
  { kind: 'note', date: 'Aug.14', color: 'blue', text: 'It’s been so hot lately, so I went to the beach with my friend.', cx: 306.5, cy: 965.4, rotate: -7.92 },
  { kind: 'photo', date: 'Oct.26', color: 'pink', src: '/wrapped/m07-oct26.jpg', x: 26, y: 1009, crop: { ...full, top: -13.81 } },
  { kind: 'note', date: 'Dec.07', color: 'blue', text: 'Friendsgiving at Jisoo’s. Way too much food, not enough chairs.', cx: 307, cy: 1183, rotate: 9 },
  { kind: 'photo', year: '2025', date: 'Jan.25', color: 'blue', src: '/wrapped/m09-jan25.jpg', x: 30, y: 1299, crop: { w: 116.12, h: 154.74, left: -8.67, top: -37.04 } },
  { kind: 'note', date: 'Mar.08', color: 'yellow', text: 'First all-nighter in the studio. Never again (it won’t be the last).', cx: 307, cy: 1485, rotate: -8 },
  { kind: 'photo', date: 'Apr.19', color: 'pink', src: '/wrapped/m11-apr19.jpg', x: 30, y: 1519, crop: { w: 100.5, h: 134, left: 0, top: -17 } },
  { kind: 'photo', date: 'Jun.07', color: 'yellow', src: '/wrapped/m12-jun07.jpg', x: 237, y: 1630, crop: { w: 180, h: 101.25, left: -40, top: -0.63 } },
  { kind: 'note', date: 'Jul.26', color: 'blue', text: 'Internship wrapped! Celebrated with tacos in Highland Park.', cx: 96, cy: 1803, rotate: 9 },
  { kind: 'photo', date: 'Sep.06', color: 'pink', src: '/wrapped/m14-sep06.jpg', x: 237, y: 1850, crop: { w: 100.12, h: 178, left: 0, top: -39 } },
  { kind: 'photo', date: 'Oct.25', color: 'blue', src: '/wrapped/m15-oct25.jpg', x: 23, y: 1956, crop: { ...full, top: -22.44 } },
  { kind: 'photo', date: 'Dec.13', color: 'blue', src: '/wrapped/m16-dec13.jpg', x: 237, y: 2069, crop: { w: 99.75, h: 133, left: 0, top: -8.2 } },
  { kind: 'note', year: '2026', date: 'Feb.07', color: 'yellow', text: 'Started my last term. Already missing things that haven’t ended yet.', cx: 96, cy: 2325, rotate: -8 },
  { kind: 'photo', date: 'Mar.21', color: 'pink', src: '/wrapped/m18-mar21.jpg', x: 237, y: 2360, crop: { ...full, top: -20.21 } },
  { kind: 'photo', date: 'May.09', color: 'yellow', src: '/wrapped/m19-may09.jpg', x: 30, y: 2469, crop: full },
  { kind: 'photo', date: 'Jun.20', color: 'blue', src: '/wrapped/m20-jun20.jpg', x: 245, y: 2580, crop: { ...full, top: -3.47 } },
  { kind: 'photo', date: 'Aug.01', color: 'blue', src: '/wrapped/m21-aug01.jpg', x: 30, y: 2689, crop: { w: 173.44, h: 100, left: -47.35, top: 0 } },
  { kind: 'note', date: 'Sep.26', color: 'yellow', text: 'Got the New York offer!! Told everyone at Griffith at sunset.', cx: 307, cy: 2863, rotate: 9 },
  { kind: 'photo', date: 'Nov.07', color: 'blue', src: '/wrapped/m23-nov07.jpg', x: 30, y: 2909, crop: { ...full, top: -16.29 } },
  { kind: 'note', date: 'Dec.19', color: 'yellow', text: 'Graduation day. Thank you, LA. New York, here I come.', cx: 307, cy: 3095, rotate: -8 },
]

// Timeline geometry (Figma LA WRAPPED_2): the line, and where pills sit on it
export const wrapLine = { x: 201.5, top: 277, height: 2810 }
// Top of each moment's date pill (55x30, centered on the line), in moment
// order; a year pill sits 70pt above the date pill of the year's first moment
export const datePillTops = [332, 442, 622, 732, 842, 952, 1062, 1172, 1352, 1462, 1572, 1682, 1792, 1902, 2012, 2122, 2302, 2412, 2522, 2632, 2742, 2852, 2962, 3072]

// The dots on the first screen (Figma LA WRAPPED): 15pt, 21pt apart
export const wrapDots = { size: 15, top: 273, gap: 21 }

// Hand-drawn doodles, cut from two sprite sheets (crop in % of the box)
export const wrapDoodles = [
  { src: '/wrapped/doodles-a.png', x: 305, y: 347, w: 65, h: 103, crop: { w: 1150.72, h: 1047.62, left: -662.46, top: -39.46 } },
  { src: '/wrapped/doodles-a.png', x: 26, y: 539, w: 142, h: 67, crop: { w: 656.11, h: 2035.94, left: -211.05, top: -391.77 } },
  { src: '/wrapped/doodles-a.png', x: 300, y: 959, w: 72, h: 64, crop: { w: 1225.89, h: 2006, left: -716.14, top: -963.76 } },
  { src: '/wrapped/doodles-a.png', x: 282, y: 1487, w: 72, h: 64, crop: { w: 1225.89, h: 2006, left: -702.89, top: -1672.76 } },
  { src: '/wrapped/doodles-b.png', x: 34, y: 1701, w: 137, h: 167, crop: { w: 623.57, h: 739.81, left: -219.77, top: -51.72 } },
  { src: '/wrapped/doodles-b.png', x: 104, y: 2334, w: 54, h: 50, crop: { w: 1582.03, h: 2470.97, left: -686.91, top: -1403.06 } },
  { src: '/wrapped/doodles-b.png', x: 289, y: 2324, w: 88, h: 64, crop: { w: 970.79, h: 1930.45, left: -615.43, top: -1071.24 } },
  { src: '/wrapped/doodles-b.png', x: 219, y: 3126, w: 88, h: 64, crop: { w: 970.79, h: 1930.45, left: -601.97, top: -1683.57 } },
]

// Summary under the timeline
export const wrapSummary = { titleTop: 3219, colorsTop: 3289, ctaTop: 3328, height: 3410 }
