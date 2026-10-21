import type { CloudCategory } from '../ui'

// A photo from the Archive photo cloud, opened (Figma ARCHIVE_selected,
// 236:234, ARCHIVE_selected2 334:11995, ARCHIVE_selected3 334:12028): the
// daily prompt it answered, the photo in a glass circle tinted
// with its filter's color, where and when, and what she wrote. Keyed by the
// photo's cloud image; imported photos can have empty reflection fields. The moments are
// rows in Supabase's `captures` table (one for every cloud photo). Full-size photos are in public/archive/moments/, cropped square
// as Figma shows them; the Echo Park and Silver Lake moments still use their
// small cloud crops until the originals arrive.
export type ArchiveMoment = {
  prompt: number
  question: string
  photo: string
  category: CloudCategory
  place: string
  time: string
  note: string
  // The note's tilt in degrees (Figma's -4.41 unless the frame tilts it otherwise)
  tilt?: number
  // A short question that sits on one line instead of wrapping at 232pt
  oneLine?: boolean
}

// Shown if a moment is opened before any are loaded from Supabase
export const blankMoment: ArchiveMoment = { prompt: 0, question: '', photo: '', category: 'feeling', place: '', time: '', note: '' }
