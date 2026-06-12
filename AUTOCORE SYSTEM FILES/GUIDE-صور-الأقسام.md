# دليل صور الأقسام — منصة مفصل

> عند إرسال صورة جديدة، ضعها بالاسم المحدد في المسار أدناه.

| القسم | الملف | المقاس المقترح | الاستخدام |
|-------|-------|----------------|-----------|
| Hero (محذوف حالياً) | `sections/hero.jpg` | 1920×1080 | خلفية أعلى الصفحة — **غير مستخدم** |
| **بطاقة 1 — تفصيل الثوب** | `sections/category-tailoring.png` | بشت فاخر + تفصيل |
| **بطاقة 2 — سوق الأقمشة** | `sections/category-fabric.png` | شماغ/أقمشة |
| الحرفية | `sections/craftsmanship.png` | ثوب أبيض — تفاصيل خياطة |
| المحلات Hero | `sections/shops-hero.png` | بشت فاخر |
| منتج 1 | `sections/product-1.png` | ثوب أبيض كلاسيكي |
| منتج 2 | `sections/product-2.png` | ثوب أزرق/فضي |
| منتج 3 | `sections/product-3.png` | شماغ أحمر |
| منتج 4 | `sections/product-4.png` | أناقة تقليدية |
| Lookbook | `fashion/model-1.jpg` … `model-20.jpg` | متنوع | معرض الأناقة |

**المسار الكامل:** `apps/web/public/images/sections/`

**بعد استبدال الصور:**
```powershell
cd C:\dev\mofasal-deploy
git add apps/web/public/images/sections
git commit -m "chore: update section images"
git push
```
