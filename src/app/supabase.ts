import { createClient } from '@supabase/supabase-js'
import type { ArchiveMoment } from '../data/archiveMoments'
import type { CloudCategory, CloudPhoto } from '../ui/PhotoCloud'
import { setState } from './store'

// Captures persist in Supabase (table `captures`, bucket `capture-photos`; see
// docs/supabase.sql). No sign-in in the prototype: there is one shared archive,
// so every device that opens the app sees every capture (rows still note the
// device that made them). Without VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY in .env.local, everything stays in memory as before.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const client = url && key ? createClient(url, key) : null

const BUCKET = 'capture-photos'
const DEVICE_KEY = 'baton:device-id'

function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

type Row = {
  id: string
  city: string
  seed_key: string | null
  moment_photo: string | null
  tilt: number | null
  one_line: boolean | null
  photo_path: string | null
  question: string | null
  note: string
  category: CloudCategory | null
  place: string | null
  prompt_number: number | null
  time_label: string | null
  x: number | null
  y: number | null
  size: number | null
}

export type CaptureToSave = {
  photo: Blob | null
  question: string
  note: string
  category: CloudCategory | null
  place: string
  promptNumber: number
  timeLabel: string
  spot: { x: number; y: number; size: number } | null
}

// Save one capture: the photo file, then its row. Fire and forget; a failure
// is logged and the session carries on in memory.
export async function saveCapture(capture: CaptureToSave) {
  if (!client) return
  try {
    const device = deviceId()
    let photoPath: string | null = null
    if (capture.photo) {
      photoPath = `${device}/${crypto.randomUUID()}.jpg`
      const { error } = await client.storage.from(BUCKET).upload(photoPath, capture.photo, { contentType: capture.photo.type || 'image/jpeg' })
      if (error) throw error
    }
    const { error } = await client.from('captures').insert({
      device_id: device,
      photo_path: photoPath,
      question: capture.question,
      note: capture.note,
      category: capture.category,
      place: capture.place,
      prompt_number: capture.promptNumber,
      time_label: capture.timeLabel,
      x: capture.spot?.x ?? null,
      y: capture.spot?.y ?? null,
      size: capture.spot?.size ?? null,
    })
    if (error) throw error
  } catch (error) {
    console.warn('[baton] Could not save the capture', error)
  }
}

// A photo's address: a link or a file in the app's public folder as written,
// anything else is a path in the capture-photos bucket
function photoUrl(path: string) {
  if (!client || path.startsWith('/') || path.startsWith('http')) return path
  return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Bring the saved archive back (once, on start). When the archive has been
// seeded (npm run seed), every city's cloud and moments come from here and
// the data files in src/data are only the fallback; otherwise only the
// captures are loaded, into LA's cloud, as before.
export async function loadSavedCaptures() {
  if (!client) return
  try {
    let { data, error } = await client.from('captures').select('*').order('sort', { nullsFirst: false }).order('created_at')
    // Before the archive columns are added (docs/supabase.sql), there is no sort column
    if (error) ({ data, error } = await client.from('captures').select('*').order('created_at'))
    if (error) throw error
    const rows = ((data ?? []) as Row[]).filter((row) => row.photo_path && row.category && row.x !== null && row.y !== null && row.size !== null)
    const seeded = rows.some((row) => row.seed_key)
    const clouds: Record<string, CloudPhoto[]> = {}
    const moments: Record<string, ArchiveMoment> = {}
    for (const row of rows) {
      const src = photoUrl(row.photo_path!)
      const category = row.category!
      const city = seeded ? row.city : 'la'
      ;(clouds[city] ??= []).push({ src, category, x: row.x!, y: row.y!, size: row.size! })
      if (row.note.trim()) {
        moments[src] = {
          prompt: row.prompt_number ?? 0,
          question: row.question ?? '',
          photo: row.moment_photo ? photoUrl(row.moment_photo) : src,
          category,
          place: row.place ?? '',
          time: row.time_label ?? '',
          note: row.note,
          ...(row.tilt !== null ? { tilt: row.tilt } : {}),
          ...(row.one_line ? { oneLine: true } : {}),
        }
      }
    }
    if (seeded) {
      setState({ archive: { clouds, moments } })
    } else {
      setState((s) => ({
        addedPhotos: [...(clouds.la ?? []), ...s.addedPhotos.filter((p) => !(p.src in moments))],
        addedMoments: { ...moments, ...s.addedMoments },
      }))
    }
  } catch (error) {
    console.warn('[baton] Could not load saved captures', error)
  }
}

// Debug panel: forget the captures made in the app (the seeded archive stays)
export async function clearSavedCaptures() {
  if (!client) return
  const { data } = await client.from('captures').select('photo_path').is('seed_key', null)
  const paths = (data ?? []).map((row) => row.photo_path as string | null).filter((p): p is string => !!p && !p.startsWith('/') && !p.startsWith('http'))
  if (paths.length) await client.storage.from(BUCKET).remove(paths)
  await client.from('captures').delete().is('seed_key', null)
  setState({ addedPhotos: [], addedMoments: {} })
  await loadSavedCaptures()
}
