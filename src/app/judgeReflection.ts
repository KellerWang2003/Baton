import { reflectionCategory } from '../data/reflection'
import type { CloudCategory } from '../ui/PhotoCloud'

const categories: CloudCategory[] = ['feeling', 'people', 'places']

// What a reflection is mostly about (Real-life): asks TypeSafe through
// /api/classify (api/classify.ts), which reads the note as a whole. If that
// isn't available (no API key yet, offline, slow), it falls back to the word
// count in data/reflection, so filming never gets stuck.
export async function judgeReflection(text: string, question: string): Promise<CloudCategory> {
  if (!text.trim()) return reflectionCategory(text)
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, question }),
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) {
      const { category } = (await response.json()) as { category?: string }
      if (categories.includes(category as CloudCategory)) return category as CloudCategory
    }
  } catch {
    // Falls through to the word count
  }
  return reflectionCategory(text)
}
