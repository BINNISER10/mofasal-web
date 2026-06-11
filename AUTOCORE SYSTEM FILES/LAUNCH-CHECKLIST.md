# قائمة تحقق الإطلاق — منصة مفصل

**تاريخ الإطلاق:** غداً (Jun 2, 2026)

---

## ✅ المرحلة 1: التجهيز (قبل النشر — 10 دقائق)

### 1.1 نقل المشروع
```powershell
# PowerShell كمدير
robocopy "G:\My Drive\OPEN CODE\MOFASAL" "C:\Deploy\MOFASAL" /MIR /XD node_modules .git
```

### 1.2 تثبيت الحزم
```bash
cd C:\Deploy\MOFASAL\services\api
npm install
```

**✓ تأكد من:** لا أخطاء في npm install

---

## ✅ المرحلة 2: إعداد قاعدة البيانات (5 دقائق)

### 2.1 إنشاء `.env`
```env
DATABASE_URL="postgresql://user:pass@host:5432/mufasal?sslmode=require"
JWT_SECRET="random-32-characters-secret"
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

### 2.2 تطبيق migrations
```bash
npx prisma migrate dev --name launch
npx prisma generate
npm run prisma:seed
```

**✓ تأكد من:** 52+ جدول مُنشأ + بيانات افتراضية موجودة

---

## ✅ المرحلة 3: الاختبار السريع (5 دقائق)

### 3.1 تشغيل الخادم
```bash
npm run dev
```

### 3.2 اختبارات Postman/cURL
```bash
# 1. Health check
GET http://localhost:4001/health
# المتوقع: { success: true, message: "MUFASAL API is running" }

# 2. تسجيل دخول
POST http://localhost:4001/api/v1/auth/login
Body: { "email": "customer@mufasal.com", "password": "admin123" }
# المتوقع: { success: true, data: { access_token, user } }

# 3. قائمة محلات
GET http://localhost:4001/api/v1/shops?page=1&limit=10
# المتوقع: { success: true, data: { items: [...] } }
```

**✓ تأكد من:** جميع الاختبارات ناجحة

---

## ✅ المرحلة 4: البناء للإنتاج (3 دقائق)

```bash
# إيقاف الخادم (Ctrl+C)
npm run build

# تشغيل الإنتاج
npm start
```

**✓ تأكد من:** لا أخطاء في البناء

---

## ✅ المرحلة 5: النشر على Render (10 دقائق)

### 5.1 إعداد على Render
1. أنشئ Web Service جديد
2. ربط بـ GitHub: `BINNISER10/mofasal-web`
3. Branch: `main`
4. Build Command: `cd services/api && npm install && npm run build`
5. Start Command: `cd services/api && npm start`

### 5.2 Environment Variables على Render
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
AI_PROVIDER=gemini
GEMINI_API_KEY=...
NODE_ENV=production
```

**✓ تأكد من:** الخادم يعمل على `https://mofasal-api.onrender.com`

---

## ✅ المرحلة 6: الاختبار النهائي (5 دقائق)

```bash
# اختبار الـ Production URL
curl https://mofasal-api.onrender.com/health

# تسجيل دخول حقيقي
curl -X POST https://mofasal-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@mufasal.com","password":"admin123"}'
```

**✓ تأكد من:** النظام يستجيب بسرعة (< 2 ثانية)

---

## ✅ المرحلة 7: الإعلان 🎉

```
🚀 تم إطلاق منصة مفصل بنجاح!

الرابط: https://mofasal-web.onrender.com
API: https://mofasal-api.onrender.com

المميزات المتاحة:
✓ طلب خياطة أونلاين
✓ مندوب قياس لزيارة المنزل
✓ تتبع الطلب لحظياً
✓ دفع إلكتروني ونقدي
✓ كوبونات خصم
✓ برنامج ولاء ونقاط
✓ AI توصيات ذكية
```

---

## ⚠️ احتياطات الطوارئ

| المشكلة المحتملة | الحل السريع |
|---|---|
| npm install فشل | احذف `node_modules` وأعد `npm install` |
| Prisma migrate فشل | شغّل `npx prisma db push` بدلاً من migrate |
| Redis لا يتصل | طبيعي — النظام يعمل بدونه |
| Gemini API لا يعمل | طبيعي — AI يستبدل برسائل نصية |
| Build error | افحص `npm run typecheck` locally |

---

## 📞 دعم الطوارئ

- **حساب Google:** itbinniser@gmail.com
- **خطوط Render:** https://dashboard.render.com

---

**الحالة:** جاهز للإطلاق 🚀
