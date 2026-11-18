/* ================= PRACTISE MY MISTAKES ================= */
// The site remembers, on this device only (IndexedDB key 'mistakes'), what a student got wrong in a lesson:
//   'm' — a picture–word pair matched wrongly in the Match game (noteMistake() in tryMatch),
//   's' — a phrase not said clearly in Speak, a score under MIST_PASS (noteMistake() in showResult).
// Route #/mistakes is a round of up to MIST_ROUND of them. An item leaves the list after MIST_OK correct answers in rounds
// (a wrong answer does not take a correct one away). Nothing is sent to the teacher.
// mistakes = { 'm:<lesson id>:<pair id>': {ok: correct answers so far, n: times wrong, t: last time wrong}, … }
// Only the ids are kept: the word and picture are read from the lesson, so an item whose lesson was deleted is simply not offered.
let mistakes = {}, MK = null;
const MIST_MAX = 60, MIST_ROUND = 10, MIST_OK = 2, MIST_PASS = 80;
const mistSave = () => DB.put('kv', 'mistakes', mistakes);
function noteMistake(kind, lesson, item) {
  if (mode === 'teacher' || !lesson || !item || !item.id || !String((kind === 'm' ? item.word : item.text) || '').trim()) return;
  const k = kind + ':' + lesson.id + ':' + item.id, r = mistakes[k] || (mistakes[k] = {ok: 0, n: 0});
  r.n++; r.t = Date.now();
  const keys = Object.keys(mistakes);   // keep the newest MIST_MAX
  if (keys.length > MIST_MAX) keys.sort((a, b) => (mistakes[a].t || 0) - (mistakes[b].t || 0)).slice(0, keys.length - MIST_MAX).forEach(x => delete mistakes[x]);
  mistSave();
}
// The mistakes that can be practised now: the lesson and the item are still there (speaking ones need speech recognition).
function mistList() {
  const out = [], where = {};
  LEVELS.forEach(l => state.levels[l.id].lessons.forEach(s => { where[s.id] = {level: l, lesson: s}; }));
  for (const key in mistakes) {
    const p = key.split(':'), w = where[p[1]]; if (!w) continue;
    const item = (p[0] === 'm' ? w.lesson.matching : p[0] === 's' ? w.lesson.speaking : []).find(x => x.id === p[2]);
    if (!item || (p[0] === 's' && !SR) || !String((p[0] === 'm' ? item.word : item.text) || '').trim()) continue;
    out.push({key, kind: p[0], level: w.level, lesson: w.lesson, item});
  }
  return out;
}
// The link on the home page and on My progress ('' when there is nothing to practise).
function mistLinkHTML() {
  const n = mode === 'teacher' ? 0 : mistList().length; if (!n) return '';
  return `<a class="mistk" id="mistGo" href="#/mistakes"><i>🔁</i><span><b>Practise my mistakes (${n})</b><small>A short round with the words and phrases you got wrong.</small></span><em>Start →</em></a>`;
}
// Three other words for a picture: first from the same lesson (the ones the student mixed up), then the same level, then anywhere.
function mistOpts(q) {
  const seen = new Set([norm(q.item.word)]), pick = [];
  const take = lessons => { const pool = []; lessons.forEach(s => s.matching.forEach(p => { const n = norm(p.word); if (n && !seen.has(n)) { seen.add(n); pool.push(p.word); } })); shuffle(pool).forEach(w => { if (pick.length < 3) pick.push(w); }); };
  take([q.lesson]); if (pick.length < 3) take(state.levels[q.level.id].lessons); if (pick.length < 3) take(LEVELS.flatMap(l => state.levels[l.id].lessons));
  return shuffle([q.item.word, ...pick]);
}
async function renderMistakes() {
  const q = shuffle(mistList()).slice(0, MIST_ROUND);
  q.forEach(x => { if (x.kind === 'm') x.opts = mistOpts(x); });
  await Promise.all(q.map(x => x.kind === 'm' && x.item.img && x.item.img.m).filter(Boolean).map(loadMedia));
  MK = {q, i: 0, learned: 0, end: false};
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Practise my mistakes</div>
  <div class="banner photo slim mkban" style="--ac:var(--purple);--img:url(photos/lessons.jpg)"><div><span class="lv" style="background:var(--purple)">🔁 Short round</span><h1>Practise my mistakes</h1></div></div>
  <div class="panel" id="mkBody"></div>`;
  $('#mkBody').onclick = onMistClick;
  drawMist();
}
function drawMist() {
  stopAll();
  const el = $('#mkBody'); if (!el || !MK) return;
  if (!MK.q.length) {
    el.innerHTML = `<div class="statebox" id="mkEmpty"><div class="e">🎉</div><b>No mistakes to practise</b>
      <p>When you match a picture with the wrong word in a lesson, or a phrase is not clear in Speak, it comes here so you can practise it again.</p>
      <a class="btn sun" href="#/">Go to my lessons →</a></div>`;
    return;
  }
  if (MK.end) {
    const right = MK.q.filter(x => x.res === 'ok').length, left = mistList().length;
    el.innerHTML = `<div class="win mkend" id="mkEnd"><div class="stars">${right === MK.q.length ? '⭐⭐⭐' : right * 2 >= MK.q.length ? '⭐⭐' : '⭐'}</div>
      <h3>Round finished!</h3>
      <p class="mksum"><b>${right} of ${MK.q.length}</b> correct</p>
      <p class="hint" style="margin:0 0 14px">${MK.learned ? `<b>${MK.learned}</b> learned — ${MK.learned === 1 ? 'it has' : 'they have'} left your list. ` : ''}${left ? `<b>${left}</b> still on your list. Each one leaves after ${MIST_OK} correct answers.` : 'Your list is empty. Great work!'}</p>
      <div class="row" style="justify-content:center">${left ? '<button class="btn sun" data-act="again">↻ Practise again</button>' : ''}<a class="btn ghost" href="#/">🏠 Home</a></div></div>`;
    return;
  }
  const x = MK.q[MK.i], n = MK.q.length, last = MK.i === n - 1;
  const head = `<div class="mkhead"><span class="prog">Question ${MK.i + 1} of ${n}</span><span class="mkfrom">${x.level.icon} ${esc(x.lesson.title)}</span></div>
    <div class="mkbar" role="img" aria-label="Question ${MK.i + 1} of ${n}"><i style="width:${Math.round(MK.i / n * 100)}%"></i></div>`;
  const next = label => `<div class="mknav"><button class="btn" data-act="next" id="mkNext" style="background:var(--purple)">${label || (last ? 'See my result →' : 'Next →')}</button></div>`;
  if (x.kind === 'm') {
    el.innerHTML = `${head}<div class="mkq">
      <div class="mkpic pic">${imgHTML(x.item.img)}</div>
      <h3 class="mkt">Which word is it?</h3>
      <div class="mkopts">${x.opts.map((o, i) => `<button type="button" class="mkopt" data-o="${i}">${esc(o)}</button>`).join('')}</div>
      <div class="mkfb" id="mkFb" aria-live="polite"></div></div><div id="mkNav"></div>`;
  } else {
    el.innerHTML = `${head}<div class="speak mkq">
      <h3 class="mkt">Say this phrase clearly</h3>
      <div class="target" id="tgt">${tokens(x.item.text).map(t => `<span class="w">${esc(t.o)}</span>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn ghost sm" data-act="hear">🔊 Listen</button><button class="btn ghost sm" data-act="slow">🐢 Slowly</button></div>
      <button class="mic" data-act="mic" id="mic" title="Press and speak">🎤</button>
      <div class="status" id="status">Press the microphone and speak</div>
      <div id="result"></div><div class="mkfb" id="mkFb" aria-live="polite"></div></div>
      <div id="mkNav">${next(last ? 'Skip and see my result →' : 'Skip →')}</div>`;
  }
  MK.next = next;
}
// One answer to the question on the screen. Returns the words that tell the student what happened to the item.
function mistAnswer(x, ok) {
  const r = mistakes[x.key];
  if (ok) {
    if (x.res === 'ok') return ''; x.res = 'ok';
    if (r) { r.ok = (r.ok || 0) + 1; if (r.ok >= MIST_OK) { delete mistakes[x.key]; MK.learned++; mistSave(); return '🎉 Learned! It has left your list.'; } }
    mistSave(); return '✅ Correct! One more correct answer and it leaves your list.';
  }
  if (!x.res) { x.res = 'no'; if (r) { r.n++; r.t = Date.now(); mistSave(); } }
  return '';
}
function onMistClick(e) {
  const t = e.target, x = MK && MK.q[MK.i];
  const sw = t.closest('[data-sayw]'); if (sw) return say(sw.dataset.sayw, null, 0.75);
  const o = t.closest('.mkopt');
  if (o && x && x.kind === 'm' && !x.res) {
    const ok = x.opts[+o.dataset.o] === x.item.word, msg = mistAnswer(x, ok);
    document.querySelectorAll('.mkopt').forEach((b, i) => { b.disabled = true; if (x.opts[i] === x.item.word) b.classList.add('ok'); else if (b === o) b.classList.add('no'); });
    $('#mkFb').innerHTML = ok ? `<b class="g">${msg}</b>` : `<b class="r">Not yet — the answer is “${esc(x.item.word)}”.</b> You will see it again in another round.`;
    $('#mkNav').innerHTML = MK.next(); say(x.item.word);
    return;
  }
  const b = t.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'hear': say(x.item.text); break;
    case 'slow': say(x.item.text, null, 0.6); break;
    case 'mic': mistMic(x); break;
    case 'again': renderMistakes(); break;
    case 'next':
      if (MK.i < MK.q.length - 1) { MK.i++; drawMist(); }
      else { MK.end = true; drawMist(); if (MK.q.some(q => q.res)) onActivity(); }   // a finished round is a practice activity (streak, weekly goal)
      window.scrollTo(0, 0); break;
  }
}
function mistMic(x) {
  if (!SR) return;
  const mic = $('#mic'), st = $('#status');
  if (recog) { recog.stop(); return; }
  speechSynthesis.cancel();
  recog = new SR(); recog.lang = LANG; recog.interimResults = false; recog.maxAlternatives = 5; recog.continuous = false;
  let got = false;
  recog.onstart = () => { mic.classList.add('rec'); st.textContent = '🎙 Listening… speak now'; };
  recog.onresult = e => { got = true; mistSpoken(x, judge(x.item.text, [...e.results[0]].map(a => a.transcript))); st.textContent = 'Press the microphone to try again'; };
  recog.onerror = e => { st.textContent = srErrText(e.error); };
  recog.onend = () => { mic.classList.remove('rec'); recog = null; if (!got && st.textContent.startsWith('🎙')) st.textContent = 'Press the microphone and speak'; };
  try { recog.start(); } catch (e) { recog = null; }
}
function mistSpoken(x, res) {
  if (!MK || MK.q[MK.i] !== x || !$('#tgt')) return;
  const tk = tokens(x.item.text), s = res.score, pass = s >= MIST_PASS, col = pass ? 'var(--green)' : s >= 55 ? 'var(--sun)' : 'var(--coral)';
  document.querySelectorAll('#tgt .w').forEach((w, i) => { w.classList.remove('ok', 'no'); if (tk[i].n) w.classList.add(res.ok.has(i) ? 'ok' : 'no'); });
  const missed = tk.filter((t, i) => t.n && !res.ok.has(i)).map(t => t.o), was = x.res, msg = mistAnswer(x, pass);
  $('#result').innerHTML = `<div class="result"><div class="ring" style="--p:${s};--rc:${col}"><span>${s}%</span></div>
    <div class="fb"><b style="color:${col}">${pass ? 'Clear! 👏' : s >= 55 ? 'Almost there! 💪' : 'Let\'s try again 🔁'}</b><div>${pass ? 'You said it clearly.' : 'Listen to the model, then say it again slowly and clearly.'}</div><div class="hint" style="margin:8px 0 0">I heard: “${esc(res.heard)}”</div>
    ${missed.length ? `<div class="hint" style="margin:4px 0 0">Practise: ${missed.map(w => `<span class="pchip" data-sayw="${esc(w)}" style="padding:3px 10px">🔊 ${esc(w)}</span>`).join(' ')}</div>` : ''}</div></div>`;
  if (msg) $('#mkFb').innerHTML = `<b class="g">${msg}</b>`;
  else if (!pass && was !== 'ok') $('#mkFb').innerHTML = 'You can try again, or go on — you will see it again in another round.';
  $('#mkNav').innerHTML = MK.next();
}
