# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Baton is a hackathon prototype (SVSD "Traces" storytelling hackathon). It helps people leaving a city pass on what they knew to whoever arrives next.

- Pitch: "Every city has a story. We let the last person who lived there tell it to the next."
- HMW: How might we turn the story of leaving a city into the beginning of someone else's?
- Persona: Chloe, 23, graduating from ArtCenter (LA) in two months, next city unknown.
- Hero flow: one journey through three stages, set by the user's status: **Moving** (leaving LA) → **Newcomer** (arriving in NYC) → **Local** (settled in NYC). There is no loop back.
- Content has two layers: a **private archive** (your own captures and reflections) and a **public legacy** (what you pass on), plus a **Q&A community** where locals answer newcomers' questions.
- Newcomers get recommendations from several leavers whose lifestyle matches theirs, not from one matched leaver. Locals don't meet newcomers in person.

This is a demo prototype for a video, not a production app. Favor clear, polished screens for the hero flow over backend work. Mock data is fine.

## Brand

- Font: Archivo (not loaded yet; add it via Google Fonts or `@fontsource/archivo` when screens start)
- Red `#fe4334`, purple `#4b019e`

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite` (imported in `src/index.css` with `@import "tailwindcss";`; no `tailwind.config` file, so theme tokens go in CSS with `@theme`)
- React Compiler enabled through `@rolldown/plugin-babel` in `vite.config.ts`
- ESLint 10 (flat config in `eslint.config.js`)

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # serve the production build
```

There are no tests yet. Run `npm run build` and `npm run lint` before committing.

## Layout

- `src/main.tsx`: entry point
- `src/App.tsx`: root component (still the Vite starter)
- `src/index.css`: global styles and Tailwind import
- `public/`: static assets
