# Baton showcase

This branch is the submission showcase. It excludes debug controls, keyboard shortcuts, the scroll joystick, and team playgrounds. Desktop shows a fixed iPhone frame with a prototype note underneath and story-based stage choices alongside it (above it on narrower windows); phones up to 500px wide show the app full-screen. Team URL flags and saved frame preferences are ignored.

Deploy `showcase` as the production branch of the dedicated showcase Vercel project. Pushes to this branch update that project. Merge future app improvements from `main` deliberately, retaining the showcase entry and presentation.

See [the showcase plan](docs/showcase-plan.md) for remaining submission checks.

# Baton

Hackathon prototype for the SVSD "Traces" storytelling hackathon: the last person who lived in a city passes on what they knew to whoever arrives next. It exists to be screen-recorded for the video.

```bash
npm install
npm run dev    # http://localhost:5173, plus a Network URL for testing on a phone
```

Everything else (story, key decisions, flows, design system rules, project layout) is in [CLAUDE.md](CLAUDE.md). Daily prompts are in [docs/daily-prompts.md](docs/daily-prompts.md).

Compare Relay entrance animations at `?relay-motion#/community`, or open **Debug → Relay entrances**. The playground has four styles, replay controls, stage previews, and speed options. **Use in Relay** applies a style for the current session; **Try in app** opens the real feed. Device reduced-motion preferences are respected.
