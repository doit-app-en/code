// Do it English — voice level test.  /api/voice
//   GET                                   what this server can do: {speech, ai}
//   GET  ?id=…                            a saved result (anyone with the link)
//   POST {action: 'transcribe', student, audio}        free speech → text            (Azure Speech)
//   POST {action: 'assess', student, text, audio}      a repeated sentence → scores  (Azure Speech)
//   POST {action: 'word', student, text, audio}        one word of the Pronounce section → scores (Azure Speech; short audio, its own daily limits)
//   POST {action: 'finish', student, result}           AI summary (Claude) + save the result
//   POST {action: 'latest', key}                       the teacher's Students page: each student's newest test (needs TEACHER_KEY)
//   POST {action: 'history', key, email}               the teacher's Students page: all the tests of one student (needs TEACHER_KEY)
// With accounts on (see api/auth.js) the student is the signed-in person, and a signed-in teacher sees the tests of their own classes without a key.
// audio = base64 of a WAV file (PCM 16-bit, 16 kHz, mono). Only registered students (My progress page) can use the paid parts.
import { randomBytes } from 'node:crypto';
import { db, env, num, isTeacher, readJson, cleanEmail, pct, text } from './_lib/server.js';
import { azureOn, transcribe, assess } from './_lib/azure.js';
import { voiceSummary } from './_lib/claude.js';
import { identity, teacherScope } from './_lib/auth.js';

const MAX_AUDIO_B64 = 2_800_000;   // about 65 seconds of 16 kHz mono
const MAX_WORD_B64 = 400_000;      // about 9 seconds: one word of the Pronounce section

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const supabase = db();
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || '');
      if (!id) return res.status(200).json({ ok: true, speech: !!supabase && azureOn(), ai: !!supabase && !!env('ANTHROPIC_API_KEY'), save: !!supabase });
      if (!supabase) return res.status(200).json({ ok: false, error: 'server not configured' });
      if (!/^[a-z0-9]{10,40}$/.test(id)) return res.status(200).json({ ok: false, error: 'not found' });
      const { data, error } = await supabase.from('voice_tests').select('id,created_at,name,cls,result').eq('id', id).maybeSingle();
      if (error) throw error;
      return res.status(200).json(data ? { ok: true, test: { id: data.id, date: data.created_at, name: data.name, cls: data.cls, ...data.result } } : { ok: false, error: 'not found' });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
    if (!supabase) return res.status(200).json({ ok: false, error: 'server not configured' });
    const d = readJson(req);
    if (d.action === 'latest') return res.status(200).json(await latestTests(supabase, d.key, req));
    if (d.action === 'history') return res.status(200).json(await studentTests(supabase, d.key, cleanEmail(d.email), req));
    const me = await identity(req, supabase);   // undefined = accounts are not switched on yet
    if (me === null) return res.status(200).json({ ok: false, error: 'sign in' });
    const s = me ? { name: me.name, cls: me.cls, email: me.email } : (d.student || {}), email = cleanEmail(s.email);
    if (!email) return res.status(200).json({ ok: false, error: 'not registered' });
    if (!me) {   // with accounts on, the account is the registration
      const reg = await supabase.from('students').select('email').eq('email', email).maybeSingle();
      if (reg.error) throw reg.error;
      if (!reg.data) return res.status(200).json({ ok: false, error: 'not registered' });
    }

    if (d.action === 'transcribe' || d.action === 'assess' || d.action === 'word') {
      const word = d.action === 'word';
      if (!azureOn()) return res.status(200).json({ ok: false, error: 'no speech' });
      const b64 = typeof d.audio === 'string' ? d.audio : '';
      if (b64.length < 2000 || b64.length > (word ? MAX_WORD_B64 : MAX_AUDIO_B64)) return res.status(200).json({ ok: false, error: 'bad audio' });
      const wav = Buffer.from(b64, 'base64');
      if (wav.toString('latin1', 0, 4) !== 'RIFF' || wav.toString('latin1', 8, 12) !== 'WAVE') return res.status(200).json({ ok: false, error: 'bad audio' });
      const ref = word ? text(d.text, 60).trim() : d.action === 'assess' ? text(d.text, 300).trim() : '';
      if (d.action !== 'transcribe' && !ref) return res.status(200).json({ ok: false, error: 'bad audio' });
      // Pronounce words are counted apart from the voice test ('pron'), so practising words does not use up a student's voice tests.
      const take = word
        ? await supabase.rpc('usage_take', { p_kind: 'pron', p_email: email, p_max_student: num('PRON_MAX_PER_STUDENT_PER_DAY', 60), p_max_day: num('PRON_MAX_PER_DAY', 400) })
        : await supabase.rpc('usage_take', { p_kind: 'voice', p_email: email, p_max_student: num('VOICE_MAX_PER_STUDENT_PER_DAY', 30), p_max_day: num('VOICE_MAX_PER_DAY', 1500) });
      if (take.error) throw take.error;
      if (take.data !== 'ok') return res.status(200).json({ ok: false, error: take.data });
      return res.status(200).json(d.action === 'transcribe' ? await transcribe(wav) : await assess(wav, ref));
    }
    if (d.action === 'finish') return res.status(200).json(await finish(supabase, s, email, d.result || {}));
    return res.status(200).json({ ok: false });
  } catch (e) {
    console.error('api/voice', e);
    return res.status(200).json({ ok: false, error: 'server error' });
  }
}

// The emails of the students in the signed-in teacher's classes. Null when the request is not from a teacher account.
async function classEmails(supabase, req) {
  const scope = await teacherScope(req, supabase); if (!scope) return null;
  if (!scope.classIds.length) return [];
  const { data, error } = await supabase.from('students').select('email').in('class_id', scope.classIds).limit(3000);
  if (error) throw error;
  return data.map(r => r.email);
}

// For the teacher: the newest test of every student (scores only, no recordings or transcripts) and how many tests each one took.
async function latestTests(supabase, key, req) {
  let q = supabase.from('voice_tests').select('id,created_at,email,level,overall,speaking,pronunciation,repeating');
  if (!isTeacher(key)) {
    const emails = await classEmails(supabase, req);
    if (!emails) return { ok: false, error: 'wrong key' };
    if (!emails.length) return { ok: true, tests: [] };
    q = q.in('email', emails);
  }
  const { data, error } = await q
    .order('created_at', { ascending: false }).limit(5000);
  if (error) throw error;
  const byEmail = new Map();
  for (const r of data || []) {
    const t = byEmail.get(r.email);
    if (t) t.count++;
    else byEmail.set(r.email, { email: r.email, id: r.id, date: r.created_at, level: r.level, overall: r.overall, speaking: r.speaking, pronunciation: r.pronunciation, repeating: r.repeating, count: 1 });
  }
  return { ok: true, tests: [...byEmail.values()] };
}

// For the teacher: every test of one student, newest first (scores only; the full result opens by its id).
async function studentTests(supabase, key, email, req) {
  if (!isTeacher(key)) { const emails = await classEmails(supabase, req); if (!emails) return { ok: false, error: 'wrong key' }; if (!emails.includes(email)) return { ok: false, error: 'not found' }; }
  if (!email) return { ok: false, error: 'not found' };
  const { data, error } = await supabase.from('voice_tests').select('id,created_at,level,overall,speaking,pronunciation,repeating')
    .eq('email', email).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return { ok: true, tests: (data || []).map(r => ({ id: r.id, date: r.created_at, level: r.level, overall: r.overall, speaking: r.speaking, pronunciation: r.pronunciation, repeating: r.repeating })) };
}

// Keeps only the known fields, with safe sizes, so nothing unexpected is saved or sent to the AI.
function cleanResult(r) {
  const n = v => Math.max(0, Math.min(100000, Math.round(Number(v) || 0)));
  const tasks = (Array.isArray(r.tasks) ? r.tasks : []).slice(0, 3).map(t => ({
    kind: t.kind === 'picture' ? 'picture' : 'question', prompt: text(t.prompt, 300), image: /^photos\/[a-z0-9-]+\.jpg$/.test(t.image || '') ? t.image : '',
    transcript: text(t.transcript, 3000), source: t.source === 'speech' ? 'speech' : 'browser', seconds: n(t.seconds), words: n(t.words), wpm: n(t.wpm), pauses: n(t.pauses),
    fluency: pct(t.fluency), accuracy: pct(t.accuracy), vocab: pct(t.vocab), score: pct(t.score) }));
  const sentences = (Array.isArray(r.sentences) ? r.sentences : []).slice(0, 8).map(x => ({
    level: text(x.level, 3), text: text(x.text, 300), heard: text(x.heard, 400), source: x.source === 'speech' ? 'speech' : 'browser', score: pct(x.score),
    accuracy: x.accuracy == null ? null : pct(x.accuracy), fluency: x.fluency == null ? null : pct(x.fluency), completeness: x.completeness == null ? null : pct(x.completeness), prosody: x.prosody == null ? null : pct(x.prosody),
    words: (Array.isArray(x.words) ? x.words : []).slice(0, 40).map(w => ({ w: text(w.w, 40), score: w.score == null ? null : pct(w.score), err: text(w.err, 20) })),
    weak: (Array.isArray(x.weak) ? x.weak : []).slice(0, 8).map(w => text(w, 40)) }));
  const sc = r.scores || {};
  return { tasks, sentences, scores: { overall: pct(sc.overall), speaking: pct(sc.speaking), pronunciation: pct(sc.pronunciation), repeating: pct(sc.repeating) },
    level: /^(A1|A2|B1|B2|C1|C2)$/.test(r.level) ? r.level : 'A1' };
}

async function finish(supabase, s, email, raw) {
  const result = cleanResult(raw);
  if (!result.tasks.length && !result.sentences.length) return { ok: false, error: 'empty' };
  const words = result.tasks.reduce((a, t) => a + t.words, 0), key = env('ANTHROPIC_API_KEY');
  let ai = null, aiError = key ? '' : 'no key';
  if (key && words < 8 && !result.sentences.some(x => x.score > 0)) aiError = 'too short';
  else if (key) {
    const take = await supabase.rpc('ai_take', { p_email: email, p_max_student: num('AI_MAX_PER_STUDENT_PER_DAY', 5), p_max_day: num('AI_MAX_PER_DAY', 100) });
    if (take.error) throw take.error;
    if (take.data !== 'ok') aiError = take.data;
    else { const out = await voiceSummary(key, { student: s, ...result }); if (out.ok) ai = out.feedback; else aiError = out.error; }
  }
  if (ai && ai.cefr) result.level = ai.cefr;   // the teacher's AI has the last word on the level
  result.ai = ai;
  const id = randomBytes(12).toString('hex');
  const ins = await supabase.from('voice_tests').insert({ id, email, name: text(s.name, 120), cls: text(s.cls, 60), level: result.level,
    overall: result.scores.overall, speaking: result.scores.speaking, pronunciation: result.scores.pronunciation, repeating: result.scores.repeating, result });
  if (ins.error) throw ins.error;
  return { ok: true, id, level: result.level, ai, aiError };
}
