/* ================= picture helper ================= */
function imgHTML(img) {
  if (img && img.m) return urlCache[img.m] ? `<img src="${urlCache[img.m]}" alt="">` : `<span class="emo">🖼️</span>`;
  return `<span class="emo">${esc((img && img.e) || '🖼️')}</span>`;
}

/* ================= hero scene ================= */
const SCENE = `
<svg viewBox="0 0 560 420" role="img" aria-label="A happy student in a classroom with a chalkboard, books and a globe">
  <text class="fl" x="18" y="70" font-size="44" fill="#7b61ff">A</text>
  <text class="fl" x="520" y="40" font-size="38" fill="#ff6b6b">b</text>
  <text class="fl" x="8" y="210" font-size="34" fill="#2ec4b6">c</text>
  <text class="fl" x="525" y="250" font-size="30" fill="#ffb703">?</text>
  <rect x="62" y="28" width="410" height="236" rx="16" fill="#a0612a"/>
  <rect x="76" y="42" width="382" height="208" rx="9" fill="#2f6b4f"/>
  <path d="M86 60 h120" stroke="#fff" stroke-width="2" opacity=".08"/>
  <text x="100" y="108" font-size="52" fill="#ffffff">Hello!</text>
  <text x="102" y="150" font-size="25" fill="#ffe8a3">How are you?</text>
  <text x="102" y="206" font-size="32" fill="#bde0fe" letter-spacing="10">A b C</text>
  <text x="290" y="96" font-size="24" fill="#ffadad">I love</text>
  <text x="290" y="128" font-size="30" fill="#ffadad">English</text>
  <path d="M290 140 q22 12 90 0" stroke="#ffadad" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M250 222 q15 -26 30 0 t30 0 t30 0" stroke="#fff" fill="none" stroke-width="3" opacity=".5" stroke-linecap="round"/>
  <rect x="120" y="256" width="300" height="10" rx="4" fill="#7a4a1f"/>
  <rect x="150" y="249" width="30" height="8" rx="3" fill="#fff"/><rect x="190" y="250" width="22" height="7" rx="3" fill="#ffd6e0"/>
  <rect x="0" y="352" width="560" height="68" fill="#f2c879"/>
  <rect x="0" y="344" width="560" height="14" rx="5" fill="#d9a752"/>
  <rect x="24" y="318" width="124" height="27" rx="5" fill="#7b61ff"/><rect x="24" y="328" width="124" height="5" fill="#fff" opacity=".35"/>
  <rect x="34" y="296" width="104" height="22" rx="5" fill="#ff6b6b"/>
  <rect x="42" y="274" width="90" height="22" rx="5" fill="#4cc9f0"/><text x="64" y="291" font-size="15" fill="#fff">ABC</text>
  <rect x="50" y="254" width="76" height="20" rx="5" fill="#2ec4b6"/>
  <circle cx="88" cy="238" r="16" fill="#e63946"/><path d="M88 222 q2 -9 9 -12" stroke="#6b3e1f" stroke-width="3" fill="none"/><ellipse cx="97" cy="216" rx="8" ry="4" fill="#52b788" transform="rotate(-25 97 216)"/>
  <g transform="translate(478,282)">
    <rect x="-30" y="52" width="60" height="9" rx="4" fill="#5c5c6e"/><rect x="-4" y="34" width="8" height="20" fill="#7c7c90"/>
    <circle r="40" fill="#4cc9f0"/>
    <path d="M-22 -26 q12 -8 22 0 q8 10 -4 18 q-14 4 -12 16 q-12 -4 -14 -14 q-2 -12 8 -20z" fill="#2ec4b6"/>
    <path d="M10 6 q14 -6 22 6 q2 14 -10 20 q-10 -2 -12 -12z" fill="#2ec4b6"/>
    <path d="M-46 0 a46 46 0 0 0 46 46" stroke="#a6a6b8" stroke-width="5" fill="none"/>
  </g>
  <g transform="translate(272,248)">
    <path d="M-60 100 q0 -64 60 -64 q60 0 60 64z" fill="#ffb703"/>
    <path d="M-14 38 l14 16 l14 -16" fill="#fff"/>
    <g class="wave"><path d="M44 62 q30 -40 22 -108" stroke="#ffb703" stroke-width="20" stroke-linecap="round" fill="none"/><circle cx="66" cy="-54" r="13" fill="#f4c7a1"/></g>
    <circle cy="-4" r="38" fill="#f4c7a1"/>
    <path d="M-38 -6 q-2 -44 38 -44 q40 0 38 44 q-12 -24 -38 -24 q-26 0 -38 24z" fill="#3d2c2a"/>
    <circle cx="-13" cy="-2" r="4.5" fill="#24304f"/><circle cx="13" cy="-2" r="4.5" fill="#24304f"/>
    <circle cx="-22" cy="10" r="6" fill="#ff9aa2" opacity=".6"/><circle cx="22" cy="10" r="6" fill="#ff9aa2" opacity=".6"/>
    <path d="M-12 14 q12 13 24 0" stroke="#24304f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </g>
  <path d="M206 350 q33 -14 66 0 q33 -14 66 0 v-30 q-33 -14 -66 0 q-33 -14 -66 0z" fill="#fff" stroke="#e1d6c2" stroke-width="2"/>
  <path d="M272 320 v30" stroke="#e1d6c2" stroke-width="2"/>
  <path d="M220 330 h38 M220 338 h30 M286 330 h38 M286 338 h30" stroke="#c9d3ea" stroke-width="3" stroke-linecap="round"/>
  <g class="float1"><rect x="378" y="150" width="160" height="56" rx="28" fill="#fff"/><path d="M400 200 l-12 22 l30 -18z" fill="#fff"/><text x="458" y="187" text-anchor="middle" font-size="24" fill="#ff6b6b">Let's talk!</text></g>
  <g class="float2"><rect x="10" y="100" width="92" height="50" rx="25" fill="#fff"/><path d="M80 146 l18 20 l-4 -24z" fill="#fff"/><text x="56" y="134" text-anchor="middle" font-size="26" fill="#4361ee">Hi! 👋</text></g>
</svg>`;

/* ================= routing ================= */
let mode = ls('die_mode') || 'student';
// 🔊 voice chooser (per device)
function fillVoices() {
  const sel = $('#voiceSel'); if (!sel || !('speechSynthesis' in window)) return;
  const vs = englishVoices().sort((a, b) => (/en[-_]GB/i.test(b.lang) - /en[-_]GB/i.test(a.lang)) || a.name.localeCompare(b.name));
  const cur = britishVoice();
  sel.innerHTML = vs.length ? vs.map(v => `<option value="${esc(v.name)}" ${cur && cur.name === v.name ? 'selected' : ''}>${esc(v.name.replace(/^Microsoft /, ''))} · ${v.lang}${v.localService ? '' : ' (online)'}</option>`).join('')
    : '<option>No English voice on this device</option>';
}
$('#voiceBtn').onclick = async e => { e.stopPropagation(); await voicesLoaded(); fillVoices(); $('#vpop').hidden = !$('#vpop').hidden; };
$('#vpop').onclick = e => e.stopPropagation();
document.addEventListener('click', () => { $('#vpop').hidden = true; });
$('#voiceSel').onchange = () => { ls('die_voice', $('#voiceSel').value); badVoice.delete($('#voiceSel').value); say('Hello! This is my English voice.'); };
$('#voiceTest').onclick = () => say('Look at the hat on the shelf. It is brown.');
$('#voiceAuto').onclick = () => { try { localStorage.removeItem('die_voice'); } catch (e) {} fillVoices(); say('Hello! This is my English voice.'); toast('Voice: automatic'); };
function setModeButtons() { document.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode)); document.body.classList.toggle('teacher', mode === 'teacher'); }
document.querySelectorAll('.seg button').forEach(b => b.onclick = () => { mode = b.dataset.mode; ls('die_mode', mode); setModeButtons(); render(true);
  toast(mode === 'teacher' ? 'Teacher mode: you can now add and edit content' : 'Student mode'); });
const go = h => { location.hash = h; };
let lastRoute = '';
// Highlights the current section in the top menu and in the phone tab bar.
function markNav(route) {
  const sec = route.replace(/^#\/?/, '').split('/')[0], cur = ['placement', 'voicetest', 'pronounce', 'listening', 'speaking', 'progress', 'students'].includes(sec) ? '#/' + sec : '#/';
  document.querySelectorAll('.navlinks a.hide-sm, .tabbar a').forEach(a => { const on = a.getAttribute('href') === cur; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const act = document.querySelector('.tabbar a.on'); if (act && act.scrollIntoView && getComputedStyle(act.parentNode).display !== 'none') act.scrollIntoView({block: 'nearest', inline: 'center'});
}
function render(keepScroll) {
  stopAll();
  const route = location.hash || '#/';
  markNav(route);
  if (!keepScroll && route !== lastRoute) window.scrollTo(0, 0);
  lastRoute = route;
  const p = route.replace(/^#\/?/, '').split('/');
  if (p[0] === 'placement') return renderPlacement();
  if (p[0] === 'pronounce') return renderPron(p[1]);
  if (p[0] === 'listening') return renderListen(p[1]);
  if (p[0] === 'speaking') return renderSpeaking(p.slice(1).join('/'));
  if (p[0] === 'voicetest') return renderVoiceTest(p.slice(1).join('/'));
  if (p[0] === 'progress') return renderProgress();
  if (p[0] === 'students') { renderStudents(); if (syncUrl() && classList === null && !classErr) loadClass().then(() => location.hash === '#/students' && renderStudents()); return; }
  if (p[0] === 'level' && state.levels[p[1]]) return renderLevel(p[1]);
  if (p[0] === 'lesson' && state.levels[p[1]]) return renderLesson(p[1], p[2]);
  renderHome();
}
window.addEventListener('hashchange', () => render());

