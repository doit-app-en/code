# Do it English — notes for Claude (and any developer)

English-practice website for school students: placement test, video lessons, listen & see, matching,
pronunciation, listening exercises, "Test your speaking" with AI feedback, student progress and a
teacher's Students page. The interface is in English. The owner (Abdulmohsen) writes in Arabic — answer him in Arabic.

## Layout

| Path | What it is |
|---|---|
| `public/` | The whole site. Static, **no build step**. Vercel serves this folder as-is. |
| `public/index.html` | Markup + the ordered `<script>` tags |
| `public/styles.css` | All styles. Kept next to `index.html` on purpose: `url(photos/…)` must resolve the same from CSS and from inline styles. |
| `public/js/NN-*.js` | The app, split by section. **Classic scripts, not modules**: they share one global scope and must load in the numbered order. |
| `public/photos/` | Site photos (Unsplash) |
| `api/class.js` | Class server: progress, students list, speaking AI feedback |
| `api/voice.js` | Voice level test: speech-to-text + pronunciation scores (Azure AI Speech), AI summary (Claude), saved results |
| `api/reminders.js` | Daily reminder emails (Vercel Cron + Resend) |
| `api/_lib/` | Shared server code (`_` = not a route) |
| `supabase/migrations/` | Database schema. Add a **new** migration file for every change; never edit an applied one. |
| `legacy/` | The old Google Apps Script server, kept for reference |
| `scripts/dev-server.mjs` | `npm run dev` — local preview of `public/` + `api/` |
| `scripts/smoke-test.mjs` | `npm run smoke` — every page on phone/tablet/desktop in headless Chrome + the whole voice test; screenshots in `/tmp/smoke/` |
| `AGENT.md`, `BACKLOG.md` | The scheduled improvement agents (developer, designer, content, researcher, organizer): their rules and their to-do lists |
| `CHANGELOG.md`, `REPORT.md` | In Arabic, for the owner: every visible change, and the organizer's daily report |
| `docs/research.md` | The researcher agent's notes on other English-learning sites |

## How it works

- Hash router (`#/…`) in `03-ui-routing.js`; each page is a `renderX()` function that writes `app.innerHTML`.
- All course content and a student's own progress live **on the device** in IndexedDB (`DB` in `01-core.js`,
  with `state` as the course). The server only stores a progress summary per student.
- Student/teacher mode is only a UI switch. The real protection is `TEACHER_KEY`, checked on the server.
- The page talks to `/api/class` with the same JSON messages the old Apps Script used (see the top of `api/class.js`).
  `syncUrl()` in `09-progress.js` defaults to `/api/class`; a teacher may still type an Apps Script URL.
- Voice level test (`public/js/10b-voice-test.js`, route `#/voicetest`): 45 s answer + 45 s picture description + 4 listen-and-repeat sentences.
  The browser records WAV (16 kHz mono). With `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` set, `/api/voice` transcribes and scores pronunciation;
  without them the page falls back to the browser's speech recognition ("basic check"). `GET /api/voice` tells the page what is switched on.
  Paid calls need a registered student and are limited per day by `usage_take()` in the database. The owner has set the Azure keys in production; nobody has confirmed a real spoken test yet.
- Database tables have Row Level Security on and **no policies**: only `api/` (service-role key) can reach them.
  The browser never talks to Supabase directly and no Supabase key is in `public/`.

## Rules

- Keep it build-free: no bundler, no framework, no `import` in `public/js`. New front-end file → add its `<script>` tag in order.
- Secrets live only in Vercel environment variables / `.env.local`. Never in `public/`, never committed.
- Escape user text with `esc()` before putting it in `innerHTML`.
- Before finishing a change: `node --check` each edited JS file and run `npm run smoke` (it must pass); look at the screenshots of the pages you touched.
- After a change the owner would notice, add an entry at the top of `CHANGELOG.md` (Arabic, plain words).
- Phones are the main screen: under 860px the top links are hidden and the bottom `.tabbar` is the navigation. A new section needs a link in both.
- Push straight to `main` (the owner's choice while the site is at version 1): no branches or pull requests unless he asks. Every push to `main` deploys to production, so run the checks above first, and `git pull --rebase origin main` right before pushing because another person may be pushing too.
- `.github/workflows/check.yml` runs on every push; if it fails, fix it straight away. `migrate.yml` applies new `supabase/migrations/` files when they reach `main` (only if the Supabase secrets are set in the repository).
- The file `public/course.json` is optional (a teacher's exported course, auto-loaded by every student). A 404 for it is normal.

## Known limits / next ideas

- Progress posts are not authenticated (anyone who knows an email could overwrite that student's summary) — same as the
  old server. Supabase Auth for students would fix it.
- Reminder emails need a Resend account with a verified sending domain.
- No Arabic interface yet; the Pronounce section still uses the browser's speech recognition (only the Voice level test can use Azure).
- The teacher's Students page does not show voice-test results yet (they are saved in the `voice_tests` table).
