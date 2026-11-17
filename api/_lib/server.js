// Shared helpers for the Vercel functions. Files in api/_lib are not routes.
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

export const env = (name, fallback = '') => (process.env[name] || fallback).trim();
export const num = (name, fallback) => { const n = Number(env(name)); return Number.isFinite(n) && n > 0 ? n : fallback; };

let client = null;
// The service-role (secret) key: server only. Never send it to the browser.
export function db() {
  if (client) return client;
  const url = env('SUPABASE_URL'), key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export function isTeacher(key) {
  const real = env('TEACHER_KEY');
  if (!real || typeof key !== 'string') return false;
  const a = Buffer.from(key), b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

// The page posts JSON as text/plain (the same way it talked to Google Apps Script).
export function readJson(req) {
  let b = req.body;
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') { try { return JSON.parse(b || '{}'); } catch (e) { return {}; } }
  return b && typeof b === 'object' ? b : {};
}

export const cleanEmail = v => { const e = String(v || '').toLowerCase().trim().slice(0, 200); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : ''; };
export const pct = v => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
export const text = (v, max) => String(v == null ? '' : v).slice(0, max);
export const dateOrNull = v => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : null; };
export const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
