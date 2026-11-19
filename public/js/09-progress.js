/* ================= STUDENT PROGRESS + CLASS SERVER ================= */
// Progress is saved on the student's device and also sent to the class server, so the teacher can see
// everyone's progress. The class server is built into this site: /api/class (Vercel function + Supabase, see /api).
// A teacher can still type a Google Apps Script address instead (the older setup, see legacy/).
let student = null, activity = {last: null, days: {}}, lessonsDone = {}, syncT = null, tkey = '';
const DAY = 864e5;
const todayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const BUILT_IN_SERVER = '/api/class';
const DEFAULT_SERVER = /^https?:$/.test(location.protocol) ? BUILT_IN_SERVER : '';   // a page opened as a file has no server
const syncUrl = () => (state.sync && state.sync.url) || DEFAULT_SERVER;
const avgOf = a => a.length ? Math.round(a.reduce((x, y) => x + (+y || 0), 0) / a.length) : 0;
function daysIdle() { return activity.last ? Math.floor((Date.now() - activity.last) / DAY) : null; }
// Friendly states for everything that talks to the server: why it failed, in words a student understands, and a "Try again" button.
const netWhy = () => navigator.onLine === false ? 'You are not connected to the internet.' : 'The server did not answer. It may be busy — wait a moment.';
const stateBox = (icon, title, text, btnId) => `<div class="statebox" role="status"><div class="e">${icon}</div><b>${esc(title)}</b><p>${esc(text)}</p>${btnId ? `<button class="btn sm" id="${btnId}">↻ Try again</button>` : ''}</div>`;
const loadBox = text => `<div class="statebox" role="status"><span class="spin big"></span><p>${esc(text)}</p></div>`;
const idleText = d => d === null ? 'not yet' : d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';

function progressData() {
  const L = lexs(), listenScores = L.map(e => listenBest[e.id] || 0);
  const groups = lsGroups().map(g => { const ex = L.filter(e => lsGroup(e) === g);
    return {name: g, total: ex.length, done: ex.filter(e => listenBest[e.id] !== undefined).length, pct: avgOf(ex.map(e => listenBest[e.id] || 0))}; }).filter(g => g.total);
  const secs = pronSecs(), pronScores = secs.map(s => (pronBest[s.id] && pronBest[s.id].best) || 0);
  const lessonIds = LEVELS.flatMap(l => state.levels[l.id].lessons.map(s => s.id)), ldone = lessonIds.filter(id => lessonsDone[id]).length;
  const all = [...listenScores, ...pronScores, ...lessonIds.map(id => lessonsDone[id] ? 100 : 0)];
  let placed = null; try { placed = localStorage.getItem('die_placed'); } catch (e) {}
  return {
    overall: avgOf(all), done: L.filter(e => listenBest[e.id] !== undefined).length + secs.filter(s => pronBest[s.id]).length + ldone, total: all.length,
    listening: avgOf(listenScores), listenDone: L.filter(e => listenBest[e.id] !== undefined).length, listenTotal: L.length, groups,
    pronounce: avgOf(pronScores), pronDone: secs.filter(s => pronBest[s.id]).length, pronTotal: secs.length,
    lessons: lessonIds.length ? Math.round(ldone / lessonIds.length * 100) : 0, lessonsDone: ldone, lessonsTotal: lessonIds.length,
    placement: placed && LV(placed) ? LV(placed).name : '',
  };
}
// Call after every finished activity: remembers when the student last practised, then updates the teacher.
async function onActivity() {
  activity.last = Date.now(); activity.days = activity.days || {}; const first = !activity.days[todayKey()]; activity.days[todayKey()] = (activity.days[todayKey()] || 0) + 1;
  if (first) { const n = streakInfo().streak; if (MILESTONES.includes(n)) setTimeout(() => celebrateStreak(n), 900); }   // after the result of the activity is on the screen
  await DB.put('kv', 'activity', activity); syncProgress();
}
async function markLessonDone(id) { if (!lessonsDone[id]) { lessonsDone[id] = Date.now(); await DB.put('kv', 'lessonsDone', lessonsDone); } onActivity(); }
let syncState = '';   // '' | 'sending' | 'failed' | 'off' — what happened to the last try to send the progress to the teacher ('off' = this website has no class server yet)
async function sendProgress() {
  const url = syncUrl(); if (!url || !student || !student.email) return;
  syncState = 'sending'; drawSyncLine();
  try {
    // The website's own server answers {ok: true} when the progress is saved, and its answer can be read. (An Apps Script address is
    // another website: its answer cannot be read, so a request that left the device counts as sent.)
    const own = url === BUILT_IN_SERVER, r = await fetch(url, {method: 'POST', ...(own ? {} : {mode: 'no-cors'}), headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({action: 'progress', student, progress: progressData(), lastActive: activity.last ? new Date(activity.last).toISOString() : ''})});
    let d = null; if (own) { try { d = await r.json(); } catch (e) {} }
    if (own && !(r.ok && d && d.ok)) syncState = r.status === 404 || (d && d.error === 'server not configured') ? 'off' : 'failed';
    else { activity.synced = Date.now(); await DB.put('kv', 'activity', activity); syncState = ''; }
  } catch (e) { syncState = 'failed'; /* offline: sent again after the next activity, when the internet is back, or with "Try again" */ }
  drawSyncLine();
}
function syncProgress() { clearTimeout(syncT); syncT = setTimeout(sendProgress, 1500); }
// The line on "My progress" that says whether the teacher has the newest progress.
function syncLineHTML() {
  if (!student) return 'Your progress is saved on this device.';
  if (!syncUrl()) return 'Your progress is saved on this device. Your teacher has not connected the class server yet.';
  if (syncState === 'failed') return `<span class="syncbad">⚠️ Your progress is safe on this device, but it could not be sent to your teacher. ${esc(netWhy())}</span> <button class="btn sm" id="syncRetry">↻ Try again</button>`;
  if (syncState === 'off') return 'Your progress is saved on this device. The class server is not ready yet, so your teacher cannot see it for now.';
  if (syncState === 'sending') return '<span class="spin sm"></span> Sending your progress to your teacher…';
  return `✅ Your progress is shared with your teacher${activity.synced ? ' (last update ' + new Date(activity.synced).toLocaleString() + ')' : ''}.`;
}
function drawSyncLine() { const el = $('#syncLine'); if (!el) return; el.innerHTML = syncLineHTML(); const b = $('#syncRetry'); if (b) b.onclick = sendProgress; }
// Practice streak and this week (Sunday first), from the per-day activity count already saved on this device.
// A day counts when at least one activity was finished. Today not done yet does not break the streak.
// Rest day: one missed day in each week (Sunday to Saturday) does not break the streak, as long as the day before it was
// a practice day (so two missed days in a row always end it). A rest day keeps the streak but is not counted in it.
const MILESTONES = [3, 7, 14, 30];
function streakRun(n, now = new Date()) {   // the streak that ends n days ago: {streak, rests: [day keys], end: first n outside it}
  const days = activity.days || {}, at = k => { const d = new Date(now); d.setDate(d.getDate() - k); return d; }, has = k => !!days[todayKey(at(k))];
  let streak = 0; const rests = [], used = {};
  while (n < 3660) {
    if (has(n)) { streak++; n++; continue; }
    const wk = todayKey(at(n + at(n).getDay()));   // the Sunday that starts that day's week
    if (!used[wk] && has(n + 1)) { used[wk] = 1; rests.push(todayKey(at(n))); n++; continue; }
    break;
  }
  return {streak, rests, end: n};
}
function streakInfo() {
  const days = activity.days || {}, has = d => !!days[todayKey(d)], now = new Date(), at = n => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  const run = streakRun(has(now) ? 0 : 1, now), streak = run.streak, rest = d => run.rests.includes(todayKey(d));
  const dow = now.getDay(), week = [...Array(7)].map((_, i) => ({l: 'SMTWTFS'[i], on: i <= dow && has(at(dow - i)), rest: i <= dow && rest(at(dow - i)), today: i === dow}));
  // The longest streak this device has seen (for the milestone badges), and the first day since the oldest saved one.
  const keys = Object.keys(days).sort(), span = keys.length ? Math.min(3660, Math.round((new Date(todayKey(now)) - new Date(keys[0])) / DAY) + 1) : 0;
  let best = streak; for (let n = 0; n <= span;) { if (!has(at(n))) { n++; continue; } const r = streakRun(n, now); best = Math.max(best, r.streak); n = r.end; }
  return {streak, best, today: has(now), week, weekDays: week.filter(d => d.on).length, total: keys.length, rests: run.rests, restSaved: !has(now) && rest(at(1)),
    restLeft: !week.some(d => d.rest), next: MILESTONES.find(m => m > streak) || 0};
}
// Streak milestones: a short celebration the first time today's practice takes the streak to 3, 7, 14 or 30 days.
const MILE_TEXT = {3: ['Three days in a row!', 'A great start. Small steps every day make your English strong.'], 7: ['A whole week!', 'Seven days in a row. You are building a real habit.'],
  14: ['Two weeks in a row!', 'Fourteen days of English. Your hard work is showing.'], 30: ['Thirty days in a row!', 'A whole month of English. You are a champion!']};
function celebrateStreak(n) {
  const old = $('#celebrate'); if (old) old.remove();
  const t = MILE_TEXT[n], nx = MILESTONES.find(m => m > n), el = document.createElement('div'); el.id = 'celebrate'; el.className = 'celeb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'celebT');
  el.innerHTML = `<div class="celebc">${[...Array(14)].map((_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * .12}s;--c:${['var(--sun)', 'var(--green)', 'var(--coral,#ff6b6b)', 'var(--teal,#2ec4b6)'][i % 4]}"></i>`).join('')}
    <div class="celebf">🔥</div><div class="celebn">${n}</div><h2 id="celebT">${t[0]}</h2><p>${t[1]}</p>
    <div class="miles">${MILESTONES.map(m => `<span class="${m <= n ? 'on' : ''}">${m}</span>`).join('')}</div>
    <small>${nx ? `Next: ${nx} days in a row.` : 'You have reached every streak badge!'}</small>
    <button type="button" class="btn sun" id="celebOk">Keep going →</button></div>`;
  document.body.appendChild(el);
  const close = () => { el.remove(); document.removeEventListener('keydown', key); }, key = e => { if (e.key === 'Escape') close(); };
  $('#celebOk').onclick = close; el.onclick = e => { if (e.target === el) close(); }; document.addEventListener('keydown', key); $('#celebOk').focus();
}
const milesHTML = s => `<div class="miles" id="miles" role="img" aria-label="Streak badges: ${MILESTONES.filter(m => s.best >= m).join(', ') || 'none yet'}">${MILESTONES.map(m => `<span class="${s.best >= m ? 'on' : ''}" title="${m} days in a row">${m}</span>`).join('')}<small>${s.next ? `Next badge: ${s.next} days in a row` : 'Every streak badge is yours!'}</small></div>`;
const restHTML = s => `<small class="restline" id="restLine">💤 ${s.restLeft ? 'One free rest day a week: if you miss one day, your streak is safe.' : 'Your rest day this week is used. Practise every day until Sunday to keep your streak.'}</small>`;
const weekDotsHTML = s => `<div class="wk">${s.week.map(d => `<span class="${d.on ? 'on' : d.rest ? 'rest' : ''}${d.today ? ' now' : ''}"${d.rest ? ' title="Rest day"' : ''}>${d.rest ? '💤' : d.l}</span>`).join('')}</div>`;
// Weekly goal: the student picks 2, 3 or 5 practice days a week (kept on this device in localStorage 'die_goal').
// The week is Sunday to Saturday, the same as the week dots. `<div class="wgoal" id="wgoal"></div>` + drawGoal() shows it.
const GOALS = [2, 3, 5];
function weekGoal() { const g = +ls('die_goal'); return GOALS.includes(g) ? g : 0; }
function drawGoal(open) {
  const el = $('#wgoal'); if (!el) return; const g = weekGoal(), n = streakInfo().weekDays, hit = g && n >= g, left = g - n;
  el.innerHTML = g && !open
    ? `<div class="wgline${hit ? ' wgdone' : ''}"><b>${hit ? '🎉 Weekly goal reached:' : '🎯'} ${n} of ${g} days this week</b><button type="button" class="wgchg" id="wgChange">Change goal</button></div>
       <div class="wgbar${hit ? ' wgdone' : ''}" role="img" aria-label="${n} of ${g} days"><i style="width:${Math.min(100, Math.round(n / g * 100))}%"></i></div>
       <small>${hit ? 'Great work! Every extra day makes your English stronger.' : `${left} more day${left === 1 ? '' : 's'} to reach your goal.`}</small>`
    : `<span class="wgq">🎯 ${g ? 'Change my weekly goal:' : 'Pick a weekly goal:'}</span><div class="wgopts">${GOALS.map(x => `<button type="button" class="wgopt${x === g ? ' on' : ''}" data-goal="${x}">${x} days</button>`).join('')}</div>`;
  const c = $('#wkCount'); if (c) c.hidden = !!g;
  if ($('#wgChange')) $('#wgChange').onclick = () => drawGoal(true);
  el.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { ls('die_goal', b.dataset.goal); toast(`Your goal: ${b.dataset.goal} days a week 🎯`); drawGoal(); });
}
function nextSuggestions() {
  const out = [], L = lexs();
  const lx = L.findIndex(e => listenBest[e.id] === undefined); if (lx >= 0) out.push({icon: '🎧', text: `Listening: ${L[lx].title}`, href: `#/listening/${lx + 1}`});
  const ps = pronSecs().find(s => !pronBest[s.id]); if (ps) out.push({icon: '🗣️', text: `Pronounce: letter ${ps.id}`, href: `#/pronounce/${ps.id}`});
  for (const l of LEVELS) { const s = state.levels[l.id].lessons.find(s => !lessonsDone[s.id]); if (s) { out.push({icon: l.icon, text: `${l.name}: ${s.title}`, href: `#/lesson/${l.id}/${s.id}`}); break; } }
  return out;
}

/* ---- student: My progress ---- */
let stEditing = false;   // the student pressed "Change": the details form is open with the saved details in it (nothing is deleted until "Save")
function renderProgress(arrived) {
  if (arrived || !student) stEditing = false;
  const form = !student || stEditing, v = k => esc((student && student[k]) || '');
  const p = progressData(), idle = daysIdle(), col = pcol(p.overall), sk = streakInfo(), last7 = [...Array(7)].map((_, k) => { const d = new Date(Date.now() - (6 - k) * DAY); return {k: todayKey(d), l: 'SMTWTFS'[d.getDay()]}; });
  const week = last7.filter(d => activity.days && activity.days[d.k]).length, sugg = nextSuggestions();
  const bar = (label, pct, sub) => `<div class="brow"><span>${label}${sub ? ` <small>${sub}</small>` : ''}</span><div class="bt"><i style="width:${pct}%;background:${pcol(pct)}"></i></div><b>${pct}%</b></div>`;
  const idleT = idleText(idle), idleCap = idleT[0].toUpperCase() + idleT.slice(1);
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › My progress</div>
  <div class="banner photo" style="--img:url(photos/placement.jpg)"><div class="bi">📈</div><div><h1>${student ? 'Hello, ' + esc(student.name.split(' ')[0]) + '!' : 'My progress'}</h1>
    <p>See how much you have done, and what to practise next.</p></div></div>
  ${form ? `<div class="panel" id="stPanel" style="margin-top:16px"><h3 class="sec-t" style="font-size:24px">${student ? '✏️ Change your details' : '👤 Who are you?'}</h3>
    <p class="hint">${student ? 'Correct your name, class or email and press Save. Your progress stays as it is.' : 'Write your details once. Your teacher can then see your progress and send you a reminder email if you forget to practise.'}</p>
    <form id="stForm" class="form" novalidate>
      <label class="field"><span>Your name</span><input class="in" name="name" maxlength="80" autocomplete="name" value="${v('name')}" placeholder="e.g. Sara Ahmed"></label>
      <label class="field"><span>Class</span><input class="in" name="cls" maxlength="40" value="${v('cls')}" placeholder="e.g. Grade 5 – A"></label>
      <label class="field"><span>Email</span><input class="in" name="email" type="email" maxlength="120" autocomplete="email" value="${v('email')}" placeholder="e.g. sara@example.com"></label>
      <div class="err" id="stErr" role="alert"></div><div class="row"><button class="btn sun" type="submit">Save</button>${student ? '<button class="btn ghost" type="button" id="stCancel">Cancel</button>' : ''}</div></form></div>` : ''}
  ${idle !== null && idle >= 3 ? `<div class="idle">⏰ <div><b>You haven't practised for ${idle} days.</b> Let's do a quick exercise today — just 5 minutes!</div>${sugg[0] ? `<a class="btn sun sm" href="${sugg[0].href}">Start now →</a>` : ''}</div>` : ''}
  <div class="panel pgtop" style="margin-top:16px">
    <div class="ring" role="img" aria-label="Your progress: ${p.overall}%" style="--p:${p.overall};--rc:${col}"><span>${p.overall}%</span></div>
    <div class="pghd"><h2 class="baloo">Your progress</h2><p class="hint">Listening, Pronounce and Lessons together.</p></div>
    <div class="pgstats">
      <div class="pgst"><b>${p.done}</b><small>of ${p.total} activities done</small></div>
      <div class="pgst${sk.streak ? ' lit' : ''}"><b><i>🔥</i> ${sk.streak}</b><small>day${sk.streak === 1 ? '' : 's'} in a row</small></div>
      <div class="pgst"><b class="w">${idleCap}</b><small>last practised</small></div>
    </div>
    <div class="grow pgmore">
      <div class="wk">${last7.map(d => `<span class="${activity.days && activity.days[d.k] ? 'on' : sk.rests.includes(d.k) ? 'rest' : ''}" title="${sk.rests.includes(d.k) ? 'Rest day' : d.k}">${sk.rests.includes(d.k) ? '💤' : d.l}</span>`).join('')}<small>${week} of the last 7 days</small></div>
      <div class="wgoal" id="wgoal"></div>
      <p class="pgstreak">🔥 <b>${sk.streak}</b> day${sk.streak === 1 ? '' : 's'} in a row${sk.restSaved ? ' — your rest day kept it safe. Practise today!' : sk.streak && !sk.today ? ' — practise today to keep it!' : sk.streak ? ' — well done!' : ' — finish one activity today to start your streak.'}</p>
      ${milesHTML(sk)}${restHTML(sk)}
      ${p.placement ? `<p class="pgplace">🎯 Placement test level: <b>${esc(p.placement)}</b></p>` : ''}
    </div>
  </div>
  ${mistLinkHTML()}${mixLinkHTML()}
  <div class="pggrid">
    <div class="panel"><h3 class="sec-t" style="font-size:22px">🎧 Listening <span style="color:${pcol(p.listening)}">${p.listening}%</span></h3>
      <p class="hint" style="margin:0 0 10px">${p.listenDone} of ${p.listenTotal} exercises done</p>
      <div class="bars">${p.groups.map(g => bar(esc(g.name), g.pct, `${g.done} of ${g.total} done`)).join('')}</div></div>
    <div class="panel"><h3 class="sec-t" style="font-size:22px">🗣️ Pronounce <span style="color:${pcol(p.pronounce)}">${p.pronounce}%</span></h3>
      <p class="hint" style="margin:0 0 10px">${p.pronDone} of ${p.pronTotal} letters tested</p>
      <div class="pgletters">${pronSecs().map(s => { const b = pronBest[s.id]; return `<a href="#/pronounce/${s.id}" style="background:${b ? pcol(b.best) : '#eef0f6'};color:${b ? '#fff' : 'var(--muted)'}" title="${b ? b.best + '%' : 'not tested'}">${s.id}</a>`; }).join('')}</div></div>
    <div class="panel"><h3 class="sec-t" style="font-size:22px">🎤 Speaking ${spHistory.length ? `<span style="color:${pcol(Math.max(...spHistory.map(r => r.A.scores.overall)))}">${Math.max(...spHistory.map(r => r.A.scores.overall))}%</span>` : ''}</h3>
      <p class="hint" style="margin:0 0 10px">${spHistory.length ? `${spHistory.length} recording${spHistory.length === 1 ? '' : 's'} · best score` : 'No recordings yet'}</p>
      <div class="bars">${spHistory.slice(0, 3).map(r => bar(esc(r.task.title), r.A.scores.overall, new Date(r.date).toLocaleDateString())).join('')}</div>
      <a class="btn sm ghost" href="#/speaking" style="margin-top:6px">🎤 Test my speaking →</a></div>
    <div class="panel"><h3 class="sec-t" style="font-size:22px">📚 Lessons <span style="color:${pcol(p.lessons)}">${p.lessons}%</span></h3>
      <p class="hint" style="margin:0 0 10px">${p.lessonsDone} of ${p.lessonsTotal} lessons finished</p>
      <div class="bars">${LEVELS.map(l => { const ids = state.levels[l.id].lessons.map(s => s.id); if (!ids.length) return ''; const d = ids.filter(id => lessonsDone[id]).length;
        return bar(`${l.icon} ${l.name}`, Math.round(d / ids.length * 100), `${d} of ${ids.length}`); }).join('')}</div></div>
  </div>
  ${sugg.length ? `<div class="panel" style="margin-top:16px"><h3 class="sec-t" style="font-size:22px">👉 Practise next</h3><div class="row" style="margin-top:8px">${sugg.map(s => `<a class="btn ghost" href="${s.href}">${s.icon} ${esc(s.text)}</a>`).join('')}</div></div>` : ''}
  <p class="lbl" id="syncLine" aria-live="polite" style="margin:14px 0 4px">${syncLineHTML()}</p><p class="lbl" style="margin:0">
  ${student ? `👤 ${esc(student.name)} · ${esc(student.cls || '')} · ${esc(student.email)} ${stEditing ? '' : '<button class="btn sm ghost" id="stEdit">✏️ Change</button>'}` : ''}</p>`;
  drawSyncLine(); drawGoal();
  const f = $('#stForm');
  if (f) f.onsubmit = async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)), one = t => String(t || '').trim().replace(/\s+/g, ' '), s = {name: one(d.name), cls: one(d.cls), email: d.email.trim().toLowerCase()};
    const err = s.name.length < 2 ? 'Please write your name.' : !s.cls ? 'Please write your class.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) ? 'Please write a correct email address.' : '';
    if (err) { $('#stErr').textContent = err; return; }
    student = {...s, id: (student && student.id) || uid()}; stEditing = false; await DB.put('kv', 'student', student); syncProgress(); renderProgress(); window.scrollTo(0, 0); toast('Saved! 🎉');
  };
  // "Change" opens the form with the saved details in it. The student stays registered until new details are saved ("Cancel" keeps the old ones).
  if ($('#stEdit')) $('#stEdit').onclick = () => { stEditing = true; renderProgress(); const p = $('#stPanel'); p.querySelector('input').focus({preventScroll: true}); window.scrollTo({top: Math.max(0, p.getBoundingClientRect().top + scrollY - 96), behavior: 'instant'}); };
  if ($('#stCancel')) $('#stCancel').onclick = () => { stEditing = false; renderProgress(); };
}

/* ---- teacher: Students ---- */
let classList = null, classErr = '', classRetry = false, classLoading = false, voiceErr = false, voiceLatest = null;   // voiceLatest: email → that student's newest voice level test (null = not loaded)
let stCls = '', stSort = 'recent';                          // the teacher's choice of class and order (kept until the page is closed)
let voiceHist = {}, voiceOpen = new Set();                  // voiceHist: email → all of that student's voice tests, or 'loading'; voiceOpen: the lists that are open
async function loadClass() {
  const url = syncUrl(); classErr = ''; classRetry = false; voiceErr = false; voiceLatest = null; voiceHist = {}; voiceOpen = new Set();
  if (!url) { classList = null; return; }
  if (!tkey) { classErr = 'Write your teacher key in the box below to see the students.'; classList = null; return; }
  classLoading = true; if (location.hash === '#/students' && mode === 'teacher') renderStudents();
  try { const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(tkey)); const d = await r.json();
    if (!d.ok) { classErr = d.error === 'wrong key' ? 'The teacher key is not correct. Write it again in the box below.' : d.error === 'server not configured' ? 'The class server is not set up yet: add the Supabase keys in Vercel (see README).' : 'The class server did not answer correctly.';
      classRetry = d.error !== 'wrong key' && d.error !== 'server not configured'; classList = null; classLoading = false; return; }
    classList = d.students || [];
    if (url === BUILT_IN_SERVER) await loadVoiceLatest();
  } catch (e) { classErr = 'Could not reach the class server. ' + netWhy() + (url === BUILT_IN_SERVER ? '' : ' Check the web app address too.'); classRetry = true; classList = null; }
  classLoading = false;
}
// Voice level test results are extra: if they cannot be loaded, the Students table simply has no "Voice test" column.
async function loadVoiceLatest() {
  try { const r = await fetch(VT_API, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({action: 'latest', key: tkey})}), d = await r.json();
    if (!d.ok || !Array.isArray(d.tests)) { voiceErr = true; return; }
    voiceLatest = {}; voiceErr = false; d.tests.forEach(t => { if (t && t.email) voiceLatest[String(t.email).toLowerCase()] = t; });
  } catch (e) { voiceErr = true; /* the table still shows the progress, with a "Try again" line under it */ }
}
// All the voice tests of one student (teacher key needed), newest first. Null = could not be loaded.
async function loadVoiceHistory(email) {
  try { const r = await fetch(VT_API, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({action: 'history', key: tkey, email})}), d = await r.json();
    return d.ok && Array.isArray(d.tests) ? d.tests : null;
  } catch (e) { return null; }
}
function voiceHistHtml(email) {
  const h = voiceHist[email], n = x => Math.max(0, Math.min(100, Math.round(+x || 0)));
  if (!voiceOpen.has(email) || !h) return '';
  if (h === 'loading') return '<div class="vhist"><span class="lbl"><span class="spin sm"></span> Loading the tests…</span></div>';
  if (h === 'error') return `<div class="vhist vherr"><span class="lbl">⚠️ Could not load the older tests. ${esc(netWhy())}</span> <button class="btn sm" data-vh="${esc(email)}" data-again="1">↻ Try again</button></div>`;
  if (!h.length) return '<div class="vhist"><span class="lbl">No saved tests.</span></div>';
  return `<div class="vhist">${h.map(t => { const d = Date.parse(t.date), ok = /^[a-z0-9]{10,40}$/.test(t.id || ''),
    inner = `<span class="vhd">${d ? new Date(d).toLocaleDateString() : ''}</span><span class="chip" style="background:${pcol(n(t.overall))}">${esc(t.level || '?')} · ${n(t.overall)}%</span>${ok ? '<span class="lbl">View →</span>' : ''}`;
    return ok ? `<a class="vhrow" href="#/voicetest/result/${t.id}" title="Open the full result">${inner}</a>` : `<div class="vhrow">${inner}</div>`; }).join('')}</div>`;
}
function voiceCell(r) {
  const email = String(r.email || '').toLowerCase(), v = voiceLatest && voiceLatest[email], n = x => Math.max(0, Math.min(100, Math.round(+x || 0)));
  if (!v) return '<span class="lbl">Not taken</span>';
  const count = Math.max(1, Math.round(+v.count || 1)), open = voiceOpen.has(email);
  const badge = `<span class="chip" style="background:${pcol(n(v.overall))}">${esc(v.level || '?')} · ${n(v.overall)}%</span>`, d = Date.parse(v.date);
  return `${/^[a-z0-9]{10,40}$/.test(v.id || '') ? `<a class="vlink" href="#/voicetest/result/${v.id}" title="Open the full result">${badge} <span class="lbl">View →</span></a>` : badge}
    <div class="lbl">Speaking ${n(v.speaking)}% · Pronunciation ${n(v.pronunciation)}% · Repeating ${n(v.repeating)}%</div>
    <div class="lbl">${d ? new Date(d).toLocaleDateString() : ''}</div>
    ${count > 1 ? `<button class="btn sm ghost vhbtn" data-vh="${esc(email)}" aria-expanded="${open}">${open ? 'Hide the list ▴' : `Show all ${count} tests ▾`}</button>${voiceHistHtml(email)}` : ''}`;
}
// Class filter and order of the Students table.
function studentRows(rows) {
  const out = stCls ? rows.filter(r => String(r.cls || '').trim() === stCls) : rows.slice();
  const name = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, {sensitivity: 'base', numeric: true}),
    recent = (a, b) => (Date.parse(b.lastActive) || 0) - (Date.parse(a.lastActive) || 0),
    voice = r => { const v = voiceLatest && voiceLatest[String(r.email || '').toLowerCase()]; return v ? +v.overall || 0 : -1; };
  const by = {recent, name, cls: (a, b) => !String(a.cls || '').trim() - !String(b.cls || '').trim() || String(a.cls || '').trim().localeCompare(String(b.cls || '').trim(), undefined, {sensitivity: 'base', numeric: true}) || name(a, b),
    high: (a, b) => b.overall - a.overall || name(a, b), low: (a, b) => a.overall - b.overall || name(a, b), idle: (a, b) => -recent(a, b), voice: (a, b) => voice(b) - voice(a) || name(a, b)};
  return out.sort(by[stSort] || recent);
}
function renderStudents() {
  if (mode !== 'teacher') { app.innerHTML = `<div class="panel empty"><div class="e">🧑‍🏫</div>This page is for teachers. Switch to Teacher mode at the top.</div>`; return; }
  const me = student ? [{...student, ...progressData(), lastActive: activity.last ? new Date(activity.last).toISOString() : '', here: true}] : [];
  const pc = x => Math.max(0, Math.min(100, Math.round(+x || 0)));   // a percentage, whatever the server sent
  const rows = (classList || []).map(r => ({...r, overall: pc(r.overall), listening: pc(r.listening), pronounce: pc(r.pronounce), lessons: pc(r.lessons)}));
  if (student && !rows.some(r => String(r.email).toLowerCase() === student.email)) rows.push(...me);
  const classes = [...new Set(rows.map(r => String(r.cls || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base', numeric: true}));
  if (stCls && !classes.includes(stCls)) stCls = '';
  if (stSort === 'voice' && !voiceLatest) stSort = 'recent';
  const all = rows.length, shown = studentRows(rows);
  const sorts = [['recent', 'Last practised — newest first'], ['idle', 'Last practised — longest ago first'], ['name', 'Name (A–Z)'], ['cls', 'Class, then name'], ['high', 'Progress — highest first'], ['low', 'Progress — lowest first']].concat(voiceLatest ? [['voice', 'Voice test — highest first']] : []);
  const st = r => { const t = Date.parse(r.lastActive), d = t ? Math.max(0, Math.floor((Date.now() - t) / DAY)) : null;   // an unreadable date = not started; a clock that is ahead = today
    return d === null ? '<span class="chip grey">Not started</span>' : d <= 1 ? `<span class="chip g">${idleText(d)}</span>` : d < 7 ? `<span class="chip y">${d} days ago</span>` : `<span class="chip r">${d} days ago</span>`; };
  const mail = r => `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent('Time to practise English! 🎧')}&body=${encodeURIComponent(`Hello ${r.name},\n\nWe miss you in Do it English! Please open the page and do a short listening or pronunciation exercise today.\n\nYour progress: ${r.overall}%\n\nSee you soon!`)}`;
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Students</div>
  <div class="banner photo" style="--img:url(photos/students.jpg)"><div class="bi">🧑‍🏫</div><div><h1>Students' progress</h1><p>See every student's progress and when they last practised.</p></div></div>
  <div class="panel" style="margin-top:16px">
    <div class="row" style="justify-content:space-between"><h3 class="sec-t" style="font-size:24px">📊 Students ${all ? `(${shown.length < all ? shown.length + ' of ' + all : all})` : ''}</h3>
      ${syncUrl() && !classLoading ? '<button class="btn sm" id="refresh">↻ Refresh</button>' : ''}</div>
    ${classLoading ? loadBox('Loading your students…') : classErr ? (classRetry ? stateBox(navigator.onLine === false ? '📡' : '⚠️', 'The students could not be loaded', classErr, 'stRetry') : `<div class="warn">⚠️ ${esc(classErr)}</div>`) : ''}
    ${!all ? (classLoading || classErr ? '' : `<div class="empty"><div class="e">👥</div>${syncUrl() ? 'No students yet. Students appear here after they write their details on the “My progress” page.' : 'Connect the class server below to see all your students here.'}</div>`) : `
    ${all > 1 ? `<div class="stbar">
      ${classes.length > 1 ? `<label><span>Class</span><select class="in" id="stCls"><option value="">All classes (${all})</option>${classes.map(c => `<option value="${esc(c)}"${c === stCls ? ' selected' : ''}>${esc(c)} (${rows.filter(r => String(r.cls || '').trim() === c).length})</option>`).join('')}</select></label>` : ''}
      <label><span>Order</span><select class="in" id="stSort">${sorts.map(([v, t]) => `<option value="${v}"${v === stSort ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    </div>` : ''}
    <div class="tablewrap"><table class="rtable cards"><thead><tr><th>Student</th><th>Class</th><th>Progress</th><th>Listening</th><th>Pronounce</th><th>Lessons</th>${voiceLatest ? '<th>Voice test</th>' : ''}<th>Last practised</th><th></th></tr></thead><tbody>
      ${shown.map(r => `<tr><td class="sname"><b>${esc(r.name)}</b>${r.here ? ' <span class="lbl">(this device)</span>' : ''}<div class="lbl">${esc(r.email || '')}</div></td><td data-l="Class">${esc(r.cls || '')}</td>
        <td data-l="Progress"><div class="minibar"><i style="width:${r.overall}%;background:${pcol(r.overall)}"></i></div><b style="color:${pcol(r.overall)}">${r.overall}%</b></td>
        <td data-l="Listening">${r.listening}%</td><td data-l="Pronounce">${r.pronounce}%</td><td data-l="Lessons">${r.lessons}%</td>${voiceLatest ? `<td class="vcell" data-l="Voice test" data-e="${esc(String(r.email || '').toLowerCase())}">${voiceCell(r)}</td>` : ''}<td data-l="Last practised">${st(r)}${r.lastReminder ? `<div class="lbl">reminder sent ${new Date(r.lastReminder).toLocaleDateString()}</div>` : ''}</td>
        <td class="smail">${r.email ? `<a class="btn sm ghost" href="${mail(r)}" title="Write a reminder email" aria-label="Write a reminder email to ${esc(r.name)}">✉️<span> Send a reminder</span></a>` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    ${voiceErr && !classLoading ? `<div class="vnote"><span>⚠️ The voice test results could not be loaded. ${esc(netWhy())}</span> <button class="btn sm" id="voiceRetry">↻ Try again</button></div>` : ''}`}
    <p class="lbl" style="margin:10px 0 0">Green = practised in the last day · Yellow = 2–6 days · Red = 7 days or more. ✉️ opens your email app with a reminder ready to send.${voiceLatest ? ' Voice test = the student\'s newest voice level test; “View” opens the full result, and “Show all tests” lists the older ones.' : ''}</p>
  </div>
  <div class="panel" style="margin-top:16px">
    <h3 class="sec-t" style="font-size:24px">🔌 Class server & reminder emails</h3>
    <p class="hint">Without the class server, each student's progress stays on their own device. This website has its own class server (Supabase database): leave the address empty to use it, and write the teacher key that is set as <code>TEACHER_KEY</code> in Vercel. You then see every student here.</p>
    <div class="setg" style="grid-template-columns:2fr 1fr auto auto">
      <label class="field"><span>Class server address (empty = this website's own server)</span><input class="in" id="srvUrl" value="${esc((state.sync && state.sync.url) || '')}" placeholder="${esc(DEFAULT_SERVER || 'https://script.google.com/macros/s/…/exec')}"></label>
      <label class="field"><span>Teacher key</span><input class="in" id="srvKey" type="password" value="${esc(tkey)}" placeholder="your secret key"></label>
      <button class="btn sun" id="srvSave">Save</button><button class="btn ghost" id="srvTest" title="Checks that the Claude key for Test your speaking works">🤖 Test speaking AI</button>
    </div>
    <p class="lbl" style="margin:8px 0 0">Students' pages on this website send their progress to its own server automatically. The teacher key stays only on this computer.</p>
    <details class="setup"><summary>📋 Older option: a Google Sheet as the class server (not needed on this website)</summary>
      <ol>
        <li>Open <b>Google Sheets</b> (sheets.google.com) with your Google account and create a <b>new blank spreadsheet</b>. Call it “Do it English students”.</li>
        <li>In the menu choose <b>Extensions → Apps Script</b>.</li>
        <li>Delete everything in the code box and paste the script below (<b>Copy the script</b> button).</li>
        <li>In the script, change <code>TEACHER_KEY</code> to your own secret word, and <code>REMIND_AFTER_DAYS</code> if you want (3 days now). Click 💾 <b>Save</b>.</li>
        <li>At the top choose the function <b>setup</b> and click ▶ <b>Run</b>. Google asks for permission — click <b>Review permissions</b>, choose your account, <b>Advanced → Go to project</b>, <b>Allow</b>. This creates the Students sheet and a daily reminder at 5 pm.</li>
        <li>Click <b>Deploy → New deployment</b>. Type: <b>Web app</b>. Execute as: <b>Me</b>. Who has access: <b>Anyone</b>. Click <b>Deploy</b> and copy the <b>Web app URL</b>.</li>
        <li>Paste that URL and your teacher key in the boxes above and click <b>Save</b>. Then export the course file for your students.</li>
        <li><b>Optional — real AI feedback for “Test your speaking”:</b> create an API key at <b>console.anthropic.com</b> (it needs a little credit; each feedback costs a few cents with the best model). In Apps Script click the <b>⚙ Project Settings</b> icon → <b>Script properties</b> → <b>Add script property</b> → name <code>ANTHROPIC_API_KEY</code>, value = your key → <b>Save</b>. Never paste the key into the page or into the script text. Then press <b>🤖 Test speaking AI</b> above. <i>If you changed the script after deploying: Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy.</i></li>
      </ol>
      <div class="row"><button class="btn sm teal" id="copyGs">📋 Copy the script</button><span class="lbl">The emails are sent from your Gmail. Students' names, classes and emails are kept in your own Google Sheet.</span></div>
      <textarea class="in gs" readonly id="gsCode">${esc(GS_CODE)}</textarea>
    </details>
  </div>`;
  if ($('#stCls')) $('#stCls').onchange = () => { stCls = $('#stCls').value; renderStudents(); $('#stCls').focus(); };
  if ($('#stSort')) $('#stSort').onchange = () => { stSort = $('#stSort').value; renderStudents(); $('#stSort').focus(); };
  const tbl = $('.rtable.cards');
  if (tbl) tbl.onclick = async e => {
    const b = e.target.closest('[data-vh]'); if (!b) return;
    const email = b.dataset.vh, draw = () => { const td = [...document.querySelectorAll('td.vcell')].find(x => x.dataset.e === email); if (td) td.innerHTML = voiceCell({email}); };
    if (voiceOpen.has(email) && !b.dataset.again) { voiceOpen.delete(email); if (voiceHist[email] === 'error') delete voiceHist[email]; return draw(); }
    voiceOpen.add(email);
    if (Array.isArray(voiceHist[email])) return draw();
    if (voiceHist[email] === 'loading') return draw();
    voiceHist[email] = 'loading'; draw();
    const list = await loadVoiceHistory(email);
    voiceHist[email] = list || 'error';   // the "Try again" button is inside the list
    draw();
  };
  const reload = async () => { await loadClass(); if (location.hash === '#/students') renderStudents(); };
  if ($('#refresh')) $('#refresh').onclick = reload;
  if ($('#stRetry')) $('#stRetry').onclick = reload;
  if ($('#voiceRetry')) $('#voiceRetry').onclick = async () => { const b = $('#voiceRetry'); b.disabled = true; b.textContent = 'Loading…'; await loadVoiceLatest(); if (location.hash === '#/students') renderStudents(); if (voiceErr) toast('Still no answer. ' + netWhy()); };
  $('#srvSave').onclick = async () => {
    const url = $('#srvUrl').value.trim(); tkey = $('#srvKey').value.trim();
    if (url && url !== BUILT_IN_SERVER && !/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return toast('Leave the address empty, or write a Google Apps Script web app address');
    state.sync = {url}; await save(); await DB.put('kv', 'tkey', tkey);
    await loadClass(); renderStudents(); toast(syncUrl() ? (classErr ? 'Saved — but: ' + classErr : 'Connected ✅') : 'Class server removed');
  };
  $('#srvTest').onclick = async () => {
    if (!syncUrl() || !tkey) return toast('Save the web app address and your teacher key first');
    toast('Testing the AI…');
    try { const r = await fetch(syncUrl(), {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({action: 'speakingtest', key: tkey})}), d = await r.json();
      toast(d.ok ? `✅ The speaking AI works (${d.model})` : '⚠️ ' + ({'no key': 'Add ANTHROPIC_API_KEY on the server first (Vercel → Settings → Environment Variables)', 'wrong key': 'The teacher key is not correct'}[d.error] || d.error));
    } catch (e) { toast('⚠️ Could not reach the class server.'); }
  };
  $('#copyGs').onclick = () => { const t = $('#gsCode'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { document.execCommand('copy'); } toast('Script copied 📋'); };
}


