// Copies the archive's built-in photo clouds and moments (src/data/archiveCloud.ts
// and archiveMoments.ts) into the Supabase `captures` table, so they can be edited
// and deleted in Table Editor. Run docs/supabase.sql first, then: npm run seed
// Rows it adds carry a seed_key; run it with --force to delete those and add them again.
import { readFileSync } from 'node:fs'
import { archiveClouds } from '../src/data/archiveCloud.ts'
import { archiveMoments } from '../src/data/archiveMoments.ts'

const env: Record<string, string> = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
  if (match) env[match[1]] = match[2]
}
const base = `${env.VITE_SUPABASE_URL}/rest/v1/captures`
const headers = { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, 'content-type': 'application/json' }

const existing = (await (await fetch(`${base}?select=id&seed_key=not.is.null&limit=1`, { headers })).json()) as unknown[]
if (!Array.isArray(existing)) throw new Error(`Supabase said: ${JSON.stringify(existing)}`)
if (existing.length && !process.argv.includes('--force')) {
  console.log('Already seeded. Use --force to replace the seeded rows.')
  process.exit(0)
}
if (existing.length) await fetch(`${base}?seed_key=not.is.null`, { method: 'DELETE', headers })

const rows = Object.entries(archiveClouds).flatMap(([city, photos]) =>
  photos.map((photo, index) => {
    const moment = archiveMoments[photo.src]
    // The same picture can sit twice in a cloud, so the seed key counts the position
    return {
      device_id: 'seed',
      seed_key: `${city}:${index}`,
      city,
      sort: index,
      photo_path: photo.src,
      moment_photo: moment && moment.photo !== photo.src ? moment.photo : null,
      category: photo.category,
      x: photo.x,
      y: photo.y,
      size: photo.size,
      question: moment?.question ?? null,
      note: moment?.note ?? '',
      place: moment?.place ?? null,
      prompt_number: moment?.prompt ?? null,
      time_label: moment?.time ?? null,
      tilt: moment?.tilt ?? null,
      one_line: moment?.oneLine ?? null,
    }
  }),
)
const response = await fetch(base, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(rows) })
if (!response.ok) throw new Error(`Seeding failed: ${response.status} ${await response.text()}`)
console.log(`Seeded ${rows.length} photos (${rows.filter((row) => row.note).length} with moments).`)
