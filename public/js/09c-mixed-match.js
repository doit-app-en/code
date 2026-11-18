/* ================= MIXED MATCH ================= */
// A MIX_SECS-second matching round (route #/mixmatch) that mixes the picture–word pairs of every lesson the student has finished
// (lessonsDone). Offered from the home page and My progress after MIX_LESSONS finished lessons. Four pairs are on the screen at a
// time, drawn like a lesson's Match game (.match / .mcard / .chip); when all four are matched the next four come.
// The student sees the number matched and his own best (IndexedDB key 'mixBest': {best, t, plays}) — never anybody else's score,
// and nothing is sent to the teacher. A wrong pair is remembered for "Practise my mistakes" like in a lesson.
let mixBest = {best: 0, plays: 0}, MX = null, MIX_SECS = 60;   // MIX_SECS is a variable so the smoke test can play a short round
const MIX_BOARD = 4, MIX_LESSONS = 2;
// The pairs that can be played: from finished lessons that are still there, one of each word.
function mixPool() {
  const items = [], seen = new Set(); let lessons = 0;
  LEVELS.forEach(l => state.levels[l.id].lessons.forEach(s => {
    if (!lessonsDone[s.id]) return; let any = false;
    s.matching.forEach(p => { const n = norm(p.word || ''); if (!n || seen.has(n)) return; seen.add(n); items.push({level: l, lesson: s, item: p}); any = true; });
    if (any) lessons++;
  }));
  return {items, lessons, ready: lessons >= MIX_LESSONS && items.length >= MIX_BOARD};
}
// The link on the home page and on My progress ('' until two lessons are finished).
function mixLinkHTML() {
  if (mode === 'teacher' || !mixPool().ready) return '';
  return `<a class="mistk mixk" id="mixGo" href="#/mixmatch"><i>⚡</i><span><b>Mixed match · ${MIX_SECS} seconds</b><small>Pictures and words from the lessons you finished.${mixBest.best ? ` Your best: <strong>${mixBest.best}</strong>` : ''}</small></span><em>Play →</em></a>`;
}
async function renderMixed() {
  if (MX) clearInterval(MX.iv);
  const pool = mixPool();
  await Promise.all(pool.items.map(x => x.item.img && x.item.img.m).filter(Boolean).map(loadMedia));
  MX = {pool, queue: [], board: [], done: {}, sel: null, score: 0, mist: 0, phase: 'intro', iv: null};
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Mixed match</div>
  <div class="banner photo slim mkban" style="--ac:var(--teal);--img:url(photos/lessons.jpg)"><div><span class="lv" style="background:var(--teal)">⚡ ${MIX_SECS} seconds</span><h1>Mixed match</h1></div></div>
  <div class="panel" id="mxBody"></div>`;
  const body = $('#mxBody');
  body.onclick = onMixClick;
  body.ondragstart = e => { const c = e.target.closest('.mcard:not(.done)'); if (c && MX.phase === 'play') { mixSelect(+c.dataset.mi); e.dataTransfer.setData('text', c.dataset.mi); } };
  body.ondragover = e => { const c = e.target.closest('.chip:not(.done)'); if (c) { e.preventDefault(); c.classList.add('over'); } };
  body.ondragleave = e => { const c = e.target.closest('.chip'); if (c) c.classList.remove('over'); };
  body.ondrop = e => { const c = e.target.closest('.chip:not(.done)'); if (c) { e.preventDefault(); c.classList.remove('over'); mixTry(+c.dataset.wi, c); } };
  mixDraw();
}
// The next four pairs: the pool is gone through in a random order and starts again when it runs out.
function mixDeal() {
  if (MX.queue.length < MIX_BOARD) MX.queue = MX.queue.concat(shuffle(MX.pool.items.filter(x => !MX.queue.includes(x))));
  MX.board = MX.queue.splice(0, MIX_BOARD); MX.done = {}; MX.sel = null;
  MX.pics = shuffle(MX.board.map((_, i) => i)); MX.words = shuffle(MX.board.map((_, i) => i));
}
const mixLeft = () => Math.max(0, Math.ceil((MX.end - Date.now()) / 1000));
const mixClock = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
function mixDraw() {
  const el = $('#mxBody'); if (!el || !MX) return;
  const best = mixBest.best || 0, P = MX.pool;
  if (!P.ready) {
    el.innerHTML = `<div class="statebox" id="mxLocked"><div class="e">🔒</div><b>Finish ${MIX_LESSONS} lessons to open this game</b>
      <p>Mixed match uses the pictures and words from the lessons you have finished. You have finished <b>${P.lessons}</b> so far.</p>
      <a class="btn sun" href="#/">Go to my lessons →</a></div>`;
    return;
  }
  if (MX.phase === 'intro') {
    el.innerHTML = `<div class="statebox mxintro" id="mxIntro"><div class="e">⚡</div><b>How many can you match in ${MIX_SECS} seconds?</b>
      <p>Tap a picture, then tap its word. The pictures and words come from the <b>${P.lessons}</b> lessons you have finished (${P.items.length} words).</p>
      ${best ? `<p class="mxbest">🏆 Your best: <b>${best}</b></p>` : ''}
      <button class="btn sun" data-act="start" id="mxStart">▶ Start</button></div>`;
    return;
  }
  if (MX.phase === 'end') {
    const top = MX.newBest;
    el.innerHTML = `<div class="win mxend" id="mxEnd"><div class="stars">${top ? '🏆' : '⏰'}</div>
      <h3>${top ? 'New best!' : 'Time is up!'}</h3>
      <p class="mxsum">You matched <b>${MX.score}</b> ${MX.score === 1 ? 'pair' : 'pairs'}</p>
      <p class="hint" style="margin:0 0 14px">${top ? (MX.old ? `Your best was ${MX.old}.` : 'This is your first score — try to beat it!') : best ? `Your best: <b>${best}</b>${MX.score === best ? ' — the same again!' : ''}` : 'Match one pair to set your first score.'}${MX.mist ? ` · Mistakes: <b>${MX.mist}</b>` : ''}</p>
      <div class="row" style="justify-content:center"><button class="btn sun" data-act="start" id="mxAgain">↻ Play again</button><a class="btn ghost" href="#/">🏠 Home</a></div></div>
      ${MX.mist ? mistLinkHTML() : ''}`;
    return;
  }
  const s = mixLeft();
  el.innerHTML = `<div class="mxgame" id="mxGame">
    <div class="mxtop"><span class="mxtime${s <= 10 ? ' low' : ''}" id="mxTime">⏱ ${mixClock(s)}</span><span class="mxscore">Matched: <b id="mxScore">${MX.score}</b></span>${best ? `<span class="mxb">Best: <b>${best}</b></span>` : ''}</div>
    <div class="mkbar mxbar" role="img" aria-label="Time left"><i id="mxFill" style="width:${Math.max(0, (MX.end - Date.now()) / (MIX_SECS * 10))}%"></i></div>
    <div class="match">
      <div class="mpics">${MX.pics.map(i => { const d = MX.done[i]; return `<div class="mcard ${d !== undefined ? 'done' : ''} ${MX.sel === i ? 'sel' : ''}" data-mi="${i}" ${d === undefined ? 'draggable="true"' : ''} style="--pc:${PCOL[d % PCOL.length]}"><div class="pic">${imgHTML(MX.board[i].item.img)}</div>${d !== undefined ? `<span class="tagn">✓</span>` : ''}</div>`; }).join('')}</div>
      <div class="mwords">${MX.words.map(i => { const d = MX.done[i]; return `<div class="chip ${d !== undefined ? 'done' : ''}" data-wi="${i}" style="--pc:${PCOL[d % PCOL.length]}">${esc(MX.board[i].item.word)}</div>`; }).join('')}</div>
    </div></div>`;
}
function mixStart() {
  clearInterval(MX.iv);
  Object.assign(MX, {queue: [], score: 0, mist: 0, phase: 'play', newBest: false, end: Date.now() + MIX_SECS * 1000});
  mixDeal(); mixDraw(); window.scrollTo(0, 0);
  const run = MX;
  run.iv = setInterval(() => {
    if (MX !== run || run.phase !== 'play' || !$('#mxGame')) return clearInterval(run.iv);   // the student left the page
    if (Date.now() >= run.end) return mixFinish();
    const s = mixLeft(), t = $('#mxTime'), f = $('#mxFill');
    if (t) { t.textContent = '⏱ ' + mixClock(s); t.classList.toggle('low', s <= 10); }
    if (f) f.style.width = Math.max(0, (run.end - Date.now()) / (MIX_SECS * 10)) + '%';
  }, 200);
}
function mixFinish() {
  clearInterval(MX.iv); stopAll();
  MX.phase = 'end'; MX.old = mixBest.best || 0; MX.newBest = MX.score > MX.old;
  if (mode !== 'teacher') {   // a teacher trying the game does not change the student's best
    mixBest = {best: Math.max(MX.old, MX.score), t: MX.newBest ? Date.now() : mixBest.t, plays: (mixBest.plays || 0) + 1};
    DB.put('kv', 'mixBest', mixBest);
  }
  mixDraw(); window.scrollTo(0, 0);
  if (MX.score) onActivity();   // a played round is a practice activity (streak, weekly goal)
}
function mixSelect(i) { if (MX.done[i] !== undefined) return; MX.sel = i; document.querySelectorAll('#mxGame .mcard').forEach(c => c.classList.toggle('sel', +c.dataset.mi === i)); }
function mixTry(wi, chipEl) {
  if (!MX || MX.phase !== 'play' || MX.done[wi] !== undefined) return;
  if (Date.now() >= MX.end) return mixFinish();
  if (MX.sel === null || MX.sel === undefined) { chipEl.classList.add('shake'); setTimeout(() => chipEl.classList.remove('shake'), 450); toast('First choose a picture 👆'); return; }
  if (wi === MX.sel) {
    MX.done[wi] = Object.keys(MX.done).length; MX.score++; MX.sel = null; say(MX.board[wi].item.word);
    if (Object.keys(MX.done).length === MX.board.length) mixDeal();   // all four matched: the next four
    mixDraw();
  } else {
    MX.mist++; const x = MX.board[MX.sel]; noteMistake('m', x.lesson, x.item);   // remembered for "Practise my mistakes" (09b-mistakes.js)
    const card = document.querySelector(`#mxGame .mcard[data-mi="${MX.sel}"]`);
    [chipEl, card].forEach(el => { if (el) { el.classList.add('shake', 'bad'); setTimeout(() => el.classList.remove('shake', 'bad'), 500); } });
  }
}
function onMixClick(e) {
  const t = e.target, b = t.closest('[data-act="start"]');
  if (b) { if (mixPool().ready) { MX.pool = mixPool(); mixStart(); } return; }
  if (!MX || MX.phase !== 'play') return;
  const mc = t.closest('.mcard'); if (mc && !mc.classList.contains('done')) return mixSelect(+mc.dataset.mi);
  const ch = t.closest('.chip'); if (ch && !ch.classList.contains('done')) mixTry(+ch.dataset.wi, ch);
}
