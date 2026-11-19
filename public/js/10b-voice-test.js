/* ================= VOICE LEVEL TEST ================= */
// A 3-minute spoken test: (1) answer a question, (2) describe a picture, (3) listen to sentences in a British voice and repeat them.
// The browser records the voice as WAV. If the class server has a speech service (Azure Speech, see /api/voice), it writes the words down
// and scores the pronunciation; otherwise the browser's own speech recognition is used ("basic check"). Claude writes the summary if it is on.
const VT_TALK = 45, VT_REPEAT = 15, VT_KEEP = 10, VT_API = '/api/voice';
const VT_QUESTIONS = [
  'Tell me about yourself. What do you like doing in your free time?',
  'Tell me about your family or your best friend.',
  'What do you usually do at the weekend?',
  'Tell me about your school. What is your favourite subject, and why?',
  'What did you do yesterday? Tell me about your day.',
  'Tell me about your town or city. What do you like about it?',
  'What would you like to do in the future? Why?',
  'Tell me about a place you would like to visit, and why.',
  'What do you usually eat for breakfast, lunch and dinner? What is your favourite food?',
  'Describe your home. Which room do you like best, and why?',
  'Tell me about your favourite sport or game. How do you play it?',
  'What do you do after school on a normal day?',
  'Tell me about a film, a book or a game you like. What is it about?',
  'Tell me about your last holiday. Where did you go and what did you do?',
  'Tell me about a person you admire. Why do you admire them?',
  'What is the weather like where you live? Which season do you like best, and why?',
  'How do you use your phone or computer? What do you like doing online?',
  'Tell me about a happy day you remember. What happened?',
  'What job would you like to do one day? Why?',
  'What do you do to learn English? What is easy and what is difficult for you?',
  'Tell me about your favourite teacher or lesson. What makes it good?',
  'What do you like doing with your friends?',
  'If you could change one thing about your school, what would it be, and why?',
  'What are you good at? How did you learn it?',
];
const VT_PICTURES = ['photos/students.jpg', 'photos/hero.jpg', 'photos/lessons.jpg', 'photos/level-a2.jpg', 'photos/level-b1.jpg', 'photos/listening.jpg',
  'photos/level-a1.jpg', 'photos/level-b2.jpg', 'photos/level-f1.jpg', 'photos/level-f2.jpg', 'photos/pronounce.jpg'];
// Real size of each picture (width, height), so the page keeps its place while the picture loads.
const VT_PIC_SIZE = {'photos/students.jpg': [1000, 622], 'photos/hero.jpg': [1200, 800], 'photos/lessons.jpg': [1000, 667], 'photos/level-a2.jpg': [1000, 646], 'photos/level-b1.jpg': [1000, 667], 'photos/listening.jpg': [1000, 671],
  'photos/level-a1.jpg': [1000, 667], 'photos/level-b2.jpg': [1000, 667], 'photos/level-f1.jpg': [1000, 665], 'photos/level-f2.jpg': [1000, 667], 'photos/pronounce.jpg': [1000, 667]};
const vtPicAttr = p => { const z = VT_PIC_SIZE[p] || [1000, 667]; return `src="${p === 'photos/hero.jpg' ? 'photos/hero-1200.jpg' : p}" width="${z[0]}" height="${z[1]}"`; };
const VT_PIC_PROMPT = 'Describe this picture. What can you see? What are the people doing? How do they feel?';
const VT_SENTENCES = {
  A1: ['My brother is ten years old.', 'I get up at seven every morning.', 'She likes tea, but she does not like coffee.',
    'This is my friend, and her name is Sara.', 'We have English on Monday and Wednesday.', 'There are two books on the table.', 'I go to school by bus.', 'My father works in a big hospital.'],
  A2: ['We visited my grandparents last weekend.', 'I am going to buy a new phone tomorrow.', 'There is a small park near my house.',
    'I usually do my homework before dinner.', 'My sister is taller than me, but I am faster.', 'We were playing football when it started to rain.', 'You should drink more water when it is hot.', 'I have never been to London.'],
  B1: ['If it rains tomorrow, we will stay at home and watch a film.', 'I have been learning English for about three years.', 'She told me that she had already finished her homework.',
    'I used to be afraid of the dark when I was a child.', 'The museum, which opened last year, is free for students.', 'We may be late, so please start the lesson without us.', 'I enjoy reading, especially stories about travelling to other countries.', 'The windows were cleaned while we were at school.'],
  B2: ['Although the weather was terrible, we thoroughly enjoyed the trip.', 'I would rather work in a team than on my own.', 'The film was much more interesting than I had expected.',
    'If I had known about the test, I would have studied harder.', 'Despite feeling nervous, she gave an excellent presentation.', 'By the end of this year, I will have finished secondary school.', 'It is worth practising every day, even if only for ten minutes.', 'Not only did he apologise, but he also offered to help.'],
};
const VT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const VT_ERR = {'not registered': 'Save your name and email on the “My progress” page first.', 'student limit': 'You have reached today\'s limit. Try again tomorrow.', 'daily limit': 'The class has reached today\'s limit. Try again tomorrow.', 'no key': 'The AI teacher is not switched on yet.', 'too short': 'There was not enough speech for the AI teacher.', busy: 'The AI teacher is busy right now.', refusal: 'The AI teacher could not write a summary for this test.',
  unsaved: 'the server could not be reached at the end of the test, so this result is saved only on this device — your teacher cannot see it. Check your internet connection and take the test again later.'};
let VT = {mode: 'intro'}, vtHistory = null, vtCaps = null;
const vtPick = a => a[Math.floor(Math.random() * a.length)];
// What this device was asked before (questions, pictures and sentences, newest first; IndexedDB 'voiceSeen'), so the next test brings
// something new. When everything in a list has been used, the one used longest ago comes back first.
let vtSeen = [];
const vtFresh = (pool, seen = vtSeen) => { const fresh = pool.filter(x => !seen.includes(x)); return fresh.length ? vtPick(fresh) : pool.slice().sort((a, b) => seen.indexOf(b) - seen.indexOf(a))[0]; };
const vtRemember = used => { vtSeen = [...used, ...vtSeen.filter(x => !used.includes(x))].slice(0, 150); return DB.put('kv', 'voiceSeen', vtSeen); };
const vtAvg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
const vtRegistered = () => !!student && !!student.email;
const vtSpeechOn = () => !!vtCaps && vtCaps.speech && vtRegistered();

let vtCapsAgain = false;   // the server could not be reached: ask again the next time the page opens
async function vtLoadCaps() {
  if (vtCaps && !vtCapsAgain) return;
  vtCaps = vtCaps || {speech: false, ai: false, save: false}; vtCapsAgain = false;
  if (!/^https?:$/.test(location.protocol)) return;
  if (VT.mode === 'intro' && (location.hash || '').startsWith('#/voicetest')) app.innerHTML = loadBox('Getting the voice test ready…');
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
  try { const r = await fetch(VT_API, {cache: 'no-store', signal: ctl.signal}), d = await r.json(); if (d && d.ok) vtCaps = {speech: !!d.speech, ai: !!d.ai, save: !!d.save}; } catch (e) { vtCapsAgain = true; }
  clearTimeout(to);
}
async function vtPost(body, ms = 70000) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(VT_API, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, signal: ctl.signal, body: JSON.stringify(body)}); return await r.json(); }
  catch (e) { return {ok: false, error: 'offline'}; } finally { clearTimeout(to); }
}

/* ---------- recording (WAV 16 kHz mono + volume measurements + the browser's own speech recognition) ---------- */
function vtWav(chunks, rate) {
  let len = 0; chunks.forEach(c => len += c.length);
  const all = new Float32Array(len); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
  const ratio = rate / 16000, n = Math.floor(len / ratio), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), str = (p, s) => { for (let i = 0; i < s.length; i++) v.setUint8(p + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) { const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio)); let s = 0; for (let j = a; j < b && j < len; j++) s += all[j]; s = Math.max(-1, Math.min(1, s / (b - a))); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return new Blob([buf], {type: 'audio/wav'});
}
const vtB64 = blob => new Promise(res => { const f = new FileReader(); f.onload = () => res(String(f.result).split(',')[1] || ''); f.onerror = () => res(''); f.readAsDataURL(blob); });
function vtCleanup(r) {
  clearInterval(r.timer); try { r.sr && (r.sr.onend = null, r.sr.abort()); } catch (e) {}
  try { r.proc && (r.proc.onaudioprocess = null, r.proc.disconnect()); } catch (e) {}
  try { r.stream && r.stream.getTracks().forEach(t => t.stop()); } catch (e) {} try { r.ac && r.ac.close(); } catch (e) {}
}
function vtAbort() { const r = VT.rec; if (r && !r.ended) { r.ended = true; vtCleanup(r); } if (VT.mode !== 'intro' && VT.mode !== 'result') VT = {mode: 'intro'}; }
async function vtBegin(max, onDone) {
  const T = VT;
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}}); } catch (e) { if (VT === T) toast('🚫 Microphone blocked — allow the microphone in your browser, then try again.'); return false; }
  // The browser may take a while to ask for the microphone: if the student left the test meanwhile, or a second tap already started
  // a recording, this microphone is switched off again and nothing starts.
  if (VT !== T || (T.rec && !T.rec.ended)) { try { stream.getTracks().forEach(t => t.stop()); } catch (e) {} return false; }
  const r = VT.rec = {max, onDone, stream, chunks: [], rate: 48000, base: '', sess: '', interim: '', counted: 0, confSum: 0, confN: 0, ended: false, ref: 0.02, rms: 0, speechT: 0, silentRun: 0, pauses: [], first: null, last: 0, t0: performance.now(), lastTick: performance.now()};
  try {
    const AC = window.AudioContext || window.webkitAudioContext; r.ac = new AC(); r.rate = r.ac.sampleRate;
    const src = r.ac.createMediaStreamSource(stream), mute = r.ac.createGain(); mute.gain.value = 0;
    r.proc = r.ac.createScriptProcessor(4096, 1, 1);
    r.proc.onaudioprocess = e => { if (r.ended) return; const d = e.inputBuffer.getChannelData(0); r.chunks.push(new Float32Array(d)); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; r.rms = Math.sqrt(s / d.length); };
    src.connect(r.proc); r.proc.connect(mute); mute.connect(r.ac.destination);
  } catch (e) { r.proc = null; }
  if (SR) {
    const startSR = () => {
      if (r.ended) return; const sr = r.sr = new SR(); sr.lang = LANG; sr.continuous = true; sr.interimResults = true; sr.maxAlternatives = 1; r.sess = ''; r.counted = 0;
      sr.onresult = e => { let fin = '', interim = ''; for (let i = 0; i < e.results.length; i++) { const res = e.results[i]; if (res.isFinal) { fin += ' ' + res[0].transcript.trim(); if (i >= r.counted) { r.confSum += res[0].confidence || 0; r.confN++; r.counted = i + 1; } } else interim += ' ' + res[0].transcript; } r.sess = fin.trim(); r.interim = interim.trim(); const el = $('#vtLive'); if (el) el.textContent = (r.base + ' ' + r.sess + ' ' + r.interim).trim() || 'Start speaking…'; };
      sr.onerror = () => {};
      sr.onend = () => { r.base = (r.base + ' ' + r.sess).trim(); r.sess = ''; if (!r.ended) setTimeout(startSR, 150); };
      try { sr.start(); } catch (e) { setTimeout(startSR, 400); }
    };
    startSR();
  }
  r.timer = setInterval(vtTick, 100);
  return true;
}
function vtTick() {
  const r = VT.rec; if (!r || r.ended) return; const now = performance.now(), dt = Math.min(1, (now - r.lastTick) / 1000), el = (now - r.t0) / 1000; r.lastTick = now;
  r.ref = Math.max(0.02, r.ref * 0.9997, r.rms); const speaking = r.rms > Math.max(0.012, r.ref * 0.15);
  if (speaking) { if (r.first === null) r.first = el; else if (r.silentRun >= 0.7) r.pauses.push(r.silentRun); r.silentRun = 0; r.speechT += dt; r.last = el; } else if (r.first !== null) r.silentRun += dt;
  const ring = $('#vtRing'); if (ring) { ring.style.setProperty('--p', Math.min(100, el / r.max * 100)); ring.style.setProperty('--rc', el >= r.max - 5 ? '#e63946' : '#3a86ff'); $('#vtTime').textContent = Math.max(0, Math.ceil(r.max - el)); }
  const mt = $('#vtMeter'); if (mt) mt.style.setProperty('--lv', Math.min(1, r.rms * 9).toFixed(2));
  const stop = $('#vtStop'); if (stop) stop.disabled = el < 2;
  if (el >= r.max) vtEnd();
}
async function vtEnd() {
  const r = VT.rec; if (!r || r.ended) return; r.ended = true; clearInterval(r.timer);
  const seconds = Math.min(r.max, (performance.now() - r.t0) / 1000);
  vtBusy('Listening to your answer…');
  await new Promise(res => { try { r.sr && (r.sr.onend = null, r.sr.stop()); } catch (e) {} setTimeout(res, r.sr ? 900 : 50); });
  const heard = (r.base + ' ' + r.sess + ' ' + r.interim).replace(/\s+/g, ' ').trim(), wav = r.chunks.length ? vtWav(r.chunks, r.rate) : null;
  vtCleanup(r);
  const span = r.first !== null ? Math.max(3, r.last - r.first) : seconds;
  r.onDone({wav, heard, confidence: r.confN ? r.confSum / r.confN : null, M: {seconds, span, pauses: r.pauses, speechRatio: r.first !== null ? spClamp(r.speechT / span, 0, 1) : 0.7}});
}

/* ---------- scoring ---------- */
// The speech service was asked and said no (today's limit, not registered) or did not answer. A browser that can write the words down
// itself goes on with the basic check, and the student is told once. A browser that cannot (Safari, Firefox) has nothing to score:
// the reason is returned and the test stops there (vtStuck) instead of going on to a result of 0%.
function vtSvcFail(d) {
  const why = (d && d.error) || 'offline';
  if (!SR) return why;
  if (VT.mode !== 'intro' && VT.mode !== 'result' && !VT.told) { VT.told = true; toast(why === 'student limit' || why === 'daily limit' ? 'Today\'s limit for full pronunciation scoring is reached — this test goes on with the basic check.' : 'The speech service did not answer — this test goes on with the basic check.'); }
  return '';
}
// Basic check without the speech service: how many words of the sentence the browser heard.
function vtMatch(text, heard) {
  const ref = norm(text).split(' ').filter(Boolean), got = norm(heard).split(' ').filter(Boolean), pool = {}; got.forEach(w => pool[w] = (pool[w] || 0) + 1);
  const words = ref.map(w => { const ok = pool[w] > 0; if (ok) pool[w]--; return {w, score: ok ? 100 : 0, err: ok ? '' : 'Omission'}; });
  return {score: ref.length ? Math.round(words.filter(w => !w.err).length / ref.length * 100) : 0, words};
}
async function vtScoreTalk(cap, kind, prompt, image) {
  let transcript = cap.heard, source = 'browser', confidence = cap.confidence;
  if (vtSpeechOn() && cap.wav) { const d = await vtPost({action: 'transcribe', student, audio: await vtB64(cap.wav)}); if (d && d.ok && d.text) { transcript = d.text; source = 'speech'; confidence = d.confidence; }
    else if (!d || !d.ok) { const why = vtSvcFail(d); if (why) return {fail: why}; } }
  const A = spAnalyse(transcript || '', {...cap.M, confidence}, {register: 'any'}), sc = A.scores;
  const score = Math.round((0.4 * sc.fluency + 0.35 * sc.accuracy + 0.25 * sc.vocab) * spClamp(A.words / 30));   // a few words in 45 seconds is not a good answer
  return {kind, prompt, image: image || '', transcript: transcript || '', source, seconds: Math.round(cap.M.seconds), words: A.words, wpm: A.words ? A.wpm : 0, pauses: A.pauses, fluency: sc.fluency, accuracy: sc.accuracy, vocab: sc.vocab, score, cefr: A.cefr};
}
async function vtScoreSentence(cap, level, text) {
  const out = {level, text, heard: cap.heard, source: 'browser', score: 0, accuracy: null, fluency: null, completeness: null, prosody: null, words: [], weak: [], audio: cap.wav ? URL.createObjectURL(cap.wav) : null};
  let done = false;
  if (vtSpeechOn() && cap.wav) {
    const d = await vtPost({action: 'assess', student, text, audio: await vtB64(cap.wav)});
    if (d && d.ok) { done = true; out.source = 'speech'; out.heard = d.heard || '';
      if (d.scores) { const s = d.scores; Object.assign(out, {score: s.pron != null ? s.pron : (s.accuracy || 0), accuracy: s.accuracy, fluency: s.fluency, completeness: s.completeness, prosody: s.prosody}); out.words = (d.words || []).filter(w => w.err !== 'Insertion'); }
      else out.completeness = 0; }
    else { const why = vtSvcFail(d); if (why) return {fail: why}; }
  }
  if (!done) { const m = vtMatch(text, cap.heard); out.score = m.score; out.completeness = m.score; out.words = m.words; }
  out.weak = out.words.filter(w => w.err || (w.score != null && w.score < 60)).map(w => w.w);
  return out;
}
function vtTotals(tasks, sentences) {
  const speaking = vtAvg(tasks.map(t => t.score)), pronunciation = vtAvg(sentences.map(s => s.score)), repeating = vtAvg(sentences.map(s => s.completeness != null ? s.completeness : s.score));
  const parts = [[speaking, 0.5], [pronunciation, 0.3], [repeating, 0.2]].filter(p => p[0] != null), w = parts.reduce((a, p) => a + p[1], 0);
  const overall = w ? Math.round(parts.reduce((a, p) => a + p[0] * p[1], 0) / w) : 0;
  return {scores: {overall, speaking: speaking || 0, pronunciation: pronunciation || 0, repeating: repeating || 0}, level: overall < 30 ? 'A1' : overall < 45 ? 'A2' : overall < 60 ? 'B1' : overall < 78 ? 'B2' : 'C1'};
}

/* ---------- the test, step by step ---------- */
function vtStart() {
  const s = VT_LEVELS.slice(0, 4).map(lv => ({level: lv, text: vtFresh(VT_SENTENCES[lv])}));
  VT = {mode: 'talk', step: 0, question: vtFresh(VT_QUESTIONS), picture: vtFresh(VT_PICTURES), sentences: s, tasks: [], done: [], si: 0, plays: 0, quiet: {}};
  vtRemember([VT.question, VT.picture, ...s.map(x => x.text)]);
  renderVoiceTest(); window.scrollTo(0, 0);
}
const vtHead = (n, title) => `<div class="crumbs"><a href="#/">Home</a> › <a href="#/voicetest">Voice level test</a> › Step ${n} of 3</div><div class="vtsteps">${[1, 2, 3].map(i => `<span class="${i < n ? 'done' : i === n ? 'on' : ''}">${i < n ? '✓' : i}</span>`).join('<i></i>')}</div><h2 class="baloo vth">${title}</h2>`;
const vtRecBox = max => `<div class="sprow vtrec"><div class="ring" id="vtRing" style="--p:0;--rc:#3a86ff"><span id="vtTime">${max}</span></div>
  <div class="grow"><div class="spmeter" id="vtMeter"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lbl vtrl">🔴 Recording… the bars move when I can hear you.</div><button class="btn red" id="vtStop" disabled>⏹ I have finished</button></div></div>`;
function vtBusy(msg) { app.innerHTML = `<div class="panel" style="text-align:center;padding:50px 20px"><div class="spin big"></div><h3 class="sec-t" style="margin-top:16px">${esc(msg)}</h3><p class="hint">This takes a few seconds.</p></div>`; }
function vtTalkPage() {
  const pic = VT.step === 1, prompt = pic ? VT_PIC_PROMPT : VT.question, rec = VT.recording;
  app.innerHTML = `${vtHead(pic ? 2 : 1, pic ? 'Describe the picture' : 'Answer the question')}
  <div class="panel vtp${rec ? ' rec' : ''}">${pic ? `<img class="vtpic" ${vtPicAttr(VT.picture)} alt="The picture to describe">` : ''}
    <p class="spprompt">${esc(prompt)}</p>
    ${rec ? vtRecBox(VT_TALK) + (SR ? `<h4 class="sph">What the computer hears</h4><div class="splive" id="vtLive">Start speaking…</div>` : '')
      : `<p class="hint">You have <b>${VT_TALK} seconds</b>. There are no right or wrong answers — just keep talking in English. The recording starts when you press the button.</p><div class="row vtgo" style="margin-top:14px"><button class="btn red" id="vtGo">🎙 Start recording</button></div>`}</div>`;
  if (rec) { $('#vtStop').onclick = vtEnd; return; }
  $('#vtGo').onclick = async () => {
    $('#vtGo').disabled = true;
    const T = VT, next = t => { T.tasks.push(t); if (pic) T.mode = 'repeat'; else T.step = 1; renderVoiceTest(); window.scrollTo(0, 0); };
    const score = async cap => {
      T.recording = false; const t = await vtScoreTalk(cap, pic ? 'picture' : 'question', prompt, pic ? T.picture : ''); if (VT !== T) return;
      if (t.fail) return vtStuck(t.fail, () => { vtBusy('Listening to your answer…'); score(cap); });
      // Not one word was heard: most often the microphone is off, covered or too far away. Say so now (once for each part), not after the whole test.
      if (!t.words && !T.quiet[T.step]) { T.quiet[T.step] = true; return vtQuietPage(pic ? 2 : 1, () => next(t)); }
      next(t);
    };
    const ok = await vtBegin(VT_TALK, score);
    if (VT !== T) return;
    if (ok) { VT.recording = true; renderVoiceTest(); } else if ($('#vtGo')) $('#vtGo').disabled = false;
  };
}
// A talking part in which no words were heard.
function vtQuietPage(n, skip) {
  app.innerHTML = `${vtHead(n, 'I could not hear you')}
  <div class="panel vtp">${stateBox('🎤', 'No words were heard', 'Check that your microphone is switched on and not covered, move closer to it, and speak a little louder. Then try this part again.')}
    <div class="row vtgo two" style="margin-top:14px;justify-content:center"><button class="btn red" id="vtRedo">🎙 Record again</button><button class="btn ghost" id="vtSkip">Skip this part →</button></div></div>`;
  $('#vtRedo').onclick = () => { renderVoiceTest(); window.scrollTo(0, 0); };
  $('#vtSkip').onclick = skip;
}
// The test cannot go on with this answer: the speech service refused it (a limit) or could not be reached, and this browser cannot write
// the words down by itself. With "again" the same recording is sent once more.
function vtStuck(err, again) {
  const lim = ['not registered', 'student limit', 'daily limit'].includes(err);
  app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/voicetest">Voice level test</a> › Test</div>
  <div class="panel vtp">${stateBox(lim ? '⏳' : navigator.onLine === false ? '📡' : '⚠️', lim ? 'The test cannot go on today' : 'Your answer could not be checked', lim ? VT_ERR[err] + (err === 'not registered' ? '' : ' In Google Chrome or Microsoft Edge you can still take the test with the basic check.') : netWhy() + ' Your recording is still here — try again.', lim ? '' : 'vtRetry')}
    <div class="row vtgo" style="margin-top:14px;justify-content:center"><button class="btn ghost" id="vtQuit">Stop the test</button></div></div>`;
  const b = $('#vtRetry'); if (b) b.onclick = again;
  $('#vtQuit').onclick = vtLeave;
  window.scrollTo(0, 0);
}
function vtLeave() { vtAbort(); VT = {mode: 'intro'}; renderVoiceTest(''); window.scrollTo(0, 0); }
// The test's pages and a fresh result share the address #/voicetest with the first page: a link to it (phone "← Back", the breadcrumb,
// the Voice test tab) would do nothing, so it is handled here. Leaving a test that has an answer asks first.
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href="#/voicetest"]'); if (!a || location.hash !== '#/voicetest' || VT.mode === 'intro') return;
  e.preventDefault();
  if (VT.mode !== 'result' && !VT.finishing && (VT.recording || VT.tasks.length) && !confirm('Leave the voice test? Your answers will be lost.')) return;
  vtLeave();
});
function vtRepeatPage() {
  const s = VT.sentences[VT.si], rec = VT.recording, n = VT.sentences.length;
  app.innerHTML = `${vtHead(3, 'Listen and repeat')}
  <div class="panel vtp"><div class="lbl">SENTENCE ${VT.si + 1} OF ${n}</div>
    ${rec ? `<p class="spprompt">Now say the sentence.</p>` + vtRecBox(VT_REPEAT)
      : `<p class="spprompt">Listen to the sentence in a British voice, then repeat it exactly.</p><p class="hint">You cannot see the sentence — listen carefully. You can listen <b>twice</b>.</p>
      <div class="row vtgo two" style="margin-top:14px"><button class="btn teal" id="vtPlay" ${VT.plays >= 2 ? 'disabled' : ''}>🔊 Listen${VT.plays ? ' again' : ''}</button><button class="btn red" id="vtGo" ${VT.plays ? '' : 'disabled'}>🎙 Repeat it</button></div>`}</div>`;
  if (rec) { $('#vtStop').onclick = vtEnd; return; }
  $('#vtPlay').onclick = () => { VT.plays++; $('#vtPlay').disabled = true; say(s.text, () => { if (VT.mode === 'repeat' && !VT.recording) renderVoiceTest(); }, 0.85); };
  $('#vtGo').onclick = async () => {
    try { speechSynthesis.cancel(); } catch (e) {}
    $('#vtGo').disabled = true;
    const T = VT, score = async cap => {
      T.recording = false; const d = await vtScoreSentence(cap, s.level, s.text); if (VT !== T) return;
      if (d.fail) return vtStuck(d.fail, () => { vtBusy('Listening to your answer…'); score(cap); });
      T.done.push(d); T.si++; T.plays = 0; if (T.si >= n) return vtFinish(); renderVoiceTest();
    };
    const ok = await vtBegin(VT_REPEAT, score);
    if (VT !== T) return;
    if (ok) { VT.recording = true; renderVoiceTest(); } else if ($('#vtGo')) $('#vtGo').disabled = false;
  };
}
async function vtFinish() {
  const T = VT, tot = vtTotals(T.tasks, T.done), rec = {id: uid(), date: new Date().toISOString(), name: student ? student.name : '', tasks: T.tasks, sentences: T.done, scores: tot.scores, level: tot.level, ai: null, aiError: '', shared: ''};
  // Not one word was heard in the whole test (a microphone that is off or not working): that is not a level. It is not kept as
  // "A1 · 0%" and not sent to the teacher; the student is told what to check.
  if (!T.tasks.some(t => t.words) && !T.done.some(s => s.score > 0 || norm(s.heard || ''))) { T.finishing = true; return vtNonePage(); }
  vtBusy('Working out your level…'); T.finishing = true;
  if (vtCaps && vtCaps.save && vtRegistered()) {
    const d = await vtPost({action: 'finish', student, result: {tasks: rec.tasks, sentences: rec.sentences.map(({audio, ...s}) => s), scores: rec.scores, level: rec.level}}, 80000);
    if (d && d.ok) { rec.shared = d.id; rec.level = d.level || rec.level; rec.ai = d.ai || null; rec.aiError = d.aiError || ''; }
    else if (d && (d.error === 'offline' || d.error === 'server error')) rec.aiError = 'unsaved';
  }
  vtHistory.unshift({...rec, sentences: rec.sentences.map(({audio, ...s}) => s)}); vtHistory = vtHistory.slice(0, VT_KEEP); await DB.put('kv', 'voiceHistory', vtHistory);
  onActivity();
  rec.noted = vtWeak(rec).filter(w => !VT_SMALL.has(norm(w)) && norm(w).length > 2).filter(w => noteWord(w)).length;   // the unclear words go to "Practise my mistakes" (this device only)
  // The student left while the level was worked out: the test is kept all the same, and is in "My voice tests".
  if (VT !== T) { toast('✅ Your voice test is saved — open “Voice level test” to see the result.'); if (VT.mode === 'intro' && location.hash === '#/voicetest' && vtCaps && $('#vtStart')) vtIntroPage(); return; }
  VT = {mode: 'result', rec}; renderVoiceTest(); window.scrollTo(0, 0);
}
function vtNonePage() {
  app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/voicetest">Voice level test</a> › Result</div>
  <div class="panel vtp">${stateBox('🎤', 'The test could not hear you', 'No words were heard in any part, so there is no level this time and nothing was saved. Check that your microphone is switched on and allowed for this page, use a quiet place, and speak close to the microphone.')}
    <div class="row vtgo" style="margin-top:14px;justify-content:center"><button class="btn sun" id="vtNone">🎙 Try the test again</button></div></div>`;
  $('#vtNone').onclick = vtLeave; window.scrollTo(0, 0);
}

/* ---------- pages ---------- */
async function renderVoiceTest(arg) {
  if (vtHistory === null) { vtHistory = []; vtHistory = (await DB.get('kv', 'voiceHistory')) || [];
    // Tests taken before 'voiceSeen' existed: what they asked is read from the saved results.
    const seen = await DB.get('kv', 'voiceSeen'); vtSeen = Array.isArray(seen) ? seen.map(String) : vtHistory.flatMap(r => [...(r.tasks || []).flatMap(t => [t.kind === 'picture' ? '' : t.prompt, t.image]), ...(r.sentences || []).map(x => x.text)]).filter(Boolean).map(String); }
  if (arg && arg.startsWith('view/')) { const rec = vtHistory.find(r => r.id === arg.slice(5)); if (rec) VT = {mode: 'result', rec}; }
  else if (arg && arg.startsWith('result/')) return vtSharedPage(arg.slice(7));
  else if (arg === '' && VT.mode === 'result') VT = {mode: 'intro'};
  if (VT.mode === 'talk') return vtTalkPage(); if (VT.mode === 'repeat') return vtRepeatPage(); if (VT.mode === 'result') return vtResultPage(VT.rec);
  await vtLoadCaps(); if (VT.mode === 'intro' && (location.hash || '').startsWith('#/voicetest')) vtIntroPage();
}
function vtIntroPage() {
  const can = (!!SR || vtSpeechOn()) && 'speechSynthesis' in window, reg = vtRegistered();
  const how = vtSpeechOn() ? '🎯 Your pronunciation is scored sound by sound by a speech AI.' : vtCaps.speech ? '🎯 Save your name and email on the <a href="#/progress">My progress</a> page to get full pronunciation scoring.' : '🎯 Basic check: the computer checks which words it can understand.';
  app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › Voice level test</div>
  <div class="banner photo vtban" style="--img:url(photos/pronounce.jpg)"><div><h1>Voice level test</h1><p>Find your speaking level in about 3 minutes — just by talking.</p></div></div>
  <div class="panel vtp" style="margin-top:16px"><h3 class="sec-t vthow-t">How it works</h3>
    <div class="sptasks vthow">
      <div class="sptask"><div class="spth"><b>1 · Answer a question</b><span class="chip grey">${VT_TALK} s</span></div><p>Talk about yourself. There are no right or wrong answers.</p></div>
      <div class="sptask"><div class="spth"><b>2 · Describe a picture</b><span class="chip grey">${VT_TALK} s</span></div><p>Say what you can see and what is happening.</p></div>
      <div class="sptask"><div class="spth"><b>3 · Listen and repeat</b><span class="chip grey">4 sentences</span></div><p>Hear a British voice and repeat each sentence.</p></div></div>
    ${can ? `<div class="row vtgo" style="margin-top:16px"><button class="btn sun" id="vtStart">🎙 Start the test</button></div>` : `<div class="note">This browser cannot write down your words. Please open the page in <b>Google Chrome</b> or <b>Microsoft Edge</b>.</div>`}
    <ul class="vttips"><li>${how}</li><li>${vtCaps.ai && reg ? '🤖 The AI teacher writes a summary of your level.' : '🤖 The AI teacher summary is off' + (vtCaps.ai ? ': save your name and email on the <a href="#/progress">My progress</a> page to turn it on.' : '.')}</li><li>🎧 Use a quiet place. Headphones with a microphone are best.</li></ul></div>
  ${vtHistory.length ? `<h3 class="sph" style="margin:26px 0 8px">My voice tests</h3><div class="panel"><div class="tablewrap"><table class="rtable vthist"><thead><tr><th>Date</th><th>Level</th><th>Speaking</th><th>Pronunciation</th><th>Overall</th><th></th></tr></thead><tbody>${vtHistory.map(r => `<tr><td>${new Date(r.date).toLocaleDateString()}</td><td><b>${esc(r.level)}</b></td><td>${r.scores.speaking}%</td><td>${r.scores.pronunciation}%</td><td><b style="color:${pcol(r.scores.overall)}">${r.scores.overall}%</b></td><td><a class="btn sm ghost" href="#/voicetest/view/${r.id}">View</a></td></tr>`).join('')}</tbody></table></div></div>` : ''}`;
  const b = $('#vtStart'); if (b) b.onclick = vtStart;
}
async function vtSharedPage(id) {
  vtBusy('Opening the result…');
  let d = null; try { const r = await fetch(VT_API + '?id=' + encodeURIComponent(id), {cache: 'no-store'}); d = await r.json(); } catch (e) {}
  if (location.hash !== '#/voicetest/result/' + id) return;
  if (!d || d.error === 'server error') {   // no answer is not the same as "no such result": say so and let the reader try again
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/voicetest">Voice level test</a> › Result</div><div class="panel">${stateBox(navigator.onLine === false ? '📡' : '⚠️', 'This result could not be opened', netWhy(), 'vtRetry')}</div>`;
    $('#vtRetry').onclick = () => vtSharedPage(id); return; }
  if (!d || !d.ok || !d.test) { app.innerHTML = `<div class="panel" style="text-align:center;padding:40px 20px"><h3 class="sec-t">This result could not be found.</h3><a class="btn sun" href="#/voicetest">Take the voice test</a></div>`; return; }
  vtResultPage({...d.test, shared: id, tasks: d.test.tasks || [], sentences: d.test.sentences || []}, true);
}
function vtWordsHTML(s) { return s.words.length ? s.words.map(w => `<span class="vtw" style="--c:${w.err === 'Omission' ? '#9aa3b5' : pcol(w.score == null ? 100 : w.score)}" title="${w.err === 'Omission' ? 'not heard' : w.score == null ? '' : w.score + '%'}">${esc(w.w)}</span>`).join(' ') : `<span class="lbl">Nothing was heard.</span>`; }
// The words of the repeated sentences that were not clear (six at most), as the result lists them. The little grammar words among them are
// shown but not sent to "Practise my mistakes": said alone they are not a fair test.
const vtWeak = rec => rec.scores.overall > 0 ? [...new Set(rec.sentences.flatMap(x => x.weak || []).map(String))].slice(0, 6) : [];
const VT_SMALL = new Set('a an the to of in on at is it am are was be do did and or but if so he she we you me my his her its our for not no yes this that'.split(' '));
function vtResultPage(rec, shared) {
  const sc = rec.scores, col = pcol(sc.overall), a = rec.ai, li = arr => (arr || []).map(x => `<li>${esc(x)}</li>`).join(''), basic = rec.sentences.some(s => s.source !== 'speech');
  // Where to go after the test: the lessons of the matching level (C1 → the highest level here) and the words that were not clear.
  const nx = {L: LV({A1: 'a1', A2: 'a2', B1: 'b1', B2: 'b2', C1: 'b2'}[rec.level]), weak: vtWeak(rec)};
  const link = rec.shared ? location.origin + location.pathname + '#/voicetest/result/' + rec.shared : '';
  app.innerHTML = `<div class="crumbs no-print"><a href="#/">Home</a> › <a href="#/voicetest">Voice level test</a> › Result</div>
  <div class="panel res-card">
    <div class="stud"><div><div class="lbl">VOICE LEVEL TEST</div><b style="font-size:22px">${esc(rec.name || 'My result')}</b></div><div class="hint" style="margin:0;text-align:right">${new Date(rec.date).toLocaleString()}</div></div>
    <div class="res-top vttop"><div class="ring" style="--p:${sc.overall};--rc:${col}"><span>${esc(rec.level)}</span></div>
      <div><div class="hint" style="margin:0">${a ? 'Your speaking level' : 'Your speaking level (estimate)'}</div><h1 class="baloo vtlv" style="color:${col}">Level ${esc(rec.level)} · ${sc.overall}%</h1>
      <p class="hint" style="margin:4px 0 0">${a ? 'Level chosen by the AI teacher from your whole test.' : 'An automatic estimate from your scores. Your teacher\'s opinion is more important.'}</p></div></div>
    <h3 class="sph" style="margin-top:22px">Your skills</h3>
    <div class="spgauges">${scaleHTML(sc.speaking, '🗣 Speaking (fluency, grammar, vocabulary)')}${scaleHTML(sc.pronunciation, '🎯 Pronunciation' + (basic ? ' (basic check)' : ''))}${scaleHTML(sc.repeating, '👂 Listening and repeating')}</div>
    ${shared ? '' : `<div class="vtnext no-print" id="vtNext"><h3 class="sph" style="margin:0 0 4px">👉 What to do next</h3>
      <p class="hint" style="margin:0 0 10px">${nx.L ? `Your speaking level is <b>${esc(rec.level)}</b> — the <b>${nx.L.name}</b> lessons are a good place to practise.` : 'Keep practising a little every day.'}${nx.weak.length ? ` Words to practise: ${nx.weak.map(w => `<span class="vtw" style="--c:#e63946">${esc(w)}</span>`).join(' ')}` : ''}${rec.noted && mistLinkHTML() ? ` <span id="vtNoted">${rec.noted < nx.weak.length ? (rec.noted === 1 ? 'One of them is' : rec.noted + ' of them are') : rec.noted === 1 ? 'It is' : 'They are'} in <a href="#/mistakes"><b>Practise my mistakes</b></a> now.</span>` : ''}</p>
      <div class="row vtgo" style="gap:8px">${nx.L ? `<a class="btn sun" href="#/level/${nx.L.id}">${nx.L.icon} Open ${nx.L.name} →</a>` : ''}<a class="btn ghost" href="#/pronounce">🗣️ Practise pronunciation</a>${sc.repeating < 60 ? '<a class="btn ghost" href="#/listening">🎧 Practise listening</a>' : ''}</div></div>`}
    ${a ? `<div class="aibox"><div class="aibadge">🤖 AI teacher (Claude) · level: <b>${esc(a.cefr || rec.level)}</b></div>${a.summary ? `<p class="aisum">${esc(a.summary)}</p>` : ''}
      ${a.speaking ? `<p><b>🗣 Speaking:</b> ${esc(a.speaking)}</p>` : ''}${a.pronunciation ? `<p><b>🎯 Pronunciation:</b> ${esc(a.pronunciation)}</p>` : ''}
      <div class="spcols"><div><h4 class="sph good">💪 Strengths</h4><ul>${li(a.strengths)}</ul></div><div><h4 class="sph warn">🎯 To improve</h4><ul>${li(a.weaknesses)}</ul></div></div>${(a.tips || []).length ? `<h4 class="sph">💡 Tips</h4><ul>${li(a.tips)}</ul>` : ''}</div>`
      : rec.aiError && rec.aiError !== 'no key' ? `<div class="aibox"><div class="aioff">🤖 AI summary is not available: ${esc(VT_ERR[rec.aiError] || 'Something went wrong (' + rec.aiError + ').')}</div></div>` : ''}
    <h3 class="sph" style="margin-top:22px">🎧 Listen and repeat</h3>
    ${rec.sentences.map((s, i) => `<div class="vtsent"><div class="spth"><b>${esc(s.text)}</b><span class="chip" style="background:${pcol(s.score)}">${s.score}%</span></div>
      <div class="vtwords">${vtWordsHTML(s)}</div>
      ${s.accuracy != null ? `<div class="lbl">Accuracy ${s.accuracy}% · Fluency ${s.fluency == null ? '–' : s.fluency + '%'} · Complete ${s.completeness == null ? '–' : s.completeness + '%'}${s.prosody != null ? ' · Rhythm ' + s.prosody + '%' : ''}</div>` : s.heard ? `<div class="lbl">The computer heard: “${esc(s.heard)}”</div>` : ''}
      <div class="row no-print vtplay" style="gap:8px;margin-top:8px"><button class="btn sm teal" data-vsay="${i}">🔊 British voice</button>${s.audio ? `<audio controls src="${s.audio}" style="height:36px"></audio>` : ''}</div></div>`).join('') || '<p class="hint">No sentences were recorded.</p>'}
    <div class="splegend"><span class="vtw" style="--c:#1b9e5a">clear</span> <span class="vtw" style="--c:#f0a500">nearly</span> <span class="vtw" style="--c:#e63946">practise this</span> <span class="vtw" style="--c:#9aa3b5">not heard</span></div>
    <h3 class="sph" style="margin-top:22px">🗣 What you said</h3>
    ${rec.tasks.map(t => `<div class="vtsent"><div class="spth"><b>${t.kind === 'picture' ? 'Describe the picture' : esc(t.prompt)}</b><span class="chip" style="background:${pcol(t.score)}">${t.score}%</span></div>
      <div class="sptrans" style="margin:8px 0">${t.transcript ? esc(t.transcript) : '<span class="lbl">Nothing was heard.</span>'}</div>
      <div class="lbl">${t.words} words in ${t.seconds} s · ${t.wpm} words/min · ${t.pauses} pauses · Fluency ${t.fluency}% · Accuracy ${t.accuracy}% · Vocabulary ${t.vocab}%</div></div>`).join('')}
    ${link ? `<div class="note no-print">🔗 Link to this result: <a href="${esc(link)}">${esc(link)}</a> <button class="btn sm ghost" id="vtCopy">Copy</button></div>` : ''}
    <div class="row no-print vtgo" style="justify-content:center;margin-top:20px">${shared ? `<a class="btn sun" href="#/voicetest">🎙 Take the voice test</a>` : `<button class="btn sun" id="vtAgain">🎙 Take the test again</button>`}<button class="btn ghost" id="vtPrint">🖨 Print / save as PDF</button></div></div>`;
  app.querySelectorAll('[data-vsay]').forEach(b => b.onclick = () => say(rec.sentences[+b.dataset.vsay].text, null, 0.85));
  $('#vtPrint').onclick = () => window.print();
  const again = $('#vtAgain'); if (again) again.onclick = () => { VT = {mode: 'intro'}; if (location.hash === '#/voicetest') renderVoiceTest(''); else go('#/voicetest'); };
  const cp = $('#vtCopy'); if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(link).then(() => toast('Link copied')); } catch (e) { toast('Copy the link from the page'); } };
}

