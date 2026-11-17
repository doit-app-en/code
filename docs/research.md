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

**Angles not covered yet** (for the next runs): speaking and pronunciation practice · vocabulary and spaced repetition ·
placement and level tests · teacher dashboards and assignments · listening · apps popular with Arabic speakers · reading and graded texts.
