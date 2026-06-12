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
  الاسم:             mufasal-api
  Region:            Frankfurt
  Branch:            master
  Root Directory:    (اتركه فارغاً)
  Environment:       Docker
  Dockerfile Path:   docker/Dockerfile.api
  Docker Context:    .
  Plan:              Standard
  Health Check Path: /health/live
```

#### متغيرات البيئة (mufasal-api):
```
DATABASE_URL          = (من قاعدة البيانات — Internal Database URL)
NODE_ENV              = production
PORT                  = 4001
API_PREFIX            = /api/v1
JWT_SECRET            = (Generate)
JWT_REFRESH_SECRET    = (Generate)
CORS_ORIGIN           = https://mufasal.onrender.com,http://localhost:3000
SEED_DATABASE         = true   (أول نشر فقط — بعدها غيّر إلى false)
```

### 3. خدمة الويب — Render Dashboard
```
Render Dashboard → New + → Web Service
  الاسم:             mufasal
  Region:            Frankfurt
  Branch:            master
  Root Directory:    (اتركه فارغاً)
  Environment:       Docker
  Dockerfile Path:   Dockerfile
  Docker Context:    .
  Plan:              Standard
  Health Check Path: /
```

#### متغيرات البيئة (mufasal):
```
NODE_ENV                = production
PORT                    = 10000
NEXT_PUBLIC_API_URL     = https://mufasal-api.onrender.com/api/v1
DATABASE_URL            = postgresql://build:build@localhost:5432/build?schema=public
DIRECT_DATABASE_URL     = postgresql://build:build@localhost:5432/build?schema=public
```

### 4. بعد النشر الأول
```
1. تحقق:   https://mufasal.onrender.com
           → يجب ظهور الصفحة الرئيسية

2. تحقق:   https://mufasal-api.onrender.com/health/live
           → يجب: {"success":true,"status":"alive"}

3. تحقق:   https://mufasal-api.onrender.com/api/v1/shops?limit=5
           → يجب إرجاع 3 متاجر

4. غير:    SEED_DATABASE = false (لمنع إعادة seed كل نشر)
```

### 5. حسابات افتراضية
| الدور | البريد | كلمة المرور |
|-------|--------|------------|
| Admin | admin@mufasal.com | admin123 |
| Customer | customer@mufasal.com | admin123 |
| Rep | rep@mufasal.com | admin123 |
| Rep 2 | rep2@mufasal.com | admin123 |
| Tailor | tailor@mufasal.com | admin123 |
| Merchant | merchant@mufasal.com | admin123 |

---

## هيكل النشر
```
GitHub (master) ─┬─► Render: mufasal (Dockerfile → :10000)
                 │   https://mufasal.onrender.com
                 │
                 └─► Render: mufasal-api (docker/Dockerfile.api → :4001)
                     https://mufasal-api.onrender.com
                          │
                          └─► PostgreSQL: mufasal-db
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|----------|------|
| `mufasal-api` يظهر 404 | تأكد من Dockerfile Path = `docker/Dockerfile.api` |
| `health` يرجع unhealthy | انتظر 60 ثانية — seed+database يحتاجان وقت |
| `prisma` خطأ | أعد نشر (Deploy) — api-start.sh يعيد المحاولة 10 مرات |
| الويب لا يتصل بالـ API | تأكد من `NEXT_PUBLIC_API_URL` في متغيرات mufasal |
| خطأ CORS | تأكد من `CORS_ORIGIN` تحتوي على رابط الويب |

---

## قائمة التحقق بعد النشر

```
□ https://mufasal.onrender.com — الصفحة الرئيسية تظهر
□ https://mufasal-api.onrender.com/health/live — {"success":true,"status":"alive"}
□ https://mufasal-api.onrender.com/api/v1/shops?limit=5 — 3 متاجر
□ تسجيل دخول admin@mufasal.com / admin123 — يفتح لوحة الإدارة
□ تسجيل دخول rep@mufasal.com / admin123 — يفتح لوحة المندوب
□ طلب جديد من حساب العميل — يظهر في لوحة الإدارة
□ حجز موعد قياس — يظهر في لوحة المندوب
```
