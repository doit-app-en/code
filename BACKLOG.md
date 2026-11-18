# Backlog

The improvement agents (see `AGENT.md`) work from this file: each role has its own section. Anyone can add a line.

## Owner requests
<!-- Abdulmohsen: write what you want here (Arabic is fine), one line each. These come first. -->

## Next
<!-- developer -->
- [ ] Speed: smaller photo files if any is over 300 KB, `width`/`height` on the remaining photos. (Cache headers for `photos/` and `icons/` are done.)
- [ ] Voice test: more questions, pictures and sentences per level, and do not repeat the ones a student had last time.
- [ ] Pronounce section: when the speech service is on (`GET /api/voice` → `speech: true`), score with it instead of the browser's recognition, like the voice test does.
- [ ] Weekly goal: the student picks 2, 3 or 5 days a week; the home "today" card shows "2 of 3 days this week" (from "Ideas from other sites"; the week strip is already there).
- [ ] Streak milestones: a short celebration when the streak reaches 3, 7, 14 and 30 days, and one free rest day a week so one missed day does not reset it (from "Ideas from other sites"; `streakInfo()` in `09-progress.js`).
- [ ] Bug hunt: take the placement test from start to finish in headless Chrome, then a lesson quiz, a matching game and each listening exercise type; fix what breaks.

## Design
<!-- designer: one page or flow per run -->
- [ ] Voice level test: intro, recording and result pages on a phone.
- [ ] Placement test: question page and result page on a phone.
- [ ] My progress page: make the numbers easy to read at a glance.
- [ ] Phone polish for the remaining pages: text sizes, buttons at least 44px high, wide tables scroll inside their own box.
- [ ] Accessibility pass: labels for icon-only buttons, visible keyboard focus, alt text for pictures, colour contrast of small grey text.

## Content
<!-- content: one section per run, in this order, then start again. Write the date next to a section when you finish it. -->
- [x] Placement test questions — 2026-11-17: default set + the "Generate" templates checked; 4 items with two correct answers fixed, 6 new questions (now 48). Reaches existing devices through `PLACE_V` / `upgradePlacement` in `05-placement.js`.
- [x] Level A1 lessons — 2026-11-17: the one default lesson ("My Daily Routine") checked, nothing wrong; 2 new lessons of the same kind added ("After School", "Things I Like", 4 phrases each) so the level covers what its card promises (routines, likes, simple questions). Reaches existing devices through `LESSON_V` / `upgradeLessons` in `01-core.js` (new lessons have fixed ids).
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
<!-- 2026-11-17 researcher — angle: motivation, streaks and daily habit. Longer notes in docs/research.md. -->
- **My week: a goal in days.** (2026-11-18: the Sun–Sat week strip is built on the home page; what is left of this idea is the goal the student chooses, "2 of 3 days this week".) The student picks how many days a week to practise (2, 3 or 5); the home page shows Sun–Sat as dots, filled for the days practised, and "2 of 3 days this week". Seen at: Khan Academy's advice to choose fixed study days and a goal (https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/); Languagenut suggests weekly streak challenges (https://help.languagenut.com/article/343-student-streaks). Why: a school student with exams and homework cannot always manage every day; a weekly goal he chose himself is reachable, and does not punish one missed day the way a pure streak does. Size **S**. Nothing paid, no accounts, no decision needed (use a Sunday-first week for Saudi schools).
- **Practice days on the teacher's Students page.** Add "streak" and "days practised this week" to the progress summary each student already sends, and show them as a column next to "last practised". Seen at: Languagenut presents streaks as a sign of effort for teachers (https://help.languagenut.com/article/343-student-streaks); Khan Academy encourages teachers to run streak challenges in class (https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/). Why: the teacher can praise steady effort, not only high scores — a weak student who practises four days a week deserves to be noticed. Size **S–M** (two more numbers inside the saved summary; no database change expected). Nothing paid; no accounts. Note: like the rest of the summary, the numbers come from the student's device and are not verified.
- **Class goal: everyone's practice adds up.** The teacher sets one target for the class (for example 200 finished activities this month) and optionally writes the reward; each student sees a bar "Our class: 124 / 200" that every student's practice fills, and a celebration when it is reached. Seen at: Khan Academy's class challenges where each student's points go to a shared class goal and the teacher chooses the reward (https://blog.khanacademy.org/five-ways-khan-academy-is-making-student-practice-more-motivating/); Duolingo's shared quests between friends (https://blog.duolingo.com/friends-quests/); Pearson recommends team goals over individual ranking (https://www.pearson.com/languages/en-ia/community/blogs/gamification-techniques-teaching-3-26.html). Why: it is motivation without a ranking table — nobody is shown at the bottom, and weaker students help the class as much as strong ones. Size **M** (the server must store the goal and return a class total to students; probably one small new table). Nothing paid, no student accounts. **Needs the owner's decision**: is a class total visible to students acceptable, and who chooses the reward.

## Agent notes
<!-- any agent: what blocked a run, so the organizer can report it -->

## Needs the owner
<!-- Questions and things only he can decide or do. The agent adds here and does not act. -->
- Arabic interface (English/Arabic switch)? It is a large change — do you want it for this site?
- Real student accounts (login) so nobody can overwrite another student's progress — wanted before students join.

- Placement test (content, 2026-11-17): "We ___ hungry. We had a big lunch." uses the past tense ("had") in an A1 test — left as it is; say if you want it changed to the present.
- Placement test (content, 2026-11-17): the generated question "You watch TV in the ___." counts only "living room" as right, though "bedroom" can be offered as a wrong answer and some students do have a TV there — left as it is.
- Placement test (content, 2026-11-17): a teacher who deleted default questions on purpose will still receive the 6 new ones on that device (same behaviour as new listening exercises); they can be deleted again in the Questions tab.
- Level A1 lessons (content, 2026-11-17): the two new lessons are added only on devices where the lesson "My Daily Routine" is still there under that name; a teacher who deleted or renamed it gets nothing new. A student's "Lessons" percentage goes down a little when the new lessons arrive (for example 1 of 6 becomes 1 of 8) — say if you would rather new lessons not be added to devices that already have the course.
- Level A1 lessons (content, 2026-11-17): every default lesson has no video ("No video yet. Your teacher will add one soon!") — only you or a teacher can add videos.
- Lessons (content, 2026-11-17): every level has only one default lesson with 4 phrases (A1 now has three). Do you want the content agent to keep adding two short lessons per level on its daily run?

## Done
- [x] 2026-11-18 Friendly states wherever the page talks to the server: Students page (loading box, "could not be loaded" + Try again, no false "No students yet", voice results line and older-tests list with Try again), shared voice result ("could not be opened" + Try again instead of "not found"), My progress ("could not be sent to your teacher" + Try again; sent again automatically when the internet returns), voice test intro (loading box, 8 s limit), a "No internet connection" bar under the header. Helpers `netWhy()`, `stateBox()`, `loadBox()` in `09-progress.js`; checked in `npm run smoke` with a pretend server that fails and then answers.
- [x] 2026-11-18 Teacher's Students page: "Class" filter and "Order" list above the table (newest/longest ago, name, class, progress high/low, voice test); "Show all N tests" in the Voice test column lists a student's older voice tests with links (new teacher-key-protected `history` action in `api/voice.js`, no database change). Checked with a pretend server and a pretend database only.
- [x] 2026-11-18 Fix: a lost `}` in `styles.css` (after the phone home-page block) had put every later rule inside `@media(max-width:560px)` — the home "today" card, 3-step path and practice tiles, the phone back button and the student cards had no styles on wider screens. `npm run smoke` now fails if the brackets do not match.
- [x] 2026-11-18 Owner confirmed on the live site: the "Voice test" column on the Students page shows results, and a real spoken voice test works ("excellent").
- [x] 2026-11-18 Home page: 3-step path for new students, "today" card for returning ones (streak 🔥, Sun–Sat week dots, "continue where you stopped"), the five sections as a grid of clickable tiles under "Practise". Streak also on My progress. (Researcher idea "Practice streak".)
- [x] 2026-11-18 Voice test result: "What to do next" box — button to the matching level, Pronounce, Listening, and the unclear words.
- [x] 2026-11-18 Teacher's Students page on phones: one card per student under 860px (CSS on the same table; `td[data-l]` labels).
- [x] 2026-11-18 Phones: "← Back" button above every inner page, made from the breadcrumb (`03-ui-routing.js`).
- [x] 2026-11-18 Install on a phone: `manifest.webmanifest` + icons in `public/icons/`, theme colour; week-long cache headers for photos and icons in `vercel.json`. No offline caching.
- [x] 2026-11-17 Design — home page on a phone (CSS only, under 560px): shorter hero photo so the main button is on the first screen, full-width buttons with one yellow main button (banner buttons are white), feature cards no longer break one word per line, compact banners with readable text, level cards two per row, tidy "Load your teacher's course" box. Page is about 30% shorter (4765px → 3297px at 390px wide).
- [x] 2026-11-18 Teacher's Students page: "Voice test" column (level, three scores, date, number of tests, link to the full result) from a teacher-key-protected list in `api/voice.js`. Checked with a pretend database only — not yet seen with the real one.
- [x] 2026-11-18 Phone navigation: tab bar at the bottom, current section highlighted, header no longer wider than the screen.
- [x] 2026-11-17 Voice level test (speak, describe a picture, listen and repeat).
