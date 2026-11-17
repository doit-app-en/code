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
<!-- 2026-11-17 researcher — angle: motivation, streaks and daily habit. Longer notes in docs/research.md. -->
- **Practice streak ("3 days in a row 🔥").** Count the days in a row on which the student finished at least one activity, and show the number on the home page and on My progress; one finished activity of any kind keeps it alive. Seen at: Duolingo (https://blog.duolingo.com/how-duolingo-streak-builds-habit), Languagenut (https://help.languagenut.com/article/343-student-streaks), Khan Academy (https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/). Why: a little practice every day beats one long session a week, and a visible number gives a teenager a reason to open the site today; the site already saves a per-day activity count on the device (`activity.days`), it only is not shown. Size **S**. No paid service, no accounts, no decision needed.
- **My week: a goal in days, with a seven-dot week strip.** The student picks how many days a week to practise (2, 3 or 5); the home page shows Sun–Sat as dots, filled for the days practised, and "2 of 3 days this week". Seen at: Khan Academy's advice to choose fixed study days and a goal (https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/); Languagenut suggests weekly streak challenges (https://help.languagenut.com/article/343-student-streaks). Why: a school student with exams and homework cannot always manage every day; a weekly goal he chose himself is reachable, and does not punish one missed day the way a pure streak does. Size **S**. Nothing paid, no accounts, no decision needed (use a Sunday-first week for Saudi schools).
- **Streak milestones and one "rest day".** A short celebration when the streak reaches 3, 7, 14 and 30 days (a line on the result page and a mark on My progress), and one automatic rest day a week so a single missed day does not put the streak back to zero. Seen at: Duolingo's milestone animation and Streak Freeze (https://blog.duolingo.com/how-duolingo-streak-builds-habit). Why: the first days are when a new student is most likely to give up, so small early wins matter; and losing a long streak over one busy day makes students stop altogether — a little slack keeps them. Size **S**, after the streak idea above is built. Nothing paid, no accounts. Unlike Duolingo there is nothing to buy: the rest day is simply free.
- **Practice days on the teacher's Students page.** Add "streak" and "days practised this week" to the progress summary each student already sends, and show them as a column next to "last practised". Seen at: Languagenut presents streaks as a sign of effort for teachers (https://help.languagenut.com/article/343-student-streaks); Khan Academy encourages teachers to run streak challenges in class (https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/). Why: the teacher can praise steady effort, not only high scores — a weak student who practises four days a week deserves to be noticed. Size **S–M** (two more numbers inside the saved summary; no database change expected). Nothing paid; no accounts. Note: like the rest of the summary, the numbers come from the student's device and are not verified.
- **Class goal: everyone's practice adds up.** The teacher sets one target for the class (for example 200 finished activities this month) and optionally writes the reward; each student sees a bar "Our class: 124 / 200" that every student's practice fills, and a celebration when it is reached. Seen at: Khan Academy's class challenges where each student's points go to a shared class goal and the teacher chooses the reward (https://blog.khanacademy.org/five-ways-khan-academy-is-making-student-practice-more-motivating/); Duolingo's shared quests between friends (https://blog.duolingo.com/friends-quests/); Pearson recommends team goals over individual ranking (https://www.pearson.com/languages/en-ia/community/blogs/gamification-techniques-teaching-3-26.html). Why: it is motivation without a ranking table — nobody is shown at the bottom, and weaker students help the class as much as strong ones. Size **M** (the server must store the goal and return a class total to students; probably one small new table). Nothing paid, no student accounts. **Needs the owner's decision**: is a class total visible to students acceptable, and who chooses the reward.

## Agent notes
<!-- any agent: what blocked a run, so the organizer can report it -->

## Needs the owner
<!-- Questions and things only he can decide or do. The agent adds here and does not act. -->
- Arabic interface (English/Arabic switch)? It is a large change — do you want it for this site?
- Real student accounts (login) so nobody can overwrite another student's progress — wanted before students join.
- New "Voice test" column on the Students page: open it with your teacher key on the live site and say if the results appear (the agent cannot reach the real database).
- The Azure speech path and real voices have not been tested by a person yet: take the voice test yourself and say if the level looks right.

## Done
- [x] 2026-11-17 Design — home page on a phone (CSS only, under 560px): shorter hero photo so the main button is on the first screen, full-width buttons with one yellow main button (banner buttons are white), feature cards no longer break one word per line, compact banners with readable text, level cards two per row, tidy "Load your teacher's course" box. Page is about 30% shorter (4765px → 3297px at 390px wide).
- [x] 2026-11-18 Teacher's Students page: "Voice test" column (level, three scores, date, number of tests, link to the full result) from a teacher-key-protected list in `api/voice.js`. Checked with a pretend database only — not yet seen with the real one.
- [x] 2026-11-18 Phone navigation: tab bar at the bottom, current section highlighted, header no longer wider than the screen.
- [x] 2026-11-17 Voice level test (speak, describe a picture, listen and repeat).
