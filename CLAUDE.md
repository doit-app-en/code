# Do it English — notes for Claude (and any developer)

English-practice website for school students: placement test, video lessons, listen & see, matching,
pronunciation, listening exercises, "Test your speaking" with AI feedback, "Practise my mistakes", student progress and a
teacher's Students page. The interface is in English. The owner (Abdulmohsen) writes in Arabic — answer him in Arabic.

## Layout

| Path | What it is |
|---|---|
| `public/` | The whole site. Static, **no build step**. Vercel serves this folder as-is. |
| `public/index.html` | Markup + the ordered `<script>` tags |
| `public/styles.css` | All styles. Kept next to `index.html` on purpose: `url(photos/…)` must resolve the same from CSS and from inline styles. |
| `public/js/NN-*.js` | The app, split by section. **Classic scripts, not modules**: they share one global scope and must load in the numbered order. |
| `public/js/legacy-apps-script.js` | The old Apps Script text a teacher can copy from the Students page (`GS_CODE`). Not numbered; loads between `08` and `09`. |
| `public/photos/` | Site photos (Unsplash). `hero-800.jpg` / `hero-1200.jpg` and `photos/sm/` (640px) are smaller copies used only by the home page; a new home-page photo needs its small copy too. `npm run smoke` fails on a missing photo or one over 300 KB. |
| `public/manifest.webmanifest`, `public/icons/` | "Add to home screen": name, colours and icons (PNG, drawn from the logo). No service worker, no offline caching. |
| `api/class.js` | Class server: progress, students list, speaking AI feedback |
| `api/voice.js` | Voice level test: speech-to-text + pronunciation scores (Azure AI Speech), AI summary (Claude), saved results |
| `api/reminders.js` | Daily reminder emails (Vercel Cron + Resend) |
| `api/_lib/` | Shared server code (`_` = not a route) |
| `supabase/migrations/` | Database schema. Add a **new** migration file for every change; never edit an applied one. |
| `legacy/` | The old Google Apps Script server, kept for reference |
| `scripts/dev-server.mjs` | `npm run dev` — local preview of `public/` + `api/` |
| `scripts/smoke-test.mjs` | `npm run smoke` — every page on phone/tablet/desktop in headless Chrome + a placement test, a lesson and every listening exercise on a phone + the whole voice test; screenshots in `/tmp/smoke/` |
| `AGENT.md`, `BACKLOG.md` | The scheduled improvement agents (developer, designer, content, researcher, organizer): their rules and their to-do lists |
| `CHANGELOG.md`, `REPORT.md` | In Arabic, for the owner: every visible change, and the organizer's daily report |
| `docs/research.md` | The researcher agent's notes on other English-learning sites |

## How it works

- Hash router (`#/…`) in `03-ui-routing.js`; each page is a `renderX()` function that writes `app.innerHTML`.
- All course content and a student's own progress live **on the device** in IndexedDB (`DB` in `01-core.js`,
  with `state` as the course). The server only stores a progress summary per student.
- Home page (`04-home.js`): new students see a 3-step path; returning ones a "today" card (streak, week dots, continue link) built by `streakInfo()` and
  `nextSuggestions()` in `09-progress.js` from `activity.days` (per device). The student's weekly goal (2, 3 or 5 days; localStorage `die_goal`) is drawn by `drawGoal()` there, on the home card and My progress. The streak allows one free rest day per Sunday–Saturday week (`streakRun()`), and `celebrateStreak()` shows a card when it reaches 3, 7, 14 or 30 days. On phones a "← Back" button is added above every page that has `.crumbs` (`03-ui-routing.js`).
- Practise my mistakes (`public/js/09b-mistakes.js`, route `#/mistakes`): a wrong pair in a lesson's Match game and a phrase under 80% in lesson Speak are remembered on the device (IndexedDB `mistakes`, ids only) by `noteMistake()`; `mistLinkHTML()` puts "Practise my mistakes (N)" on the home page and My progress; an item leaves the list after two correct answers in rounds.
- Mixed match (`public/js/09c-mixed-match.js`, route `#/mixmatch`): a 60-second matching round with the pairs of every finished lesson, offered by `mixLinkHTML()` on the home page and My progress after two finished lessons; the student's own best is kept on the device (IndexedDB `mixBest`) and never sent.
- Anything that waits for the server shows a state: `loadBox()` while loading, `stateBox()` with a "Try again" button when it fails, and `netWhy()` for the reason (all in `09-progress.js`). `#offbar` in `index.html` is the "No internet connection" bar (`netBar()` in `03-ui-routing.js`).
- Student/teacher mode is only a UI switch. The real protection is `TEACHER_KEY`, checked on the server.
- The page talks to `/api/class` with the same JSON messages the old Apps Script used (see the top of `api/class.js`).
  `syncUrl()` in `09-progress.js` defaults to `/api/class`; a teacher may still type an Apps Script URL.
- Voice level test (`public/js/10b-voice-test.js`, route `#/voicetest`): 45 s answer + 45 s picture description + 4 listen-and-repeat sentences.
  The questions, pictures and sentences are lists at the top of that file; `vtFresh()` avoids what the device was asked before (IndexedDB `voiceSeen`).
  The test's pages and a fresh result share the address `#/voicetest` (`VT.mode` says which), so links back to it are handled by a click listener there (`vtLeave()`).
  A part in which no word was heard is offered again (`vtQuietPage()`), and a test in which nothing at all was heard is not saved or sent (`vtNonePage()`).
  The browser records WAV (16 kHz mono). With `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` set, `/api/voice` transcribes and scores pronunciation;
  without them the page falls back to the browser's speech recognition ("basic check"). `GET /api/voice` tells the page what is switched on.
  The teacher's Students page asks `POST /api/voice {action:'latest', key}` (teacher key) for each student's newest test and shows it in a "Voice test" column.
  `{action:'history', key, email}` lists all of one student's tests (the "Show all N tests" button); the table's class filter and order are `studentRows()` in `09-progress.js`.
  Pronounce (`07-pronounce.js`): a letter's list, test and result share one address (`#/pronounce/B`; `PR.mode` says which), so "Back" from the test or result is handled by `pronLeave()`; the words a student has listened to are kept on the device (IndexedDB `pronHeard`).
  The Pronounce test (`07-pronounce.js`) uses the same service for one word at a time (`{action:'word'}`, `pronSvc()` / `prRecord()`), with its own daily counter (kind `pron`), and falls back to the browser's recognition when the service is off, refuses or the student is not registered.
  Paid calls need a registered student and are limited per day by `usage_take()` in the database. The owner has set the Azure keys in production and reported on 2026-11-18 that a real spoken test and the Students column work.
- Test your speaking (`10-speaking.js`, route `#/speaking`): the topic list, a chosen topic, the recording and a fresh result share one address (`SPK.mode` says which), so links back to `#/speaking` are handled by a click listener there; `#/speaking/view/<id>` shows a kept recording (IndexedDB `speakHistory`, newest 12).
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
- No Arabic interface yet; lesson Speak and "Practise my mistakes" still use the browser's speech recognition (the Voice level test and the Pronounce test can use Azure).
