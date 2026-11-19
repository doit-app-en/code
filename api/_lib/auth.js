// Accounts (Supabase Auth). The browser never talks to Supabase: it sends "Authorization: Bearer <access token>" to /api/*,
// and the functions ask Supabase who that is.
import { createClient } from '@supabase/supabase-js';
import { env } from './server.js';

// Accounts are "ready" when Supabase is set up AND the accounts migration has been run (the profiles table exists).
// Until then the site works as it did before accounts: open to everyone, students named by the form on the My progress page.
let readyAt = 0, readyIs = false;
export async function authReady(supabase) {
  if (!supabase || env('AUTH_OFF') === '1') return false;
  if (Date.now() - readyAt < (readyIs ? 300000 : 20000)) return readyIs;
  const { error } = await supabase.from('profiles').select('id').limit(1);
  readyIs = !error; readyAt = Date.now();
  return readyIs;
}

// A separate client for signing in: signing in on the shared service client would make it act as that user afterwards.
export const authClient = () => createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

export function bearer(req) {
  const h = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || ''), m = h.match(/^Bearer\s+([A-Za-z0-9._-]{20,4000})$/);
  return m ? m[1] : '';
}

// Who sent this request: {id, email, profile} — profile is null for an account that has not chosen student/teacher yet (first Google sign-in).
export async function whoIs(req, supabase) {
  const token = bearer(req); if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user || !data.user.email) return null;
  const u = data.user, p = await supabase.from('profiles').select('id,email,name,role,class_id').eq('id', u.id).maybeSingle();
  if (p.error) throw p.error;
  return { id: u.id, email: String(u.email).toLowerCase(), meta: u.user_metadata || {}, profile: p.data || null };
}

// What the page needs to know about the signed-in person.
export async function describe(supabase, who) {
  const p = who.profile; if (!p) return { id: who.id, email: who.email, name: String(who.meta.full_name || who.meta.name || '').slice(0, 80), role: '', needsProfile: true };
  const out = { id: p.id, email: p.email, name: p.name, role: p.role, className: '', classCode: '', teacher: '' };
  if (p.role === 'student' && p.class_id) {
    const c = await supabase.from('classes').select('name,code,teacher_id').eq('id', p.class_id).maybeSingle();
    if (c.data) { out.className = c.data.name; out.classCode = c.data.code; const t = await supabase.from('profiles').select('name').eq('id', c.data.teacher_id).maybeSingle(); out.teacher = (t.data && t.data.name) || ''; }
  }
  if (p.role === 'teacher') out.classes = await teacherClasses(supabase, p.id);
  return out;
}

export async function teacherClasses(supabase, teacherId) {
  const c = await supabase.from('classes').select('id,name,code,created_at').eq('teacher_id', teacherId).order('created_at', { ascending: true });
  if (c.error) throw c.error;
  const ids = c.data.map(x => x.id), count = {};
  if (ids.length) { const m = await supabase.from('profiles').select('class_id').in('class_id', ids).limit(10000); if (m.error) throw m.error; m.data.forEach(r => { count[r.class_id] = (count[r.class_id] || 0) + 1; }); }
  return c.data.map(x => ({ id: x.id, name: x.name, code: x.code, students: count[x.id] || 0 }));
}

// The request's identity for the paid and saved parts (progress, speaking feedback, voice test).
//   accounts ready  → the signed-in student or teacher: {email, name, cls, userId, classId, role}; nobody signed in → null
//   accounts not ready (before the migration) → undefined: the caller uses the old "student in the message" rules
export async function identity(req, supabase) {
  if (!(await authReady(supabase))) return undefined;
  const who = await whoIs(req, supabase); if (!who || !who.profile) return null;
  const p = who.profile; let cls = '';
  if (p.class_id) { const c = await supabase.from('classes').select('name').eq('id', p.class_id).maybeSingle(); cls = (c.data && c.data.name) || ''; }
  return { email: p.email, name: p.name, cls, userId: p.id, classId: p.class_id || null, role: p.role };
}

// A signed-in teacher's scope: the ids of their classes. Null when the request is not from a teacher account.
export async function teacherScope(req, supabase) {
  if (!(await authReady(supabase))) return null;
  const who = await whoIs(req, supabase); if (!who || !who.profile || who.profile.role !== 'teacher') return null;
  const c = await supabase.from('classes').select('id').eq('teacher_id', who.profile.id);
  if (c.error) throw c.error;
  return { teacherId: who.profile.id, classIds: c.data.map(x => x.id) };
}
