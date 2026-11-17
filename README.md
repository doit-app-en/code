# Do it English

موقع تدريب على اللغة الإنجليزية للطلاب: اختبار تحديد مستوى، دروس فيديو، استماع، مطابقة، نطق،
«اختبر محادثتك» بتقييم من الذكاء الاصطناعي، وصفحة للمعلم تعرض تقدّم كل الطلاب.

- **الواجهة**: موقع ثابت في `public/` بدون خطوة بناء.
- **الخادم**: دوال Vercel في `api/`.
- **قاعدة البيانات**: Supabase (المخطط في `supabase/migrations/`).

## النشر (مرة واحدة)

### 1) Supabase
1. أنشئ مشروعاً جديداً في supabase.com.
2. افتح **SQL Editor** والصق محتوى `supabase/migrations/20261117000000_init.sql` ثم **Run**.
3. من **Project Settings → API** انسخ: `Project URL` والمفتاح السري (`service_role` / secret).

### 2) GitHub
ارفع هذا المجلد إلى مستودع (خاص) على GitHub.

### 3) Vercel
1. **Add New → Project** واختر المستودع. اترك الإعدادات كما هي (Framework: **Other**، بدون Build Command).
2. في **Environment Variables** أضف:

| المتغيّر | القيمة | مطلوب؟ |
|---|---|---|
| `SUPABASE_URL` | رابط مشروع Supabase | نعم |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح السري من Supabase | نعم |
| `TEACHER_KEY` | كلمة سر المعلم (تختارها أنت) | نعم |
| `ANTHROPIC_API_KEY` | مفتاح Claude API لتقييم المحادثة | اختياري |
| `AI_MODEL` | الافتراضي `claude-opus-5-5`، وللتكلفة الأقل `claude-haiku-5-5` | اختياري |
| `CRON_SECRET` | أي نص عشوائي طويل (يحمي رابط التذكيرات) | للتذكيرات |
| `RESEND_API_KEY` و `REMIND_FROM` | حساب resend.com وعنوان المرسل | للتذكيرات |

3. **Deploy**. بعدها كل `push` على `main` يُنشر تلقائياً.

### 4) التجربة
افتح الموقع ← **Teacher** ← **Students** ← اكتب `TEACHER_KEY` واضغط **Save**. يجب أن تظهر «Connected ✅».
الطلاب يكتبون بياناتهم في **My progress** فيظهرون عندك تلقائياً.

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم
npm run dev                  # http://localhost:3000
```

## العمل بأكثر من حساب Claude

المستودع على GitHub هو المصدر الوحيد للكود، فأي حساب Claude مربوط بحساب GitHub له صلاحية على المستودع يستطيع التعديل:

- إن كانت الحسابات تستخدم **نفس حساب GitHub**: اربط GitHub في كل حساب Claude واختر هذا المستودع.
- إن كان لكل حساب **حساب GitHub مختلف**: أضفهم من GitHub ← **Settings → Collaborators**.
- ملف `CLAUDE.md` يشرح المشروع وقواعده، فيبدأ كل حساب من نفس الفهم بدون إعادة شرح.
- التعديلات تُرفع **مباشرة على `main`** وتُنشر فوراً (المنصة في نسختها الأولى). قبل الرفع يُسحب آخر تحديث (`git pull --rebase`) حتى لا تتعارض تعديلات شخصين.

## هيكل المشروع

```
public/            الموقع (index.html, styles.css, js/, photos/)
api/               الخادم: class.js (التقدّم + الطلاب + تقييم المحادثة)، reminders.js (رسائل التذكير)
supabase/          مخطط قاعدة البيانات
legacy/            سكربت Google Apps Script القديم (للمرجع)
scripts/           خادم المعاينة المحلي
CLAUDE.md          دليل المشروع لـ Claude
```
