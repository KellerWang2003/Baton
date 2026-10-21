# Submission showcase plan

Branch: `codex/showcase`, created from `codex/profile-page` on October 21, 2026.
Status: planning only; showcase behavior is not implemented yet.
Existing profile, onboarding typography, and photo-orb work was committed on `codex/profile-page` as `b6962f3` and brought into this branch before showcase work.

## Intended experience

- Desktop: the working prototype inside the iPhone frame, with a quiet note directly below it.
- Phone: the app fills the screen, using the existing 500px breakpoint; no external frame or desktop note.
- Reviewers can explore through normal app navigation without development controls.

Proposed note:

> Interactive prototype — some features are still in development.

Keep the note outside the simulated phone, in readable muted text. Allow it to wrap on narrower desktop windows. Reserve space for it before calculating the phone scale, so neither the frame nor the note clips on short windows. Keep the note at normal text size when the phone scales down.

## Implementation

1. Create an explicit showcase entry or build mode, enabled by default for this branch's submission build. Do not infer showcase behavior from production mode alone: recording and development builds also need production builds. The submission URL should work without special query parameters.
2. In `src/App.tsx`, exclude `DebugPanel`, `ScrollJoystick`, and all playground overlays from the showcase experience. Prefer separating the team tools into their own module so showcase builds can omit them. Do not mount the debug panel: hiding its button alone leaves its keyboard shortcuts active.
3. Ignore team-only URL switches in showcase mode, including `debug`, `embed`, `maps`, `relay-motion`, `relay-looks`, `today-looks`, `archive-sketches`, `3d-proto`, `archive-ideas`, and `collage`. Audit the `real-life` switch in `src/app/store.ts` and choose one consistent capture experience. Preserve normal app hash navigation.
4. Use fixed showcase presentation defaults: iPhone preset, frame on for desktop, aspect ratio locked, default backdrop, joystick off. Ignore saved `baton:framed`, `baton:frame-size`, `baton:lock-ratio`, and `baton:joystick` preferences in showcase mode without deleting them.
5. Add the desktop note in `src/app/DeviceFrame.tsx`, alongside the scaled phone. Reuse the existing phone breakpoint for the frame and note.
6. Walk the submission journey without debug shortcuts and record which features are simulated or incomplete. Check onboarding, all three stages, capture to Archive, Relay details and notes, and Profile. Treat older build-status descriptions in `CLAUDE.md` as historical; verify the current screens.

## Decisions to settle before submission

- Entry: recommend the existing feature overview and onboarding; confirm every stage is reachable through app controls.
- Disclosure: use the short proposed note unless the submission needs named limitations. Authentication is currently simulated (`src/screens/SignUp.tsx`); verify other limitations before making specific claims.
- Data: decide whether submissions should use the current shared Supabase archive or a separate demo dataset. `src/app/supabase.ts` currently shares captures across devices when configured; most other state resets on refresh. Do not change or clear existing data as part of preparing this branch.
- Hosting: use a dedicated showcase preview URL first. The repository documents `main` as production; plan the final submission URL separately from development.

## Acceptance checks

- Build and lint pass, with any existing failures distinguished from showcase changes.
- Desktop at typical and short laptop heights: phone and readable note both fit; no overlap or clipping, including at increased browser text size.
- At 500px and below: full-screen app, no bezel or desktop note. At 501px and above: framed showcase and note.
- Debug launcher, edge handle, joystick, backtick, arrow-key screen stepping, number-key stage switching, and F frame toggle are absent.
- Team-only URL flags cannot open tools or bypass the showcase frame.
- Existing debug preferences in local storage do not affect the showcase presentation.
- Onboarding, tab navigation, stage transitions, camera permission denial, and ordinary back navigation remain usable without debug tools.
- Validate a deployed preview on desktop and a real phone before using its URL for submission.
