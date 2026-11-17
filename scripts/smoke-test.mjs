// Smoke test:  npm run smoke
// Starts the local server, opens every page in headless Chrome on a phone and a desktop screen and fails on:
//   - JavaScript errors, - a page that renders nothing, - sideways scrolling (layout wider than the screen).
// Then takes the whole Voice level test with a fake microphone. Screenshots go to /tmp/smoke/ (look at them after a design change).
// Needs Playwright + Chrome. Set PLAYWRIGHT_PATH / CHROME_PATH if they are somewhere else.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
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
    if (r.tasks !== 2 || r.sentences !== 4 || !r.audio) problems.push('voice test: the result is incomplete ' + JSON.stringify(r));
    if (r.over > 1) problems.push(`voice test result: ${r.over}px wider than the phone screen`);
    await page.screenshot({ path: path.join(shots, 'phone-voice-result.png'), fullPage: true });
  } catch (e) { problems.push('voice test: could not finish — ' + e.message.split('\n')[0]); }
  await ctx.close();
}

await browser.close(); stop();
if (problems.length) { console.log('SMOKE TEST FAILED\n' + [...new Set(problems)].map(p => ' ✗ ' + p).join('\n')); process.exit(1); }
console.log(`Smoke test passed: ${SCREENS.length} screen sizes, ${ROUTES.length + TEACHER_ROUTES.length} pages each, voice test finished. Screenshots: ${shots}`);
