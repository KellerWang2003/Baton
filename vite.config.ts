import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// In local dev, serve the Vercel functions in api/ (only /api/classify for
// now: Real-life's reflection reader), with ANTHROPIC_API_KEY from .env.local
function apiRoutes(): Plugin {
  return {
    name: 'baton-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/classify', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const { POST } = (await server.ssrLoadModule('/api/classify.ts')) as { POST: (request: Request) => Promise<Response> }
        const response = await POST(
          new Request('http://localhost/api/classify', { method: req.method, headers: { 'content-type': 'application/json' }, body: Buffer.concat(chunks) }),
        )
        res.statusCode = response.status
        res.setHeader('content-type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The API keys for the dev server's functions, from .env.local (never sent to the page)
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY ??= env.ANTHROPIC_API_KEY
  process.env.TYPESAFE_API_KEY ??= env.TYPESAFE_API_KEY
  return {
    plugins: [
      apiRoutes(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    // Listen on the local network too, so the prototype opens on a phone on the
    // same wifi (npm run dev prints the Network URL)
    server: { host: true },
    // MapLibre (the live Relay map) starts its map workers much faster served as
    // is than pre-bundled
    optimizeDeps: { exclude: ['maplibre-gl'] },
  }
})
