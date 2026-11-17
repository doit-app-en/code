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
  activity.last = Date.now(); activity.days = activity.days || {}; activity.days[todayKey()] = (activity.days[todayKey()] || 0) + 1;
  await DB.put('kv', 'activity', activity); syncProgress();
}
async function markLessonDone(id) { if (!lessonsDone[id]) { lessonsDone[id] = Date.now(); await DB.put('kv', 'lessonsDone', lessonsDone); } onActivity(); }
function syncProgress() {
  clearTimeout(syncT);
  syncT = setTimeout(async () => {
    const url = syncUrl(); if (!url || !student || !student.email) return;
    try {
      await fetch(url, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify({action: 'progress', student, progress: progressData(), lastActive: activity.last ? new Date(activity.last).toISOString() : ''})});
      activity.synced = Date.now(); await DB.put('kv', 'activity', activity);
    } catch (e) { /* offline: try again next time */ }
  }, 1500);
}
// Practice streak and this week (Sunday first), from the per-day activity count already saved on this device.
// A day counts when at least one activity was finished. Today not done yet does not break the streak.
function streakInfo() {
  const days = activity.days || {}, has = d => !!days[todayKey(d)], now = new Date(), at = n => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  let streak = 0, n = has(now) ? 0 : 1; while (n < 3660 && has(at(n))) { streak++; n++; }
  const dow = now.getDay(), week = [...Array(7)].map((_, i) => ({l: 'SMTWTFS'[i], on: i <= dow && has(at(dow - i)), today: i === dow}));
  return {streak, today: has(now), week, weekDays: week.filter(d => d.on).length, total: Object.keys(days).length};
}
const weekDotsHTML = s => `<div class="wk">${s.week.map(d => `<span class="${d.on ? 'on' : ''}${d.today ? ' now' : ''}">${d.l}</span>`).join('')}</div>`;
function nextSuggestions() {
  const out = [], L = lexs();
  const lx = L.findIndex(e => listenBest[e.id] === undefined); if (lx >= 0) out.push({icon: '🎧', text: `Listening: ${L[lx].title}`, href: `#/listening/${lx + 1}`});
  const ps = pronSecs().find(s => !pronBest[s.id]); if (ps) out.push({icon: '🗣️', text: `Pronounce: letter ${ps.id}`, href: `#/pronounce/${ps.id}`});
  for (const l of LEVELS) { const s = state.levels[l.id].lessons.find(s => !lessonsDone[s.id]); if (s) { out.push({icon: l.icon, text: `${l.name}: ${s.title}`, href: `#/lesson/${l.id}/${s.id}`}); break; } }
  return out;
}

/* ---- student: My progress ---- */
function renderProgress() {
  const p = progressData(), idle = daysIdle(), col = pcol(p.overall), sk = streakInfo(), last7 = [...Array(7)].map((_, k) => { const d = new Date(Date.now() - (6 - k) * DAY); return {k: todayKey(d), l: 'SMTWTFS'[d.getDay()]}; });
  const week = last7.filter(d => activity.days && activity.days[d.k]).length, sugg = nextSuggestions();
  const bar = (label, pct, sub) => `<div class="brow"><span>${label}</span><div class="bt"><i style="width:${pct}%;background:${pcol(pct)}"></i></div><b>${pct}%</b></div>${sub ? `<div class="lbl" style="margin:-4px 0 6px">${sub}</div>` : ''}`;
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › My progress</div>
  <div class="banner photo" style="--img:url(photos/placement.jpg)"><div class="bi">📈</div><div><h1>${student ? 'Hello, ' + esc(student.name.split(' ')[0]) + '!' : 'My progress'}</h1>
    <p>See how much you have done, and what to practise next.</p></div></div>
  ${!student ? `<div class="panel" style="margin-top:16px"><h3 class="sec-t" style="font-size:24px">👤 Who are you?</h3>
    <p class="hint">Write your details once. Your teacher can then see your progress and send you a reminder email if you forget to practise.</p>
    <form id="stForm" class="form" novalidate>
      <label class="field"><span>Your name</span><input class="in" name="name" placeholder="e.g. Sara Ahmed"></label>
      <label class="field"><span>Class</span><input class="in" name="cls" placeholder="e.g. Grade 5 – A"></label>
      <label class="field"><span>Email</span><input class="in" name="email" type="email" placeholder="e.g. sara@example.com"></label>
      <div class="err" id="stErr"></div><div><button class="btn sun" type="submit">Save</button></div></form></div>` : ''}
  ${idle !== null && idle >= 3 ? `<div class="idle">⏰ <div><b>You haven't practised for ${idle} days.</b> Let's do a quick exercise today — just 5 minutes!</div>${sugg[0] ? `<a class="btn sun sm" href="${sugg[0].href}">Start now →</a>` : ''}</div>` : ''}
  <div class="panel pgtop" style="margin-top:16px">
    <div class="ring" style="--p:${p.overall};--rc:${col};width:170px;height:170px"><span style="width:132px;height:132px;font-size:42px">${p.overall}%</span></div>
    <div class="grow">
      <h2 class="baloo" style="margin:0;font-size:30px;color:var(--navy)">Your progress: <span style="color:${col}">${p.overall}%</span></h2>
      <p class="hint" style="margin:2px 0 10px">${p.done} of ${p.total} activities done · Last practised: <b>${idleText(idle)}</b></p>
      <div class="wk">${last7.map(d => `<span class="${activity.days && activity.days[d.k] ? 'on' : ''}" title="${d.k}">${d.l}</span>`).join('')}<small>${week} of the last 7 days</small></div>
      <p class="pgstreak">🔥 <b>${sk.streak}</b> day${sk.streak === 1 ? '' : 's'} in a row${sk.streak && !sk.today ? ' — practise today to keep it!' : sk.streak ? ' — well done!' : ' — finish one activity today to start your streak.'}</p>
      ${p.placement ? `<p style="margin:10px 0 0;font-weight:700">🎯 Placement test level: <b>${esc(p.placement)}</b></p>` : ''}
    </div>
  </div>
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
  <p class="lbl" style="margin-top:14px">${syncUrl() && student ? `✅ Your progress is shared with your teacher${activity.synced ? ' (last update ' + new Date(activity.synced).toLocaleString() + ')' : ''}.` : student ? 'Your progress is saved on this device. Your teacher has not connected the class server yet.' : 'Your progress is saved on this device.'}
  ${student ? ` · 👤 ${esc(student.name)} · ${esc(student.email)} <button class="btn sm ghost" id="stEdit">✏️ Change</button>` : ''}</p>`;
  const f = $('#stForm');
  if (f) f.onsubmit = async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)), s = {name: d.name.trim(), cls: d.cls.trim(), email: d.email.trim().toLowerCase()};
    const err = s.name.length < 2 ? 'Please write your name.' : !s.cls ? 'Please write your class.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email) ? 'Please write a correct email address.' : '';
    if (err) { $('#stErr').textContent = err; return; }
    student = {...s, id: uid()}; await DB.put('kv', 'student', student); syncProgress(); renderProgress(); toast('Saved! 🎉');
  };
  if ($('#stEdit')) $('#stEdit').onclick = async () => { student = null; await DB.put('kv', 'student', null); renderProgress(); };
}

/* ---- teacher: Students ---- */
let classList = null, classErr = '', voiceLatest = null;   // voiceLatest: email → that student's newest voice level test (null = not loaded)
let stCls = '', stSort = 'recent';                          // the teacher's choice of class and order (kept until the page is closed)
let voiceHist = {}, voiceOpen = new Set();                  // voiceHist: email → all of that student's voice tests, or 'loading'; voiceOpen: the lists that are open
async function loadClass() {
  const url = syncUrl(); classErr = ''; voiceLatest = null; voiceHist = {}; voiceOpen = new Set();
  if (!url) { classList = null; return; }
  if (!tkey) { classErr = 'Write your teacher key to see the students.'; classList = null; return; }
  try { const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(tkey)); const d = await r.json();
    if (!d.ok) { classErr = d.error === 'wrong key' ? 'The teacher key is not correct.' : d.error === 'server not configured' ? 'The class server is not set up yet: add the Supabase keys in Vercel (see README).' : 'The class server did not answer correctly.'; classList = null; return; }
    classList = d.students || [];
    if (url === BUILT_IN_SERVER) await loadVoiceLatest();
  } catch (e) { classErr = 'Could not reach the class server. Check the internet connection and the web app address.'; classList = null; }
}
// Voice level test results are extra: if they cannot be loaded, the Students table simply has no "Voice test" column.
async function loadVoiceLatest() {
  try { const r = await fetch(VT_API, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({action: 'latest', key: tkey})}), d = await r.json();
    if (!d.ok || !Array.isArray(d.tests)) return;
    voiceLatest = {}; d.tests.forEach(t => { if (t && t.email) voiceLatest[String(t.email).toLowerCase()] = t; });
  } catch (e) { /* the table still shows the progress */ }
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
  if (h === 'loading') return '<div class="vhist"><span class="lbl">Loading…</span></div>';
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
  const rows = (classList || []).map(r => ({...r, overall: +r.overall || 0, listening: +r.listening || 0, pronounce: +r.pronounce || 0, lessons: +r.lessons || 0}));
  if (student && !rows.some(r => String(r.email).toLowerCase() === student.email)) rows.push(...me);
  const classes = [...new Set(rows.map(r => String(r.cls || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base', numeric: true}));
  if (stCls && !classes.includes(stCls)) stCls = '';
  if (stSort === 'voice' && !voiceLatest) stSort = 'recent';
  const all = rows.length, shown = studentRows(rows);
  const sorts = [['recent', 'Last practised — newest first'], ['idle', 'Last practised — longest ago first'], ['name', 'Name (A–Z)'], ['cls', 'Class, then name'], ['high', 'Progress — highest first'], ['low', 'Progress — lowest first']].concat(voiceLatest ? [['voice', 'Voice test — highest first']] : []);
  const st = r => { const d = r.lastActive ? Math.floor((Date.now() - Date.parse(r.lastActive)) / DAY) : null;
    return d === null ? '<span class="chip grey">Not started</span>' : d <= 1 ? `<span class="chip g">${idleText(d)}</span>` : d < 7 ? `<span class="chip y">${d} days ago</span>` : `<span class="chip r">${d} days ago</span>`; };
  const mail = r => `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent('Time to practise English! 🎧')}&body=${encodeURIComponent(`Hello ${r.name},\n\nWe miss you in Do it English! Please open the page and do a short listening or pronunciation exercise today.\n\nYour progress: ${r.overall}%\n\nSee you soon!`)}`;
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Students</div>
  <div class="banner photo" style="--img:url(photos/students.jpg)"><div class="bi">🧑‍🏫</div><div><h1>Students' progress</h1><p>See every student's progress and when they last practised.</p></div></div>
  <div class="panel" style="margin-top:16px">
    <div class="row" style="justify-content:space-between"><h3 class="sec-t" style="font-size:24px">📊 Students ${all ? `(${shown.length < all ? shown.length + ' of ' + all : all})` : ''}</h3>
      ${syncUrl() ? '<button class="btn sm" id="refresh">↻ Refresh</button>' : ''}</div>
    ${classErr ? `<div class="warn">⚠️ ${esc(classErr)}</div>` : ''}
    ${!all ? `<div class="empty"><div class="e">👥</div>${syncUrl() ? 'No students yet. Students appear here after they write their details on the “My progress” page.' : 'Connect the class server below to see all your students here.'}</div>` : `
    ${all > 1 ? `<div class="stbar">
      ${classes.length > 1 ? `<label><span>Class</span><select class="in" id="stCls"><option value="">All classes (${all})</option>${classes.map(c => `<option value="${esc(c)}"${c === stCls ? ' selected' : ''}>${esc(c)} (${rows.filter(r => String(r.cls || '').trim() === c).length})</option>`).join('')}</select></label>` : ''}
      <label><span>Order</span><select class="in" id="stSort">${sorts.map(([v, t]) => `<option value="${v}"${v === stSort ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
    </div>` : ''}
    <div class="tablewrap"><table class="rtable cards"><thead><tr><th>Student</th><th>Class</th><th>Progress</th><th>Listening</th><th>Pronounce</th><th>Lessons</th>${voiceLatest ? '<th>Voice test</th>' : ''}<th>Last practised</th><th></th></tr></thead><tbody>
      ${shown.map(r => `<tr><td class="sname"><b>${esc(r.name)}</b>${r.here ? ' <span class="lbl">(this device)</span>' : ''}<div class="lbl">${esc(r.email || '')}</div></td><td data-l="Class">${esc(r.cls || '')}</td>
        <td data-l="Progress"><div class="minibar"><i style="width:${r.overall}%;background:${pcol(r.overall)}"></i></div><b style="color:${pcol(r.overall)}">${r.overall}%</b></td>
        <td data-l="Listening">${r.listening}%</td><td data-l="Pronounce">${r.pronounce}%</td><td data-l="Lessons">${r.lessons}%</td>${voiceLatest ? `<td class="vcell" data-l="Voice test" data-e="${esc(String(r.email || '').toLowerCase())}">${voiceCell(r)}</td>` : ''}<td data-l="Last practised">${st(r)}${r.lastReminder ? `<div class="lbl">reminder sent ${new Date(r.lastReminder).toLocaleDateString()}</div>` : ''}</td>
        <td class="smail">${r.email ? `<a class="btn sm ghost" href="${mail(r)}" title="Write a reminder email" aria-label="Write a reminder email to ${esc(r.name)}">✉️<span> Send a reminder</span></a>` : ''}</td></tr>`).join('')}
    </tbody></table></div>`}
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
    if (voiceOpen.has(email)) { voiceOpen.delete(email); return draw(); }
    voiceOpen.add(email);
    if (Array.isArray(voiceHist[email])) return draw();
    if (voiceHist[email] === 'loading') return draw();
    voiceHist[email] = 'loading'; draw();
    const list = await loadVoiceHistory(email);
    if (list) voiceHist[email] = list; else { delete voiceHist[email]; voiceOpen.delete(email); toast('Could not load the older tests. Please try again.'); }
    draw();
  };
  if ($('#refresh')) $('#refresh').onclick = async () => { $('#refresh').textContent = '…'; await loadClass(); renderStudents(); };
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


