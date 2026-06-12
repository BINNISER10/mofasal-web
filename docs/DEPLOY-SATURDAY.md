# تسليم مفصل يوم السبت — أرخص استضافة + دومين

## لماذا فشل Render؟ (ليست مشكلة رصيد)

Render **المجاني لا يحتاج بطاقة**، لكن المشاكل الشائعة:

| السبب | الحل |
|--------|-----|
| لم يُنشأ **Blueprint** من `render.yaml` | Dashboard → Blueprints → New → اختر المستودع |
| الرابط الخاطئ | استخدم الرابط من Dashboard وليس رابطاً تخمينياً |
| بناء Node يتوقف (OOM) | استخدم **Docker** (`docker/Dockerfile.web`) وليس `render-build.sh` |
| الخدمة نائمة | أول زيارة بعد 15 دقيقة بطيئة — انتظر 30–60 ثانية |
| Blueprint قديم | أعد النشر من آخر commit على `master` |

---

## الحل الموصى به للسبت (أرخص + أنظف)

### التكلفة

| البند | السعر | ملاحظة |
|-------|-------|--------|
| **استضافة الويب** | **0 ر.س** | [Netlify](https://app.netlify.com/teams/binniser10/projects) مجاني |
| **API + قاعدة بيانات** | **0 ر.س** | Render مجاني (`render-api-only.yaml`) |
| **دومين** | **~40 ر.س/سنة** | [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) أرخص من Namecheap على المدى الطويل (~10.44$/سنة ثابت) |
| **بدون دومين للسبت** | **0** | `mufasal.netlify.app` مجاني فوراً |

> Namecheap: سعر أول سنة أقل (~6$) لكن التجديد ~14$. Cloudflare: نفس السعر سنوياً بدون مفاجآت ([مقارنة 2026](https://comparesharp.com/blog/namecheap-vs-cloudflare-registrar-compared)).

---

## الخطوة 1 — API على Render (15 دقيقة)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. Repo: `BINNISER10/mofasal-web` فرع `master`
3. إذا طلب ملف blueprint: استخدم `render-api-only.yaml` (API + DB فقط)
4. انتظر حتى `mufasal-api` يصبح **Live**
5. افتح: `https://mufasal-api.onrender.com/health/live` → يجب أن يرد `ok`
6. جرّب تسجيل الدخول: `966500000000` / `admin123`

---

## الخطوة 2 — الويب على Netlify (10 دقائق)

1. ادخل [Netlify — binniser10](https://app.netlify.com/teams/binniser10/projects)
2. **Add new project → Import an existing project → GitHub**
3. اختر `BINNISER10/mofasal-web`
4. الإعدادات (تُقرأ تلقائياً من `netlify.toml`):
   - Build command: `bash scripts/netlify-build.sh`
   - Plugin: `@netlify/plugin-nextjs`
5. **Environment variables** (Site settings → Environment):
   ```
   NEXT_PUBLIC_API_URL=https://mufasal-api.onrender.com/api/v1
   NEXT_PUBLIC_DEMO_MODE=true
   DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
   ```
6. **Deploy site**
7. الرابط: `https://اسم-المشروع.netlify.app`

### ربط دومين (اختياري — Cloudflare أرخص من Namecheap)

1. اشترِ الدومين من Cloudflare Registrar
2. في Netlify: **Domain management → Add domain**
3. في Cloudflare DNS: CNAME `@` أو `www` حسب تعليمات Netlify
4. حدّث `CORS_ORIGIN` في Render API ليشمل دومينك

---

## الخطوة 3 — اختبار قبل التسليم للشريك

| # | الاختبار | المتوقع |
|---|----------|---------|
| 1 | الصفحة الرئيسية `/` | فيديو + كل الأقسام |
| 2 | `/shops` و `/marketplace` | قائمة (فارغة أو بيانات seed) |
| 3 | `/login` → زر **خياط** | يفتح `/dashboard/tailor` |
| 4 | `/login` → زر **عميل** | يفتح `/dashboard/customer` |
| 5 | `/contact` | نموذج يعمل |
| 6 | `/dashboard/tailor/orders/new` | يوجّه للوحة الطلبات |
| 7 | API نائم | أزرار الدخول التجريبي تعمل بوضع العرض (`DEMO_MODE`) |

### حسابات التجربة (مع API)

| الدور | الجوال | كلمة المرور |
|-------|--------|-------------|
| مدير | 966500000000 | admin123 |
| عميل | 966511111111 | admin123 |
| خياط | 966533333333 | admin123 |
| تاجر | 966544444444 | admin123 |
| مندوب | 966522222222 | admin123 |

---

## لماذا Netlify وليس Render للويب؟

- حسابك جاهز على Netlify
- بناء Next.js أسرع وأقل مشاكل OOM
- Render يبقى للـ API + PostgreSQL فقط (أخف وأنظف)
- لا تحتاج دومين للعرض يوم السبت — رابط Netlify كافٍ

---

## إذا فشل البناء على Netlify

1. تأكد من تثبيت plugin: `npm install -D @netlify/plugin-nextjs` (أو يُثبّت تلقائياً)
2. راجع **Deploy log** — ابحث عن `prisma generate` أو `@mufasal/shared`
3. زِد `NODE_OPTIONS=--max-old-space-size=6144` (موجود في `netlify.toml`)

---

**الحساب:** itbinniser@gmail.com  
**المستودع:** https://github.com/BINNISER10/mofasal-web
