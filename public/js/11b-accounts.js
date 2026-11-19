/* ================= ACCOUNTS: welcome page, sign in, sign up, class codes, visitor ================= */
// The server (/api/auth) says whether accounts are switched on. When they are:
//   - nobody signed in  → the Welcome page first; a visitor can only open the sample (placement test + the first lesson of each level)
//   - signed in         → `student` (name, class, email) comes from the account, and every call to /api/* carries the session
//   - teacher accounts  → get the Student/Teacher switch and see the students of their own classes
// When accounts are off (no server, or the accounts migration has not been run) the site works as before: open, no Welcome page.
// The browser keeps only the session (access + refresh token) in localStorage. It never talks to Supabase itself.
const AUTH_API = '/api/auth', AUTH_PAGES = ['welcome', 'login', 'register', 'join'];
let auth = {on: false, google: false, session: null, me: null}, authRefreshing = null;
const authTeacher = () => !!auth.me && auth.me.role === 'teacher';
const authSignedIn = () => !!auth.me && !auth.me.needsProfile;
const authVisitor = () => auth.on && !auth.me;
const lsDel = k => { try { localStorage.removeItem(k); } catch (e) {} };
const lsJson = k => { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } };
const AUTH_ERR = {wrong: 'The email or the password is not correct.', exists: 'There is already an account with this email. Sign in instead.', email: 'Please write a correct email address.',
  password: 'The password needs 8 letters or numbers or more.', name: 'Please write your name.', 'bad code': 'This class code is not correct. Ask your teacher for the code.',
  limit: 'Too many tries. Please wait and try again later.', offline: 'Could not reach the website. Check your internet connection and try again.', 'accounts off': 'Accounts are not switched on yet.',
  'sign in': 'Please sign in again.', 'students only': 'Only students join a class.', 'teachers only': 'Only teachers make classes.'};
const authWhy = e => AUTH_ERR[e] || 'Something went wrong. Please try again.';
// The short name in the header and in "Welcome, …": the first word, or two when the first is a title or half a name ("Mr Ahmed", "Abdul Rahman").
const authFirst = n => { const w = String(n || '').trim().split(/\s+/); return w[1] && /^(mr|mrs|ms|miss|dr|prof|sir|teacher|abd|abdul|abdel|abu|umm|أ|د|الأستاذ|الاستاذ|أستاذ|استاذ|الأستاذة|الاستاذة|أستاذة|استاذة|الدكتور|دكتور|الدكتورة|دكتورة|عبد|أبو|ابو|أم|ام)\.?$/i.test(w[0]) ? w[0] + ' ' + w[1] : w[0]; };

/* ---------- talking to the server ---------- */
const rawFetch = window.fetch.bind(window);
// Every call to this website's own /api/* carries the session, so the server knows who is asking.
window.fetch = async (input, init) => {
  if (auth.session && typeof input === 'string' && input.startsWith('/api/')) {
    await authFresh();
    if (auth.session) init = {...(init || {}), headers: {...((init && init.headers) || {}), Authorization: 'Bearer ' + auth.session.access_token}};
  }
  return rawFetch(input, init);
};
async function authPost(body, withSession = true) {
  if (withSession && auth.session) await authFresh();
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await rawFetch(AUTH_API, {method: 'POST', signal: ctl.signal, headers: {'Content-Type': 'text/plain;charset=utf-8', ...(withSession && auth.session ? {Authorization: 'Bearer ' + auth.session.access_token} : {})}, body: JSON.stringify(body)});
    return await r.json();
  } catch (e) { return {ok: false, error: 'offline'}; } finally { clearTimeout(to); }
}
// A session lasts about an hour; shortly before it ends it is renewed with the refresh token.
// A refresh token works once. Every tab of this browser shares the session in localStorage, so before renewing, a tab looks whether
// another tab has renewed it already (and takes that one): renewing twice with the same token would sign the person out everywhere.
const authLock = fn => navigator.locks && navigator.locks.request ? navigator.locks.request('die_refresh', fn) : fn();
function authOther() { const k = lsJson('die_session'); if (!auth.session || !k || !k.refresh_token || k.refresh_token === auth.session.refresh_token) return false; auth.session = k; return true; }
const authDue = () => !!auth.session && (auth.session.expires_at || 0) * 1000 - Date.now() <= 90000;
function authFresh() {
  if (!authDue()) return Promise.resolve();
  if (!authRefreshing) authRefreshing = authLock(async () => {
    authOther(); if (!authDue()) return;   // another tab renewed it while this one waited
    const s = auth.session; if (!s) return;
    const d = await authPost({action: 'refresh', refresh_token: s.refresh_token}, false);
    if (auth.session !== s) return;   // signed out, or somebody else signed in, while the server was answering
    if (d.ok && d.session) authKeep(d.session, auth.me);
    else if (d.error === 'sign in' && !authOther()) { authForget(); authApply(); await authData(); toast('Please sign in again'); if (!AUTH_PAGES.includes((location.hash || '').replace(/^#\/?/, '').split('/')[0])) render(); }
  }).catch(() => {}).then(() => { authRefreshing = null; });
  return authRefreshing;
}
// The time a session ends is counted on this device's own clock from "expires_in" (a school computer's clock may be hours wrong).
function authKeep(session, me) {
  if (session && session.expires_in) session = {access_token: session.access_token, refresh_token: session.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (+session.expires_in || 3600)};
  auth.session = session; auth.me = me || null; ls('die_session', JSON.stringify(session)); if (me) ls('die_me', JSON.stringify(me)); else lsDel('die_me');
}
function authForget() { auth.session = null; auth.me = null; lsDel('die_session'); lsDel('die_me'); }

/* ---------- each account keeps its own saved practice on this device ---------- */
// The rest of the site always reads and writes a student's practice under the same IndexedDB keys (the list in MINE) and the two
// localStorage keys in MINE_LS. IndexedDB 'owner' ({id}: an account id, or 'visitor') says whose practice is under those keys now.
// When somebody else signs in, that set is put away whole under 'mine::<account id>' and the newcomer's own set (or an empty one)
// is laid in its place; signing out leaves an empty visitor set. Nothing is deleted: a put-away set waits for its owner.
//   - a device with practice from before accounts (no 'owner' yet) keeps it, and the first account that signs in there gets it;
//   - a visitor who tried the sample and then signs in for the first time on this device keeps what they did.
// A new kind of saved practice needs a line in MINE and in mineLoad(), or two students on one computer would share it.
const MINE = {results: () => [], pron: () => ({}), pronHeard: () => ({}), listenById: () => ({}), activity: () => ({last: null, days: {}}), lessonsDone: () => ({}),
  mistakes: () => ({}), mixBest: () => ({best: 0, plays: 0}), speakHistory: () => [], voiceHistory: () => [], voiceSeen: () => null};
const MINE_LS = ['die_placed', 'die_goal'];
// Reads the practice under the usual keys into the page (at start-up, and after the set was changed for another person).
async function mineLoad() {
  const g = async k => (await DB.get('kv', k)) || MINE[k]();
  results = await g('results'); pronBest = await g('pron'); for (const k in pronHeard) delete pronHeard[k]; loadHeard(await g('pronHeard'));
  listenBest = await g('listenById'); activity = await g('activity'); lessonsDone = await g('lessonsDone'); mistakes = await g('mistakes'); mixBest = await g('mixBest');
  spHistory = await g('speakHistory'); await Promise.all(spHistory.map(r => loadMedia(r.media)));
  vtHistory = null; vtSeen = [];   // the voice tests are read when their page opens
}
let mineBusy = Promise.resolve();
// Call (and wait) after every change of who is signed in, before anything is drawn or sent to the teacher.
function authData() { return mineBusy = mineBusy.then(mineSwitch).catch(() => {}); }
async function mineSwitch() {
  if (!auth.on || (auth.me && auth.me.needsProfile)) return;
  const want = authSignedIn() ? String(auth.me.id || '') : 'visitor'; if (!want) return;
  const o = await DB.get('kv', 'owner'), cur = (o && o.id) || '', half = !!(o && o.laying);   // half: the page was closed in the middle of a change
  if (cur === want && !half) return;
  if (!cur) { if (want !== 'visitor') await DB.put('kv', 'owner', {id: want}); return; }
  const next = want === 'visitor' ? null : await DB.get('kv', 'mine::' + want);
  if (cur === 'visitor' && !half && !next) { await DB.put('kv', 'owner', {id: want}); return; }
  if (cur !== 'visitor' && !half) {
    const put = {kv: {}, ls: {}, at: Date.now()};
    for (const k in MINE) put.kv[k] = await DB.get('kv', k);
    MINE_LS.forEach(k => put.ls[k] = ls(k));
    await DB.put('kv', 'mine::' + cur, put);
  }
  await DB.put('kv', 'owner', {id: want, laying: true});
  for (const k in MINE) { const v = next && next.kv ? next.kv[k] : undefined; await DB.put('kv', k, v === undefined || v === null ? MINE[k]() : v); }
  MINE_LS.forEach(k => { const v = next && next.ls ? next.ls[k] : null; if (v === null || v === undefined) lsDel(k); else ls(k, v); });
  await DB.put('kv', 'owner', {id: want});
  stopAll(); await mineLoad();
  syncState = ''; classList = null; classErr = ''; voiceLatest = null; voiceHist = {}; voiceOpen = new Set(); viewRes = null; VT = {mode: 'intro'}; SPK = {mode: 'pick'};
}
// Another tab of this browser signed in or out: this tab starts again, so it does not go on saving the other person's practice.
// The same person, with a session the other tab has just renewed: this tab uses it from now on.
window.addEventListener('storage', e => { if (e.key !== 'die_me' && e.key !== 'die_session') return; const m = lsJson('die_me'); if (((m && m.id) || '') !== ((auth.me && auth.me.id) || '')) return location.reload(); authOther(); });

/* ---------- start-up ---------- */
async function authInit() {
  if (!/^https?:$/.test(location.protocol)) return;
  // Coming back from Google: the session is in the address (#access_token=…&refresh_token=…)
  const h = location.hash || '';
  if (/[#&]access_token=/.test(h)) {
    const q = new URLSearchParams(h.replace(/^#\/?/, '')), at = q.get('access_token'), rt = q.get('refresh_token');
    if (at && rt) ls('die_session', JSON.stringify({access_token: at, refresh_token: rt, expires_at: Math.floor(Date.now() / 1000) + (+q.get('expires_in') || 3600)}));
    history.replaceState(null, '', location.pathname + location.search + '#/');
  } else if (/[#&]error(_description)?=/.test(h)) { history.replaceState(null, '', location.pathname + location.search + '#/login'); setTimeout(() => toast('Sign-in was cancelled or did not work. Please try again.'), 600); }
  let caps = null;
  try { const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 4000), r = await rawFetch(AUTH_API, {cache: 'no-store', signal: ctl.signal}); clearTimeout(to); const d = await r.json(); if (d && d.ok) { caps = {on: !!d.auth, google: !!d.google}; ls('die_auth', JSON.stringify(caps)); } } catch (e) {}
  if (!caps) caps = lsJson('die_auth') || {on: false, google: false};   // no internet: what this device saw last time
  auth.on = !!caps.on; auth.google = !!caps.google;
  if (auth.on) {
    auth.session = lsJson('die_session');
    if (auth.session) {
      const d = await authPost({action: 'me'});
      if (d.ok && d.me) authKeep(auth.session, d.me);
      else if (d.error !== 'sign in' && lsJson('die_me')) auth.me = lsJson('die_me');   // no internet, or the server is in trouble: keep working as the person who was signed in
      else authForget();   // the server says this session is over
    }
  }
  authApply(); await authData();
}
// Makes the rest of the site agree with the account: who the student is, who may use teacher mode, what the header shows.
function authApply() {
  document.body.classList.toggle('acct', auth.on); document.body.classList.toggle('acct-in', authSignedIn()); document.body.classList.toggle('acct-teacher', authTeacher());
  if (auth.on) {
    if (authSignedIn()) { student = {id: auth.me.id, name: auth.me.name, cls: auth.me.className || '', email: auth.me.email}; DB.put('kv', 'student', student); }
    else student = null;
    if (!authTeacher() && mode !== 'student') { mode = 'student'; ls('die_mode', mode); }
    setModeButtons();
  }
  authHeader();
}
function authHeader() {
  const b = $('#acctBtn'), pop = $('#acctPop'); if (!b) return;
  b.hidden = !auth.on; pop.hidden = true; if (!auth.on) return;
  if (!authSignedIn()) { b.innerHTML = '👤<span> Sign in</span>'; b.onclick = () => go('#/login'); b.setAttribute('aria-label', 'Sign in'); return; }
  const m = auth.me;
  b.innerHTML = '👤<span> ' + esc(authFirst(m.name)) + '</span>'; b.setAttribute('aria-label', 'My account');
  b.onclick = e => { e.stopPropagation(); const open = pop.hidden; pop.hidden = !open; if (open) authPop(); };
}
function authPop() {
  const pop = $('#acctPop'), m = auth.me; if (!m) return;
  pop.innerHTML = `<b>${esc(m.name)}</b><small class="lbl">${esc(m.email)} · ${m.role === 'teacher' ? 'Teacher' : 'Student'}</small>
    ${m.role === 'student' ? (m.className ? `<div class="acctcls">🏫 <b>${esc(m.className)}</b>${m.teacher ? ' · ' + esc(m.teacher) : ''}</div><button class="btn sm ghost" id="acctLeave">Leave this class</button>`
      : `<label class="field"><span>Class code from your teacher</span><input class="in" id="acctCode" maxlength="12" autocapitalize="characters" placeholder="e.g. K7M2QP"></label><div class="err" id="acctErr" role="alert"></div><button class="btn sm teal" id="acctJoin">Join the class</button>`)
      : `<a class="btn sm teal" href="#/students">🧑‍🏫 My classes and students</a>`}
    <button class="btn sm ghost" id="acctOut">Sign out</button>`;
  $('#acctOut').onclick = authSignOut;
  const j = $('#acctJoin'); if (j) j.onclick = async () => { j.disabled = true; const d = await authPost({action: 'join', code: $('#acctCode').value}); j.disabled = false; if (!d.ok) { $('#acctErr').textContent = authWhy(d.error); return; } authKeep(auth.session, d.me); authApply(); syncProgress(); toast('You joined ' + d.me.className + ' 🎉'); render(true); };
  const l = $('#acctLeave'); if (l) l.onclick = async () => { if (!confirm('Leave this class? Your teacher will not see your progress any more.')) return; const d = await authPost({action: 'leave'}); if (!d.ok) return toast(authWhy(d.error)); authKeep(auth.session, d.me); authApply(); syncProgress(); toast('You left the class'); render(true); };
}
document.addEventListener('click', () => { const p = $('#acctPop'); if (p) p.hidden = true; });
async function authSignOut() { authForget(); lsDel('die_visitor'); DB.put('kv', 'student', null); authApply(); await authData(); toast('Signed out'); if (location.hash === '#/welcome') render(); else go('#/welcome'); }
// After a sign-in or a new account: keep the session, join the class that was waiting, open the home page.
async function authEnter(d) {
  authKeep(d.session, d.me); let code = ''; try { code = sessionStorage.getItem('die_code') || ''; sessionStorage.removeItem('die_code'); } catch (e) {}
  if (code && d.me && d.me.role === 'student' && !d.me.className) { const j = await authPost({action: 'join', code}); if (j.ok) authKeep(auth.session, j.me); }
  authApply(); await authData(); if (authSignedIn()) { syncProgress(); toast('Welcome, ' + authFirst(auth.me.name) + '! 👋'); }
  if (location.hash === '#/' || location.hash === '') render(); else go('#/');
}

/* ---------- which page a visitor may open ---------- */
// Called first by render(). Returns true when it has drawn the page itself.
function authRoute(p) {
  const drew = authRouteDraw(p), page = p[0] || '';
  // The welcome, sign-in and sign-up pages stand alone: no section links around them.
  document.body.classList.toggle('acct-front', drew && auth.on && !authSignedIn() && (AUTH_PAGES.includes(page) || page === '' || (auth.me && auth.me.needsProfile)));
  authMarks();   // 🔒 on the menu links a visitor cannot open (and off again for everybody else)
  return drew;
}
function authRouteDraw(p) {
  const bar = $('#visbar'), page = p[0] || '';
  if (bar) bar.hidden = true;
  if (!auth.on) { if (AUTH_PAGES.includes(page)) { go('#/'); return true; } return false; }
  if (auth.me && auth.me.needsProfile) { authFinishPage(); return true; }
  if (auth.me) {
    if (page === 'join' && p[1] && auth.me.role === 'student') { authPost({action: 'join', code: p[1]}).then(d => { if (d.ok) { authKeep(auth.session, d.me); authApply(); syncProgress(); toast('You joined ' + d.me.className + ' 🎉'); } else toast(authWhy(d.error)); }); go('#/'); return true; }
    if (page === 'join' && p[1]) setTimeout(() => toast(authWhy('students only')), 300);   // a teacher opened a class link
    if (AUTH_PAGES.includes(page)) { go('#/'); return true; }
    return false;
  }
  if (page === 'login') { authLoginPage(); return true; }
  if (page === 'register') { authRegisterPage(p[1], p[2]); return true; }
  if (page === 'join') { authJoinPage(p[1]); return true; }
  if (page === 'welcome' || (page === '' && ls('die_visitor') !== '1')) { authWelcomePage(); return true; }
  if (bar) bar.hidden = false;
  if (authSample(p)) return false;
  authGatePage(page); return true;
}
// The sample a visitor may open: home, the placement test, the level pages, the first lesson of each level (and a shared voice test result).
function authSample(p) {
  const page = p[0] || '';
  return page === '' || page === 'placement' || page === 'level' || (page === 'voicetest' && p[1] === 'result')
    || (page === 'lesson' && !!state.levels[p[1]] && !!state.levels[p[1]].lessons[0] && state.levels[p[1]].lessons[0].id === p[2]);
}
// Would this address (`#/…`) show the gate page to the person on this device now? Only ever true for a visitor.
function authLocked(href) {
  href = String(href || ''); if (!authVisitor() || href.slice(0, 2) !== '#/') return false;
  const p = href.slice(2).split('/');
  return !AUTH_PAGES.includes(p[0]) && !authSample(p);
}
/* ---------- a visitor sees what is locked ---------- */
// A small 🔒 on every link that leads to the gate page (top menu, phone tab bar, cards and links inside the page), "Free" on what
// is open, and on the home page a box that lists the sample. Only marks: the links still go where they went, and the gate page
// (authRouteDraw) is what really keeps a page closed. Runs after every page is drawn; with nobody visiting it only clears the marks.
const AUTH_LK_TIP = 'Opens with a free account';
function authMarkLink(a, on) {
  a.classList.toggle('lk', on);
  if (on) { if (!a.title) { a.title = AUTH_LK_TIP; a.dataset.lk = '1'; } }
  else if (a.dataset.lk) { a.removeAttribute('title'); delete a.dataset.lk; }
}
function authMarks() {
  const vis = authVisitor() && ls('die_visitor') === '1' && !document.body.classList.contains('acct-front');
  document.querySelectorAll('.navlinks a.hide-sm, .tabbar a').forEach(a => authMarkLink(a, vis && authLocked(a.getAttribute('href'))));
  if (!vis || app.querySelector('.acctpage')) return;
  const tag = (el, cls, text) => { if (el.querySelector(':scope > .lktag')) return; const t = document.createElement('span'); t.className = 'lktag ' + cls; t.textContent = text; el.append(t); };
  app.querySelectorAll('a[href^="#/"]').forEach(a => {
    const on = authLocked(a.getAttribute('href')); authMarkLink(a, on);
    if (a.classList.contains('ptest')) tag(a, on ? 'shut' : 'free', on ? '🔒 Free account' : '✓ Free to try');
  });
  app.querySelectorAll('.lvl[data-go] .meta').forEach(m => { if (!m.querySelector('.lkfirst') && authLocked(m.closest('.lvl').dataset.go) === false) m.insertAdjacentHTML('beforeend', ' <span class="lkfirst">· first lesson free</span>'); });
  const lid = (location.hash.match(/^#\/level\/([^/]+)/) || [])[1];
  if (lid) app.querySelectorAll('.lcard[data-open]').forEach(c => { const on = authLocked(`#/lesson/${lid}/${c.dataset.open}`); c.classList.toggle('lk', on); if (on) c.title = AUTH_LK_TIP; tag(c, on ? 'shut' : 'free', on ? '🔒 Free account' : '✓ Free to try'); });
  const hero = app.querySelector(':scope > .hero');
  if (hero && !$('#vsample')) {
    const firsts = LEVELS.map(l => ({l, s: state.levels[l.id] && state.levels[l.id].lessons[0]})).filter(x => x.s);
    hero.insertAdjacentHTML('afterend', `<section class="vsample" id="vsample"><h2>👀 You are visiting — try these for free</h2>
      <div class="vslist"><a href="#/placement"><i>🧭</i><span><b>Placement test</b><small>Find your level</small></span></a>
      ${firsts.map(x => `<a href="#/lesson/${x.l.id}/${esc(x.s.id)}"><i>${x.l.icon}</i><span><b>${esc(x.s.title)}</b><small>${x.l.name} · first lesson</small></span></a>`).join('')}</div>
      <p>Everything with a 🔒 opens with a free account. <a href="#/register">Create a free account</a></p></section>`);
  }
}
new MutationObserver(authMarks).observe(app, {childList: true});

/* ---------- pages ---------- */
const authGoogleBtn = label => auth.google ? `<div class="acctor"><span>or</span></div><a class="btn ghost acctg" id="acctG" href="${AUTH_API}?action=google"><b>G</b> ${label} with Google</a>` : '';
function authWelcomePage() {
  app.innerHTML = `<section class="welcome">
    <div class="wl-hero" style="--img:url(photos/hero.jpg)"><div class="wl-in">
      <span class="chip">Watch • Listen • Match • Speak</span>
      <h1>Learn English<br>by <span>doing it</span>.</h1>
      <p>Short lessons, listening and matching games, and an AI coach that listens to your speaking — on your phone or computer.</p>
      <div class="wl-cta"><a class="btn sun" href="#/register">Create a free account</a><a class="btn ghost" href="#/login">Sign in</a></div>
      <a class="wl-code" href="#/join">🏫 I have a class code from my teacher →</a>
    </div></div>
    <div class="wl-roles">
      <a class="wl-role" href="#/register/student"><i>🎒</i><b>I am a student</b><span>Find your level, practise every day and keep your progress.</span><em>Start learning →</em></a>
      <a class="wl-role" href="#/register/teacher"><i>🧑‍🏫</i><b>I am a teacher</b><span>Make a class, give your students the code and see how each one is doing.</span><em>Make my class →</em></a>
      <button class="wl-role" id="wlVisit"><i>👀</i><b>I am just looking</b><span>Try the placement test and the first lesson of each level. No account needed.</span><em>Try a sample →</em></button>
    </div>
    <div class="wl-feats">
      <div><i>🎯</i><b>Find your level</b><span>A placement test and a 3-minute voice test tell you where to start.</span></div>
      <div><i>🗣️</i><b>Speak and be heard</b><span>Say words and sentences, and see which sounds to practise.</span></div>
      <div><i>📈</i><b>See your progress</b><span>Streaks, weekly goals, and your teacher can follow your work.</span></div>
    </div></section>`;
  $('#wlVisit').onclick = () => { ls('die_visitor', '1'); if (location.hash === '#/' || location.hash === '') render(); else go('#/'); window.scrollTo(0, 0); };
}
function authFormShell(title, sub, inner) {
  return `<div class="acctpage"><a class="backbtn" href="#/welcome" style="display:inline-flex">← Back</a><div class="panel acctcard"><h2 class="baloo">${title}</h2><p class="hint">${sub}</p>${inner}</div></div>`;
}
function authLoginPage() {
  app.innerHTML = authFormShell('Sign in', 'Welcome back! Write your email and password.', `
    <form id="acctForm" class="acctform" novalidate>
      <label class="field"><span>Email</span><input class="in" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com"></label>
      <label class="field"><span>Password</span><input class="in" name="password" type="password" autocomplete="current-password" maxlength="72"></label>
      <div class="err" id="acctFErr" role="alert"></div>
      <button class="btn sun" type="submit" id="acctGo">Sign in</button></form>
    ${authGoogleBtn('Sign in')}
    <p class="acctalt">New here? <a href="#/register">Create a free account</a> · <a href="#/join">I have a class code</a></p>`);
  const f = $('#acctForm');
  f.onsubmit = async e => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(f)), err = $('#acctFErr'), b = $('#acctGo');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) { err.textContent = AUTH_ERR.email; return; } if (!v.password) { err.textContent = 'Please write your password.'; return; }
    err.textContent = ''; b.disabled = true; b.textContent = 'Signing in…';
    const d = await authPost({action: 'login', email: v.email.trim(), password: v.password}, false);
    if (!d.ok) { b.disabled = false; b.textContent = 'Sign in'; err.textContent = authWhy(d.error); return; }
    await authEnter(d);
  };
}
// Shows the class behind a code under the field (student sign-up and the "I have a code" page).
async function authCheckCode(code, out) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length < 4) { out.innerHTML = ''; return null; }
  out.innerHTML = '<span class="lbl">Checking the code…</span>';
  const d = await authPost({action: 'code', code: c}, false);
  out.innerHTML = d.ok ? `<span class="acctok">✅ Class <b>${esc(d.className)}</b>${d.teacher ? ' · teacher: <b>' + esc(d.teacher) + '</b>' : ''}</span>` : `<span class="acctbad">⚠️ ${esc(authWhy(d.error))}</span>`;
  return d.ok ? d : null;
}
function authRegisterPage(role, code) {
  role = role === 'teacher' ? 'teacher' : 'student'; code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  if (!code && role === 'student') { try { code = sessionStorage.getItem('die_code') || ''; } catch (e) {} }
  app.innerHTML = authFormShell('Create a free account', 'It takes one minute.', `
    <div class="seg acctrole" role="tablist"><a href="#/register/student${code ? '/' + code : ''}" class="${role === 'student' ? 'on' : ''}">🎒 Student</a><a href="#/register/teacher" class="${role === 'teacher' ? 'on' : ''}">🧑‍🏫 Teacher</a></div>
    <form id="acctForm" class="acctform" novalidate>
      <label class="field"><span>Your name</span><input class="in" name="name" autocomplete="name" maxlength="80" placeholder="${role === 'teacher' ? 'e.g. Mr Ahmed' : 'e.g. Sara Ahmed'}"></label>
      <label class="field"><span>Email</span><input class="in" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com"></label>
      <label class="field"><span>Password (8 letters or numbers, or more)</span><input class="in" name="password" type="password" autocomplete="new-password" maxlength="72"></label>
      ${role === 'student' ? `<label class="field"><span>Class code from your teacher (you can add it later)</span><input class="in" name="classCode" maxlength="12" autocapitalize="characters" value="${esc(code)}" placeholder="e.g. K7M2QP"></label><div id="acctCodeInfo" class="acctinfo"></div>`
        : `<label class="field"><span>Name of your first class</span><input class="in" name="className" maxlength="60" placeholder="e.g. Grade 10 – A"></label><p class="hint" style="margin:0">You get a class code to give to your students. You can make more classes later.</p>`}
      <div class="err" id="acctFErr" role="alert"></div>
      <button class="btn sun" type="submit" id="acctGo">Create my account</button></form>
    ${authGoogleBtn('Continue')}
    <p class="acctalt">Already have an account? <a href="#/login">Sign in</a></p>`);
  const f = $('#acctForm'), ci = f.elements.classCode;
  if (ci) { ci.onblur = () => authCheckCode(ci.value, $('#acctCodeInfo')); if (code) authCheckCode(code, $('#acctCodeInfo')); }
  const g = $('#acctG'); if (g) g.onclick = () => { try { sessionStorage.setItem('die_role', role); if (ci && ci.value.trim()) sessionStorage.setItem('die_code', ci.value.trim()); } catch (e) {} };
  f.onsubmit = async e => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(f)), err = $('#acctFErr'), b = $('#acctGo'), name = v.name.trim().replace(/\s+/g, ' ');
    const bad = name.length < 2 ? AUTH_ERR.name : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) ? AUTH_ERR.email : v.password.length < 8 ? AUTH_ERR.password : role === 'teacher' && (v.className || '').trim().length < 2 ? 'Please write the name of your class.' : '';
    if (bad) { err.textContent = bad; return; }
    err.textContent = ''; b.disabled = true; b.textContent = 'Creating your account…';
    const d = await authPost({action: 'signup', role, name, email: v.email.trim(), password: v.password, classCode: v.classCode || '', className: v.className || ''}, false);
    if (!d.ok) { b.disabled = false; b.textContent = 'Create my account'; err.textContent = authWhy(d.error); return; }
    try { sessionStorage.removeItem('die_code'); } catch (e) {}
    if (!d.session) { toast('Your account is ready. Please sign in.'); go('#/login'); return; }
    await authEnter(d);
  };
}
function authJoinPage(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  app.innerHTML = authFormShell('Join your class', 'Write the code your teacher gave you.', `
    <form id="acctForm" class="acctform" novalidate>
      <label class="field"><span>Class code</span><input class="in acctbig" name="code" maxlength="12" autocapitalize="characters" autocomplete="off" value="${esc(code)}" placeholder="K7M2QP"></label>
      <div id="acctCodeInfo" class="acctinfo"></div><div class="err" id="acctFErr" role="alert"></div>
      <button class="btn sun" type="submit" id="acctGo">Check the code</button></form>
    <div id="acctNext" hidden><div class="wl-cta" style="margin-top:14px"><a class="btn sun" id="acctNew">Create my account</a><a class="btn ghost" id="acctHave">I already have an account</a></div></div>`);
  const f = $('#acctForm'), check = async () => {
    const d = await authCheckCode(f.elements.code.value, $('#acctCodeInfo')); $('#acctNext').hidden = !d; if (!d) return;
    $('#acctNew').href = '#/register/student/' + d.code; $('#acctHave').href = '#/login'; $('#acctHave').onclick = () => { try { sessionStorage.setItem('die_code', d.code); } catch (e) {} };
  };
  f.onsubmit = e => { e.preventDefault(); if (f.elements.code.value.trim().length < 4) { $('#acctFErr').textContent = 'Please write the class code.'; return; } $('#acctFErr').textContent = ''; check(); };
  if (code) check();
}
// The first time someone signs in with Google, the account still needs a name, student/teacher and a class.
function authFinishPage() {
  let role = 'student', code = ''; try { role = sessionStorage.getItem('die_role') === 'teacher' ? 'teacher' : 'student'; code = sessionStorage.getItem('die_code') || ''; } catch (e) {}
  const draw = () => {
    app.innerHTML = `<div class="acctpage"><div class="panel acctcard"><h2 class="baloo">One last step</h2><p class="hint">Signed in as ${esc(auth.me.email)}. Tell us who you are.</p>
      <div class="seg acctrole"><button type="button" data-r="student" class="${role === 'student' ? 'on' : ''}">🎒 Student</button><button type="button" data-r="teacher" class="${role === 'teacher' ? 'on' : ''}">🧑‍🏫 Teacher</button></div>
      <form id="acctForm" class="acctform" novalidate>
        <label class="field"><span>Your name</span><input class="in" name="name" maxlength="80" value="${esc(auth.me.name || '')}"></label>
        ${role === 'student' ? `<label class="field"><span>Class code from your teacher (you can add it later)</span><input class="in" name="classCode" maxlength="12" autocapitalize="characters" value="${esc(code)}"></label><div id="acctCodeInfo" class="acctinfo"></div>`
          : `<label class="field"><span>Name of your first class</span><input class="in" name="className" maxlength="60" placeholder="e.g. Grade 10 – A"></label>`}
        <div class="err" id="acctFErr" role="alert"></div><button class="btn sun" type="submit" id="acctGo">Finish</button></form>
      <p class="acctalt"><a href="#/" id="acctCancel">Sign out</a></p></div></div>`;
    app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { role = b.dataset.r; draw(); });
    $('#acctCancel').onclick = e => { e.preventDefault(); authSignOut(); };
    const f = $('#acctForm'), ci = f.elements.classCode; if (ci) ci.onblur = () => authCheckCode(ci.value, $('#acctCodeInfo'));
    f.onsubmit = async e => {
      e.preventDefault(); const v = Object.fromEntries(new FormData(f)), err = $('#acctFErr'), name = v.name.trim().replace(/\s+/g, ' ');
      const bad = name.length < 2 ? AUTH_ERR.name : role === 'teacher' && (v.className || '').trim().length < 2 ? 'Please write the name of your class.' : '';
      if (bad) { err.textContent = bad; return; }
      $('#acctGo').disabled = true; const d = await authPost({action: 'profile', role, name, classCode: v.classCode || '', className: v.className || ''});
      if (!d.ok) { $('#acctGo').disabled = false; err.textContent = authWhy(d.error); return; }
      try { sessionStorage.removeItem('die_role'); sessionStorage.removeItem('die_code'); } catch (e) {}
      await authEnter({session: auth.session, me: d.me});
    };
  };
  draw();
}
function authGatePage(page) {
  const names = {pronounce: 'Pronounce', listening: 'Listening', speaking: 'Test your speaking', voicetest: 'the Voice level test', progress: 'My progress', mistakes: 'Practise my mistakes', mixmatch: 'Mixed match', lesson: 'this lesson', students: 'the Students page'};
  app.innerHTML = `<div class="acctpage"><div class="panel acctcard" style="text-align:center"><div class="acctlock">🔒</div><h2 class="baloo">Create a free account to open ${names[page] || 'this page'}</h2>
    <p class="hint">As a visitor you can try the placement test and the first lesson of each level. With a free account everything opens and your progress is saved.</p>
    <div class="wl-cta" style="justify-content:center"><a class="btn sun" href="#/register">Create a free account</a><a class="btn ghost" href="#/login">Sign in</a></div>
    <p class="acctalt"><a href="#/">← Back to the sample</a> · <a href="#/join">I have a class code</a></p></div></div>`;
}

/* ---------- teacher: my classes (on top of the Students page) ---------- */
function authClassesPanel() {
  if (!authTeacher() || mode !== 'teacher' || $('#acctClasses')) return;
  const cs = auth.me.classes || [], link = c => location.origin + location.pathname + '#/join/' + c.code;
  const box = document.createElement('div'); box.className = 'panel'; box.id = 'acctClasses'; box.style.margin = '16px 0';
  box.innerHTML = `<h3 class="sec-t" style="font-size:24px">🏫 My classes</h3><p class="hint" style="margin:0 0 10px">Give your students the class code (or the link). They write it when they create their account, and then they appear in the table below.</p>
    <div class="acctclist">${cs.map(c => `<div class="acctcl"><div><b>${esc(c.name)}</b><small class="lbl">${c.students} student${c.students === 1 ? '' : 's'}</small></div><code>${esc(c.code)}</code><button class="btn sm ghost" data-copy="${esc(link(c))}">🔗 Copy the link</button></div>`).join('') || '<p class="lbl">No class yet.</p>'}</div>
    <form id="acctNewClass" class="row" style="margin-top:12px;gap:8px"><input class="in" name="name" maxlength="60" placeholder="New class, e.g. Grade 10 – B" style="flex:1 1 200px"><button class="btn teal" type="submit">+ Make a class</button></form><div class="err" id="acctClErr" role="alert"></div>`;
  const anchor = app.querySelector('.banner, .crumbs'); if (anchor && anchor.parentNode === app) (app.querySelector('.banner') || anchor).after(box); else app.prepend(box);
  box.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.copy).then(() => toast('Link copied')); } catch (e) { toast(b.dataset.copy); } });
  $('#acctNewClass').onsubmit = async e => { e.preventDefault(); const name = e.target.elements.name.value.trim(); if (name.length < 2) { $('#acctClErr').textContent = 'Please write the name of the class.'; return; }
    const d = await authPost({action: 'newclass', name}); if (!d.ok) { $('#acctClErr').textContent = authWhy(d.error); return; } authKeep(auth.session, d.me); toast('Class made 🎉'); renderStudents(); };
  // The older settings (class server address, teacher key) are for the site owner: tuck them away for teacher accounts.
  const h = [...app.querySelectorAll('h3')].find(x => x.textContent.includes('Class server')), old = h && h.closest('.panel');
  if (old && !old.closest('details')) { const d = document.createElement('details'); d.className = 'acctadv'; d.innerHTML = '<summary>Advanced settings (site owner)</summary>'; old.before(d); d.append(old); }
}
// Runs after the Students page is drawn (the page itself is in 09-progress.js).
const renderStudentsBase = renderStudents;
renderStudents = function () { renderStudentsBase(); authClassesPanel(); };
