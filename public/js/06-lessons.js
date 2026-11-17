/* ================= LEVEL PAGE ================= */
function renderLevel(lid) {
  const L = LV(lid), lessons = state.levels[lid].lessons, T = mode === 'teacher';
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › ${L.name}</div>
  <div class="banner photo" style="--c:${L.color};--ac:${L.color};--img:url(photos/level-${L.id}.jpg)"><div class="bi">${L.icon}</div><div><h1>${L.name}</h1><p>${L.tag} · ${L.desc}</p></div></div>
  <div class="lessons">
    ${lessons.map((s, i) => `
      <div class="lcard" style="--c:${L.color}" data-open="${s.id}">
        <span class="num">LESSON ${i + 1}</span>
        <h3>${esc(s.title)}</h3>
        <div class="badges">
          <span class="badge">🎬 ${s.video ? 'Video' : 'No video'}</span>
          <span class="badge">🎧 ${s.phrases.length} phrases</span>
          <span class="badge">🧩 ${s.matching.length} pairs</span>
          <span class="badge">🎤 ${s.speaking.length} to say</span>
        </div>
        ${T ? `<div class="tools"><button class="btn sm ghost" data-ren="${s.id}">✏️ Rename</button>
          <button class="btn sm ghost" data-up="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn sm ghost" data-del="${s.id}">🗑 Delete</button></div>` : ''}
      </div>`).join('')}
    ${T ? `<div class="lcard addl" style="--c:${L.color}">
        <b class="baloo" style="font-size:20px">➕ Add a new lesson</b>
        <input class="in" id="newTitle" placeholder="Lesson title, e.g. At the Market">
        <button class="btn sun" id="addLesson">Create lesson</button></div>` : ''}
  </div>
  ${!lessons.length && !T ? `<div class="panel empty" style="margin-top:20px"><div class="e">📭</div>No lessons yet in this level.</div>` : ''}
  ${!T ? `<div class="note">🧑‍🏫 Teachers: switch to <b>Teacher</b> mode (top right) to add lessons, videos, voice tracks, pictures and questions.</div>` : ''}`;
  app.querySelectorAll('[data-open]').forEach(el => el.onclick = e => { if (e.target.closest('button')) return; go(`#/lesson/${lid}/${el.dataset.open}`); });
  if (!T) return;
  $('#addLesson').onclick = async () => {
    const t = $('#newTitle').value.trim() || 'New lesson';
    const s = newLesson(t); lessons.push(s); await save(); go(`#/lesson/${lid}/${s.id}`);
  };
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this lesson and all its content?')) return;
    state.levels[lid].lessons = lessons.filter(s => s.id !== b.dataset.del); await save(); renderLevel(lid);
  });
  app.querySelectorAll('[data-ren]').forEach(b => b.onclick = async () => {
    const s = lessons.find(x => x.id === b.dataset.ren); const t = prompt('Lesson title', s.title);
    if (t && t.trim()) { s.title = t.trim(); await save(); renderLevel(lid); }
  });
  app.querySelectorAll('[data-up]').forEach(b => b.onclick = async () => {
    const i = +b.dataset.up; [lessons[i - 1], lessons[i]] = [lessons[i], lessons[i - 1]]; await save(); renderLevel(lid);
  });
}

/* ================= LESSON PAGE ================= */
let LID, LS, LVL, curTab = 'video', M = {}, S = {i:0, best:{}};
const TABS = [['video','🎬','Watch'],['listen','🎧','Listen & See'],['match','🧩','Match'],['speak','🎤','Speak']];
async function renderLesson(lid, sid) {
  const lesson = state.levels[lid].lessons.find(s => s.id === sid);
  if (!lesson) return go('#/level/' + lid);
  if (!LS || LS.id !== lesson.id) { curTab = 'video'; M = {}; S = {i:0, best:{}}; }
  LID = lid; LS = lesson; LVL = LV(lid);
  const ids = [lesson.video && lesson.video.m, lesson.audio && lesson.audio.m, ...lesson.phrases.map(p => p.img && p.img.m), ...lesson.matching.map(p => p.img && p.img.m)];
  await Promise.all(ids.filter(Boolean).map(loadMedia));
  const idx = state.levels[lid].lessons.indexOf(lesson);
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/level/${lid}">${LVL.name}</a> › ${esc(lesson.title)}</div>
  <div class="banner photo slim" style="--ac:${LVL.color};--img:url(photos/lessons.jpg)"><div><span class="lv" style="background:${LVL.color}">${LVL.name} · Lesson ${idx + 1}</span><h1>${esc(lesson.title)}</h1></div></div>
  <div class="tabs" style="--c:${LVL.color}">${TABS.map((t, i) => `<button class="tab" data-tab="${t[0]}"><span class="n">${i + 1}</span>${t[1]} ${t[2]}</button>`).join('')}</div>
  <div class="panel" id="body"><div id="stu"></div><div id="edt"></div></div>
  <div class="lnav"><button class="btn ghost" id="prevStep">← Previous step</button><button class="btn" id="nextStep" style="background:${LVL.color}">Next step →</button></div>`;
  app.querySelectorAll('.tab').forEach(b => b.onclick = () => { curTab = b.dataset.tab; drawTab(); });
  $('#prevStep').onclick = () => { const i = TABS.findIndex(t => t[0] === curTab); if (i > 0) { curTab = TABS[i - 1][0]; drawTab(); } };
  $('#nextStep').onclick = () => { const i = TABS.findIndex(t => t[0] === curTab); if (i < 3) { curTab = TABS[i + 1][0]; drawTab(); } else { markLessonDone(LS.id); toast('Lesson finished! 🎉'); go('#/level/' + lid); } };
  const body = $('#body');
  body.onclick = onBodyClick; body.onchange = onBodyChange;
  body.ondragstart = e => { const c = e.target.closest('.mcard'); if (c) { M.sel = +c.dataset.mi; e.dataTransfer.setData('text', c.dataset.mi); } };
  body.ondragover = e => { const c = e.target.closest('.chip:not(.done)'); if (c) { e.preventDefault(); c.classList.add('over'); } };
  body.ondragleave = e => { const c = e.target.closest('.chip'); if (c) c.classList.remove('over'); };
  body.ondrop = e => { const c = e.target.closest('.chip:not(.done)'); if (c) { e.preventDefault(); c.classList.remove('over'); tryMatch(+c.dataset.wi, c); } };
  drawTab();
}
function drawTab() {
  stopAll();
  app.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === curTab));
  const i = TABS.findIndex(t => t[0] === curTab);
  $('#prevStep').style.visibility = i ? 'visible' : 'hidden';
  $('#nextStep').textContent = i < 3 ? 'Next step →' : '✔ Finish lesson';
  drawStu(); drawEd();
}
function drawStu() { $('#stu').innerHTML = ({video: stuVideo, listen: stuListen, match: stuMatch, speak: stuSpeak})[curTab](); bindStu(); }
function drawEd() { $('#edt').innerHTML = mode === 'teacher' ? ({video: edVideo, listen: edListen, match: edMatch, speak: edSpeak})[curTab]() : ''; }

/* ---- 1. VIDEO ---- */
const ytId = u => { const m = String(u).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/); return m && m[1]; };
function stuVideo() {
  const v = LS.video; let player;
  if (!v) player = `<div class="empty" style="background:#f7f9ff;border-radius:18px"><div class="e">🎬</div>No video yet. ${mode === 'teacher' ? 'Add one in the teacher tools below.' : 'Your teacher will add one soon!'}</div>`;
  else if (v.type === 'yt') player = `<div class="vwrap"><iframe src="https://www.youtube.com/embed/${esc(v.id)}?rel=0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  else player = `<div class="vwrap"><video controls playsinline src="${esc(v.type === 'file' ? (urlCache[v.m] || '') : v.url)}"></video></div>`;
  return `<h3 class="sec-t">🎬 Watch & meet new phrases</h3><p class="hint">Watch the video carefully. Then tap the phrases below to hear them again.</p>
    ${player}
    ${LS.phrases.length ? `<div class="chips">${LS.phrases.map((p, i) => `<span class="pchip" data-say="${i}">🔊 ${esc(p.text)}</span>`).join('')}</div>` : ''}`;
}
function edVideo() {
  const v = LS.video;
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Video</h4>
    <div class="erow"><span class="lbl">Video link</span><input class="in grow" id="vurl" placeholder="Paste a YouTube link or a direct .mp4 link" value="${v && v.type !== 'file' ? esc(v.src || '') : ''}"><button class="btn sm" data-act="vidurl">Use link</button></div>
    <div class="erow"><span class="lbl">…or upload a video file</span><label class="btn sm sun">📁 Choose video<input type="file" accept="video/*" hidden data-upload="video"></label>
    ${v ? `<button class="btn sm red" data-act="vidrm" style="margin-left:auto">🗑 Remove video</button>` : ''}</div></div>`;
}

/* ---- 2. LISTEN & SEE ---- */
function stageHTML(i) {
  const p = LS.phrases[i];
  if (!p) return `<div class="sp"><span class="emo">🎵</span></div><div class="st">${LS.audio ? 'Press play to start the voice track' : 'Tap a picture or press “Play all”'}</div>`;
  return `<div class="sp">${imgHTML(p.img)}</div><div class="st">${esc(p.text)}</div>`;
}
function stuListen() {
  const ph = LS.phrases;
  if (!ph.length && !LS.audio) return `<h3 class="sec-t">🎧 Listen & See</h3><div class="empty"><div class="e">🎧</div>No phrases yet.${mode === 'teacher' ? ' Add a voice track and pictures below.' : ''}</div>`;
  return `<h3 class="sec-t">🎧 Listen & See</h3>
    <p class="hint">${LS.audio ? 'Play the voice track — each picture lights up when you hear its phrase. Tap a picture to jump to it.' : 'Tap a picture to hear the phrase, or press “Play all”.'}</p>
    <div class="stage" id="stage">${stageHTML(-1)}</div>
    ${LS.audio ? `<audio id="trk" controls src="${urlCache[LS.audio.m] || ''}"></audio>` : `<button class="btn sun" data-act="playall">▶ Play all</button>`}
    <div class="phr-grid">${ph.map((p, i) => `<div class="phr" data-pi="${i}"><div class="pic">${imgHTML(p.img)}</div><div class="pt">${esc(p.text)}</div>${LS.audio ? `<span class="tm">${fmt(p.time)}</span>` : ''}</div>`).join('')}</div>`;
}
let activeP = -1;
function setActive(i) {
  if (i === activeP) return; activeP = i;
  document.querySelectorAll('.phr').forEach(el => el.classList.toggle('active', +el.dataset.pi === i));
  const st = $('#stage'); if (!st) return; st.innerHTML = stageHTML(i);
  st.classList.remove('pop'); void st.offsetWidth; st.classList.add('pop');
}
function edListen() {
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Voice track & pictures</h4>
    <div class="erow"><span class="lbl">Voice track</span>
      <label class="btn sm sun">📁 Upload audio<input type="file" accept="audio/*" hidden data-upload="audio"></label>
      <button class="btn sm teal" data-act="rec">🎙 Record my voice</button>
      ${LS.audio ? `<button class="btn sm red" data-act="audrm">🗑 Remove track</button>` : '<span class="lbl">No track yet — students will hear a computer voice instead.</span>'}
    </div>
    <p class="lbl" style="margin:8px 0">Each phrase: picture (type an emoji or upload a photo), the phrase, and the second it starts in the voice track. Play the track and press ⏱ to grab the current time.</p>
    ${LS.phrases.map((p, i) => `<div class="erow">${picEdit('phrases', i, p.img)}
      <input class="in grow" value="${esc(p.text)}" data-kind="phrases" data-idx="${i}" data-field="text" placeholder="Phrase">
      <span class="lbl">sec</span><input class="in tin" type="number" step="0.1" min="0" value="${p.time}" data-kind="phrases" data-idx="${i}" data-field="time">
      <button class="btn sm ghost" data-act="now" data-idx="${i}" title="Use current track time">⏱</button>
      <button class="btn sm ghost" data-act="del" data-kind="phrases" data-idx="${i}">🗑</button></div>`).join('')}
    <button class="btn sm" data-act="add" data-kind="phrases">➕ Add phrase</button></div>`;
}

/* ---- 3. MATCH ---- */
const PCOL = ['#2ec4b6','#ff6b6b','#7b61ff','#ffb703','#4361ee','#06b67a','#f15bb5','#fb8500','#00b4d8','#8338ec'];
function resetMatch() { M = {lid: LS.id, n: LS.matching.length, sel: null, done: {}, mist: 0, order: shuffle(LS.matching.map((_, i) => i)), pics: shuffle(LS.matching.map((_, i) => i))}; }
function stuMatch() {
  const P = LS.matching;
  if (P.length < 2) return `<h3 class="sec-t">🧩 Match the pictures</h3><div class="empty"><div class="e">🧩</div>Add at least 2 picture–word pairs${mode === 'teacher' ? ' below' : ''}.</div>`;
  if (M.lid !== LS.id || M.n !== P.length) resetMatch();
  const nd = Object.keys(M.done).length, all = nd === P.length;
  const stars = M.mist === 0 ? '⭐⭐⭐' : M.mist <= 2 ? '⭐⭐' : '⭐';
  return `<h3 class="sec-t">🧩 Match the pictures</h3>
    <p class="hint">Tap a picture, then tap the word that goes with it (or drag the picture onto the word). Matched: <b>${nd}/${P.length}</b> · Mistakes: <b>${M.mist}</b></p>
    <div class="match">
      <div class="mpics">${M.pics.map(i => { const d = M.done[i]; return `<div class="mcard ${d !== undefined ? 'done' : ''} ${M.sel === i ? 'sel' : ''}" data-mi="${i}" ${d === undefined ? 'draggable="true"' : ''} style="--pc:${PCOL[d % PCOL.length]}"><div class="pic">${imgHTML(P[i].img)}</div>${d !== undefined ? `<span class="tagn">${d + 1}</span>` : ''}</div>`; }).join('')}</div>
      <div class="mwords">${M.order.map(i => { const d = M.done[i]; return `<div class="chip ${d !== undefined ? 'done' : ''}" data-wi="${i}" style="--pc:${PCOL[d % PCOL.length]}">${d !== undefined ? `<span class="tagn" style="background:#fff;color:var(--pc)">${d + 1}</span>` : ''}${esc(P[i].word)}</div>`; }).join('')}</div>
    </div>
    ${all ? `<div class="win"><div class="stars">${stars}</div><h3>Fantastic! All matched 🎉</h3><p class="hint" style="margin:0 0 12px">You made ${M.mist} mistake${M.mist === 1 ? '' : 's'}.</p><button class="btn sun" data-act="mreset">↻ Play again</button></div>` : ''}`;
}
function tryMatch(wi, chipEl) {
  if (M.sel === null || M.sel === undefined) { chipEl.classList.add('shake'); setTimeout(() => chipEl.classList.remove('shake'), 450); toast('First choose a picture 👆'); return; }
  if (M.done[wi] !== undefined) return;
  if (wi === M.sel) { M.done[wi] = Object.keys(M.done).length; say(LS.matching[wi].word); M.sel = null; drawStu(); }
  else {
    M.mist++;
    const card = document.querySelector(`.mcard[data-mi="${M.sel}"]`);
    [chipEl, card].forEach(el => { if (el) { el.classList.add('shake', 'bad'); setTimeout(() => el.classList.remove('shake', 'bad'), 500); } });
    const h = document.querySelector('#stu .hint b:last-child'); if (h) h.textContent = M.mist;
  }
}
function edMatch() {
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Matching pairs</h4>
    <p class="lbl" style="margin:0 0 8px">Add a picture (emoji or photo) and the word or phrase that matches it.</p>
    ${LS.matching.map((p, i) => `<div class="erow">${picEdit('matching', i, p.img)}
      <input class="in grow" value="${esc(p.word)}" data-kind="matching" data-idx="${i}" data-field="word" placeholder="Word">
      <button class="btn sm ghost" data-act="del" data-kind="matching" data-idx="${i}">🗑</button></div>`).join('')}
    <button class="btn sm" data-act="add" data-kind="matching">➕ Add pair</button></div>`;
}

/* ---- 4. SPEAK ---- */
function stuSpeak() {
  const list = LS.speaking;
  if (!list.length) return `<h3 class="sec-t">🎤 Speak</h3><div class="empty"><div class="e">🎤</div>No phrases to practise yet.</div>`;
  if (S.i >= list.length) S.i = 0;
  const it = list[S.i];
  return `<h3 class="sec-t">🎤 Say it out loud</h3>
    <p class="hint">Listen to the model, then press the microphone and say the phrase. The AI listens and checks how clearly you said each word.</p>
    <div class="speak">
      <div class="prog">Phrase ${S.i + 1} of ${list.length}</div>
      <div class="target" id="tgt">${tokens(it.text).map(t => `<span class="w">${esc(t.o)}</span>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn ghost sm" data-act="hear">🔊 Listen</button><button class="btn ghost sm" data-act="slow">🐢 Slowly</button></div>
      <button class="mic" data-act="mic" id="mic" title="Press and speak">🎤</button>
      <div class="status" id="status">${SR ? 'Press the microphone and speak' : '⚠️ Speech recognition needs Google Chrome or Microsoft Edge.'}</div>
      <div id="result"></div>
      <div class="row" style="justify-content:center;margin-top:16px"><button class="btn ghost" data-act="sprev" ${S.i ? '' : 'disabled'}>← Back</button><button class="btn" data-act="snext" style="background:${LVL.color}">${S.i < list.length - 1 ? 'Next phrase →' : 'Start again ↻'}</button></div>
      <div class="dots">${list.map((x, i) => { const b = S.best[x.id]; return `<button class="dot ${i === S.i ? 'cur' : ''} ${b === undefined ? '' : b >= 80 ? 'g' : b >= 55 ? 'y' : 'r'}" data-act="dot" data-idx="${i}">${i + 1}</button>`; }).join('')}</div>
    </div>`;
}
function edSpeak() {
  return `<div class="edit"><h4>🧑‍🏫 Teacher tools · Pronunciation phrases</h4>
    ${LS.speaking.map((p, i) => `<div class="erow"><span class="lbl">${i + 1}</span><input class="in grow" value="${esc(p.text)}" data-kind="speaking" data-idx="${i}" data-field="text" placeholder="Word or phrase to pronounce">
      <button class="btn sm ghost" data-act="del" data-kind="speaking" data-idx="${i}">🗑</button></div>`).join('')}
    <div class="row"><button class="btn sm" data-act="add" data-kind="speaking">➕ Add phrase</button>
    <button class="btn sm ghost" data-act="copyph">⤵ Copy phrases from “Listen & See”</button></div></div>`;
}
// pronunciation judging
const norm = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = text => text.split(/\s+/).filter(Boolean).map(o => ({o, n: norm(o).replace(/ /g, '')}));
function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let prev = Array.from({length: n + 1}, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; }
const NUM = {zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10'};
const wEq = (a, b) => { a = a.replace(/'/g, ''); b = b.replace(/'/g, ''); if (a === b || NUM[a] === b || NUM[b] === a) return true; return a.length >= 6 && a[0] === b[0] && lev(a, b) <= 1; };
function judge(target, alts) {
  const tk = tokens(target), tw = tk.map(t => t.n); let best = null;
  for (const alt of alts) {
    const hw = norm(alt).split(' ').filter(Boolean), n = tw.length, m = hw.length;
    const dp = Array.from({length: n + 1}, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = tw[i - 1] && wEq(tw[i - 1], hw[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    const ok = new Set(); let i = n, j = m;
    while (i && j) { if (tw[i - 1] && wEq(tw[i - 1], hw[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) { ok.add(i - 1); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
    const real = tw.filter(Boolean).length || 1;
    const wordScore = ok.size / real;
    const extra = Math.max(0, m - real) / real;
    const A = norm(target).replace(/'/g, ''), B = norm(alt).replace(/'/g, '');
    const cs = 1 - lev(A, B) / Math.max(A.length, B.length, 1);
    const score = Math.max(0, Math.round(100 * (0.7 * wordScore + 0.3 * cs) - extra * 10));
    if (!best || score > best.score) best = {score, heard: alt, ok};
  }
  return best;
}
function showResult(res) {
  const it = LS.speaking[S.i];
  S.best[it.id] = Math.max(S.best[it.id] || 0, res.score);
  document.querySelectorAll('#tgt .w').forEach((w, i) => { w.classList.remove('ok', 'no'); if (tokens(it.text)[i].n) w.classList.add(res.ok.has(i) ? 'ok' : 'no'); });
  const s = res.score, col = s >= 80 ? 'var(--green)' : s >= 55 ? 'var(--sun)' : 'var(--coral)';
  const [title, msg] = s >= 90 ? ['Excellent! 🌟', 'Perfect pronunciation — great job!'] : s >= 80 ? ['Very good! 👏', 'Very clear. Just a tiny bit more practice.'] : s >= 55 ? ['Almost there! 💪', 'Some words were not clear. Listen to the red words and try again.'] : ['Let\'s try again 🔁', 'Listen to the model first, then speak slowly and clearly.'];
  const missed = tokens(it.text).filter((t, i) => t.n && !res.ok.has(i)).map(t => t.o);
  $('#result').innerHTML = `<div class="result"><div class="ring" style="--p:${s};--rc:${col}"><span>${s}%</span></div>
    <div class="fb"><b style="color:${col}">${title}</b><div>${msg}</div><div class="hint" style="margin:8px 0 0">I heard: “${esc(res.heard)}”</div>
    ${missed.length ? `<div class="hint" style="margin:4px 0 0">Practise: ${missed.map(w => `<span class="pchip" data-sayw="${esc(w)}" style="padding:3px 10px">🔊 ${esc(w)}</span>`).join(' ')}</div>` : ''}</div></div>`;
  document.querySelectorAll('.dot')[S.i].className = `dot cur ${s >= 80 ? 'g' : s >= 55 ? 'y' : 'r'}`;
  if (s >= 90) say('Excellent!', null, 1);
}
function startMic() {
  if (!SR) { toast('Please open this page in Chrome or Edge for speech recognition'); return; }
  const mic = $('#mic'), st = $('#status');
  if (recog) { recog.stop(); return; }
  speechSynthesis.cancel();
  const it = LS.speaking[S.i];
  recog = new SR(); recog.lang = LANG; recog.interimResults = false; recog.maxAlternatives = 5; recog.continuous = false;
  let got = false;
  recog.onstart = () => { mic.classList.add('rec'); st.textContent = '🎙 Listening… speak now'; };
  recog.onresult = e => { got = true; const alts = [...e.results[0]].map(a => a.transcript); st.textContent = 'Checking…'; showResult(judge(it.text, alts)); st.textContent = 'Press the microphone to try again'; };
  recog.onerror = e => { st.textContent = e.error === 'not-allowed' || e.error === 'service-not-allowed' ? '🚫 Microphone blocked — allow microphone access in your browser.' : e.error === 'no-speech' ? '🤔 I didn\'t hear anything. Try again a little louder.' : e.error === 'network' ? '🌐 Speech recognition needs an internet connection.' : 'Something went wrong (' + e.error + '). Try again.'; };
  recog.onend = () => { mic.classList.remove('rec'); recog = null; if (!got && st.textContent.startsWith('🎙')) st.textContent = 'Press the microphone and speak'; };
  try { recog.start(); } catch (e) { recog = null; }
}

/* ---- teacher picture editor ---- */
function picEdit(kind, i, img) {
  return `<div class="pe"><div class="pe-prev">${imgHTML(img)}</div>
    <input class="in emo-in" maxlength="12" placeholder="😀" title="Type or paste an emoji" value="${esc((img && img.e) || '')}" data-kind="${kind}" data-idx="${i}" data-field="emoji">
    <label class="btn sm ghost" title="Upload a picture">📷<input type="file" accept="image/*" hidden data-kind="${kind}" data-idx="${i}" data-upload="img"></label></div>`;
}

/* ---- events in lesson body ---- */
function bindStu() {
  activeP = -1;
  const trk = $('#trk');
  if (trk) trk.ontimeupdate = () => {
    const t = trk.currentTime; let a = -1, at = -1;
    LS.phrases.forEach((p, i) => { if (p.time <= t + 0.05 && p.time >= at) { a = i; at = p.time; } });
    setActive(a);
  };
}
async function onBodyClick(e) {
  const t = e.target;
  // student actions
  const sayEl = t.closest('[data-say]'); if (sayEl) return say(LS.phrases[+sayEl.dataset.say].text);
  const sw = t.closest('[data-sayw]'); if (sw) return say(sw.dataset.sayw, null, 0.75);
  const ph = t.closest('.phr');
  if (ph) { const i = +ph.dataset.pi, trk = $('#trk'); if (trk) { trk.currentTime = LS.phrases[i].time; trk.play(); } else { playToken++; setActive(i); say(LS.phrases[i].text); } return; }
  const mc = t.closest('.mcard');
  if (mc && !mc.classList.contains('done')) { M.sel = +mc.dataset.mi; document.querySelectorAll('.mcard').forEach(c => c.classList.toggle('sel', c === mc)); return; }
  const ch = t.closest('.chip'); if (ch && !ch.classList.contains('done')) return tryMatch(+ch.dataset.wi, ch);
  const b = t.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, k = b.dataset.kind, i = +b.dataset.idx;
  switch (act) {
    case 'playall': {
      const tok = ++playToken; let n = 0;
      const next = () => { if (tok !== playToken || n >= LS.phrases.length) { if (tok === playToken) setActive(-1); return; } setActive(n); say(LS.phrases[n].text, () => setTimeout(next, 700)); n++; };
      next(); break;
    }
    case 'mreset': resetMatch(); drawStu(); break;
    case 'hear': say(LS.speaking[S.i].text); break;
    case 'slow': say(LS.speaking[S.i].text, null, 0.6); break;
    case 'mic': startMic(); break;
    case 'snext': stopAll(); S.i = (S.i + 1) % LS.speaking.length; drawStu(); break;
    case 'sprev': stopAll(); S.i = Math.max(0, S.i - 1); drawStu(); break;
    case 'dot': stopAll(); S.i = i; drawStu(); break;
    // teacher actions
    case 'add':
      if (k === 'phrases') { const last = LS.phrases[LS.phrases.length - 1]; LS.phrases.push({id: uid(), text: '', img: {e: ''}, time: last ? +(last.time + 3).toFixed(1) : 0}); }
      if (k === 'matching') LS.matching.push({id: uid(), word: '', img: {e: ''}});
      if (k === 'speaking') LS.speaking.push({id: uid(), text: ''});
      await save(); drawTab();
      { const ins = document.querySelectorAll(`#edt [data-kind="${k}"][data-field="${k === 'matching' ? 'word' : 'text'}"]`); if (ins.length) ins[ins.length - 1].focus(); }
      break;
    case 'del': LS[k].splice(i, 1); await save(); drawTab(); break;
    case 'now': { const trk = $('#trk'); if (!trk) return toast('Add a voice track first'); LS.phrases[i].time = +trk.currentTime.toFixed(1); await save(); drawEd(); bindStu(); drawStuKeepAudio(); toast('Time set to ' + fmt(LS.phrases[i].time)); break; }
    case 'vidurl': {
      const u = $('#vurl').value.trim(); if (!u) return toast('Paste a link first');
      const y = ytId(u); LS.video = y ? {type: 'yt', id: y, src: u} : {type: 'url', url: u, src: u};
      await save(); drawTab(); toast('Video added'); break;
    }
    case 'vidrm': LS.video = null; await save(); drawTab(); break;
    case 'audrm': LS.audio = null; await save(); drawTab(); break;
    case 'rec': toggleRec(b); break;
    case 'copyph': LS.phrases.forEach(p => { if (p.text && !LS.speaking.some(s => s.text === p.text)) LS.speaking.push({id: uid(), text: p.text}); }); await save(); drawTab(); break;
  }
}
function drawStuKeepAudio() { // refresh time labels without restarting the track
  document.querySelectorAll('.phr').forEach(el => { const tm = el.querySelector('.tm'); if (tm) tm.textContent = fmt(LS.phrases[+el.dataset.pi].time); });
}
async function onBodyChange(e) {
  const t = e.target, k = t.dataset.kind, i = +t.dataset.idx;
  if (t.dataset.upload === 'video' || t.dataset.upload === 'audio') {
    const f = t.files[0]; if (!f) return; toast('Saving…');
    const id = await storeMedia(f);
    if (t.dataset.upload === 'video') LS.video = {type: 'file', m: id}; else LS.audio = {m: id};
    await save(); drawTab(); toast(t.dataset.upload === 'video' ? 'Video uploaded' : 'Voice track uploaded'); return;
  }
  if (!k || !LS[k] || !LS[k][i]) return;
  const item = LS[k][i];
  if (t.dataset.upload === 'img') { const f = t.files[0]; if (!f) return; item.img = {m: await storeMedia(f)}; await save(); drawTab(); return; }
  const f = t.dataset.field;
  if (f === 'emoji') { item.img = {e: t.value.trim()}; t.closest('.pe').querySelector('.pe-prev').innerHTML = imgHTML(item.img); }
  else if (f === 'time') item.time = Math.max(0, parseFloat(t.value) || 0);
  else item[f] = t.value;
  await save();
  if (curTab === 'listen' && $('#trk')) drawStuKeepAudio(); else { if (curTab === 'match') M = {}; drawStu(); }
}
async function toggleRec(btn) {
  if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const chunks = []; recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const r = recorder; recorder = null; if (r._cancel) return;
      const blob = new Blob(chunks, {type: r.mimeType || 'audio/webm'});
      LS.audio = {m: await storeMedia(blob)}; await save(); drawTab(); toast('Voice track saved 🎙');
    };
    recorder.start(); btn.textContent = '⏹ Stop recording'; btn.classList.remove('teal'); btn.classList.add('red');
    toast('Recording… read your phrases, then press Stop');
  } catch (e) { toast('Microphone not available or permission denied'); }
}

