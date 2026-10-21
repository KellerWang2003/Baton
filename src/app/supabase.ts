import { createClient } from '@supabase/supabase-js'
import type { ArchiveMoment } from '../data/archiveMoments'
import type { CloudCategory, CloudPhoto } from '../ui/PhotoCloud'
import { setState } from './store'

// Captures persist in Supabase (table `captures`, bucket `capture-photos`; see
// docs/supabase.sql). No sign-in in the prototype: each browser gets a random
// device id and only asks for its own rows. Without VITE_SUPABASE_URL and
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

// Bring this browser's saved captures back into LA's cloud (once, on start)
export async function loadSavedCaptures() {
  if (!client) return
  try {
    const { data, error } = await client.from('captures').select('*').eq('device_id', deviceId()).order('created_at')
    if (error) throw error
    const addedPhotos: CloudPhoto[] = []
    const addedMoments: Record<string, ArchiveMoment> = {}
    for (const row of (data ?? []) as Row[]) {
      if (!row.photo_path || !row.category || row.x === null || row.y === null || row.size === null) continue
      const src = client.storage.from(BUCKET).getPublicUrl(row.photo_path).data.publicUrl
      addedPhotos.push({ src, category: row.category, x: row.x, y: row.y, size: row.size })
      addedMoments[src] = {
        prompt: row.prompt_number ?? 0,
        question: row.question ?? '',
        photo: src,
        category: row.category,
        place: row.place ?? '',
        time: row.time_label ?? '',
        note: row.note,
      }
    }
    setState((s) => ({
      addedPhotos: [...addedPhotos, ...s.addedPhotos.filter((p) => !(p.src in addedMoments))],
      addedMoments: { ...addedMoments, ...s.addedMoments },
    }))
  } catch (error) {
    console.warn('[baton] Could not load saved captures', error)
  }
}

// Debug panel: forget this browser's saved captures
export async function clearSavedCaptures() {
  if (!client) return
  const device = deviceId()
  const { data } = await client.from('captures').select('photo_path').eq('device_id', device)
  const paths = (data ?? []).map((row) => row.photo_path as string | null).filter((p): p is string => !!p)
  if (paths.length) await client.storage.from(BUCKET).remove(paths)
  await client.from('captures').delete().eq('device_id', device)
  setState({ addedPhotos: [], addedMoments: {} })
}
