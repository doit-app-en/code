// Do it English — accounts.  /api/auth
//   GET                     what is switched on: {auth, google}
//   GET  ?action=google     sends the browser to Google sign-in (through Supabase); it comes back to the site with the session in the address
//   POST {action: 'signup', email, password, name, role: 'student'|'teacher', classCode?, className?}
//   POST {action: 'login', email, password}
//   POST {action: 'refresh', refresh_token}
//   POST {action: 'code', code}                         is this class code real? → {className, teacher}
//   — with "Authorization: Bearer <access token>":
//   POST {action: 'me'}                                 who am I
//   POST {action: 'profile', name, role, classCode?, className?}   finish a new Google account
//   POST {action: 'join', code} / {action: 'leave'}     a student joins / leaves a class
//   POST {action: 'newclass', name}                     a teacher makes a class (and gets its code)
// New accounts are created already confirmed: the site has no email service, so nobody could click a confirmation link.
import { createHash, randomInt } from 'node:crypto';
import { db, env, num, readJson, cleanEmail } from './_lib/server.js';
import { authReady, authClient, whoIs, describe, teacherClasses } from './_lib/auth.js';

const one = (v, max) => String(v == null ? '' : v).trim().replace(/\s+/g, ' ').slice(0, max);
const cleanCode = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O or 1/I: codes are read aloud in class
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
// expires_in (seconds from now) is what the page uses: it counts on its own clock, which may be wrong. expires_at stays for pages loaded before this.
const sessionOut = s => ({ access_token: s.access_token, refresh_token: s.refresh_token, expires_in: s.expires_in || 3600, expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600) });
const ipKey = req => 'ip:' + createHash('sha256').update(String((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown')).digest('hex').slice(0, 24);

async function limit(supabase, kind, who, perWho, perDay) {
  const take = await supabase.rpc('usage_take', { p_kind: kind, p_email: who, p_max_student: perWho, p_max_day: perDay });
  if (take.error) throw take.error;
  return take.data === 'ok';
}
async function findClass(supabase, code) {
  if (code.length < 4) return null;
  const c = await supabase.from('classes').select('id,name,code,teacher_id').eq('code', code).maybeSingle();
  if (c.error) throw c.error;
  return c.data || null;
}
async function makeClass(supabase, teacherId, name) {
  for (let i = 0; i < 6; i++) {
    const ins = await supabase.from('classes').insert({ teacher_id: teacherId, name, code: newCode() }).select('id,name,code').maybeSingle();
    if (!ins.error) return ins.data;
    if (ins.error.code !== '23505') throw ins.error;   // 23505 = that code is taken: try another
  }
  throw new Error('no free class code');
}
// Gives the account its role, name and class. Returns an error word or ''.
async function makeProfile(supabase, id, email, d) {
  const name = one(d.name, 80), role = d.role === 'teacher' ? 'teacher' : 'student';
  if (name.length < 2) return 'name';
  let classId = null;
  if (role === 'student' && cleanCode(d.classCode)) { const c = await findClass(supabase, cleanCode(d.classCode)); if (!c) return 'bad code'; classId = c.id; }
  const ins = await supabase.from('profiles').insert({ id, email, name, role, class_id: classId });
  if (ins.error) throw ins.error;
  if (role === 'teacher') await makeClass(supabase, id, one(d.className, 60) || 'My class');
  return '';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const supabase = db(), ready = await authReady(supabase), google = ready && env('AUTH_GOOGLE') === '1';
    if (req.method === 'GET') {
      if ((req.query && req.query.action) === 'google') {
        if (!google) return res.status(404).json({ ok: false });
        const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').replace(/[^a-zA-Z0-9.:-]/g, ''), local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
        res.statusCode = 302; res.setHeader('Location', env('SUPABASE_URL').replace(/\/+$/, '') + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent((local ? 'http://' : 'https://') + host + '/'));
        return res.end();
      }
      return res.status(200).json({ ok: true, auth: ready, google });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
    if (!ready) return res.status(200).json({ ok: false, error: 'accounts off' });
    const d = readJson(req);

    if (d.action === 'code') {
      if (!(await limit(supabase, 'code', ipKey(req), 60, 5000))) return res.status(200).json({ ok: false, error: 'limit' });
      const c = await findClass(supabase, cleanCode(d.code)); if (!c) return res.status(200).json({ ok: false, error: 'bad code' });
      const t = await supabase.from('profiles').select('name').eq('id', c.teacher_id).maybeSingle();
      return res.status(200).json({ ok: true, code: c.code, className: c.name, teacher: (t.data && t.data.name) || '' });
    }
    if (d.action === 'signup') {
      const email = cleanEmail(d.email), password = String(d.password || '');
      if (!email) return res.status(200).json({ ok: false, error: 'email' });
      if (password.length < 8 || password.length > 72) return res.status(200).json({ ok: false, error: 'password' });
      if (one(d.name, 80).length < 2) return res.status(200).json({ ok: false, error: 'name' });
      if (d.role !== 'teacher' && cleanCode(d.classCode) && !(await findClass(supabase, cleanCode(d.classCode)))) return res.status(200).json({ ok: false, error: 'bad code' });
      if (!(await limit(supabase, 'signup', ipKey(req), num('SIGNUP_MAX_PER_IP_PER_DAY', 40), num('SIGNUP_MAX_PER_DAY', 1000)))) return res.status(200).json({ ok: false, error: 'limit' });
      const made = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name: one(d.name, 80) } });
      if (made.error || !made.data || !made.data.user) {
        const m = String((made.error && (made.error.code || made.error.message)) || '');
        if (/exists|registered|already/i.test(m)) return res.status(200).json({ ok: false, error: 'exists' });
        if (/weak|password/i.test(m)) return res.status(200).json({ ok: false, error: 'password' });
        throw made.error || new Error('createUser');
      }
      const bad = await makeProfile(supabase, made.data.user.id, email, d);
      if (bad) { await supabase.auth.admin.deleteUser(made.data.user.id); return res.status(200).json({ ok: false, error: bad }); }
      const inn = await authClient().auth.signInWithPassword({ email, password });
      if (inn.error || !inn.data.session) return res.status(200).json({ ok: true, session: null });   // the account exists: the page asks the person to sign in
      const who = await whoIs({ headers: { authorization: 'Bearer ' + inn.data.session.access_token } }, supabase);
      return res.status(200).json({ ok: true, session: sessionOut(inn.data.session), me: await describe(supabase, who) });
    }
    if (d.action === 'login') {
      const email = cleanEmail(d.email), password = String(d.password || '');
      if (!email || !password) return res.status(200).json({ ok: false, error: 'wrong' });
      if (!(await limit(supabase, 'login', email, num('LOGIN_MAX_PER_EMAIL_PER_DAY', 40), 20000))) return res.status(200).json({ ok: false, error: 'limit' });
      const inn = await authClient().auth.signInWithPassword({ email, password });
      if (inn.error || !inn.data || !inn.data.session) return res.status(200).json({ ok: false, error: 'wrong' });
      const who = await whoIs({ headers: { authorization: 'Bearer ' + inn.data.session.access_token } }, supabase);
      return res.status(200).json({ ok: true, session: sessionOut(inn.data.session), me: who ? await describe(supabase, who) : null });
    }
    if (d.action === 'refresh') {
      const rt = String(d.refresh_token || ''); if (rt.length < 8 || rt.length > 400) return res.status(200).json({ ok: false, error: 'sign in' });
      const r = await authClient().auth.refreshSession({ refresh_token: rt });
      if (r.error || !r.data || !r.data.session) return res.status(200).json({ ok: false, error: 'sign in' });
      return res.status(200).json({ ok: true, session: sessionOut(r.data.session) });
    }

    const who = await whoIs(req, supabase);
    if (!who) return res.status(200).json({ ok: false, error: 'sign in' });
    if (d.action === 'me') return res.status(200).json({ ok: true, me: await describe(supabase, who) });
    if (d.action === 'profile') {
      if (who.profile) return res.status(200).json({ ok: true, me: await describe(supabase, who) });
      const bad = await makeProfile(supabase, who.id, who.email, d); if (bad) return res.status(200).json({ ok: false, error: bad });
      return res.status(200).json({ ok: true, me: await describe(supabase, await whoIs(req, supabase)) });
    }
    if (!who.profile) return res.status(200).json({ ok: false, error: 'needs profile' });
    const p = who.profile;
    if (d.action === 'join' || d.action === 'leave') {
      if (p.role !== 'student') return res.status(200).json({ ok: false, error: 'students only' });
      let classId = null;
      if (d.action === 'join') { const c = await findClass(supabase, cleanCode(d.code)); if (!c) return res.status(200).json({ ok: false, error: 'bad code' }); classId = c.id; }
      const up = await supabase.from('profiles').update({ class_id: classId }).eq('id', p.id); if (up.error) throw up.error;
      const st = await supabase.from('students').update({ class_id: classId }).eq('email', p.email); if (st.error) console.error('students class', st.error);
      return res.status(200).json({ ok: true, me: await describe(supabase, await whoIs(req, supabase)) });
    }
    if (d.action === 'newclass') {
      if (p.role !== 'teacher') return res.status(200).json({ ok: false, error: 'teachers only' });
      const name = one(d.name, 60); if (name.length < 2) return res.status(200).json({ ok: false, error: 'name' });
      if ((await teacherClasses(supabase, p.id)).length >= 30) return res.status(200).json({ ok: false, error: 'limit' });
      await makeClass(supabase, p.id, name);
      return res.status(200).json({ ok: true, me: await describe(supabase, await whoIs(req, supabase)) });
    }
    return res.status(200).json({ ok: false });
  } catch (e) {
    console.error('api/auth', e);
    return res.status(200).json({ ok: false, error: 'server error' });
  }
}
