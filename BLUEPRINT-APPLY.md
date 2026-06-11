# نشر مفصل — Blueprint جاهز (نقرة واحدة)

## الروابط بعد النشر

| الخدمة | الرابط |
|--------|--------|
| **الويب** | https://mufasal.onrender.com |
| **API** | https://mufasal-api.onrender.com |
| **قاعدة البيانات** | `mufasal-db` (داخلي — لا يُفتح من المتصفح) |

---

## خطوات التطبيق (5 دقائق)

### 1) افتح Render
https://dashboard.render.com

### 2) أنشئ Blueprint
1. من القائمة اليسرى: **Blueprints**
2. **New Blueprint Instance**
3. اختر **GitHub** → repo: `BINNISER10/mofasal-web`
4. الفرع: **master**
5. Render يقرأ `render.yaml` تلقائياً
6. اضغط **Apply**

### 3) انتظر البناء
- `mufasal-db` — دقيقة
- `mufasal-api` — 5–10 دقائق
- `mufasal` — 10–15 دقيقة (Docker + Next.js)

### 4) تحقق
```
https://mufasal-api.onrender.com/health/live
https://mufasal-api.onrender.com/api/v1/shops?limit=3
https://mofasal.onrender.com
```

الصفحة الرئيسية يجب أن تعرض: **«الجودة، الأناقة، والتفاصيل المتقنة»**

### 5) بعد أول نشر ناجح
في `mufasal-api` → Environment:
- غيّر `SEED_DATABASE` من `true` إلى `false`

---

## حسابات تجريبية

| البريد | كلمة المرور |
|--------|-------------|
| admin@mufasal.com | admin123 |
| customer@mufasal.com | admin123 |

---

## تغيير أسماء الروابط

عدّل `render.yaml` قبل Apply:

```yaml
services:
  - name: mufasal-api    # ← غيّر هنا → your-api.onrender.com
  - name: mufasal        # ← غيّر هنا → your-web.onrender.com
```

ثم حدّث `CORS_ORIGIN` و `NEXT_PUBLIC_API_URL` ليطابقوا الأسماء الجديدة.

---

## إن فشل البناء

1. **الويب:** Settings → Plan → **Standard** (ذاكرة أكبر)
2. أو استخدم Dockerfile الجذر بدل `docker/Dockerfile.web`
3. أرسل آخر 30 سطر من Build Logs

---

*المستودع: https://github.com/BINNISER10/mofasal-web*
