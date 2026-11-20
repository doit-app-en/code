/* ================= speech helpers ================= */
// British English for every voice and for speech recognition
const LANG = 'en-GB';
let warnedVoice = false;
// Only ever English voices — never let the browser fall back to the computer's default (e.g. Arabic) voice.
const englishVoices = () => speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang));
function britishVoice() {
  const all = englishVoices(), ok = all.filter(v => !badVoice.has(v.name));
  const chosen = ls('die_voice'); const c = chosen && ok.find(v => v.name === chosen); if (c) return c;   // the voice picked with 🔊
  const gb = ok.filter(v => /en[-_]GB/i.test(v.lang));
  // Edge "Natural" UK voices → offline UK voices (most reliable) → Google UK → any offline English → any English
  const v = gb.find(v => /natural/i.test(v.name)) || gb.find(v => v.localService) || gb.find(v => /google/i.test(v.name)) || gb[0]
    || ok.find(v => v.localService) || ok[0] || all[0];
  if (!gb.length && speechSynthesis.getVoices().length && !warnedVoice) { warnedVoice = true; toast('No British English voice on this device — using another English voice. You can choose one with the 🔊 button at the top.'); }
  return v;
}
// Reliable speech: works around common Chrome / Edge speech bugs.
let voicesReady = false, sayId = 0, keepAlive = null, keepUtt = null;
var badVoice = new Set();
const voicesLoaded = () => new Promise(res => {
  if (!('speechSynthesis' in window)) return res();
  if (voicesReady || speechSynthesis.getVoices().length) { voicesReady = true; return res(); }
  const t = setTimeout(res, 1500);                         // some browsers never fire the event
  speechSynthesis.addEventListener('voiceschanged', () => { voicesReady = true; clearTimeout(t); res(); }, {once: true});
});
if ('speechSynthesis' in window) { voicesLoaded(); speechSynthesis.addEventListener('voiceschanged', () => { voicesReady = true; }); }
async function say(text, onend, rate = 0.9, pitch = 1) {
  if (!('speechSynthesis' in window)) { toast('Speech is not supported in this browser'); return; }
  const id = ++sayId, synth = speechSynthesis, wasBusy = synth.speaking || synth.pending;
  synth.cancel(); clearInterval(keepAlive);
  await voicesLoaded();                                    // so the first word is not read in the wrong voice
  if (wasBusy) await new Promise(r => setTimeout(r, 120)); // Chrome drops speech started right after cancel()
  if (id !== sayId) return;                                // something newer was asked to speak
  let finished = false;
  const finish = () => { if (finished || id !== sayId) return; finished = true; clearInterval(keepAlive); clearTimeout(guard); onend && onend(); };
  const u = new SpeechSynthesisUtterance(text); u.lang = LANG; u.rate = rate; u.pitch = pitch;
  const v = britishVoice();
  if (v) { u.voice = v; u.lang = v.lang; }
  else if (!warnedVoice) { warnedVoice = true; toast('This device has no English voice. Please use Chrome or Edge, or install an English voice in Windows speech settings.'); }
  u.onend = finish;
  u.onerror = e => {
    if (e.error === 'interrupted' || e.error === 'canceled') return;
    if (v && !badVoice.has(v.name)) { badVoice.add(v.name); if (id === sayId) { sayId--; return say(text, onend, rate, pitch); } }  // online voice failed: retry with a local one
    finish();
  };
  keepUtt = u;                                             // keep a reference, or Chrome may never fire "end"
  // If "end" never arrives, continue anyway so "Play all" can't get stuck.
  const guard = setTimeout(finish, 2500 + text.length * 95 / rate);
  synth.resume();                                          // Chrome can get stuck in a paused state
  synth.speak(u);
  // Chrome's online Google voices stop after ~15 s unless nudged.
  if (v && /google/i.test(v.name)) keepAlive = setInterval(() => { if (!synth.speaking) return clearInterval(keepAlive); synth.pause(); synth.resume(); }, 10000);
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null, recorder = null, playToken = 0;
// Switches a listening microphone (speech recognition) off for good: whatever it sends afterwards is ignored, so a late answer is never
// shown on the next phrase and its "end" cannot switch off a microphone that was started after it. Returns true when one was listening.
function recogOff() {
  if (!recog) return false;
  const r = recog; recog = null; r.onstart = r.onresult = r.onerror = r.onend = null;
  try { r.abort(); } catch (e) {}
  return true;
}
// "Listen" pressed while the microphone is listening: the microphone goes off first, or it would hear the computer's voice and score it
// as the student's answer.
function micQuiet(mic, st, text) {
  if (!recogOff()) return false;
  if (mic) mic.classList.remove('rec'); if (st) st.textContent = text;
  return true;
}
function stopAll() {
  if (typeof spAbort === 'function') spAbort();
  if (typeof vtAbort === 'function') vtAbort();
  if (typeof prAbort === 'function') prAbort();
  playToken++;
  try { speechSynthesis.cancel(); } catch (e) {}
  clearInterval(ptIv); Music.stop();
  recogOff();
  if (recorder && recorder.state === 'recording') { recorder._cancel = true; recorder.stop(); }
  document.querySelectorAll('audio,video').forEach(m => m.pause());
}

