import Anthropic from '@anthropic-ai/sdk'

// Debug > Real-life: reads the line she wrote about her photo and says what
// it's mostly about, so her photo glows that filter's color (Feeling pink,
// People yellow, Places blue). A Vercel function at /api/classify; in local
// dev the Vite config serves the same handler. Needs ANTHROPIC_API_KEY (Vercel
// project settings, or .env.local); the app falls back to a word count when
// this isn't available.

const categories = ['feeling', 'people', 'places'] as const
type Category = (typeof categories)[number]

const system = `You sort short journal notes for a memory app. Someone took a photo for a daily prompt and wrote a line about it. Decide what the note is mostly about:
- "feeling": an emotion, a mood, or what the moment meant to them
- "people": someone they were with or thinking of, or time spent together
- "places": the place itself, what it looks like, or a detail about being there
Pick the one that best fits the note as a whole, not single words. If it's a mix, choose what the writer cares about most.`

let client: Anthropic | null = null

async function classify(text: string, question: string): Promise<Category> {
  client ??= new Anthropic()
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2048,
    // If a safety classifier declines, the server re-runs it on a fallback model
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: { category: { type: 'string', enum: [...categories] } },
          required: ['category'],
          additionalProperties: false,
        },
      },
    },
    system,
    messages: [{ role: 'user', content: `Prompt: ${question}\nTheir note: ${text}` }],
  })
  if (response.stop_reason === 'refusal') throw new Error('declined')
  const block = response.content.find((part) => part.type === 'text')
  const category = block?.type === 'text' ? (JSON.parse(block.text) as { category?: string }).category : undefined
  if (!categories.includes(category as Category)) throw new Error('no category')
  return category as Category
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { text, question } = (await request.json()) as { text?: unknown; question?: unknown }
    if (typeof text !== 'string' || !text.trim()) return Response.json({ error: 'empty' }, { status: 400 })
    const category = await classify(text.slice(0, 2000), typeof question === 'string' ? question : '')
    return Response.json({ category })
  } catch (error) {
    console.error('classify failed', error)
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
