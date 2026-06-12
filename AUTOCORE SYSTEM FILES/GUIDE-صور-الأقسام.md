# دليل صور الأقسام — منصة مفصل

> عند إرسال صورة جديدة، ضعها بالاسم المحدد في المسار أدناه.

| القسم | الملف | المقاس المقترح | الاستخدام |
|-------|-------|----------------|-----------|
| Hero (محذوف حالياً) | `sections/hero.jpg` | 1920×1080 | خلفية أعلى الصفحة — **غير مستخدم** |
| **بطاقة 1 — تفصيل الثوب** | `sections/category-tailoring.jpg` | 1200×750 | قسم «خياطة وقماش» — يسار |
| **بطاقة 2 — سوق الأقمشة** | `sections/category-fabric.jpg` | 1200×750 | قسم «خياطة وقماش» — يمين |
| الحرفية | `sections/craftsmanship.jpg` | 800×1000 | قسم «جودة في كل غرزة» |
| المحلات Hero | `sections/shops-hero.jpg` | 1600×900 | صفحة `/shops` |
| منتج 1 | `sections/product-1.jpg` | 600×800 | بطاقات المنتجات |
| منتج 2 | `sections/product-2.jpg` | 600×800 | |
| منتج 3 | `sections/product-3.jpg` | 600×800 | |
| منتج 4 | `sections/product-4.jpg` | 600×800 | |
| Lookbook | `fashion/model-1.jpg` … `model-20.jpg` | متنوع | معرض الأناقة |

**المسار الكامل:** `apps/web/public/images/sections/`

**بعد استبدال الصور:**
```powershell
cd C:\dev\mofasal-deploy
git add apps/web/public/images/sections
git commit -m "chore: update section images"
git push
```
