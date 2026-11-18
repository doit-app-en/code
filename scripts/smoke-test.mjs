// Smoke test:  npm run smoke
// Starts the local server, opens every page in headless Chrome on a phone and a desktop screen and fails on:
//   - JavaScript errors, - a page that renders nothing, - sideways scrolling (layout wider than the screen).
// Then takes the whole Voice level test with a fake microphone. Screenshots go to /tmp/smoke/ (look at them after a design change).
// Needs Playwright + Chrome. Set PLAYWRIGHT_PATH / CHROME_PATH if they are somewhere else.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
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

for (const screen of SCREENS) {
  const ctx = await browser.newContext({ viewport: { width: screen.width, height: screen.height }, permissions: ['microphone'] }), page = await ctx.newPage();
  watch(page, screen.name);
  await page.goto(base + '/', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('#app').innerText.trim().length > 20, null, { timeout: 10000 });
  // Home page of a new student: the 3-step path and the five practice tiles; of a returning one: the streak card with a "continue" link.
  { const h = await page.evaluate(async () => { const a = { steps: document.querySelectorAll('#startp .step3').length, tiles: document.querySelectorAll('.pgrid a.ptest').length };
      const keep = activity; activity = { last: Date.now(), days: { [todayKey()]: 1 } }; renderHome(); a.streak = (document.querySelector('#today .tstreak b') || {}).textContent; a.next = !!document.querySelector('#today a.tnext'); activity = keep; renderHome(); return a; });
    if (h.steps !== 3 || h.tiles !== 5 || h.streak !== '1' || !h.next) problems.push(`${screen.name} home: path, practice tiles or streak card is wrong ` + JSON.stringify(h)); }
  for (const route of ROUTES) await visit(page, screen, route, 'student');
  await page.evaluate(() => { mode = 'teacher'; setModeButtons(); render(); });
  for (const route of TEACHER_ROUTES) await visit(page, screen, route, 'teacher');
  await ctx.close();
}

// The whole Voice level test with a fake microphone (the fake microphone says no words, so every score is 0).
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, permissions: ['microphone'] }), page = await ctx.newPage();
  watch(page, 'voice test');
  try {
    await page.goto(base + '/#/voicetest', { waitUntil: 'load' }); await page.waitForSelector('#vtStart', { timeout: 10000 }); await page.click('#vtStart');
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
    await page.screenshot({ path: path.join(shots, 'phone-voice-result.png'), fullPage: true });
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
    let down = true, voiceDown = true;
    const test = { id: 'abcdef0123456789abcdef01', date: now, level: 'A2', overall: 64, speaking: 60, pronunciation: 71, repeating: 62 };
    await page.route('**/api/class**', async r => { if (down) return r.abort(); if (r.request().method() === 'POST') return r.fulfill({ json: { ok: true } });
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
    // 6. No internet: the bar under the header appears and goes away again.
    await ctx.setOffline(true); await page.waitForFunction(() => !document.querySelector('#offbar').hidden, null, { timeout: 5000 });
    const over = await page.evaluate(() => { scrollTo({ top: 0, behavior: 'instant' }); return document.documentElement.scrollWidth - innerWidth; }); if (over > 1) problems.push(`friendly states: the "no internet" bar makes the page ${over}px wider than the phone screen`);
    await page.waitForTimeout(200); await page.screenshot({ path: path.join(shots, 'phone-state-offline.png') });
    await ctx.setOffline(false); await page.waitForFunction(() => document.querySelector('#offbar').hidden, null, { timeout: 5000 });
  } catch (e) { problems.push('friendly states: could not check — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

await browser.close(); stop();
if (problems.length) { console.log('SMOKE TEST FAILED\n' + [...new Set(problems)].map(p => ' ✗ ' + p).join('\n')); process.exit(1); }
console.log(`Smoke test passed: ${SCREENS.length} screen sizes, ${ROUTES.length + TEACHER_ROUTES.length} pages each, voice test finished, students voice column, filter and history checked, "Try again" states checked. Screenshots: ${shots}`);
