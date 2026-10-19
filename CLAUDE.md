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
- **No Q&A** (Keller, Oct 18). Relay is recommendations only. Locals don't meet newcomers in person.
- **Notes go on a recommendation, not on a whole legacy.** A legacy as a whole is only seen by its author (Archive > Legacy). People can leave a note on a recommendation, including how it helped.
- **No letter to your future self** (Keller, Oct 17: cringe and cliché). Its place is taken by the intention question below.
- **The last night in LA is the legacy review.** She gets a last view of her LA legacy, picks what to publish, and her lifestyle snapshot is captured from it. Then she's asked her intention for the new city (what she wants to achieve, what she imagines). That intention seeds suggestions when she arrives, and becoming a Local shows an insight page comparing her lifestyle to the LA snapshot and her progress toward the intention.
- **LA Wrapped happens after landing**, combined with the Rolling Paper of friends' notes: her LA lifestyle and the notes people left her, seen together. Order (Keller, Oct 19): the Newcomer splash's "Check it out" opens the Rolling Paper, whose bottom button opens LA Wrapped, whose Continue goes to Today.
- **Daily prompts are plain and verb-first** (Keller, Oct 17: no poetic wording; "Take a photo of...", "Write one tip..."). They ask for an angle, not a subject, take seconds, and have no streaks or counts. Full prompt list and rules: `docs/daily-prompts.md`. The demo bookend is "Take a photo of the view from the café seat you always sit in", asked at her LA café (Moving) and again at her NYC spot (Local), shown side by side.

### Persona: Chloe

Chloe, 23, final term at ArtCenter in LA. Came to LA alone four years ago. She signs a job offer that needs her in New York and leaves Dec 19. Pains: the ending won't sink in, her everyday life isn't in her camera roll, what she knows only reaches whoever asks, and the last week goes to boxes and chores. Her café is the thread through all three stages. Mock data for her is in `src/data/people.ts`.

### Information architecture

- Onboarding (outside the tabs): feature overview (full-bleed slides, no skip), create account (no back button), Tell us about yourself (three stage cards in fixed order: Moving soon, Just arrived, Settled in; the picked one expands in place, tags below), photo access, a Welcome to Baton splash, then Today with "Finish setting up" as dashed-outline swipeable cards under the prompt: organize the archive from imported photos (keep or remove places; most-visited places seed the first prompts), pick logistics to-dos, add when you leave (flight or a rough date, Moving only), add the Instagram tag.
- Tab bar: **Today** (one screen with a different state per stage; top to bottom: the daily prompt in a glass circle (tap opens the + field), Finish setting up as dashed-outline swipeable cards (dashed = temporary), then Before you leave as a list of cards: a legacy card in the last week before leaving, her to-dos (tap opens tips from people who did it before) and suggested to-dos for the stage; hint cards still to come), **Archive** (segmented: My archive / Legacy, incl. what you left and notes on it), **Relay** (formerly Community; route id is still `community`; no sub-tabs. It follows Figma Relay 265:2550: category filter chips, gray until picked, then filled with their category color (All, Food, Groceries, Exercise, Housing, Getting around, Setup, Hobbies, Feelings) with search at the end, then "Based on your life in LA" (Baton's picks) and "From people with similar lifestyle" (a row of quote cards per person under "Maya's legacy"). Every card takes its category's color, set in `relayCategories`. Any card opens `relay-detail`, with notes and a Leave a note sheet. A blue "Map view" pill above the nav slides the whole page, filters included, down like a sheet (AllTrails list/map) to a 161pt peek (48pt corners as in Figma 268:3798, Keller later asked for only the filters to show) over a real New York map you can drag, pinch and scroll to zoom (`LiveMap` in `src/ui/`: MapLibre on free OpenFreeMap tiles, no key, in the "Paper" look Keller picked Oct 18; looks in `src/ui/mapStyles.ts` built from the brand tokens, pin places in `src/data/mapSpots.ts`; the other looks and pin designs stay in the team-only map playground, Debug > Map looks or `?maps`) with pins in category colors that follow the filter; tap a pin for a small card. The button hides on the map; swiping the peek up brings the list back. Only the button opens the map (Keller, Oct 18: no pull-down to open). On the map only the filters show, resting on the nav; the rest of the list fades out behind it. Data in `src/data/relay.ts`, placeholder photos in `public/relay/`). Its visual treatment comes from a look in `src/ui/relayLooks.ts` (Flat color, Paper, Scrapbook, Relay pass, Postcard, Color bands; cards in `RecCard`, paper textures as `bg-paper*`/`grain` utilities in `tokens.css`), compared side by side in the team-only Relay looks playground (Debug > Relay looks, or `?relay-looks`); "Use in Relay" sets `relayLook` in the store for the real page. Keller picked **Scrapbook** (Oct 18: tilted scraps with opaque cream tape on the plain light paper color (bg-baton-paper), no texture or dots, no type treatments like highlighted headings), so it is the default.
- Today follows Figma TODAY 236:1282: on the paper page, the greeting, then today's prompt in one big blob of liquid glass (Keller, Oct 18: React Bits `FluidGlass` lens in one layer, no border, no photos; the glass itself is a heavier blue at its rim fading inward, as in Figma, and that tint moves with it when touched (a `rim` prop we added to `FluidGlass`'s shader, "Edge glow" in the debug panel), and it morphs a little while resting (our `breathe` prop, "Idle morph"), with a light border band at its edge (our `ring` prop, "Edge border"), and scrolling nudges it a little with the scroll's speed (our `pushRef` prop); the prompt and pill are drawn under the glass (`drawPrompt`) so moving it bends them, the prompt centered; dragging it nudges it a little and it springs back, via the `give` prop we added to `FluidGlass`; every React Bits control for it (shape, size, refraction, dispersion, reflection, frost, tint, shadow, elevation, interaction, drag give, smoothness, wobble, spin, idle, morph on click) is live in the debug panel under "Today glass" (`glassTuning` in the store, defaults and ranges in `src/ui/promptGlass.ts`); a tap opens the + field; `PromptWindow` in `src/ui/`) with its medium (Photo or Write, `promptMedium` in `src/data/pages.ts`) in a pill inside it; everything else (setup cards, to-dos, suggestions) sits on a cream panel below with 48pt top corners. The team-only Today looks playground (Debug > Today looks, or `?today-looks`; options in `src/ui/promptGlass.ts`) compares the prompt and pill under the glass (default, Keller Oct 19), on top of it, and the earlier plain CSS disc; "Use in Today" sets `promptGlass` in the store.
- **+ (Capture)**: like search in Apple's iOS 26 tab bars, tapping + morphs it into a text field inside the tab bar while the three tabs collapse into one round button for the current tab. A recent photos row slides in above it: a camera tile first, then photo tiles (gray placeholders for now); tapped photos get a check and are saved with the answer. Tapping the daily prompt card on Today opens the same field. There is one tab bar, kept mounted across tab switches. Its look follows the Figma nav (LA28 Palms node 258:1523): a content-sized, centered capsule of three 65px tabs plus a 58px + button, mostly opaque white (`bg-glass`, 80%) over a blur with a light shadow; the active tab is brand blue on a white pill, the others `text-tab-idle` gray. Relay's baton icon is `public/brand/relay-tab.svg`. The older Capture page still exists in the flow.
- **Profile**: reached from the floating avatar at top right on Today (only there); a pushed page with no tab bar. Status, city, lifestyle. Its LA Wrapped row opens `la-wrapped` (`LaWrapped`, Figma LA WRAPPED 258:1420 -> LA WRAPPED_2 236:1250): her 24 LA moments as a column of colored dots; tapping it zooms the column open, each dot growing into the photo or note it stands for on a scrolling timeline. Data in `src/data/wrapped.ts`, photos and doodles in `public/wrapped/`. Its Continue goes to Today. The Newcomer splash (and a Rolling Paper row on Profile) opens `rolling-paper` (`RollingPaper`, Figma ROLLING PAPER_coming out1/2, complete, select): the Dynamic Island widens and the sheet of friends' notes prints out of its middle (the sheet is drawn over the island's lower half, with a shade band on the sheet's own plane), lies flat, then the hand-drawn doodles are drawn on one at a time (each its own PNG in `public/rolling-paper/doodles/`, order and boxes in `paperDoodles`; lines draw along their length, marks scribble in place); tapping a note grows it into a big note over a scrim; once it settles, "See your LA Wrapped" at the bottom opens `la-wrapped`, next to a round Save button (`SaveButton` in `src/ui/`, a mock: it turns into a check and says Saved to Photos). LA Wrapped has the same Save next to its Continue, both pinned to the bottom of the screen once the timeline opens. Data in `src/data/rollingPaper.ts`, doodles in `public/rolling-paper/`.
- **Stage change splash** (Figma Banner 266:3309 and 266:3704 on the NEW YORK page): whenever her stage moves forward, a congrats screen pops up over the app (`StageSplash`, copy in `src/data/stageSplash.ts`, photos in `public/stage-splash/`). Newcomer: "Welcome to New York, Chloe!", the count of friends' notes, and "Check it out" opens the Rolling Paper. Local: "You're a Local now!", and "Let's go" opens the insight page `local-insight` (`LocalInsight`, data in `src/data/localInsight.ts`; also opened by the Local card on Today): a card for each of the 3 goals she set on her last night in LA (three of the seven in `goalOptions`, Keller Oct 19; the demo uses work out 3× a week, find people who share my hobby, build a morning routine), each with how it went, a big number, proof photos, a dot per week filling in, and how it was in LA; then the café-seat prompt from both cities side by side as two prints (placeholder photos), and "You're carrying the baton now." with Continue to Today. `changeStage()` in the store triggers it (the debug panel's stage switcher and `2`/`3` use it); it's also in the flow as `arrived` and `local-splash`.
- The Rolling Paper (friends' notes) opens with LA Wrapped right after landing. Lifestyle is captured from the legacy on the last night and is editable in Profile.

### Prototype flows to build (from the video script, in story order)

Status: flow 1 (onboarding, as described under Information architecture) is built, and so is the + field with the recent photos row. The tab pages, Capture and Profile exist as shells. Everything else below still needs building.

| # | Flow | Stage | What it must show |
|---|---|---|---|
| 1 | Onboarding | Moving | Feature overview, sign up or log in, tell us about yourself (move status and tags like Student, International), photo access, then on Today a setup list: organize the archive from imported photos, pick logistics to-dos, add the Instagram tag |
| 2 | Today, Moving | Moving | Logistics to-do list and the daily prompt card |
| 3 | Daily prompt to archive | Moving | Answer a light prompt in seconds (Capture page), then see it land in Archive |
| 4 | Place arrival prompt | Moving | Notification at her café or gym, reflect why with a few options ("Trader Joe's next door"), saved to archive |
| 5 | Friend's note | Moving | A friend taps her Instagram tag and writes Chloe a note (can be a single web screen) |
| 6 | Last night: legacy review | Moving | A last look at her LA legacy, choose public or private for each piece and publish. Her lifestyle snapshot is captured from it. Then one question: her intention for the new city (what she wants to achieve or is dreaming of) |
| 7 | Landing: LA Wrapped + Rolling Paper | Newcomer | After landing, one combined moment: her LA lifestyle played back together with the notes friends left her, then set status to Newcomer |
| 8 | Today, Newcomer | Newcomer | Arrival to-dos, the gym hint card (a gym with a Trader Joe's next door, from someone else's legacy) and suggestions based on her intention |
| 9 | Recommendation detail | Newcomer | Relay with the gym's detail and more lifestyle-matched recs, then leave a note on that recommendation |
| 10 | Local | Local | Status to Local opens a celebratory insight page: how her lifestyle changed compared with the LA snapshot, and her progress toward the intention she set. Same prompt side by side with LA |

Add each screen to `src/flow.ts` in this order with the right `stage`, so the debug panel and arrow keys walk the story.

### References

- Video script (sections, timings, open questions): https://claude.ai/code/artifact/0006d5b1-3944-4465-830f-6c4e719ac6b4
- IA / sitemap: https://claude.ai/artifact/PWUnEL55i417nhKU7JyF1e
- Hero flow: https://claude.ai/artifact/KEV2PLbe4kEYXtLV8jKji7
- Figma design file "LA28 Palms" (file key `Ee8SrVUeOgEZ7dScYXN6y9`): feature map frame 194:18, feature timeline 203:77
- FigJam board "LA28" (file key `gNyglKW1dULTnCi8DwGWh0`): pitch, persona, features, brainstorm
- Deployed on Vercel (project "baton"): `main` is production, every PR gets a preview link

## Brand

Keller, Oct 17. These hex values are the source of truth (the earlier Archivo font and red/purple palette are gone).

- Colors: blue `#59a1ff`, cream `#efe6e2`, pink `#f3beeb`, yellow `#ede783`, olive `#3f4017`, navy `#222430`
- Font: Mundial Narrow (`mundial-narrow-variable`, Adobe Fonts), loaded in `index.html` from `https://use.typekit.net/ypw1hyf.css` and set in the font tokens in `src/theme/tokens.css`
- Logo: a segmented, tilted baton mark plus the lowercase "baton" wordmark. SVGs in `public/brand/` (`baton-mark.svg`, `baton-lockup.svg`), used through `src/ui/Logo.tsx`
- Tagline: "Leave a story. Start another."
- Shape: very rounded (pill buttons, 24px cards)
- In code the palette is the `baton-*` color tokens in `src/theme/tokens.css` (`bg-baton-blue`, `text-baton-cream`, ...). The high-fidelity Archive uses them directly: the stack is LA, Seoul, Chicago top to bottom in every stage (no New York folder, as in the Figma frame). It opens with LA in focus (Figma ARCHIVE_default, 256:196, on the NEW YORK page): the focused folder is open and every other folder is collapsed to a strip, all of them always on screen (the stack itself doesn't move), and the bottom fades into the color of the folder there. Scrolling vertically (wheel, flick or drag) moves the focus one folder at a time, expanding it and collapsing the rest; tapping a peeking folder focuses it and tapping the open folder goes to its detail page. LA's detail page (Figma ARCHIVE_detail default, 267:5273) is a cloud of round photos (`PhotoCloud`, positions in `src/data/archiveCloud.ts`, photos in `public/archive/la-cloud/` pre-cropped to the Figma circles) with the folder's tab on its side at the left edge to go back (`FolderSideTab`). You can drag around the cloud (it glides on), pinch, trackpad-pinch or double-tap to zoom, and every photo hangs on a spring that follows your finger, less the further it is from it. At the bottom sits the filter orb (`FilterOrb`): a Fluid Glass lens (larger than the orb, so its rim is cropped off) over a live-drawn picture of three color blobs (Fluid Glass's `canvas` prop). Starting to turn it enters filter mode: the color that comes to the top swells to fill most of the orb, the other two shrink into its bottom corners, and letting go settles on the nearest one: Feeling pink, People yellow, Places blue (Figma ARCHIVE_detail feeling 267:5758, people 312:8183, places 312:8306). That category's photos stay sharp and the rest blur, with the color washing up from the bottom and the name on the orb. Swiping the orb up leaves filter mode, back to three even colors and every photo. Each photo's category is in `src/data/archiveCloud.ts` (Figma's places frame still repeats People, so Places is the photos neither of the others uses); other cities still show the older list; each city keeps one folder color in every stage: LA blue, Seoul cream, Chicago olive, each with a one-sentence lifestyle summary and inline photos (`archiveSummaries` in `src/data/stages.ts`, photos in `public/archive/`, `InlinePhoto` in `src/ui/`). The sentence appears word by word with photos popping in each time a folder opens (`TypedSummary`)
- Stage colors (proposed, pending Keller's OK; thread "Stage colors and themes", https://claude.ai/artifact/JGP7cKRngKEA8N3LMDhW6b): Moving pink, Newcomer yellow, Local olive. Cream surfaces and navy text stay constant; blue marks onboarding, the logo and things handed over (recommendations, hint cards, notes)

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite` (imported in `src/index.css` with `@import "tailwindcss";`; no `tailwind.config` file, so theme tokens go in CSS with `@theme`)
- React Compiler enabled through `@rolldown/plugin-babel` in `vite.config.ts`
- ESLint 10 (flat config in `eslint.config.js`)

## Commands

```bash
npm install
npm run dev      # dev server on http://localhost:5173, and on your wifi (Network URL) for a phone
npm run build    # tsc -b && vite build
npm run lint     # eslint .
npm run preview  # serve the production build
```

There are no tests yet. Run `npm run build` and `npm run lint` before committing.

Workflow: branch off `main`, open a PR, check the Vercel preview link on it, merge when Keller approves.

## Design system (keep it swappable)

Final key visuals arrive after screens are built, so styling must be swappable from a few files. The first pass references Apple's iOS design (Human Interface Guidelines): SF type scale, grouped backgrounds, iOS buttons, segmented controls, bottom sheets, grouped lists and the tab bar. It started grayscale; color comes in **only through the stage themes** (see Brand), so the rest stays neutral until the team's own designs and components replace these.

- `src/theme/tokens.css` is the only place for colors, fonts, radii and shadows (Tailwind `@theme`). Use the token utilities (`bg-surface`, `text-ink`, `text-ink-muted`, `bg-brand`, `border-line`, `rounded-card`, `shadow-card`, `font-display`) and the iOS text styles (`text-large-title`, `text-title-1..3`, `text-headline`, `text-body`, `text-subhead`, `text-footnote`, `text-caption`). Never use raw hex values or stock Tailwind colors (`bg-red-500`) in components or screens.
- Stage color: `bg-stage`, `text-stage`, etc. follow the nearest `data-stage="moving|newcomer|local"` wrapper. The app sets it from the current screen's stage.
- `src/ui/` holds the shared building blocks (Button (incl. the blue `glow` variant with `size="cta"`, label left and arrow right, from LA Wrapped's Continue, Figma 278:7144), Card, Chip, PromptCard, VisibilityBadge, Avatar, TextField/TextArea, Screen, TabBar, SegmentedControl, BottomSheet, ListSection/ListRow). Screens compose these; if a screen needs a new look, add a variant or a new block in `src/ui/` instead of one-off styling.
- **Liquid glass effect: use `FluidGlass`** (Keller, Oct 18). For any liquid glass look in content (the Archive details page and other pages), use `FluidGlass` from `src/ui/` (React Bits Fluid Glass, TS + Tailwind, https://reactbits.dev/components/fluid-glass). Don't add another glass library or hand-roll one. It is a WebGL canvas that bends only what you pass it (`text`, or an image or video via `src`) inside its own box, not the page behind it, so give it a sized parent and the photo or words to refract. Shapes: lens, blob, cube, pill, torus, prism, diamond; tune with `size`, `refraction`, `dispersion`, `frost`, `tint`, and `interaction` (follow, drag, static). Example: `<FluidGlass src="/archive/la-sunset.jpg" shape="blob" size={200} dispersion={0.85} />`, shown in the design system view (Debug > Design system). **Not for navigation**: the tab bar, + button and other buttons keep their current look.
- Mock content (people, places, copy) lives in `src/data/`, not in screens.
- For responsive layouts use container variants (`@md:`, `@lg:`), not viewport ones (`md:`, `lg:`), so screens respond correctly both inside the phone frame and full-window.

## Prototype shell

- `src/flow.ts`: ordered list of hero flow screens (`id`, `title`, `stage`, `component`). Add new screens here.
- The current screen is in the URL hash (`#/today`).
- The page shows only the app. A team-only debug panel (bottom left, closed by default) holds the stage switcher, a Today's prompt picker (any of the stage's daily prompts, `promptIndex` in the store), the screen list, the phone frame toggle and the design system view (`UiKit.tsx`). Open it from the Debug button in the page corner (frame on) or the small tab on the left edge (frame off), with `` ` `` (backtick), or by adding `?debug` to the URL. `←`/`→` previous/next screen, `1`/`2`/`3` set the stage and `F` toggle phone frame (remembered) work even while it is closed.
- Stage switcher ("Chloe's stage": Moving / Newcomer / Local) sets `status` in the store, the same value "Tell us about yourself" sets in onboarding. Once set it themes every screen (`data-stage` in `App.tsx`, falling back to the screen's flow `stage`), and Today, Archive, Relay and Profile show that stage's content. Content for stages whose flows aren't built yet is placeholder in `src/data/stages.ts` (Today cards like LA Wrapped, the gym hint and the Local insight; Archive folders and city details, private archive vs legacy; Relay recommendations; Profile rows). Like everything else it resets on reload.
- Phone frame on: an iPhone 18 Pro (402×874 pt screen, very rounded corners) centered on the page; with "Lock aspect ratio" (debug panel, on by default, remembered) it scales down whole on short windows instead of getting squat. Its status bar (`src/app/StatusBar.tsx`) follows the Figma frames: the live time (12-hour, no AM/PM), the Dynamic Island and the signal, wifi and battery icons exported from Figma (`public/status/icons-right.svg`), on the paper color. Off: the app fills the window and is responsive. On a real phone (screens 500px wide or less) the app always fills the screen.
- Testing on a phone: `npm run dev` listens on the LAN (`server.host` in `vite.config.ts`); open the Network URL it prints on a phone on the same wifi, or use the Vercel preview link.

## Layout

- `src/main.tsx`: entry point
- `src/App.tsx`: wires the flow, phone frame and debug panel
- `src/app/`: prototype shell (DeviceFrame, DebugPanel, hooks)
- `src/screens/`: one file per screen (`UiKit.tsx` shows every building block and opens from the debug panel). The tab pages (Today, Archive, Relay) wrap their content in `MainLayout`: no top bar. Only Today has the profile avatar, floating at top right over the content; Archive and Relay are just content. Tabs have no page titles; Today shows a greeting that scrolls with the page (`src/data/greetings.ts`: per stage and the device's time of day, with the countdown to NY only in her last week in LA). `TabShell` (also in `MainLayout.tsx`) renders the floating tab bar and the + field once around whichever tab is showing, so the bar stays mounted across tab switches. Profile and Capture are pushed pages built on `Screen` with a back button and no tab bar; `goBack()` in `src/app/navigate.ts` returns to the previous screen
- `src/ui/`: shared building blocks
- `src/theme/tokens.css`: design tokens
- `src/data/`: mock content (`pages.ts` holds page copy and the daily prompts per stage, `today.ts` the Today suggestions, to-do tips, leave date and legacy card, `onboarding.ts` the onboarding copy, found places and to-dos, `photos.ts` the recent photos row, `relay.ts` Relay picks, leavers, tips and notes, `people.ts` Chloe and others, `stages.ts` placeholder content per stage for the tabs and Profile)
- `src/app/store.ts`: tiny in-memory store for choices that carry across screens (status, tags, kept places, which Archive segment opens, the tapped Relay card and notes left on it, picked to-dos, Instagram handle, whether the + field is open, saved reflections). Nothing persists
- `src/app/composer.ts`: opens the + field and focuses it after the morph (used by + and the daily prompt card)
- `docs/daily-prompts.md`: daily prompt list per stage and the rules prompts follow
- `public/`: static assets (`public/brand/` holds the logo SVGs)
