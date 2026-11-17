# Backlog

The improvement agent (see `AGENT.md`) works through this list from the top. Anyone can add a line.

## Owner requests
<!-- Abdulmohsen: write what you want here (Arabic is fine), one line each. These come first. -->

## Next
- [ ] Teacher's Students page: show each student's latest voice level test (level, the three scores, date, link to the result). Needs a teacher-key-protected list in `api/voice.js`.
- [ ] Voice test result: recommend where to go next ("Your level is A2 → start the A2 lessons") with a button to that level, and to the Pronounce section for weak words.
- [ ] Home page: a clear first-time path (1 find your level → 2 open your level → 3 practise every day) and a "continue where you stopped" card for returning students.
- [ ] Phone polish, page by page from the `/tmp/smoke/phone-*` screenshots: spacing, text sizes, buttons at least 44px high, wide tables scroll inside their own box.
- [ ] Inner pages (a lesson, an exercise, a result): a clear "← Back" button at the top on phones, not only the breadcrumb.
- [ ] Friendly states: loading, empty, and "no internet / server off" messages with a "Try again" button wherever the page talks to the server.
- [ ] Accessibility pass: labels for icon-only buttons, visible keyboard focus, alt text for pictures, colour contrast of small grey text.
- [ ] Speed: `loading="lazy"` and sizes on photos, smaller photo files if any is over 300 KB, cache headers for `photos/` in `vercel.json`.
- [ ] Voice test: more questions, pictures and sentences per level, and do not repeat the ones a student had last time.
- [ ] Pronounce section: when the speech service is on (`GET /api/voice` → `speech: true`), score with it instead of the browser's recognition, like the voice test does.
- [ ] Install on a phone: web app manifest + icons, so students can add the site to the home screen (no offline caching yet).
- [ ] Bug hunt: take the placement test from start to finish in headless Chrome, then a lesson quiz, a matching game and each listening exercise type; fix what breaks.

## Needs the owner
<!-- Questions and things only he can decide or do. The agent adds here and does not act. -->
- Arabic interface (English/Arabic switch)? It is a large change — do you want it for this site?
- Real student accounts (login) so nobody can overwrite another student's progress — wanted before students join.
- The Azure speech path and real voices have not been tested by a person yet: take the voice test yourself and say if the level looks right.

## Done
- [x] 2026-11-18 Phone navigation: tab bar at the bottom, current section highlighted, header no longer wider than the screen.
- [x] 2026-11-17 Voice level test (speak, describe a picture, listen and repeat).
