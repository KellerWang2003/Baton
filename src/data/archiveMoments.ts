import type { CloudCategory } from '../ui'

// A photo from the Archive photo cloud, opened (Figma ARCHIVE_selected,
// 236:234): the daily prompt it answered, the photo in a glass circle tinted
// with its filter's color, where and when, and what she wrote. Keyed by the
// photo's cloud image (src in archiveCloud.ts); photos without a moment here
// don't open. Full-size photos are in public/archive/moments/.
export type ArchiveMoment = {
  prompt: number
  question: string
  photo: string
  category: CloudCategory
  place: string
  time: string
  note: string
}

export const archiveMoments: Record<string, ArchiveMoment> = {
  '/archive/la-cloud/3061.jpg': {
    prompt: 13,
    question: 'Where did you go today that you’ll miss?',
    photo: '/archive/moments/granite-falls.jpg',
    category: 'feeling',
    place: 'Granite Falls',
    time: '1:34 pm | July 25.2026',
    note: 'I went hiking with Jake today, it was very cold but honestly a very refreshing temp to be hiking in. The lake view was absolutely amazing and I thoroughly enjoyed my meat stick on this rock. I look like a child but that’s what I like about this photo haha',
  },
}
