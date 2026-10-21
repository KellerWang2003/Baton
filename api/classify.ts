import { choice, TypeSafeClient } from '@typesafe-ai/sdk'

// Debug > Real-life: reads the line she wrote about her photo and says what
// it's mostly about, so her photo glows that filter's color (Feeling pink,
// People yellow, Places blue). A TypeSafe Choice (docs.typesafe.ai), which
// picks one and says how sure it is. A Vercel function at /api/classify; in
// local dev the Vite config serves the same handler. Needs TYPESAFE_API_KEY
// (Vercel project settings, or .env.local); the app falls back to a word count
// when this isn't available.

let client: TypeSafeClient | null = null

async function classify(text: string, question: string) {
  client ??= new TypeSafeClient()
  const { answers } = await client.systemOne({
    state: { prompt: question, note: text },
    questions: {
      category: choice(
        'Someone took a photo for `prompt` in a memory app and wrote `note` about it. What is the note mostly about, read as a whole rather than word by word? If it mixes several, pick what the writer cares about most.',
        {
          feeling: 'An emotion, a mood, or what the moment meant to them',
          people: 'Someone they were with or thinking of, or time spent together',
          places: 'The place itself, what it looks like, or a detail about being there',
        },
      ),
    },
  })
  return answers.category
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { text, question } = (await request.json()) as { text?: unknown; question?: unknown }
    if (typeof text !== 'string' || !text.trim()) return Response.json({ error: 'empty' }, { status: 400 })
    const answer = await classify(text.slice(0, 2000), typeof question === 'string' ? question : '')
    return Response.json({ category: answer.choice, confidence: answer.confidence, probabilities: answer.probabilities })
  } catch (error) {
    console.error('classify failed', error)
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
