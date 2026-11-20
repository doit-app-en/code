/* ================= LISTEN AND BUILD ================= */
// A short round (route #/build, up to BS_ROUND phrases) made from the phrases of the lessons the student has finished (lessonsDone):
// he hears a phrase — no text on the screen — and taps its words into order from a row of word buttons that also holds BS_EXTRA
// words that do not belong. "Check" compares word by word (right / different / missing; capitals and punctuation do not matter)
// and he may fix the sentence and check again; "Show the answer" counts the phrase as not known.
// A phrase that was wrong on its first check, or shown, goes to "Practise my mistakes" as a phrase to say (noteMistake('s', …), the
// kind that already exists) when it is one of the lesson's Speak phrases. Nothing new is saved on the device and nothing is sent to
// the teacher; a finished round counts as a practice day (onActivity()). Offered from the home page and My progress (bsLinkHTML()).
// The round starts with a "Start" button on purpose: the browser's voice may only speak after a tap, and a voice that is refused
// would be taken for a broken one by say() (02-speech.js).
let BS = null;
const BS_ROUND = 10, BS_MIN = 3, BS_EXTRA = 2, BS_MAXW = 10, BS_TAP = 400;
const BS_SPARE = ['very', 'not', 'and', 'but', 'they', 'because'];   // extra words when the finished lessons have too few other words
const bsHere = () => (location.hash || '').split('/')[1] === 'build';
const bsCan = () => 'speechSynthesis' in window;   // the round is only heard: no voice, no round
// The words of a phrase (tokens with a letter or a digit); `first` = the word starts a sentence, also one inside the phrase ("… pizza? Yes, I do.").
function bsWords(text) {
  const out = []; let first = true;
  tokens(String(text || '')).forEach(t => { if (t.n) out.push({o: t.o, n: t.n, first}); first = /[.!?]["'’”)]*$/.test(t.o) || (first && !t.n); });
  return out;
}
const bsTexts = s => [...(s.speaking || []), ...(s.phrases || [])];
// The phrases that can be asked: from finished lessons, three to BS_MAXW words, one of each. `item` is the lesson's Speak phrase
// with the same words (what "Practise my mistakes" can ask again), or null when the phrase is only in Listen & See.
function bsPool() {
  const items = [], seen = new Set(); let lessons = 0;
  LEVELS.forEach(l => state.levels[l.id].lessons.forEach(s => {
    if (!lessonsDone[s.id]) return; let any = false;
    bsTexts(s).forEach(p => {
      const text = String((p && p.text) || '').trim(), n = norm(text), w = bsWords(text);
      if (w.length < 3 || w.length > BS_MAXW || seen.has(n)) return; seen.add(n);
      items.push({level: l, lesson: s, text, item: (s.speaking || []).find(q => q.id && norm(q.text || '') === n) || null}); any = true;
    });
    if (any) lessons++;
  }));
  return {items, lessons, ready: items.length >= BS_MIN};
}
// The link on the home page and on My progress ('' until a finished lesson gives enough phrases).
function bsLinkHTML() {
  if (mode === 'teacher' || !bsCan() || !bsPool().ready) return '';
  return `<a class="mistk bsk" id="bsGo" href="#/build"><i>👂</i><span><b>Listen and build</b><small>Hear a phrase from your lessons and put its words in order.</small></span><em>Start →</em></a>`;
}
// Words written with a capital in the middle of a sentence somewhere in the course (names, days, "I"), and the days and months
// whatever the course says: they keep it on a button.
const BS_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'english', 'arabic'];
function bsCaps() {
  const caps = new Set(BS_NAMES);
  LEVELS.forEach(l => state.levels[l.id].lessons.forEach(s => bsTexts(s).forEach(p => {
    bsWords((p && p.text) || '').forEach(t => { if (!t.first && /^[^A-Za-z]*[A-Z]/.test(t.o)) caps.add(t.n); });
  })));
  return caps;
}
// A word as a button shows it: no punctuation around it, and no capital that only marks the start of a sentence (it would give the first word away).
function bsShow(o, first, caps) {
  let w = o.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '') || o;
  if (first && /^[A-Z][a-z'’-]*$/.test(w) && !/^I($|')/.test(w) && !caps.has(norm(w).replace(/ /g, ''))) w = w[0].toLowerCase() + w.slice(1);
  return w;
}
// Word by word: the student's words against the phrase. → [{t:'ok'|'no', i: place in his sentence} | {t:'gap'}] in reading order
// ('ok' = in the right order, 'no' = a different word or one in the wrong place, 'gap' = a word is missing here). A gap is only
// drawn for a word that is not in his sentence at all (counted per word: `lack`): a word he did use, in the wrong place, is already
// marked 'no' there — a "?" for it as well said "a word is missing" to a student who had used every word.
function bsDiff(got, want) {
  const lack = {}; want.forEach(w => { lack[w] = (lack[w] || 0) + 1; }); got.forEach(w => { if (lack[w]) lack[w]--; });
  const m = got.length, k = want.length, L = Array.from({length: m + 1}, () => new Array(k + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = k - 1; j >= 0; j--) L[i][j] = got[i] === want[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0, bad = [], miss = 0;
  const skip = () => { const w = want[j++]; if (lack[w]) { lack[w]--; miss++; } };
  const flush = () => { bad.forEach(x => out.push({t: 'no', i: x})); for (let x = bad.length; x < miss; x++) out.push({t: 'gap'}); bad = []; miss = 0; };
  while (i < m && j < k) {
    if (got[i] === want[j]) { flush(); out.push({t: 'ok', i}); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) bad.push(i++); else skip();
  }
  while (i < m) bad.push(i++); while (j < k) skip(); flush();
  return out;
}
function renderBuild() {
  stopAll();
  BS = {pool: bsPool(), q: [], i: 0, phase: 'intro', shown: Date.now()};
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Listen and build</div>
  <div class="banner photo slim mkban" style="--ac:#1787b8;--img:url(photos/lessons.jpg)"><div><span class="lv" style="background:#1787b8">👂 Short round</span><h1>Listen and build</h1></div></div>
  <div class="panel" id="bsBody"></div>`;
  $('#bsBody').onclick = onBuildClick;
  bsDraw();
}
// A new round: up to BS_ROUND phrases in a random order, each with its word buttons (its own words and BS_EXTRA others, mixed).
function bsStart() {
  const P = BS.pool = bsPool(), caps = bsCaps();
  const words = x => bsWords(x.text).map(t => ({w: bsShow(t.o, t.first, caps), n: t.n}));
  BS.q = shuffle(P.items).slice(0, BS_ROUND).map(x => {
    const want = words(x), has = new Set(want.map(w => w.n)), extra = [];
    shuffle(P.items.filter(y => y !== x).flatMap(words)).concat(shuffle(BS_SPARE).map(w => ({w, n: w})))
      .forEach(c => { if (extra.length < BS_EXTRA && !has.has(c.n)) { has.add(c.n); extra.push(c); } });
    let bank = shuffle([...want, ...extra]);
    for (let n = 0; n < 6 && bank.slice(0, want.length).every((b, i) => b.n === want[i].n); n++) bank = shuffle(bank);   // never already in order
    return {level: x.level, lesson: x.lesson, text: x.text, item: x.item, want, bank, ans: [], marks: null, tries: 0, res: '', over: false, noted: false};
  });
  BS.i = 0; BS.phase = 'play'; bsShowQ();
}
function bsShowQ() { stopAll(); BS.shown = Date.now(); bsDraw(); window.scrollTo(0, 0); if (BS.phase === 'play') say(BS.q[BS.i].text); }
// Drawing replaces every button, so the keyboard's place (focus) is put back: the same button when it is still there, otherwise the
// one a student would press next — or Tab would start again from the top of the page after every word.
function bsDraw() {
  const el = $('#bsBody'); if (!el || !BS) return;
  const f = el.contains(document.activeElement) ? document.activeElement : null, fid = f && f.id, fa = f && f.dataset.a, fb = f && f.dataset.b;
  bsPaint(el);
  if (!f) return;
  const q = s => el.querySelector(s), line = el.querySelectorAll('#bsLine .bsw');
  const to = (fid && q('#' + fid))
    || (fb !== undefined && ([...el.querySelectorAll('#bsBank .bsw:not(.used)')].find(b => +b.dataset.b > +fb) || q('#bsBank .bsw:not(.used)') || q('#bsCheck')))
    || (fa !== undefined && (line[Math.min(+fa, line.length - 1)] || q('#bsBank .bsw:not(.used)')))
    || q('#bsNext') || q('#bsHear') || q('#bsAgain') || q('#bsStart');
  if (to) try { to.focus({preventScroll: true}); } catch (e) {}
}
function bsPaint(el) {
  const P = BS.pool;
  if (!bsCan() || !P.ready) {
    el.innerHTML = bsCan() ? `<div class="statebox" id="bsLocked"><div class="e">🔒</div><b>Finish a lesson to open this game</b>
      <p>Listen and build uses the phrases from the lessons you have finished${P.lessons ? ' — finish one more lesson to have enough phrases' : ''}.</p>
      <a class="btn sun" href="#/">Go to my lessons →</a></div>`
      : `<div class="statebox" id="bsLocked"><div class="e">🔇</div><b>This browser cannot read the phrases aloud</b>
      <p>Listen and build needs the computer's voice. Please open the site in Chrome or Edge.</p><a class="btn sun" href="#/">🏠 Home</a></div>`;
    return;
  }
  if (BS.phase === 'intro') {
    el.innerHTML = `<div class="statebox bsintro" id="bsIntro"><div class="e">👂</div><b>Listen and build the sentence</b>
      <p>You hear a phrase from the lessons you have finished — you do not see it. Tap the words in the right order.</p>
      <p><b class="bstip">Careful: ${BS_EXTRA} words do not belong!</b></p>
      <button class="btn sun" data-act="start" id="bsStart">▶ Start</button></div>`;
    return;
  }
  if (BS.phase === 'end') {
    const n = BS.q.length, right = BS.q.filter(x => x.res === 'ok').length, fixed = BS.q.filter(x => x.res === 'fixed').length, noted = BS.q.some(x => x.noted);
    el.innerHTML = `<div class="win bsend" id="bsEnd"><div class="stars">${right === n ? '⭐⭐⭐' : right * 2 >= n ? '⭐⭐' : '⭐'}</div>
      <h3>Round finished!</h3>
      <p class="mksum"><b>${right} of ${n}</b> right the first time</p>
      <p class="hint" style="margin:0 0 14px">${right === n ? 'Every sentence was right. Great listening!' : (fixed ? `You fixed <b>${fixed}</b> more after checking. ` : '') + 'Play again — the phrases come in a new order.'}</p>
      <div class="row" style="justify-content:center"><button class="btn sun" data-act="again" id="bsAgain">↻ Play again</button><a class="btn ghost" href="#/">🏠 Home</a></div></div>
      ${noted ? mistLinkHTML() : ''}`;
    return;
  }
  const x = BS.q[BS.i], n = BS.q.length, last = BS.i === n - 1;
  const word = (b, attr, cls) => `<button type="button" class="bsw${cls || ''}" ${attr}>${esc(b.w)}</button>`;
  let line;
  if (x.over) line = `<button type="button" class="bsfull" data-act="hear" id="bsFull" title="Listen again">🔊 ${esc(x.text)}</button>`;
  else if (x.marks) line = x.marks.map(d => d.t === 'gap' ? '<span class="bsgap" role="img" aria-label="A word is missing here" title="A word is missing here">?</span>' : word(x.bank[x.ans[d.i]], `data-a="${d.i}" title="${d.t === 'ok' ? 'Right' : 'Different, or in the wrong place'}"`, ' ' + d.t)).join('');
  else line = x.ans.length ? x.ans.map((b, i) => word(x.bank[b], `data-a="${i}"`)).join('') : '<span class="ph">Tap the words in the right order</span>';
  el.innerHTML = `<div class="mkhead"><span class="prog">Phrase ${BS.i + 1} of ${n}</span><span class="mkfrom">${x.level.icon} ${esc(x.lesson.title)}</span></div>
    <div class="mkbar bsbar" role="img" aria-label="Phrase ${BS.i + 1} of ${n}"><i style="width:${Math.round(BS.i / n * 100)}%"></i></div>
    <div class="bsq" id="bsQ">
      <h3 class="mkt">${x.over ? 'The sentence' : 'Listen, then build the sentence'}</h3>
      <div class="row bshear"><button class="btn teal" data-act="hear" id="bsHear">🔊 Listen</button><button class="btn ghost" data-act="slow" id="bsSlow">🐢 Slowly</button></div>
      <div class="bsline${x.over ? ' done' : ''}" id="bsLine">${line}</div>
      ${x.over ? '' : `<div class="bsbank" id="bsBank">${x.bank.map((b, i) => word(b, `data-b="${i}"${x.ans.includes(i) ? ' disabled aria-hidden="true"' : ''}`, x.ans.includes(i) ? ' used' : '')).join('')}</div>`}
      <div class="mkfb" id="bsFb" aria-live="polite">${x.fb || ''}</div>
    </div>
    <div class="mknav bsnav">${x.over ? `<button class="btn sun" data-act="next" id="bsNext">${last ? 'See my result →' : 'Next →'}</button>`
      : `<button class="btn" data-act="check" id="bsCheck"${x.ans.length ? '' : ' disabled'}>✓ Check</button><button class="btn ghost" data-act="show" id="bsShowA">Show the answer</button>`}</div>`;
}
// The phrase goes to "Practise my mistakes" once (when it is one of the lesson's Speak phrases).
function bsNote(x) { if (x.noted || !x.item || mode === 'teacher') return; x.noted = true; noteMistake('s', x.lesson, x.item); }
function bsCheck(x) {
  if (!x.ans.length) return;
  const got = x.ans.map(b => x.bank[b].n), want = x.want.map(w => w.n);
  x.tries++;
  if (got.join(' ') === want.join(' ')) {
    x.res = x.tries === 1 ? 'ok' : 'fixed'; x.over = true; x.at = Date.now(); x.marks = null;
    x.fb = `<b class="g">${x.tries === 1 ? '✅ Correct!' : '✅ Correct now — well done for fixing it.'}</b>`;
    bsDraw(); say(x.text); return;
  }
  bsNote(x);
  x.marks = bsDiff(got, want);
  const bad = x.marks.filter(d => d.t === 'no').length, gap = x.marks.filter(d => d.t === 'gap').length, s = n => n === 1 ? '' : 's';
  x.fb = `<b class="r">Not yet.</b> ${[bad ? `<span class="bsk-no">${bad} word${s(bad)}</span> ${bad === 1 ? 'is' : 'are'} different or in the wrong place` : '', gap ? `${gap} word${s(gap)} ${gap === 1 ? 'is' : 'are'} missing (<b>?</b>)` : ''].filter(Boolean).join(', and ')}. Tap a word to take it out, listen again and fix it.`;
  bsDraw();
}
// When a sentence is right (or shown) the word buttons go away and the page gets shorter: the second tap of a double tap on "Check"
// then lands on whatever moved up under the finger — on a phone that was the footer's link to another website. For BS_TAP after the
// page changes, a tap outside the round's own box does nothing.
document.addEventListener('click', e => {
  if (!BS || !bsHere() || !e.target.closest || e.target.closest('#bsBody')) return;
  const x = BS.phase === 'play' ? BS.q[BS.i] : null;
  if (Date.now() - Math.max(BS.shown, (x && x.at) || 0) < BS_TAP) { e.preventDefault(); e.stopPropagation(); }
}, true);
function onBuildClick(e) {
  const t = e.target, x = BS && BS.phase === 'play' ? BS.q[BS.i] : null;
  if (BS && BS.phase === 'end' && Date.now() - BS.shown < BS_TAP && t.closest('a')) return e.preventDefault();   // the second tap of a double tap on "See my result" landing on "Home"
  const b = t.closest('button'); if (!b || !BS || b.disabled) return;
  if (x && !x.over && (b.dataset.b !== undefined || b.dataset.a !== undefined)) {   // a word goes into the sentence, or comes out of it
    if (Date.now() - BS.shown < BS_TAP) return;   // the second tap of a double tap on "Start", "Next" or "Play again" landing on a word
    if (b.dataset.b !== undefined) { if (!x.ans.includes(+b.dataset.b)) x.ans.push(+b.dataset.b); } else x.ans.splice(+b.dataset.a, 1);
    x.marks = null; x.fb = ''; bsDraw(); return;
  }
  const act = b.dataset.act, soon = Date.now() - BS.shown < BS_TAP;
  if (act === 'start' || act === 'again') { if (act === 'again' && soon) return; if (bsPool().ready) bsStart(); return; }
  if (!x) return;
  switch (act) {
    case 'hear': say(x.text); break;
    case 'slow': say(x.text, null, 0.6); break;
    case 'check': bsCheck(x); break;
    case 'show':
      if (soon) return;   // the second tap of a double tap on "Next" must not give the next answer away
      bsNote(x); x.res = 'shown'; x.over = true; x.at = Date.now(); x.marks = null; x.fb = 'This is the sentence. Listen to it once more — you will meet it again.';
      bsDraw(); say(x.text); break;
    case 'next':
      if (Date.now() - x.at < BS_TAP) return;   // "Next" takes the keyboard's place when a sentence is right: a second Enter on "Check" must not skip what it says
      if (BS.i < BS.q.length - 1) { BS.i++; bsShowQ(); }
      else { BS.phase = 'end'; bsShowQ(); onActivity(); }   // a finished round is a practice activity (streak, weekly goal)
      break;
  }
}
