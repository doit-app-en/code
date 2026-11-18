# Research notes

The researcher agent keeps its longer notes here: which sites it looked at, when, and what it found. Proposals go in `BACKLOG.md`.

## 2026-11-17 — Motivation, streaks and the daily habit

**Why this angle first.** The site has plenty to practise but nothing that brings a student back tomorrow except the reminder email.
It already records what is needed: `onActivity()` in `public/js/09-progress.js` saves a count per day in `activity.days` on the device.
Nothing on the site shows it yet (My progress shows percentages only), so the cheapest motivation features need no server work.

**Pages read** (public pages only; all are the companies' own descriptions, so their numbers are claims, not independent findings)

- Duolingo — how the streak builds a habit: https://blog.duolingo.com/how-duolingo-streak-builds-habit
- Duolingo — Friends Quests: https://blog.duolingo.com/friends-quests/
- Duolingo — Friend Streak: https://blog.duolingo.com/friend-streak/
- Khan Academy — six months of streaks: https://blog.khanacademy.org/keeping-your-streak-alive-insights-tips-from-the-last-6-months/
- Khan Academy — five ways practice becomes more motivating: https://blog.khanacademy.org/five-ways-khan-academy-is-making-student-practice-more-motivating/
- Languagenut (a languages site for schools) — student streaks: https://help.languagenut.com/article/343-student-streaks
- Pearson — gamification techniques for participation: https://www.pearson.com/languages/en-ia/community/blogs/gamification-techniques-teaching-3-26.html

**What they do**

- *The streak itself.* Duolingo and Languagenut both count days in a row with at least one finished activity. The bar is deliberately
  low: Khan Academy describes a "no zero days" idea where a single practice question is enough. Languagenut resets to zero after a
  missed day and adds bonus points for streak days.
- *Why early days matter.* Duolingo's explanation: going from 2 to 3 days feels like a big step, 200 to 201 does not, so short streaks
  motivate by growth and long ones by not wanting to lose them. They say a celebration when the streak grows (bigger on milestone
  days) made new learners slightly more likely to still be active a week later (+1.7% by their figure), and that learners who reach
  seven days are far more likely to finish a course (a correlation — keen learners do both).
- *Slack.* Duolingo's "freeze" protects the streak for one missed day (at most two held at a time); they report it raised daily
  activity a little and did not make people skip more often. In their app it is bought with in-app currency — not something for this site.
- *Weekly rhythm rather than every day.* Khan Academy advises students to fix study days early in the week and set a goal, and
  teachers to use wall calendars and class streak competitions. Languagenut suggests weekly challenges and aiming for five days.
- *Together, not against each other.* Khan Academy's planned class challenges add every student's points to one class goal, the
  teacher picks the reward and the class sees a shared celebration, with nothing for the teacher to set up by hand. Duolingo pairs two
  friends on a five-day shared target, and lets friends keep a joint streak (they claim +22% daily completion for those who have one).
  Pearson's article compares ranking tables and recommends team or tiered ones, reset often, with recognition of personal bests,
  because a single global ranking discourages those at the bottom.
- *What the student's first screen shows.* Languagenut's student dashboard leads with the current streak, points this month, rankings
  and open assignments — the "how am I doing today" numbers, before any content.

**What I chose to propose, and what I left out**

Proposed in `BACKLOG.md` (best first): practice streak · weekly goal with a week strip · milestones and a free rest day ·
practice days on the teacher's Students page · a shared class goal.

Left out on purpose:
- *Ranking tables of students (school or world ranking, leagues).* They show children's names and scores to each other, they
  discourage the weakest, and without real accounts the numbers could be faked from any device. The class goal gives the group
  feeling without a ranking.
- *Coins, gems, things to buy or unlock.* A whole economy to build and balance; too large for the value, and the "buy a freeze"
  pattern is a pressure tactic unsuited to a school site.
- *Friend streaks, nudging a friend.* Need accounts and messages between students (minors) — an owner decision far bigger than the feature.
- *Loss-heavy wording* ("you will lose your streak!"). Duolingo itself notes that a lost streak does not erase what was learnt; any
  streak text here should be encouraging ("Welcome back — start a new streak today"), never a threat.

**Notes for whoever builds these**

- A device clock decides "today"; use the same `todayKey()` the activity log already uses so the streak and the log agree.
- The streak lives on the device like the rest of a student's progress: a new phone starts at zero. Sending it in the progress
  summary (idea 4) would also be the natural way to restore it later if accounts arrive.
- Friday and Saturday are the weekend in Saudi Arabia: a Sunday-first week strip matches the school week.

## 2026-11-18 — Vocabulary and spaced repetition

**Why this angle.** A lesson here teaches a handful of phrases (picture, sound, Match, Speak) and is then marked done; nothing ever
brings those phrases back. The Match game counts mistakes (`M.mist` in `public/js/06-lessons.js`) but does not remember *which* pairs
were wrong, and there is no place where a student sees the words he has met. Yesterday's streak work gives a reason to come back
daily; this angle is about what is worth doing on those days.

**Pages read** (public pages only; the app companies' pages are their own descriptions, so numbers are claims, not independent findings)

- Duolingo — the Practice tab (Mistakes, Words, Speak, Listen): https://blog.duolingo.com/guide-to-duolingo-practice-hub/
- Duolingo — spaced repetition explained by one of its learning scientists: https://blog.duolingo.com/spaced-repetition-for-learning
- Duolingo — seven ways to practise: https://blog.duolingo.com/ways-to-practice-in-duolingo
- Memrise — product notes with its review steps: https://www.memrise.com/blog/february-product-roundup
- Busuu — spaced repetition and its vocabulary trainer: https://www.busuu.com/en/languages/spaced-repetition
- Lingvist — how it times repeats: https://lingvist.com/blog/spaced-repetition-in-learning/
- Quizlet Learn at launch (news article, 2017): https://thejournal.com/articles/2017/03/09/quizlet-debuts-study-feature-that-helps-students-study-efficiently.aspx
- British Council LearnEnglish — vocabulary hub: https://learnenglish.britishcouncil.org/free-resources/vocabulary
- British Council LearnEnglish Kids — word games index: https://learnenglishkids.britishcouncil.org/grammar-vocabulary/word-games
- Cambridge English — practising English at home (for parents): https://www.cambridgeenglish.org/learning-english/parents-and-children/your-childs-interests/practising-vocabulary-outside-the-classroom/
- Cambridge English — free A1 vocabulary activities menu: https://assets.cambridgeenglish.org/portal/learner/a1/vocabulary.html

Only these pages were read, not the exercises or games behind them, so what a single British Council or Cambridge activity looks
like inside is not confirmed here.

**What they do**

- *The idea itself.* Duolingo's explanation: when a word is reviewed matters as much as how often; the same number of repeats spread
  over several days is remembered far longer than in one evening, and the gaps should grow as the word becomes familiar. They are
  open that this gives no quick gain, only longer memory. Lingvist aims each repeat at the moment recall has dropped to roughly 80%.
- *Fixed steps are enough.* Memrise publishes plain steps: 4 h, 12 h, 24 h, 6 days, 12 days, 48 days, 96 days, 6 months. Right moves
  the item up one step; wrong sends it back to the start. Busuu's article gives 1, 7, 14, 20 and 35 days as a general example.
  Nobody shows the learner the timetable — the learner only sees "things to review".
- *Mistakes as their own practice.* Duolingo's Practice tab has a "Mistakes" session that replays a learner's past errors in a set
  of about ten, and a "Words" session built on matching. (Its December 2025 article lists these under the paid plan, its February
  2026 one says the Practice tab is free for everyone; the later page appears to be current.) Busuu repeats "difficult" words until recalled.
- *Words collected automatically.* Busuu saves every word met in a lesson into a trainer without the learner doing anything, and
  quizzes show which are weak. Lingvist starts with a short test of up to 50 words to switch off words already known.
- *Mixing question types and a date.* Quizlet Learn (2017 launch) starts with a quick check, lets the student enter a test date,
  mixes flashcards, true/false, multiple choice and written answers, and makes them harder as the student improves.
- *Speed and replay.* Duolingo has a timed word-matching challenge and "legendary" replays of a finished unit without hints.
- *Sites for young learners.* The British Council's hub is by level (A1–A2, B1–B2) and topic, and says each topic teaches meaning,
  pronunciation and spelling; its children's site has about 130 small word sets, one subject each. Cambridge's free A1 menu includes
  a picture dictionary with pronunciation and click-a-word-to-hear-it reading. Cambridge's advice to parents includes a box that
  collects the week's new words, with a few taken out each day to review. None of these pages describes any automatic review.

**What I chose to propose, and what I left out**

Proposed in `BACKLOG.md` (best first): practise my mistakes · words to review today · mixed one-minute match · My words page ·
teacher's words of the week.

Left out on purpose:
- *A "smart" memory model* (Lingvist's personal curve, Busuu's AI review). With a few dozen phrases per level, fixed steps do the
  same job, can be explained to a teacher in one sentence, and need no server.
- *Review steps of hours* (Memrise's 4 h and 12 h). School students open the site once a day at most; the first step should be "tomorrow".
- *Students making their own flashcard sets* (Quizlet). Typing words and Arabic meanings is a new kind of content with no checking;
  better after an Arabic interface is decided.
- *"Enter your test date" planning* (Quizlet Learn). Attractive for school, but the site's content is not tied to the school book's
  units, so the plan would promise more than it can deliver.
- *A known-words pre-test that hides content* (Lingvist). The placement test already chooses a level; hiding lessons would conflict
  with "do not remove content".
- *Typing/spelling answers.* Possibly a good later step (the British Council treats spelling as part of knowing a word), but typing
  on a phone is slow for A1 students and it deserves its own look under "reading and writing".

**Notes for whoever builds these**

- Phrases need a stable identity for a review date or a mistake to point at: lesson id + position breaks if a teacher reorders or
  edits a lesson. Check how lessons and their phrases/pairs are stored before choosing a key (the phrase text itself may be safest),
  and drop entries whose phrase no longer exists.
- Store review data in its own new key in the `kv` store; do not change how existing keys are read.
- A finished review round or mistakes round should call `onActivity()` so it counts for the streak and the week dots.
- Cap every round (about ten items, under five minutes) and word the entry point kindly: "8 words to review", never "8 overdue".
- Lessons whose phrases have no picture can still be reviewed by sound and text; decide the fallback before building.
- Agents cannot hear or speak, so any review step that uses the microphone cannot be checked in the smoke test; the picture and
  choice steps can.

**Angles not covered yet** (for the next runs): speaking and pronunciation practice · placement and level tests ·
teacher dashboards and assignments · listening · apps popular with Arabic speakers · reading, spelling and graded texts.
