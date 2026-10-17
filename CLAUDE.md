# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Baton is a hackathon prototype for the SVSD "Traces" storytelling hackathon. It helps people leaving a city pass on what they knew to whoever arrives next. The deliverable is a **video (target 6:50, hard cap 7:00) due Mon Oct 19 2026, 11:59 PM PT**; this app exists to be screen-recorded for section 5 of that video. It is a demo, not a production app: favor clear, polished screens for the story over backend work. Mock data is fine and nothing needs to persist.

- Pitch: "Every city has a story. We let the last person who lived there tell it to the next."
- HMW: "How might we turn the story of leaving a city into the beginning of someone else's?"
- Why "Baton": a relay. You carry it for a while, then hand it off.
- Core pain: adapting to the new city while looking back on the old one. International students mostly "just suck it up". The person who left right before you knew all the small stuff, but it only reached whoever asked, then left with them.
- Audience: college students and new grads moving to a new city for the first time (international students are the sharpest case).

### Key decisions (don't undo these)

- **Not tied to any school.** No school email gating, no school-only communities or legacies. Communities are by city.
- **One journey with three stages, not three user types.** The user sets their status, and each status unlocks different features: **Moving** (leaving LA) -> **Newcomer** (arriving in NYC) -> **Local** (settled in NYC).
- **Private archive first, public legacy only when you leave.** While living somewhere you capture places, feelings and people into a private archive (only you see it). When you leave, you choose which parts to make public: that's your **legacy**. No continuous public posting, so it doesn't turn into Yelp or Instagram.
- **Recommendations come from several lifestyle-matched leavers**, not one matched leaver. Community recommendations are drawn from legacies.
- **Locals don't meet newcomers in person.** Locals only answer questions in Q&A.
- **Notes go on a recommendation, not on a whole legacy.** A legacy as a whole is only seen by its author (Archive > Legacy). People can leave a note on a recommendation, including how it helped.
- **Daily prompts ask for an angle, not a subject**, take seconds, and have no streaks or counts. Full prompt list and rules: `docs/daily-prompts.md`. The demo bookend is "The view from where you always stand", asked at her LA café (Moving) and again at her NYC spot (Local), shown side by side.

### Persona: Chloe

Chloe, 23, final term at ArtCenter in LA. Came to LA alone four years ago. She signs a job offer that needs her in New York and leaves Dec 19. Pains: the ending won't sink in, her everyday life isn't in her camera roll, what she knows only reaches whoever asks, and the last week goes to boxes and chores. Her café is the thread through all three stages. Mock data for her is in `src/data/people.ts`.

### Information architecture

- Onboarding (outside the tabs): sign up, photo and location access seeds the archive (keep or remove places; most-visited places seed the first prompts), set status, pick logistics to-dos, optional Instagram tag.
- Tab bar: **Today** (daily prompt card, logistics to-dos, hint cards; one screen with a different state per stage), **Archive** (segmented: My archive / Legacy, incl. what you left and notes on it), **Community** (segmented: Recommendations with Places / Logistics / Mentality filters and a map toggle for places / Q&A).
- **+ (Capture)**: its own pushed page to add photos or write a short reflection on the daily prompt. Tapping the daily prompt card on Today opens the same page.
- **Profile**: reached from the avatar at top right; a pushed page with no tab bar. Status, city, lifestyle.
- Proposed, not yet agreed: a Rolling Paper (friends' notes) under Archive > Legacy; lifestyle asked when switching to Newcomer, editable in Profile.

### Prototype flows to build (from the video script, in story order)

Status: flow 1 (onboarding) is built. The tab pages, Capture and Profile exist as shells. Everything else below still needs building.

| # | Flow | Stage | What it must show |
|---|---|---|---|
| 1 | Onboarding | Moving | Sign up, import photos into a list of places to reflect on, set status to Leaver, pick logistics to-dos, optional Instagram tag |
| 2 | Today, Moving | Moving | Logistics to-do list and the daily prompt card |
| 3 | Daily prompt to archive | Moving | Answer a light prompt in seconds (Capture page), then see it land in Archive |
| 4 | Place arrival prompt | Moving | Notification at her café or gym, reflect why with a few options ("Trader Joe's next door"), saved to archive |
| 5 | Friend's note | Moving | A friend taps her Instagram tag and writes Chloe a note (can be a single web screen) |
| 6 | LA Wrapped to legacy | Moving | Last-night recap, choose public or private for each piece of her legacy, then write and seal a letter to her future self |
| 7 | Landing | Newcomer | Rolling Paper opens with friends' notes, then set status to Newcomer |
| 8 | Today, Newcomer | Newcomer | Arrival to-dos and the gym hint card (a gym with a Trader Joe's next door, from someone else's legacy) |
| 9 | Recommendation detail | Newcomer | Community with the gym's detail and more lifestyle-matched recs, then leave a note on that recommendation |
| 10 | Q&A | Newcomer | Ask for tips, see a local's answer |
| 11 | Local | Local | Status to Local, the sealed letter opens, same prompt side by side with LA, answer a newcomer's question, write a new letter to her future self (sealed until her next move) |

Add each screen to `src/flow.ts` in this order with the right `stage`, so the debug panel and arrow keys walk the story.

### References

- Video script (sections, timings, open questions): https://claude.ai/code/artifact/0006d5b1-3944-4465-830f-6c4e719ac6b4
- IA / sitemap: https://claude.ai/artifact/PWUnEL55i417nhKU7JyF1e
- Hero flow: https://claude.ai/artifact/KEV2PLbe4kEYXtLV8jKji7
- Figma design file "LA28 Palms" (file key `Ee8SrVUeOgEZ7dScYXN6y9`): feature map frame 194:18, feature timeline 203:77
- FigJam board "LA28" (file key `gNyglKW1dULTnCi8DwGWh0`): pitch, persona, features, brainstorm
- Deployed on Vercel (project "baton"): `main` is production, every PR gets a preview link

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

Workflow: branch off `main`, open a PR, check the Vercel preview link on it, merge when Keller approves.

## Design system (keep it swappable)

Final key visuals arrive after screens are built, so styling must be swappable from a few files. For now the first pass references Apple's iOS design (Human Interface Guidelines) in **grayscale only, no color yet** (Keller's call): SF type scale, grouped backgrounds, iOS buttons, segmented controls, bottom sheets, grouped lists and the tab bar. The team's own designs and components replace these later.

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
- `src/data/`: mock content (`pages.ts` holds page copy and today's prompt, `onboarding.ts` the onboarding copy, found places and to-dos)
- `src/app/store.ts`: tiny in-memory store for choices that carry across screens (status, kept places, picked to-dos, Instagram handle). Nothing persists
- `docs/daily-prompts.md`: daily prompt list per stage and the rules prompts follow
- `public/`: static assets
