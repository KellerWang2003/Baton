# Daily prompts

Light prompts on the Today tab. The wording shown in the app is the plain, verb-first list at the bottom (Keller, Oct 17); the tables keep the reasoning, seeds and sources behind each one. Answers save to the private archive. Grounded in the team's FigJam answers (Leaving, Arriving) and Chloe.

## Rules every prompt follows

1. **Plain and verb-first.** Start with the action (Take, Write, Say, Record, Tell) and say exactly what to do. No poetic titles.
2. **Ask for an angle, not a subject.** "Take a photo of the view from the seat you always sit in" beats "Take a photo of your rooftop" (Jihyun: the everyday things never get kept "in the original perspective").
3. **One action, seconds long.** One photo, a 10-second voice note, or one line. Each prompt names its default mode but accepts all three.
4. **People and rituals, not just places.** Everyone said they'd miss people and a way of life first (Keller: "it's the people that won't be the same").
5. **Honest is allowed.** Some prompts ask for what you won't miss. Left alone, people tell the polished version ("just to promote LA").
6. **Some prompts quietly double as a future tip.** Noticing feels like a chore when it's only for yourself. A prompt like "what's the trick here?" is private now and becomes a legacy tip later if you choose. Never say "this will be public".
7. **Skipping costs nothing.** Every card has *Not today* and *Another one*. No streaks, no counts, no "you missed 3 days".
8. **Seeded by your own data.** Most-visited places, time of day and calendar moments (last class, last crit) make the prompt feel like it noticed you, not like a generic journal.

## Moving (Chloe, leaving LA)

| Prompt | Mode | Seed | Source |
|---|---|---|---|
| **The view from where you always stand.** Take it from your usual seat, not your best angle. | Photo | Most-visited place: "You're at your usual café again." | Jihyun, persona |
| **The way in.** The door, gate or stairs you walk through every day. | Photo | Home / school / café | Jihyun's office door |
| **Who do you nod at here?** Someone you see all the time but have never photographed. | Line | Most-visited place | People insight |
| **What did you make at this table?** One thing you finished here. | Voice | "You've spent about 200 afternoons here." | Keller's café reflection |
| **What does it sound like?** Ten seconds of here: the espresso machine, the freeway, the studio at 2am. | Voice (ambient) | Time of day, location | Jihyun's "late nights at school" |
| **One thing you won't miss.** Say it out loud. | Voice | Driving or parking detected | Love-hate answers |
| **What's the trick here?** Something it took you months to learn (closes at 5, which outlet works). | Line | Most-visited place | "Nobody told her LA cafés close at 5pm" |
| **Maybe the last time.** Your last crit, last class or last late night. One photo before you go. | Photo | Calendar | "Earn every prompt" insight |
| **What's on your desk right now?** Top-down, don't tidy. | Photo | Evening at home or studio | Routine missing from camera rolls |
| **Who would you tell about this?** You later, a friend, or the next person here. | Tap | After any capture | FigJam Q8 |

## Newcomer (Chloe, arriving in NYC)

| Prompt | Mode | Seed | Source |
|---|---|---|---|
| **Same thing, new city.** Your coffee order, your commute, your groceries. What's different? | Photo + line | First week | LA's meaning shows up by contrast |
| **What confused you today?** One line. | Line | Any day, first month | Logistics come first |
| **You went to a leaver's place.** Take the view from their seat. (Optional: send it to them.) | Photo | Visited a recommended place | Reply "only when I want to" |
| **First route without Maps.** Where were you going? | Line | Repeated route detected | "A city becomes yours through routine and mobility" |
| **Who said hi?** The first person who recognized you. | Line | Week 2+ | Loneliness arrives after logistics |
| **What did you miss from LA today?** | Voice | Week 2+ | Looking back while adapting (core pain) |

## Local (Chloe, settled in NYC)

| Prompt | Mode | Seed | Source |
|---|---|---|---|
| **The view from where you always stand.** (Same prompt as LA.) Shown next to your LA answer. | Photo | New most-visited place | Bookend moment |
| **When did this stop feeling new?** | Line | Place visited 30+ times | "Second year" turning point |
| **What would you tell yourself from month one?** | Voice | Status switched to Local | Month one, seen from a year later |
| **What's the trick here?** | Line | Most-visited place | Same as Moving: seeds the next legacy |

## Demo moment

The same prompt opens and closes the story: "Take a photo of the view from the café seat you always sit in" at Chloe's LA café in Moving, and again at her NYC spot as a Local, shown side by side. It shows the city becoming hers without a word of explanation.

## Open question

Noticing vs. exploring (persona fork): should prompts ever nudge you somewhere new ("something in LA you never got around to")? Suggested default: mostly noticing, with at most one explore prompt a week in Moving.

## Plain wording (Keller, Oct 17: straightforward, verb-first)

In the app these live in `src/data/dailyPrompts.ts`, each tagged with the times of day it shows up (Oct 21).

Moving
1. Take a photo of the view from the café seat you always sit in.
2. Take a photo of the door you walk through every day.
3. Write down the name of someone you see here all the time.
4. Tell us one thing you finished at this table.
5. Record 10 seconds of the sound around you right now.
6. Say one thing about LA you won't miss.
7. Write one tip about this place that took you months to learn.
8. Take a photo of your last class, crit or late night at school.
9. Take a photo of your desk right now, without tidying it.
10. Choose who you'd share this with: yourself later, a friend, or the next person here.

Newcomer
11. Take a photo of your coffee order here and say how it's different from LA.
12. Write one thing that confused you today.
13. Take a photo from the seat a leaver recommended.
14. Write the first route you took without Maps.
15. Write the name of the first person who recognized you.
16. Say one thing you missed about LA today.

Local
17. Take a photo of the view from the café seat you always sit in.
18. Write when this place stopped feeling new.
19. Tell your month-one self one thing you know now.
20. Write one tip about this place that took you months to learn.
