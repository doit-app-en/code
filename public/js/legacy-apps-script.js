/* The Google Apps Script the teacher pastes into their Google Sheet (Extensions → Apps Script). */
const GS_CODE = `// Do it English — class server (Google Sheets + Apps Script)
const TEACHER_KEY = 'change-me';      // your secret word: the same one you type on the Students page
const REMIND_AFTER_DAYS = 3;          // send a reminder after this many days without practice
const APP_NAME = 'Do it English';

// ---- AI feedback for "Test your speaking" (optional) ----
// The Claude API key is NOT written in this script. Add it privately:
//   Project Settings (the gear icon) -> Script properties -> Add script property -> name ANTHROPIC_API_KEY, value = your key.
const AI_MODEL = 'claude-opus-5-5';        // best quality. For about 40 times lower cost use 'claude-haiku-5-5'.
const AI_MAX_PER_STUDENT_PER_DAY = 5;      // limits, so nobody can use up your credit
const AI_MAX_PER_DAY = 100;

const COLS = ['Name','Class','Email','Overall %','Listening %','Pronounce %','Lessons %','Placement','Last practised','Last update','Last reminder'];
const SPEAK_COLS = ['Date','Name','Class','Email','Topic','Seconds','Words','Level','Fluency','Accuracy','Vocabulary','Formal','Informal','Summary'];
function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Students');
  if (!sh) { sh = ss.insertSheet('Students'); sh.appendRow(COLS); sh.setFrozenRows(1); }
  return sh;
}
function speakSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Speaking');
  if (!sh) { sh = ss.insertSheet('Speaking'); sh.appendRow(SPEAK_COLS); sh.setFrozenRows(1); }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Students' pages send their progress (and speaking recordings) here.
function doPost(e) {
  const d = JSON.parse(e.postData.contents || '{}');
  if (d.action === 'speaking') return json_(speakingFeedback_(d));
  if (d.action === 'speakingtest') return json_(testAI_(d));
  if (d.action !== 'progress' || !d.student || !d.student.email) return json_({ok: false});
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const sh = sheet_(), rows = sh.getDataRange().getValues(), email = String(d.student.email).toLowerCase().trim(), p = d.progress || {};
    const vals = [d.student.name || '', d.student.cls || '', email, p.overall || 0, p.listening || 0, p.pronounce || 0, p.lessons || 0, p.placement || '',
                  d.lastActive ? new Date(d.lastActive) : '', new Date()];
    let r = -1; for (let i = 1; i < rows.length; i++) if (String(rows[i][2]).toLowerCase() === email) { r = i; break; }
    if (r < 0) sh.appendRow(vals.concat([''])); else sh.getRange(r + 1, 1, 1, vals.length).setValues([vals]);
  } finally { lock.releaseLock(); }
  return json_({ok: true});
}

// The teacher's Students page reads the list here (needs the teacher key).
function doGet(e) {
  if (String(e.parameter.key || '') !== TEACHER_KEY) return json_({ok: false, error: 'wrong key'});
  const rows = sheet_().getDataRange().getValues(); rows.shift();
  const iso = v => v instanceof Date ? v.toISOString() : '';
  return json_({ok: true, students: rows.filter(r => r[2]).map(r => ({name: r[0], cls: r[1], email: r[2], overall: r[3], listening: r[4], pronounce: r[5], lessons: r[6],
    placement: r[7], lastActive: iso(r[8]), updated: iso(r[9]), lastReminder: iso(r[10])}))});
}

// ---------------- speaking feedback from Claude ----------------
function isRegistered_(email) {
  const rows = sheet_().getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) if (String(rows[i][2]).toLowerCase() === email) return true;
  return false;
}
function callClaude_(key, payload, withFallback) {
  const headers = {'x-api-key': key, 'anthropic-version': '2026-10-21'};
  const body = JSON.parse(JSON.stringify(payload));
  if (withFallback) { headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; body.fallbacks = 'default'; }
  return UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {method: 'post', contentType: 'application/json', headers: headers, payload: JSON.stringify(body), muteHttpExceptions: true});
}
// Sends the request; if the refusal-fallback option is rejected, sends it again without it.
function askClaude_(key, payload) {
  let resp = callClaude_(key, payload, true);
  if (resp.getResponseCode() === 400) resp = callClaude_(key, payload, false);
  return resp;
}
function textOf_(data) {
  const parts = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; });
  return parts.join('');
}
function cleanScore_(o) {
  if (!o || typeof o !== 'object') return null;
  return {score: Math.max(0, Math.min(100, Math.round(Number(o.score) || 0))), comment: String(o.comment || '').slice(0, 600)};
}
function cleanList_(a, n) { return (Array.isArray(a) ? a : []).slice(0, n).map(function (x) { return String(x).slice(0, 400); }); }

function speakingFeedback_(d) {
  const props = PropertiesService.getScriptProperties(), key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) return {ok: false, error: 'no key'};
  const s = d.student || {}, email = String(s.email || '').toLowerCase().trim();
  if (!email || !isRegistered_(email)) return {ok: false, error: 'not registered'};
  const transcript = String(d.transcript || '').slice(0, 6000);
  if (transcript.split(' ').length < 15) return {ok: false, error: 'too short'};
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const kAll = 'ai_' + today, kStu = 'ai_' + today + '_' + email;
    const nAll = Number(props.getProperty(kAll) || 0), nStu = Number(props.getProperty(kStu) || 0);
    if (nAll >= AI_MAX_PER_DAY) return {ok: false, error: 'daily limit'};
    if (nStu >= AI_MAX_PER_STUDENT_PER_DAY) return {ok: false, error: 'student limit'};
    props.setProperty(kAll, String(nAll + 1)); props.setProperty(kStu, String(nStu + 1));
  } finally { lock.releaseLock(); }

  const task = d.task || {}, m = d.metrics || {};
  const system = 'You are an experienced, kind English teacher giving feedback on a student\\'s spoken answer. ' +
    'The text you receive is an automatic speech-to-text transcript: it has no punctuation or capital letters and may contain recognition mistakes, ' +
    'so do NOT criticise punctuation, capitalisation or spelling, and do not assume that a wrong word is a pronunciation error. Judge only what the student said. ' +
    'Be specific and quote short examples from the transcript. Write in simple English that a student at the stated level can understand, in short sentences. ' +
    'Return ONLY valid JSON, with no markdown and no text before or after it, in exactly this shape: ' +
    '{"cefr":"A1|A2|B1|B2|C1|C2","summary":"2-3 sentences","fluency":{"score":0-100,"comment":"..."},"accuracy":{"score":0-100,"comment":"..."},' +
    '"vocabulary":{"score":0-100,"comment":"..."},"formal":{"score":0-100,"comment":"..."},"informal":{"score":0-100,"comment":"..."},' +
    '"corrections":[{"said":"exact words from the transcript","better":"corrected version","why":"short reason"}],' +
    '"strengths":["..."],"weaknesses":["..."],"tips":["..."]}. ' +
    '"fluency" uses the speech measurements you are given (speed, pauses, fillers) together with the flow of the ideas. ' +
    '"accuracy" is grammar and word choice. "vocabulary" is range and level of the words. ' +
    '"formal" and "informal" say how well the student used formal language and informal language, with examples; if the task asks for one register, ' +
    'say clearly whether the student matched it. Give at most 5 corrections, 3-4 strengths, 3-4 weaknesses and 3 tips. Scores must be honest and consistent with the comments.';
  const user = 'Task: ' + String(task.title || '') + '\\nTask instructions: ' + String(task.prompt || '') +
    '\\nCEFR level of the task: ' + String(task.level || '') + '\\nExpected register: ' + String(task.register || 'any') +
    '\\nStudent: ' + String(s.name || '') +
    '\\nMeasurements: spoke for ' + Number(m.seconds || 0) + ' seconds, ' + Number(m.words || 0) + ' words, ' + Number(m.wordsPerMinute || 0) +
    ' words per minute, ' + Number(m.pauses || 0) + ' pauses (' + Number(m.longPauses || 0) + ' longer than 2 seconds), ' + Number(m.fillers || 0) + ' fillers, ' + Number(m.repeats || 0) + ' repeated words.' +
    '\\n\\nTranscript:\\n' + transcript;

  const resp = askClaude_(key, {model: AI_MODEL, max_tokens: 6000, output_config: {effort: 'low'}, system: system, messages: [{role: 'user', content: user}]});
  const code = resp.getResponseCode();
  if (code === 429 || code >= 500) return {ok: false, error: 'busy'};
  if (code !== 200) return {ok: false, error: 'ai error ' + code};
  const data = JSON.parse(resp.getContentText());
  if (data.stop_reason === 'refusal') return {ok: false, error: 'refusal'};
  const txt = textOf_(data), a = txt.indexOf('{'), b = txt.lastIndexOf('}');
  if (a < 0 || b <= a) return {ok: false, error: 'bad answer'};
  let f; try { f = JSON.parse(txt.substring(a, b + 1)); } catch (err) { return {ok: false, error: 'bad answer'}; }
  const fb = {
    cefr: String(f.cefr || '').slice(0, 3), summary: String(f.summary || '').slice(0, 800),
    fluency: cleanScore_(f.fluency), accuracy: cleanScore_(f.accuracy), vocabulary: cleanScore_(f.vocabulary), formal: cleanScore_(f.formal), informal: cleanScore_(f.informal),
    corrections: (Array.isArray(f.corrections) ? f.corrections : []).slice(0, 5).map(function (c) { return {said: String(c.said || '').slice(0, 300), better: String(c.better || '').slice(0, 300), why: String(c.why || '').slice(0, 300)}; }),
    strengths: cleanList_(f.strengths, 5), weaknesses: cleanList_(f.weaknesses, 5), tips: cleanList_(f.tips, 4)
  };
  try {
    speakSheet_().appendRow([new Date(), s.name || '', s.cls || '', email, task.title || '', m.seconds || '', m.words || '', fb.cefr,
      fb.fluency ? fb.fluency.score : '', fb.accuracy ? fb.accuracy.score : '', fb.vocabulary ? fb.vocabulary.score : '', fb.formal ? fb.formal.score : '', fb.informal ? fb.informal.score : '', fb.summary]);
  } catch (err) { /* logging is optional */ }
  return {ok: true, feedback: fb, model: data.model};
}

// The teacher's "Test the speaking AI" button on the Students page.
function testAI_(d) {
  if (String(d.key || '') !== TEACHER_KEY) return {ok: false, error: 'wrong key'};
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return {ok: false, error: 'no key'};
  const resp = askClaude_(key, {model: AI_MODEL, max_tokens: 200, output_config: {effort: 'low'}, messages: [{role: 'user', content: 'Reply with the single word: ready'}]});
  const code = resp.getResponseCode();
  if (code === 401) return {ok: false, error: 'the API key is not valid'};
  if (code !== 200) return {ok: false, error: 'ai error ' + code};
  const data = JSON.parse(resp.getContentText());
  return {ok: true, model: data.model || AI_MODEL, text: textOf_(data).slice(0, 40)};
}

// Runs every day (see setup): emails students who have not practised for REMIND_AFTER_DAYS days.
function sendReminders() {
  const sh = sheet_(), rows = sh.getDataRange().getValues(), now = Date.now(), DAY = 864e5;
  for (let i = 1; i < rows.length; i++) {
    const name = rows[i][0], email = rows[i][2], overall = rows[i][3], last = rows[i][8], lastRem = rows[i][10];
    if (!email || !(last instanceof Date)) continue;
    const idle = Math.floor((now - last.getTime()) / DAY);
    if (idle < REMIND_AFTER_DAYS) continue;
    if (lastRem instanceof Date && now - lastRem.getTime() < REMIND_AFTER_DAYS * DAY) continue;   // not every day
    const first = String(name).split(' ')[0] || 'there';
    MailApp.sendEmail({to: email, subject: 'We miss you! Time to practise English 🎧', name: APP_NAME,
      htmlBody: '<p>Hello ' + first + ',</p><p>You have not practised English for <b>' + idle + ' days</b>. ' +
        'Open <b>' + APP_NAME + '</b> today and do a short listening or pronunciation exercise — just 5 minutes!</p>' +
        '<p>Your progress so far: <b>' + overall + '%</b>. Keep going! 💪</p><p>Your teacher</p>'});
    sh.getRange(i + 1, 11).setValue(new Date());
  }
  // tidy up the daily AI counters of earlier days
  const props = PropertiesService.getScriptProperties(), all = props.getProperties(), today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  Object.keys(all).forEach(function (k) { if (k.indexOf('ai_') === 0 && k.indexOf('ai_' + today) !== 0) props.deleteProperty(k); });
}

// Run this once: creates the Students sheet and the daily reminder (5 pm).
function setup() {
  sheet_(); speakSheet_();
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendReminders').timeBased().everyDays(1).atHour(17).create();
}
`;
