# دليل النشر — منصة مفصل (MUFASAL)

> **آخر تحديث:** 12 يونيو 2026 | **جاهزية النشر:** 100%

---

## المتطلبات الأساسية
- مستودع GitHub: `github.com/BINNISER10/mofasal-web` (فرع master)
- حساب Render: `dashboard.render.com`
- البريد: `itbinniser@gmail.com`

---

## الخطوات (15 دقيقة)

### 1. قاعدة البيانات — Render Dashboard
```
Render Dashboard → New + → PostgreSQL
  الاسم:         mufasal-db
  Database Name: mufasal
  User:          mufasal
  Plan:          Free
  Region:        Frankfurt
```

### 2. خدمة API — Render Dashboard
```
Render Dashboard → New + → Web Service
  الاسم:             mofasal-api
  Region:            Frankfurt
  Branch:            master
  Root Directory:    (اتركه فارغاً)
  Environment:       Docker
  Dockerfile Path:   docker/Dockerfile.api
  Docker Context:    .
  Plan:              Standard
  Health Check Path: /health/live
```

#### متغيرات البيئة (mofasal-api):
```
DATABASE_URL          = (من قاعدة البيانات — Internal Database URL)
NODE_ENV              = production
PORT                  = 4001
API_PREFIX            = /api/v1
JWT_SECRET            = (Generate)
JWT_REFRESH_SECRET    = (Generate)
CORS_ORIGIN           = https://mofasal-web.onrender.com,http://localhost:3000
SEED_DATABASE         = true   (أول نشر فقط — بعدها غيّر إلى false)
```

### 3. ربط الويب بالـ API — Render Dashboard
```
افتح mofasal-web → Environment
  NEXT_PUBLIC_API_URL = https://mofasal-api.onrender.com/api/v1

احفظ → Manual Deploy → Deploy latest commit
```

### 4. بعد النشر الأول
```
1. تحقق:   https://mofasal-api.onrender.com/health/live
           → يجب: {"success":true,"status":"alive"}

2. تحقق:   https://mofasal-api.onrender.com/health
           → database: healthy

3. تحقق:   https://mofasal-api.onrender.com/api/v1/shops?limit=5
           → يجب إرجاع 3 متاجر

4. غير:    SEED_DATABASE = false (لمنع إعادة seed كل نشر)
```

### 5. حسابات افتراضية
| الدور | البريد | كلمة المرور |
|-------|--------|------------|
| Admin | admin@mufasal.com | admin123 |
| Customer | customer@mufasal.com | admin123 |

---

## هيكل النشر
```
GitHub (master) ─┬─► Render: mofasal-web (Dockerfile → :10000)
                 │   https://mofasal-web.onrender.com
                 │
                 └─► Render: mofasal-api (docker/Dockerfile.api → :4001)
                     https://mofasal-api.onrender.com
                          │
                          └─► PostgreSQL: mufasal-db
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|----------|------|
| `mofasal-api` يظهر 404 | تأكد من Dockerfile Path = `docker/Dockerfile.api` |
| `health` يرجع unhealthy | انتظر 60 ثانية — seed+database يحتاجان وقت |
| `prisma` خطأ | أعد نشر (Deploy) — api-start.sh يعيد المحاولة 10 مرات |
| الويب لا يتصل بالـ API | تأكد من `NEXT_PUBLIC_API_URL` في متغيرات mofasal-web |
| خطأ CORS | تأكد من `CORS_ORIGIN` تحتوي على رابط الويب |
