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
| `api/reminders.js` | Daily reminder emails (Vercel Cron + Resend) |
| `api/_lib/` | Shared server code (`_` = not a route) |
| `supabase/migrations/` | Database schema. Add a **new** migration file for every change; never edit an applied one. |
| `legacy/` | The old Google Apps Script server, kept for reference |
| `scripts/dev-server.mjs` | `npm run dev` — local preview of `public/` + `api/` |

## How it works

- Hash router (`#/…`) in `03-ui-routing.js`; each page is a `renderX()` function that writes `app.innerHTML`.
- All course content and a student's own progress live **on the device** in IndexedDB (`DB` in `01-core.js`,
  with `state` as the course). The server only stores a progress summary per student.
- Student/teacher mode is only a UI switch. The real protection is `TEACHER_KEY`, checked on the server.
- The page talks to `/api/class` with the same JSON messages the old Apps Script used (see the top of `api/class.js`).
  `syncUrl()` in `09-progress.js` defaults to `/api/class`; a teacher may still type an Apps Script URL.
- Database tables have Row Level Security on and **no policies**: only `api/` (service-role key) can reach them.
  The browser never talks to Supabase directly and no Supabase key is in `public/`.

## Rules

- Keep it build-free: no bundler, no framework, no `import` in `public/js`. New front-end file → add its `<script>` tag in order.
- Secrets live only in Vercel environment variables / `.env.local`. Never in `public/`, never committed.
- Escape user text with `esc()` before putting it in `innerHTML`.
- Before finishing a change: `node --check` each edited JS file, run `npm run dev`, open the pages you touched and check the browser console.
- Push straight to `main` (the owner's choice while the site is at version 1): no branches or pull requests unless he asks. Every push to `main` deploys to production, so run the checks above first, and `git pull --rebase origin main` right before pushing because another person may be pushing too.
- `.github/workflows/check.yml` runs on every push; if it fails, fix it straight away. `migrate.yml` applies new `supabase/migrations/` files when they reach `main` (only if the Supabase secrets are set in the repository).
- The file `public/course.json` is optional (a teacher's exported course, auto-loaded by every student). A 404 for it is normal.

## Known limits / next ideas

- Progress posts are not authenticated (anyone who knows an email could overwrite that student's summary) — same as the
  old server. Supabase Auth for students would fix it.
- Reminder emails need a Resend account with a verified sending domain.
- No Arabic interface yet; pronunciation checking uses the browser's speech recognition.
