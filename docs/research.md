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

## 2026-11-19 — Speaking and pronunciation practice

**Why this angle.** Speaking is where the site is strongest (Pronounce by letter with a scored test, lesson Speak, Test your speaking
with AI feedback, the voice level test), so the question today was not "what is missing as a section" but "what do the speaking apps
do *around* a score that this site does not". Checked in the code before proposing: the Pronounce test shows one number per word and
"I heard" (`07-pronounce.js`); the server asks the speech service for word-level scores only (`api/voice.js`); a student cannot play
back the word he just recorded; Pronounce is organised by letter and spelling rule, with nothing about pairs of similar sounds;
"Practise my mistakes" is fed only by lesson Match and lesson Speak; a Test your speaking result has no "same topic again".

**Pages read** (public pages only, read through summaries in our own words; app companies' pages are their own descriptions)

- Duolingo — how it teaches speaking (Feb 2026): https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-speaking-skills
- Duolingo — Video Call (Sept 2024): https://blog.duolingo.com/video-call/
- Duolingo — speaking practice for shy learners (2026): https://blog.duolingo.com/introvert-language-learning-tips/
- Busuu help — speaking practice lessons: https://help.busuu.com/hc/en-gb/articles/19367617005970-Mastering-language-skills-through-speaking-practice
- Cambridge Speak & Improve help — how it helps (April 2026): https://help.writeandimprove.com/en/articles/9652123-how-can-speak-improve-help-me-improve-my-english-speaking
  and its FAQ index (titles only): https://help.writeandimprove.com/en/collections/6874108-new-speak-improve-frequently-asked-questions
- Cambridge One help — Speaking Companion (June 2026): https://cambridgeonehelp.cambridge.org/hc/en-gb/articles/35683198223634-What-is-Speaking-Companion
- ELSA Speak, through a reviewer's account (FluentU, 2024): https://www.fluentu.com/blog/reviews/elsa-speak/
- ELSA Speak and Speechling, through a competitor's comparison (TalkDrill, 2026): https://www.talkdrill.com/blog/compare/elsa-speak-vs-speechling/
- BoldVoice — English pronunciation for Arabic speakers (2023): https://www.boldvoice.com/blog/english-pronunciation-arabic-speakers
- Hadar Shemesh — pronunciation challenges for Arabic speakers (2022): https://hadarshemesh.com/magazine/english-for-arabic-speakers/
- Leonardo English — practising with pairs of similar words (2025): https://www.leonardoenglish.com/blog/minimal-pairs

How far to trust these: ELSA was not read from its own pages but from a review and from a rival's marketing page, so the details
(colours per sound, prices, accuracy claims) are second-hand; the rival's page promotes its own product. Speak & Improve's pages on
price and on how scores are shown could not be opened, so its feedback screen is not known here. No app was installed or used.

**What they do**

- *From sound to sentence.* ELSA (per the review) starts with a speaking test of under ten minutes that names the learner's problem
  sounds, then offers a few short lessons a day that climb from a single sound to words, phrases and sentences. Duolingo's own list
  runs from repeating words in the first lesson, through speaking-only practice sessions (it says these are free), to conversation.
- *Ears before mouth.* ELSA has checks where the learner hears one of two near-identical words and chooses; Duolingo names sound
  drills and pairs of similar words for new sound systems. The Leonardo English guide gives the reason: part of the difficulty is
  that the learner does not hear the difference yet. Its order is: find your problem sounds, learn how the sound is made, say each
  word of the pair slowly, then at normal speed, then in a sentence, recording and listening back.
- *Which sounds, for Arabic speakers.* The two teachers' guides agree closely: p said as b; v said as f; ch said as sh; a vowel
  slipped into groups of consonants ("spring" in two beats, "-ed" endings split); the short vowels of "sit" and "set" merging
  towards "seat"; the vowel of "bird"; a rolled r. One also mentions extra pauses before words that begin with a vowel, and word
  and sentence stress. Suggested practice: the mouth shape first (a mirror), then pairs, then words in sentences.
- *Feedback finer than one number.* ELSA is described as scoring each sound of a word (green / orange / red) and explaining how to
  make a sound that was wrong, with mouth diagrams. Busuu marks the unclear *words* of a phrase in red and adds written advice (in
  its English course). The reviewer found ELSA strict — several tries to pass a sound — and its intonation exercises too rigid.
- *Hearing yourself.* Busuu's speaking lesson (a video of a fluent speaker, then hold-to-record) lets the learner play his own
  recording and the speaker's before trying again, with two more attempts. Speak & Improve keeps every recording and advises
  listening back for the unclear parts, re-recording and comparing. Duolingo's advice for shy learners includes recording yourself
  and repeating along with a good speaker, copying rhythm and melody.
- *Rewarding the trying.* Speak & Improve gives awards for use, tasks completed and for checking and improving, and stresses that
  nobody hears the learner's mistakes. Cambridge's Speaking Companion produces no score at all: after a conversation the learner
  gets a transcript with playback, a chart of the level of the words he used, and an encouraging message; teachers see only
  completion, attempts and talking time.
- *Open conversation with an AI character.* Duolingo's Video Call (one to three minutes, no grammar correction, the learner can ask
  the character to slow down or repeat) is in its most expensive plan only. Speaking Companion is for ages 16 and over and sold
  only with Cambridge courses. ELSA's AI conversations are in its paid plans. Speechling adds written feedback from a human coach
  within a day or two.

**What I chose to propose, and what I left out**

Proposed in `BACKLOG.md` (best first): sound pairs with a listening step · hear yourself next to the model · unclear words go to
"Practise my mistakes" · which sound was weak, with one tip · the same speaking topic again with before and after.

Left out on purpose:
- *Free conversation with an AI character.* Every example found is paid or restricted to older learners. Here it would mean a paid
  call per turn, open-ended AI talk with minors, and nothing an agent can test without a voice — an owner decision much larger
  than a feature. Test your speaking already gives a prepared topic and AI feedback, which is the safer half of the same idea.
- *Human coach feedback* (Speechling). That is the class teacher's place; the Students page already shows him the voice test.
- *Intonation and sentence-melody scoring.* The reviewer found it rigid even in the app that specialises in it, and the voice test
  already reports a rhythm-and-melody number where the service gives one.
- *Mouth diagrams and videos of a speaker.* Pictures and videos would have to be made by the owner or a teacher (nothing may be
  copied); a one-line written tip per sound gives most of the value.
- *Word-stress exercises* ("tap the strong part of the word"). Worth a later look, but it needs every word split into its beats by
  hand and suits B1 and above more than the A1–A2 students who are most of the audience.
- *Repeating along with a long recording (shadowing).* Lesson Speak and the voice test's listen-and-repeat sentences already cover
  the sentence-sized version; longer passages belong with the listening angle.
- *Awards for number of recordings.* The streak, weekly goal and badges already reward turning up.

**Notes for whoever builds these**

- Sound pairs: write the word lists ourselves, with words an A1–A2 student knows and that British and American speakers say with the
  same contrast (pin / bin, pack / back, fan / van, fine / vine, chip / ship, chair / share, sit / seat, ship / sheep). Avoid pairs
  where one word is rude or very rare. A pair is only usable if the device's voice makes the two words clearly different — the
  browser's voices differ from phone to phone, so keep to strong contrasts at the start of a word and let "Slowly" replay it.
- Sound pairs, speaking step: a speech recogniser tends to "correct" a word towards what it expects, so with the basic check the
  honest test is whether it *heard the other word of the pair* ("I heard: bark"); with the full check use the score as today.
- Hear yourself: the full check already holds the WAV it posts (`prRecord()`); play it from memory and drop it when the next word is
  drawn or the student leaves (`prAbort()` / `stopAll()`), so nothing new is stored. With the browser's recognition, a second
  recorder on the same microphone fails silently on some phones — if it cannot be made reliable, simply do not show "▶ Me" there.
- Per-sound scores: check the speech service's documentation for whether scores per sound are returned for the British English
  voice the site uses before promising anything; show three colours, never a number per sound; do not show the row at all when the
  word was not recognised. The daily limits and the registered-student check stay exactly as they are.
- Unclear words in "Practise my mistakes": store the word itself (a Pronounce word has no lesson id) as a new kind of entry in the
  same `mistakes` key; older entries must still be read as before.
- Same topic again: match attempts by the topic's id, and say nothing when the new score is lower except what to try next.
- None of the speaking parts can be checked by an agent with a real voice; say so in the changelog as usual.

## 2026-11-20 — Listening

**Why this angle.** Listening is the site's largest section by count (84 exercises) but the narrowest by kind. Checked in the code
before proposing (`public/js/08-listening.js`): there are nine exercise types, all of the young-learner test kind — move, draw
lines, tick, colour, write a name or number, number the pictures; every one of the 84 default exercises is in the single group
"A1 listening" (the groups A2–C2 exist as names but are empty); everything is read by the device's computer voice, with a pitch
per speaker (woman, man, boy, girl); there is "Play all", a button per sentence and "Slow"; and only "Listen and write" offers the
audioscript after checking. Lessons show the words while a phrase is heard. So the questions today were: what do other sites give
an older student to listen to, what happens after a wrong answer, and is there practice in catching the words themselves.

**Pages read** (public pages only, read through summaries in our own words; companies' pages are their own descriptions)

- British Council LearnEnglish — one B1 listening lesson page: https://learnenglish.britishcouncil.org/free-resources/listening/b1/interview-about-listening-skills
- Randall's ESL Cyber Listening Lab — home page: https://esl-lab.com/ and its own handout for teachers (June 2019): https://www.esl-lab.com/wp-content/uploads/handouts/esl-lab.pdf
- ELLLO (English Listening Lesson Library Online) — home page: https://www.elllo.org/home/index.htm
- Duolingo — how it teaches listening (May 2026): https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-listening-skills/
- Duolingo — radio-style listening lessons (2023, updated 2026): https://blog.duolingo.com/duoradio-listening-practice
- 7ESL — dictation practice: https://7esl.com/listening/dictation/
- Speechling — help page for its dictation: https://speechling.com/help/dictation
- DailyDictation — home page: https://dailydictation.com
- EnglishClub — dictation page: https://englishclub.com/listening/dictation.htm
- LyricsTraining (songs with missing words), through three descriptions by others: Common Sense Education's review
  https://www.commonsense.org/education/reviews/lyricstraining, a teachers' blog (2023)
  https://teachersfirst.org/blog/2023/08/tech-tool-of-the-month-lyricstraining-part-2/ and the ECML's inventory of tools
  https://ecml.at/Resources/ICT/tabid/5865/InventoryID/184/language/de-DE/Default.aspx
- For teachers, on why listening is hard: a Cambridge paper (the file name gives John Field as author; 2019 copyright)
  https://www.cambridgeenglish.org/Images/524275-second-language-listening-where-are-we-john-field-cambridge-english-teacher-.pdf,
  Daniel Tse in the IH Journal (2023) https://ihworld.com/ih-journal/issues/issue-50/developing-word-recognition-sub-skills-in-listening
  and Rachael Roberts on the Oxford University Press teachers' blog (2012) https://teachingenglishwithoxford.oup.com/2012/05/17/decoding-skills-listening-comprehension/

How far to trust these: for ESL Cyber Listening Lab and ELLLO only the home pages and one handout were read, not a lesson page, so
the order of steps inside a lesson and the length of recordings are from their own descriptions (the handout is from 2019).
The British Council page was read as text: whether its transcript is folded away behind a button could not be seen. For
DailyDictation and Speechling only a front page and a help page were read; what happens on a wrong answer in DailyDictation is
not known here. LyricsTraining itself was not opened. The Duolingo pages do not say which of these features are paid. No app was
installed, no account made, no exercise played. The British Council's listening pages for teenagers were looked for but not found
by the search, so the adult site's lesson stands in for them.

**What they do**

- *One recording, one page, three stages.* The British Council's lesson has a matching task before the audio, the audio, then two
  tasks (true / false, matching), the transcript, a worksheet to print and a question to discuss. Lessons are sorted A1 to C1.
  ESL Cyber Listening Lab describes the same shape: level, topic and speakers shown first, a prediction step, multiple-choice
  questions the learner may read before listening, an answer straight away, then the script with the key words in bold, then
  discussion. ELLLO says most of its lessons have audio or video, a script, a few words to learn and a quiz.
- *Real people.* ESL Cyber Listening Lab is recorded by its author with family and friends — adults and children at natural speed.
  ELLLO's speakers come from more than a hundred countries (its page shows Jordan and Algeria among them), and it has one-minute
  talks and a format where six people answer the same question.
- *Sorted by level first, topic second.* Three levels at ESL Cyber Listening Lab (easy, intermediate, difficult — by topic,
  words and speed of speech); ELLLO has beginner, intermediate and advanced with a 12-question level quiz for each.
- *Text first, then no text.* Duolingo's article says listening exercises early in a unit show the words and later ones are sound
  only: match a sound to a word, choose the missing word from two spoken options, type the missing word. A slow-play button is
  always there, and its advice is to listen with eyes closed before reading. Its radio-style lessons are short spoken episodes
  with a true / false check and "which three of these five words did you hear". Learners with hearing difficulty can switch
  listening exercises off.
- *Dictation, one line at a time.* 7ESL plays one line, lets the learner replay it freely, and checks word by word (right,
  missing, different); capitals, punctuation and apostrophes are ignored and numbers may be digits or words; "show answer" counts
  as wrong; the transcript comes afterwards. Speechling marks right and wrong words and brings back an item the learner gave up
  on. DailyDictation's steps end with saying the sentence aloud. EnglishClub grades its dictations by length: a line or two, a
  sentence or two, a paragraph or two.
- *Why dictation at all.* The three teachers' articles agree: classes mostly test listening (a recording, questions, right or
  wrong) and rarely teach it. The usual cause of a wrong answer is not missing vocabulary but not recognising known words when
  they run together — small words lose their vowel, a final sound vanishes or changes before the next word, and there are no
  spaces between words in speech. Their remedies are short and frequent: five minutes of writing down difficult stretches,
  counting the words in a sentence, same / different listening, writing the full form of a reduced phrase, then comparing with
  the script and listening again while reading. One of them adds that this works best on a text the learner has already understood.
- *Songs.* LyricsTraining plays a music video with words missing from the lyrics; the learner types them or picks from four,
  at four levels that blank more and more words; replaying a line costs points. The reviewers like it for older students but
  warn about advertisements, a "buy" button, songs unsuitable for school and slang.

**What I chose to propose, and what I left out**

Proposed in `BACKLOG.md` (best first): a short conversation with questions for A2–B1 · listen and build the sentence · the script
after checking in every exercise · little words: "What did you hear?" · a teacher's own voice in a listening exercise.

Left out on purpose:
- *Songs and music videos* (LyricsTraining). Other people's videos and lyrics cannot be brought into the site, a link out leads
  to advertisements, and music is a matter of the school's and families' choice here — not for an agent to introduce.
- *Videos and recordings of real speakers from other sites* (ELLLO, ESL Cyber Listening Lab). Nothing may be copied; the honest
  equivalent is the teacher's own recording (idea 5).
- *A discussion question with comments under each recording* (British Council). Public comments by school students need
  moderation and are an accounts-and-safety decision far bigger than the feature. A teacher can ask the question in class.
- *Printable worksheets.* Useful to a teacher, but it is a second kind of content to keep in step with every exercise; later.
- *A limit on how many times the audio can be played, as in exams.* The site is for practice; the articles point the other way
  (replay a short stretch many times). An "exam mode" could be a later option for a teacher.
- *A 12-question listening level quiz* (ELLLO). Belongs with the placement-test angle, which has listening questions already.
- *Wrong listening answers into "Practise my mistakes".* Already in the backlog as what is left of that idea.
- *Accents from many countries.* The device's voices are what they are; the site teaches British English.

**Notes for whoever builds these**

- Conversation with questions: write every conversation ourselves, about 100–150 words at A2 and up to 200 at B1, two speakers
  with clearly different voices (a man and a girl, not two women) because the computer voices are told apart only by pitch.
  Questions follow the order of the recording; every answer must be findable in one line, so the script can mark it. New default
  exercises reach existing devices through `LISTEN_V` / `upgradeListen`, as now; put them in the groups "A2 listening" and
  "B1 listening" that already exist as names.
- Listen and build the sentence: reuse `wNorm()`-style cleaning (it already treats "8" and "eight" alike in "Listen and write")
  and `heardFix()` in `judge()` for clock times; accept "I am" for "I'm" here, whatever is decided for lesson Speak. For the
  tap-the-words version take the two extra words from other phrases of the same lesson. Only phrases with text (`txtOk()`).
  Cap a round at about eight phrases.
- Script after checking: the sentences are in each exercise already (`say` / steps); escape with `esc()`; stop any playing audio
  when a line's 🔊 is pressed (`quiet()`), and keep the script closed again after "Try again".
- Little words: keep to contrasts a computer voice is likely to make (can / can't with the British long vowel, he's / he was,
  I'll go / I go, there's a / there are) and avoid ones that depend on a weak vowel the voice may not produce. Show the sentence
  after every answer, right or wrong — the point is to connect the sound with the words.
- Teacher's voice: a lesson's voice track already shows how a recording is stored with the course and exported; follow that.
  Check the size of an exported course with one-minute recordings before promising it.
- As always, none of this can be heard by an agent; say so in the changelog, and see the two "needs the owner's ear" notes.

**Angles not covered yet** (for the next runs): placement and level tests · teacher dashboards and assignments ·
apps popular with Arabic speakers · reading, spelling and graded texts · word stress and sentence rhythm (touched on 2026-11-19) ·
listening sites made for teenagers (the British Council's teens pages were not reached on 2026-11-20).
