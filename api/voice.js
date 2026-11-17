// Do it English — voice level test.  /api/voice
//   GET                                   what this server can do: {speech, ai}
//   GET  ?id=…                            a saved result (anyone with the link)
//   POST {action: 'transcribe', student, audio}        free speech → text            (Azure Speech)
//   POST {action: 'assess', student, text, audio}      a repeated sentence → scores  (Azure Speech)
//   POST {action: 'finish', student, result}           AI summary (Claude) + save the result
// audio = base64 of a WAV file (PCM 16-bit, 16 kHz, mono). Only registered students (My progress page) can use the paid parts.
import { randomBytes } from 'node:crypto';
import { db, env, num, readJson, cleanEmail, pct, text } from './_lib/server.js';
import { azureOn, transcribe, assess } from './_lib/azure.js';
import { voiceSummary } from './_lib/claude.js';

const MAX_AUDIO_B64 = 2_800_000;   // about 65 seconds of 16 kHz mono

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
    const d = readJson(req), s = d.student || {}, email = cleanEmail(s.email);
    if (!email) return res.status(200).json({ ok: false, error: 'not registered' });
    const reg = await supabase.from('students').select('email').eq('email', email).maybeSingle();
    if (reg.error) throw reg.error;
    if (!reg.data) return res.status(200).json({ ok: false, error: 'not registered' });

    if (d.action === 'transcribe' || d.action === 'assess') {
      if (!azureOn()) return res.status(200).json({ ok: false, error: 'no speech' });
      const b64 = typeof d.audio === 'string' ? d.audio : '';
      if (b64.length < 2000 || b64.length > MAX_AUDIO_B64) return res.status(200).json({ ok: false, error: 'bad audio' });
      const wav = Buffer.from(b64, 'base64');
      if (wav.toString('latin1', 0, 4) !== 'RIFF' || wav.toString('latin1', 8, 12) !== 'WAVE') return res.status(200).json({ ok: false, error: 'bad audio' });
      const ref = d.action === 'assess' ? text(d.text, 300).trim() : '';
      if (d.action === 'assess' && !ref) return res.status(200).json({ ok: false, error: 'bad audio' });
      const take = await supabase.rpc('usage_take', { p_kind: 'voice', p_email: email, p_max_student: num('VOICE_MAX_PER_STUDENT_PER_DAY', 30), p_max_day: num('VOICE_MAX_PER_DAY', 1500) });
      if (take.error) throw take.error;
      if (take.data !== 'ok') return res.status(200).json({ ok: false, error: take.data });
      return res.status(200).json(d.action === 'assess' ? await assess(wav, ref) : await transcribe(wav));
    }
    if (d.action === 'finish') return res.status(200).json(await finish(supabase, s, email, d.result || {}));
    return res.status(200).json({ ok: false });
  } catch (e) {
    console.error('api/voice', e);
    return res.status(200).json({ ok: false, error: 'server error' });
  }
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
