// Speaking feedback from Claude. Ported from the Apps Script class server (legacy/class-server-script.gs).
import { env } from './server.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
export const aiModel = () => env('AI_MODEL', 'claude-opus-5-5');   // for much lower cost: claude-haiku-5-5

async function callClaude(key, payload, withFallback) {
  const headers = { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2026-10-21' };
  const body = { ...payload };
  if (withFallback) { headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; body.fallbacks = 'default'; }
  return fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(body) });
}
// Sends the request; if the refusal-fallback option is rejected, sends it again without it.
export async function askClaude(key, payload) {
  let resp = await callClaude(key, payload, true);
  if (resp.status === 400) resp = await callClaude(key, payload, false);
  return resp;
}
export const textOf = data => (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');

const cleanScore = o => (!o || typeof o !== 'object') ? null
  : { score: Math.max(0, Math.min(100, Math.round(Number(o.score) || 0))), comment: String(o.comment || '').slice(0, 600) };
const cleanList = (a, n) => (Array.isArray(a) ? a : []).slice(0, n).map(x => String(x).slice(0, 400));

const SYSTEM = 'You are an experienced, kind English teacher giving feedback on a student\'s spoken answer. ' +
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

// Returns {ok: true, feedback, model} or {ok: false, error}.
export async function speakingFeedback(key, { student, task, metrics: m, transcript }) {
  const user = 'Task: ' + String(task.title || '') + '\nTask instructions: ' + String(task.prompt || '') +
    '\nCEFR level of the task: ' + String(task.level || '') + '\nExpected register: ' + String(task.register || 'any') +
    '\nStudent: ' + String(student.name || '') +
    '\nMeasurements: spoke for ' + Number(m.seconds || 0) + ' seconds, ' + Number(m.words || 0) + ' words, ' + Number(m.wordsPerMinute || 0) +
    ' words per minute, ' + Number(m.pauses || 0) + ' pauses (' + Number(m.longPauses || 0) + ' longer than 2 seconds), ' + Number(m.fillers || 0) + ' fillers, ' + Number(m.repeats || 0) + ' repeated words.' +
    '\n\nTranscript:\n' + transcript;

  let resp;
  try {
    resp = await askClaude(key, { model: aiModel(), max_tokens: 6000, output_config: { effort: 'low' }, system: SYSTEM, messages: [{ role: 'user', content: user }] });
  } catch (e) { return { ok: false, error: 'busy' }; }
  const code = resp.status;
  if (code === 429 || code >= 500) return { ok: false, error: 'busy' };
  if (code !== 200) return { ok: false, error: 'ai error ' + code };
  const data = await resp.json();
  if (data.stop_reason === 'refusal') return { ok: false, error: 'refusal' };
  const txt = textOf(data), a = txt.indexOf('{'), b = txt.lastIndexOf('}');
  if (a < 0 || b <= a) return { ok: false, error: 'bad answer' };
  let f; try { f = JSON.parse(txt.substring(a, b + 1)); } catch (err) { return { ok: false, error: 'bad answer' }; }
  const feedback = {
    cefr: String(f.cefr || '').slice(0, 3), summary: String(f.summary || '').slice(0, 800),
    fluency: cleanScore(f.fluency), accuracy: cleanScore(f.accuracy), vocabulary: cleanScore(f.vocabulary), formal: cleanScore(f.formal), informal: cleanScore(f.informal),
    corrections: (Array.isArray(f.corrections) ? f.corrections : []).slice(0, 5).map(c => ({ said: String(c.said || '').slice(0, 300), better: String(c.better || '').slice(0, 300), why: String(c.why || '').slice(0, 300) })),
    strengths: cleanList(f.strengths, 5), weaknesses: cleanList(f.weaknesses, 5), tips: cleanList(f.tips, 4),
  };
  return { ok: true, feedback, model: data.model };
}

/* ---------- voice level test: one short summary of the whole test ---------- */
const VOICE_SYSTEM = 'You are an experienced, kind English teacher. You receive the results of a short voice level test taken by a school student: ' +
  'two spoken answers (automatic speech-to-text transcripts, so no punctuation and possible recognition mistakes — never criticise punctuation or spelling) ' +
  'and several sentences the student listened to and repeated, with pronunciation scores from 0 to 100. ' +
  'Decide the student\'s overall CEFR speaking level from everything together. Short answers and few words are themselves a sign of a low level. ' +
  'Write in simple English that the student can understand, in short sentences, and quote short examples from what the student said. ' +
  'Return ONLY valid JSON, with no markdown and no text before or after it, in exactly this shape: ' +
  '{"cefr":"A1|A2|B1|B2|C1|C2","summary":"3-4 sentences about the level and why","speaking":"1-2 sentences about fluency, grammar and vocabulary",' +
  '"pronunciation":"1-2 sentences about pronunciation, naming the words that were hard","strengths":["..."],"weaknesses":["..."],"tips":["..."]}. ' +
  'Give 2-3 strengths, 2-3 weaknesses and 3 practical tips.';

// Returns {ok: true, feedback, model} or {ok: false, error}.
export async function voiceSummary(key, { student, tasks, sentences, scores }) {
  const user = 'Student: ' + String(student.name || '') +
    '\nScores so far (0-100): speaking ' + scores.speaking + ', pronunciation ' + scores.pronunciation + ', listening and repeating ' + scores.repeating + '.\n\n' +
    tasks.map((t, i) => 'Spoken answer ' + (i + 1) + ' (' + t.kind + '): ' + t.prompt + '\nSpoke for ' + t.seconds + ' seconds, ' + t.words + ' words, ' + t.wpm + ' words per minute, ' + t.pauses + ' pauses.\nTranscript: ' + (t.transcript || '(nothing was heard)')).join('\n\n') +
    '\n\nSentences listened to and repeated:\n' + sentences.map(s => '- [' + s.level + '] "' + s.text + '" → score ' + s.score + (s.heard ? ', heard: "' + s.heard + '"' : '') + (s.weak.length ? ', weak words: ' + s.weak.join(', ') : '')).join('\n');
  let resp;
  try { resp = await askClaude(key, { model: aiModel(), max_tokens: 3000, output_config: { effort: 'low' }, system: VOICE_SYSTEM, messages: [{ role: 'user', content: user }] }); }
  catch (e) { return { ok: false, error: 'busy' }; }
  if (resp.status === 429 || resp.status >= 500) return { ok: false, error: 'busy' };
  if (resp.status !== 200) return { ok: false, error: 'ai error ' + resp.status };
  const data = await resp.json();
  if (data.stop_reason === 'refusal') return { ok: false, error: 'refusal' };
  const txt = textOf(data), a = txt.indexOf('{'), b = txt.lastIndexOf('}');
  if (a < 0 || b <= a) return { ok: false, error: 'bad answer' };
  let f; try { f = JSON.parse(txt.substring(a, b + 1)); } catch (err) { return { ok: false, error: 'bad answer' }; }
  const cefr = String(f.cefr || '').toUpperCase().slice(0, 2);
  return { ok: true, model: data.model, feedback: { cefr: /^(A1|A2|B1|B2|C1|C2)$/.test(cefr) ? cefr : '', summary: String(f.summary || '').slice(0, 900),
    speaking: String(f.speaking || '').slice(0, 500), pronunciation: String(f.pronunciation || '').slice(0, 500),
    strengths: cleanList(f.strengths, 4), weaknesses: cleanList(f.weaknesses, 4), tips: cleanList(f.tips, 4) } };
}
