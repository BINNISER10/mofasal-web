# دليل إطلاق منصة مفصل (MOFASAL)

## ✅ الميزات المنجزة (10/10)

| # | الميزة | الملفات الرئيسية |
|---|---|---|
| 1 | **Express الموحّد** | `services/api/src/index.ts` |
| 2 | **RBAC + صلاحيات** | `src/config/permissions.ts`, `src/middleware/auth.ts` |
| 3 | **الويب + الجوال** | `apps/web/`, `apps/mobile/` |
| 4 | **لوحة الخياط** | `dashboard/tailor/orders/page.tsx` (Kanban) |
| 5 | **لوحة التاجر** | `dashboard/merchant/` |
| 6 | **محرك الترتيب الذكي** | `SmartRankingService.ts` |
| 7 | **تقارير + محاسبة مزدوجة** | `LedgerService.ts`, `reports/` |
| 8 | **AI سلوكي + توصيات** | `ai.service.ts`, `RecommendationService.ts` |
| 9 | **إشعارات تلقائية** | `NotificationService.ts` (مربوط بالطلبات) |
| 10 | **كوبونات + ولاء** | `CouponService.ts`, `LoyaltyService.ts` |

---

## 🚀 خطوات الإطلاق (الترتيب الصحيح)

### الخطوة 1: نقل المشروع خارج Google Drive
```powershell
# PowerShell (كمدير)
$source = "G:\My Drive\OPEN CODE\MOFASAL"
$dest = "C:\Projects\MOFASAL"

# نسخ المشروع
robocopy $source $dest /MIR /XD node_modules .git

# الدخول للمجلد الجديد
cd $dest\services\api
```

### الخطوة 2: تثبيت الحزم
```bash
# Backend
npm install

# Web (اختياري للتطوير)
cd ../../apps/web
npm install
```

### الخطوة 3: إعداد البيئة
أنشئ `.env` في `services/api/`:
```env
# قاعدة البيانات (مجانية من Neon/Supabase)
DATABASE_URL="postgresql://user:pass@host:5432/mufasal?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/mufasal?sslmode=require"

# JWT
JWT_SECRET="your-random-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Redis (مجاني من Upstash)
REDIS_URL="rediss://default:pass@host:6379"

# AI (مجاني من Google AI Studio)
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...

# SMTP (اختياري للبريد)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# البيئة
NODE_ENV=production
PORT=4001
```

### الخطوة 4: تطبيق migrations قاعدة البيانات
```bash
# نماذج Prisma الجديدة (52+ جدول)
npx prisma migrate dev --name init

# توليد Prisma Client
npx prisma generate
```

### الخطوة 5: بذر البيانات الأساسية
```bash
# إنشاء الأدوار والمستخدم التجريبي
npx ts-node prisma/seed.ts

# أو إذا استخدمت npm script:
npm run prisma:seed
```

**البيانات الافتراضية:**
- Admin: `admin@mufasal.com` / `admin123`
- Customer: `customer@mufasal.com` / `admin123`

### الخطوة 6: تشغيل الخادم
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

### الخطوة 7: اختبار سريع
```bash
# Health check
curl http://localhost:4001/health

# تسجيل دخول
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@mufasal.com","password":"admin123"}'
```

---

## 📋 قائمة المسارات API المتاحة

### المصادقة
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh-token`

### المتاجر والمنتجات
- `GET /api/v1/shops` — قائمة المتاجر
- `GET /api/v1/shops/:id` — تفاصيل المحل
- `GET /api/v1/products` — قائمة المنتجات
- `GET /api/v1/products/:id` — تفاصيل المنتج

### الطلبات
- `POST /api/v1/orders` — إنشاء طلب
- `GET /api/v1/orders` — قائمة الطلبات
- `GET /api/v1/orders/:id/tracking` — تتبع الطلب
- `POST /api/v1/orders/:id/cancel` — إلغاء الطلب

### خدمات القياس
- `POST /api/v1/services` — طلب خدمة
- `POST /api/v1/services/:id/dispatch` — تعيين مندوب
- `GET /api/v1/services/:id/tracking` — تتبع المندوب

### الدفع
- `POST /api/v1/payments/process` — معالجة دفع
- `POST /api/v1/payments/verify` — تأكيد دفع

### الكوبونات (جديد)
- `POST /api/v1/coupons/validate` — التحقق من كوبون
- `POST /api/v1/coupons/apply` — تطبيق كوبون
- `POST /api/v1/coupons` — إنشاء كوبون (تاجر)

### الولاء (جديد)
- `GET /api/v1/loyalty/me/balance` — رصيد النقاط
- `POST /api/v1/loyalty/me/redeem` — صرف نقاط
- `GET /api/v1/loyalty/leaderboard` — لوحة المتصدرين

### الذكاء الاصطناعي
- `POST /api/v1/ai/behavior` — تسجيل سلوك
- `GET /api/v1/ai/recommendations` — توصيات شخصية
- `GET /api/v1/ai/profile` — ملف AI

### ERP (متقدم)
- `GET /api/v1/accounting/accounts` — شجرة الحسابات
- `POST /api/v1/accounting/journal` — ترحيل قيد
- `GET /api/v1/reports/summary` — تقرير ملخص
- `GET /api/v1/hr/employees` — إدارة الموظفين

---

## 🆓 الخدمات المجانية المقترحة للإنتاج

| الخدمة | الرابط | الحد المجاني |
|---|---|---|
| **قاعدة البيانات** | [Neon](https://neon.tech) | 500MB |
| **Redis** | [Upstash](https://upstash.com) | 10,000 req/يوم |
| **AI** | [Google AI Studio](https://makersuite.google.com) | 60 طلب/دقيقة |
| **Hosting Backend** | [Render](https://render.com) | ينام بعد 15 د |
| **Hosting Web** | [Render](https://render.com) | مجاني |
| **Mobile** | [Expo](https://expo.dev) | مجاني |

---

## 🔧 استكشاف الأخطاء

### مشكلة: `node_modules` فارغة
**السبب:** Google Drive لا يُبقي المجلدات الثقيلة.
**الحل:** انقل للمجلد المحلي وشغّل `npm install`.

### مشكلة: Prisma لا يجد النماذج الجديدة
**الحل:**
```bash
npx prisma generate
npx prisma migrate dev
```

### مشكلة: Redis لا يتصل
**الحل:** يعمل تلقائياً بـ in-memory fallback، لا يُعطل النظام.

---

## 📞 دعم سريع

البريد المرتبط: `itbinniser@gmail.com`

**الحالة النهائية:** المنصة جاهزة 100% للإطلاق والعمل الحقيقي.
