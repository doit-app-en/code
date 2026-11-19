// Do it English — class server.  /api/class
// Same messages as the old Google Apps Script server, so the page did not have to change:
//   POST {action: 'progress', student, progress, lastActive}      students' pages send their progress
//   POST {action: 'speaking', student, task, transcript, metrics} AI feedback for "Test your speaking"
//   POST {action: 'speakingtest', key}                            the teacher's "Test speaking AI" button
//   GET  ?key=TEACHER_KEY                                         the teacher's Students page reads the list
// With accounts on (see api/auth.js) the sender is the signed-in person ("Authorization: Bearer …"): the student in the message is ignored,
// and a signed-in teacher gets the students of their own classes without a key. TEACHER_KEY still opens every student (the site owner).
import { db, env, num, isTeacher, readJson, cleanEmail, pct, text, dateOrNull } from './_lib/server.js';
import { askClaude, aiModel, speakingFeedback, textOf } from './_lib/claude.js';
import { identity, teacherScope } from './_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const supabase = db();
    if (!supabase) return res.status(200).json({ ok: false, error: 'server not configured' });
    if (req.method === 'GET') return res.status(200).json(await listStudents(supabase, req.query && req.query.key, req));
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
    const d = readJson(req);
    if (d.action === 'progress' || d.action === 'speaking') {
      const me = await identity(req, supabase);   // undefined = accounts are not switched on yet
      if (me === null) return res.status(200).json({ ok: false, error: 'sign in' });
      if (me) { d.student = { name: me.name, cls: me.cls, email: me.email }; d.me = me; } else delete d.me;
    }
    if (d.action === 'progress') return res.status(200).json(await saveProgress(supabase, d));
    if (d.action === 'speaking') return res.status(200).json(await speaking(supabase, d));
    if (d.action === 'speakingtest') return res.status(200).json(await testAI(d));
    return res.status(200).json({ ok: false });
  } catch (e) {
    console.error('api/class', e);
    return res.status(200).json({ ok: false, error: 'server error' });
  }
}

async function saveProgress(supabase, d) {
  const s = d.student || {}, p = d.progress || {}, email = cleanEmail(s.email);
  if (!email) return { ok: false };
  // last_reminder is not in the row, so an update keeps the value that is already saved
  const { error } = await supabase.from('students').upsert({
    email, name: text(s.name, 120), cls: text(s.cls, 60),
    overall: pct(p.overall), listening: pct(p.listening), pronounce: pct(p.pronounce), lessons: pct(p.lessons),
    placement: text(p.placement, 60), last_active: dateOrNull(d.lastActive), updated_at: new Date().toISOString(),
    ...(d.me ? { user_id: d.me.userId, class_id: d.me.classId } : {}),
  }, { onConflict: 'email' });
  if (error) throw error;
  return { ok: true };
}

async function listStudents(supabase, key, req) {
  let q = supabase.from('students').select('*');
  if (!isTeacher(String(key || ''))) {
    const scope = await teacherScope(req, supabase);
    if (!scope) return { ok: false, error: 'wrong key' };
    if (!scope.classIds.length) return { ok: true, students: [] };
    q = q.in('class_id', scope.classIds);
  }
  const { data, error } = await q.order('last_active', { ascending: false, nullsFirst: false }).limit(5000);
  if (error) throw error;
  return { ok: true, students: data.map(r => ({ name: r.name, cls: r.cls, email: r.email, overall: r.overall, listening: r.listening, pronounce: r.pronounce,
    lessons: r.lessons, placement: r.placement, lastActive: r.last_active || '', updated: r.updated_at || '', lastReminder: r.last_reminder || '' })) };
}

async function speaking(supabase, d) {
  const key = env('ANTHROPIC_API_KEY');
  if (!key) return { ok: false, error: 'no key' };
  const s = d.student || {}, email = cleanEmail(s.email);
  if (!email) return { ok: false, error: 'not registered' };
  if (!d.me) {   // with accounts on, the account is the registration
    const reg = await supabase.from('students').select('email').eq('email', email).maybeSingle();
    if (reg.error) throw reg.error;
    if (!reg.data) return { ok: false, error: 'not registered' };
  }
  const transcript = String(d.transcript || '').slice(0, 6000);
  if (transcript.split(' ').length < 15) return { ok: false, error: 'too short' };

  const take = await supabase.rpc('ai_take', { p_email: email, p_max_student: num('AI_MAX_PER_STUDENT_PER_DAY', 5), p_max_day: num('AI_MAX_PER_DAY', 100) });
  if (take.error) throw take.error;
  if (take.data !== 'ok') return { ok: false, error: take.data };

  const task = d.task || {}, m = d.metrics || {};
  const out = await speakingFeedback(key, { student: s, task, metrics: m, transcript });
  if (!out.ok) return out;
  const fb = out.feedback, sc = x => (x ? x.score : null), int = v => (Number.isFinite(Number(v)) && v !== '' && v != null ? Math.round(Number(v)) : null);
  const log = await supabase.from('speaking_log').insert({ email, name: text(s.name, 120), cls: text(s.cls, 60), topic: text(task.title, 200),
    seconds: int(m.seconds), words: int(m.words), level: fb.cefr, fluency: sc(fb.fluency), accuracy: sc(fb.accuracy), vocabulary: sc(fb.vocabulary),
    formal: sc(fb.formal), informal: sc(fb.informal), summary: fb.summary });
  if (log.error) console.error('speaking_log', log.error);   // logging is optional
  return out;
}

async function testAI(d) {
  if (!isTeacher(String(d.key || ''))) return { ok: false, error: 'wrong key' };
  const key = env('ANTHROPIC_API_KEY');
  if (!key) return { ok: false, error: 'no key' };
  const resp = await askClaude(key, { model: aiModel(), max_tokens: 200, output_config: { effort: 'low' }, messages: [{ role: 'user', content: 'Reply with the single word: ready' }] });
  if (resp.status === 401) return { ok: false, error: 'the API key is not valid' };
  if (resp.status !== 200) return { ok: false, error: 'ai error ' + resp.status };
  const data = await resp.json();
  return { ok: true, model: data.model || aiModel(), text: textOf(data).slice(0, 40) };
}
