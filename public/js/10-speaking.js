/* ================= SPEAKING: Test your speaking ================= */
// The student records up to 3 minutes. The browser writes the words down (speech recognition) and measures the audio.
// Automatic analysis: fluency, accuracy, vocabulary level, formal / informal language. Optional: Claude AI feedback via the class server.
const SP_MAX = 180, SP_MIN = 20, SP_KEEP = 12;
const spSplit = s => String(s).split(/\s+/).filter(Boolean);
const SP_BASIC = new Set(spSplit(`a an the and or but so because if when while that this these those it its i me my mine you your he him his she her we us our they them their is am are was were be been being have has had do does did done can could will would shall should may might must not no yes to of in on at by for with from about into over after before up down out off under between through during without within around again then there here where what who whom whose which why how all any some many much more most other another each every both few little lot lots very too also just only even still already always never often sometimes usually really quite well good bad big small new old young long short high low early late fast slow hot cold happy sad nice great fine right wrong easy hard different same next last first second third one two three four five six seven eight nine ten hundred thousand people man men woman women child children boy girl friend family mother father mum dad brother sister parents husband wife son daughter baby teacher student school class lesson work job office company money time day days night week month year today tomorrow yesterday morning afternoon evening weekend home house room kitchen bed door window table chair city town village country street road car bus train bike plane trip travel holiday food water coffee tea milk bread rice meat fish fruit apple eat drink cook buy sell pay go goes went gone going come came coming get got getting make made making take took taking give gave see saw seen look watch watched say said tell told ask asked talk talked speak spoke think thought know knew want wanted need needed like liked love loved hate enjoy help helped use used try tried start started stop finish finished play played run ran walk walked sit stand sleep slept live lived stay stayed meet met visit visited call called write wrote read learn learned study studied teach clean open close put keep leave left bring brought find found feel felt become became show phone computer game film movie music song book story picture photo sport football tennis swim swimming weather rain sun sunny cloudy windy snow summer winter spring autumn red blue green yellow black white color colour thing things way place part number question answer problem idea word name life world air hand head eye face hair body hospital shop shopping market restaurant park beach sea mountain river garden tree animal dog cat bird flower sorry please thank thanks hello hi okay ok yeah um uh er mm oh ca wo don doesn didn isn aren wasn weren haven hasn couldn wouldn shouldn won s t m re ve ll d`));
const SP_MID = new Set(spSplit(`although however experience improve decide decision opinion environment important example community culture develop development education effect especially explain future government health history importance include information international interesting language manage necessary opportunity particular possible probably produce quality reason receive recent reduce remember remove research result situation social society special support successful suggest technology traditional understand various whether wonder advantage agree allow anyone appear arrange attention available average behaviour benefit candidate celebrate challenge change choice college communicate compare competition complete concern condition connect consider continue control cost create customer damage dangerous deal depend describe destroy difference difficult direct discuss efficient encourage enough entertain event exactly expect expensive fashion focus follow foreign forget freedom generation global guess habit happen healthy impossible increase independent influence introduce invite journey knowledge likely local lonely loss majority mention modern mostly nature negative normal notice obvious occasion offer organise pattern perform personal physical politics popular positive prefer prepare pressure private protect provide public purpose realise recommend relationship relax rely remind repeat require respect responsible rest role safe schedule separate serious service several similar skill solution spend stress strong style succeed suppose surprise survive tend treat trouble trust typical unfortunately useful valuable variety whole worry`));
const SP_ADV = new Set(spSplit(`furthermore moreover nevertheless nonetheless consequently subsequently accordingly albeit whereas notwithstanding substantial significant considerable considerably crucial essential fundamental essentially inevitable inevitably perspective phenomenon potential potentially sustainable sustainability comprehensive contemporary controversial criterion demonstrate dilemma diverse diversity elaborate eliminate emerge emphasise enhance establish evaluate evident exceed exclusively facilitate flexible implement implication incorporate indicate inherent innovative integrate interpret legitimate mainstream maintain mandatory minimise obtain obstacle overcome paradigm perceive predominantly prevalent prioritise proficiency profound rational reinforce reluctant resolve scrutiny sceptical simultaneously speculate stimulate strive supplement tackle thorough tremendous undermine underlying unprecedented viable vulnerable widespread worthwhile approximately ambiguous arguably authentic bias capacity coincide compensate comprise conceive concurrent consensus constitute contradict cultivate deteriorate discrepancy disparity distinguish drastic dynamic empirical enormous equivalent exploit hinder hypothesis impose inclusive incentive indispensable initiative integrity intricate justify lucrative magnitude manipulate meticulous negligible notion obsolete outweigh pertinent plausible pragmatic precedent preliminary prerequisite prominent prone pursue ramification relevant reliable remarkable renowned resilient restrict robust scope seldom sophisticated stance sufficient thrive tolerate transparent ubiquitous vast vigorous`));
const SP_BETTER = {good: 'great, excellent, wonderful, beneficial', bad: 'terrible, awful, harmful, poor', big: 'huge, enormous, major, significant', very: 'extremely, really, particularly', nice: 'pleasant, lovely, enjoyable, kind', thing: 'a clearer noun (an aspect, an issue, an item)', things: 'clearer nouns (aspects, issues, items)', get: 'receive, obtain, become, reach', happy: 'delighted, pleased, thrilled'};
const SP_FORMAL = ['furthermore','moreover','however','therefore','consequently','nevertheless','nonetheless','in addition','in conclusion','to conclude','firstly','secondly','thirdly','finally','to begin with','on the other hand','as a result','in my opinion','i believe that','i would like to','i would argue','i would say','it is important','it is essential','regarding','concerning','whereas','although','thus','hence','would you mind','may i','kindly','sir','madam','i am writing','i look forward','approximately','sufficient','require','assist','additional','obtain','purchase','demonstrate','indicate','considerable','numerous','opportunity','in terms of','with regard to','for instance','in particular','specifically','excuse me','thank you for','i am interested in','i would appreciate','could you possibly','would it be possible','certainly'];
const SP_INFORMAL = ['gonna','wanna','gotta','kinda','sorta','yeah','yep','nope','okay','ok','cool','awesome','guys','stuff','dude','mate','loads of','lots of','a lot of','hey','hi','wow','anyway','you know','i mean','kind of','sort of','really','totally','super','pretty much','basically','whatever','and stuff','or something','a bit'];
const SP_CONTR = /\b(?:i'm|you're|we're|they're|he's|she's|it's|that's|there's|what's|let's|i've|you've|we've|they've|i'll|you'll|we'll|they'll|i'd|you'd|we'd|they'd|\w+n't|can't|won't)\b/g;
const SP_FILLERS = /\b(?:um+|uh+|er+m?|hmm+|ah+)\b/g;
const SP_AUX = new Set(['does','did','do','can','could','will','would','should','must','may','might','shall',"doesn't","didn't","don't","won't","can't","wouldn't","couldn't"]);
const spPrev = (text, idx) => { const m = /([a-z']+)\W*$/.exec(text.slice(Math.max(0, idx - 24), idx)); return m ? m[1] : ''; };
const SP_RULES = [
  {re: /\b(he|she|it)\s+(go|have|do|like|want|live|work|play|watch|eat|come|make|take|need|think|know|see|get|say|love|speak|study|help|use|start|enjoy|prefer|read|write)\b/g, ok: (m, t) => { const p = spPrev(t, m.index); return !SP_AUX.has(p) && !/^(let|make|help|watch|see|hear|have|to)$/.test(p); }, msg: 'After he / she / it the verb needs -s (he goes, she likes).'},
  {re: /\b(i|you|we|they)\s+(goes|has|does|likes|wants|lives|works|plays|watches|eats|comes|makes|takes|needs|thinks|knows|sees|gets|says|loves|speaks|studies|helps|uses|starts|enjoys|prefers|reads|writes)\b/g, msg: 'After I / you / we / they do not add -s (I go, we like).'},
  {re: /\bi\s+(is|are)\b/g, msg: "Use 'I am' (not 'I is' or 'I are')."},
  {re: /\b(?:(he|she|it)\s+(are|am)|(you|we|they)\s+(is|am)|(they|we|you)\s+was)\b/g, msg: "Check the verb 'to be': I am, you / we / they are, he / she / it is."},
  {re: /\b(?:(he|she|it)\s+(don't|dont)|(i|you|we|they)\s+(doesn't|doesnt))\b/g, msg: "Use he / she / it doesn't, but I / you / we / they don't."},
  {re: /\b(doesn't|does not|don't|do not|didn't|did not|can't|cannot|couldn't|won't|wouldn't)\s+(goes|has|likes|wants|lives|works|plays|eats|comes|makes|takes|needs|thinks|knows|went|saw|ate|came|made|took|had)\b/g, msg: "After don't / doesn't / didn't / can't use the base verb (he doesn't go)."},
  {re: /\bmore\s+(better|bigger|easier|faster|cheaper|smaller|older|younger|happier|worse|harder|taller|stronger)\b|\bmost\s+(best|biggest|easiest|worst)\b/g, msg: "Use 'more' or '-er', not both (better, not 'more better')."},
  {re: /\ba\s+([aeio][a-z]*)\b/g, ok: m => !/^(one|once|ouija)$/.test(m[1]), msg: "Use 'an' before a vowel sound (an apple, an hour)."},
  {re: /\ban\s+([bcdfgjklmnpqrstvwxyz][a-z]*)\b/g, ok: m => !/^(hour|hours|hourly|honest|honour|honor|heir|mba|mp|sms|fbi|x|html|lcd|mri|nhs|sos|tv|hr)$/.test(m[1]), msg: "Use 'a' before a consonant sound (a book, a university)."},
  {re: /\ban\s+(university|uniform|union|unit|united|used|useful|user|usual|european|unique|universe|one)\b|\ba\s+(hour|honest|honour|honor|heir)\b/g, msg: "Check a / an before this word (a university, an hour)."},
  {re: /\b(yesterday|last\s+(?:night|week|month|year|summer|weekend|friday|saturday|sunday)|(?:two|three|four|five|few|several|\d+)\s+(?:days|weeks|months|years)\s+ago)\b(?:\s+\w+){0,3}?\s+(i|we|they|he|she)\s+(go|eat|see|have|come|make|take|buy|get|meet|visit|play|watch|spend|stay|travel|do)\b/g, msg: 'Use the past tense for finished time (I went, we visited).'},
  {re: /\b(i|we|they|he|she)\s+(go|eat|see|have|come|make|take|buy|get|meet|visit|play|watch|spend|stay|travel)\b(?:\s+\w+){0,4}?\s+(yesterday|last\s+(?:night|week|month|year|summer|weekend))\b/g, msg: 'Use the past tense for finished time (I went, we visited).'},
  {re: /\b(peoples|childs|informations|advices|furnitures|mans|womans|feets|knowledges|homeworks|equipments|childrens)\b/g, msg: 'Check this word: it is irregular or not countable (people, children, information, advice).'},
  {re: /\b(am|is|are|was|were)\s+(agree|disagree)\b/g, msg: "'Agree' is a verb: say 'I agree', not 'I am agree'."},
  {re: /\b(much)\s+(people|friends|cars|books|students|things|days|times|hours|years|children)\b|\b(many)\s+(water|money|time|information|traffic|food|weather|homework|advice)\b/g, msg: "Use 'many' with countable nouns and 'much' with uncountable ones."},
  {re: /\bdepend(?:s|ed)?\s+of\b/g, msg: "Say 'depend on', not 'depend of'."},
  {re: /\bdiscuss(?:ed|es|ing)?\s+about\b/g, msg: "'Discuss' needs no 'about' (we discussed the plan)."},
  {re: /\bmarried\s+with\b/g, msg: "Say 'married to', not 'married with'."},
  {re: /\b(explain|explained|explains|suggest|suggested|suggests)\s+(me|him|her|us|them)\b/g, msg: "Say 'explain to me' (not 'explain me')."},
  {re: /\bi\s+very\s+(like|love|enjoy)\b/g, msg: "Say 'I like it very much' or 'I really like it'."},
];
const SP_TASKS_DEFAULT = () => [
  {id: uid(), level: 'A1', register: 'informal', title: 'About me and my family', prompt: 'Tell a new friend about yourself and your family. Who is in your family? What do they do?', ideas: ['your name, age and where you live', 'the people in your family', 'what you like doing together']},
  {id: uid(), level: 'A1', register: 'informal', title: 'My daily routine', prompt: 'Tell a friend about a normal day in your life, from the morning to the evening.', ideas: ['what time you get up', 'school or work', 'what you do in the evening']},
  {id: uid(), level: 'A2', register: 'informal', title: 'My last weekend', prompt: 'Tell a friend what you did last weekend. Where did you go? Who were you with?', ideas: ['where you went', 'who you met', 'what you enjoyed most']},
  {id: uid(), level: 'A2', register: 'informal', title: 'My home and my town', prompt: 'Describe the place where you live. What do you like about it? What would you change?', ideas: ['your house or flat', 'places in your town', 'what you like and don\'t like']},
  {id: uid(), level: 'B1', register: 'informal', title: 'A memorable holiday', prompt: 'Tell a friend about a holiday or a trip you will never forget.', ideas: ['where and when you went', 'what happened', 'how you felt and why it was special']},
  {id: uid(), level: 'B1', register: 'formal', title: 'Job interview: tell us about yourself', prompt: 'You are at a job interview. Introduce yourself and explain why you would be a good person for the job.', ideas: ['your education and experience', 'your strengths and skills', 'why you want this job']},
  {id: uid(), level: 'B2', register: 'informal', title: 'A film or book I loved', prompt: 'Tell a friend about a film or a book you loved. What is it about? Why do you recommend it?', ideas: ['the story in a few sentences', 'the characters or the ideas', 'why other people should see or read it']},
  {id: uid(), level: 'B2', register: 'formal', title: 'Presentation: school uniforms', prompt: 'Give a short presentation: Should students wear a school uniform? Give your opinion and reasons.', ideas: ['your opinion', 'two or three reasons', 'a short conclusion']},
  {id: uid(), level: 'B2', register: 'formal', title: 'A phone call about a language course', prompt: 'You are calling a language school. Ask about the course: the price, the times, the teachers and how to join.', ideas: ['greet politely and say why you call', 'ask your questions politely', 'thank the person and finish the call']},
  {id: uid(), level: 'C1', register: 'formal', title: 'Technology in education', prompt: 'Discuss how technology has changed education. Consider the advantages and the risks, and give your own view.', ideas: ['benefits for students and teachers', 'possible problems', 'your balanced conclusion']},
];
let SPK = {mode: 'pick'}, spHistory = [];
const spClamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const spTime = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const spTask = id => state.speaking.tasks.find(t => t.id === id);
const spAIOn = () => !!syncUrl() && !!student && !!student.email;
const REG_LABEL = {formal: 'Formal', informal: 'Informal', any: 'Any style'};

/* ---------- analysis ---------- */
function spTokens(text) { const out = [], re = /[A-Za-z']+/g; let m; while ((m = re.exec(text))) { const w = m[0].toLowerCase().replace(/^'+|'+$/g, ''); if (w) out.push({w, s: m.index, e: m.index + m[0].length}); } return out; }
const spLevel = w => { const b = w.split("'")[0]; if (!b) return 0; const forms = [b, b.replace(/ies$/, 'y'), b.replace(/(es|s)$/, ''), b.replace(/(ed|ing)$/, ''), b.replace(/ly$/, '')];   // friends -> friend, quickly -> quick
  if (forms.some(x => SP_ADV.has(x))) return 3; if (forms.some(x => SP_MID.has(x))) return 2; if (forms.some(x => SP_BASIC.has(x))) return 1; return b.length >= 8 ? 2 : 1; };
function spPhrase(low, list) { const hits = []; list.forEach(p => { const n = (low.match(new RegExp('\\b' + p.replace(/ /g, '\\s+') + '\\b', 'g')) || []).length; if (n) hits.push({p, n}); }); return hits.sort((a, b) => b.n - a.n); }
function spGrammar(text) {
  const low = text.toLowerCase(), errs = [];
  SP_RULES.forEach(r => { const re = new RegExp(r.re.source, 'g'); let m; while ((m = re.exec(low))) { if (m[0] === '') { re.lastIndex++; continue; } if (!r.ok || r.ok(m, low)) errs.push({s: m.index, e: m.index + m[0].length, text: text.slice(m.index, m.index + m[0].length), msg: r.msg}); } });
  errs.sort((a, b) => a.s - b.s); const out = []; errs.forEach(e => { if (!out.length || e.s >= out[out.length - 1].e) out.push(e); }); return out;   // no overlaps
}
function spAnalyse(transcript, M, task) {
  const text = transcript.replace(/\s+/g, ' ').trim(), low = text.toLowerCase(), toks = spTokens(text), n = toks.length, W = Math.max(1, n);
  // --- fluency (speed, pauses, fillers, repeats) ---
  const span = Math.max(8, M.span || M.seconds), wpm = n / (span / 60), pauses = M.pauses || [], ppm = pauses.length / (span / 60), longP = pauses.filter(p => p >= 2).length;
  const fillers = (low.match(SP_FILLERS) || []).length, rep = (low.match(/\b([a-z']{2,})\s+\1\b/g) || []).filter(r => !/^(that that|had had)$/.test(r)).length;
  const rateS = spClamp((wpm - 30) / 80) * (wpm > 190 ? 0.85 : 1), pauseS = spClamp(1 - Math.max(0, ppm - 4) / 10 - longP * 0.08), ratioS = spClamp(((M.speechRatio || 0.7) - 0.5) / 0.4), pen = Math.min(0.25, (fillers + rep) / W * 3);
  const fluency = Math.round(100 * spClamp(0.4 * rateS + 0.35 * pauseS + 0.25 * ratioS - pen));
  // --- accuracy (grammar patterns + how clearly the computer understood) ---
  const errors = spGrammar(text), per100 = errors.length / W * 100, gram = 100 * spClamp(1 - per100 / 12);
  const clarity = M.confidence != null ? Math.round(100 * spClamp((M.confidence - 0.55) / 0.35)) : null, accuracy = Math.round(clarity != null ? 0.8 * gram + 0.2 * clarity : gram);
  // --- vocabulary (variety + level of the words) ---
  const lv = toks.map(t => spLevel(t.w)); let mattr = 1;
  if (n >= 25) { let sum = 0, c = 0; for (let i = 0; i + 25 <= n; i += 5) { sum += new Set(toks.slice(i, i + 25).map(t => t.w)).size / 25; c++; } mattr = sum / c; } else mattr = new Set(toks.map(t => t.w)).size / W;
  const adv = lv.filter(x => x === 3).length, mid = lv.filter(x => x === 2).length, rich = (adv + mid) / W, advShare = adv / W;
  const vocab = Math.round(100 * spClamp(0.45 * spClamp((mattr - 0.5) / 0.35) + 0.35 * spClamp(rich / 0.22) + 0.20 * spClamp(advShare / 0.04)));
  const cefr = vocab < 30 ? 'A1' : vocab < 45 ? 'A2' : vocab < 62 ? 'B1' : vocab < 78 ? 'B2' : 'C1';
  const goodWords = [...new Set(toks.filter((t, i) => lv[i] >= 2 && !/^(very|really)$/.test(t.w) && t.w.length > 3 && !errors.some(e => t.s < e.e && t.e > e.s)).map(t => t.w))].slice(0, 10);
  const counts = {}; toks.forEach(t => counts[t.w] = (counts[t.w] || 0) + 1);
  const overused = Object.keys(SP_BETTER).filter(w => (counts[w] || 0) >= 3).map(w => ({w, n: counts[w], better: SP_BETTER[w]}));
  const basicLinks = ['and', 'so', 'then', 'but', 'because'], richLinks = ['however', 'although', 'while', 'whereas', 'moreover', 'therefore', 'besides', 'firstly', 'finally', 'furthermore', 'consequently', 'instead', 'despite', 'unless', 'since', 'also', 'after', 'before', 'when', 'if'];
  const usedRich = richLinks.filter(w => counts[w]);
  // --- formal / informal language ---
  const fHits = spPhrase(low, SP_FORMAL), iHits = spPhrase(low, SP_INFORMAL), contr = (low.match(SP_CONTR) || []).length;
  const fN = fHits.reduce((a, h) => a + h.n, 0), iN = iHits.reduce((a, h) => a + h.n, 0) + contr, f100 = fN / W * 100, i100 = iN / W * 100;
  let match; if (task.register === 'formal') match = 100 * (0.65 * spClamp(f100 / 2.5) + 0.35 * spClamp(1 - i100 / 6)); else if (task.register === 'informal') match = 100 * (0.7 * spClamp(i100 / 4) + 0.3 * spClamp(1 - f100 / 6)); else match = fN && iN ? 90 : fN || iN ? 75 : 55;
  const register = Math.round(match), overall = Math.round(0.3 * fluency + 0.3 * accuracy + 0.25 * vocab + 0.15 * register);
  return {words: n, seconds: Math.round(M.seconds), span: Math.round(span), wpm: Math.round(wpm), pauses: pauses.length, longPauses: longP, ppm: +ppm.toFixed(1), fillers, repeats: rep, speechRatio: M.speechRatio,
    clarity, errors, per100: +per100.toFixed(1), mattr: +mattr.toFixed(2), adv, mid, cefr, goodWords, overused, usedRich, usedBasicLinks: basicLinks.filter(w => counts[w]),
    fHits, iHits, contr, fN, iN, f100: +f100.toFixed(1), i100: +i100.toFixed(1), scores: {fluency, accuracy, vocab, register, overall}};
}
function spNotes(A, task) {
  const S = [], Wk = [], T = [], sc = A.scores, ex = A.errors.slice(0, 3).map(e => `“${e.text}” — ${e.msg}`);
  // fluency
  if (A.wpm >= 100) S.push(`You spoke at a good speed: about ${A.wpm} words a minute.`); else if (A.wpm < 70) { Wk.push(`You spoke slowly (about ${A.wpm} words a minute). Natural speech is about 100–150.`); T.push('Practise saying your ideas in short, simple sentences without stopping to translate.'); }
  if (A.ppm <= 4 && A.pauses >= 0) S.push('You hardly stopped. Your speech flowed well.'); if (A.ppm >= 8) { Wk.push(`You paused often (${A.pauses} pauses). Many pauses make speech hard to follow.`); T.push('Use fillers that sound natural, like “well” or “let me think”, instead of silence.'); }
  if (A.longPauses >= 2) Wk.push(`You had ${A.longPauses} long silences of 2 seconds or more.`);
  if (A.fillers + A.repeats >= 4) Wk.push(`You repeated words or used fillers (um, er) ${A.fillers + A.repeats} times.`);
  if (A.seconds < 60) T.push(`You spoke for only ${spTime(A.seconds)}. Try to speak for 2–3 minutes: add reasons and examples.`);
  // accuracy
  if (A.per100 <= 1.5) S.push('You made very few grammar mistakes that the checker could find.'); else if (A.per100 >= 4) Wk.push(`Several grammar mistakes (${A.errors.length}). For example: ${ex.join(' ')}`); else if (A.errors.length) Wk.push(`A few grammar mistakes. For example: ${ex.join(' ')}`);
  if (A.clarity != null && A.clarity >= 70) S.push('The computer understood almost every word you said, so your speech was clear.'); else if (A.clarity != null && A.clarity < 45) { Wk.push('The computer could not understand some words. Speak a little slower and clearer.'); T.push('Practise difficult sounds in the Pronounce section.'); }
  // vocabulary
  if (A.goodWords.length >= 4 || A.adv >= 2) S.push(`You used some strong words: ${A.goodWords.slice(0, 6).join(', ')}.`); else if (sc.vocab < 40) Wk.push('You used mostly very simple words.');
  if (A.mattr < 0.55 && A.words >= 40) Wk.push('You repeated the same words a lot. Try to find different words for the same idea.');
  A.overused.slice(0, 3).forEach(o => { Wk.push(`You said “${o.w}” ${o.n} times. Try: ${o.better}.`); });
  if (A.usedRich.length >= 3) S.push(`You joined your ideas well with linking words (${A.usedRich.slice(0, 4).join(', ')}).`); else if (A.words >= 40) { Wk.push('You mostly joined ideas with “and”, “so” and “then”.'); T.push('Learn 3 new linking words: however, although, because of this.'); }
  // register
  const fl = task.register;
  if (fl === 'formal') { if (sc.register >= 70) S.push('Your language suited this formal task.'); else { Wk.push(A.iN > A.fN ? `This task is formal, but you used a lot of informal language (${A.contr} contractions like “I'm”, “don't”${A.iHits.length ? ', and words like ' + A.iHits.slice(0, 3).map(h => '“' + h.p + '”').join(', ') : ''}).` : 'This task is formal, but you used very few formal phrases.'); T.push('In formal speaking say “I would like to…”, “In my opinion…”, “Furthermore…”, and avoid contractions.'); } }
  else if (fl === 'informal') { if (sc.register >= 70) S.push('You sounded natural and friendly, like a real conversation.'); else { Wk.push(A.fN > A.iN ? 'This task is a chat with a friend, but your language sounded very formal.' : 'Your language was very neutral. Add some natural, friendly expressions.'); T.push('In a chat with friends use contractions (I\'m, don\'t) and phrases like “you know”, “a lot of”, “kind of”.'); } }
  if (!T.length) T.push('Record yourself again on another topic and try to beat this score.');
  return {strengths: S.slice(0, 6), weaknesses: Wk.slice(0, 8), tips: T.slice(0, 4)};
}
function spHighlight(rec) {
  const text = rec.transcript.replace(/\s+/g, ' ').trim(), A = rec.A, toks = spTokens(text), inf1 = new Set(SP_INFORMAL.filter(p => !p.includes(' '))), for1 = new Set(SP_FORMAL.filter(p => !p.includes(' ')));
  let out = '', pos = 0;
  toks.forEach(t => { out += esc(text.slice(pos, t.s)); const er = A.errors.some(e => t.s < e.e && t.e > e.s); let cls = '';
    if (er) cls = 'hl-err'; else if (inf1.has(t.w) || /n't$|'(m|re|ve|ll|d)$/.test(t.w)) cls = 'hl-inf'; else if (for1.has(t.w)) cls = 'hl-for'; else if (spLevel(t.w) === 3 || (spLevel(t.w) === 2 && t.w.length > 5 && SP_MID.has(t.w))) cls = 'hl-adv';
    out += cls ? `<mark class="${cls}">${esc(text.slice(t.s, t.e))}</mark>` : esc(text.slice(t.s, t.e)); pos = t.e; });
  return out + esc(text.slice(pos));
}

/* ---------- recording ---------- */
function spAbort() { const r = SPK.rec; if (!r || r.ended) return; r.ended = true; spCleanup(r); SPK = {mode: 'pick'}; }
function spCleanup(r) {
  clearInterval(r.timer); try { r.sr && (r.sr.onend = null, r.sr.abort()); } catch (e) {}
  try { r.mr && r.mr.state !== 'inactive' && (r.mr.onstop = null, r.mr.stop()); } catch (e) {}
  try { r.stream && r.stream.getTracks().forEach(t => t.stop()); } catch (e) {} try { r.ac && r.ac.close(); } catch (e) {}
}
async function spBegin(task) {
  if (!SR) { toast('Speaking needs Google Chrome or Microsoft Edge'); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}}); } catch (e) { toast('🚫 Microphone blocked — allow the microphone in your browser, then try again.'); return; }
  const r = SPK.rec = {task, stream, chunks: [], base: '', sess: '', interim: '', counted: 0, confSum: 0, confN: 0, ended: false, ref: 0.02, speechT: 0, silentRun: 0, pauses: [], first: null, last: 0, lastTick: 0, t0: performance.now()};
  SPK.mode = 'record'; renderSpeaking();
  try { r.mr = new MediaRecorder(stream); r.mr.ondataavailable = e => e.data.size && r.chunks.push(e.data); r.mr.start(1000); } catch (e) { r.mr = null; }
  try { const AC = window.AudioContext || window.webkitAudioContext; r.ac = new AC(); const src = r.ac.createMediaStreamSource(stream); r.an = r.ac.createAnalyser(); r.an.fftSize = 1024; src.connect(r.an); r.buf = new Float32Array(r.an.fftSize); } catch (e) { r.an = null; }
  const startSR = () => {
    if (r.ended) return; const sr = r.sr = new SR(); sr.lang = LANG; sr.continuous = true; sr.interimResults = true; sr.maxAlternatives = 1; r.sess = ''; r.counted = 0;
    sr.onresult = e => { let fin = '', interim = ''; for (let i = 0; i < e.results.length; i++) { const res = e.results[i]; if (res.isFinal) { fin += ' ' + res[0].transcript.trim(); if (i >= r.counted) { r.confSum += res[0].confidence || 0; r.confN++; r.counted = i + 1; } } else interim += ' ' + res[0].transcript; } r.sess = fin.trim(); r.interim = interim.trim(); spLive(); };
    sr.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { spFail('🚫 The speech recogniser is blocked. Allow the microphone and try again.'); } else if (e.error === 'network') { r.netErr = true; } };
    sr.onend = () => { r.base = (r.base + ' ' + r.sess).trim(); r.sess = ''; if (!r.ended) setTimeout(startSR, 150); };
    try { sr.start(); } catch (e) { setTimeout(startSR, 400); }
  };
  startSR(); r.timer = setInterval(spTick, 100); r.lastTick = performance.now();
}
function spFail(msg) { const r = SPK.rec; if (r && !r.ended) { r.ended = true; spCleanup(r); } SPK = {mode: 'pick'}; renderSpeaking(); toast(msg); }
function spLive() { const r = SPK.rec; if (!r) return; const el = $('#spLive'); if (!el) return; const t = (r.base + ' ' + r.sess + ' ' + r.interim).trim(); el.textContent = t || 'Start speaking… your words will appear here.'; el.scrollTop = el.scrollHeight; }
function spTick() {
  const r = SPK.rec; if (!r || r.ended) return; const now = performance.now(), dt = Math.min(1, (now - r.lastTick) / 1000), el = (now - r.t0) / 1000; r.lastTick = now;
  let rms = 0; if (r.an) { r.an.getFloatTimeDomainData(r.buf); let s = 0; for (let i = 0; i < r.buf.length; i++) s += r.buf[i] * r.buf[i]; rms = Math.sqrt(s / r.buf.length); }
  r.ref = Math.max(0.02, r.ref * 0.9997, rms); const speaking = rms > Math.max(0.012, r.ref * 0.15);
  if (speaking) { if (r.first === null) r.first = el; else if (r.silentRun >= 0.7) r.pauses.push(r.silentRun); r.silentRun = 0; r.speechT += dt; r.last = el; } else if (r.first !== null) r.silentRun += dt;
  const ring = $('#spRing'); if (ring) { ring.style.setProperty('--p', Math.min(100, el / SP_MAX * 100)); ring.style.setProperty('--rc', el >= SP_MAX - 15 ? '#e63946' : el >= SP_MIN ? '#1b9e5a' : '#3a86ff'); $('#spTime').textContent = spTime(el); }
  const mt = $('#spMeter'); if (mt) mt.style.setProperty('--lv', Math.min(1, rms * 9).toFixed(2));
  const stop = $('#spStop'); if (stop) { stop.disabled = el < 5; stop.textContent = el < SP_MIN ? `⏹ Stop (speak at least ${SP_MIN} s)` : '⏹ Stop and get my feedback'; }
  if (el >= SP_MAX) spStop();
}
async function spStop() {
  const r = SPK.rec; if (!r || r.ended) return; r.ended = true; clearInterval(r.timer);
  const seconds = Math.min(SP_MAX, (performance.now() - r.t0) / 1000); SPK.mode = 'busy'; renderSpeaking();
  await new Promise(res => { try { r.sr && (r.sr.onend = null, r.sr.stop()); } catch (e) {} setTimeout(res, 900); });   // let the recogniser finish the last words
  const blob = await new Promise(res => { if (!r.mr || r.mr.state === 'inactive') return res(r.chunks.length ? new Blob(r.chunks, {type: 'audio/webm'}) : null); r.mr.onstop = () => res(new Blob(r.chunks, {type: r.mr.mimeType || 'audio/webm'})); try { r.mr.stop(); } catch (e) { res(null); } });
  const transcript = (r.base + ' ' + r.sess + ' ' + r.interim).replace(/\s+/g, ' ').trim();
  spCleanup(r);
  const span = r.first !== null ? Math.max(5, r.last - r.first) : seconds, M = {seconds, span, pauses: r.pauses, speechRatio: r.first !== null ? spClamp(r.speechT / span, 0, 1) : 0.7, confidence: r.confN ? r.confSum / r.confN : null};
  const A = spAnalyse(transcript, M, r.task);
  if (A.words < 8) { SPK = {mode: 'pick'}; renderSpeaking(); toast(r.netErr ? '🌐 Speech recognition needs an internet connection.' : '🤔 I could hardly hear any words. Check your microphone and try again.'); return; }
  const rec = {id: uid(), date: new Date().toISOString(), task: {id: r.task.id, title: r.task.title, level: r.task.level, register: r.task.register, prompt: r.task.prompt}, transcript, A, notes: spNotes(A, r.task), media: blob ? await storeMedia(blob) : null, ai: null, aiState: spAIOn() ? 'loading' : 'off'};
  spHistory.unshift(rec); spHistory.slice(SP_KEEP).forEach(o => { if (o.media) DB.put('media', o.media, null); }); spHistory = spHistory.slice(0, SP_KEEP); await DB.put('kv', 'speakHistory', spHistory);
  onActivity(); SPK = {mode: 'result', rec}; renderSpeaking(); window.scrollTo(0, 0);
  if (spAIOn()) spAsk(rec);
}
async function spAsk(rec) {
  rec.aiState = 'loading'; spAiBox(rec);
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 75000);
  try {
    const r = await fetch(syncUrl(), {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, signal: ctl.signal, body: JSON.stringify({action: 'speaking', student, task: rec.task, transcript: rec.transcript,
      metrics: {seconds: rec.A.seconds, words: rec.A.words, wordsPerMinute: rec.A.wpm, pauses: rec.A.pauses, longPauses: rec.A.longPauses, fillers: rec.A.fillers, repeats: rec.A.repeats, clarityPercent: rec.A.clarity}})});
    const d = await r.json();
    if (d && d.ok && d.feedback) { rec.ai = d.feedback; rec.aiState = 'done'; } else { rec.aiState = 'error'; rec.aiErr = (d && d.error) || 'unknown'; }
  } catch (e) { rec.aiState = 'error'; rec.aiErr = e.name === 'AbortError' ? 'timeout' : 'offline'; }
  clearTimeout(to); await DB.put('kv', 'speakHistory', spHistory); spAiBox(rec);
}
function spAiBox(rec) { if (SPK.mode === 'result' && SPK.rec === rec && $('#aiBox')) $('#aiBox').innerHTML = spAiHTML(rec); const b = $('#aiRetry'); if (b) b.onclick = () => spAsk(rec); }
const AI_ERR = {'no key': 'Your teacher has not added the AI key yet.', 'not registered': 'Save your name and email on the “My progress” page first.', 'daily limit': 'The AI has reached its limit for today. Try again tomorrow.', 'student limit': 'You have used all your AI feedback for today. Try again tomorrow.', 'too short': 'Speak a little longer (at least 15 words) to get AI feedback.', timeout: 'The AI took too long to answer.', offline: 'Could not reach the class server. Check your internet connection.', busy: 'The AI is busy right now. Try again in a minute.', refusal: 'The AI could not give feedback for this recording.'};
function spAiHTML(rec) {
  if (rec.aiState === 'off') return `<div class="aioff">🤖 <b>AI teacher feedback</b> is not on yet. ${!syncUrl() ? 'Ask your teacher to connect the class server.' : 'Save your name and email on the <a href="#/progress">My progress</a> page to turn it on.'} The automatic analysis above still works.</div>`;
  if (rec.aiState === 'loading') return `<div class="aiload"><span class="spin"></span> <b>The AI teacher is reading your answer…</b> This takes about 20–40 seconds.</div>`;
  if (rec.aiState === 'error') return `<div class="aioff">🤖 AI feedback is not available: ${esc(AI_ERR[rec.aiErr] || 'Something went wrong (' + rec.aiErr + ').')} <button class="btn sm ghost" id="aiRetry">↻ Try again</button></div>`;
  const a = rec.ai, area = (ic, nm, o, extra = '') => o ? `<div class="aia"><div class="aih"><b>${ic} ${nm}</b><span class="chip" style="background:${pcol(+o.score || 0)}">${Math.round(+o.score || 0)}%</span></div><p>${esc(o.comment || '')}</p>${extra}</div>` : '';
  const li = arr => (arr || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `<div class="aibadge">🤖 AI teacher (Claude)${a.cefr ? ` · level: <b>${esc(a.cefr)}</b>` : ''}</div>
    ${a.summary ? `<p class="aisum">${esc(a.summary)}</p>` : ''}
    <div class="aigrid">${area('⚡', 'Fluency', a.fluency)}${area('✅', 'Accuracy', a.accuracy)}${area('📚', 'Vocabulary', a.vocabulary)}${area('🎩', 'Formal English', a.formal)}${area('😊', 'Informal English', a.informal)}</div>
    ${(a.corrections || []).length ? `<h4 class="sph">✏️ Corrections</h4><div class="aicorr">${a.corrections.map(c => `<div><span class="said">${esc(c.said)}</span> → <span class="better">${esc(c.better)}</span><small>${esc(c.why || '')}</small></div>`).join('')}</div>` : ''}
    <div class="spcols"><div><h4 class="sph good">💪 Strengths</h4><ul>${li(a.strengths)}</ul></div><div><h4 class="sph warn">🎯 To improve</h4><ul>${li(a.weaknesses)}</ul></div></div>
    ${(a.tips || []).length ? `<h4 class="sph">💡 Tips</h4><ul>${li(a.tips)}</ul>` : ''}`;
}

/* ---------- pages ---------- */
function renderSpeaking(arg) {
  if (arg && arg.startsWith('view/')) { const rec = spHistory.find(r => r.id === arg.slice(5)); if (rec) { SPK = {mode: 'result', rec}; loadMedia(rec.media).then(() => SPK.rec === rec && renderSpeaking()); } }
  const M = SPK.mode;
  if (M === 'record') return spRecordPage(); if (M === 'busy') return spBusyPage(); if (M === 'result') return spResultPage(SPK.rec); if (M === 'prep') return spPrepPage(SPK.task);
  spPickPage();
}
const spBanner = (t, p) => `<div class="banner photo" style="--img:url(photos/level-b2.jpg)"><div><h1>${t}</h1><p>${p}</p></div></div>`;
function spPickPage() {
  const T = mode === 'teacher', tasks = state.speaking.tasks, levels = [...new Set(tasks.map(t => t.level))];
  app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › Test your speaking</div>
  ${spBanner('Test your speaking', 'Record yourself for up to 3 minutes. The AI checks your strengths and weaknesses.')}
  <div class="panel" style="margin-top:16px"><h3 class="sec-t" style="font-size:24px">What is checked?</h3>
    <div class="spchips"><span>⚡ Fluency</span><span>✅ Accuracy</span><span>📚 Level of vocabulary</span><span>🎩 Formal English</span><span>😊 Informal English</span></div>
    <p class="hint" style="margin:8px 0 0">Choose a topic, press record and speak. You can speak for up to <b>3 minutes</b>. Use Google Chrome or Microsoft Edge and allow the microphone.${SR ? '' : ' <b style="color:var(--coral)">This browser cannot write down your words, so please open the page in Chrome or Edge.</b>'}</p></div>
  ${levels.map(lv => `<h3 class="sph" style="margin:22px 0 8px">Level ${esc(lv)}</h3><div class="sptasks">${tasks.filter(t => t.level === lv).map(t => `
    <div class="sptask"><div class="spth"><b>${esc(t.title)}</b><span class="chip ${t.register}">${REG_LABEL[t.register] || ''}</span></div><p>${esc(t.prompt)}</p><button class="btn sun sm" data-sp="${t.id}">🎤 Choose this topic</button></div>`).join('')}</div>`).join('')}
  ${spHistory.length ? `<h3 class="sph" style="margin:26px 0 8px">My recordings</h3><div class="panel"><div class="tablewrap"><table class="rtable"><thead><tr><th>Date</th><th>Topic</th><th>Time</th><th>Score</th><th></th></tr></thead><tbody>${spHistory.map(r => `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td>${esc(r.task.title)}</td><td>${spTime(r.A.seconds)}</td><td><b style="color:${pcol(r.A.scores.overall)}">${r.A.scores.overall}%</b></td><td><a class="btn sm ghost" href="#/speaking/view/${r.id}">View</a></td></tr>`).join('')}</tbody></table></div></div>` : ''}
  ${T ? spTeacherHTML() : ''}`;
  app.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { SPK = {mode: 'prep', task: spTask(b.dataset.sp)}; renderSpeaking(); window.scrollTo(0, 0); });
  if (T) bindSpTeacher();
}
function spPrepPage(task) {
  app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/speaking">Test your speaking</a> › ${esc(task.title)}</div>
  <div class="panel sprep"><div class="spth"><span class="chip ${task.register}">${REG_LABEL[task.register] || ''} style</span><span class="chip grey">Level ${esc(task.level)}</span></div>
    <h2 class="baloo" style="margin:10px 0 6px;font-size:32px;color:var(--navy)">${esc(task.title)}</h2>
    <p class="spprompt">${esc(task.prompt)}</p>
    <h4 class="sph">💡 You can talk about</h4><ul>${(task.ideas || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    <div class="note">${task.register === 'formal' ? '🎩 This is a <b>formal</b> situation: speak politely, use “I would like to…”, and avoid short forms like “I\'m” or “don\'t”.' : task.register === 'informal' ? '😊 This is an <b>informal</b> situation: speak naturally, like to a friend. Short forms like “I\'m” and “don\'t” are good.' : 'Use the style you think is best.'}</div>
    <p class="hint" style="margin:12px 0 0">Take a moment to think. When you press the button, the recording starts at once and lasts up to <b>3 minutes</b>. Speak for at least <b>1 minute</b> for a reliable result.</p>
    <div class="row" style="margin-top:16px"><button class="btn red" id="spGo">🎙 Start recording</button><button class="btn ghost" id="spBack">← Choose another topic</button></div>
    <p class="lbl" id="spAiNote" style="margin-top:12px">${spAIOn() ? '🤖 AI teacher feedback is on for you.' : '🤖 AI teacher feedback is off. You will still get the automatic analysis.'}</p></div>`;
  $('#spGo').onclick = () => spBegin(task); $('#spBack').onclick = () => { SPK = {mode: 'pick'}; renderSpeaking(); };
}
function spRecordPage() {
  const r = SPK.rec, t = r.task;
  app.innerHTML = `<div class="crumbs">Test your speaking › ${esc(t.title)}</div>
  <div class="panel sprec"><div class="row" style="justify-content:space-between"><b class="baloo" style="font-size:22px;color:var(--navy)">🔴 Recording… ${esc(t.title)}</b><span class="chip ${t.register}">${REG_LABEL[t.register] || ''}</span></div>
    <p class="spprompt" style="margin:8px 0">${esc(t.prompt)}</p>
    <div class="sprow"><div class="ring" id="spRing" style="--p:0;--rc:#3a86ff;width:150px;height:150px"><span id="spTime" style="width:116px;height:116px;font-size:28px">0:00</span></div>
      <div class="grow"><div class="spmeter" id="spMeter"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="lbl" style="margin:6px 0">Speak clearly. The bars move when I can hear you. Maximum time: 3:00.</div>
      <button class="btn red" id="spStop" disabled>⏹ Stop (speak at least ${SP_MIN} s)</button></div></div>
    <h4 class="sph">What the computer hears</h4><div class="splive" id="spLive">Start speaking… your words will appear here.</div></div>`;
  $('#spStop').onclick = spStop;
}
function spBusyPage() { app.innerHTML = `<div class="panel" style="text-align:center;padding:50px 20px"><div class="spin big"></div><h3 class="sec-t" style="margin-top:16px">Analysing your speaking…</h3><p class="hint">This takes a few seconds.</p></div>`; }
function spResultPage(rec) {
  const A = rec.A, sc = A.scores, col = pcol(sc.overall), n = rec.notes, task = rec.task, audio = rec.media && urlCache[rec.media];
  const bar = (lbl, p, sub) => `<div>${scaleHTML(p, lbl)}${sub ? `<div class="lbl" style="margin:-2px 0 10px">${sub}</div>` : ''}</div>`;
  const li = arr => arr.map(x => `<li>${esc(x)}</li>`).join('');
  const hits = (arr, k) => arr.slice(0, 5).map(h => `<span class="hit">${esc(h.p)}${h.n > 1 ? ' ×' + h.n : ''}</span>`).join('') + (k ? `<span class="hit">${k} short forms (I'm, don't…)</span>` : '');
  const fBar = Math.round(100 * spClamp(A.f100 / 4)), iBar = Math.round(100 * spClamp(A.i100 / 8));
  const regTxt = task.register === 'formal' ? (sc.register >= 70 ? '✅ Good for a formal task.' : '⚠️ This was a formal task: use more formal phrases and fewer short forms.') : task.register === 'informal' ? (sc.register >= 70 ? '✅ Good for a chat with a friend.' : '⚠️ This was a chat with a friend: sound more natural and relaxed.') : 'Both styles are fine for this task.';
  app.innerHTML = `<div class="crumbs no-print"><a href="#/">Home</a> › <a href="#/speaking">Test your speaking</a> › Result</div>
  <div class="panel res-card">
    <div class="stud"><div><div class="lbl">SPEAKING TEST</div><b style="font-size:22px">${esc(task.title)}</b><div class="hint" style="margin:2px 0 0">Level ${esc(task.level)} · ${REG_LABEL[task.register]} style · ${spTime(A.seconds)} · ${A.words} words</div></div><div class="hint" style="margin:0;text-align:right">${new Date(rec.date).toLocaleString()}</div></div>
    <div class="res-top"><div class="ring" style="--p:${sc.overall};--rc:${col};width:150px;height:150px"><span style="width:114px;height:114px;font-size:34px">${sc.overall}%</span></div>
      <div><div class="hint" style="margin:0">Overall speaking score</div><h1 class="baloo" style="margin:0;font-size:38px;color:${col}">${sc.overall >= 90 ? 'Excellent!' : sc.overall >= 60 ? 'Good job!' : 'Keep practising'}</h1>
      <p style="margin:4px 0 0;font-weight:700">Vocabulary level (estimate): <b>${A.cefr}</b></p>${A.seconds < 45 ? `<p class="hint" style="margin:4px 0 0">⚠️ You spoke for only ${spTime(A.seconds)}. Speak for 1–3 minutes for a more reliable result.</p>` : ''}</div></div>
    ${audio ? `<div style="margin-top:14px"><div class="lbl">🎧 Listen to your recording</div><audio controls src="${audio}" style="width:100%"></audio></div>` : ''}
    <h3 class="sph" style="margin-top:22px">Your skills</h3>
    <div class="spgauges">
      ${bar('⚡ Fluency', sc.fluency, `${A.wpm} words/min · ${A.pauses} pauses${A.longPauses ? ' (' + A.longPauses + ' long)' : ''} · ${A.fillers + A.repeats} fillers/repeats`)}
      ${bar('✅ Accuracy', sc.accuracy, `${A.errors.length} grammar pattern${A.errors.length === 1 ? '' : 's'} to check${A.clarity != null ? ' · clarity ' + A.clarity + '%' : ''}`)}
      ${bar('📚 Vocabulary', sc.vocab, `${A.mid + A.adv} higher-level words · variety ${Math.round(A.mattr * 100)}%`)}
      ${bar('🎯 Style for this task', sc.register, regTxt)}</div>
    <h3 class="sph">🎩 Formal and 😊 informal English</h3>
    <div class="spreg"><div><div class="psh"><span>🎩 Formal language</span><b style="color:#4361ee">${A.fN}</b></div><div class="regbar"><i style="width:${fBar}%;background:#4361ee"></i></div><div class="hits">${A.fHits.length ? hits(A.fHits) : '<span class="lbl">None heard</span>'}</div></div>
      <div><div class="psh"><span>😊 Informal language</span><b style="color:#fb8500">${A.iN}</b></div><div class="regbar"><i style="width:${iBar}%;background:#fb8500"></i></div><div class="hits">${A.iHits.length || A.contr ? hits(A.iHits, A.contr) : '<span class="lbl">None heard</span>'}</div></div></div>
    <div class="spcols"><div><h3 class="sph good">💪 Your strengths</h3><ul>${n.strengths.length ? li(n.strengths) : '<li>Keep practising. Every recording makes you better!</li>'}</ul></div><div><h3 class="sph warn">🎯 What to improve</h3><ul>${n.weaknesses.length ? li(n.weaknesses) : '<li>No big problems found. Great!</li>'}</ul></div></div>
    <h3 class="sph">💡 Next steps</h3><ul>${li(n.tips)}</ul>
    <div id="aiBox" class="aibox">${spAiHTML(rec)}</div>
    <h3 class="sph" style="margin-top:22px">📝 What you said</h3><div class="sptrans">${spHighlight(rec)}</div>
    <div class="splegend"><mark class="hl-err">grammar to check</mark><mark class="hl-adv">strong word</mark><mark class="hl-for">formal</mark><mark class="hl-inf">informal</mark></div>
    <details class="setup"><summary>ℹ️ How are the scores calculated?</summary><p class="hint">The browser writes down your words and measures your voice. <b>Fluency</b> = speed, pauses, fillers and repeated words. <b>Accuracy</b> = common grammar mistake patterns (it cannot find every mistake) and how clearly the computer understood you. <b>Vocabulary</b> = variety of words and how many higher-level words you used. <b>Style</b> = whether your formal or informal phrases match the task. These are estimates to help you practise — your teacher's opinion is more important.</p></details>
    <div class="row no-print" style="justify-content:center;margin-top:20px"><button class="btn sun" id="spAgain">🎙 Try this topic again</button><a class="btn ghost" href="#/speaking">Choose another topic</a><button class="btn ghost" id="spPrint">🖨 Print / save as PDF</button></div></div>`;
  $('#spAgain').onclick = () => { SPK = {mode: 'prep', task: spTask(rec.task.id) || rec.task}; renderSpeaking(); window.scrollTo(0, 0); };
  $('#spPrint').onclick = () => window.print(); const b = $('#aiRetry'); if (b) b.onclick = () => spAsk(rec);
}
/* ---------- teacher: topics ---------- */
function spTeacherHTML() {
  const T = state.speaking.tasks;
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Speaking topics</h4>
    <p class="lbl" style="margin:0 0 10px">Write your own topics. “Style” tells the AI whether the student should speak formally (interview, presentation) or informally (chatting to a friend). Changes are saved automatically.</p>
    ${T.map((t, i) => `<div class="erow" style="align-items:flex-start"><div class="grow" style="display:grid;gap:6px">
      <div class="row" style="gap:6px"><input class="in grow" data-tf="title" data-ti="${i}" value="${esc(t.title)}" placeholder="Topic title">
        <select class="in" data-tf="level" data-ti="${i}">${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => `<option ${t.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <select class="in" data-tf="register" data-ti="${i}">${[['informal', '😊 Informal'], ['formal', '🎩 Formal'], ['any', 'Any style']].map(([v, l]) => `<option value="${v}" ${t.register === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <textarea class="in" rows="2" data-tf="prompt" data-ti="${i}" placeholder="What the student must talk about">${esc(t.prompt)}</textarea>
      <input class="in" data-tf="ideas" data-ti="${i}" value="${esc((t.ideas || []).join(' | '))}" placeholder="Ideas, separated by |"></div>
      <button class="btn sm ghost" data-tdel="${i}">🗑</button></div>`).join('')}
    <div class="row"><button class="btn sm" id="tAdd">➕ Add a topic</button><button class="btn sm ghost" id="tReset">↺ Restore the original topics</button></div></div>`;
}
function bindSpTeacher() {
  app.querySelectorAll('[data-tf]').forEach(el => el.onchange = async () => { const t = state.speaking.tasks[+el.dataset.ti], f = el.dataset.tf; t[f] = f === 'ideas' ? el.value.split('|').map(s => s.trim()).filter(Boolean) : el.value.trim(); await save(); });
  app.querySelectorAll('[data-tdel]').forEach(b => b.onclick = async () => { if (!confirm('Delete this topic?')) return; state.speaking.tasks.splice(+b.dataset.tdel, 1); await save(); spPickPage(); });
  $('#tAdd').onclick = async () => { state.speaking.tasks.push({id: uid(), level: 'B1', register: 'informal', title: 'New topic', prompt: 'Write what the student must talk about.', ideas: []}); await save(); spPickPage(); };
  $('#tReset').onclick = async () => { if (!confirm('Replace all topics with the original ones?')) return; state.speaking.tasks = SP_TASKS_DEFAULT(); await save(); spPickPage(); };
}

