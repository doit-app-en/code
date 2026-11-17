# Backlog

The improvement agents (see `AGENT.md`) work from this file: each role has its own section. Anyone can add a line.

## Owner requests
<!-- Abdulmohsen: write what you want here (Arabic is fine), one line each. These come first. -->

## Next
<!-- developer -->
- [ ] Voice test result: recommend where to go next ("Your level is A2 → start the A2 lessons") with a button to that level, and to the Pronounce section for weak words.
- [ ] Home page: a clear first-time path (1 find your level → 2 open your level → 3 practise every day) and a "continue where you stopped" card for returning students.
- [ ] Teacher's Students page on phones: the table has 9 columns and the teacher must scroll sideways to reach "Voice test" — show each student as a card under 860px instead.
- [ ] Teacher's Students page: sort / filter by class, and a way to see a student's older voice tests (the server already returns how many each one took).
- [ ] Friendly states: loading, empty, and "no internet / server off" messages with a "Try again" button wherever the page talks to the server.
- [ ] Speed: `loading="lazy"` and sizes on photos, smaller photo files if any is over 300 KB, cache headers for `photos/` in `vercel.json`.
- [ ] Voice test: more questions, pictures and sentences per level, and do not repeat the ones a student had last time.
- [ ] Pronounce section: when the speech service is on (`GET /api/voice` → `speech: true`), score with it instead of the browser's recognition, like the voice test does.
- [ ] Install on a phone: web app manifest + icons, so students can add the site to the home screen (no offline caching yet).
- [ ] Bug hunt: take the placement test from start to finish in headless Chrome, then a lesson quiz, a matching game and each listening exercise type; fix what breaks.

## Design
<!-- designer: one page or flow per run -->
- [ ] Home page on a phone: first screen, banners and level cards — spacing, hierarchy, one clear main button.
- [ ] Inner pages (a lesson, an exercise, a result): a clear "← Back" button at the top on phones, not only the breadcrumb.
- [ ] Voice level test: intro, recording and result pages on a phone.
- [ ] Placement test: question page and result page on a phone.
- [ ] My progress page: make the numbers easy to read at a glance.
- [ ] Phone polish for the remaining pages: text sizes, buttons at least 44px high, wide tables scroll inside their own box.
- [ ] Accessibility pass: labels for icon-only buttons, visible keyboard focus, alt text for pictures, colour contrast of small grey text.

## Content
<!-- content: one section per run, in this order, then start again. Write the date next to a section when you finish it. -->
- [ ] Placement test questions
- [ ] Level A1 lessons
- [ ] Level A2 lessons
- [ ] Level B1 lessons
- [ ] Level B2 lessons
- [ ] Pronounce sections
- [ ] Listening exercises
- [ ] Speaking tasks
- [ ] Voice test questions, pictures and sentences

## Ideas from other sites
<!-- researcher: proposals only, best first. The organizer may move small ones (size S, nothing paid, no decision needed) to "Next". -->
<!-- Abdulmohsen: move an idea you like up to "Owner requests" and it will be built. -->

## Agent notes
<!-- any agent: what blocked a run, so the organizer can report it -->

## Needs the owner
<!-- Questions and things only he can decide or do. The agent adds here and does not act. -->
- Arabic interface (English/Arabic switch)? It is a large change — do you want it for this site?
- Real student accounts (login) so nobody can overwrite another student's progress — wanted before students join.
- New "Voice test" column on the Students page: open it with your teacher key on the live site and say if the results appear (the agent cannot reach the real database).
- The Azure speech path and real voices have not been tested by a person yet: take the voice test yourself and say if the level looks right.

## Done
- [x] 2026-11-18 Teacher's Students page: "Voice test" column (level, three scores, date, number of tests, link to the full result) from a teacher-key-protected list in `api/voice.js`. Checked with a pretend database only — not yet seen with the real one.
- [x] 2026-11-18 Phone navigation: tab bar at the bottom, current section highlighted, header no longer wider than the screen.
- [x] 2026-11-17 Voice level test (speak, describe a picture, listen and repeat).
