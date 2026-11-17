// Do it English — daily reminder emails.  /api/reminders
// Vercel Cron calls this once a day (see vercel.json) and sends "Authorization: Bearer CRON_SECRET".
// Emails students who have not practised for REMIND_AFTER_DAYS days. Emails go out through Resend
// (resend.com); without RESEND_API_KEY this function does nothing.
import { db, env, num, escHtml } from './_lib/server.js';

const DAY = 864e5, APP_NAME = 'Do it English';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const secret = env('CRON_SECRET');
  if (!secret || req.headers.authorization !== 'Bearer ' + secret) return res.status(401).json({ ok: false });
  const supabase = db(), resendKey = env('RESEND_API_KEY'), from = env('REMIND_FROM');
  if (!supabase) return res.status(200).json({ ok: false, error: 'server not configured' });
  if (!resendKey || !from) return res.status(200).json({ ok: true, sent: 0, skipped: 'no email provider' });

  const after = num('REMIND_AFTER_DAYS', 3), now = Date.now(), cutoff = new Date(now - after * DAY).toISOString();
  const { data, error } = await supabase.from('students').select('email,name,overall,last_active,last_reminder').lt('last_active', cutoff).limit(1000);
  if (error) { console.error('api/reminders', error); return res.status(200).json({ ok: false, error: 'server error' }); }

  let sent = 0, failed = 0;
  for (const r of data) {
    if (r.last_reminder && now - Date.parse(r.last_reminder) < after * DAY) continue;   // not every day
    const idle = Math.floor((now - Date.parse(r.last_active)) / DAY), first = escHtml(String(r.name).split(' ')[0] || 'there');
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + resendKey },
      body: JSON.stringify({ from, to: [r.email], subject: 'We miss you! Time to practise English 🎧',
        html: '<p>Hello ' + first + ',</p><p>You have not practised English for <b>' + idle + ' days</b>. ' +
          'Open <b>' + APP_NAME + '</b> today and do a short listening or pronunciation exercise — just 5 minutes!</p>' +
          '<p>Your progress so far: <b>' + r.overall + '%</b>. Keep going! 💪</p><p>Your teacher</p>' }),
    });
    if (!resp.ok) { failed++; continue; }
    sent++;
    await supabase.from('students').update({ last_reminder: new Date().toISOString() }).eq('email', r.email);
  }
  return res.status(200).json({ ok: true, sent, failed });
}
