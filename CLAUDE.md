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

- Font: Archivo (loaded from Google Fonts in `index.html`; the iOS first pass uses the system font until the brand look lands)
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

## Design system (keep it swappable)

Final key visuals arrive after screens are built, so styling must be swappable from a few files. For now the first pass references Apple's iOS design (Human Interface Guidelines): system colors, SF type scale, grouped backgrounds, iOS buttons, segmented controls, bottom sheets, grouped lists and the tab bar. The team's own designs and components replace these later.

- `src/theme/tokens.css` is the only place for colors, fonts, radii and shadows (Tailwind `@theme`). Use the token utilities (`bg-surface`, `text-ink`, `text-ink-muted`, `bg-brand`, `border-line`, `rounded-card`, `shadow-card`, `font-display`) and the iOS text styles (`text-large-title`, `text-title-1..3`, `text-headline`, `text-body`, `text-subhead`, `text-footnote`, `text-caption`). Never use raw hex values or stock Tailwind colors (`bg-red-500`) in components or screens.
- Stage color: `bg-stage`, `text-stage`, etc. follow the nearest `data-stage="moving|newcomer|local"` wrapper. The app sets it from the current screen's stage.
- `src/ui/` holds the shared building blocks (Button, Card, Chip, PromptCard, VisibilityBadge, Avatar, TextField/TextArea, Screen, TabBar, SegmentedControl, BottomSheet, ListSection/ListRow). Screens compose these; if a screen needs a new look, add a variant or a new block in `src/ui/` instead of one-off styling.
- Mock content (people, places, copy) lives in `src/data/`, not in screens.
- For responsive layouts use container variants (`@md:`, `@lg:`), not viewport ones (`md:`, `lg:`), so screens respond correctly both inside the phone frame and full-window.

## Prototype shell

- `src/flow.ts`: ordered list of hero flow screens (`id`, `title`, `stage`, `component`). Add new screens here.
- The current screen is in the URL hash (`#/today`).
- The page shows only the app. A team-only debug panel (bottom left, closed by default) holds the screen list, the phone frame toggle and the design system view (`UiKit.tsx`). Open it from the Debug button in the page corner (frame on) or the small tab on the left edge (frame off), with `` ` `` (backtick), or by adding `?debug` to the URL. `←`/`→` previous/next screen and `F` toggle phone frame (remembered) work even while it is closed.
- Phone frame on: 390×844 phone centered on the page. Off: the app fills the window and is responsive.

## Layout

- `src/main.tsx`: entry point
- `src/App.tsx`: wires the flow, phone frame and debug panel
- `src/app/`: prototype shell (DeviceFrame, DebugPanel, hooks)
- `src/screens/`: one file per screen (`UiKit.tsx` shows every building block and opens from the debug panel). The tab pages (Today, Archive, Community) wrap their content in `MainLayout`, which adds the profile avatar and an iOS-style floating tab bar with a separate round capture (+) button. Profile and Capture are pushed pages built on `Screen` with a back button and no tab bar; `goBack()` in `src/app/navigate.ts` returns to the previous screen
- `src/ui/`: shared building blocks
- `src/theme/tokens.css`: design tokens
- `src/data/`: mock content
- `public/`: static assets
