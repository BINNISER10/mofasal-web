# ربط دومين Namecheap بمنصة مفصل

دليل عملي لربط دومين تشتريه من [Namecheap](https://www.namecheap.com) بمنصة مفصل المستضافة على Render.

---

## الخيار الموصى به: Render + Namecheap (مجاني للبداية)

**لماذا Render؟**
- المشروع جاهز عبر `render.yaml` (ويب + API + PostgreSQL)
- SSL مجاني تلقائياً
- لا تحتاج سيرفر VPS للبداية

**التكلفة التقريبية:**
| البند | السعر |
|-------|-------|
| دومين `.com` من Namecheap | ~10–15 دولار/سنة |
| Render (خطة مجانية) | 0 دولار (مع قيود: بطء عند الخمول) |
| Render (خطة مدفوعة لاحقاً) | من ~7 دولار/شهر للخدمة |

---

## الخطوة 1 — شراء الدومين من Namecheap

1. ادخل [namecheap.com](https://www.namecheap.com) وابحث عن الدومين (مثال: `mufasal.com`)
2. أكمل الشراء
3. من **Domain List → Manage → Advanced DNS**:
   - عطّل **DNSSEC** (Off)
   - احذف سجلات **Parking** أو **URL Redirect** الافتراضية
   - احذف أي سجلات **AAAA** (IPv6) — Render لا يدعمها حالياً

---

## الخطوة 2 — نشر المشروع على Render

1. ادخل [dashboard.render.com](https://dashboard.render.com)
2. **New → Blueprint** → اختر repo: `BINNISER10/mofasal-web` فرع `master`
3. انتظر اكتمال البناء (خدمتان: `mufasal` و `mufasal-api` + قاعدة بيانات)
4. سجّل الروابط الحالية:
   - الويب: `https://mofasal.onrender.com`
   - API: `https://mofasal-api.onrender.com`

---

## الخطوة 3 — إضافة الدومين في Render

### للموقع الرئيسي (`mufasal.com`)

1. افتح خدمة **mofasal** (الويب) → **Settings → Custom Domains**
2. أضف:
   - `mufasal.com`
   - `www.mufasal.com`
3. Render يعطيك:
   - **A record** للجذر `@` → IP: `216.24.57.1`
   - **CNAME** لـ `www` → `mufasal.onrender.com`

### للـ API (`api.mufasal.com`) — اختياري لكن موصى به

1. افتح خدمة **mofasal-api** → **Settings → Custom Domains**
2. أضف: `api.mufasal.com`
3. أضف **CNAME** في Namecheap:
   - Host: `api`
   - Value: `mufasal-api.onrender.com`

---

## الخطوة 4 — إعداد DNS في Namecheap

في **Advanced DNS** أضف:

| النوع | Host | Value | TTL |
|-------|------|-------|-----|
| A Record | `@` | `216.24.57.1` | Automatic |
| CNAME | `www` | `mofasal.onrender.com` | Automatic |
| CNAME | `api` | `mofasal-api.onrender.com` | Automatic |

> انتظر 5–30 دقيقة (أحياناً حتى 48 ساعة) حتى يكتمل الانتشار.

---

## الخطوة 5 — تحديث متغيرات البيئة

### خدمة الويب (`mufasal`)

```
NEXT_PUBLIC_APP_URL=https://mufasal.com
NEXT_PUBLIC_API_URL=https://api.mufasal.com/api/v1
```

### خدمة API (`mofasal-api`)

```
CORS_ORIGIN=https://mufasal.com,https://www.mufasal.com,https://mofasal.onrender.com
```

أعد نشر الخدمتين بعد التحديث.

---

## الخطوة 6 — التحقق

- [ ] `https://mufasal.com` يفتح الصفحة الرئيسية
- [ ] `https://www.mufasal.com` يعيد توجيهاً أو يعمل
- [ ] قفل SSL أخضر في المتصفح
- [ ] تسجيل الدخول وطلب تجريبي يعملان عبر API

---

## بدائل

### VPS + Docker (للإنتاج الكبير)

إذا احتجت أداءً أعلى بدون خمول:
- VPS من Hetzner/DigitalOcean (~5–20 دولار/شهر)
- استخدم `docker-compose.yml` + `scripts/deploy.sh`
- في Namecheap: A records لـ `@` و `www` و `api` → IP السيرفر
- SSL عبر Let's Encrypt في `docker/nginx.conf`

### Railway (ويب فقط)

`railway.toml` ينشر الويب فقط — تحتاج API وDB منفصلين. غير موصى به كحل كامل.

---

## ملاحظات مهمة

1. **الخطة المجانية على Render** توقف الخدمة بعد فترة خمول — للإنتاج الحقيقي ارفع لخطة Starter.
2. **البريد الإلكتروني** على نفس الدومين (مثل `info@mufasal.com`) يحتاج سجلات MX منفصلة — لا تحذفها عند إضافة A/CNAME للويب.
3. بعد ربط الدومين حدّث `site-config.json` وروابط التطبيق في المتاجر عند توفرها.

---

**الحساب:** itbinniser@gmail.com  
**المستودع:** https://github.com/BINNISER10/mofasal-web
