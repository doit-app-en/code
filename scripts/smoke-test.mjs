// Smoke test:  npm run smoke
// Starts the local server, opens every page in headless Chrome on a phone and a desktop screen and fails on:
//   - JavaScript errors, - a page that renders nothing, - sideways scrolling (layout wider than the screen).
// Then takes the whole Voice level test with a fake microphone. Screenshots go to /tmp/smoke/ (look at them after a design change).
// Needs Playwright + Chrome. Set PLAYWRIGHT_PATH / CHROME_PATH if they are somewhere else.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3000 + Math.floor(Math.random() * 2000), base = 'http://127.0.0.1:' + PORT, shots = process.env.SMOKE_SHOTS || '/tmp/smoke';
const pwPath = process.env.PLAYWRIGHT_PATH || '/opt/npm-tools/node_modules/playwright/index.mjs';
const { chromium } = existsSync(pwPath) ? await import(pwPath) : await import('playwright');
const chrome = process.env.CHROME_PATH || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);

const ROUTES = ['#/', '#/placement', '#/voicetest', '#/pronounce', '#/listening', '#/speaking', '#/progress', '#/level/a1', '#/level/a2', '#/level/b1', '#/level/b2'];
const TEACHER_ROUTES = ['#/', '#/students', '#/speaking', '#/listening', '#/pronounce', '#/placement'];
const SCREENS = [{ name: 'phone', width: 390, height: 800 }, { name: 'tablet', width: 820, height: 1000 }, { name: 'desktop', width: 1280, height: 900 }];
const problems = [];

// A lost "}" in styles.css silently puts every rule after it inside the last @media block (it happened: the desktop home page lost its styles).
{ const css = readFileSync(path.join(root, 'public/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''); let depth = 0, bad = 0;
  css.split('\n').forEach((l, i) => { if (/^@media/.test(l) && depth > 0 && !bad) bad = i + 1; depth += (l.match(/{/g) || []).length - (l.match(/}/g) || []).length; });
  if (depth !== 0 || bad) problems.push(`styles.css: the { } brackets do not match` + (bad ? ` (an @media block starts inside another one near line ${bad})` : '')); }

mkdirSync(shots, { recursive: true });
const server = spawn(process.execPath, [path.join(root, 'scripts/dev-server.mjs')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const stop = () => { try { server.kill(); } catch (e) {} };
process.on('exit', stop);
for (let i = 0; i < 50; i++) { try { await fetch(base + '/'); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }

const browser = await chromium.launch({ executablePath: chrome, args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const watch = (page, label) => {
  page.on('pageerror', e => problems.push(`${label}: JavaScript error: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) problems.push(`${label}: console error: ${m.text().slice(0, 200)}`); });
  page.on('dialog', d => d.accept());
};
async function visit(page, screen, route, mode) {
  await page.evaluate(h => { location.hash = h; }, route); await page.waitForTimeout(450);
  const r = await page.evaluate(() => {
    const over = document.documentElement.scrollWidth - innerWidth, wide = [];
    if (over > 1) document.querySelectorAll('body *:not(.tabbar *)').forEach(el => { const b = el.getBoundingClientRect(); if (b.width && b.right > innerWidth + 1 && wide.length < 4 && ![...el.children].some(c => c.getBoundingClientRect().right > innerWidth + 1)) wide.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' → ' + Math.round(b.right)); });
    return { over, wide, chars: document.querySelector('#app').innerText.trim().length };
  });
  const label = `${screen.name} ${mode} ${route}`;
  if (r.chars < 20) problems.push(`${label}: the page is empty`);
  if (r.over > 1) problems.push(`${label}: ${r.over}px wider than the screen (${r.wide.join(' | ')})`);
  await page.screenshot({ path: path.join(shots, `${screen.name}-${mode}-${route.replace(/[^a-z0-9]+/gi, '_') || 'home'}.png`) });
}

// Photos: every photo the pages name must exist (a wrong path only shows as a grey box), and none may be heavier than 300 KB (phones on mobile data).
{ const pub = path.join(root, 'public'), named = new Set();
  for (const f of ['index.html', 'styles.css', ...readdirSync(path.join(pub, 'js')).map(n => 'js/' + n)]) {
    const t = readFileSync(path.join(pub, f), 'utf8'); for (const m of t.match(/photos\/[\w\/-]+\.jpg/g) || []) named.add(m);
    for (const m of t.match(/photos\/[\w\/-]*\$\{l\.id\}\.jpg/gi) || []) for (const id of ['f1', 'f2', 'a1', 'a2', 'b1', 'b2']) named.add(m.replace(/\$\{l\.id\}/i, id)); }
  for (const p of named) if (!existsSync(path.join(pub, p))) problems.push(`photo missing: public/${p} is used by a page but the file is not there`);
  const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const p of walk(path.join(pub, 'photos'))) if (statSync(p).size > 300 * 1024) problems.push(`photo too heavy: ${path.relative(root, p)} is ${Math.round(statSync(p).size / 1024)} KB (keep photos under 300 KB)`); }

for (const screen of SCREENS) {
  const ctx = await browser.newContext({ viewport: { width: screen.width, height: screen.height }, permissions: ['microphone'] }), page = await ctx.newPage();
  watch(page, screen.name);
  await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('#app').innerText.trim().length > 20, null, { timeout: 10000 });
  // Home page of a new student: the 3-step path and the five practice tiles; of a returning one: the streak card with a "continue" link.
  { const h = await page.evaluate(async () => { const a = { steps: document.querySelectorAll('#startp .step3').length, tiles: document.querySelectorAll('.pgrid a.ptest').length };
      const keep = activity; activity = { last: Date.now(), days: { [todayKey()]: 1 } }; renderHome(); a.streak = (document.querySelector('#today .tstreak b') || {}).textContent; a.next = !!document.querySelector('#today a.tnext'); activity = keep; renderHome(); return a; });
    if (h.steps !== 3 || h.tiles !== 5 || h.streak !== '1' || !h.next) problems.push(`${screen.name} home: path, practice tiles or streak card is wrong ` + JSON.stringify(h)); }
  // Weekly goal on the "today" card: pick 3 days → "1 of 3 days this week"; change to 2 with two days practised → goal reached. Screenshot for the eye.
  { const g = await page.evaluate(async () => { const keep = activity, a = {}, txt = () => document.querySelector('#wgoal').innerText.replace(/\s+/g, ' ');
      localStorage.removeItem('die_goal'); activity = { last: Date.now(), days: { [todayKey()]: 1 } }; renderHome();
      a.opts = document.querySelectorAll('#wgoal [data-goal]').length; document.querySelector('#wgoal [data-goal="3"]').click(); a.set = txt(); a.count = document.querySelector('#wkCount').hidden;
      renderHome(); a.kept = txt(); a.bar = document.querySelector('#wgoal .wgbar i').style.width;
      document.querySelector('#wgChange').click(); document.querySelector('#wgoal [data-goal="2"]').click();
      const y = new Date(); y.setDate(y.getDate() - 1); if (new Date().getDay() > 0) activity.days[todayKey(y)] = 1; else localStorage.setItem('die_goal', '1x'); // on a Sunday the week has one day: check the "no goal" fallback instead
      renderHome(); a.hit = txt(); a.sunday = new Date().getDay() === 0; a.over = document.documentElement.scrollWidth - innerWidth; window._keepAct = keep; return a; });
    await page.evaluate(() => document.querySelector('#today').scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(300); await page.screenshot({ path: path.join(shots, `${screen.name}-home-weekly-goal.png`) });
    await page.evaluate(() => { location.hash = '#/progress'; }); await page.waitForTimeout(300); g.progress = await page.evaluate(() => { const e = document.querySelector('.pgtop #wgoal'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); return (e || {}).innerText || ''; }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, `${screen.name}-progress-weekly-goal.png`) });
    await page.evaluate(() => { localStorage.removeItem('die_goal'); activity = window._keepAct; location.hash = '#/'; }); await page.waitForTimeout(300);
    if (g.opts !== 3 || !/1 of 3 days this week/.test(g.set) || !g.count || !/1 of 3 days this week/.test(g.kept) || g.bar !== '33%' || !(g.sunday ? /Pick a weekly goal/.test(g.hit) : /goal reached: 2 of 2 days/.test(g.hit)) || !g.progress.trim() || g.over > 1)
      problems.push(`${screen.name} home: the weekly goal is wrong ` + JSON.stringify(g)); }
  // Streak: one rest day a week keeps it, two missed days in a row end it, and reaching 3 days shows the celebration once. Screenshots for the eye.
  { const k = await page.evaluate(async () => { const keep = activity, a = {}, key = n => { const d = new Date(); d.setDate(d.getDate() - n); return todayKey(d); }, set = (...ns) => { activity = { last: Date.now(), days: Object.fromEntries(ns.map(n => [key(n), 1])) }; };
      set(0, 1, 3, 4); a.rest = streakInfo().streak + '/' + streakInfo().rests.length; set(0, 1, 4, 5); a.two = streakInfo().streak; set(2, 3); a.saved = streakInfo().streak + '/' + streakInfo().restSaved; a.best = (set(0, 5, 6, 7, 8), streakInfo().best);
      const wed = new Date(2026, 10, 18, 12), fix = (...ds) => { activity = { days: Object.fromEntries(ds.map(d => [todayKey(new Date(2026, 10, d)), 1])) }; return streakRun(0, wed); };
      a.sameWeek = fix(18, 16, 14).streak; a.twoWeeks = fix(18, 16, 15, 14, 12).streak;   // Tue 17 + Sun 15 are in one week: only one is free; Tue 17 + Fri 13 are in two weeks
      set(1, 2); await onActivity(); await new Promise(r => setTimeout(r, 1100)); const c = document.querySelector('#celebrate'); a.celeb = c ? c.querySelector('.celebn').textContent + ' ' + c.querySelectorAll('.miles .on').length : ''; a.over = document.documentElement.scrollWidth - innerWidth;
      window._keepAct = keep; return a; });
    await page.screenshot({ path: path.join(shots, `${screen.name}-streak-celebration.png`) });
    k.closed = await page.evaluate(async () => { const b = document.querySelector('#celebOk'); if (b) b.click(); const gone = !document.querySelector('#celebrate'); await onActivity(); await new Promise(r => setTimeout(r, 1100)); const again = !!document.querySelector('#celebrate');
      const key = n => { const d = new Date(); d.setDate(d.getDate() - n); return todayKey(d); }; activity = { last: Date.now(), days: { [key(0)]: 1, [key(1)]: 1, [key(3)]: 1, [key(4)]: 1 } }; location.hash = '#/progress'; return gone && !again; });
    await page.waitForTimeout(300); k.badges = await page.evaluate(() => { const m = document.querySelector('#miles'); if (m) m.scrollIntoView({ block: 'center', behavior: 'instant' }); return document.querySelectorAll('#miles .on').length + '/' + document.querySelectorAll('.pgtop .wk .rest').length + '/' + !!document.querySelector('#restLine'); }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, `${screen.name}-progress-streak-badges.png`) });
    await page.evaluate(async () => { activity = window._keepAct; await DB.put('kv', 'activity', activity); location.hash = '#/'; }); await page.waitForTimeout(300);
    if (k.rest !== '4/1' || k.two !== 2 || k.saved !== '2/true' || k.best !== 4 || k.sameWeek !== 2 || k.twoWeeks !== 5 || k.celeb !== '3 1' || !k.closed || k.badges !== '1/1/true' || k.over > 1)
      problems.push(`${screen.name} streak: rest day, badges or celebration is wrong ` + JSON.stringify(k)); }
  for (const route of ROUTES) await visit(page, screen, route, 'student');
  await page.evaluate(() => { mode = 'teacher'; setModeButtons(); render(); });
  for (const route of TEACHER_ROUTES) await visit(page, screen, route, 'teacher');
  await ctx.close();
}

// Practice flows on a phone: a placement test from the form to the result, a lesson from Match to "Finish lesson", and every listening exercise fits the screen.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage();
  watch(page, 'practice flows');
  try {
    await page.goto(base + '/#/placement', { waitUntil: 'load' }); await page.waitForSelector('#infoForm', { timeout: 10000 });
    await page.evaluate(() => { state.placement.questions = bank().slice(0, 4).concat(bank().filter(q => q.listen).slice(0, 1)); });   // a short test (this browser profile is thrown away)
    await page.fill('[name=name]', 'Sara Test'); await page.fill('[name=cls]', '9A'); await page.fill('[name=phone]', '0790 123 4567'); await page.click('#infoForm button[type=submit]'); await page.waitForSelector('.opt');
    // A second quick tap (a double tap on the answer before) must not answer the new question.
    await page.waitForTimeout(450); const first = await page.evaluate(() => { const k = P.items[0].opts.findIndex(o => o.ok); document.querySelector(`.opt[data-k="${k}"]`).click(); return new Promise(r => setTimeout(() => { document.querySelector('.opt').click(); r({ i: P.i, locked: !!P.locked, ans: P.ans.length }); }, 320)); });
    if (first.i !== 1 || first.locked || first.ans !== 1) problems.push('placement test: a quick second tap answered the next question ' + JSON.stringify(first));
    for (let n = 0; n < 8 && await page.evaluate(() => P.stage === 'test'); n++) { await page.waitForTimeout(420); await page.evaluate(() => { const k = P.items[P.i].opts.findIndex(o => o.ok); document.querySelector(`.opt[data-k="${k}"]`).click(); }); await page.waitForTimeout(320); }
    await page.waitForSelector('.res-card', { timeout: 5000 });
    const pt = await page.evaluate(() => ({ pct: P.rec.pct, level: P.rec.level, saved: results.length, over: document.documentElement.scrollWidth - innerWidth }));
    if (pt.pct !== 100 || pt.level !== 'a2' || pt.saved !== 1 || pt.over > 1) problems.push('placement test: all answers right did not give 100% / Level A2, or the result is wider than the phone ' + JSON.stringify(pt));
    await page.screenshot({ path: path.join(shots, 'phone-placement-result.png'), fullPage: true });
    // A lesson: match every pair (one mistake first), then finish it → the level page marks it "Finished".
    await page.evaluate(() => { location.hash = '#/level/a1'; }); await page.waitForSelector('.lcard'); await page.click('.lcard'); await page.waitForSelector('[data-tab=match]'); await page.click('[data-tab=match]'); await page.waitForSelector('.mcard');
    await page.click('.mcard[data-mi="0"]'); await page.click('.chip[data-wi="1"]');
    const pairs = await page.evaluate(() => LS.matching.length); for (let i = 0; i < pairs; i++) { await page.click(`.mcard[data-mi="${i}"]`); await page.click(`.chip[data-wi="${i}"]`); }
    await page.waitForSelector('#stu .win', { timeout: 5000 });
    const mt = await page.evaluate(() => { const w = document.querySelector('#stu .win'); w.scrollIntoView({ block: 'center', behavior: 'instant' }); return { mist: M.mist, win: Math.round(w.getBoundingClientRect().width), box: Math.round(document.querySelector('#stu').getBoundingClientRect().width), over: document.documentElement.scrollWidth - innerWidth }; });
    if (mt.mist !== 1 || mt.win < mt.box - 2 || mt.over > 1) problems.push('lesson Match: the "All matched" box is not as wide as the page, or the mistakes count is wrong ' + JSON.stringify(mt));
    await page.waitForTimeout(200); await page.screenshot({ path: path.join(shots, 'phone-lesson-match-win.png') });
    await page.click('[data-tab=speak]'); await page.click('#nextStep'); await page.waitForSelector('.lcard .badge.fin', { timeout: 5000 });
    if (await page.evaluate(() => document.querySelectorAll('.lcard .badge.fin').length) !== 1) problems.push('lesson: after "Finish lesson" exactly one lesson should be marked Finished on the level page');
    await page.screenshot({ path: path.join(shots, 'phone-level-finished.png') });
    // A teacher's half-written lesson: students never see a pair with no word or picture or a phrase with no text, and two pairs with the same word accept either word box.
    await page.evaluate(async () => { const s = newLesson('Half written', {items: [['orange', '🍊', 'The orange is sweet.'], ['orange', '🟧', 'My bag is orange.'], ['bread', '🍞', 'I buy bread.']]}); s.id = 'smoke-half';
      s.phrases.push({id: 'h1', text: ' ', img: {e: ''}, time: 9}); s.matching.push({id: 'h2', word: '', img: {e: ''}}, {id: 'h3', word: 'milk', img: {e: ''}}); s.speaking.unshift({id: 'h4', text: ''});
      state.levels.a2.lessons.push(s); location.hash = '#/lesson/a2/smoke-half'; });
    await page.waitForSelector('[data-tab=match]');
    const hw = { chips: await page.evaluate(() => document.querySelectorAll('#stu .pchip').length) };
    await page.click('[data-tab=listen]'); hw.tiles = await page.evaluate(() => document.querySelectorAll('#stu .phr').length);
    await page.click('[data-tab=speak]'); hw.dots = await page.evaluate(() => document.querySelectorAll('#stu .dot').length); hw.say = await page.evaluate(() => document.querySelector('#tgt').textContent.trim().length);
    await page.click('[data-tab=match]'); hw.cards = await page.evaluate(() => document.querySelectorAll('#stu .mcard').length); hw.words = await page.evaluate(() => [...document.querySelectorAll('#stu .chip')].filter(c => c.textContent.trim()).length);
    await page.click('.mcard[data-mi="0"]'); await page.click('#stu .chip[data-wi="1"]'); await page.click('.mcard[data-mi="1"]'); await page.click('#stu .chip[data-wi="1"]'); await page.click('.mcard[data-mi="2"]'); await page.click('#stu .chip[data-wi="2"]');
    hw.mist = await page.evaluate(() => M.mist); hw.win = await page.evaluate(() => document.querySelectorAll('#stu .win').length);
    if (hw.chips !== 3 || hw.tiles !== 3 || hw.dots !== 3 || !hw.say || hw.cards !== 3 || hw.words !== 3 || hw.mist !== 0 || hw.win !== 1) problems.push('lesson with unfinished items: students should see 3 phrases, 3 pairs and 3 things to say, and the two "orange" pairs should accept either word ' + JSON.stringify(hw));
    await page.screenshot({ path: path.join(shots, 'phone-lesson-half-written.png'), fullPage: true });
    await page.evaluate(async () => { state.levels.a2.lessons = state.levels.a2.lessons.filter(s => s.id !== 'smoke-half'); await save(); location.hash = '#/'; }); await page.waitForTimeout(200);
    // Every listening exercise: nothing wider than the phone, and "Check my answers" with nothing answered gives 0.
    const count = await page.evaluate(() => lexs().length), seen = new Set();
    for (let n = 1; n <= count; n++) {
      await page.evaluate(n => { location.hash = '#/listening/' + n; }, n); await page.waitForFunction(n => LS_.n === n && !!document.querySelector('#lCheck'), n, { timeout: 5000 });
      const e = await page.evaluate(() => { const ex = lexs()[LS_.n - 1]; return { type: ex.type, title: ex.title, over: document.documentElement.scrollWidth - innerWidth, ok: lsGrade(ex, LS_).ok }; });
      if (e.over > 1) problems.push(`listening exercise ${n} "${e.title}" (${e.type}): ${e.over}px wider than the phone screen`);
      if (e.ok !== 0) problems.push(`listening exercise ${n} "${e.title}": ${e.ok} answers count as right before the student has done anything`);
      if (!seen.has(e.type)) { seen.add(e.type); await page.evaluate(() => document.querySelector('#lAct').scrollIntoView({ block: 'start', behavior: 'instant' })); await page.evaluate(() => scrollBy(0, -70)); await page.waitForTimeout(150); await page.screenshot({ path: path.join(shots, `phone-listening-${e.type}.png`) }); }
    }
  } catch (e) { problems.push('practice flows: could not finish — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Practise my mistakes on a phone: two wrong pairs in Match and one unclear phrase in Speak are remembered, offered on Home and My progress,
// and leave the list after two correct answers in the rounds. Speech recognition is a pretend one that "hears" window._heard.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage();
  watch(page, 'practise my mistakes');
  try {
    await page.addInitScript(() => { window.SpeechRecognition = window.webkitSpeechRecognition = class { start() { setTimeout(() => { if (this.onstart) this.onstart(); setTimeout(() => { if (this.onresult) this.onresult({ results: [[{ transcript: window._heard || '' }]] }); if (this.onend) this.onend(); }, 40); }, 10); } stop() {} abort() {} }; });
    await page.goto(base + '/#/level/a1', { waitUntil: 'load' }); await page.waitForSelector('.lcard', { timeout: 10000 });
    const none = await page.evaluate(() => { renderHome(); return !document.querySelector('#mistGo'); }); await page.evaluate(() => render());
    await page.click('.lcard'); await page.waitForSelector('[data-tab=match]'); await page.click('[data-tab=match]'); await page.waitForSelector('.mcard');
    await page.click('.mcard[data-mi="0"]'); await page.click('.chip[data-wi="1"]'); await page.click('.mcard[data-mi="2"]'); await page.click('.chip[data-wi="3"]'); await page.click('.mcard[data-mi="2"]'); await page.click('.chip[data-wi="0"]');   // pair 2 wrong twice: still one item
    await page.click('[data-tab=speak]'); await page.waitForSelector('#mic');
    await page.evaluate(() => { window._heard = 'banana'; }); await page.click('#mic'); await page.waitForSelector('#result .result', { timeout: 5000 });
    await page.evaluate(() => { window._heard = LS.speaking[1].text; }); await page.click('[data-act=snext]'); await page.click('#mic'); await page.waitForSelector('#result .result', { timeout: 5000 });   // said clearly: not a mistake
    await page.waitForTimeout(200);
    const a = await page.evaluate(async () => ({ keys: Object.keys(mistakes).map(k => k[0]).sort().join(''), saved: Object.keys((await DB.get('kv', 'mistakes')) || {}).length }));
    await page.evaluate(() => { location.hash = '#/'; }); await page.waitForSelector('#mistGo', { timeout: 5000 });
    a.home = await page.evaluate(() => { const e = document.querySelector('#mistGo'); e.scrollIntoView({ block: 'center', behavior: 'instant' }); return e.innerText.replace(/\s+/g, ' '); }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, 'phone-home-mistakes.png') });
    await page.evaluate(() => { location.hash = '#/progress'; }); await page.waitForSelector('#mistGo', { timeout: 5000 });
    a.over = await page.evaluate(() => { document.querySelector('#mistGo').scrollIntoView({ block: 'center', behavior: 'instant' }); return document.documentElement.scrollWidth - innerWidth; }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, 'phone-progress-mistakes.png') });
    if (!none || a.keys !== 'mms' || a.saved !== 3 || !/Practise my mistakes \(3\)/.test(a.home) || a.over > 1) problems.push('practise my mistakes: the list or its link is wrong ' + JSON.stringify({ none, ...a }));
    // One round: answer every question (wrongAt = the number of the picture question to answer wrongly, 0 = none). Returns what the end box says.
    const round = async (wrongAt, shot) => {
      await page.waitForSelector('#mkBody .prog', { timeout: 5000 }); let pics = 0; const seen = {};
      for (let n = 0; n < 12 && !await page.$('#mkEnd'); n++) {
        const kind = await page.evaluate(() => MK.q[MK.i].kind);
        if (shot && !seen[kind]) { seen[kind] = 1; await page.waitForTimeout(150); await page.screenshot({ path: path.join(shots, `phone-mistakes-${kind === 'm' ? 'picture' : 'speak'}.png`) }); }
        if (kind === 'm') { pics++; const bad = pics === wrongAt; await page.evaluate(bad => { const x = MK.q[MK.i]; [...document.querySelectorAll('.mkopt')].find(b => (b.textContent === x.item.word) !== bad).click(); }, bad); }
        else { await page.evaluate(() => { window._heard = MK.q[MK.i].item.text; }); await page.click('#mic'); await page.waitForSelector('#result .result', { timeout: 5000 }); }
        const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (over > 1) problems.push(`practise my mistakes: a question is ${over}px wider than the phone screen`);
        if (shot && kind === 'm' && seen.m === 1) { seen.m = 2; await page.waitForTimeout(150); await page.screenshot({ path: path.join(shots, 'phone-mistakes-picture-answered.png') }); }
        await page.click('#mkNext');
      }
      await page.waitForSelector('#mkEnd', { timeout: 5000 });
      return page.evaluate(() => document.querySelector('#mkEnd').innerText.replace(/\s+/g, ' ') + ' | left ' + Object.keys(mistakes).length + ' | over ' + (document.documentElement.scrollWidth - innerWidth));
    };
    await page.click('#mistGo'); const r1 = await round(0, true); const days = await page.evaluate(() => activity.days[todayKey()] || 0);
    await page.screenshot({ path: path.join(shots, 'phone-mistakes-result.png') });
    // Two quick taps: "Practise again" straight after the result appears does nothing, and neither does "Skip" on a speaking question that has just appeared.
    await page.evaluate(() => { MK.end = true; drawMist(); document.querySelector('[data-act=again]').click(); document.querySelector('#mkEnd a.btn').click(); });
    const dbl = { again: !!await page.$('#mkEnd') && await page.evaluate(() => location.hash === '#/mistakes') };
    await page.waitForTimeout(450); await page.click('[data-act=again]'); await page.waitForSelector('#mkBody .prog', { timeout: 5000 });
    dbl.skip = await page.evaluate(() => { MK.i = MK.q.findIndex(x => x.kind !== 'm'); drawMist(); const i = MK.i; document.querySelector('#mkNext').click(); const kept = MK.i === i && !MK.end; MK.i = 0; drawMist(); return kept; });
    if (!dbl.again || !dbl.skip) problems.push('practise my mistakes: a double tap skips a question or leaves the result ' + JSON.stringify(dbl));
    const r2 = await round(1);
    await page.waitForTimeout(450); await page.click('[data-act=again]'); const r3 = await round(0);
    await page.evaluate(() => { location.hash = '#/'; }); await page.waitForTimeout(300); await page.evaluate(() => { location.hash = '#/mistakes'; }); await page.waitForSelector('#mkEmpty', { timeout: 5000 });
    const end = await page.evaluate(async () => { renderHome(); const link = !!document.querySelector('#mistGo'); render(); return { link, saved: Object.keys((await DB.get('kv', 'mistakes')) || {}).length }; });
    if (!/3 of 3 correct.*3 still on your list.*left 3 \| over 0/.test(r1) || !/2 of 3 correct.*2 learned.*1 still on your list.*left 1 \| over 0/.test(r2) || !/1 of 1 correct.*1 learned.*Your list is empty.*left 0 \| over 0/.test(r3) || days < 1 || end.link || end.saved !== 0)
      problems.push('practise my mistakes: the rounds are wrong ' + JSON.stringify({ r1, r2, r3, days, end }));
  } catch (e) { problems.push('practise my mistakes: could not finish — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Mixed match on a phone: locked until two lessons are finished, then a short round (MIX_SECS shortened) with one wrong pair,
// the result, the student's own best kept on the device, and a second round that does not beat it.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage();
  watch(page, 'mixed match');
  try {
    await page.goto(base + '/#/', { waitUntil: 'load' }); await page.waitForSelector('.lvl', { timeout: 10000 });
    const finish = n => page.evaluate(async n => { state.levels.a1.lessons.slice(0, n).forEach(s => { lessonsDone[s.id] = Date.now(); }); await DB.put('kv', 'lessonsDone', lessonsDone); renderHome(); return !!document.querySelector('#mixGo'); }, n);
    const a = { none: await page.evaluate(() => !document.querySelector('#mixGo')), one: await finish(1) };
    await page.evaluate(() => { location.hash = '#/mixmatch'; }); await page.waitForSelector('#mxLocked', { timeout: 5000 });
    await page.evaluate(() => { location.hash = '#/'; }); await page.waitForSelector('.lvl'); a.two = await finish(2);
    a.home = await page.evaluate(() => { const e = document.querySelector('#mixGo'); e.scrollIntoView({ block: 'center', behavior: 'instant' }); return e.innerText.replace(/\s+/g, ' '); }); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(shots, 'phone-home-mixed-match.png') });
    await page.click('#mixGo'); await page.waitForSelector('#mxIntro', { timeout: 5000 }); await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(shots, 'phone-mixed-match-intro.png') });
    // One round: `wrong` wrong pairs first, then `right` correct ones through the real cards. Returns what the end box says.
    const round = async (secs, right, wrong, shot) => {
      await page.evaluate(s => { MIX_SECS = s; }, secs); await page.click('[data-act=start]'); await page.waitForSelector('#mxGame', { timeout: 5000 });
      for (let n = 0; n < wrong; n++) { await page.click('#mxGame .mcard[data-mi="0"]'); await page.click('#mxGame .chip[data-wi="1"]'); }
      for (let n = 0; n < right; n++) {
        const i = await page.evaluate(() => MX.board.findIndex((_, i) => MX.done[i] === undefined));
        await page.click(`#mxGame .mcard[data-mi="${i}"]`); await page.click(`#mxGame .chip[data-wi="${i}"]`);
        if (shot && n === 1) { await page.waitForTimeout(150); await page.screenshot({ path: path.join(shots, 'phone-mixed-match-game.png') });
          const g = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, low: Math.round(document.querySelector('#mxGame').getBoundingClientRect().bottom - document.querySelector('.tabbar').getBoundingClientRect().top), small: [...document.querySelectorAll('#mxGame .chip')].filter(c => c.getBoundingClientRect().height < 44).length, white: [...document.querySelectorAll('#mxGame .chip:not(.done)')].filter(c => getComputedStyle(c).color === 'rgb(255, 255, 255)').length }));   // white: a word nobody can read (it happened in the lesson Match)
          if (g.over > 1 || g.low > 0 || g.small || g.white) problems.push('mixed match: the game does not fit a phone screen ' + JSON.stringify(g)); }
      }
      await page.waitForSelector('#mxEnd', { timeout: secs * 1000 + 4000 });
      // Taps left over from the game must not press "Play again" or "Home" (they appear where the pictures and words were).
      const late = await page.evaluate(() => { document.querySelector('#mxAgain').click(); document.querySelector('#mxEnd a.btn').click(); return MX.phase + ' ' + location.hash + ' ' + getComputedStyle(document.querySelector('#mxAgain')).pointerEvents; });
      if (late !== 'end #/mixmatch none') problems.push('mixed match: a tap just after the time is up leaves the result (' + late + ')');
      return page.evaluate(async () => document.querySelector('#mxEnd').innerText.replace(/\s+/g, ' ') + ' | saved ' + ((await DB.get('kv', 'mixBest')) || {}).best + ' | over ' + (document.documentElement.scrollWidth - innerWidth));
    };
    const r1 = await round(4, 6, 1, true); await page.waitForTimeout(150); await page.screenshot({ path: path.join(shots, 'phone-mixed-match-result.png') });
    const mid = await page.evaluate(() => ({ mist: Object.keys(mistakes).length, days: activity.days[todayKey()] || 0, link: !!document.querySelector('#mxBody #mistGo') }));
    const r2 = await round(2, 2, 0);
    // A teacher's half-written pair (a word with no picture) in a finished lesson is not played here and not asked in "Practise my mistakes".
    const half = await page.evaluate(() => { const L = state.levels.a1.lessons[0], n = mixPool().items.length, m = mistList().length; L.matching.push({ id: 'halfpair', word: 'ghostword', img: null }); mistakes['m:' + L.id + ':halfpair'] = { ok: 0, n: 1, t: Date.now() };
      const r = { pool: mixPool().items.length - n, list: mistList().length - m }; L.matching.pop(); delete mistakes['m:' + L.id + ':halfpair']; return r; });
    if (half.pool || half.list) problems.push('mixed match: a pair with no picture is offered ' + JSON.stringify(half));
    await page.evaluate(() => { MIX_SECS = 60; location.hash = '#/'; }); await page.waitForSelector('#mixGo', { timeout: 5000 });
    const end = await page.evaluate(() => { const home = document.querySelector('#mixGo').innerText.replace(/\s+/g, ' '); mode = 'teacher'; renderHome(); const teacher = !!document.querySelector('#mixGo'); mode = 'student'; renderProgress(); return { home, teacher, progress: !!document.querySelector('#mixGo') }; });
    if (!a.none || a.one || !a.two || !/Mixed match · 60 seconds/.test(a.home) || /best/i.test(a.home) || !/New best!.*You matched 6 pairs.*Mistakes: 1 .*\| saved 6 \| over 0/.test(r1) || mid.mist !== 1 || mid.days < 1 || !mid.link
      || !/Time is up!.*You matched 2 pairs.*Your best: 6 .*\| saved 6 \| over 0/.test(r2) || !/Your best: 6/.test(end.home) || end.teacher || !end.progress)
      problems.push('mixed match: the round, the best score or the link is wrong ' + JSON.stringify({ a, r1, mid, r2, end }));
  } catch (e) { problems.push('mixed match: could not finish — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// The whole Voice level test with a fake microphone and a pretend speech recogniser. First the recogniser hears nothing: the student
// must be told at once and get the same question again. Then it hears words, the test is finished, and "← Back" on the result works.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, permissions: ['microphone'] }), page = await ctx.newPage();
  watch(page, 'voice test');
  try {
    await page.addInitScript(() => { window._mute = true; window.SpeechRecognition = window.webkitSpeechRecognition = class {
      start() { this._t = setTimeout(() => { if (window._mute) return; const parts = VT.mode === 'repeat' ? [VT.sentences[VT.si].text] : 'Hello my name is Sam and I live in a small town with my family. My mother is a teacher and she goes to work by car every day. We like playing football together at the weekend'.split('. '); if (this.onresult) this.onresult({ results: parts.map(p => Object.assign([{ transcript: p, confidence: 0.9 }], { isFinal: true })) }); }, 60); }
      stop() { clearTimeout(this._t); setTimeout(() => this.onend && this.onend(), 20); } abort() { clearTimeout(this._t); } }; });
    await page.goto(base + '/#/voicetest', { waitUntil: 'load' }); await page.waitForSelector('#vtStart', { timeout: 10000 }); await page.click('#vtStart');
    await page.waitForSelector('#vtGo'); await page.click('#vtGo'); await page.waitForSelector('#vtStop'); await page.waitForTimeout(2400); await page.click('#vtStop');
    await page.waitForSelector('#vtRedo', { timeout: 10000 }); await page.screenshot({ path: path.join(shots, 'phone-voice-not-heard.png') });
    await page.click('#vtRedo'); await page.waitForSelector('#vtGo');
    if (!await page.evaluate(() => VT.step === 0 && !VT.tasks.length && document.querySelector('.spprompt').textContent === VT.question)) problems.push('voice test: "Record again" after a silent answer does not bring the same question back');
    await page.evaluate(() => { window._mute = false; });
    for (let step = 0; step < 2; step++) { await page.waitForSelector('#vtGo'); await page.click('#vtGo'); await page.waitForSelector('#vtStop'); await page.waitForTimeout(2400); await page.click('#vtStop'); }
    for (let i = 0; i < 4; i++) {
      await page.waitForSelector('#vtPlay', { timeout: 15000 }); await page.click('#vtPlay');
      await page.waitForFunction(() => { const b = document.querySelector('#vtGo'); return b && !b.disabled; }, null, { timeout: 25000 });
      await page.click('#vtGo'); await page.waitForSelector('#vtStop'); await page.waitForTimeout(2400); await page.click('#vtStop');
    }
    await page.waitForSelector('#vtAgain', { timeout: 20000 });
    const r = await page.evaluate(() => ({ tasks: VT.rec.tasks.length, sentences: VT.rec.sentences.length, audio: VT.rec.sentences.every(s => !!s.audio), over: document.documentElement.scrollWidth - innerWidth }));
    if (!await page.$('#vtNext a[href^="#/level/"]')) problems.push('voice test result: the "What to do next" box with a link to a level is missing');
    if (r.tasks !== 2 || r.sentences !== 4 || !r.audio) problems.push('voice test: the result is incomplete ' + JSON.stringify(r));
    if (r.over > 1) problems.push(`voice test result: ${r.over}px wider than the phone screen`);
    if (!await page.evaluate(() => VT.rec.tasks[0].words > 20 && VT.rec.sentences.every(s => s.score === 100))) problems.push('voice test: the words the recogniser heard are not in the result');
    await page.screenshot({ path: path.join(shots, 'phone-voice-result.png'), fullPage: true });
    // A fresh result has the first page's own address: "← Back" must still return to it, with the test in "My voice tests".
    await page.click('.backbtn'); await page.waitForTimeout(250);
    if (!await page.$('#vtStart') || (await page.$$('.vthist tbody tr')).length !== 1) problems.push('voice test: "← Back" on a fresh result does not return to the first page with the test in "My voice tests"');
    if (await page.evaluate(() => (window._live = window._live || 0, VT.rec && !VT.rec.ended))) problems.push('voice test: a recording is still running after the test');
    // The next tests must not ask what this device was asked before: four more starts, nothing twice, and every picture has its size.
    const again = await page.evaluate(async () => { const first = vtHistory[0], all = [first.tasks[0].prompt, first.tasks[1].image, ...first.sentences.map(s => s.text)];
      for (let i = 0; i < 4; i++) { vtStart(); all.push(VT.question, VT.picture, ...VT.sentences.map(s => s.text)); }
      vtAbort(); location.hash = '#/voicetest'; await new Promise(r => setTimeout(r, 300));
      return { asked: all.length, different: new Set(all).size, saved: ((await DB.get('kv', 'voiceSeen')) || []).length, nosize: VT_PICTURES.filter(p => !VT_PIC_SIZE[p]), counts: [VT_QUESTIONS.length, VT_PICTURES.length, ...Object.values(VT_SENTENCES).map(a => a.length)] }; });
    if (again.asked !== 30 || again.different !== 30 || again.saved !== 30) problems.push('voice test: a question, picture or sentence came back in the next tests ' + JSON.stringify(again));
    if (again.nosize.length) problems.push('voice test: no size for the picture ' + again.nosize.join(', '));
  } catch (e) { problems.push('voice test: could not finish — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// The teacher's Students page with a pretend server answer: every student's newest voice level test must be in the table.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage(), now = new Date().toISOString();
  watch(page, 'students voice column');
  try {
    await page.route('**/api/class?key=*', r => r.fulfill({ json: { ok: true, students: [{ name: 'Sara <Test>', cls: '9A', email: 'sara@example.com', overall: 62, listening: 70, pronounce: 55, lessons: 60, lastActive: now },
      { name: 'Omar Test', cls: '9B', email: 'omar@example.com', overall: 31, listening: 40, pronounce: 20, lessons: 30, lastActive: now }] } }));
    const newest = { id: 'abcdef0123456789abcdef01', date: now, level: 'A2', overall: 64, speaking: 60, pronunciation: 71, repeating: 62 }, older = { ...newest, id: 'abcdef0123456789abcdef00', date: '2026-10-01T09:00:00.000Z', level: 'A1', overall: 41 };
    await page.route('**/api/voice', r => { if (r.request().method() !== 'POST') return r.continue(); const d = JSON.parse(r.request().postData() || '{}');
      return r.fulfill({ json: d.key !== 'smoke' ? { ok: false, error: 'wrong key' } : d.action === 'history' ? { ok: true, tests: d.email === 'sara@example.com' ? [newest, older] : [] } : { ok: true, tests: [{ email: 'sara@example.com', ...newest, count: 2 }] } }); });
    await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('#app').innerText.trim().length > 20, null, { timeout: 10000 });
    await page.evaluate(() => { mode = 'teacher'; setModeButtons(); tkey = 'smoke'; location.hash = '#/students'; });
    await page.waitForSelector('td.vcell', { timeout: 10000 });
    const r = await page.evaluate(() => ({ cells: [...document.querySelectorAll('td.vcell')].map(td => td.innerText.replace(/\s+/g, ' ').trim()), link: (document.querySelector('td.vcell a') || {}).hash, over: document.documentElement.scrollWidth - innerWidth }));
    if (r.cells.length !== 2 || !/A2 · 64%.*Speaking 60%.*Pronunciation 71%.*Repeating 62%.*2 tests/.test(r.cells[0]) || !/Not taken/.test(r.cells[1]) || r.link !== '#/voicetest/result/abcdef0123456789abcdef01') problems.push('students voice column: wrong content ' + JSON.stringify(r));
    if (r.over > 1) problems.push(`students voice column: ${r.over}px wider than the phone screen`);
    // Class filter, order, and the list of a student's older voice tests.
    const names = () => page.evaluate(() => [...document.querySelectorAll('.rtable td.sname b')].map(b => b.textContent));
    await page.selectOption('#stCls', '9B'); const f = { names: await names(), title: await page.evaluate(() => document.querySelector('.sec-t').textContent.trim()) };
    await page.selectOption('#stCls', ''); await page.selectOption('#stSort', 'name'); const byName = await names();
    await page.selectOption('#stSort', 'high'); const byHigh = await names();
    await page.click('[data-vh="sara@example.com"]'); await page.waitForSelector('a.vhrow', { timeout: 5000 });
    const h = await page.evaluate(() => ({ rows: [...document.querySelectorAll('a.vhrow')].map(a => a.hash + ' ' + a.innerText.replace(/\s+/g, ' ').trim()), over: document.documentElement.scrollWidth - innerWidth }));
    if (f.names.join() !== 'Omar Test' || !/1 of 2/.test(f.title) || byName[0] !== 'Omar Test' || byHigh[0] !== 'Sara <Test>') problems.push('students filter/order: wrong rows ' + JSON.stringify({ f, byName, byHigh }));
    if (h.rows.length !== 2 || !/result\/abcdef0123456789abcdef01 .*A2 · 64%/.test(h.rows[0]) || !/result\/abcdef0123456789abcdef00 .*A1 · 41%/.test(h.rows[1])) problems.push('students voice history: wrong list ' + JSON.stringify(h));
    if (h.over > 1) problems.push(`students voice history: ${h.over}px wider than the phone screen`);
    await page.screenshot({ path: path.join(shots, 'phone-teacher-students-history.png'), fullPage: true });
    await page.click('[data-vh="sara@example.com"]'); if (await page.$('.vhrow')) problems.push('students voice history: the list did not close');
    await page.selectOption('#stSort', 'recent');
    await page.evaluate(() => { const w = document.querySelector('.tablewrap'); w.scrollIntoView(); w.scrollLeft = 480; scrollBy(0, -110); });
    await page.screenshot({ path: path.join(shots, 'phone-teacher-students-voice.png') });
  } catch (e) { problems.push('students voice column: could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Friendly states: when the server or the internet is away, the page must say so and offer "Try again" — and trying again must work.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage(), now = new Date().toISOString();
  watch(page, 'friendly states');
  try {
    let down = true, voiceDown = true, refuse = false, kept = false;
    const test = { id: 'abcdef0123456789abcdef01', date: now, level: 'A2', overall: 64, speaking: 60, pronunciation: 71, repeating: 62 };
    await page.route('**/api/class**', async r => { if (down) return r.abort(); if (r.request().method() === 'POST') return r.fulfill({ json: refuse ? { ok: false, error: 'server error' } : kept ? { ok: true, kept: true } : { ok: true } });
      await new Promise(f => setTimeout(f, 600)); return r.fulfill({ json: { ok: true, students: [{ name: 'Sara Test', cls: '9A', email: 'sara@example.com', overall: 62, listening: 70, pronounce: 55, lessons: 60, lastActive: now }] } }); });
    await page.route('**/api/voice**', r => { if (r.request().method() !== 'POST') return down ? r.abort() : r.continue(); if (voiceDown) return r.abort(); const d = JSON.parse(r.request().postData() || '{}');
      return r.fulfill({ json: d.action === 'history' ? { ok: true, tests: [test, test] } : { ok: true, tests: [{ email: 'sara@example.com', ...test, count: 2 }] } }); });
    await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('#app').innerText.trim().length > 20, null, { timeout: 10000 });
    // 1. Students: no answer → a box with "Try again", and no misleading "No students yet".
    await page.evaluate(() => { mode = 'teacher'; setModeButtons(); tkey = 'smoke'; location.hash = '#/students'; });
    await page.waitForSelector('#stRetry', { timeout: 10000 });
    if (await page.evaluate(() => /No students yet/.test(app.innerText))) problems.push('friendly states: "No students yet" is shown although the server did not answer');
    await page.screenshot({ path: path.join(shots, 'phone-state-students-error.png') });
    down = false; await page.click('#stRetry'); await page.waitForSelector('.statebox .spin', { timeout: 3000 });
    await page.screenshot({ path: path.join(shots, 'phone-state-students-loading.png') });
    await page.waitForSelector('.rtable td.sname', { timeout: 10000 });
    // 2. The voice results did not load → a line under the table with "Try again"; it then brings the column.
    await page.waitForSelector('#voiceRetry', { timeout: 5000 });
    await page.waitForTimeout(300); await page.evaluate(() => document.querySelector('.vnote').scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); await page.screenshot({ path: path.join(shots, 'phone-state-students-voice-error.png') });
    voiceDown = false; await page.click('#voiceRetry'); await page.waitForSelector('td.vcell', { timeout: 5000 });
    if (await page.$('.vnote')) problems.push('friendly states: the voice results line stayed after they loaded');
    // 3. A student's older tests did not load → the message and "Try again" are inside the cell.
    voiceDown = true; await page.click('[data-vh="sara@example.com"]'); await page.waitForSelector('.vherr [data-again]', { timeout: 5000 });
    voiceDown = false; await page.click('.vherr [data-again]'); await page.waitForSelector('a.vhrow', { timeout: 5000 });
    // 4. A shared result that cannot be fetched is "could not be opened" (not "not found"), with "Try again".
    down = true; await page.evaluate(() => { location.hash = '#/voicetest/result/abcdef0123456789abcdef01'; }); await page.waitForSelector('#vtRetry', { timeout: 10000 });
    await page.screenshot({ path: path.join(shots, 'phone-state-result-error.png') });
    // 5. My progress: the progress could not be sent → it says so; "Try again" sends it.
    await page.evaluate(async () => { mode = 'student'; setModeButtons(); student = { id: 'smoke', name: 'Sara Test', cls: '9A', email: 'sara@example.com' }; location.hash = '#/progress'; await sendProgress(); });
    await page.waitForSelector('#syncRetry', { timeout: 5000 });
    await page.waitForTimeout(300); await page.evaluate(() => document.querySelector('#syncLine').scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(200); await page.screenshot({ path: path.join(shots, 'phone-state-progress-unsent.png') });
    down = false; await page.click('#syncRetry'); await page.waitForFunction(() => /shared with your teacher/.test(document.querySelector('#syncLine').innerText), null, { timeout: 5000 });
    // 5b. The server answered but did not save the progress → the page must not say "shared with your teacher".
    refuse = true; await page.evaluate(() => sendProgress()); if (!(await page.$('#syncRetry')) || await page.evaluate(() => /shared with your teacher/.test(document.querySelector('#syncLine').innerText))) problems.push('my progress: says "shared with your teacher" although the server refused the progress');
    refuse = false; await page.click('#syncRetry'); await page.waitForFunction(() => /shared with your teacher/.test(document.querySelector('#syncLine').innerText), null, { timeout: 5000 });
    // 5b2. The server kept the fuller progress of the student's other device (this one has older or no practice) → the page says whose progress the teacher sees, with no error.
    kept = true; await page.evaluate(() => sendProgress()); { const t = await page.evaluate(() => document.querySelector('#syncLine').innerText);
      if (!/device you practised on last/.test(t) || /shared with your teacher|could not be sent/.test(t) || await page.$('#syncRetry')) problems.push('my progress: the server kept another device\'s progress but the page says: ' + t);
      await page.screenshot({ path: path.join(shots, 'phone-state-progress-other-device.png') }); }
    kept = false; await page.evaluate(() => sendProgress()); await page.waitForFunction(() => /shared with your teacher/.test(document.querySelector('#syncLine').innerText), null, { timeout: 5000 });
    // 5c. "Change" opens the form with the saved details and deletes nothing: leaving the page or "Cancel" keeps the student registered; "Save" keeps the id.
    { await page.click('#stEdit'); const c = await page.evaluate(async () => { const a = { vals: [...document.querySelectorAll('#stForm input')].map(i => i.value).join('|'), kept: !!student };
        document.querySelector('#stCancel').click(); a.closed = !document.querySelector('#stForm') && !!document.querySelector('#stEdit');
        document.querySelector('#stEdit').click(); document.querySelector('#stForm [name=cls]').value = ' 9  B '; document.querySelector('#stForm button[type=submit]').click(); await new Promise(f => setTimeout(f, 300));
        a.saved = student && student.cls + '|' + student.id + '|' + ((await DB.get('kv', 'student')) || {}).cls; return a; });
      if (c.vals !== 'Sara Test|9A|sara@example.com' || !c.kept || !c.closed || c.saved !== '9 B|smoke|9 B') problems.push('my progress: "Change" does not keep or save the details ' + JSON.stringify(c));
      await page.waitForTimeout(1800); }
    // 6. No internet: the bar under the header appears and goes away again.
    await ctx.setOffline(true); await page.waitForFunction(() => !document.querySelector('#offbar').hidden, null, { timeout: 5000 });
    const over = await page.evaluate(() => { scrollTo({ top: 0, behavior: 'instant' }); return document.documentElement.scrollWidth - innerWidth; }); if (over > 1) problems.push(`friendly states: the "no internet" bar makes the page ${over}px wider than the phone screen`);
    await page.waitForTimeout(200); await page.screenshot({ path: path.join(shots, 'phone-state-offline.png') });
    await ctx.setOffline(false); await page.waitForFunction(() => document.querySelector('#offbar').hidden, null, { timeout: 5000 });
  } catch (e) { problems.push('friendly states: could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Pronounce with the speech service: a pretend server says the service is on, scores one word, then says "student limit".
// The word must be recorded and sent as WAV, the score shown, and after the limit the browser's own recognition must take over.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, permissions: ['microphone'] }), page = await ctx.newPage();
  watch(page, 'pronounce with the speech service');
  try {
    const posts = [];
    await page.addInitScript(() => { window.SpeechRecognition = window.webkitSpeechRecognition = class { start() { setTimeout(() => { if (this.onstart) this.onstart(); setTimeout(() => { if (this.onresult) this.onresult({ results: [[{ transcript: window._heard || '' }]] }); if (this.onend) this.onend(); }, 40); }, 10); } stop() {} abort() {} }; });
    await page.route('**/api/voice', r => {
      if (r.request().method() !== 'POST') return r.fulfill({ json: { ok: true, speech: true, ai: false, save: true } });
      const d = JSON.parse(r.request().postData() || '{}'); posts.push(d);
      return r.fulfill({ json: posts.length === 1 ? { ok: true, heard: 'Something.', scores: { pron: 80, accuracy: 84, fluency: 100, completeness: 100, prosody: null }, words: [{ w: 'something', score: 84, err: '' }] } : { ok: false, error: 'student limit' } });
    });
    await page.goto(base + '/#/pronounce', { waitUntil: 'load' }); await page.waitForSelector('.pcard', { timeout: 10000 });
    const word = await page.evaluate(() => { student = { id: 'smoke', name: 'Sara Test', cls: '9A', email: 'sara@example.com' }; const sec = pronSecs()[0], words = secWords(sec).slice(0, 2);
      PR = { sec: sec.id, mode: 'test', words, i: 0, scores: [], tries: 0, best: null }; location.hash = '#/pronounce/' + sec.id; return words[0]; });
    await page.waitForFunction(() => /Full pronunciation check/.test((document.querySelector('#pHow') || {}).innerText || ''), null, { timeout: 8000 });
    await page.click('#pMic'); await page.waitForSelector('#pMic.rec', { timeout: 5000 });
    await page.waitForSelector('#pRes .ring', { timeout: 15000 });   // the recording stops by itself
    const one = await page.evaluate(() => ({ ring: document.querySelector('#pRes .ring').innerText.trim(), heard: document.querySelector('#pRes').innerText, next: document.querySelector('#pNext').disabled, tries: PR.tries, over: document.documentElement.scrollWidth - innerWidth }));
    const p0 = posts[0] || {};
    if (p0.action !== 'word' || p0.text !== word || !/^UklGR/.test(p0.audio || '') || !(p0.student && p0.student.email)) problems.push('pronounce with the speech service: the word was not sent as a WAV recording ' + JSON.stringify({ action: p0.action, text: p0.text, audio: (p0.audio || '').slice(0, 8) }));
    if (p0.audio && p0.audio.length > 400000) problems.push('pronounce with the speech service: the recording is longer than the server accepts (' + p0.audio.length + ')');
    if (one.ring !== '84%' || !/Something/.test(one.heard) || one.next || one.tries !== 1) problems.push('pronounce with the speech service: the score was not shown ' + JSON.stringify(one));
    if (one.over > 1) problems.push(`pronounce with the speech service: ${one.over}px wider than the phone screen`);
    // "▶ Me" plays the student's own recording (kept in the page only): shown after a scored try, plays a WAV, a second press stops it.
    const me = await page.evaluate(async () => {
      const b = document.querySelector('#pMe'), r = { shown: !!b && b.offsetHeight > 0, h: b ? b.offsetHeight : 0 }; if (!b) return r;
      const made = []; const mk = URL.createObjectURL; URL.createObjectURL = x => { made.push(x); return mk.call(URL, x); };
      b.click(); r.label = b.innerText; r.playing = !!prMe; r.type = made[0] && made[0].type; r.size = made[0] && made[0].size;
      b.click(); r.stopped = !prMe && /Me/.test(b.innerText); URL.createObjectURL = mk; return r;
    });
    if (!me.shown || me.h < 44 || !me.playing || !/Stop/.test(me.label || '') || me.type !== 'audio/wav' || !(me.size > 44) || !me.stopped) problems.push('pronounce with the speech service: "Me" (the student\'s own recording) did not show, play or stop ' + JSON.stringify(me));
    await page.screenshot({ path: path.join(shots, 'phone-pronounce-service.png'), fullPage: true });
    // Second try: the server answers "student limit" → the page says so and the next press uses the browser's recognition.
    await page.click('#pMic'); await page.waitForFunction(() => /basic check/.test(document.querySelector('#pStat').innerText), null, { timeout: 15000 });
    const two = await page.evaluate(() => ({ tries: PR.tries, how: document.querySelector('#pHow').innerText, mic: document.querySelector('#pMic').disabled }));
    if (two.tries !== 1 || two.how || two.mic) problems.push('pronounce with the speech service: a refused check was counted as a try, or the page did not go back to the basic check ' + JSON.stringify(two));
    await page.screenshot({ path: path.join(shots, 'phone-pronounce-service-limit.png'), fullPage: true });
    await page.evaluate(w => { window._heard = w; }, word); await page.click('#pMic');
    await page.waitForFunction(() => /100%/.test(document.querySelector('#pRes .ring').innerText), null, { timeout: 5000 });
    if (posts.length !== 2) problems.push('pronounce with the speech service: after the limit the page still called the server (' + posts.length + ' calls)');
    if (await page.evaluate(() => document.querySelector('#pMe').offsetHeight > 0)) problems.push('pronounce with the speech service: "Me" stayed after a basic check (it would play an older try)');
    // Leaving the page while it records must switch the microphone off.
    await page.evaluate(() => { pronNoSvc = false; pronFails = 0; PR.i = 1; renderPron(PR.sec); });
    if (await page.evaluate(() => document.querySelector('#pMe').offsetHeight > 0)) problems.push('pronounce with the speech service: "Me" was still there on the next word');
    await page.click('#pMic'); await page.waitForSelector('#pMic.rec', { timeout: 5000 });
    await page.evaluate(() => { location.hash = '#/'; }); await page.waitForTimeout(400);
    if (await page.evaluate(() => !!prRec)) problems.push('pronounce with the speech service: the microphone stayed on after leaving the page');
  } catch (e) { problems.push('pronounce with the speech service: could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// A whole Pronounce letter on a phone with a pretend voice and a pretend speech recogniser: listening unlocks the test, a reload keeps the
// listened words, the test gives a result, and "Back" leaves the result and an unfinished test (they have the letter's own address).
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage(), L = 'pronounce letter';
  watch(page, L);
  try {
    await page.addInitScript(() => {
      window.SpeechRecognition = window.webkitSpeechRecognition = class { start() { setTimeout(() => { if (this.onstart) this.onstart(); setTimeout(() => { if (this.onresult) this.onresult({ results: [[{ transcript: window._heard || '' }]] }); if (this.onend) this.onend(); }, 40); }, 10); } stop() {} abort() {} };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speaking: false, pending: false, getVoices: () => [{ name: 'UK', lang: 'en-GB', localService: true }], cancel() {}, resume() {}, pause() {}, addEventListener() {}, speak(u) { setTimeout(() => u.onend && u.onend(), 10); } } });
      window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    });
    await page.goto(base + '/#/pronounce/B', { waitUntil: 'load' }); await page.waitForSelector('#startPT', { timeout: 10000 });
    if (!await page.$eval('#startPT', b => b.disabled)) problems.push(L + ': the test can be started before any word was listened to');
    await page.click('.pw'); await page.waitForSelector('.pw.done', { timeout: 5000 }); await page.waitForTimeout(150);
    await page.reload({ waitUntil: 'load' }); await page.waitForSelector('#startPT', { timeout: 10000 });
    if (await page.$eval('#hcount', b => b.innerText.trim()) !== '1') problems.push(L + ': a listened word was forgotten after a reload');
    await page.click('#playAll'); await page.waitForFunction(() => !document.querySelector('#startPT').disabled, null, { timeout: 30000 });
    await page.click('#startPT'); await page.waitForSelector('#pMic', { timeout: 5000 });
    const n = await page.evaluate(() => PR.words.length); let unclear = '', low = 0;
    for (let i = 0; i < n; i++) {
      if (i === 1) { await page.click('#pSkip'); await page.waitForTimeout(60); continue; }
      if (i === 2) {   // said, but another word was heard: not 100%, and the word goes to "Practise my mistakes"
        unclear = await page.evaluate(() => { window._heard = 'banana'; return PR.words[PR.i]; }); await page.click('#pMic'); await page.waitForSelector('#pRes .ring', { timeout: 5000 });
        low = await page.evaluate(() => parseInt(document.querySelector('#pRes .ring').innerText, 10)); await page.click('#pNext'); await page.waitForTimeout(60); continue; }
      await page.evaluate(() => { window._heard = PR.words[PR.i]; }); await page.click('#pMic');
      await page.waitForFunction(() => /100%/.test((document.querySelector('#pRes .ring') || {}).innerText || ''), null, { timeout: 5000 });
      if (i === 0) await page.screenshot({ path: path.join(shots, 'phone-pronounce-test.png'), fullPage: true });
      await page.click('#pNext'); await page.waitForTimeout(60);
    }
    await page.waitForSelector('#again', { timeout: 5000 });
    const done = await page.evaluate(() => ({ best: (pronBest.B || {}).best, over: document.documentElement.scrollWidth - innerWidth }));
    if (done.best !== Math.round(((n - 2) * 100 + low) / n) || !(low < 80) || done.over > 1) problems.push(L + ': wrong result after the test ' + JSON.stringify({ ...done, low, n }));
    await page.screenshot({ path: path.join(shots, 'phone-pronounce-result.png'), fullPage: true });
    // The unclear word (not the skipped one, not the clear ones) is on the mistakes list, and the result says so with the link.
    const nw = await page.evaluate(async () => ({ keys: Object.keys(mistakes), saved: Object.values((await DB.get('kv', 'mistakes')) || {}).map(r => r.w), note: (document.querySelector('#prNoted') || {}).innerText || '', link: (document.querySelector('.prdone #mistGo') || {}).innerText || '' }));
    if (nw.keys.length !== 1 || nw.keys[0] !== 'w::' + encodeURIComponent(unclear.toLowerCase()) || nw.saved.join() !== unclear || !/1 word was not clear/.test(nw.note) || !/Practise my mistakes \(1\)/.test(nw.link))
      problems.push(L + ': the unclear word did not go to "Practise my mistakes" ' + JSON.stringify({ unclear, ...nw }));
    await page.click('.backbtn'); await page.waitForTimeout(250);
    if (!await page.$('#playAll')) problems.push(L + ': "Back" on the result page does not go back to the letter');
    if (await page.$eval('#startPT', b => b.disabled)) problems.push(L + ': a letter tested before cannot be tested again');
    await page.click('#startPT'); await page.waitForSelector('#pMic', { timeout: 5000 });
    await page.click('.backbtn'); await page.waitForTimeout(250);
    if (!await page.$('#playAll')) problems.push(L + ': "Back" in the test does not go back to the letter');
    // The result is not shown again when the letter is opened later from the list.
    await page.evaluate(() => { PR = { sec: 'B', mode: 'done', avg: 50, log: [] }; location.hash = '#/pronounce'; }); await page.waitForSelector('.pcard', { timeout: 5000 });
    await page.click('.pcard[data-go="#/pronounce/B"]'); await page.waitForTimeout(250);
    if (!await page.$('#playAll')) problems.push(L + ': opening the letter from the list shows the old result');
    // A letter with no words (a teacher emptied it) cannot start a test.
    await page.evaluate(() => { pronSecs().find(s => s.id === 'B').groups = []; renderPron('B'); });
    if (!await page.$eval('#startPT', b => b.disabled)) problems.push(L + ': a letter with no words can start a test');
    // The unclear word in "Practise my mistakes": a different word is not accepted, the word itself is, and after two rounds it has left the list.
    // In teacher mode, and for an empty word, nothing is remembered.
    await page.evaluate(() => { location.hash = '#/mistakes'; }); await page.waitForSelector('#mkBody #mic', { timeout: 5000 });
    const w1 = await page.evaluate(() => ({ title: document.querySelector('.mkt').innerText, word: document.querySelector('#tgt').innerText.trim(), from: document.querySelector('.mkfrom').innerText }));
    await page.evaluate(() => { window._heard = 'banana'; }); await page.click('#mic'); await page.waitForSelector('#result .result', { timeout: 5000 });
    w1.bad = await page.evaluate(() => document.querySelector('#mkFb').innerText + ' | ' + Object.values(mistakes).map(r => r.ok).join());
    await page.screenshot({ path: path.join(shots, 'phone-mistakes-word.png') });
    await page.evaluate(() => { window._heard = MK.q[MK.i].item.text; }); await page.click('#mic'); await page.waitForFunction(() => /One more/.test(document.querySelector('#mkFb').innerText), null, { timeout: 5000 });
    w1.over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.click('#mkNext'); await page.waitForSelector('#mkEnd', { timeout: 5000 }); await page.waitForTimeout(450); await page.click('[data-act=again]'); await page.waitForSelector('#mkBody #mic', { timeout: 5000 });
    await page.evaluate(() => { window._heard = MK.q[MK.i].item.text; }); await page.click('#mic'); await page.waitForFunction(() => /Learned/.test(document.querySelector('#mkFb').innerText), null, { timeout: 5000 });
    w1.left = await page.evaluate(() => { const before = Object.keys(mistakes).length; mode = 'teacher'; noteWord('lamb'); mode = 'student'; noteWord('  '); return before + '/' + Object.keys(mistakes).length; });
    if (w1.title !== 'Say this word clearly' || w1.word !== unclear || !/Pronunciation/.test(w1.from) || !/another round\. \| 0$/.test(w1.bad) || w1.over > 1 || w1.left !== '0/0')
      problems.push(L + ': the unclear word is not practised properly in "Practise my mistakes" ' + JSON.stringify({ unclear, ...w1 }));
  } catch (e) { problems.push(L + ': could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Test your speaking on a phone with a pretend recogniser: topic → "← Back" → topic → record → result → "Choose another topic" → an old
// recording → "← Back". The topic page and a fresh result have the list's own address, so these links once did nothing or showed the old result.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, permissions: ['microphone'] }), page = await ctx.newPage(), L = 'test your speaking';
  watch(page, L);
  try {
    await page.addInitScript(() => { window.SpeechRecognition = window.webkitSpeechRecognition = class {
      start() { this._t = setTimeout(() => { const parts = 'Hello my name is Sam and I live in a small town with my family. My mother is a teacher and he go to work by car every day. We like playing football together at the weekend because it is really good'.split('. '); if (this.onresult) this.onresult({ results: parts.map(p => Object.assign([{ transcript: p, confidence: 0.9 }], { isFinal: true })) }); }, 60); }
      stop() { clearTimeout(this._t); setTimeout(() => this.onend && this.onend(), 20); } abort() { clearTimeout(this._t); } }; });
    await page.goto(base + '/#/speaking', { waitUntil: 'load' }); await page.waitForSelector('[data-sp]', { timeout: 10000 });
    const mode = () => page.evaluate(() => SPK.mode);
    await page.click('[data-sp]'); await page.waitForSelector('#spGo', { timeout: 5000 });
    await page.click('.backbtn'); await page.waitForTimeout(200);
    if (await mode() !== 'pick') problems.push(L + ': "← Back" on a topic page does not return to the topics');
    await page.click('[data-sp]'); await page.click('#spGo'); await page.waitForSelector('#spStop', { timeout: 5000 }); await page.waitForTimeout(300);
    await page.evaluate(() => { SPK.rec.t0 -= 70000; }); await page.waitForTimeout(250);   // pretend 70 seconds have passed
    await page.click('#spStop'); await page.waitForSelector('#spAgain', { timeout: 8000 });
    const r = await page.evaluate(() => ({ words: SPK.rec.A.words, errs: SPK.rec.A.errors.length, n: spHistory.length, over: document.documentElement.scrollWidth - innerWidth }));
    if (r.words < 30 || r.errs !== 1 || r.n !== 1) problems.push(L + ': the result is not what the recording said (' + JSON.stringify(r) + ')');
    if (r.over > 1) problems.push(L + ': the result is ' + r.over + 'px wider than the screen');
    await page.screenshot({ path: path.join(shots, 'phone-speaking-result.png') });
    await page.click('.spfoot a[href="#/speaking"]'); await page.waitForTimeout(200);
    if (await mode() !== 'pick' || !await page.$('.sphist')) problems.push(L + ': "Choose another topic" on a new result does not return to the topics');
    await page.click('.sphist a'); await page.waitForSelector('#spAgain', { timeout: 5000 });
    await page.click('.backbtn'); await page.waitForTimeout(300);
    if (await mode() !== 'pick') problems.push(L + ': "← Back" from an old recording shows the recording again');
    // A topic a teacher has not finished writing is not shown to students.
    const cards = await page.evaluate(() => { state.speaking.tasks.push({ id: 'half', level: 'B1', register: 'informal', title: '', prompt: '', ideas: [] }); renderSpeaking(); return [...document.querySelectorAll('.sptask b')].filter(b => !b.innerText.trim()).length; });
    if (cards) problems.push(L + ': a topic with no title is shown to students');
  } catch (e) { problems.push(L + ': could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

// Accounts switched on (pretend accounts server): the welcome page comes first, a visitor only opens the sample,
// and after signing up the student is the account and every call to /api/* carries the session.
{
  const L = 'accounts', ctx = await browser.newContext({ viewport: { width: 390, height: 800 } }), page = await ctx.newPage();
  watch(page, L);
  try {
    const calls = [], posts = [], refreshes = []; let meDown = false, letter = 'a', rt = 'r'.repeat(20);
    await ctx.route('**/api/**', r => {
      const q = r.request(), url = q.url(), signed = !!q.headers().authorization;
      if (url.includes('/api/class') && q.method() === 'POST') posts.push(JSON.parse(q.postData() || '{}').action);
      if (!url.includes('/api/auth')) { calls.push((url.includes('/api/class') ? 'class' : 'voice') + (signed ? '+session' : '')); return r.fulfill({ json: q.method() === 'GET' ? { ok: true, speech: false, ai: false, save: true } : { ok: true } }); }
      if (q.method() === 'GET') return r.fulfill({ json: { ok: true, auth: true, google: false } });
      const d = JSON.parse(q.postData() || '{}'), me = { id: 'u1', email: 'sara@example.com', name: 'Sara <Test>', role: 'student', className: 'Grade 10 A', classCode: 'ABC234', teacher: 'Mr Ahmed' };
      if (d.action === 'code') return r.fulfill({ json: d.code === 'ABC234' ? { ok: true, code: 'ABC234', className: 'Grade 10 A', teacher: 'Mr Ahmed' } : { ok: false, error: 'bad code' } });
      if (d.action === 'signup') return r.fulfill({ json: { ok: true, session: { access_token: 'a'.repeat(40), refresh_token: 'r'.repeat(20), expires_at: Math.floor(Date.now() / 1000) + 3600 }, me } });
      // a second student for the same computer: omar@example.com signs in with a session that starts with "b"
      const me2 = { id: 'u2', email: 'omar@example.com', name: 'Omar Test', role: 'student', className: '', classCode: '', teacher: '' }, me3 = { id: 'u3', email: 'teacher@example.com', name: 'Mr Ahmed', role: 'teacher', classes: [{ id: 'c1', name: 'Grade 10 A', code: 'ABC234', students: 0 }] }, who = /Bearer b/.test(q.headers().authorization || '') ? me2 : /Bearer c/.test(q.headers().authorization || '') ? me3 : me;
      if (d.action === 'login') { const m = d.email === 'omar@example.com' ? me2 : d.email === 'teacher@example.com' ? me3 : me; letter = m === me2 ? 'b' : m === me3 ? 'c' : 'a'; return r.fulfill({ json: { ok: true, session: { access_token: letter.repeat(40), refresh_token: 'r'.repeat(20), expires_at: Math.floor(Date.now() / 1000) + 3600 }, me: m } }); }
      // a refresh token works once (as in Supabase): a second use is refused
      if (d.action === 'refresh') { refreshes.push(d.refresh_token); if (d.refresh_token !== rt) return r.fulfill({ json: { ok: false, error: 'sign in' } }); rt = 'n' + refreshes.length + 'x'.repeat(18); return r.fulfill({ json: { ok: true, session: { access_token: letter.repeat(40), refresh_token: rt, expires_in: 3600 } } }); }
      if (signed && d.action === 'me' && meDown) return r.fulfill({ json: { ok: false, error: 'server error' } });
      return r.fulfill({ json: signed && d.action === 'me' ? { ok: true, me: who } : { ok: false, error: 'sign in' } });
    });
    const text = () => page.evaluate(() => document.querySelector('#app').innerText), wide = async what => { const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 1) problems.push(`${L}: ${what} is ${o}px wider than the screen`); };
    await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForSelector('.welcome', { timeout: 10000 }); await wide('the welcome page');
    await page.screenshot({ path: path.join(shots, 'phone-accounts-welcome.png') });
    if (await page.evaluate(() => getComputedStyle(document.querySelector('header .seg')).display !== 'none')) problems.push(L + ': a visitor sees the Student/Teacher switch');
    await page.evaluate(() => { location.hash = '#/listening'; }); await page.waitForTimeout(300);
    if (!/Create a free account to open/.test(await text())) problems.push(L + ': a visitor can open Listening without an account');
    await page.evaluate(() => { location.hash = '#/welcome'; }); await page.waitForSelector('#wlVisit'); await page.click('#wlVisit'); await page.waitForTimeout(400);
    if (await page.evaluate(() => document.querySelector('#visbar').hidden)) problems.push(L + ': the visitor bar is not shown on the sample');
    // the visitor's home page says what is locked (🔒) and lists the sample
    await page.waitForSelector('#vsample', { timeout: 5000 }).catch(() => problems.push(L + ': the visitor\'s home page does not list the free sample'));
    const lk = await page.evaluate(() => { const hrefs = q => [...document.querySelectorAll(q)].map(a => a.getAttribute('href')); return {
      tabs: hrefs('.tabbar a.lk').join(' '), cards: hrefs('#app a.ptest.lk').join(' '), free: hrefs('#app a.ptest:not(.lk)').join(' '), tags: document.querySelectorAll('#app a.ptest > .lktag').length,
      sample: hrefs('#vsample .vslist a'), wrong: [...document.querySelectorAll('#app a[href^="#/"], .tabbar a')].filter(a => a.classList.contains('lk') !== authLocked(a.getAttribute('href'))).length,
      lock: getComputedStyle(document.querySelector('.tabbar a.lk') || document.body, '::after').content, want: 1 + LEVELS.filter(l => state.levels[l.id].lessons[0]).length, boxes: document.querySelectorAll('#vsample').length }; });
    if (lk.tabs !== '#/voicetest #/pronounce #/listening #/speaking #/progress #/students') problems.push(L + ': the tab bar marks the wrong links as locked for a visitor: ' + lk.tabs);
    if (lk.cards !== '#/voicetest #/pronounce #/listening #/speaking' || lk.free !== '#/placement' || lk.tags !== 5) problems.push(L + `: the home cards are not marked for a visitor (locked: ${lk.cards}; free: ${lk.free}; labels: ${lk.tags})`);
    if (lk.sample.length !== lk.want || lk.sample[0] !== '#/placement' || lk.wrong || lk.boxes !== 1 || !/🔒/.test(lk.lock)) problems.push(L + ': the visitor\'s sample box or lock marks are wrong ' + JSON.stringify(lk));
    await wide('the visitor\'s home page'); await page.screenshot({ path: path.join(shots, 'phone-accounts-visitor-home.png'), fullPage: true });
    await page.click('#vsample .vslist a:nth-child(2)'); await page.waitForTimeout(300);
    if (/Create a free account to open/.test(await text())) problems.push(L + ': a lesson in the visitor\'s sample box does not open');
    await page.evaluate(() => { location.hash = '#/level/a1'; }); await page.waitForSelector('.lcard .lktag', { timeout: 5000 }).catch(() => 0);
    const lv = await page.evaluate(() => [...document.querySelectorAll('.lcard[data-open]')].map(c => (c.classList.contains('lk') ? 'L' : 'F') + c.querySelectorAll('.lktag').length).join(' '));
    if (lv !== 'F1 L1 L1') problems.push(L + ': a visitor\'s level page should mark the first lesson free and the others locked: ' + lv);
    await wide('the visitor\'s level page'); await page.screenshot({ path: path.join(shots, 'phone-accounts-visitor-level.png') });
    await page.evaluate(() => { location.hash = '#/placement'; }); await page.waitForTimeout(300);
    if (/Create a free account to open/.test(await text())) problems.push(L + ': a visitor cannot open the placement test');
    const les = await page.evaluate(() => state.levels.a1.lessons.map(l => l.id));
    await page.evaluate(id => { location.hash = '#/lesson/a1/' + id; }, les[0]); await page.waitForTimeout(300); const first = !/Create a free account to open/.test(await text());
    await page.evaluate(id => { location.hash = '#/lesson/a1/' + id; }, les[1]); await page.waitForTimeout(300); const second = /Create a free account to open/.test(await text());
    if (!first || !second) problems.push(L + ': a visitor should open only the first lesson of a level');
    await page.evaluate(() => { location.hash = '#/join/ABC234'; }); await page.waitForSelector('#acctNew', { state: 'visible', timeout: 5000 }); await page.click('#acctNew');
    await page.waitForSelector('input[name=classCode]'); await wide('the sign-up page');
    await page.fill('input[name=name]', 'Sara <Test>'); await page.fill('input[name=email]', 'sara@example.com'); await page.fill('input[name=password]', 'short'); await page.click('#acctGo');
    if (!/8 letters/.test(await page.textContent('#acctFErr'))) problems.push(L + ': a short password is accepted');
    await page.screenshot({ path: path.join(shots, 'phone-accounts-signup.png') });
    // practice that was on the device before the first account: the first account that signs in keeps it
    await page.evaluate(async () => { lessonsDone.before = 1; await DB.put('kv', 'lessonsDone', lessonsDone); });
    await page.fill('input[name=password]', 'long-enough-1'); await page.click('#acctGo'); await page.waitForFunction(() => authSignedIn(), null, { timeout: 5000 }); await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ email: student && student.email, cls: student && student.cls, html: !!document.querySelector('#acctBtn b, #acctBtn test'), bar: !document.querySelector('#visbar').hidden }));
    if (r.email !== 'sara@example.com' || r.cls !== 'Grade 10 A' || r.html || r.bar) problems.push(L + ': after signing up the student is not the account (' + JSON.stringify(r) + ')');
    if (await page.evaluate(() => document.querySelectorAll('.lk, .lktag, #vsample').length)) problems.push(L + ': a signed-in student still sees the visitor\'s locks or sample box');
    await page.evaluate(() => { location.hash = '#/listening'; }); await page.waitForTimeout(300);
    if (/Create a free account to open/.test(await text())) problems.push(L + ': a signed-in student cannot open Listening');
    await page.evaluate(() => sendProgress()); await page.waitForTimeout(300);
    if (!calls.includes('class+session')) problems.push(L + ': the progress is sent without the session (' + calls.join(' ') + ')');
    await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => typeof authSignedIn === 'function' && authSignedIn(), null, { timeout: 8000 }).catch(() => problems.push(L + ': the student is signed out after a reload'));
    await page.click('#acctBtn'); await page.click('#acctOut'); await page.waitForSelector('.welcome', { timeout: 5000 });
    if (await page.evaluate(() => !!student || !!localStorage.getItem('die_session'))) problems.push(L + ': signing out keeps the student or the session');
    // Two students on one computer: each account has its own saved practice, and signing out leaves an empty visitor set.
    const mine = () => page.evaluate(async () => ({ who: (await DB.get('kv', 'owner') || {}).id, mem: Object.keys(lessonsDone).join(), db: Object.keys(await DB.get('kv', 'lessonsDone') || {}).join(), days: Object.keys(activity.days || {}).length, mix: mixBest.best, heard: Object.keys(pronHeard).join(), goal: localStorage.getItem('die_goal'), placed: localStorage.getItem('die_placed') }));
    const signIn = async email => { await page.evaluate(() => { location.hash = '#/login'; }); await page.waitForSelector('input[name=password]'); await page.fill('input[name=email]', email); await page.fill('input[name=password]', 'long-enough-1'); await page.click('#acctGo'); await page.waitForFunction(e => authSignedIn() && student && student.email === e && !document.querySelector('.acctpage'), email, { timeout: 5000 }); await page.waitForTimeout(300); };
    const signOut = async () => { await page.click('#acctBtn'); await page.click('#acctOut'); await page.waitForSelector('.welcome', { timeout: 5000 }); await page.waitForTimeout(200); };
    const same = (got, want, what) => { const g = JSON.stringify(got); if (g !== JSON.stringify(want)) problems.push(`${L}: ${what}: ${g}`); };
    const empty = { mem: '', db: '', days: 0, mix: 0, heard: '', goal: null, placed: null };
    same(await mine(), { who: 'visitor', ...empty }, 'after signing out the device still shows the student\'s practice');
    await signIn('sara@example.com');
    same(await mine(), { who: 'u1', ...empty, mem: 'before', db: 'before' }, 'the first account did not get the practice the device already had');
    await page.evaluate(async () => { await markLessonDone('sara-lesson'); mixBest = { best: 7, plays: 1 }; await DB.put('kv', 'mixBest', mixBest); pronHeard.B = new Set(['bag']); await saveHeard(); localStorage.setItem('die_goal', '3'); localStorage.setItem('die_placed', 'a2'); });
    const sara = { who: 'u1', mem: 'before,sara-lesson', db: 'before,sara-lesson', days: 1, mix: 7, heard: 'B', goal: '3', placed: 'a2' };
    await signOut(); same(await mine(), { who: 'visitor', ...empty }, 'signing out did not leave an empty visitor set');
    await page.evaluate(async () => { await markLessonDone('visitor-lesson'); });   // a visitor tries the sample, then a new student signs in: it stays with them
    await signIn('omar@example.com');
    same(await mine(), { who: 'u2', ...empty, mem: 'visitor-lesson', db: 'visitor-lesson', days: 1 }, 'a second student on the same device does not start with only what they did as a visitor');
    if (/Sara|7 pairs/.test(await text())) problems.push(L + ': the second student\'s home page shows the first student');
    await page.evaluate(async () => { await markLessonDone('omar-lesson'); localStorage.setItem('die_goal', '5'); });
    await page.screenshot({ path: path.join(shots, 'phone-accounts-second-student.png') });
    await signOut(); await signIn('sara@example.com'); same(await mine(), sara, 'the first student did not get their own practice back');
    await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => typeof authSignedIn === 'function' && authSignedIn() && !!document.querySelector('#app').innerHTML, null, { timeout: 8000 }); await page.waitForTimeout(300);
    same(await mine(), sara, 'the first student\'s practice after a reload');
    await signOut(); await signIn('omar@example.com'); same(await mine(), { who: 'u2', ...empty, mem: 'visitor-lesson,omar-lesson', db: 'visitor-lesson,omar-lesson', days: 1, goal: '5' }, 'the second student did not get their own practice back');
    // the page was closed in the middle of a change: the next start lays the set again and the put-away sets are untouched
    await page.evaluate(async () => { await DB.put('kv', 'owner', { id: 'u2', laying: true }); await DB.put('kv', 'lessonsDone', { broken: 1 }); });
    await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => typeof authSignedIn === 'function' && authSignedIn() && !!document.querySelector('#app').innerHTML, null, { timeout: 8000 }); await page.waitForTimeout(300);
    const again = await mine(); if (again.who !== 'u2' || /broken/.test(again.mem + again.db)) problems.push(L + ': a half-finished change of student was not repaired: ' + JSON.stringify(again));
    // the accounts server is in trouble when the page opens: the student is not signed out
    const started = p => p.waitForFunction(() => typeof authSignedIn === 'function' && !!document.querySelector('#app').innerHTML, null, { timeout: 8000 }).then(() => p.waitForTimeout(300));
    meDown = true; await page.reload({ waitUntil: 'load' }); await started(page); meDown = false;
    if (!(await page.evaluate(() => authSignedIn() && student && student.email === 'omar@example.com'))) problems.push(L + ': a server error at start-up signs the student out');
    // two tabs, an hour later: the second tab uses the session the first one renewed (a refresh token works once)
    const tab2 = await ctx.newPage(); watch(tab2, L + ' (second tab)'); await tab2.goto(base + '/', { waitUntil: 'load' }); await started(tab2);
    for (const p of [page, tab2]) await p.evaluate(() => { auth.session.expires_at = 0; });
    await page.evaluate(() => sendProgress()); await page.waitForTimeout(400); await tab2.evaluate(() => sendProgress()); await tab2.waitForTimeout(600);
    const tabs = [await page.evaluate(() => typeof authSignedIn === 'function' && authSignedIn()), await tab2.evaluate(() => typeof authSignedIn === 'function' && authSignedIn())];
    if (refreshes.length !== 1 || !tabs[0] || !tabs[1]) problems.push(`${L}: two tabs do not share a renewed session (renewed ${refreshes.length} times, signed in: ${tabs.join(' ')})`);
    await tab2.close();
    // a teacher account is not a student: not in its own Students table, and its practice is not sent as a student's
    await signOut(); await signIn('teacher@example.com'); posts.length = 0;
    await page.evaluate(() => { document.querySelector('.seg button[data-mode=teacher]').click(); location.hash = '#/students'; }); await page.waitForSelector('#acctClasses', { timeout: 5000 });
    await page.evaluate(() => sendProgress()); await page.waitForTimeout(400);
    const tch = await page.evaluate(() => ({ rows: document.querySelectorAll('#app .rtable tbody tr').length, name: document.querySelector('#acctBtn').textContent.trim() }));
    if (tch.rows || posts.includes('progress') || !/Mr Ahmed/.test(tch.name)) problems.push(L + ': a teacher account is treated as a student ' + JSON.stringify({ ...tch, posts }));
    await wide('the teacher\'s Students page'); await page.screenshot({ path: path.join(shots, 'phone-accounts-teacher-students.png'), fullPage: true });
  } catch (e) { problems.push(L + ': could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

await browser.close(); stop();
if (problems.length) { console.log('SMOKE TEST FAILED\n' + [...new Set(problems)].map(p => ' ✗ ' + p).join('\n')); process.exit(1); }
console.log(`Smoke test passed: ${SCREENS.length} screen sizes, ${ROUTES.length + TEACHER_ROUTES.length} pages each, placement test, lesson, practise my mistakes, mixed match and every listening exercise on a phone, accounts (welcome page, visitor sample, two students on one device, sign-up, two tabs, teacher account), voice test finished, a whole pronounce letter, test your speaking, pronounce with the speech service, students voice column, filter and history checked, "Try again" states checked. Screenshots: ${shots}`);
