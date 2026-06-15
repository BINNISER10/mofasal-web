# =============================================================================
# MUFASAL — منتج يعمل من اليوم الأول (15 يونيو 2026)
# =============================================================================

## الوضع الحالي (بعد المراجعة)

| المكوّن | الرابط | الحالة |
|---------|--------|--------|
| الويب | https://mofasal-web.onrender.com | يعمل — واجهة لومار |
| API | https://mofasal-api.onrender.com | يعمل — منتجات ومتاجر |
| قاعدة البيانات | mofasal-db على Render | مربوطة — 11 منتج، 3 متاجر |
| تسجيل الدخول | POST /api/v1/auth/login | كان 502 — أُصلح في الكود |

## ما أُصلح في هذا الـ commit

1. **Dockerfile.api** — migrate + seed تلقائي عند الإقلاع (`api-start.sh`)
2. **AuthService** — حماية login + أدوار بصيغة الويب (`admin` لا `ADMIN`)
3. **seed** — إضافة حسابات tailor / merchant / rep
4. **Dockerfile (ويب)** — `NEXT_PUBLIC_API_URL` مضمّن في البناء
5. **render.yaml** — CORS + Dockerfile الصحيح للويب

## خطوة النشر (عندما تقول «انشر»)

```
git add .
git commit -m "..."
git push origin master
```

ثم في Render Dashboard:

### mofasal-api
- تأكد: `SEED_DATABASE=true` (أول نشر فقط)
- بعد نجاح seed: غيّرها إلى `false`
- Health: https://mofasal-api.onrender.com/health/live

### mofasal-web
- أضف: `NEXT_PUBLIC_API_URL=https://mofasal-api.onrender.com/api/v1`
- Manual Deploy (لأن المتغير يُدمج وقت البناء)

## التحقق السريع (5 دقائق)

```
# 1. API حي
curl https://mofasal-api.onrender.com/health/live

# 2. منتجات
curl "https://mofasal-api.onrender.com/api/v1/products?limit=3"

# 3. تسجيل دخول
curl -X POST https://mofasal-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"966500000000","password":"admin123"}'
```

## حسابات التجربة

| الدور | الجوال | كلمة المرور | اللوحة |
|-------|--------|-------------|--------|
| مدير | 500000000 | admin123 | /dashboard/admin |
| عميل | 511111111 | admin123 | /dashboard/customer |
| خياط | 533333333 | admin123 | /dashboard/tailor |
| تاجر | 544444444 | admin123 | /dashboard/merchant |
| مندوب | 522222222 | admin123 | /dashboard/rep |

## مسار العميل (يوم 1)

1. افتح https://mofasal-web.onrender.com/marketplace — أقمشة حقيقية
2. اختر منتج → «اطلب التفصيل»
3. سجّل دخول كعميل
4. أكمل الطلب (3 خطوات: اختر → أكد → تابع)
5. تابع من /dashboard/customer

## المرحلة التالية (بعد النشر)

- [ ] اختبار E2E كامل على الإنتاج
- [ ] صور منتجات (حالياً فارغة في seed)
- [ ] قياس منزلي (المرحلة 2)
- [ ] نطاق mufasal.com

============================================================================
